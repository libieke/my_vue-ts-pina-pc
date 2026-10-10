<template>
  <Result status="404" title="404" :sub-title="$t('notFound.subTitle')">
    <template #extra>
      <Button type="primary">
        <RouterLink to="/">{{ $t('notFound.backHome') }}</RouterLink>
      </Button>
    </template>
  </Result>
</template>

<script lang="ts" setup>
import { Result ,Button } from 'ant-design-vue';
</script>
