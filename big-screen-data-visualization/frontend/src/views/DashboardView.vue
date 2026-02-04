<template>
  <div class="dashboard-view" :class="{ 'fullscreen': fullscreen }" :style="dashboardStyle">
    <div class="dashboard-header" v-if="!fullscreen && !isShared">
      <el-select v-model="selectedDashboard" placeholder="选择大屏" @change="loadDashboard">
        <el-option 
          v-for="dashboard in dashboards" 
          :key="dashboard.id" 
          :label="dashboard.title" 
          :value="dashboard.id"
        ></el-option>
      </el-select>
      <div class="header-actions">
        <el-button @click="toggleFullscreen">
          <i :class="fullscreen ? 'el-icon-aim' : 'el-icon-full-screen'"></i>
          {{ fullscreen ? '退出全屏' : '全屏' }}
        </el-button>
        <el-button @click="refreshDashboard">
          <i class="el-icon-refresh"></i>
          刷新
        </el-button>
      </div>
    </div>

    <div class="dashboard-content" :class="{ 'shared-view': isShared || fullscreen }" v-if="currentDashboard">
      <div class="dashboard-title">
        <h1>{{ currentDashboard.title }}</h1>
        <div class="dashboard-time">{{ currentTime }}</div>
      </div>

      <grid-layout-plus
        v-model:layout="widgetLayout"
        :col-num="12"
        :row-height="60"
        :is-draggable="!fullscreen"
        :is-resizable="!fullscreen"
        :margin="[10, 10]"
        :use-css-transforms="true"
        class="widget-grid"
      >
        <grid-item-plus
          v-for="widget in widgets"
          :key="widget.id"
          :x="widget.position.x"
          :y="widget.position.y"
          :w="widget.position.w"
          :h="widget.position.h"
          :i="widget.id"
        >
          <div class="widget-container">
            <component 
              :is="getWidgetComponent(widget.type)"
              :config="widget.config"
              :data="getWidgetData(widget)"
              @region-click="handleLinkage"
              class="widget"
            />
          </div>
        </grid-item-plus>
      </grid-layout-plus>
    </div>

    <div v-else class="no-dashboard">
      <el-empty description="请选择一个大屏查看"></el-empty>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { GridLayout, GridItem } from 'grid-layout-plus'
import MapWidget from '../components/MapWidget.vue'
import ChartWidget from '../components/ChartWidget.vue'
import EChartsMapWidget from '../components/EChartsMapWidget.vue'
import ThreeCityWidget from '../components/ThreeCityWidget.vue'
import ThreeFactoryWidget from '../components/ThreeFactoryWidget.vue'
import ThreeMapWidget from '../components/ThreeMapWidget.vue'
import ThreeIslandWidget from '../components/ThreeIslandWidget.vue'
import TableWidget from '../components/TableWidget.vue'
import MetricWidget from '../components/MetricWidget.vue'
import SystemStatusWidget from '../components/SystemStatusWidget.vue'
import MatrixAlarmWidget from '../components/MatrixAlarmWidget.vue'

