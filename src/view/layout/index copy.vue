
<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="200px">
        <sideBar />
      </el-aside>
      <el-container>
        <el-header>
          <headbar />
        </el-header>
        <el-main>Main</el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script lang="ts" setup></script>

<style scoped lang="scss">
.common-layout {
  width: 100%;
  height: 100%;
}
</style>
