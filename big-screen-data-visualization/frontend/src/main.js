import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// Suppress ResizeObserver loop limit exceeded error
const debounce = (fn, delay) => {
  let timer = null
  return function () {
    const context = this
    const args = arguments
    clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, delay)
  }
}

const _ResizeObserver = window.ResizeObserver
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
  constructor(callback) {
    callback = debounce(callback, 16)
    super(callback)
  }
}

// Additional guard for ResizeObserver error overlay
window.addEventListener('error', e => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications' || e.message === 'ResizeObserver loop limit exceeded') {
    const resizeObserverErrDiv = document.getElementById('webpack-dev-server-client-overlay-div')
    if (resizeObserverErrDiv) {
      resizeObserverErrDiv.setAttribute('style', 'display: none')
    }
    if (e.stopImmediatePropagation) {
      e.stopImmediatePropagation()
    }
  }
})

const app = createApp(App)

app.use(store)
app.use(router)
app.use(ElementPlus)

app.mount('#app')