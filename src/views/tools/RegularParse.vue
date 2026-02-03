<!--
  创建时间: 2026-01-08 14:13:59
  作者: Shanpu
  功能: RegularParse 正则表达式解析
-->

<script setup>
import { ref, reactive, onMounted } from 'vue';
import ParseResultRender from "./ParseResultRender.vue";

import RegularDerive from "@/plugins/regular";
import { DESC_TIPS, parseRegular } from "@/utils/regular.js";


const regExp = ref(null);
// const regExp = ref("13+[a-zA-Z\\w-]BF{0,2}(\\dab\\D*?(a-zA)[RWE]{2,5})344(Rondle)$");
// const regExp = ref("(sdasdgd)67|ab?(c|de*)+|ac\\w|=\\d");
// const regExp = ref("st^(m|n)ak|[0-9]?\\d{1,12}|124n*$end");
// const regExp = ref("[\\dA-Zabdc]{2,5}-(\\d1234+)rondle22");
// const regExp = ref("(a-zA)[R-WE]{2,5}");
// const regExp = ref("^([^abc]{3})+$");
// const regExp = ref("^(us|(US|AM))(en|EN)|(CN|cn)$");
// const regExp = ref("((c|d)|(ab))|VB");
// const regExp = ref("^us|(US|AM)");
// const regExp = ref("\\daB-D{1,4}[123A-C]?3443[\\w343]+4{1,4}"); //  \dADF{0,2}
// const regExp = ref("^[+]{0,1}(\d+)$");
// const regExp = ref("[^\\:*<>\|"\?\r\n/]");

// 解析结果数据
const parseRes = ref([]);
// EBNF 解析的语法树
const astResTree = reactive({
  content: 'AST(EBNF)',
  type: 'root',
  expand: true,
  children: [],
});
// 解析结果, 不同展示形式
const activeParseResultKey = ref('ast');


onMounted(() => {
});


/**
 * 解析正则表达式
 */
function onParse() {
  console.log("Input regExp:", regExp.value);
  if (!regExp.value) return;
  
  let regRes = parseRegular(regExp.value);
  parseRes.value = regRes;

  // EBNF 解析的语法树
  let regDerive = new RegularDerive(regExp.value);
  console.log("RegularDerive:", regDerive);

  astResTree.content = regExp.value;
  astResTree.children = setExpand(regDerive.ast, true);
}

/**
 * 方法: 设置展开/收起状态
 */
function setExpand(arr, expand) {
  if (!arr) return [];

  arr.forEach(item => {
    item.expand = expand;
    if (item.children) {
      setExpand(item.children, expand);
    }
  });
  return arr;
}
</script> 

