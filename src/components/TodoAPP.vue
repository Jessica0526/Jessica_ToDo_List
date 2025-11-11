<template>
  <div class="todo-app">
    <div class="app-container">
      <!-- 头部 -->
      <header class="app-header">
        <div class="header-content">
          <h1 class="app-title">
            <el-icon><List /></el-icon>
            待办事项
          </h1>
          <p class="app-subtitle">简洁高效的任务管理</p>
        </div>
      </header>

      <!-- 主要内容 -->
      <main class="app-main">
        <div class="todo-card">
          <!-- 统计信息 -->
          <div class="stats-section">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{ todoStore.stats.total }}</div>
                <div class="stat-label">总任务</div>
              </div>
              <div class="stat-item">
                <div class="stat-number active">{{ todoStore.stats.active }}</div>
                <div class="stat-label">进行中</div>
              </div>
              <div class="stat-item">
                <div class="stat-number completed">{{ todoStore.stats.completed }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </div>
          </div>

          <!-- 搜索和过滤 -->
          <div class="filter-section">
            <div class="filter-row">
              <el-input
                v-model="todoStore.searchQuery"
                placeholder="搜索任务..."
                :prefix-icon="Search"
                clearable
                class="search-input"
                size="large"
              />
              <el-select
                v-model="todoStore.filterStatus"
                placeholder="状态筛选"
                class="filter-select"
                size="large"
              >
                <el-option label="全部" value="all" />
                <el-option label="进行中" value="active" />
                <el-option label="已完成" value="completed" />
              </el-select>
              <el-button
                type="default"
                :disabled="todoStore.stats.completed === 0"
                @click="handleClearCompleted"
                :icon="Delete"
                class="clear-btn"
                size="large"
              >
                清除已完成
              </el-button>
            </div>
          </div>

          <!-- 添加新任务 -->
          <div class="add-section">
            <div class="add-form">
              <el-input
                v-model="newTodoTitle"
                placeholder="添加新任务..."
                @keyup.enter="handleAddTodo"
                class="title-input"
                size="large"
              >
                <template #append>
                  <el-button 
                    type="primary" 
                    :icon="Plus" 
                    @click="handleAddTodo"
                    :disabled="!newTodoTitle.trim()"
                    class="add-btn"
                    size="large"
                  >
                    添加
                  </el-button>
                </template>
              </el-input>
              <el-input
                v-model="newTodoDescription"
                type="textarea"
                :rows="3"
                placeholder="任务描述（可选）..."
                resize="none"
                class="desc-input"
              />
            </div>
          </div>

          <!-- 任务列表 -->
          <div class="list-section">
            <div 
              v-if="todoStore.filteredTodos.length === 0"
              class="empty-state"
            >
              <el-empty description="暂无任务" :image-size="120" />
            </div>
            
            <div v-else class="todo-list">
              <div
                v-for="todo in todoStore.filteredTodos"
                :key="todo.id"
                :class="['todo-item', { 'completed': todo.completed }]"
              >
                <div class="todo-content">
                  <el-checkbox
                    v-model="todo.completed"
                    @change="() => todoStore.toggleTodo(todo.id)"
                    class="todo-checkbox"
                    size="large"
                  />
                  <div class="todo-text">
                    <div 
                      :class="['todo-title', { 'completed': todo.completed }]"
                    >
                      {{ todo.title }}
                    </div>
                    <div 
                      v-if="todo.description"
                      class="todo-description"
                    >
                      {{ todo.description }}
                    </div>
                    <div class="todo-meta">
                      {{ formatDate(todo.createdAt) }}
                    </div>
                  </div>
                  <div class="todo-actions">
                    <el-button
                      text
                      :icon="Delete"
                      @click="handleDeleteTodo(todo.id)"
                      class="delete-btn"
                      size="large"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTodoStore } from '@/stores/todoStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Delete, Plus, List } from '@element-plus/icons-vue'

const todoStore = useTodoStore()
const newTodoTitle = ref('')
const newTodoDescription = ref('')

const handleAddTodo = () => {
  if (newTodoTitle.value.trim()) {
    todoStore.addTodo(newTodoTitle.value, newTodoDescription.value)
    newTodoTitle.value = ''
    newTodoDescription.value = ''
  }
}

const handleDeleteTodo = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个任务吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    todoStore.deleteTodo(id)
  } catch {
    // 用户取消删除
  }
}

