<script setup lang="ts"></script>

<template>
  <div class="c-css">
    <header>
      <nav class="c-link-primary">
        <RouterLink to="/css">레이아웃 애니메이션</RouterLink>
        <RouterLink to="/grid">그리드</RouterLink>
      </nav>
    </header>
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
.c-css {
  .c-link-primary {
    a {
      border: 1px solid #fff;
    }
  }
}
</style>
