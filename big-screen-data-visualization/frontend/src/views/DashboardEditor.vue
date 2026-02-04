<template>
  <div class="dashboard-editor">
    <div class="editor-header">
      <div class="header-left">
        <el-button @click="goBack" icon="el-icon-back">返回</el-button>
        <span class="dashboard-title">{{ dashboard?.title || '未命名大屏' }}</span>
      </div>
      <div class="header-center">
        <div 
          v-for="item in availableWidgets" 
          :key="item.type"
          class="draggable-widget"
          draggable="true"
          @dragstart="handleDragStart(item)"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="saveDashboard" :loading="saving">保存</el-button>
      </div>
    </div>

    <div class="editor-main" v-loading="loading">
      <!-- 左侧：数据集库 -->
      <div class="dataset-sidebar">
        <div class="sidebar-header">
          <i class="el-icon-coin"></i>
          <span>数据集库</span>
        </div>
        <div class="dataset-list">
          <div 
            v-for="ds in datasets" 
            :key="ds.id" 
            class="dataset-item"
            :title="ds.description"
          >
            <div class="ds-info">
              <span class="ds-name">{{ ds.name }}</span>
              <span class="ds-type">{{ ds.query_config.type }}</span>
            </div>
            <el-button 
              type="text" 
              icon="el-icon-copy-document"
              @click="assignDatasetToActive(ds.id)"
              :disabled="!activeWidgetId"
            >绑定</el-button>
          </div>
        </div>
      </div>

      <!-- 中间：画布 -->
      <div 
        class="canvas-area"
        @dragover.prevent
        @drop="handleDrop"
      >
        <div class="canvas-grid-bg"></div>
        <grid-layout-plus
          v-model:layout="widgetLayout"
          :col-num="12"
          :row-height="60"
          :is-draggable="true"
          :is-resizable="true"
          :margin="[10, 10]"
          :use-css-transforms="true"
          class="widget-grid"
        >
          <grid-item-plus
            v-for="item in widgetLayout"
            :key="item.i"
            :x="item.x"
            :y="item.y"
            :w="item.w"
            :h="item.h"
            :i="item.i"
            @moved="handleWidgetChange"
            @resized="handleWidgetChange"
          >
            <div 
              class="widget-wrapper" 
              :class="{ 'is-active': activeWidgetId === item.i }"
              @click.stop="selectWidget(item.i)"
            >
              <div class="widget-toolbar">
                <span class="widget-type-tag">{{ getWidgetLabel(item.type) }}</span>
                <div class="widget-actions">
                  <el-button 
                    type="text" 
                    icon="el-icon-delete" 
                    @click.stop="deleteWidget(item.i)"
                  ></el-button>
                </div>
              </div>
              <div class="widget-preview-box">
                <component 
                  :is="getWidgetComponent(item.type)"
                  :config="item.config"
                  :data="widgetData[item.i] || []"
                  :key="item.i + (item.dataset_id || '')"
                  class="widget-instance-preview"
                />
                <div v-if="!item.dataset_id" class="no-data-mask">
                  <i class="el-icon-link"></i>
                  <span>待绑定数据</span>
                </div>
              </div>
            </div>
          </grid-item-plus>
        </grid-layout-plus>
      </div>

      <!-- 右侧：属性配置 -->
      <div class="config-sidebar">
        <div v-if="activeWidget" class="config-panel">
          <div class="sidebar-header">
            <i class="el-icon-setting"></i>
            <span>配置面板</span>
          </div>
          <el-form label-position="top" size="small">
            <el-divider content-position="left">基础配置</el-divider>
            <el-form-item label="组件标题">
              <el-input v-model="activeWidget.config.title" placeholder="输入标题"></el-input>
            </el-form-item>
            
            <el-form-item label="数据绑定">
              <el-select v-model="activeWidget.dataset_id" placeholder="选择数据集" @change="handleWidgetChange" clearable>
                <el-option
                  v-for="ds in datasets"
                  :key="ds.id"
                  :label="ds.name"
                  :value="ds.id"
                ></el-option>
              </el-select>
            </el-form-item>

            <el-divider v-if="activeWidget.type === 'chart'" content-position="left">图表样式</el-divider>
            <template v-if="activeWidget.type === 'chart'">
              <el-form-item label="表现形式">
                <el-select v-model="activeWidget.config.type" @change="handleWidgetChange">
                  <el-option label="柱状图" value="bar"></el-option>
                  <el-option label="折线图" value="line"></el-option>
                  <el-option label="饼图" value="pie"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="主题色">
                <el-color-picker v-model="activeWidget.config.color" show-alpha></el-color-picker>
              </el-form-item>
            </template>

            <el-divider v-if="activeWidget.type === 'metric'" content-position="left">数值配置</el-divider>
            <template v-if="activeWidget.type === 'metric'">
              <el-form-item label="单位/后缀">
                <el-input v-model="activeWidget.config.unit" placeholder="例: % 或 人"></el-input>
              </el-form-item>
              <el-form-item label="数值颜色">
                <el-color-picker v-model="activeWidget.config.valueColor"></el-color-picker>
              </el-form-item>
            </template>
          </el-form>
        </div>
        <div v-else class="no-selection-hint">
          <i class="el-icon-mouse"></i>
          <p>请在画布中选中组件</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { GridLayout, GridItem } from 'grid-layout-plus'
