// src/composables/useTodos.ts (полный файл с watch)
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '@/services/api'
import { useLocalStorage } from './useLocalStorage'
import type { Todo } from '@/types'

export function useTodos() {
    const todos = ref<Todo[]>([])
    const loading = ref(false)
    const error = ref('')

    const statusFilter = ref('all')
    const userFilter = ref<number | null>(null)
    const searchQuery = ref('')

    const currentPage = ref(1)
    const itemsPerPage = ref(10)

    const { data: favoriteIds } = useLocalStorage<number[]>('favoriteTodos', [])

    const fetchTodos = async () => {
        loading.value = true
        error.value = ''
        try {
            todos.value = await api.getTodos()
        } catch {
            error.value = 'Не удалось загрузить задачи'
        } finally {
            loading.value = false
        }
    }

    const userIds = computed(() => {
        const ids = new Set(todos.value.map(t => t.userId))
        return Array.from(ids).sort((a, b) => a - b)
    })

    const filteredTodos = computed(() => {
        let result = [...todos.value]

        if (statusFilter.value === 'completed') {
            result = result.filter(t => t.completed)
        } else if (statusFilter.value === 'uncompleted') {
            result = result.filter(t => !t.completed)
        } else if (statusFilter.value === 'favorites') {
            result = result.filter(t => favoriteIds.value.includes(t.id))
        }

        if (userFilter.value !== null) {
            result = result.filter(t => t.userId === userFilter.value)
        }

        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase()
            result = result.filter(t => t.title.toLowerCase().includes(query))
        }

        return result
    })

    const paginatedTodos = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value
        const end = start + itemsPerPage.value
        return filteredTodos.value.slice(start, end)
    })

    const totalPages = computed(() => {
        return Math.ceil(filteredTodos.value.length / itemsPerPage.value)
    })

    const resetPage = () => {
        currentPage.value = 1
    }

    watch([statusFilter, userFilter, searchQuery, itemsPerPage], () => {
        resetPage()
    })

    const toggleFavorite = (todoId: number) => {
        const index = favoriteIds.value.indexOf(todoId)
        if (index === -1) {
            favoriteIds.value.push(todoId)
        } else {
            favoriteIds.value.splice(index, 1)
        }
    }

    const isFavorite = (todoId: number) => {
        return favoriteIds.value.includes(todoId)
    }

    const createTodo = async (userId: number, title: string) => {
        if (!userId || !title.trim()) {
            throw new Error('Заполните все поля')
        }

        try {
            const newTodo = await api.createTodo({
                userId,
                title: title.trim(),
                completed: false
            })
            todos.value = [newTodo, ...todos.value]
            resetPage()
            return newTodo
        } catch {
            throw new Error('Не удалось создать задачу')
        }
    }

    onMounted(() => {
        fetchTodos()
    })

    return {
        todos,
        loading,
        error,
        statusFilter,
        userFilter,
        searchQuery,
        favoriteIds,
        userIds,
        filteredTodos,
        paginatedTodos,
        currentPage,
        itemsPerPage,
        totalPages,
        fetchTodos,
        toggleFavorite,
        isFavorite,
        createTodo,
        resetPage
    }
}