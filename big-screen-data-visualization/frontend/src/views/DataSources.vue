<template>
  <div class="datasources-page">
    <div class="page-header">
      <h2>数据源管理</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <i class="el-icon-plus"></i> 添加数据源
      </el-button>
    </div>

    <el-table :data="datasources" style="width: 100%">
      <el-table-column prop="name" label="名称" width="200"></el-table-column>
      <el-table-column prop="type" label="类型" width="120">
        <template #default="scope">
          <el-tag :type="getTypeTagType(scope.row.type)">{{ scope.row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述"></el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260">
        <template #default="scope">
          <div class="table-actions">
            <el-button size="small" @click="editDatasource(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteDatasource(scope.row)">删除</el-button>
            <el-button size="small" type="success" @click="testConnection(scope.row)">测试连接</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showCreateDialog" :title="editingDatasource ? '编辑数据源' : '添加数据源'" width="600px">
      <el-form :model="currentDatasource" :rules="rules" ref="datasourceForm" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="currentDatasource.name" placeholder="请输入数据源名称"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="currentDatasource.type" placeholder="请选择数据源类型">
            <el-option label="MySQL" value="mysql"></el-option>
            <el-option label="PostgreSQL" value="postgresql"></el-option>
            <el-option label="SQLite" value="sqlite"></el-option>
            <el-option label="REST API" value="api"></el-option>
            <el-option label="文件" value="file"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="连接配置" prop="connection_config">
          <el-input 
            type="textarea" 
            v-model="configJson" 
            placeholder='{"host": "localhost", "port": 3306, "database": "test"}'
            :rows="6"
          ></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="currentDatasource.description" placeholder="请输入描述"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelEdit">取消</el-button>
        <el-button type="primary" @click="saveDatasource">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'DataSources',
  data() {
    return {
      showCreateDialog: false,
      editingDatasource: null,
      currentDatasource: {
        name: '',
        type: '',
        connection_config: {},
        description: ''
      },
      configJson: '',
      rules: {
        name: [{ required: true, message: '请输入数据源名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择数据源类型', trigger: 'change' }],
        connection_config: [{ required: true, message: '请输入连接配置', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapState(['datasources'])
  },
  methods: {
    ...mapActions(['fetchDatasources']),
    async saveDatasource() {
      try {
        this.$refs.datasourceForm.validate()
        this.currentDatasource.connection_config = JSON.parse(this.configJson)
        
        const url = this.editingDatasource 
          ? `http://localhost:8000/api/datasources/${this.editingDatasource.id}`
          : 'http://localhost:8000/api/datasources'
        
        const method = this.editingDatasource ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.currentDatasource)
        })
        
        if (response.ok) {
          this.$message.success(this.editingDatasource ? '更新成功' : '创建成功')
          this.cancelEdit()
          this.fetchDatasources()
        }
      } catch (error) {
        if (error.message.includes('JSON')) {
          this.$message.error('连接配置格式错误，请输入有效的JSON格式')
        } else {
          this.$message.error('保存失败')
        }
      }
    },
    async deleteDatasource(datasource) {
      try {
        await this.$confirm('确定删除这个数据源吗？', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`http://localhost:8000/api/datasources/${datasource.id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          this.$message.success('删除成功')
          this.fetchDatasources()
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },
    editDatasource(datasource) {
      this.editingDatasource = datasource
      this.currentDatasource = { ...datasource }
      this.configJson = JSON.stringify(datasource.connection_config, null, 2)
      this.showCreateDialog = true
    },
    async testConnection(datasource) {
      try {
        this.$message.info('正在测试连接...')
        const response = await fetch('http://localhost:8000/api/datasources/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datasource)
        })
        
        if (response.ok) {
          this.$message.success('连接测试成功')
        } else {
          const error = await response.json()
          this.$message.error(error.detail || '连接测试失败')
        }
      } catch (error) {
        this.$message.error('连接测试失败: ' + error.message)
      }
    },
    cancelEdit() {
      this.showCreateDialog = false
      this.editingDatasource = null
      this.currentDatasource = {
        name: '',
        type: '',
        connection_config: {},
        description: ''
      }
      this.configJson = ''
    },
    getTypeTagType(type) {
      const typeMap = {
        mysql: 'primary',
        postgresql: 'success',
        api: 'warning',
        file: 'info'
      }
      return typeMap[type] || 'default'
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    }
  },
  mounted() {
    this.fetchDatasources()
  }
}
</script>

<style scoped>
.datasources-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-actions {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}
</style>