<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div>
    <header>
      <nav class="c-link-primary">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/css">About</RouterLink>
      </nav>
    </header>

    <div class="main">
      <RouterView />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main {
  padding: 30px;
  height: calc(100vh - 40px);

  & > * {
    height: 100%;
  }
}
</style>
