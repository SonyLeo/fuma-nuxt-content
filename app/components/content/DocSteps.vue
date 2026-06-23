<template>
  <div class="fd-steps">
    <slot />
  </div>
</template>

<style scoped>
.fd-steps {
  margin: 1.4rem 0;
}

.fd-steps :deep(ol) {
  list-style: none;
  counter-reset: step;
  padding: 0;
  margin: 0;
}

.fd-steps :deep(li) {
  position: relative;
  margin: 0;
  padding: 0 0 1.25rem 3rem;
  counter-increment: step;
}

.fd-steps :deep(li:not(:last-child))::after {
  content: '';
  position: absolute;
  left: 1rem;
  top: 2.25rem;
  width: 1px;
  bottom: 0.25rem;
  background: var(--docs-color-border-strong);
}

.fd-steps :deep(li)::before {
  content: counter(step);
  position: absolute;
  left: 0;
  top: 0.05rem;
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: var(--docs-color-primary-soft);
  color: var(--docs-color-primary);
  font-weight: 700;
}

.fd-steps :deep(li > p:first-child) {
  margin-top: 0;
}

.fd-steps :deep(li > p:last-child) {
  margin-bottom: 0;
}
</style>
