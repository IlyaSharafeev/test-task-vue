<!-- src/pages/DashboardPage.vue -->
<template>
  <div class="dashboard">
    <div class="dashboard__container">
      <section class="profile">
        <div class="profile__card">
          <h2>Профиль пользователя</h2>
          <div v-if="user" class="profile__info">
            <div class="profile__field">
              <span class="label">Имя:</span>
              <span class="value">{{ user.name }}</span>
            </div>
            <div class="profile__field">
              <span class="label">Username:</span>
              <span class="value">{{ user.username }}</span>
            </div>
            <div class="profile__field">
              <span class="label">Email:</span>
              <span class="value">{{ user.email }}</span>
            </div>
            <div class="profile__field">
              <span class="label">Телефон:</span>
              <span class="value">{{ user.phone }}</span>
            </div>
            <div class="profile__field">
              <span class="label">Сайт:</span>
              <span class="value">{{ user.website }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="todos">
        <div class="todos__header">
          <h2>Список задач</h2>
          <div class="items-per-page">
            <label>Показать:</label>
            <select v-model="itemsPerPage">
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </div>
        </div>

        <div class="filters">
          <div class="filter-group">
            <label>Статус</label>
            <select v-model="statusFilter">
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="uncompleted">Uncompleted</option>
              <option value="favorites">Favorites</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Пользователь</label>
            <select v-model="userFilter">
              <option :value="null">All Users</option>
              <option v-for="id in userIds" :key="id" :value="id">
                User #{{ id }}
              </option>
            </select>
          </div>

          <div class="filter-group search">
            <label>Поиск</label>
            <input
                v-model="searchQuery"
                placeholder="Поиск по названию..."
            />
          </div>
        </div>

        <div class="stats">
          <span>Найдено задач: <strong>{{ filteredTodos.length }}</strong></span>
          <span v-if="filteredTodos.length > 0">
            Показано: <strong>{{ paginatedTodos.length }}</strong>
          </span>
        </div>

        <div class="create-todo">
          <h3>Создать новую задачу</h3>
          <form @submit.prevent="handleCreateTodo" class="create-form">
            <input
                v-model.number="newTodoUserId"
                type="number"
                placeholder="User ID"
                min="1"
            />
            <input
                v-model="newTodoTitle"
                type="text"
                placeholder="Title"
            />
            <button type="submit" :disabled="isCreating">
              {{ isCreating ? 'Добавление...' : 'Add' }}
            </button>
          </form>
        </div>

        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>Загрузка задач...</p>
        </div>

        <div v-else-if="error" class="error">
          {{ error }}
          <button @click="fetchTodos" class="retry">Повторить</button>
        </div>

        <div v-else-if="paginatedTodos.length === 0" class="empty">
          <p v-if="filteredTodos.length === 0">Задачи не найдены</p>
          <p v-else>Нет задач на этой странице</p>
        </div>

        <div v-else class="todo-list">
          <div
              v-for="todo in paginatedTodos"
              :key="todo.id"
              class="todo-item"
              :class="{ 'todo-item--completed': todo.completed }"
          >
            <div class="todo-content">
              <div class="todo-header">
                <span class="user-badge">User #{{ todo.userId }}</span>
                <span class="status" :class="todo.completed ? 'status-completed' : 'status-pending'">
                  {{ todo.completed ? 'Completed' : 'In Progress' }}
                </span>
              </div>
              <p class="todo-title">{{ todo.title }}</p>
            </div>
            <button
                @click="toggleFavorite(todo.id)"
                class="favorite-btn"
                :class="{ 'favorite-btn--active': isFavorite(todo.id) }"
            >
              ★
            </button>
          </div>
        </div>

        <!-- Пагинация -->
        <div v-if="totalPages > 1" class="pagination">
          <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="pagination__btn"
          >
            ←
          </button>

          <div class="pagination__pages">
            <button
                v-for="page in displayedPages"
                :key="page"
                @click="currentPage = page"
                :class="['pagination__page', { 'pagination__page--active': currentPage === page }]"
            >
              {{ page }}
            </button>
          </div>

          <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="pagination__btn"
          >
            →
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '@/types'
import { useTodos } from '@/composables/useTodos'

const router = useRouter()
const user = ref<User | null>(null)

const {
  paginatedTodos,
  filteredTodos,
  loading,
  error,
  statusFilter,
  userFilter,
  searchQuery,
  userIds,
  currentPage,
  itemsPerPage,
  totalPages,
  fetchTodos,
  toggleFavorite,
  isFavorite,
  createTodo
} = useTodos()

const isCreating = ref(false)
const newTodoUserId = ref(1)
const newTodoTitle = ref('')

// Номера страниц для отображения
const displayedPages = computed(() => {
  const delta = 2
  const range = []
  const left = Math.max(2, currentPage.value - delta)
  const right = Math.min(totalPages.value - 1, currentPage.value + delta)

  range.push(1)

  if (left > 2) {
    range.push('...')
  }

  for (let i = left; i <= right; i++) {
    range.push(i)
  }

  if (right < totalPages.value - 1) {
    range.push('...')
  }

  if (totalPages.value > 1) {
    range.push(totalPages.value)
  }

  return range
})

onMounted(() => {
  const userData = sessionStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  } else {
    router.push('/')
  }
})

