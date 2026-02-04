<template>
  <div class="datasets-page">
    <div class="page-header">
      <h2>数据集管理</h2>
      <el-button type="primary" @click="showCreateDialog = true">
        <i class="el-icon-plus"></i> 添加数据集
      </el-button>
    </div>

    <el-table :data="datasets" style="width: 100%">
      <el-table-column prop="name" label="名称" width="200"></el-table-column>
      <el-table-column label="数据源" width="180">
        <template #default="scope">
          {{ getDatasourceName(scope.row.datasource_id) }}
        </template>
      </el-table-column>
      <el-table-column prop="refresh_interval" label="刷新间隔(秒)" width="120"></el-table-column>
      <el-table-column prop="description" label="描述"></el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="editDataset(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteDataset(scope.row)">删除</el-button>
          <el-button size="small" type="success" @click="handlePreview(scope.row)">预览</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showCreateDialog" :title="editingDataset ? '编辑数据集' : '添加数据集'" width="700px">
      <el-form :model="currentDataset" :rules="rules" ref="datasetForm" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="currentDataset.name" placeholder="请输入数据集名称"></el-input>
        </el-form-item>
        <el-form-item label="数据源" prop="datasource_id">
          <el-select v-model="currentDataset.datasource_id" placeholder="请选择数据源">
            <el-option 
              v-for="ds in datasources" 
              :key="ds.id" 
              :label="ds.name" 
              :value="ds.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="查询配置" prop="query_config">
          <el-input 
            type="textarea" 
            v-model="queryJson" 
            placeholder='{"query": "SELECT * FROM table_name", "type": "table"}'
            :rows="6"
          ></el-input>
        </el-form-item>
        <el-form-item label="刷新间隔" prop="refresh_interval">
          <el-input-number v-model="currentDataset.refresh_interval" :min="10" :max="3600"></el-input-number>
          <span style="margin-left: 10px; color: #999;">秒</span>
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="currentDataset.description" placeholder="请输入描述"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelEdit">取消</el-button>
        <el-button type="success" @click="previewBeforeSave">预览</el-button>
        <el-button type="primary" @click="saveDataset">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showPreviewDialog" title="数据预览" width="80%">
      <el-table :data="previewData" style="width: 100%" max-height="400">
        <el-table-column 
          v-for="column in previewColumns" 
          :key="column.prop" 
          :prop="column.prop" 
          :label="column.label"
        ></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  name: 'DataSets',
  data() {
    return {
      showCreateDialog: false,
      showPreviewDialog: false,
      editingDataset: null,
      currentDataset: {
        name: '',
        datasource_id: '',
        query_config: {},
        refresh_interval: 300,
        description: ''
      },
      queryJson: '',
      previewData: [],
      previewColumns: [],
      rules: {
        name: [{ required: true, message: '请输入数据集名称', trigger: 'blur' }],
        datasource_id: [{ required: true, message: '请选择数据源', trigger: 'change' }],
        query_config: [{ required: true, message: '请输入查询配置', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapState(['datasets', 'datasources']),
    ...mapGetters(['getDatasourceById'])
  },
  methods: {
    ...mapActions(['fetchDatasets', 'fetchDatasources']),
    getDatasourceName(datasourceId) {
      const ds = this.getDatasourceById(datasourceId)
      return ds ? ds.name : '未知'
    },
    async saveDataset() {
      try {
        this.$refs.datasetForm.validate()
        this.currentDataset.query_config = JSON.parse(this.queryJson)
        
        const url = this.editingDataset 
          ? `http://localhost:8000/api/datasets/${this.editingDataset.id}`
          : 'http://localhost:8000/api/datasets'
        
        const method = this.editingDataset ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.currentDataset)
        })
        
        if (response.ok) {
          this.$message.success(this.editingDataset ? '更新成功' : '创建成功')
          this.cancelEdit()
          this.fetchDatasets()
        }
      } catch (error) {
        if (error.message.includes('JSON')) {
          this.$message.error('查询配置格式错误，请输入有效的JSON格式')
        } else {
          this.$message.error('保存失败')
        }
      }
    },
    async deleteDataset(dataset) {
      try {
        await this.$confirm('确定删除这个数据集吗？', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`http://localhost:8000/api/datasets/${dataset.id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          this.$message.success('删除成功')
          this.fetchDatasets()
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },
    editDataset(dataset) {
      this.editingDataset = dataset
      this.currentDataset = { ...dataset }
      this.queryJson = JSON.stringify(dataset.query_config, null, 2)
      this.showCreateDialog = true
    },
    async handlePreview(dataset) {
      try {
        const response = await fetch(`http://localhost:8000/api/datasets/${dataset.id}/data`)
        if (response.ok) {
          const result = await response.json()
          
          let data = result
          if (!Array.isArray(data)) {
            data = [data]
          }
          
          this.previewData = data
          if (this.previewData.length > 0 && typeof this.previewData[0] === 'object') {
            this.previewColumns = Object.keys(this.previewData[0]).map(key => ({
              prop: key,
              label: key
            }))
          } else {
            this.previewColumns = [{ prop: 'value', label: 'Value' }]
          }
          this.showPreviewDialog = true
        } else {
          const error = await response.json()
          this.$message.error(error.detail || '获取数据失败')
        }
      } catch (error) {
        this.$message.error('获取数据失败: ' + error.message)
      }
    },
    async previewBeforeSave() {
      try {
        this.currentDataset.query_config = JSON.parse(this.queryJson)
        const response = await fetch('http://localhost:8000/api/datasets/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.currentDataset)
        })
        
        if (response.ok) {
          const result = await response.json()
          let data = result
          if (!Array.isArray(data)) {
            data = [data]
          }
          
          this.previewData = data
          if (this.previewData.length > 0 && typeof this.previewData[0] === 'object') {
            this.previewColumns = Object.keys(this.previewData[0]).map(key => ({
              prop: key,
              label: key
            }))
          } else {
            this.previewColumns = [{ prop: 'value', label: 'Value' }]
          }
          this.showPreviewDialog = true
        } else {
          const error = await response.json()
          this.$message.error(error.detail || '预览失败')
        }
      } catch (error) {
        this.$message.error('预览失败: ' + error.message)
      }
    },
    cancelEdit() {
      this.showCreateDialog = false
      this.editingDataset = null
      this.currentDataset = {
        name: '',
        datasource_id: '',
        query_config: {},
        refresh_interval: 300,
        description: ''
      }
      this.queryJson = ''
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    }
  },
  mounted() {
    this.fetchDatasets()
    this.fetchDatasources()
  }
}
</script>

<style scoped>
.datasets-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>