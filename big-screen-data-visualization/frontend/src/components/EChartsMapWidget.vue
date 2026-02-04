<template>
  <div class="echarts-map-widget">
    <div class="widget-header">
      <h3>{{ config.title || '全国态势分布' }}</h3>
    </div>
    <div class="chart-container">
      <v-chart 
        ref="mapChart"
        :option="chartOption" 
        :style="{ width: '100%', height: '100%' }"
        autoresize
        @click="handleMapClick"
      />
    </div>
  </div>
</template>

<script>
import { use, registerMap } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { MapChart, EffectScatterChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  GeoComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  MapChart,
  EffectScatterChart,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  GeoComponent
])

export default {
  name: 'EChartsMapWidget',
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
  data() {
    return {
      mapLoaded: false
    }
  },
  computed: {
    chartOption() {
      if (!this.mapLoaded) return {}

      return {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            return `${params.name}<br/>业务量: ${params.value || 0}`
          }
        },
        visualMap: {
          min: 0,
          max: 1000,
          left: 'left',
          top: 'bottom',
          text: ['高', '低'],
          calculable: true,
          inRange: {
            color: ['#1a233a', '#00d2ff']
          },
          textStyle: {
            color: '#fff'
          }
        },
        geo: {
          map: 'china',
          roam: true,
          emphasis: {
            label: {
              show: true,
              color: '#fff'
            },
            itemStyle: {
              areaColor: '#f2d643'
            }
          },
          itemStyle: {
            areaColor: '#0b1c3d',
            borderColor: '#2ab8ff'
          }
        },
        series: [
          {
            name: '数据分布',
            type: 'map',
            geoIndex: 0,
            data: this.data.map(item => ({
              name: item.name || item.label,
              value: item.value
            }))
          }
        ]
      }
    }
  },
  watch: {
    'config.w': {
      handler() {
        this.$nextTick(() => {
          if (this.$refs.mapChart) this.$refs.mapChart.resize()
        })
      }
    },
    'config.h': {
      handler() {
        this.$nextTick(() => {
          if (this.$refs.mapChart) this.$refs.mapChart.resize()
        })
      }
    }
  },
  async mounted() {
    await this.loadMapData()
  },
  methods: {
    async loadMapData() {
      try {
        const response = await fetch('/data/china.json')
        const chinaJson = await response.json()
        registerMap('china', chinaJson)
        this.mapLoaded = true
      } catch (error) {
        console.error('Failed to load map data:', error)
      }
    },
    handleMapClick(params) {
      if (params.name) {
        this.$emit('region-click', params.name)
      }
    }
  }
}
</script>

<style scoped>
.echarts-map-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.widget-header {
  padding: 10px;
  background: rgba(0, 191, 255, 0.1);
  border-bottom: 1px solid rgba(0, 191, 255, 0.2);
}

.widget-header h3 {
  margin: 0;
  font-size: 14px;
  color: #00d2ff;
}

.chart-container {
  flex: 1;
  min-height: 300px;
}
</style>