const handleClearCompleted = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要清除 ${todoStore.stats.completed} 个已完成任务吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    todoStore.clearCompleted()
  } catch {
    // 用户取消清除
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped lang="scss">
.todo-app {
  min-height: 100vh;
  height: 100vh;
  background: #ffffff;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  font-size: 16px; // 基础字体大小
}

.app-container {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.app-header {
  background: #000000;
  color: white;
  padding: 40px 20px;
  flex-shrink: 0;
  
  .header-content {
    text-align: center;
  }
  
  .app-title {
    font-size: 2.5rem; // 增大标题字体
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    
    .el-icon {
      font-size: 2.2rem; // 增大图标
    }
  }
  
  .app-subtitle {
    color: rgba(255, 255, 255, 0.7);
    margin: 12px 0 0;
    font-size: 1.2rem; // 增大副标题字体
    font-weight: 400;
  }
}

.app-main {
  flex: 1;
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.todo-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px; // 增大圆角
  margin-top: -20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.stats-section {
  padding: 30px 24px 25px; // 增大内边距
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px; // 增大间距
}

.stat-item {
  text-align: center;
  
  .stat-number {
    font-size: 2.5rem; // 增大统计数字
    font-weight: 700;
    color: #000000;
    
    &.active {
      color: #666666;
    }
    
    &.completed {
      color: #999999;
    }
  }
  
  .stat-label {
    font-size: 1.1rem; // 增大标签字体
    color: #666666;
    margin-top: 8px;
    font-weight: 500;
  }
}

.filter-section {
  padding: 25px 24px; // 增大内边距
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.filter-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 15px; // 增大间距
  align-items: center;
}

.search-input,
.filter-select,
.clear-btn {
  height: 44px; // 增大高度
  font-size: 1.1rem; // 增大字体
}

.add-section {
  padding: 25px 24px; // 增大内边距
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 15px; // 增大间距
}

.title-input,
.desc-input {
  font-size: 1.1rem; // 增大字体
  
  :deep(.el-input__inner) {
    border-color: #e0e0e0;
    font-size: 1.1rem; // 增大输入框字体
    height: 44px; // 增大高度
    
    &:focus {
      border-color: #000000;
    }
  }
  
  :deep(.el-textarea__inner) {
    font-size: 1.1rem; // 增大文本区域字体
    line-height: 1.5;
  }
}

.add-btn {
  background: #000000;
  border-color: #000000;
  font-size: 1.1rem; // 增大按钮字体
  
  &:hover {
    background: #333333;
    border-color: #333333;
  }
}

.list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 0;
}

.empty-state {
  padding: 60px 20px; // 增大内边距
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.todo-list {
  flex: 1;
  overflow-y: auto;
  max-height: none;
}

.todo-item {
  padding: 20px 24px; // 增大内边距
  border-bottom: 1px solid #f5f5f5;
  transition: background-color 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #fafafa;
  }
  
  &.completed {
    background: #f8f8f8;
    
    .todo-title {
      color: #999999;
    }
  }
}

.todo-content {
  display: flex;
  align-items: flex-start;
  gap: 15px; // 增大间距
}

.todo-checkbox {
  margin-top: 4px;
  
  :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background: #000000;
    border-color: #000000;
  }
  
  :deep(.el-checkbox__label) {
    font-size: 1.1rem; // 增大复选框标签字体
  }
}

.todo-text {
  flex: 1;
  
  .todo-title {
    font-size: 1.2rem; // 增大任务标题
    font-weight: 500;
    color: #000000;
    line-height: 1.5;
    margin-bottom: 6px;
    
    &.completed {
      text-decoration: line-through;
      color: #999999;
    }
  }
  
  .todo-description {
    font-size: 1rem; // 增大描述字体
    color: #666666;
    line-height: 1.5;
    margin-bottom: 6px;
  }
  
  .todo-meta {
    font-size: 0.9rem; // 增大元信息字体
    color: #999999;
  }
}

.todo-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.todo-item:hover .todo-actions {
  opacity: 1;
}

.delete-btn {
  color: #666666;
  font-size: 1.2rem; // 增大删除按钮图标
  
  &:hover {
    color: #ff4d4f;
  }
}

// 滚动条样式
.todo-list::-webkit-scrollbar {
  width: 8px; // 增大滚动条宽度
}

.todo-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.todo-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.todo-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

// 响应式设计
@media (max-width: 768px) {
  .app-main {
    padding: 0 15px 15px;
  }
  
  .filter-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stats-grid {
    gap: 15px;
  }
  
  .stat-item .stat-number {
    font-size: 2rem;
  }
  
  .todo-item {
    padding: 18px 20px;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 30px 15px;
  }
  
  .app-title {
    font-size: 2rem;
  }
  
  .app-subtitle {
    font-size: 1rem;
  }
  
  .stats-section,
  .filter-section,
  .add-section {
    padding: 20px;
  }
  
  .todo-item {
    padding: 16px;
  }
  
  .stat-item .stat-number {
    font-size: 1.8rem;
  }
  
  .stat-item .stat-label {
    font-size: 1rem;
  }
}
</style>