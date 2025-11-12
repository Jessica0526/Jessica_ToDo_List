import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTodoStore = defineStore('todo', () => {
    // 从 localStorage 加载初始数据
    const loadTodosFromStorage = () => {
        try {
            const saved = localStorage.getItem('todo-app-todos')
            return saved ? JSON.parse(saved) : []
        } catch {
            return []
        }
    }

    // 保存数据到 localStorage
    const saveTodosToStorage = (todos) => {
        localStorage.setItem('todo-app-todos', JSON.stringify(todos))
    }

    // 状态
    const todos = ref(loadTodosFromStorage())
    const searchQuery = ref('')
    const filterStatus = ref('all')
    const filterCategory = ref('all')
    const sortBy = ref('createdAt') // createdAt, priority, dueDate

    // 分类选项
    const categories = [
        { value: 'work', label: '工作', color: '#FF6B6B' },
        { value: 'study', label: '秋招', color: '#4ECDC4' },
        { value: 'life', label: '面试', color: '#45B7D1' },
        { value: 'other', label: '其他', color: '#96CEB4' }
    ]

    // 优先级选项
    const priorities = [
        { value: 'high', label: '高优先级', color: '#FF4757' },
        { value: 'medium', label: '中优先级', color: '#FFA502' },
        { value: 'low', label: '低优先级', color: '#2ED573' }
    ]

    // 计算属性 - 统计数据
    const stats = computed(() => {
        const total = todos.value.length
        const completed = todos.value.filter(todo => todo.completed).length
        const active = total - completed
        return { total, completed, active }
    })

    // 计算属性 - 过滤后的待办事项
    const filteredTodos = computed(() => {
        let filtered = [...todos.value]

        // 根据状态筛选
        if (filterStatus.value === 'active') {
            filtered = filtered.filter(todo => !todo.completed)
        } else if (filterStatus.value === 'completed') {
            filtered = filtered.filter(todo => todo.completed)
        }

        // 根据分类筛选
        if (filterCategory.value !== 'all') {
            filtered = filtered.filter(todo => todo.category === filterCategory.value)
        }

        // 根据搜索词筛选
        if (searchQuery.value.trim()) {
            const query = searchQuery.value.toLowerCase()
            filtered = filtered.filter(todo =>
                todo.title.toLowerCase().includes(query) ||
                (todo.description && todo.description.toLowerCase().includes(query))
            )
        }

        // 排序
        filtered.sort((a, b) => {
            switch (sortBy.value) {
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 }
                    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)

                case 'dueDate':
                    if (!a.dueDate && !b.dueDate) return 0
                    if (!a.dueDate) return 1
                    if (!b.dueDate) return -1
                    return new Date(a.dueDate) - new Date(b.dueDate)

                case 'createdAt':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt)
            }
        })

        return filtered
    })

    // Actions
    const addTodo = (title, description = '', category = 'work', priority = 'medium', dueDate = null) => {
        const newTodo = {
            id: Date.now().toString(),
            title: title.trim(),
            description: description.trim(),
            category,
            priority,
            dueDate,
            completed: false,
            createdAt: new Date().toISOString()
        }

        todos.value.unshift(newTodo)
        saveTodosToStorage(todos.value)
        return newTodo
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

    const updateTodo = (id, updates) => {
        const todo = todos.value.find(todo => todo.id === id)
        if (todo) {
            Object.assign(todo, updates)
            saveTodosToStorage(todos.value)
        }
    }

    const clearCompleted = () => {
        todos.value = todos.value.filter(todo => !todo.completed)
        saveTodosToStorage(todos.value)
    }

    // 导出
    return {
        // 状态
        todos,
        searchQuery,
        filterStatus,
        filterCategory,
        sortBy,

        // 选项
        categories,
        priorities,

        // 计算属性
        stats,
        filteredTodos,

        // 方法
        addTodo,
        deleteTodo,
        toggleTodo,
        updateTodo,
        clearCompleted
    }
})