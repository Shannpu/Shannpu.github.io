<!--
  创建时间: 2026-01-08 16:20:16
  作者: Shanpu
  功能: ParseResult 解析结果
-->

<script setup>

defineOptions({
  name: 'ParseResultRender'
});

/**
 * 父类的属性
 */
const resultData = defineModel("dataSource", {default: []})


/**
 * 切换收缩
 */
function onToggle(idx) {
  resultData.value[idx].collapse = !resultData.value[idx].collapse;

  console.log("resultData.value:", resultData.value);
}
</script> 

<template>
  <div class="result-box">
    <div class="no-data" v-show="!resultData.length">解析结果会在这里展示。</div>
    <div v-for="(item, idx) in resultData" :key="idx">
      <div class="header">
        <span :class="['down', {'right': item.collapse}]"><CaretDownFilled v-show="item.children"  @click="onToggle(idx)"/></span>
        <span class="prefix" v-show="item.prefix">{{ item.prefix }}</span>
        <span class="content">{{ item.content }}</span>
        <span class="suffix" v-show="item.suffix">{{ item.suffix }}</span>
        <span class="explain">{{ item.explain }}</span>
        <span v-show="item.tip">
          <a-tooltip>
            <template #title>{{ item.tip }}</template>
            <QuestionCircleOutlined style="color:#666;" />
          </a-tooltip>
        </span>
      </div>
      <div v-show="item.children && !item.collapse" style="margin-left: 16px;">
        <ParseResultRender v-model:data-source="item.children" />
      </div>
    </div>
  </div>
</template>

<style lang='less' scoped>
.header {
  display: flex;
  align-items: center;
  margin: 8px 0;

  .down {
    width: 16px;
    height: 24px;
    line-height: 24px;
    cursor: pointer;
    transition: transform .1s ease, opacity .1s ease;

    &.right {
      transform: rotate(-90deg);
    }
  }
  .content {
    line-height: 24px;
    background-color: #d9ecdd;
    padding: 2px 6px;
    border-radius: 5px;
    font-size: 15px;
    font-weight: 500;
  }
  // .prefix {
  //   background-color: #ecf4fe;
  //   padding: 2px 6px;
  //   color: #C10443;
  //   font-weight: 500;
  // }
  .prefix,
  .suffix {
    background-color: #ecf4fe;
    padding: 2px 6px;
    color: #5f1fad;
    font-weight: 500;
  }
  
  .explain {
    margin: 0 8px;
  }
}

.no-data {
  margin-top: 20px;
  color: #a5a5a5;
}
</style>