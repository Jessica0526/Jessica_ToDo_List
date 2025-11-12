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
            <div class="filter-controls">
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
                  <el-option label="全部状态" value="all" />
                  <el-option label="进行中" value="active" />
                  <el-option label="已完成" value="completed" />
                </el-select>
                <el-select
                  v-model="todoStore.filterCategory"
                  placeholder="分类筛选"
                  class="filter-select"
                  size="large"
                >
                  <el-option label="全部分类" value="all" />
                  <el-option 
                    v-for="category in todoStore.categories"
                    :key="category.value"
                    :label="category.label"
                    :value="category.value"
                  />
                </el-select>
                <el-select
                  v-model="todoStore.sortBy"
                  placeholder="排序方式"
                  class="filter-select"
                  size="large"
                >
                  <el-option label="最新创建" value="createdAt" />
                  <el-option label="优先级" value="priority" />
                  <el-option label="截止日期" value="dueDate" />
                </el-select>
                <el-button
                  type="danger"
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
          </div>

          <!-- 添加新任务 -->
          <div class="add-section">
            <div class="add-form">
              <div class="form-row">
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
              </div>
              <div class="form-row">
                <el-input
                  v-model="newTodoDescription"
                  type="textarea"
                  :rows="2"
                  placeholder="任务描述（可选）..."
                  resize="none"
                  class="desc-input"
                />
              </div>
              <div class="form-row">
                <div class="form-options">
                  <el-select
                    v-model="newTodoCategory"
                    placeholder="选择分类"
                    class="option-select"
                  >
                    <el-option 
                      v-for="category in todoStore.categories"
                      :key="category.value"
                      :label="category.label"
                      :value="category.value"
                    />
                  </el-select>
                  <el-select
                    v-model="newTodoPriority"
                    placeholder="选择优先级"
                    class="option-select"
                  >
                    <el-option 
                      v-for="priority in todoStore.priorities"
                      :key="priority.value"
                      :label="priority.label"
                      :value="priority.value"
                    />
                  </el-select>
                  <el-date-picker
                    v-model="newTodoDueDate"
                    type="datetime"
                    placeholder="截止日期"
                    format="YYYY-MM-DD HH:mm"
                    value-format="YYYY-MM-DDTHH:mm:ss"
                    class="date-picker"
                  />
                </div>
              </div>
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
                    :model-value="todo.completed"
                    @change="(value) => handleToggleTodo(todo.id, value)"
                    class="todo-checkbox"
                    size="large"
                  />
                  <div class="todo-text">
                    <div class="todo-header">
                      <div 
                        :class="['todo-title', { 'completed': todo.completed }]"
                      >
                        {{ todo.title }}
                      </div>
                      <div class="todo-badges">
                        <span 
                          class="category-badge"
                          :style="{ backgroundColor: getCategoryColor(todo.category) }"
                        >
                          {{ getCategoryLabel(todo.category) }}
                        </span>
                        <span 
                          class="priority-badge"
                          :style="{ color: getPriorityColor(todo.priority) }"
                        >
                          {{ getPriorityLabel(todo.priority) }}
                        </span>
                      </div>
                    </div>
                    <div 
                      v-if="todo.description"
                      class="todo-description"
                    >
                      {{ todo.description }}
                    </div>
                    <div class="todo-meta">
                      <span>创建: {{ formatDate(todo.createdAt) }}</span>
                      <span v-if="todo.dueDate" class="due-date">
                        截止: {{ formatDate(todo.dueDate) }}
                      </span>
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
const newTodoCategory = ref('work')
const newTodoPriority = ref('medium')
const newTodoDueDate = ref('')

