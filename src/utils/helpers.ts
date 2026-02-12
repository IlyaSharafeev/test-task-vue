// src/utils/helpers.ts
import type { Todo } from '@/types'

export const filterByStatus = (todos: Todo[], status: string) => {
    switch (status) {
        case 'completed':
            return todos.filter(todo => todo.completed)
        case 'uncompleted':
            return todos.filter(todo => !todo.completed)
        default:
            return todos
    }
}

export const filterByUser = (todos: Todo[], userId: number | null) => {
    if (userId === null) return todos
    return todos.filter(todo => todo.userId === userId)
}

export const searchByTitle = (todos: Todo[], searchQuery: string) => {
    if (!searchQuery) return todos
    return todos.filter(todo =>
        todo.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
}

export const getUniqueUserIds = (todos: Todo[]): number[] => {
    const ids = new Set(todos.map(todo => todo.userId))
    return Array.from(ids).sort((a, b) => a - b)
}