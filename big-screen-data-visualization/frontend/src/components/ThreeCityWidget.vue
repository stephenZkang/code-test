<template>
  <div class="three-city-widget" ref="container">
    <div class="widget-header">
      <h3>{{ config.title || '智慧城市 3D 态势' }}</h3>
    </div>
    <div class="canvas-container" ref="canvasContainer">
      <!-- 悬浮提示框 -->
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
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const props = defineProps({
  config: {
    type: Object,
    default: () => ({})
  },
  data: {
    type: [Array, Object],
    default: () => []
  }
})

const emit = defineEmits(['region-click'])

const container = ref(null)
const canvasContainer = ref(null)
let scene, camera, renderer, animationId, controls
let buildings = []
const districts = [
  { name: '东城区', color: 0xff4d4f, desc: '核心政务区，历史文化底蕴深厚' },
  { name: '西城区', color: 0x40a9ff, desc: '金融管理中心，核心功能保障区' },
  { name: '朝阳区', color: 0x73d13d, desc: '国际交往中心，商务中心区(CBD)' },
  { name: '海淀区', color: 0xffc53d, desc: '全国科技创新中心，中关村所在地' },
  { name: '丰台区', color: 0x9254de, desc: '高精尖产业聚集区，南中轴商务区' },
  { name: '石景山区', color: 0xff7a45, desc: '新首钢高端产业综合服务区' }
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

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x050505)
  scene.fog = new THREE.FogExp2(0x050505, 0.002)

  // Camera
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.set(80, 80, 80)
  camera.lookAt(0, 0, 0)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  canvasContainer.value.appendChild(renderer.domElement)

  // OrbitControls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 20
  controls.maxDistance = 200
  controls.maxPolarAngle = Math.PI / 2.1

  // Raycaster for interaction
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  const onMouseMove = (event) => {
    const rect = canvasContainer.value.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(buildings)

    if (intersects.length > 0) {
      const target = intersects[0].object
      hoverInfo.show = true
      hoverInfo.name = target.userData.name
      hoverInfo.desc = target.userData.desc
      hoverInfo.x = event.clientX - rect.left + 15
      hoverInfo.y = event.clientY - rect.top + 15
      
      canvasContainer.value.style.cursor = 'pointer'
      buildings.forEach(b => {
        if (b.userData.name === target.userData.name) {
          b.material.emissiveIntensity = 0.6
        } else {
          b.material.emissiveIntensity = 0.2
        }
      })
    } else {
      hoverInfo.show = false
      canvasContainer.value.style.cursor = 'default'
      buildings.forEach(b => b.material.emissiveIntensity = 0.2)
    }
  }

  const onClick = () => {
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(buildings)
    if (intersects.length > 0) {
      emit('region-click', intersects[0].object.userData.name)
    }
  }

  canvasContainer.value.addEventListener('mousemove', onMouseMove)
  canvasContainer.value.addEventListener('click', onClick)

  // Lights
  const ambientLight = new THREE.AmbientLight(0x404040, 2)
  scene.add(ambientLight)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)

  // Floor
  const gridHelper = new THREE.GridHelper(200, 20, 0x444444, 0x222222)
  scene.add(gridHelper)

  createCity()

  const animate = () => {
    animationId = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()

  window.addEventListener('resize', handleResize)
}

const createCity = () => {
  buildings.forEach(b => scene.remove(b))
  buildings = []
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
  
  districts.forEach((item, index) => {
    const angle = (index / districts.length) * Math.PI * 2
    const radius = 45
    const districtX = Math.cos(angle) * radius
    const districtZ = Math.sin(angle) * radius

    for (let i = 0; i < 12; i++) {
      const height = Math.random() * 35 + 10
      const material = new THREE.MeshPhongMaterial({
        color: item.color,
        emissive: item.color,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.9
      })
      const building = new THREE.Mesh(boxGeometry, material)
      building.scale.set(7, height, 7)
      building.position.x = districtX + (Math.random() - 0.5) * 25
      building.position.z = districtZ + (Math.random() - 0.5) * 25
      building.position.y = height / 2
      building.userData = { name: item.name, desc: item.desc }
      scene.add(building)
      buildings.push(building)
    }
  })
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
.three-city-widget {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  background: #050505; position: relative;
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
