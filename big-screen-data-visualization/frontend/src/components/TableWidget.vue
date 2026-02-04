<template>
  <div class="table-widget">
    <div class="widget-header">
      <h3>{{ config.title || '数据表格' }}</h3>
      <div class="table-actions">
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索..." 
          prefix-icon="el-icon-search"
          size="small"
          style="width: 200px;"
          @input="filterData"
        ></el-input>
      </div>
    </div>
    <div class="table-container">
      <el-table 
        :data="filteredData" 
        style="width: 100%" 
        height="100%"
        stripe
        :header-row-style="{ backgroundColor: '#f5f7fa' }"
      >
        <el-table-column 
          v-for="column in columns" 
          :key="column.prop"
          :prop="column.prop" 
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth || 100"
          show-overflow-tooltip
        >
          <template #default="scope" v-if="column.formatter">
            <span v-html="column.formatter(scope.row[column.prop], scope.row)"></span>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination" v-if="config.pagination && total > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TableWidget',
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchKeyword: '',
      filteredData: [],
      currentPage: 1,
      pageSize: 20,
      total: 0
    }
  },
  computed: {
    columns() {
      if (this.config.columns) {
        return this.config.columns
      }
      
      if (Array.isArray(this.data) && this.data.length > 0) {
        return Object.keys(this.data[0]).map(key => ({
          prop: key,
          label: key,
          minWidth: 120
        }))
      }
      
      return []
    }
  },
  methods: {
    filterData() {
      if (!Array.isArray(this.data)) {
        this.filteredData = []
        return
      }
      if (!this.searchKeyword) {
        this.filteredData = [...this.data]
      } else {
        this.filteredData = this.data.filter(row => {
          return this.columns.some(column => {
            const value = row[column.prop]
            return value && value.toString().toLowerCase().includes(this.searchKeyword.toLowerCase())
          })
        })
      }
      
      this.total = this.filteredData.length
      this.currentPage = 1
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
    },
    handleCurrentChange(page) {
      this.currentPage = page
    }
  }
}
</script>

<style scoped>
.table-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.widget-header {
  padding: 10px;
  background: rgba(0, 191, 255, 0.05);
  border-bottom: 1px solid rgba(0, 191, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.widget-header h3 {
  margin: 0;
  font-size: 14px;
  color: #00d2ff;
}

.table-container {
  flex: 1;
  position: relative;
  min-height: 200px;
}

/* Element Plus table dark overrides */
:deep(.el-table) {
  background-color: transparent !important;
  color: #fff !important;
}
:deep(.el-table tr) {
  background-color: transparent !important;
}
:deep(.el-table th.el-table__cell) {
  background-color: rgba(0, 191, 255, 0.1) !important;
  color: #00d2ff !important;
}
:deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(0, 191, 255, 0.1) !important;
}
:deep(.el-table--striped .el-table__row--striped td.el-table__cell) {
  background-color: rgba(255, 255, 255, 0.02) !important;
}
:deep(.el-table__inner-wrapper::before) {
  display: none;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>