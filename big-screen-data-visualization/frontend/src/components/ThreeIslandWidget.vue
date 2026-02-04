<template>
  <div class="three-island-widget" ref="container">
    <div class="widget-header">
      <h3>{{ config.title || '3D 悬浮数字岛' }}</h3>
    </div>
    <div class="canvas-container" ref="canvasContainer">
      <div 
        v-if="hoverInfo.show" 
        class="floating-tooltip" 
        :style="{ left: hoverInfo.x + 'px', top: hoverInfo.y + 'px' }"
      >
        <div class="tooltip-title">{{ hoverInfo.name }}</div>
        <div class="tooltip-content">{{ hoverInfo.desc }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const props = defineProps({
  config: { type: Object, default: () => ({}) },
  data: { type: [Array, Object], default: () => [] }
})

const emit = defineEmits(['region-click'])

const container = ref(null)
const canvasContainer = ref(null)
let scene, camera, renderer, animationId, controls
let islands = []

const islandData = [
  { name: '核心数枢岛', color: 0x00d2ff, desc: '大数据中心，算力调度枢纽', pos: [0, 0, 0], radius: 25 },
  { name: '云端存储岛', color: 0x73d13d, desc: '高可用冷热数据混合存储区', pos: [-50, 20, -30], radius: 15 },
  { name: '安全防护岛', color: 0xff4d4f, desc: '全天候安全监测与攻防演练基地', pos: [50, -10, 30], radius: 18 }
]

const hoverInfo = reactive({ show: false, name: '', desc: '', x: 0, y: 0 })

const initThree = () => {
  if (!canvasContainer.value) return
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x00050a)
  
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
  camera.position.set(100, 100, 100)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  canvasContainer.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  const onMouseMove = (event) => {
    const rect = canvasContainer.value.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(islands)
    if (intersects.length > 0) {
      const target = intersects[0].object
      hoverInfo.show = true
      hoverInfo.name = target.userData.name
      hoverInfo.desc = target.userData.desc
      hoverInfo.x = event.clientX - rect.left + 15
      hoverInfo.y = event.clientY - rect.top + 15
      canvasContainer.value.style.cursor = 'pointer'
    } else {
      hoverInfo.show = false
      canvasContainer.value.style.cursor = 'default'
    }
  }

  canvasContainer.value.addEventListener('mousemove', onMouseMove)
  canvasContainer.value.addEventListener('click', () => {
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(islands)
    if (intersects.length > 0) emit('region-click', intersects[0].object.userData.name)
  })

  scene.add(new THREE.AmbientLight(0xffffff, 0.3))
  const dl = new THREE.DirectionalLight(0x00d2ff, 1.5)
  dl.position.set(1, 1, 1)
  scene.add(dl)

  createIslands()

  const animate = () => {
    animationId = requestAnimationFrame(animate)
    controls.update()
    
    // Floating effect
    islands.forEach((island, i) => {
      island.position.y += Math.sin(Date.now() * 0.001 + i) * 0.05
    })
    
    renderer.render(scene, camera)
  }
  animate()
}

const createIslands = () => {
  islandData.forEach(data => {
    const geo = new THREE.CylinderGeometry(data.radius, data.radius * 0.8, 5, 32)
    const mat = new THREE.MeshPhongMaterial({ color: data.color, transparent: true, opacity: 0.8, emissive: data.color, emissiveIntensity: 0.2 })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(...data.pos)
    mesh.userData = { name: data.name, desc: data.desc }
    scene.add(mesh)
    islands.push(mesh)
    
    // Tech rings
    const ringGeo = new THREE.TorusGeometry(data.radius + 5, 0.5, 16, 100)
    const ringMat = new THREE.MeshBasicMaterial({ color: data.color, transparent: true, opacity: 0.4 })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 2
    mesh.add(ring)
  })
}

onMounted(() => setTimeout(() => initThree(), 100))
onBeforeUnmount(() => cancelAnimationFrame(animationId))
</script>

<style scoped>
.three-island-widget { width: 100%; height: 100%; display: flex; flex-direction: column; background: #00050a; position: relative; }
.widget-header { padding: 10px; background: rgba(0, 191, 255, 0.1); border-bottom: 1px solid rgba(0, 191, 255, 0.2); }
.widget-header h3 { margin: 0; font-size: 14px; color: #00d2ff; }
.canvas-container { flex: 1; position: relative; overflow: hidden; }
.floating-tooltip { position: absolute; pointer-events: none; background: rgba(0, 21, 41, 0.9); border: 1px solid #00d2ff; border-radius: 4px; padding: 8px 12px; color: #fff; z-index: 100; box-shadow: 0 0 10px rgba(0, 210, 255, 0.5); }
.tooltip-title { font-weight: bold; color: #00d2ff; margin-bottom: 4px; }
.tooltip-content { font-size: 12px; opacity: 0.8; white-space: nowrap; }
</style>
