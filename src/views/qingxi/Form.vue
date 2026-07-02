<!--
  创建时间: 2026-02-11 15:06:56
  作者: Shanpu
  功能: Qingxi Form
-->

<script setup>
import { ref } from 'vue';
import { CloseCircleOutlined } from '@ant-design/icons-vue';

const formData = ref({
  title: "",
  subtitle: "",
  types: [],
});

const currType = ref("");

function addType() {
  formData.value.types.push(currType.value);
  currType.value = "";
}

function removeType(type) {
  formData.value.types = formData.value.types.filter(t => t != type);
}

/**
 * 对外暴露
 */
defineExpose({
  setData: (data) => {
    formData.value = data;
  },
  getData: () => formData.value,
});
</script> 

<template>
  <div class="">
    <a-form :model="formData">
      <a-form-item label="标题" name="title">
        <a-input v-model:value="formData.title"></a-input>
      </a-form-item>
      <a-form-item label="副标题" name="subtitle">
        <a-input v-model:value="formData.subtitle"></a-input>
      </a-form-item>
      <a-form-item label="分类" name="types">
        <div class="type-list">
          <span v-for="type in formData.types" :key="type" class="type-item">
            {{type}}
            <CloseCircleOutlined @click="removeType(type)" />
          </span>
        </div>
        <div class="add-box">
          <a-input v-model="currType" class="add-input"></a-input>
          <a-button type="primary" @click="addType" class="add-btn">Add</a-button>
        </div>
      </a-form-item>
    </a-form>
  </div>
</template>

<style lang='less' scoped>
.type-item {
  color: #555;
  padding: 6px 12px;
  border: 1px solid #e8dcc8;
  border-radius: 6px;
  text-align: center;
}

.type-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.add-box {
  display: flex;
  align-items: center;
}
.add-input {
  flex: 1;
}
.add-btn {
  margin-left: 8px;
  flex: 0 0 auto;
}
</style>