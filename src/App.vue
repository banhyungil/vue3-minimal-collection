<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div>
    <header>
      <nav class="c-link-primary">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/errorHandler">ErrorHandler</RouterLink>
        <RouterLink to="/css">Css</RouterLink>
        <RouterLink to="/vuelify">Vuelify</RouterLink>
        <RouterLink to="/openLayer">openLayer</RouterLink>
      </nav>
    </header>

    <div class="main">
      <RouterView />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main {
  height: calc(100vh - 40px);
}
</style>
