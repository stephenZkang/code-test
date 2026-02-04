<template>
  <div class="metric-widget">
    <div class="widget-header">
      <h3>{{ config.title || '指标' }}</h3>
    </div>
    <div class="metric-content" :class="{ 'circle-style': config.circleStyle }">
      <div class="metric-label" v-if="displayLabel && !config.circleStyle">
        {{ displayLabel }}
      </div>
      <div class="metric-value-container">
        <div class="metric-value" :style="{ color: config.valueColor || '#00d2ff' }">
          {{ formatValue(displayValue) }}
        </div>
        <div class="metric-label-inner" v-if="displayLabel && config.circleStyle">
          {{ displayLabel }}
        </div>
      </div>
      <div class="metric-unit" v-if="config.unit || (config.suffix && !config.circleStyle)">
        {{ config.unit || config.suffix }}
      </div>
      <div class="metric-trend" v-if="trendValue !== null">
        <i :class="trendIcon" :style="{ color: trendColor }"></i>
        <span :style="{ color: trendColor }">{{ Math.abs(trendValue) }}%</span>
        <span class="trend-text">较上期</span>
      </div>
      <div class="metric-description" v-if="config.description">
        {{ config.description }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MetricWidget',
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
    displayValue() {
      if (Array.isArray(this.data) && this.data.length > 0) {
        const item = this.data[0]
        return item.value || item.count || item.total || 0
      } else if (this.data && typeof this.data === 'object') {
        return this.data.value || 0
      }
      return this.config.value || 0
    },
    displayLabel() {
      if (Array.isArray(this.data) && this.data.length > 0) {
        return this.data[0].label || ''
      } else if (this.data && typeof this.data === 'object') {
        return this.data.label || ''
      }
      return this.config.label || ''
    },
    trendValue() {
      if (this.data.length > 0 && this.data[0].trend !== undefined) {
        return this.data[0].trend
      }
      return null
    },
    trendIcon() {
      if (this.trendValue > 0) {
        return 'el-icon-top'
      } else if (this.trendValue < 0) {
        return 'el-icon-bottom'
      }
      return 'el-icon-minus'
    },
    trendColor() {
      if (this.trendValue > 0) {
        return this.config.positiveColor || '#52c41a'
      } else if (this.trendValue < 0) {
        return this.config.negativeColor || '#ff4d4f'
      }
      return '#999'
    }
  },
  methods: {
    formatValue(value) {
      if (this.config.format === 'currency') {
        return new Intl.NumberFormat('zh-CN', {
          style: 'currency',
          currency: 'CNY'
        }).format(value)
      } else if (this.config.format === 'percentage') {
        return `${value}%`
      } else if (this.config.format === 'number') {
        return new Intl.NumberFormat('zh-CN').format(value)
      }
      
      if (value >= 10000) {
        return (value / 10000).toFixed(1) + '万'
      } else if (value >= 100000000) {
        return (value / 100000000).toFixed(1) + '亿'
      }
      
      return value.toString()
    }
  }
}
</script>

<style scoped>
.metric-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;
  color: #fff;
  padding: 15px;
}

.widget-header {
  margin-bottom: 10px;
}

.widget-header h3 {
  margin: 0;
  font-size: 14px;
  color: #00d2ff;
  opacity: 0.8;
}

.metric-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.metric-value-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.circle-style .metric-value-container {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 2px solid rgba(0, 210, 255, 0.3);
  background: radial-gradient(circle, rgba(0, 210, 255, 0.1) 0%, transparent 70%);
  box-shadow: 0 0 20px rgba(0, 210, 255, 0.2), inset 0 0 20px rgba(0, 210, 255, 0.1);
}

.metric-label {
  font-size: 1.2rem;
  color: #fff;
  margin-bottom: 10px;
}

.metric-label-inner {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 5px;
}

.metric-value {
  font-size: 2.8rem;
  font-weight: bold;
  line-height: 1.2;
  color: #00d2ff;
  text-shadow: 0 0 15px rgba(0, 210, 255, 0.5);
}

.metric-unit {
  font-size: 18px;
  opacity: 0.8;
  margin-bottom: 15px;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  margin-bottom: 10px;
}

.trend-text {
  opacity: 0.7;
}

.metric-description {
  font-size: 12px;
  opacity: 0.7;
  line-height: 1.4;
}
</style>