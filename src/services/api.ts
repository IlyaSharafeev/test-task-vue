import type { User, Todo } from '@/types'

const BASE_URL = 'https://jsonplaceholder.typicode.com'

export const api = {
    async getUsers(): Promise<User[]> {
        const response = await fetch(`${BASE_URL}/users`)
        if (!response.ok) throw new Error('Failed to fetch users')
        return response.json()
    },

    async getTodos(): Promise<Todo[]> {
        const response = await fetch(`${BASE_URL}/todos`)
        if (!response.ok) throw new Error('Failed to fetch todos')
        return response.json()
    },

    async createTodo(todo: Omit<Todo, 'id'>): Promise<Todo> {
        const response = await fetch(`${BASE_URL}/todos`, {
            method: 'POST',
            body: JSON.stringify(todo),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
        if (!response.ok) throw new Error('Failed to create todo')
        return response.json()
    }
}