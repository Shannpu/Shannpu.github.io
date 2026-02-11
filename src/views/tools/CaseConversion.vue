<!--
  创建时间: 2026-01-26 15:05:27
  作者: Shanpu
  功能: CaseConversion 命名格式转换
-->

<script setup>

</script> 

<template>
  <div class="case-conversion">
    <div class="main">
      <div>
        <a-input v-model:value="value" placeholder="请输入英文命名文本" />
      </div>
      <div class="convert-result">Case result</div>
    </div>
  </div>
</template>

<style lang='less' scoped>
.case-conversion {
  width: 100%;
  height: 100%;

  .main {
    padding: var(--size-page-space);
    display: flex;
    flex-direction: column;
  }
}
</style>