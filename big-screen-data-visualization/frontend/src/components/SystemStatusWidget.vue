<template>
  <div class="system-status-widget">
    <div class="widget-header">
      <h3>{{ config.title || '系统状态' }}</h3>
    </div>
    <div class="status-container">
      <div class="status-item">
        <v-chart :option="cpuOption" autoresize />
        <div class="status-label">CPU 使用率</div>
      </div>
      <div class="status-item">
        <v-chart :option="memoryOption" autoresize />
        <div class="status-label">内存使用率</div>
      </div>
    </div>
    <div class="status-details" v-if="stats">
      <div class="detail-row">
        <span>磁盘已用:</span>
        <span>{{ stats.disk.usage_percent }}%</span>
      </div>
      <div class="detail-row">
        <span>CPU 核心:</span>
        <span>{{ stats.cpu.cores }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GaugeChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import axios from 'axios'

use([CanvasRenderer, GaugeChart, TitleComponent, TooltipComponent])

export default {
  name: 'SystemStatusWidget',
  components: {
    VChart
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      stats: null,
      timer: null
    }
  },
  computed: {
    cpuOption() {
      return this.getGaugeOption(this.stats?.cpu.usage || 0, '#00ffee')
    },
    memoryOption() {
      return this.getGaugeOption(this.stats?.memory.usage_percent || 0, '#bf5af2')
    }
  },
  mounted() {
    this.fetchStats()
    this.timer = setInterval(this.fetchStats, 5000)
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    async fetchStats() {
      try {
        const response = await axios.get('http://localhost:8000/api/system/stats')
        this.stats = response.data
      } catch (error) {
        console.error('Failed to fetch system stats:', error)
      }
    },
    getGaugeOption(value, color) {
      return {
        series: [
          {
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 100,
            splitNumber: 5,
            itemStyle: {
              color: color,
              shadowColor: color,
              shadowBlur: 10
            },
            progress: {
              show: true,
              width: 8
            },
            pointer: {
              show: false
            },
            axisLine: {
              lineStyle: {
                width: 8,
                color: [[1, 'rgba(255, 255, 255, 0.1)']]
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            detail: {
              valueAnimation: true,
              fontSize: 18,
              offsetCenter: [0, '20%'],
              formatter: '{value}%',
              color: color
            },
            data: [
              {
                value: value
              }
            ]
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
.system-status-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
  color: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.widget-header {
  padding: 10px;
  background: #16213e;
  border-bottom: 1px solid #0f3460;
}

.widget-header h3 {
  margin: 0;
  font-size: 14px;
}

.status-container {
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px;
}

.status-item {
  width: 45%;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-label {
  font-size: 12px;
  margin-top: -20px;
  color: #999;
}

.status-details {
  padding: 10px;
  font-size: 12px;
  background: #16213e;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
</style>
