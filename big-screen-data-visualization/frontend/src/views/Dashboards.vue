<template>
  <div class="dashboards-page">
    <div class="page-header">
      <h2>大屏管理</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <i class="el-icon-plus"></i> 创建大屏
      </el-button>
    </div>
    
    <el-row :gutter="20">
      <el-col :span="6" v-for="dashboard in dashboards" :key="dashboard.id">
        <el-card class="dashboard-card" @click="viewDashboard(dashboard)">
          <div class="card-header">
            <h3>{{ dashboard.title }}</h3>
            <div class="card-actions">
              <el-button size="small" @click.stop="editDashboard(dashboard)">编辑</el-button>
              <el-button size="small" type="danger" @click.stop="deleteDashboard(dashboard)">删除</el-button>
              <el-button size="small" type="success" @click.stop="shareDashboard(dashboard)">分享</el-button>
            </div>
          </div>
          <p>{{ dashboard.description || '暂无描述' }}</p>
          <div class="card-footer">
            <span>创建时间: {{ formatDate(dashboard.created_at) }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="showCreateDialog" title="创建大屏" width="500px">
      <el-form :model="newDashboard" :rules="rules" ref="dashboardForm" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="newDashboard.name" placeholder="请输入大屏名称"></el-input>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="newDashboard.title" placeholder="请输入大屏标题"></el-input>
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="newDashboard.description" placeholder="请输入描述"></el-input>
        </el-form-item>
        <el-form-item label="公开">
          <el-switch v-model="newDashboard.is_public"></el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createDashboard">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'Dashboards',
  data() {
    return {
      showCreateDialog: false,
      newDashboard: {
        name: '',
        title: '',
        description: '',
        is_public: false,
        layout_config: { grids: [], widgets: [] }
      },
      rules: {
        name: [{ required: true, message: '请输入大屏名称', trigger: 'blur' }],
        title: [{ required: true, message: '请输入大屏标题', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapState(['dashboards'])
  },
  methods: {
    ...mapActions(['fetchDashboards']),
    async createDashboard() {
      try {
        const response = await fetch('http://localhost:8000/api/dashboards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.newDashboard)
        })
        if (response.ok) {
          this.$message.success('创建成功')
          this.showCreateDialog = false
          this.fetchDashboards()
          this.resetForm()
        }
      } catch (error) {
        this.$message.error('创建失败')
      }
    },
    async deleteDashboard(dashboard) {
      try {
        await this.$confirm('确定删除这个大屏吗？', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`http://localhost:8000/api/dashboards/${dashboard.id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          this.$message.success('删除成功')
          this.fetchDashboards()
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },
    editDashboard(dashboard) {
      this.$router.push(`/dashboard-edit/${dashboard.id}`)
    },
    viewDashboard(dashboard) {
      this.$router.push(`/dashboard-view/${dashboard.id}`)
    },
    shareDashboard(dashboard) {
      const url = this.$router.resolve({
        path: `/dashboard-share/${dashboard.id}`
      }).href
      window.open(url, '_blank')
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },
    resetForm() {
      this.newDashboard = {
        name: '',
        title: '',
        description: '',
        is_public: false,
        layout_config: { grids: [], widgets: [] }
      }
    }
  },
  mounted() {
    this.fetchDashboards()
  }
}
</script>

<style scoped>
.dashboards-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dashboard-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.2s;
}

.dashboard-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px; /* Fixed height for header to align across cards */
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 12px;
  flex: 1;
}

.card-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  align-items: center;
}

.card-footer {
  margin-top: 10px;
  color: #999;
  font-size: 12px;
}
</style>