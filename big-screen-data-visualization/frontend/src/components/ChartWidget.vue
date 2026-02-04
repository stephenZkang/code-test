<template>
  <div class="chart-widget">
    <div class="widget-header">
      <h3>{{ config.title || '图表' }}</h3>
    </div>
    <div class="chart-container">
      <v-chart 
        ref="chartRef"
        :option="chartOption" 
        :style="{ width: '100%', height: '100%' }"
        theme="dark"
        autoresize
      />
    </div>
  </div>
</template>

<script>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart, ScatterChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
])

export default {
  name: 'ChartWidget',
  components: {
    VChart
  },
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
  computed: {
    chartOption() {
      const type = this.config.type || 'bar'
      if (!Array.isArray(this.data)) {
        return {}
      }
      const baseOption = {
        title: {
          text: this.config.title,
          left: 'center',
          textStyle: {
            fontSize: 16,
            fontWeight: 'normal'
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          left: '10%',
          right: '10%',
          bottom: '15%',
          top: '15%'
        }
      }

      switch (type) {
        case 'bar':
          return this.getBarOption(baseOption)
        case 'line':
          return this.getLineOption(baseOption)
        case 'pie':
          return this.getPieOption(baseOption)
        case 'scatter':
          return this.getScatterOption(baseOption)
        default:
          return baseOption
      }
    }
  },
  watch: {
    'config.w': {
      handler() {
        this.$nextTick(() => {
          if (this.$refs.chartRef) this.$refs.chartRef.resize()
        })
      }
    },
    'config.h': {
      handler() {
        this.$nextTick(() => {
          if (this.$refs.chartRef) this.$refs.chartRef.resize()
        })
      }
    }
  },
  methods: {
    getBarOption(baseOption) {
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: this.data.map(item => item.label || item.name),
          axisLabel: {
            rotate: 45
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: this.data.map(item => item.value),
          type: 'bar',
          itemStyle: {
            color: this.config.color || '#1890ff'
          }
        }]
      }
    },
    getLineOption(baseOption) {
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: this.data.map(item => item.label || item.name)
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: this.data.map(item => item.value),
          type: 'line',
          smooth: true,
          itemStyle: {
            color: this.config.color || '#52c41a'
          },
          areaStyle: {
            opacity: 0.3
          }
        }]
      }
    },
    getPieOption(baseOption) {
      return {
        ...baseOption,
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        series: [{
          name: this.config.title,
          type: 'pie',
          radius: '60%',
          center: ['50%', '60%'],
          data: this.data.map(item => ({
            name: item.label || item.name,
            value: item.value
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }
    },
    getScatterOption(baseOption) {
      return {
        ...baseOption,
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: this.data.map(item => [item.x, item.y]),
          type: 'scatter',
          symbolSize: 8,
          itemStyle: {
            color: this.config.color || '#fa8c16'
          }
        }]
      }
    }
  }
}
</script>

<style scoped>
.chart-widget {
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
}

.widget-header h3 {
  margin: 0;
  font-size: 14px;
  color: #00d2ff;
}

.chart-container {
  flex: 1;
  min-height: 200px;
  background: transparent;
}
</style>