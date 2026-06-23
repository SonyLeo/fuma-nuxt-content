<script setup lang="ts">
const { data: page } = await useAsyncData('page-home', () => {
  return queryCollection('content').path('/').first()
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}
</script>

<template>
  <main class="docs-home">
    <section class="docs-home-hero">
      <p class="docs-home-kicker">Nuxt Content Sandbox</p>
      <h1 class="docs-home-title">Vue 文档站的下一轮基础骨架</h1>
      <p class="docs-home-description">
        这个沙盒现在已经从纯内容验证阶段，进入 docs shell 搭建阶段。
      </p>
    </section>

    <section class="docs-home-content">
      <ContentRenderer v-if="page" :value="page" />
    </section>
  </main>
</template>
