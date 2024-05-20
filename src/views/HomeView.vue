<script setup lang="ts"></script>

<template>
  <div>
    <div ref="elt" class="circle">
      <span>1</span>
      <span class="tooltip">안녕</span>
      <div class="guide-line"></div>
    </div>
  </div>
</template>

<style lang="scss">
.circle {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
  font-size: 12px;
  background-color: #ec5f36;
  color: #fff;
  border-radius: 100%;

  .tooltip {
    display: none;
    position: absolute;
    background-color: grey;
    padding: 6px;
    top: 0;
    right: 0;
    transform: translate(120%, -50%);
  }

  &:hover {
    .tooltip {
      display: block;
    }
  }

  .guide-line {
    position: absolute;
    left: -20px;
    width: 20px;
    border: dashed 2px #ec5f36;
  }
}
</style>
