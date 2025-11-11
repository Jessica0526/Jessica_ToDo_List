import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

export const useTodoStore = defineStore('todo', () => {
    const todos = ref([])
    const searchQuery = ref('')
    const filterStatus = ref('all')

    // 从LocalStorage加载数据
    const loadFromStorage = () => {
        try {
            const data = localStorage.getItem('vue-todo-app')
            if (data) {
                todos.value = JSON.parse(data)
            }
        } catch (error) {
            ElMessage.error('加载数据失败')
        }
    }

    // 保存到LocalStorage
    const saveToStorage = () => {
        try {
            localStorage.setItem('vue-todo-app', JSON.stringify(todos.value))
        } catch (error) {
            ElMessage.error('保存数据失败')
        }
    }

    // 初始化加载数据
    loadFromStorage()

    // 监听todos变化自动保存
    watch(todos, saveToStorage, { deep: true })

    // 添加待办事项
    const addTodo = (title, description = '') => {
        if (!title.trim()) {
            ElMessage.warning('请输入待办事项标题')
            return
        }

        const newTodo = {
            id: Date.now().toString(),
            title: title.trim(),
            description: description.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        todos.value.unshift(newTodo)
        ElMessage.success('添加成功')
    }

    // 删除待办事项
    const deleteTodo = (id) => {
        const index = todos.value.findIndex(todo => todo.id === id)
        if (index !== -1) {
            todos.value.splice(index, 1)
            ElMessage.success('删除成功')
        }
    }

    // 切换完成状态
    const toggleTodo = (id) => {
        const todo = todos.value.find(todo => todo.id === id)
        if (todo) {
            todo.completed = !todo.completed
            todo.updatedAt = new Date().toISOString()
        }
    }

    // 批量删除已完成
    const clearCompleted = () => {
        const completedCount = todos.value.filter(todo => todo.completed).length
        todos.value = todos.value.filter(todo => !todo.completed)
        if (completedCount > 0) {
            ElMessage.success(`已清除 ${completedCount} 个已完成事项`)
        }
    }

    // 过滤后的待办事项
    const filteredTodos = computed(() => {
        let filtered = todos.value

        // 状态过滤
        if (filterStatus.value === 'active') {
            filtered = filtered.filter(todo => !todo.completed)
        } else if (filterStatus.value === 'completed') {
            filtered = filtered.filter(todo => todo.completed)
        }

        // 搜索过滤
        if (searchQuery.value.trim()) {
            const query = searchQuery.value.toLowerCase().trim()
            filtered = filtered.filter(todo =>
                todo.title.toLowerCase().includes(query) ||
                todo.description.toLowerCase().includes(query)
            )
        }

        return filtered
    })

    // 统计数据
    const stats = computed(() => ({
        total: todos.value.length,
        active: todos.value.filter(todo => !todo.completed).length,
        completed: todos.value.filter(todo => todo.completed).length
    }))

    return {
        todos,
        searchQuery,
        filterStatus,
        addTodo,
        deleteTodo,
        toggleTodo,
        clearCompleted,
        filteredTodos,
        stats
    }
})