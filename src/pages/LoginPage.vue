<!-- src/pages/LoginPage.vue -->
<template>
  <div class="login">
    <div class="login__container">
      <h1>Вход в систему</h1>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Username</label>
          <input
              v-model="form.username"
              placeholder="Введите username"
              @input="validateUsername"
          />
          <span v-if="errors.username" class="error">{{ errors.username }}</span>
        </div>

        <div class="form-group">
          <label>Phone number</label>
          <input
              v-model="form.phone"
              placeholder="Введите телефон"
          />
        </div>

        <button type="submit" :disabled="isLoading">
          {{ isLoading ? 'Вход...' : 'Login' }}
        </button>

        <div v-if="authError" class="error-message">
          {{ authError }}
        </div>

        <div class="test-data">
          <p><strong>Тестовые данные:</strong></p>
          <p>Bret / 1-770-736-8031 x56442</p>
          <p>Antonette / 1-463-123-4447</p>
          <p>Samantha / 1-463-123-4448</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/services/api'

const router = useRouter()
const isLoading = ref(false)
const authError = ref('')

const form = reactive({
  username: '',
  phone: ''
})

const errors = reactive({
  username: ''
})

const validateUsername = () => {
  const onlyLettersRegex = /^[A-Za-zА-Яа-я\s]*$/
  if (form.username && !onlyLettersRegex.test(form.username)) {
    errors.username = 'Только буквы'
  } else {
    errors.username = ''
  }
}

const handleSubmit = async () => {
  validateUsername()
  if (errors.username) return
  if (!form.username || !form.phone) {
    authError.value = 'Заполните все поля'
    return
  }

  isLoading.value = true
  authError.value = ''

  try {
    const users = await api.getUsers()
    const matchedUser = users.find(
        user => user.username === form.username && user.phone === form.phone
    )

    if (matchedUser) {
      sessionStorage.setItem('user', JSON.stringify(matchedUser))
      router.push('/dashboard')
    } else {
      authError.value = 'login error: неверный username или phone'
    }
  } catch {
    authError.value = 'Ошибка сервера'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}
.login__container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}
h1 {
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.8rem;
  text-align: center;
}
.form-group {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
label {
  font-weight: 500;
  color: #555;
}
input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}
input:focus {
  outline: none;
  border-color: #4CAF50;
}
button {
  width: 100%;
  padding: 0.75rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}
button:hover:not(:disabled) {
  background: #45a049;
}
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.error {
  color: #f44336;
  font-size: 0.875rem;
}
.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #ffebee;
  color: #f44336;
  border-radius: 4px;
  text-align: center;
}
.test-data {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-size: 0.875rem;
  color: #666;
}
.test-data p {
  margin: 0.25rem 0;
}
</style>