const handleAddTodo = () => {
  if (newTodoTitle.value.trim()) {
    todoStore.addTodo(
      newTodoTitle.value, 
      newTodoDescription.value,
      newTodoCategory.value,
      newTodoPriority.value,
      newTodoDueDate.value
    )
    // 重置表单
    newTodoTitle.value = ''
    newTodoDescription.value = ''
    newTodoDueDate.value = ''
    
    ElMessage.success('任务添加成功')
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
    ElMessage.success('任务删除成功')
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
    ElMessage.success('已清除已完成任务')
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

const getCategoryLabel = (categoryValue) => {
  const category = todoStore.categories.find(cat => cat.value === categoryValue)
  return category ? category.label : '其他'
}

const getCategoryColor = (categoryValue) => {
  const category = todoStore.categories.find(cat => cat.value === categoryValue)
  return category ? category.color : '#96CEB4'
}

const getPriorityLabel = (priorityValue) => {
  const priority = todoStore.priorities.find(pri => pri.value === priorityValue)
  return priority ? priority.label : '中优先级'
}

const getPriorityColor = (priorityValue) => {
  const priority = todoStore.priorities.find(pri => pri.value === priorityValue)
  return priority ? priority.color : '#FFA502'
}

const handleToggleTodo = (id, value) => {
  todoStore.toggleTodo(id)
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
  font-size: 18px; /* 基础字体从16px增大到18px */
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
  padding: 50px 20px; /* 增大内边距 */
  flex-shrink: 0;
  
  .header-content {
    text-align: center;
  }
  
  .app-title {
    font-size: 3rem; /* 从2.5rem增大到3rem */
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px; /* 增大间距 */
    
    .el-icon {
      font-size: 2.8rem; /* 从2.2rem增大到2.8rem */
    }
  }
  
  .app-subtitle {
    color: rgba(255, 255, 255, 0.7);
    margin: 15px 0 0; /* 增大间距 */
    font-size: 1.4rem; /* 从1.2rem增大到1.4rem */
    font-weight: 400;
  }
}

.app-main {
  flex: 1;
  padding: 0 25px 25px; /* 增大内边距 */
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.todo-card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 15px; /* 增大圆角 */
  margin-top: -25px; /* 调整位置 */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.stats-section {
  padding: 35px 28px 30px; /* 增大内边距 */
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 25px; /* 增大间距 */
}

.stat-item {
  text-align: center;
  
  .stat-number {
    font-size: 3rem; /* 从2.5rem增大到3rem */
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
    font-size: 1.3rem; /* 从1.1rem增大到1.3rem */
    color: #666666;
    margin-top: 12px; /* 增大间距 */
    font-weight: 500;
  }
}

.filter-section {
  padding: 30px 28px; /* 增大内边距 */
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.filter-controls {
  .filter-row {
    display: grid;
    grid-template-columns: 1fr auto auto auto auto;
    gap: 15px; /* 增大间距 */
    align-items: center;
  }
}

.search-input,
.filter-select,
.clear-btn {
  height: 50px; /* 从44px增大到50px */
  font-size: 1.3rem; /* 从1.1rem增大到1.3rem */
}

.add-section {
  padding: 30px 28px; /* 增大内边距 */
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.add-form {
  display: flex;
  flex-direction: column;
  gap: 20px; /* 增大间距 */
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 15px; /* 增大间距 */
}

.form-options {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px; /* 增大间距 */
  align-items: center;
}

.title-input,
.desc-input,
.option-select,
.date-picker {
  font-size: 1.3rem; /* 从1.1rem增大到1.3rem */
  
  :deep(.el-input__inner) {
    border-color: #e0e0e0;
    font-size: 1.3rem; /* 从1.1rem增大到1.3rem */
    height: 50px; /* 从44px增大到50px */
    
    &:focus {
      border-color: #000000;
    }
  }
}

.desc-input :deep(.el-textarea__inner) {
  font-size: 1.3rem; /* 从1.1rem增大到1.3rem */
  line-height: 1.6;
}

.add-btn {
  background: #000000;
  border-color: #000000;
  font-size: 1.3rem; /* 从1.1rem增大到1.3rem */
  
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
  padding: 80px 20px; /* 增大内边距 */
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
  padding: 25px 28px; /* 增大内边距 */
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
  gap: 20px; /* 增大间距 */
}

.todo-checkbox {
  margin-top: 6px; /* 增大间距 */
  
  :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background: #000000;
    border-color: #000000;
  }
  
  :deep(.el-checkbox__inner) {
    width: 22px; /* 增大复选框大小 */
    height: 22px;
  }
  
  :deep(.el-checkbox__inner::after) {
    height: 10px; /* 增大勾选标记 */
    left: 7px;
    top: 3px;
    width: 6px;
  }
}

.todo-text {
  flex: 1;
  
  .todo-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px; /* 增大间距 */
    gap: 15px; /* 增大间距 */
  }
  
  .todo-title {
    font-size: 1.4rem; /* 从1.2rem增大到1.4rem */
    font-weight: 500;
    color: #000000;
    line-height: 1.6;
    flex: 1;
    
    &.completed {
      text-decoration: line-through;
      color: #999999;
    }
  }
  
  .todo-badges {
    display: flex;
    gap: 12px; /* 增大间距 */
    flex-shrink: 0;
  }
  
  .category-badge {
    padding: 6px 12px; /* 增大内边距 */
    border-radius: 6px; /* 增大圆角 */
    font-size: 0.9rem; /* 从0.75rem增大到0.9rem */
    color: white;
    font-weight: 500;
  }
  
  .priority-badge {
    padding: 6px 12px; /* 增大内边距 */
    border-radius: 6px; /* 增大圆角 */
    font-size: 0.9rem; /* 从0.75rem增大到0.9rem */
    font-weight: 500;
    border: 1px solid currentColor;
  }
  
  .todo-description {
    font-size: 1.2rem; /* 从1rem增大到1.2rem */
    color: #666666;
    line-height: 1.6;
    margin-bottom: 12px; /* 增大间距 */
  }
  
  .todo-meta {
    font-size: 1rem; /* 从0.85rem增大到1rem */
    color: #999999;
    display: flex;
    gap: 20px; /* 增大间距 */
    
    .due-date {
      color: #FF6B6B;
      font-weight: 500;
    }
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
  font-size: 1.4rem; /* 从1.2rem增大到1.4rem */
  
  &:hover {
    color: #ff4d4f;
  }
}

.todo-list::-webkit-scrollbar {
  width: 10px; /* 增大滚动条宽度 */
}

.todo-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 5px;
}

.todo-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 5px;
}

.todo-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

@media (max-width: 1200px) {
  .filter-controls .filter-row {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .app-main {
    padding: 0 20px 20px;
  }
  
  .filter-controls .filter-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .form-options {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stats-grid {
    gap: 20px;
  }
  
  .stat-item .stat-number {
    font-size: 2.5rem;
  }
  
  .todo-item {
    padding: 22px 24px;
  }
  
  .todo-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 10px !important;
  }
  
  .todo-badges {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 40px 15px;
  }
  
  .app-title {
    font-size: 2.5rem;
  }
  
  .app-subtitle {
    font-size: 1.2rem;
  }
  
  .stats-section,
  .filter-section,
  .add-section {
    padding: 25px;
  }
  
  .todo-item {
    padding: 20px;
  }
  
  .stat-item .stat-number {
    font-size: 2.2rem;
  }
  
  .stat-item .stat-label {
    font-size: 1.2rem;
  }
}
</style>