const handleCreateTodo = async () => {
  if (!newTodoUserId.value || !newTodoTitle.value.trim()) {
    alert('Заполните все поля')
    return
  }

  isCreating.value = true
  try {
    await createTodo(newTodoUserId.value, newTodoTitle.value)
    newTodoTitle.value = ''
    newTodoUserId.value = 1
  } catch (error: any) {
    alert(error.message)
  } finally {
    isCreating.value = false
  }
}
</script>

<style scoped lang="scss">
.dashboard {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
  }
}

.profile {
  margin-bottom: 2rem;

  &__card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  &__info {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    .label {
      font-size: 0.875rem;
      color: #666;
    }

    .value {
      font-size: 1rem;
      color: #333;
      font-weight: 500;
    }
  }
}

.todos {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    h2 {
      margin: 0;
      color: #333;
    }
  }
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  label {
    font-size: 0.875rem;
    color: #666;
  }

  select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.875rem;
    background: white;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: #4CAF50;
    }
  }
}

.stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #666;

  strong {
    color: #333;
    font-weight: 600;
  }
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #555;
  }

  select, input {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.95rem;
    width: 100%;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #4CAF50;
      box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
    }
  }
}

.create-todo {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;

  h3 {
    margin-bottom: 1rem;
    color: #333;
    font-size: 1.1rem;
  }
}

.create-form {
  display: flex;
  gap: 1rem;

  input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.95rem;

    &:focus {
      outline: none;
      border-color: #4CAF50;
      box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
    }
  }

  button {
    padding: 0.75rem 1.5rem;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;

    &:hover:not(:disabled) {
      background: #45a049;
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.25rem;
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border-color: #ddd;
    transform: translateY(-1px);
  }

  &--completed {
    background: #fafafa;
    opacity: 0.85;

    .todo-title {
      text-decoration: line-through;
      color: #999;
    }
  }
}

.todo-content {
  flex: 1;
  margin-right: 1rem;
}

.todo-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.user-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-weight: 500;
}

.status {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;

  &-completed {
    background: #e8f5e9;
    color: #2e7d32;
  }

  &-pending {
    background: #fff3e0;
    color: #ef6c00;
  }
}

.todo-title {
  font-size: 0.95rem;
  color: #333;
  line-height: 1.5;
  margin: 0;
}

.favorite-btn {
  font-size: 1.5rem;
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0.25rem;

  &:hover {
    color: #ff6b6b;
    transform: scale(1.1);
  }

  &--active {
    color: #ff4444;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;

  &__btn {
    padding: 0.5rem 1rem;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: #f5f5f5;
      border-color: #999;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__pages {
    display: flex;
    gap: 0.25rem;
  }

  &__page {
    min-width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0.5rem;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #f5f5f5;
      border-color: #999;
    }

    &--active {
      background: #4CAF50;
      color: white;
      border-color: #4CAF50;

      &:hover {
        background: #45a049;
      }
    }
  }
}

.loading, .error, .empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #666;
  background: #f9f9f9;
  border-radius: 12px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  color: #f44336;
  background: #ffebee;
}

.retry {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #d32f2f;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .todos {
    padding: 1.5rem;

    &__header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
  }

  .profile__info {
    grid-template-columns: 1fr;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .create-form {
    flex-direction: column;
  }

  .todo-item {
    flex-direction: column;
    gap: 1rem;

    .todo-content {
      margin-right: 0;
    }

    .favorite-btn {
      align-self: flex-end;
    }
  }

  .pagination {
    flex-wrap: wrap;

    &__pages {
      order: -1;
      width: 100%;
      justify-content: center;
      margin-bottom: 0.5rem;
    }
  }
}
</style>