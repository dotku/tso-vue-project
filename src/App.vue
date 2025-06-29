<script setup>
import { provide } from 'vue'
import { ElConfigProvider } from 'element-plus'
</script>

<template>
  <el-config-provider>
    <router-view />
  </el-config-provider>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

#app {
  height: 100%;
}
</style>
