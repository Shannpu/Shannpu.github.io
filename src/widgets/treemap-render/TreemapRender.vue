<!--
  创建时间: 2026-02-05 10:25:19
  作者: Shanpu
  功能: FlexBoxRender 矩形树渲染
-->

<script setup>

/**
 * 父类的属性
 */
const _props = defineProps({
  // 渲染项内容
  dataSource: {
    type: Object,
    default: () => ({})
  },
  // [颜色递减] 层级，每层增1，从 1 开始
  level: {
    type: Number,
    default: 1
  },
  // [悬浮高亮效果] 当前的主键：使用 index 与 - 拼接，从 0 开始
  currentKey: {
    type: String,
    default: "0"
  },
});
/**
 * 父类的双向响应属性
 */
const activeBoxKey = defineModel(
  "activeBoxKey", { type: String }
);


/**
 * 获取内容的背景色
 * @param params 
 */
function getContBgColor(level) {
  const ind = (parseInt(level) - 1) % 10;
  const mapping = [
    1,   0.85, 0.70, 0.55, 0.40, 0.25, 
    0.1, 0.25, 0.40, 0.55, 0.70, 0.85
  ]
  return `rgba(2, 140, 78, ${mapping[ind]})`;
}

/**
 * 获取内容的文本色
 * @param params 
 */
function getContTextColor(level) {
  const ind = (parseInt(level) - 1) % 10;
  const mapping = [
    "#fff", "#fff", "#333", "#333","#333", "#333", 
    "#333", "#333", "#333", "#333", "#333", "#fff"
  ]
  return mapping[ind];
}

/**
 * 获取盒子的透明度
 * @param params 
 */
function getBoxOpacity() {
  const curr = _props.currentKey; // 这个肯定有值
  const active = activeBoxKey.value; // 不激活时没值

  // 不激活时
  if (!active) {
    return 1;
  }

  // 激活时，激活项不透明
  if (curr.startsWith(active)) {
    return 1;
  } else {
    return 0.2;
  }
}

/**
 * 事件: 鼠标移入内容
 */
function onMouseEnter() {
  activeBoxKey.value = _props.currentKey;
}

/**
 * 事件: 鼠标移出内容
 */
function onMouseLeave() {
  activeBoxKey.value = "";
}

</script> 

<template>
  <div class="box">
    <div class="content" :class="dataSource.type" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
      <span class="prefix" v-show="dataSource.prefix">{{ dataSource.prefix }}</span>
      <span>{{ dataSource.content }}</span>
      <span class="suffix" v-show="dataSource.suffix">{{ dataSource.suffix }}</span>
      <span class="quant" v-show="dataSource.quant">{{ dataSource.quant }}</span>
    </div>
    <div class="child" v-if="dataSource.children">
      <treemap-render 
        class="box" 
        v-for="(child, index) in dataSource.children" 
        :data-source="child" 
        :style="{'flex-grow': child.content?.length ?? 1}"
        :level="level + 1"
        :current-key="currentKey + '-' + index"
        v-model:active-box-key="activeBoxKey"
      >
      </treemap-render>
    </div>
  </div>
</template>

<style lang='less' scoped>
// 定义变量
.flex-col (@gap) {
  display: flex;
  flex-direction: column;
  // justify-content: space-between;
  // align-items: stretch;
  row-gap: @gap;
}

.flex-row (@gap) {
  display: flex;
  flex-direction: row;
  // justify-content: space-between;
  // align-items: stretch;
  column-gap: @gap;
}


// 样式
.box {
  .flex-col(2px);
  flex: 1 1 auto;
  
  .content {
    opacity: v-bind(getBoxOpacity(activeBoxKey));
    padding: 4px 8px;
    background-color: v-bind(getContBgColor(level));
    color: v-bind(getContTextColor(level));
    text-align: center;
  }
  .prefix, .suffix {
    padding: 0 4px;
    color: #f9d237;
    font-weight: bold;
  }
  .quant {
    padding: 0 4px;
    color: #b10c3a;
    font-weight: bold;
  }
  .child {
    .flex-row(2px);
  }
}

.box:has(.orCont),
.box:has(.anchorCont),
.box:has(.range) {
  flex: 0 0 auto;
}
.box .content.orCont {
  height: 100%;
  background-color: papayawhip;
  span {
    color: #b10c3a;
    font-weight: bold;
  }
}
.box .content.anchorCont {
  background-color: papayawhip;
  span {
    color: #b10c3a;
    font-weight: bold;
  }
}
.box .content.range {
  background-color: lightgoldenrodyellow;
  span {
    color: darkkhaki;
    font-weight: bold;
  }
}

</style>