import EChartsMapWidget from '../components/EChartsMapWidget.vue'
import ThreeCityWidget from '../components/ThreeCityWidget.vue'
import ThreeFactoryWidget from '../components/ThreeFactoryWidget.vue'
import ChartWidget from '../components/ChartWidget.vue'
import TableWidget from '../components/TableWidget.vue'
import MetricWidget from '../components/MetricWidget.vue'

export default {
  name: 'DashboardEditor',
  components: {
    GridLayoutPlus: GridLayout,
    GridItemPlus: GridItem,
    EChartsMapWidget,
    ThreeCityWidget,
    ThreeFactoryWidget,
    ChartWidget,
    TableWidget,
    MetricWidget
  },
  data() {
    return {
      dashboard: null,
      widgetLayout: [],
      widgetData: {},
      activeWidgetId: null,
      deletedWidgetIds: [],
      saving: false,
      loading: false,
      draggedItem: null,
      availableWidgets: [
        { type: 'echarts_map', label: '态势地图', icon: 'el-icon-map-location' },
        { type: 'three_city', label: '3D城市', icon: 'el-icon-office-building' },
        { type: 'three_factory', label: '3D工厂', icon: 'el-icon-set-up' },
        { type: 'chart', label: '数据图表', icon: 'el-icon-pie-chart' },
        { type: 'metric', label: '指标卡片', icon: 'el-icon-odometer' },
        { type: 'table', label: '数据表格', icon: 'el-icon-tickets' }
      ]
    }
  },
  computed: {
    ...mapState(['datasets']),
    activeWidget() {
      return this.widgetLayout.find(w => w.i === this.activeWidgetId)
    }
  },
  async mounted() {
    this.loading = true
    await this.fetchDatasets()
    await this.loadDashboard()
    this.loading = false
  },
  methods: {
    ...mapActions(['fetchDatasets']),
    async loadDashboard() {
      const id = this.$route.params.id
      if (!id) return
      try {
        const response = await fetch(`http://localhost:8000/api/dashboards/${id}`)
        if (!response.ok) throw new Error('Dashboard not found')
        this.dashboard = await response.json()
        
        const widgetsResponse = await fetch(`http://localhost:8000/api/dashboards/${id}/widgets`)
        const widgets = await widgetsResponse.json()
        
        if (!Array.isArray(widgets)) throw new Error('Invalid widgets data')

        this.widgetLayout = widgets.map(w => {
          const pos = typeof w.position === 'string' ? JSON.parse(w.position) : w.position
          return {
            x: pos.x || 0,
            y: pos.y || 0,
            w: pos.w || 4,
            h: pos.h || 4,
            i: w.id.toString(),
            type: w.type,
            dataset_id: w.dataset_id,
            config: typeof w.config === 'string' ? JSON.parse(w.config) : (w.config || {}),
            original_id: w.id 
          }
        })

        for (const w of this.widgetLayout) {
          if (w.dataset_id) {
            this.fetchWidgetData(w)
          }
        }
      } catch (error) {
        this.$message.error('加载大屏失败')
      }
    },
    async fetchWidgetData(widget) {
      if (!widget.dataset_id) {
        this.widgetData = { ...this.widgetData, [widget.i]: [] }
        return
      }
      try {
        const response = await fetch(`http://localhost:8000/api/datasets/${widget.dataset_id}/data`)
        const data = await response.json()
        this.widgetData = { ...this.widgetData, [widget.i]: data }
      } catch (error) {
        console.error('Failed to fetch widget data', error)
        this.widgetData = { ...this.widgetData, [widget.i]: [] }
      }
    },
    assignDatasetToActive(datasetId) {
      if (this.activeWidget) {
        this.activeWidget.dataset_id = datasetId
        this.handleWidgetChange()
      }
    },
    handleDragStart(item) {
      this.draggedItem = item
    },
    handleDrop(e) {
      if (!this.draggedItem) return
      
      const rect = e.currentTarget.getBoundingClientRect()
      const x = Math.min(Math.floor((e.clientX - rect.left) / (rect.width / 12)), 8)
      
      const newId = 'new_' + Date.now()
      const newWidget = {
        x,
        y: 0,
        w: 4,
        h: 4,
        i: newId,
        type: this.draggedItem.type,
        dataset_id: null,
        config: { title: '新建组件', type: 'bar' }
      }
      this.widgetLayout.push(newWidget)
      this.activeWidgetId = newId
      this.draggedItem = null
    },
    selectWidget(id) {
      this.activeWidgetId = id
    },
    getWidgetComponent(type) {
      const componentMap = {
        echarts_map: 'EChartsMapWidget',
        three_city: 'ThreeCityWidget',
        three_factory: 'ThreeFactoryWidget',
        chart: 'ChartWidget',
        table: 'TableWidget',
        metric: 'MetricWidget'
      }
      return componentMap[type] || 'div'
    },
    getWidgetLabel(type) {
      const found = this.availableWidgets.find(w => w.type === type)
      return found ? found.label : type
    },
    deleteWidget(id) {
      const index = this.widgetLayout.findIndex(w => w.i === id)
      if (index !== -1) {
        const widget = this.widgetLayout[index]
        if (widget.original_id) {
          this.deletedWidgetIds.push(widget.original_id)
        }
        this.widgetLayout.splice(index, 1)
        if (this.activeWidgetId === id) this.activeWidgetId = null
      }
    },
    handleWidgetChange() {
      if (this.activeWidget) {
        this.fetchWidgetData(this.activeWidget)
      }
    },
    async saveDashboard() {
      this.saving = true
      try {
        const dashboardId = this.dashboard.id
        
        for (const id of this.deletedWidgetIds) {
          await fetch(`http://localhost:8000/api/dashboards/widgets/${id}`, {
            method: 'DELETE'
          })
        }
        this.deletedWidgetIds = []

        for (const w of this.widgetLayout) {
          const widgetData = {
            type: w.type,
            dataset_id: w.dataset_id,
            config: w.config,
            position: { x: w.x, y: w.y, w: w.w, h: w.h }
          }
          
          if (w.i.toString().startsWith('new_')) {
            await fetch(`http://localhost:8000/api/dashboards/${dashboardId}/widgets`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(widgetData)
            })
          } else {
            await fetch(`http://localhost:8000/api/dashboards/widgets/${w.original_id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(widgetData)
            })
          }
        }
        
        this.$message.success('保存成功')
        await this.loadDashboard() 
      } catch (error) {
        this.$message.error('保存失败')
      } finally {
        this.saving = false
      }
    },
    goBack() {
      this.$router.push('/dashboards')
    }
  }
}
</script>

<style scoped>
.dashboard-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0b0f1a;
  color: #fff;
}

.editor-header {
  height: 60px;
  background: #1a233a;
  border-bottom: 1px solid rgba(0, 191, 255, 0.3);
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: space-between;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left .dashboard-title {
  color: #00d2ff;
  margin-left: 15px;
  font-size: 18px;
}

.header-center {
  display: flex;
  gap: 15px;
}

.draggable-widget {
  padding: 8px 12px;
  background: rgba(0, 191, 255, 0.1);
  border: 1px solid #00d2ff;
  border-radius: 4px;
  cursor: grab;
  color: #00d2ff;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  transition: all 0.3s;
}

.draggable-widget:hover {
  background: rgba(0, 191, 255, 0.2);
  box-shadow: 0 0 10px rgba(0, 191, 255, 0.4);
}

.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.dataset-sidebar, .config-sidebar {
  width: 260px;
  background: #141a2b;
  border-right: 1px solid rgba(0, 191, 255, 0.2);
  display: flex;
  flex-direction: column;
}

.config-sidebar {
  border-right: none;
  border-left: 1px solid rgba(0, 191, 255, 0.2);
  width: 300px;
}

.sidebar-header {
  padding: 15px;
  background: rgba(0, 191, 255, 0.05);
  border-bottom: 1px solid rgba(0, 191, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
  color: #00d2ff;
  font-weight: bold;
}

.dataset-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.dataset-item {
  padding: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ds-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ds-name {
  font-size: 13px;
  color: #fff;
}

.ds-type {
  font-size: 11px;
  color: #909399;
  background: rgba(144, 147, 153, 0.1);
  padding: 2px 5px;
  border-radius: 2px;
  align-self: flex-start;
}

.canvas-area {
  flex: 1;
  background: #0b0f1a;
  position: relative;
  overflow: auto;
  padding: 10px;
}

.canvas-grid-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(0, 191, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 191, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
}

.widget-wrapper {
  width: 100%;
  height: 100%;
  background: rgba(26, 35, 58, 0.4);
  border: 1px solid rgba(0, 191, 255, 0.2);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
  overflow: hidden;
}

.widget-wrapper.is-active {
  border: 2px solid #00d2ff;
  box-shadow: 0 0 15px rgba(0, 191, 255, 0.3);
}

.widget-toolbar {
  height: 28px;
  background: rgba(0, 191, 255, 0.1);
  padding: 0 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.widget-type-tag {
  font-size: 11px;
  color: #00d2ff;
}

.widget-preview-box {
  flex: 1;
  position: relative;
  background: #0b0f1a;
}

.widget-instance-preview {
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.no-data-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
}

.config-panel {
  padding: 0 15px;
}

:deep(.el-divider__text) {
  background-color: #141a2b;
  color: #00d2ff;
}

:deep(.el-form-item__label) {
  color: #909399 !important;
  padding-bottom: 5px !important;
}

:deep(.el-input__inner), :deep(.el-textarea__inner), :deep(.el-select .el-input__inner) {
  background-color: #1a233a !important;
  border-color: rgba(0, 191, 255, 0.2) !important;
  color: #fff !important;
}

.no-selection-hint {
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #5c6b8c;
  gap: 15px;
}

.no-selection-hint i {
  font-size: 40px;
}
</style>
