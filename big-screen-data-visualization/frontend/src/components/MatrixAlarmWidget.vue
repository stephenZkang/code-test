<template>
  <div class="matrix-alarm-widget" :class="currentLevel">
    <canvas ref="matrixCanvas" class="matrix-canvas"></canvas>
    <div class="overlay">
      <div class="widget-header">
        <h3>{{ config.title || '系统告警中心' }}</h3>
        <div class="system-time">{{ currentTime }}</div>
      </div>
      <div class="alarm-list-wrapper" ref="scrollList">
        <transition-group name="alarm-list" tag="div" class="alarm-list">
          <div 
            v-for="alarm in alarms" 
            :key="alarm.id" 
            :class="['alarm-item', alarm.level]"
          >
            <div class="alarm-time">[{{ formatTime(alarm.created_at) }}]</div>
            <div class="alarm-message">{{ alarm.message }}</div>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'MatrixAlarmWidget',
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      alarms: [],
      timer: null,
      canvas: null,
      ctx: null,
      drops: [],
      fontSize: 14,
      columns: 0,
      animationFrame: null,
      currentTime: '',
      clockTimer: null,
      currentLevel: 'info'
    }
  },
  mounted() {
    this.initCanvas()
    this.fetchAlarms()
    this.timer = setInterval(this.fetchAlarms, 3000)
    
    this.updateClock()
    this.clockTimer = setInterval(this.updateClock, 1000)
    
    window.addEventListener('resize', this.initCanvas)
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer)
    if (this.clockTimer) clearInterval(this.clockTimer)
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame)
    window.removeEventListener('resize', this.initCanvas)
  },
  methods: {
    initCanvas() {
      this.canvas = this.$refs.matrixCanvas
      if (!this.canvas) return
      
      const container = this.canvas.parentElement
      this.canvas.width = container.offsetWidth
      this.canvas.height = container.offsetHeight
      
      this.ctx = this.canvas.getContext('2d')
      this.columns = Math.floor(this.canvas.width / this.fontSize)
      this.drops = new Array(this.columns).fill(1)
      
      if (this.animationFrame) cancelAnimationFrame(this.animationFrame)
      this.draw()
    },
    draw() {
      // Background with fade effect
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
      
      // Rain color based on level
      let color = '#0F0' // Default green
      if (this.currentLevel === 'critical') color = '#F00'
      else if (this.currentLevel === 'warning') color = '#F90'
      
      this.ctx.fillStyle = color
      this.ctx.font = this.fontSize + 'px monospace'
      
      for (let i = 0; i < this.drops.length; i++) {
        const text = String.fromCharCode(0x30A0 + Math.random() * 96)
        this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize)
        
        if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
          this.drops[i] = 0
        }
        
        this.drops[i]++
      }
      
      this.animationFrame = requestAnimationFrame(this.draw)
    },
    async fetchAlarms() {
      try {
        const response = await axios.get('http://localhost:8000/api/alarms/')
        this.alarms = response.data
        
        // Update current level
        if (this.alarms.some(a => a.level === 'critical')) {
          this.currentLevel = 'critical'
        } else if (this.alarms.some(a => a.level === 'warning')) {
          this.currentLevel = 'warning'
        } else {
          this.currentLevel = 'info'
        }
      } catch (error) {
        console.error('Failed to fetch alarms:', error)
      }
    },
    formatTime(dateStr) {
      const date = new Date(dateStr)
      return date.toLocaleTimeString([], { hour12: false })
    },
    updateClock() {
      this.currentTime = new Date().toLocaleTimeString([], { hour12: false })
    }
  }
}
</script>

<style scoped>
.matrix-alarm-widget {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  color: #0F0;
  font-family: 'Courier New', Courier, monospace;
  overflow: hidden;
  border: 1px solid #030;
  transition: border-color 0.5s;
}

.matrix-alarm-widget.critical {
  border-color: #F00;
  box-shadow: inset 0 0 20px rgba(255, 0, 0, 0.3);
}

.matrix-alarm-widget.warning {
  border-color: #F90;
  box-shadow: inset 0 0 20px rgba(255, 153, 0, 0.2);
}

.matrix-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.3;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(1px);
}

.widget-header {
  padding: 10px 15px;
  background: rgba(0, 40, 0, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #0F0;
}

.critical .widget-header {
  background: rgba(40, 0, 0, 0.8);
  border-color: #F00;
  color: #F00;
}

.warning .widget-header {
  background: rgba(40, 20, 0, 0.8);
  border-color: #F90;
  color: #F90;
}

.widget-header h3 {
  margin: 0;
  font-size: 16px;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 0 5px currentColor;
}

.system-time {
  font-size: 14px;
}

.alarm-list-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.alarm-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alarm-item {
  padding: 8px 12px;
  background: rgba(0, 20, 0, 0.6);
  border-left: 3px solid #0F0;
  font-size: 13px;
  animation: scanline 0.1s infinite;
  display: flex;
  gap: 10px;
}

.alarm-item.critical {
  background: rgba(50, 0, 0, 0.6);
  border-color: #F00;
  color: #F66;
  text-shadow: 0 0 5px #F00;
}

.alarm-item.warning {
  background: rgba(50, 25, 0, 0.6);
  border-color: #F90;
  color: #FC9;
}

.alarm-time {
  opacity: 0.7;
  white-space: nowrap;
}

.alarm-message {
  line-height: 1.4;
}

/* Animations */
.alarm-list-enter-active,
.alarm-list-leave-active {
  transition: all 0.5s ease;
}

.alarm-list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.alarm-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@keyframes scanline {
  0% { background: rgba(0, 20, 0, 0.6); }
  50% { background: rgba(0, 25, 0, 0.65); }
  100% { background: rgba(0, 20, 0, 0.6); }
}
</style>
