<template>
  <div class="user-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAdd">添加用户</el-button>
        </div>
      </template>
      
      <el-table :data="users" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="full_name" label="姓名" />
        <el-table-column prop="is_active" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.is_active ? 'success' : 'danger'">
              {{ scope.row.is_active ? '激活' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_admin" label="角色">
          <template #default="scope">
            <el-tag :type="scope.row.is_admin ? 'warning' : 'info'">
              {{ scope.row.is_admin ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDelete(scope.row)"
              :disabled="scope.row.id === currentUser.id"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '添加用户'"
      width="500px"
    >
      <el-form :model="userForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="密码" v-if="!isEdit">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="userForm.email" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="userForm.full_name" />
        </el-form-item>
        <el-form-item label="激活">
          <el-switch v-model="userForm.is_active" />
        </el-form-item>
        <el-form-item label="管理员">
          <el-switch v-model="userForm.is_admin" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const store = useStore()
const users = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentUser = computed(() => store.getters['auth/currentUser'])

const userForm = ref({
  username: '',
  password: '',
  email: '',
  full_name: '',
  is_active: true,
  is_admin: false
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const token = store.state.auth.token
    const response = await axios.get('http://localhost:8000/api/users/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    users.value = response.data
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  userForm.value = {
    username: '',
    password: '',
    email: '',
    full_name: '',
    is_active: true,
    is_admin: false
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  userForm.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除用户 ${row.username} 吗？`, '警告', {
    type: 'warning'
  }).then(async () => {
    try {
      const token = store.state.auth.token
      await axios.delete(`http://localhost:8000/api/users/${row.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      ElMessage.success('删除成功')
      fetchUsers()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const submitForm = async () => {
  try {
    const token = store.state.auth.token
    const config = { headers: { Authorization: `Bearer ${token}` } }
    
    if (isEdit.value) {
      await axios.put(`http://localhost:8000/api/users/${userForm.value.id}`, userForm.value, config)
      ElMessage.success('更新成功')
    } else {
      await axios.post('http://localhost:8000/api/users/', userForm.value, config)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchUsers()
  } catch (error) {
    ElMessage.error(error.response?.data?.detail || '操作失败')
  }
}

onMounted(fetchUsers)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