<template>
  <div class="regular-parse">
    <div class="main">

      <div class="regular">
        <p class="title">正则表达式 (暂不支持中文字符的 \u4e00 类似格式)</p>
        <div class="regular-expression">
          <div class="btn" @click="onParse">Parse</div>
          <div class="prefix">/</div>
          <div class="exp-body">
            <a-input 
              v-model:value="regExp" 
              :bordered="false" 
              placeholder="请输入正则表达式" 
              @pressEnter="onParse"
            />
          </div>
          <div class="suffix">/g</div>
        </div>
      </div>

      <!-- <div class="error">
        <p class="title">错误说明 [后面会添加校验]</p>
        <div>【1】关于括号，不成对可能会解析解析错误。</div>
      </div> -->

      <!-- 解析结果 -->
      <div class="parse">
        <a-tabs v-model:activeKey="activeParseResultKey" type="card">
          <template #leftExtra>
            <p class="title">解析结果</p>
          </template>

          <!-- 收缩面板 -->
          <a-tab-pane key="panel" tab="收缩面板">
            <div class="parse-result">
              <ParseResultRender v-model:data-source="parseRes" />
            </div>
          </a-tab-pane>

          <!-- ast 语法树 -->
          <a-tab-pane key="ast" tab="语法树">
            <div class="parse-result">
              <blocks-tree 
                :data="astResTree" 
                :horizontal="false" 
                :collapsable="true"
                :props="{label: 'content', expand: 'expand', children: 'children',  key:'content'}"
              >
                <template #node="{data}">
                  <div class="range-wrap" v-if="data.type.includes(RegularDerive.nodeType.RANGE) && data.options?.length > 0">
                    <div v-for="option in data.options" class="option">
                      <span style="white-space: nowrap;">{{ option.content }}</span>
                      <!-- <span>{{ option.type }}</span> -->
                    </div>
                  </div>
                  <div class="node-wrap" :class="[data.type]" v-else>
                    <div class="prefix" v-show="data.prefix" style="white-space: nowrap;">{{ data.prefix }}</div>
                    <div class="content">
                      <div style="white-space: nowrap;">{{ data.content }}</div>
                      <!-- <div style="white-space: nowrap;">{{ data.type }}</div> -->
                    </div>
                    <div class="suffix" v-show="data.suffix" style="white-space: nowrap;">{{ data.suffix }}</div>
                  </div>
                </template>
              </blocks-tree>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>

      <!-- 符号优先级 -->
      <div class="priority">
        <p class="title">符号优先级（从高到低）</p>
        <div class="priority-list">
          <div class="icon">
            <img src="@/assets/priority-level.png" alt="">
          </div>
          <div class="list">
            <div>1. 转义符 <span class="char"> \ 如：\w \W \s \S \d \D， \( \) \[ \] \* \+ \? \|</span></div>
            <div>2. 圆括号和方括号 <span class="char"> () (?:) (?=) (?!) (?&lt;=) (?&lt;!) [] [^]</span></div>
            <div>3. 限定符（量词）<span class="char">{n} {n,} {n,m} * + ? </span></div>
            <div>4. 边界序列 <span class="char"> ^ $ </span></div>
            <div>5. 或操作 <span class="char"> | </span></div>
          </div>
        </div>
      </div>

      <div class="meta">
        <p class="title">匹配说明</p>
        <div class="meta-desc">
          <div class="primary">正则表达式是匹配模式，要么匹配字符，要么匹配位置。</div>
          <div class="primary">有了匹配这一基本操作后，才有其他的操作：验证、切分、提取、替换。</div>
          <div v-for="list in DESC_TIPS" class="list-box">
            <div class="title">{{ list.title }}</div>
            <ul>
              <li v-for="item in list.items">
                <span class="expr">{{ item.expr }}</span>
                <span>:&ensp;</span>
                <span>{{ item.explain }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="meta">
        <p class="title">一些正则相关的网站</p>
        <div class="meta-desc">
          <div>【1】<a href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Regular_expressions" target="_blank">Mdn官网 / 正则表达式指南</a></div>
          <div>【1】<a href="https://regex101.com/" target="_blank">正则解析101</a></div>
          <div>【2】<a href="https://regexr.com/8j8iu" target="_blank">正则解析层级化</a></div>
          <div>【2】<a href="https://jex.im/regulex/" target="_blank">正则解析流程化</a></div>
          <div>【3】<a href="https://cheatography.com/davechild/cheat-sheets/regular-expressions/" target="_blank">正则语法备忘录</a></div>
          <div>【4】<a href="https://juejin.cn/post/6844903487155732494" target="_blank">掘金文章: JS正则表达式完整教程</a></div>
        </div>
      </div>

      <div class="meta">
        <p class="title">正则操作的方法</p>
        <div class="meta-desc">
          <div>String#search</div>
          <div>String#split</div>
          <div>String#match</div>
          <div>String#replace</div>
          <div>RegExp#test</div>
          <div>RegExp#exec</div>
        </div>
      </div>

    </div>
  </div>
</template>

<style lang='less' scoped>
@bgPrimary: #d9ecdd;

.regular-parse {
  width: 100%;
  height: 100%;

  .main {
    padding: var(--size-page-space);
    display: flex;
    flex-direction: column;

    > div:not(:first-child) {
      margin-top: var(--size-page-space);
    }
  }

  .title {
    font-size: 16px;
    font-weight: 500;
  }
  .primary {
    color: #049527;
  }
}

.error {
  background-color: #f43f5e24;
  border-radius: 5px;
  padding: 4px 16px;
}

.regular-expression {
  margin-top: 5px;
  min-height: 40px;
  background-color: #fff;
  border-radius: 3px;
  border: 1px solid #d2d2d2;
  font-family: "Source Code Pro", monospace;

  display: flex;
  align-items: center;

  .prefix {
    font-weight: 700;
    padding: 6px 0 6px 16px;
    color: #808080;
  }
  .suffix {
    font-weight: 700;
    padding: 6px 16px 6px 0;
    color: #808080;
  }
  .btn {
    height: 40px;
    line-height: 28px;
    padding: 6px 8px;
    // border-right: 1px solid rgba(4,149,39, .4);
    border-right: 1px solid #d2d2d2;
    cursor: pointer;
    font-weight: 600;
    color: #049527;
    background-color: #d9ecdd;
  }
  .btn:hover {
    color: #fff;
    background-color: #7bcda8;
  }

  .exp-body {
    flex-grow: 1;

    .ant-input {
      font-family: unset;
      padding: 4px 2px;
    }
  }
}

.parse-result {
  // margin-top: 5px;
  min-height: 100px;
  max-height: 800px;
  background-color: #fff;
  border-radius: 5px;
  border: 1px solid #d2d2d2;
  padding: 16px 16px;
  overflow: auto;

  .node-wrap {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background-color: #f5ebeb;

    .content {
      font-size: 15px;
      padding: 2px 6px;
      background-color: #e9ebec;
    };

    .prefix, .suffix {
      padding: 2px 6px;
      font-weight: 600;
      color: #5f1fad;
    }
  }
  // 逻辑或，分组
  .node-wrap.or, 
  .node-wrap.groupCont, 
  .node-wrap.groupCont_quant {
    background-color: #ddf1df;
    .prefix, .suffix {
      color: #00aa00;
    }
  }
  // 字符集
  .node-wrap.rangeCont, 
  .node-wrap.rangeCont_quant {
    background-color: #f4f0b6;
    .prefix, .suffix {
      color: #dd7700;
    }
  }

  .range-wrap {
    display: flex;
    flex-direction: column;
    row-gap: 4px;
    padding: 6px 6px;
    background-color: #fef499;

    .option {
      font-size: 15px;
      padding: 0px 6px;
      background-color: @bgPrimary;
    }
  }
}

.meta-desc {
  margin-top: 5px;
  background-color: #fff;
  border-radius: 5px;
  min-height: 50px;
  padding: 4px 16px;

  .list-box {
    margin: 16px 0;

    ul {
      padding-inline-start: 24px;
    }
    li {
      margin: 6px 0;
    }
    .expr {
      background-color: #e5e5e5;
      padding: 2px 6px;
      border-radius: 5px;
      font-size: 15px;
      font-weight: 500;
    }
  }
}

.priority-list {
  background-color: #fff;
  border-radius: 5px;
  padding: 4px 16px;

  display: flex;
  flex-direction: row;
  align-items: start;

  .icon img {
    width: 30px;
    height: 145px;
  }
  .list {
    margin-left: 12px;

    > div {
      margin: 6px 0;
    }
    .char {
      background-color: #e5e5e5;
      padding: 2px 8px;
      border-radius: 5px;
      font-weight: 500;
      word-spacing: 16px;
    }
  }
}


:deep(.ant-tabs-card >.ant-tabs-nav) {
  margin-bottom: -2px;
  .ant-tabs-nav-wrap {
    justify-content: right;
  }
}
:deep(.org-tree-node-label-inner) {
  padding: 0;
 // border: 1px solid #c3c7cb;
  box-shadow: none
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rich-media-node {
  width: 80px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  color: white;
  background-color: #f7c616;
  border-radius: 4px;
}
</style>