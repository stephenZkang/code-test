<template>
  <div class="three-factory-widget" ref="container">
    <div class="widget-header">
      <h3>{{ config.title || '工厂生产线 3D 态势' }}</h3>
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
let productionLines = []
const linesCount = 4

const lineConfigs = [
  { name: '生产线-1', color: 0x40a9ff, desc: 'A区：核心零部件组装流水线' },
  { name: '生产线-2', color: 0x73d13d, desc: 'B区：电子模组自动焊接线' },
  { name: '生产线-3', color: 0xffc53d, desc: 'C区：精细化表面处理单元' },
  { name: '生产线-4', color: 0xff4d4f, desc: 'D区：成品性能智能检测线' }
]

const hoverInfo = reactive({
  show: false,
  name: '',
  desc: '',
  x: 0,
  y: 0
})

const initThree = () => {
  if (!canvasContainer.value) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a0a)
  
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight
  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
  camera.position.set(100, 60, 100)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  canvasContainer.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  const onMouseMove = (event) => {
    const rect = canvasContainer.value.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(productionLines, true)

    if (intersects.length > 0) {
      let obj = intersects[0].object
      while (obj.parent && !obj.userData.lineName) { obj = obj.parent }
      const lineName = obj.userData.lineName
      const config = lineConfigs.find(c => c.name === lineName)
      
      if (config) {
        hoverInfo.show = true
        hoverInfo.name = config.name
        hoverInfo.desc = config.desc
        hoverInfo.x = event.clientX - rect.left + 15
        hoverInfo.y = event.clientY - rect.top + 15
        canvasContainer.value.style.cursor = 'pointer'
      }
    } else {
      hoverInfo.show = false
      canvasContainer.value.style.cursor = 'default'
    }
  }

  const onClick = () => {
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(productionLines, true)
    if (intersects.length > 0) {
      let obj = intersects[0].object
      while (obj.parent && !obj.userData.lineName) { obj = obj.parent }
      emit('region-click', obj.userData.lineName)
    }
  }

  canvasContainer.value.addEventListener('mousemove', onMouseMove)
  canvasContainer.value.addEventListener('click', onClick)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)
  const spotLight = new THREE.SpotLight(0xffffff, 2)
  spotLight.position.set(50, 100, 50)
  scene.add(spotLight)

  const gridHelper = new THREE.GridHelper(200, 20, 0x444444, 0x222222)
  scene.add(gridHelper)

  createLines()

  const animate = () => {
    animationId = requestAnimationFrame(animate)
    controls.update()
    productionLines.forEach((line, idx) => {
      line.children.forEach(child => {
        if (child.userData.isItem) {
          child.position.x += 0.1 * (idx + 1) * 0.4
          if (child.position.x > 40) child.position.x = -40
        }
      })
    })
    renderer.render(scene, camera)
  }
  animate()

  window.addEventListener('resize', handleResize)
}

const createLines = () => {
  productionLines.forEach(l => scene.remove(l))
  productionLines = []

  for (let i = 0; i < linesCount; i++) {
    const config = lineConfigs[i]
    const lineGroup = new THREE.Group()
    lineGroup.userData.lineName = config.name
    const zPos = (i - (linesCount-1)/2) * 40

    const beltGeo = new THREE.BoxGeometry(80, 2, 10)
    const beltMat = new THREE.MeshPhongMaterial({ color: 0x222222, emissive: config.color, emissiveIntensity: 0.1 })
    const belt = new THREE.Mesh(beltGeo, beltMat)
    belt.position.set(0, 1, zPos)
    lineGroup.add(belt)

    for (let j = 0; j < 3; j++) {
      const machineGeo = new THREE.BoxGeometry(12, 15, 15)
      const machineMat = new THREE.MeshPhongMaterial({ color: config.color, transparent: true, opacity: 0.8, emissive: config.color, emissiveIntensity: 0.2 })
      const machine = new THREE.Mesh(machineGeo, machineMat)
      machine.position.set(-30 + j * 30, 9, zPos)
      lineGroup.add(machine)
    }

    for (let k = 0; k < 6; k++) {
      const itemGeo = new THREE.BoxGeometry(4, 4, 4)
      const itemMat = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: config.color, emissiveIntensity: 0.5 })
      const item = new THREE.Mesh(itemGeo, itemMat)
      item.position.set(-40 + k * 15, 4, zPos)
      item.userData.isItem = true
      lineGroup.add(item)
    }

    scene.add(lineGroup)
    productionLines.push(lineGroup)
  }
}

const handleResize = () => {
  if (!canvasContainer.value || !renderer || !camera) return
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

onMounted(() => {
  setTimeout(() => initThree(), 100)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)
  if (renderer) {
    renderer.dispose()
    renderer.domElement.remove()
  }
})
</script>

<style scoped>
.three-factory-widget {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  background: #0a0a0a; position: relative;
}
.widget-header {
  padding: 10px; background: rgba(0, 191, 255, 0.1);
  border-bottom: 1px solid rgba(0, 191, 255, 0.2); z-index: 10;
}
.widget-header h3 { margin: 0; font-size: 14px; color: #00d2ff; }
.canvas-container { flex: 1; position: relative; overflow: hidden; }

.floating-tooltip {
  position: absolute; pointer-events: none;
  background: rgba(0, 21, 41, 0.9);
  border: 1px solid #00d2ff; border-radius: 4px;
  padding: 8px 12px; color: #fff; z-index: 100;
  box-shadow: 0 0 10px rgba(0, 210, 255, 0.5);
}
.tooltip-title { font-weight: bold; color: #00d2ff; margin-bottom: 4px; }
.tooltip-content { font-size: 12px; opacity: 0.8; white-space: nowrap; }
</style>
