<script setup lang="ts">
//
const sideVisible = ref(true)
</script>

<template>
  <div class="cont">
    <div class="top">
      <button class="primary" @click="() => (sideVisible = !sideVisible)">sideVisible</button>
    </div>
    <div class="body">
      <div class="c-btn"></div>
      <Transition name="slide">
        <div v-if="sideVisible" class="side">side</div>
      </Transition>
      <div class="content" :class="{ full: !sideVisible }">content</div>
    </div>

    <div class="footer">footer</div>
  </div>
</template>

<style lang="scss" scoped>
.cont {
  width: 100%;
  height: 100%;

  .top {
    background-color: antiquewhite;
    height: 40px;
  }

  .body {
    position: relative;
    display: flex;
    height: calc(100% - 80px);

    .side {
      position: absolute;
      width: 100px;
      height: 100%;
      background-color: aquamarine;
    }

    .content {
      position: absolute;
      width: calc(100% - 100px);
      margin-left: 100px;
      height: 100%;
      background-color: rgb(212 191 233);
      transition: all 0.3s ease;

      &.full {
        width: 100%;
        margin-left: 0;
      }
    }
  }

  .footer {
    background-color: beige;
    height: 40px;
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-40px);
  opacity: 0;
}
</style>