export default {
  name: 'DashboardView',
  components: {
    GridLayoutPlus: GridLayout,
    GridItemPlus: GridItem,
    MapWidget,
    EChartsMapWidget,
    ThreeCityWidget,
    ThreeFactoryWidget,
    ThreeMapWidget,
    ThreeIslandWidget,
    ChartWidget,
    TableWidget,
    MetricWidget,
    SystemStatusWidget,
    MatrixAlarmWidget
  },
  data() {
    return {
      selectedDashboard: null,
      currentDashboard: null,
      widgets: [],
      widgetLayout: [],
      widgetData: {},
      linkageRegion: null,
      fullscreen: false,
      currentTime: '',
      timer: null,
      refreshTimer: null
    }
  },
  computed: {
    ...mapState(['dashboards']),
    dashboardStyle() {
      if (this.currentDashboard && this.currentDashboard.layout_config && this.currentDashboard.layout_config.backgroundImage) {
        return {
          backgroundImage: `url(${this.currentDashboard.layout_config.backgroundImage})`,
          backgroundSize: this.currentDashboard.layout_config.backgroundSize || 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }
      }
      return {}
    },
    isShared() {
      return this.$route.name === 'DashboardShare'
    }
  },
  methods: {
    ...mapActions(['fetchDashboards']),
    async loadDashboard() {
      if (!this.selectedDashboard) return
      
      try {
        const response = await fetch(`http://localhost:8000/api/dashboards/${this.selectedDashboard}`)
        const dashboard = await response.json()
        
        this.currentDashboard = dashboard
        await this.loadWidgets()
      } catch (error) {
        this.$message.error('加载大屏失败')
      }
    },
    async loadWidgets() {
      if (!this.currentDashboard) return
      
      try {
        const response = await fetch(`http://localhost:8000/api/dashboards/${this.currentDashboard.id}/widgets`)
        const widgets = await response.json()
        
        this.widgets = widgets
        this.widgetLayout = widgets.map(widget => {
          const pos = typeof widget.position === 'string' ? JSON.parse(widget.position) : widget.position
          return {
            x: pos.x || 0,
            y: pos.y || 0,
            w: pos.w || 4,
            h: pos.h || 4,
            i: widget.id.toString()
          }
        })
        
        // Fetch data for each widget
        widgets.forEach(widget => {
          if (widget.dataset_id) {
            this.fetchWidgetData(widget)
          }
        })
      } catch (error) {
        console.error('加载组件失败:', error)
      }
    },
    async fetchWidgetData(widget) {
      try {
        console.log(`Fetching data for widget ${widget.id}, dataset ${widget.dataset_id}`)
        let url = `http://localhost:8000/api/datasets/${widget.dataset_id}/data`
        
        // Inject linkage filter if applicable
        if (this.linkageRegion && widget.type !== 'map' && widget.type !== 'echarts_map') {
          url += `?region=${encodeURIComponent(this.linkageRegion)}`
        }

        const response = await fetch(url)
        const data = await response.json()
        console.log(`Data for widget ${widget.id}:`, data)
        this.widgetData = { ...this.widgetData, [widget.id]: data }
      } catch (error) {
        console.error(`Failed to fetch data for widget ${widget.id}:`, error)
      }
    },
    handleLinkage(region) {
      console.log('Linkage triggered for region:', region)
      this.linkageRegion = region
      // Refresh all widgets data to reflect the filter
      this.widgets.forEach(widget => {
        if (widget.dataset_id && widget.type !== 'map' && widget.type !== 'echarts_map') {
          this.fetchWidgetData(widget)
        }
      })
    },
    getWidgetComponent(type) {
      const componentMap = {
        map: 'MapWidget',
        echarts_map: 'EChartsMapWidget',
        three_city: 'ThreeCityWidget',
        three_factory: 'ThreeFactoryWidget',
        three_map: 'ThreeMapWidget',
        three_island: 'ThreeIslandWidget',
        chart: 'ChartWidget',
        table: 'TableWidget',
        metric: 'MetricWidget',
        system_status: 'SystemStatusWidget',
        matrix_alarm: 'MatrixAlarmWidget'
      }
      return componentMap[type] || 'div'
    },
    getWidgetData(widget) {
      return this.widgetData[widget.id] || []
    },
    toggleFullscreen() {
      this.fullscreen = !this.fullscreen
      if (this.fullscreen) {
        document.documentElement.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    },
    refreshDashboard() {
      this.loadWidgets()
      this.$message.success('刷新成功')
    },
    updateTime() {
      this.currentTime = new Date().toLocaleString()
    }
  },
  mounted() {
    this.fetchDashboards()
    
    const dashboardId = this.$route.params.id
    if (dashboardId) {
      this.selectedDashboard = parseInt(dashboardId)
      this.loadDashboard()
    }
    
    this.updateTime()
    this.timer = setInterval(this.updateTime, 1000)

    if (this.isShared) {
      this.refreshTimer = setInterval(() => {
        this.loadWidgets()
      }, 10000)
    }
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
  }
}
</script>

<style scoped>
.dashboard-view {
  height: 100vh;
  background: #0b0f1a;
  color: #fff;
}

.dashboard-view.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
}

.dashboard-header {
  background: rgba(26, 35, 58, 0.8);
  backdrop-filter: blur(10px);
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0, 191, 255, 0.2);
}

.dashboard-content {
  padding: 15px;
  height: calc(100vh - 60px);
  overflow: auto;
}

.dashboard-content.shared-view {
  height: 100vh;
}

.dashboard-title {
  text-align: center;
  margin-bottom: 15px;
}

.dashboard-title h1 {
  font-size: 2.5em;
  margin: 0;
  color: #00d2ff;
  text-shadow: 0 0 20px rgba(0, 210, 255, 0.8), 0 0 40px rgba(0, 210, 255, 0.4);
  letter-spacing: 6px;
  font-weight: bold;
}

.dashboard-time {
  font-size: 1.1em;
  color: #00d2ff;
  opacity: 0.8;
  margin-top: 5px;
}

.widget-grid {
  min-height: 500px;
}

.widget-container {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 191, 255, 0.1);
  box-shadow: inset 0 0 15px rgba(0, 191, 255, 0.05);
  border-radius: 4px;
  overflow: hidden;
}

.widget {
  width: 100%;
  height: 100%;
}

.no-dashboard {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}

.header-actions {
  display: flex;
  gap: 10px;
}
</style>