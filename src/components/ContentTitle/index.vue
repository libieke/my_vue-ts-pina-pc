
<template>
  <div>
    <div class="bg-white"><slot /></div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  padding: {
    type: Boolean,
    default: true,
  },
});
</script>

<style lang="scss" scoped>
.font-14 {
  margin: 0;
  height: 40px;
  line-height: 40px;
  color: #1d2129;
  font-family:
    Nunito Sans,
    serif;
  font-size: 14px;
}
.bg-white {
  min-height: calc(100vh - 90px);
}
</style>
