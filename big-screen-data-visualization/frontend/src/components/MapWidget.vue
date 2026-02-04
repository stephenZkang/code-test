<template>
  <div class="map-widget">
    <div class="widget-header">
      <h3>{{ config.title || '地图' }}</h3>
    </div>
    <div id="map" class="map-container"></div>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'MapWidget',
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
      map: null,
      markers: []
    }
  },
  mounted() {
    this.initMap()
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove()
    }
  },
  watch: {
    data: {
      handler() {
        this.updateMarkers()
      },
      deep: true
    }
  },
  methods: {
    initMap() {
      this.map = L.map('map').setView(
        this.config.center || [39.9042, 116.4074], 
        this.config.zoom || 5
      )

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map)

      this.updateMarkers()
    },
    updateMarkers() {
      this.markers.forEach(marker => {
        this.map.removeLayer(marker)
      })
      this.markers = []

      this.data.forEach(item => {
        if (item.lat && item.lng) {
          const marker = L.marker([item.lat, item.lng])
            .addTo(this.map)
            .bindPopup(item.name || item.title || '位置')
          
          this.markers.push(marker)
        }
      })
    }
  }
}
</script>

<style scoped>
.map-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.widget-header {
  padding: 10px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.widget-header h3 {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.map-container {
  flex: 1;
  min-height: 300px;
}
</style>