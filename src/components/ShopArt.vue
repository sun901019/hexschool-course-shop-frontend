<script setup>
defineProps({ kind: { type: String, default: 'desk' } });
</script>

<template>
  <div class="shop-art" :data-kind="kind" aria-hidden="true">
    <span class="art-surface"></span>
    <span class="art-piece art-piece-main"></span>
    <span class="art-piece art-piece-small"></span>
  </div>
</template>
