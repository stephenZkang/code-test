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
import { BarChart, LineChart, PieChart, ScatterChart, RadarChart, FunnelChart } from 'echarts/charts'
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
  RadarChart,
  FunnelChart,
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
        case 'radar':
          return this.getRadarOption(baseOption)
        case 'funnel':
          return this.getFunnelOption(baseOption)
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
      const isMultiSeries = Array.isArray(this.data[0]?.value)
      
      let series = []
      if (isMultiSeries) {
        const seriesNames = this.config.seriesNames || []
        const seriesCount = this.data[0].value.length
        for (let i = 0; i < seriesCount; i++) {
          series.push({
            name: seriesNames[i] || `Series ${i + 1}`,
            data: this.data.map(item => item.value[i]),
            type: 'bar',
            itemStyle: {
              color: (this.config.colors && this.config.colors[i]) || undefined
            }
          })
        }
      } else {
        series.push({
          data: this.data.map(item => item.value),
          type: 'bar',
          itemStyle: {
            color: this.config.color || '#1890ff'
          }
        })
      }

      return {
        ...baseOption,
        legend: isMultiSeries ? { show: true, bottom: 0, textStyle: { color: '#fff' } } : undefined,
        xAxis: {
          type: 'category',
          data: this.data.map(item => item.label || item.name),
          axisLabel: {
            rotate: this.config.rotate || 0,
            color: '#fff'
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#fff' },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
        },
        series: series
      }
    },
    getLineOption(baseOption) {
      const isMultiSeries = Array.isArray(this.data[0]?.value)
      
      let series = []
      if (isMultiSeries) {
        const seriesNames = this.config.seriesNames || []
        const seriesCount = this.data[0].value.length
        for (let i = 0; i < seriesCount; i++) {
          series.push({
            name: seriesNames[i] || `Series ${i + 1}`,
            data: this.data.map(item => item.value[i]),
            type: 'line',
            smooth: true,
            itemStyle: {
              color: (this.config.colors && this.config.colors[i]) || undefined
            }
          })
        }
      } else {
        series.push({
          data: this.data.map(item => item.value),
          type: 'line',
          smooth: true,
          itemStyle: {
            color: this.config.color || '#52c41a'
          },
          areaStyle: {
            opacity: 0.3
          }
        })
      }

      return {
        ...baseOption,
        legend: isMultiSeries ? { show: true, bottom: 0, textStyle: { color: '#fff' } } : undefined,
        xAxis: {
          type: 'category',
          data: this.data.map(item => item.label || item.name),
          axisLabel: { color: '#fff' }
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: '#fff' },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
        },
        series: series
      }
    },
    getPieOption(baseOption) {
      const isDonut = this.config.donut
      return {
        ...baseOption,
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          show: this.config.showLegend !== false,
          orient: 'vertical',
          left: 'left',
          textStyle: { color: '#fff' }
        },
        series: [{
          name: this.config.title,
          type: 'pie',
          radius: isDonut ? ['40%', '70%'] : '60%',
          center: ['60%', '50%'],
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
          },
          label: {
            color: '#fff'
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
    },
    getRadarOption(baseOption) {
      return {
        ...baseOption,
        radar: {
          indicator: this.data.map(item => ({ name: item.label || item.name, max: 100 })),
          center: ['50%', '60%'],
          radius: '60%'
        },
        series: [{
          name: this.config.title,
          type: 'radar',
          data: [
            {
              value: this.data.map(item => item.value),
              name: '指标数据'
            }
          ]
        }]
      }
    },
    getFunnelOption(baseOption) {
      return {
        ...baseOption,
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c}'
        },
        series: [
          {
            name: this.config.title,
            type: 'funnel',
            left: '10%',
            top: 60,
            bottom: 60,
            width: '80%',
            min: 0,
            max: 100,
            minSize: '0%',
            maxSize: '100%',
            sort: 'descending',
            gap: 2,
            label: {
              show: true,
              position: 'inside'
            },
            labelLine: {
              length: 10,
              lineStyle: {
                width: 1,
                type: 'solid'
              }
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1
            },
            emphasis: {
              label: {
                fontSize: 20
              }
            },
            data: this.data.map(item => ({
              name: item.label || item.name,
              value: item.value
            }))
          }
        ]
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