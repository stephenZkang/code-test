<template>
  <div id="app">
    <el-container class="layout-container">
      <el-header class="header" v-if="!hideNav">
        <div class="logo">态势大屏系统</div>
        <el-menu
          mode="horizontal"
          :router="true"
          :default-active="$route.path"
          class="nav-menu"
        >
          <el-menu-item index="/dashboards">大屏管理</el-menu-item>
          <el-menu-item index="/datasources">数据源</el-menu-item>
          <el-menu-item index="/datasets">数据集</el-menu-item>
          <el-menu-item index="/dashboard-view">大屏展示</el-menu-item>
          <el-menu-item v-if="isAdmin" index="/users">用户管理</el-menu-item>
        </el-menu>
        <div class="user-info" v-if="currentUser">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              {{ currentUser.full_name || currentUser.username }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main-content" :class="{ 'no-header': hideNav }">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ArrowDown } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const store = useStore()

const hideNav = computed(() => route.meta && route.meta.hideNav)
const currentUser = computed(() => store.getters['auth/currentUser'])
const isAdmin = computed(() => store.getters['auth/isAdmin'])

const handleCommand = (command) => {
  if (command === 'logout') {
    store.dispatch('auth/logout')
    router.push('/login')
  } else if (command === 'changePassword') {
    router.push('/change-password')
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background: #f0f2f5;
}

#app {
  height: 100vh;
  overflow: hidden;
}

.layout-container {
  height: 100vh;
}

.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
}

.nav-menu {
  border-bottom: none;
  flex: 1;
  margin-left: 20px;
}

.user-info {
  margin-left: 20px;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
  display: flex;
  align-items: center;
}

.main-content {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

.main-content.no-header {
  padding: 0;
  height: 100vh;
}
</style>