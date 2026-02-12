<!-- src/components/layout/AppHeader.vue -->
<template>
  <header class="app-header">
    <div class="app-header__container">
      <h1 class="app-header__logo">Todo App</h1>
      <button v-if="isAuthenticated" @click="handleLogout" class="logout-button">
        Выйти
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isAuthenticated = computed(() => sessionStorage.getItem('user') !== null)

const handleLogout = () => {
  sessionStorage.removeItem('user')
  router.push('/')
}
</script>

<style scoped lang="scss">
.app-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 1rem 2rem;

  &__container {
    max-wsidth: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__logo {
    font-size: 1.5rem;
    color: #4CAF50;
    margin: 0;
  }
}

.logout-button {
  padding: 0.5rem 1rem;
  background: none;
  border: 1px solid #f44336;
  color: #f44336;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f44336;
    color: white;
  }
}
</style>