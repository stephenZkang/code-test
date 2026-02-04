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
        </el-menu>
      </el-header>
      <el-main class="main-content" :class="{ 'no-header': hideNav }">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    hideNav() {
      return this.$route.meta && this.$route.meta.hideNav
    }
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