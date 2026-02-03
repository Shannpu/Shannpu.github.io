
// 节点类型
const Node_Type = {
  OR_NODE: "or",   // 分割
  ANCHOR_NODE: "anchor", // 位置
  QUANT_NODE: "quant",  // 数量
  GROUP_NODE: "group",  // 分组
  RANGE_NODE: "range",  // 字符集
  PURE_NODE: "pure",  // 纯字符
  
  CHAR_ESCAPE_NODE: "charEscape",  // 转义字符
  CHAR_DURING_NODE: "charDuring",  // 区间字符
  CHAR_ONE_NODE: "charOne",  // 单字符


  DOT_NODE:"dot",
  BACKREF_NODE:"backref",
  EMPTY_NODE:"empty",
  //Assertion Type Constants
  AssertLookahead:"AssertLookahead",
  AssertNegativeLookahead:"AssertNegativeLookahead",
  AssertNonWordBoundary:"AssertNonWordBoundary",
  AssertWordBoundary:"AssertWordBoundary",
  AssertEnd:"AssertEnd",
  AssertBegin:"AssertBegin"
};

// 节点，检查的正则内容
const Node_Reg = {

};

/**
 * @param {String} regStrOut 外部的正则字符串
 */
export function toNodeArr(regStrOut) {
  // 转为每一个节点对象组成的数组
  /* 节点对象结构为
    {
      content: 具体内容值
      ind: 在字符串中的下标
      type: 节点类型
    }
   */ 

  const nodeArr = toArr(regStrOut);
  return nodeArr;
}

/****** ----------------------------------  分割  ------------------------------------ ******/

/**
 * 转化为数组
 */
function toArr(regOut) {
  const resArr = [];

  if (checkOr(regOut)) {
    // todo
  } else if (checkAnchor(regOut)) {
    // todo
  } else if (checkQuant(regOut)) {
    // todo
  } else {

  }

  return resArr;
}

/**
 * 分割: 分割符 |
 */
function splitOr(regOut) {
  return null;
}


/****** ----------------------------------  检查  ------------------------------------ ******/

/**
 * 检查: 分割符 |
 */
function checkOr(regOut) {
  return null;
}

/**
 * 检查: 位置符号 ^ $
 */
function checkAnchor(regOut) {
  return null;
}

/**
 * 检查: 数量 {n} {n,} {n,m} * + ?  *? +? ?? 
 */
function checkQuant(regOut) {
  return null;
}

/**
 * 检查: 字符集 [] [^]
 */
function checkRange(regOut) {
  return null;
}

/**
 * 检查: 分组 () (?:) (?=) (?!) (?<=) (?<!)
 */
function checkGroup(regOut) {
  return null;
}