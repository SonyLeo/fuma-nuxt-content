<template>
  <div class="fd-card-grid">
    <slot />
  </div>
</template>

<style scoped>
.fd-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin: 1.4rem 0;
}
</style>
