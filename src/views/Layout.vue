<script setup>
import { ref } from 'vue';
import dayjs from 'dayjs';
import { Lunar } from 'lunar-javascript';

import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const DAYJS_FORMAT_DATE = "YYYY-MM-DD";
const DAYJS_FORMAT_TIME = "HH:mm:ss";
const DAYJS_FORMAT_WEEk = "dddd";

const dateNow = ref(dayjs().format(DAYJS_FORMAT_DATE)); // 年月日
const timeNow = ref(dayjs().format(DAYJS_FORMAT_TIME)); // 周几
const weekNow = ref(dayjs().format(DAYJS_FORMAT_WEEk)); // 时分秒
const lunarObj = Lunar.fromDate(new Date()); // 农历
const lunarFormat = `${ lunarObj.getYearGan() }${ lunarObj.getYearZhi() }(${lunarObj.getYearShengXiao()})年 ${ lunarObj.getMonthInChinese() }月${ lunarObj.getDayInChinese() }`;

// 时分秒，同步变化
setInterval(() => {
  timeNow.value = dayjs().format(DAYJS_FORMAT_TIME);
}, 1000)


/**
 * 返回首页
 */
function backHome() {
  router.push("/");
}

/**
 * 切换主题色
 */
function toggleTheme(colorNew) {
  document.getElementsByTagName('body')[0].setAttribute("theme", colorNew);
}
</script>

<template>
  <div class="sp-layout">
    <nav class="nav">
      <div class="common">
        <img class="logo" src="../assets/shanpu-logo.png" @click="backHome" />
        <div class="datetime">
          <div>
            <span>{{ dateNow }}({{ weekNow }})</span>
            <span>{{ lunarFormat }}</span>
          </div>
          <div>
            <span class="time-text">{{ timeNow }}</span>
          </div>
        </div>
      </div>
      <div class="setting-wrap">
        <!-- <HomeFilled class="icon home"  @click="backHome"/> -->
        <a-dropdown :trigger="['click']" placement="bottom">
          <span class="icon">
            <img class="theme" src="../assets/theme-color.png" />
          </span>
          <template #overlay>
            <div class="theme-list">
              <span class="box green" @click="toggleTheme('green')"></span>
              <span class="box gray" @click="toggleTheme('gray')"></span>
            </div>
          </template>
        </a-dropdown>
      </div>
    </nav>
    <div class="content">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
  </div>
</template>

<style lang="less" scoped>
@navHeight: 60px;

.sp-layout {
  height: 100%;
  width: 100%;

  .nav {
    height: @navHeight;
    width: 100%;
    // background-color: #4b5168;
    background-color: var(--color-primary);
    padding: 0 var(--size-page-space);
    border-bottom: 1px solid var(--color-border);

    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    > div {
      font-size: 18px;
      font-weight: 500;
      color: var(--color-text);
      font-family: "隶书", "楷书";

      display: flex;
      align-items: center;
      column-gap: var(--size-box-gap);
    }
    .logo {
      width: 44px;
      height: 44px;
      background-color: #fff;
      border: 1px solid var(--color-border);
      border-radius: 25%;
      cursor: pointer;
    }
  }
  .content {
    width: 100%;
    height: calc(100% - @navHeight);
    overflow-y: auto;
  }

  .datetime {
    display: flex;
    flex-direction: row;
    align-items: center;

    > div {
      display: flex;
      flex-direction: column;
    }
  }
  
  .time-text {
    width: 72px;
    text-align: right;
  }
}

// 操作区
.setting-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;
  column-gap: 0;
  
  .icon {
    width: 32px;
    height: 32px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;

    cursor: pointer;
    border: 1px solid var(--color-border);
    border-radius: 6px;
  }

  .home {
    font-size: 20px;
    color: #333;
  }
  .theme {
    color: #fff;
    width: 20px;
    height: 20px;
  }
}

.theme-list {
  background-color: #fff;
  border: 1px solid var(--color-border);
  
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  .box {
    margin: 6px;
    width: 20px;
    height: 20px;
    border-radius: 6px;
    border: 1px solid #fff;
    cursor: pointer;
  }
  .green {
    background-color: #7bcda8;
  }
  .gray {
    background-color: #d1d9e0;
  }
}

/* 小尺寸 */
@media screen and (max-width: 650px) {
  .sp-layout .nav > div .logo {
    display: none;
  }
}
</style>