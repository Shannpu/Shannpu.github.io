<!--
  创建时间: 2026-02-11 15:06:56
  作者: Shanpu
  功能: Qingxi
-->

<script setup>
import { ref, reactive, nextTick } from 'vue';
import ModalForm from './Form.vue';

const dataMap = {
  "touxiang": {
    title: "肖像定制",
    subtitle: "纯手绘，完全定制",
    types: [
      "素描", "彩铅", "水彩", "水墨", 
      "工笔", "卡通", "插画", 
    ],
  },
  "guohua": {
    title: "国画定制",
    subtitle: "纯手绘，完全定制",
    types: [
      "工笔", "写意", "水墨", "水彩", 
      "山水风景", "人物", "植物", "花鸟动物", 
    ],
  },
}

const currMode = ref("touxiang")
const dataSource = ref(dataMap[currMode.value])


const visible = ref(false);
const modalFormRef = ref(null);



function onChangeMode(mode) {
  currMode.value = mode;
  dataSource.value = reactive(dataMap[mode]);
}



function openModal() {
  visible.value = true;
  nextTick(() => {
    modalFormRef.value.setData(dataSource.value);
  })
}

function closeModal() {
  visible.value = false;
}

function saveModal() {
  const formData = modalFormRef.value.getData();
  dataSource.value.title = formData.title;
  dataSource.value.subtitle = formData.subtitle;
  dataSource.value.types = formData.types;
  visible.value = false;
}
</script> 

<template>
  <div class="setting-box">
    <a-button type="primary" @click="openModal">设置名称类型</a-button>
    <a-select :value="currMode" placeholder="请选择类型" @change="onChangeMode">
      <a-select-option value="touxiang">肖像定制</a-select-option>
      <a-select-option value="guohua">国画定制</a-select-option>
    </a-select>
  </div>
  <div class="chinese-frame">
    <div class="container">
      <div class="corner-decoration top-left"></div>
      <div class="corner-decoration top-right"></div>
      <div class="corner-decoration bottom-left"></div>
      <div class="corner-decoration bottom-right"></div>
      
      <h1 class="title">{{dataSource.title}}</h1>
      <p class="subtitle">{{dataSource.subtitle}}</p>
      <div class="types">
        <span class="type-item" v-for="type in dataSource.types" :key="type">{{type}}</span>
      </div>
      <div>
        <div class="price-box">
          <div class="price-title">20元仅为链接单价</div>
          <div class="price-subtitle">实际价格按尺寸计算</div>
        </div>
        <div class="price-desc">
          <p>下单前请联系客服，据作品实际价格改数量即可</p>
          <p>如：作品为200元，则拍10件，以此类推</p>
        </div>
      </div>
      <div class="notice">
        <div class="notice-title">下单提示</div>
        <p>此为定制作品，风格、材质、尺寸、装裱皆可定制，下单前请联系客服。</p>
        <p>纯手绘作品，贵在不可复制，若非品质问题，不可退货。作品与照片会有出入，创作期间可看过程沟通。</p>
        <div class="notice-title">邮寄说明</div>
        <p>常规作品2-5天发货，相对耗时者5-10天发货。</p>
        <p>请务必在签收前确认作品完好，若有损坏等情形可拒签，并第一时间联系客服。</p>
      </div>
    </div>

    <a-modal
      :open="visible"
      @cancel="closeModal"
      @ok="saveModal"
    >
      <ModalForm ref="modalFormRef" />
    </a-modal>
  </div>
</template>

<style lang='less' scoped>
.setting-box {
  margin: 16px;
}

.chinese-frame {
  padding: 16px;
  /* background: 
    linear-gradient(to right, #8B4513 0%, #CD853F 50%, #8B4513 100%) left top no-repeat,
    linear-gradient(to right, #8B4513 0%, #CD853F 50%, #8B4513 100%) right top no-repeat,
    linear-gradient(to bottom, #8B4513 0%, #CD853F 50%, #8B4513 100%) left top no-repeat,
    linear-gradient(to bottom, #8B4513 0%, #CD853F 50%, #8B4513 100%) left bottom no-repeat; */
  background-size: 20px 30px, 20px 30px, 30px 20px, 30px 20px;
  background-position: left top, right top, left top, left bottom;
  border-radius: 8px;
}

.chinese-frame::before,
.chinese-frame::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  border: 3px solid #CD853F;
}

.chinese-frame::before {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
  border-radius: 6px 0 0 0;
}

.chinese-frame::after {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
  border-radius: 0 0 6px 0;
}

.container {
  text-align: center;
  background: #fff;
  padding: 40px 30px;
  position: relative;
  border: 2px solid #deb887;
}

.container::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  border: 1px dashed #deb887;
  pointer-events: none;
}

.corner-decoration {
  position: absolute;
  width: 30px;
  height: 30px;
  border: 2px solid #8B4513;
}

.corner-decoration.top-left {
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
}

.corner-decoration.top-right {
  top: -2px;
  right: -2px;
  border-left: none;
  border-bottom: none;
}

.corner-decoration.bottom-left {
  bottom: -2px;
  left: -2px;
  border-right: none;
  border-top: none;
}

.corner-decoration.bottom-right {
  bottom: -2px;
  right: -2px;
  border-left: none;
  border-top: none;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  letter-spacing: 4px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 16px;
  letter-spacing: 2px;
}

.subtitle .highlight {
  color: #c75050;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 4px;
}


.types {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  // display: grid;
  // grid-template-columns: repeat(4, 1fr);
  // gap: 12px 8px;
  // justify-items: center;
}
// .types {
//   display: grid;
//   grid-template-columns: repeat(auto-fill, minmax(60px, 80px));
//   gap: 12px;
//   justify-content: center;
//   max-width: 100%;
// }

.type-item {
  font-size: 15px;
  color: #555;
  background: linear-gradient(180deg, #faf8f5 0%, #f0ebe5 100%);
  padding: 4px 6px;
  border: 1px solid #e8dcc8;
  border-radius: 6px;
  font-weight: 500;
  min-width: 60px;
  width: auto;
  text-align: center;
}

.type-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #deb887, transparent);
}

.type-item:hover {
  background: linear-gradient(180deg, #f5f0ea 0%, #ebe3d8 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.1);
}

.price-box {
  border: 3px solid #8B4513;
  /* border-radius: 8px; */
  padding: 16px 20px;
  margin-top: 20px;
  position: relative;
  background: #fff;
  overflow: hidden;
}

.price-title {
  font-size: 18px;
  color: #333;
}

.price-subtitle {
  font-size: 18px;
  font-weight: 700;
  color: #8B4513;
  letter-spacing: 2px;
}

.price-desc {
  font-size: 14px;
  color: #666;
  margin-top: 16px;
  line-height: 1.8;
  text-align: center;
}

.notice {
  font-size: clamp(0.75rem, 3.2vw, 0.85rem);
  color: #666;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #deb887;
  letter-spacing: 0.5px;
  line-height: 1.8;
}

.notice-title {
  font-size: 15px;
  color: #8B4513;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.notice p {
  margin: 8px 0;
  text-align: justify;
  text-indent: 2em;
  font-size: 14px;
}
</style>
