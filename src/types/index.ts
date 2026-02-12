// src/types/index.ts
export interface User {
    id: number
    name: string
    username: string
    email: string
    phone: string
    website: string
}

export interface Todo {
    id: number
    userId: number
    title: string
    completed: boolean
}

export interface LoginForm {
    username: string
    phone: string
}