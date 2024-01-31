<script setup lang="ts"></script>

<template>
  <div class="cont">
    <div class="top">top</div>
    <div class="body">
      <div class="side">side</div>
      <div class="content">content</div>
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
    display: flex;
    background-color: aqua;
    height: calc(100% - 80px);

    .side {
      width: 100px;
      background-color: aquamarine;
    }

    .content {
      width: 100%;
      background-color: blanchedalmond;
    }
  }

  .footer {
    background-color: beige;
    height: 40px;
  }
}
</style>
