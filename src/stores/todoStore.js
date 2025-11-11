import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTodoStore = defineStore('todo', () => {
    // 从 localStorage 加载初始数据
    const loadTodosFromStorage = () => {
        const saved = localStorage.getItem('todo-app-todos')
        return saved ? JSON.parse(saved) : []
    }

    // 保存数据到 localStorage
    const saveTodosToStorage = (todos) => {
        localStorage.setItem('todo-app-todos', JSON.stringify(todos))
    }

    // 状态
    const todos = ref(loadTodosFromStorage())
    const searchQuery = ref('')
    const filterStatus = ref('all')

    // 计算属性 - 统计数据
    const stats = computed(() => {
        const total = todos.value.length
        const completed = todos.value.filter(todo => todo.completed).length
        const active = total - completed
        return { total, completed, active }
    })

    // 计算属性 - 过滤后的待办事项
    const filteredTodos = computed(() => {
        let filtered = todos.value

        // 根据状态筛选
        if (filterStatus.value === 'active') {
            filtered = filtered.filter(todo => !todo.completed)
        } else if (filterStatus.value === 'completed') {
            filtered = filtered.filter(todo => todo.completed)
        }

        // 根据搜索词筛选
        if (searchQuery.value.trim()) {
            const query = searchQuery.value.toLowerCase()
            filtered = filtered.filter(todo =>
                todo.title.toLowerCase().includes(query) ||
                (todo.description && todo.description.toLowerCase().includes(query))
            )
        }

        return filtered
    })

    // Actions
    const addTodo = (title, description = '') => {
        const newTodo = {
            id: Date.now().toString(),
            title: title.trim(),
            description: description.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        }

        todos.value.unshift(newTodo)
        saveTodosToStorage(todos.value)
    }

    const deleteTodo = (id) => {
        const index = todos.value.findIndex(todo => todo.id === id)
        if (index !== -1) {
            todos.value.splice(index, 1)
            saveTodosToStorage(todos.value)
        }
    }

    const toggleTodo = (id) => {
        const todo = todos.value.find(todo => todo.id === id)
        if (todo) {
            todo.completed = !todo.completed
            saveTodosToStorage(todos.value)
        }
    }

    const clearCompleted = () => {
        todos.value = todos.value.filter(todo => !todo.completed)
        saveTodosToStorage(todos.value)
    }

    // 导出
    return {
        todos,
        searchQuery,
        filterStatus,
        stats,
        filteredTodos,
        addTodo,
        deleteTodo,
        toggleTodo,
        clearCompleted
    }
})