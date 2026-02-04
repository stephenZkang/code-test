<template>
  <div class="three-map-widget" ref="container">
    <div class="widget-header">
      <h3>{{ config.title || '3D 态势地图' }}</h3>
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
let regions = []

const regionData = [
  { name: '北方大区', color: 0x1890ff, desc: '重工业与能源基地', pos: [-30, 0, -20], size: [40, 2, 30] },
  { name: '南方大区', color: 0x52c41a, desc: '轻工业与高新技术产业带', pos: [20, 0, 30], size: [50, 2, 40] },
  { name: '中原大区', color: 0xfaad14, desc: '综合物流与农业核心', pos: [-5, 0, 5], size: [25, 2, 25] }
]

const hoverInfo = reactive({ show: false, name: '', desc: '', x: 0, y: 0 })

const initThree = () => {
  if (!canvasContainer.value) return
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x020a1a)
  
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
  camera.position.set(0, 120, 100)
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
    const intersects = raycaster.intersectObjects(regions)
    if (intersects.length > 0) {
      const target = intersects[0].object
      hoverInfo.show = true
      hoverInfo.name = target.userData.name
      hoverInfo.desc = target.userData.desc
      hoverInfo.x = event.clientX - rect.left + 15
      hoverInfo.y = event.clientY - rect.top + 15
      canvasContainer.value.style.cursor = 'pointer'
      regions.forEach(r => r.material.opacity = 0.6)
      target.material.opacity = 1.0
    } else {
      hoverInfo.show = false
      canvasContainer.value.style.cursor = 'default'
      regions.forEach(r => r.material.opacity = 0.6)
    }
  }

  const onClick = () => {
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(regions)
    if (intersects.length > 0) emit('region-click', intersects[0].object.userData.name)
  }

  canvasContainer.value.addEventListener('mousemove', onMouseMove)
  canvasContainer.value.addEventListener('click', onClick)

  scene.add(new THREE.AmbientLight(0xffffff, 0.6))
  const pl = new THREE.PointLight(0x00d2ff, 2)
  pl.position.set(0, 100, 50)
  scene.add(pl)

  const grid = new THREE.GridHelper(300, 30, 0x00d2ff, 0x051e3c)
  scene.add(grid)

  createMap()

  const animate = () => {
    animationId = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()
  window.addEventListener('resize', handleResize)
}

const createMap = () => {
  regionData.forEach(data => {
    const geo = new THREE.BoxGeometry(...data.size)
    const mat = new THREE.MeshPhongMaterial({ color: data.color, transparent: true, opacity: 0.6, shininess: 100 })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(...data.pos)
    mesh.userData = { name: data.name, desc: data.desc }
    scene.add(mesh)
    regions.push(mesh)
    
    // Add border
    const edges = new THREE.EdgesGeometry(geo)
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }))
    line.position.set(...data.pos)
    scene.add(line)
  })
}

const handleResize = () => {
  if (!canvasContainer.value || !renderer || !camera) return
  camera.aspect = canvasContainer.value.clientWidth / canvasContainer.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(canvasContainer.value.clientWidth, canvasContainer.value.clientHeight)
}

onMounted(() => setTimeout(() => initThree(), 100))
onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  if (renderer) renderer.dispose()
})
</script>

<style scoped>
.three-map-widget { width: 100%; height: 100%; display: flex; flex-direction: column; background: #020a1a; position: relative; }
.widget-header { padding: 10px; background: rgba(0, 191, 255, 0.1); border-bottom: 1px solid rgba(0, 191, 255, 0.2); }
.widget-header h3 { margin: 0; font-size: 14px; color: #00d2ff; }
.canvas-container { flex: 1; position: relative; overflow: hidden; }
.floating-tooltip { position: absolute; pointer-events: none; background: rgba(0, 21, 41, 0.9); border: 1px solid #00d2ff; border-radius: 4px; padding: 8px 12px; color: #fff; z-index: 100; box-shadow: 0 0 10px rgba(0, 210, 255, 0.5); }
.tooltip-title { font-weight: bold; color: #00d2ff; margin-bottom: 4px; }
.tooltip-content { font-size: 12px; opacity: 0.8; white-space: nowrap; }
</style>
