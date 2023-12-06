<script setup>
import PostMessager from './components/PostMessager.vue';

import { ref } from 'vue';

const title = ref('Pokerstars Integration')
</script>

<template>
  <div>
    {{ title }}
    <PostMessager></PostMessager>
  </div>
</template>

<style scoped>
</style>
