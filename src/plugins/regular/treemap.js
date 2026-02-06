/****** ----------------------------------  解析语法树 ------------------------------------ ******/

/* ‌算术表达式 EBNF文法

expression ::= term { ("+" | "-") term }
term       ::= factor { ("*" | "/") factor }
factor     ::= number | "(" expression ")"
number     ::= digit { digit }
digit      ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"

1、解释：‌
表达式层级结构‌：文法通过分层规则清晰地定义了运算符的优先级。
  - ‌expression‌（表达式）：是最高层规则，处理加减运算。它由一个term（项）开始，后接零个或多个由加号或减号连接的 term。‌
  - ‌term‌（项）：处理乘除运算，优先级高于加减。它由一个 factor（因子）开始，后接零个或多个由乘号或除号连接的 factor。‌
  - ‌factor‌（因子）：处理最基本的运算单元，可以是数字或括号表达式。括号内的 expression 确保了括号运算拥有最高优先级。‌
  - number（数字）规则使用digit { digit }的EBNF重复符号{}，表示一个数字由至少一个digit（数字字符）组成，从而支持多位整数。‌

2、好处：
  这种层级化的设计（表达式→项→因子）
  明确规定了不同运算符的优先级顺序（括号 > 乘除 > 加减），从而避免了语法歧义，
  确保如a - b * c这样的表达式具有唯一确定的解释（先乘法后减法）

 */


/* 那么，正则表达式的 EBNF（扩展巴科斯范式）呢？？

  ->: 表示非终结符的定义）
  {}: 重复, 允许存在 0 个或多个
  []: 可选, 允许存在 0 个或 1 个
  (): 分组, 用来控制产生式的优先级
  | : 或，从多个选择中选择一个
  <>: 注释说明
  单引号包裹的字符(串)为终结符

  有优先级的，就要分解到 下一层级，没有优先级区分的才用 | 分割
  ------------------------------------------------------------------------------------------------------ Start --

  RegExpr      -> Or
  
  <模块>
  Or           -> Anchor | ([Anchor] Or_Cont     [Or])                        <分割符>
  Anchor       -> Quant  | ([Quant]  Anchor_Cont [Anchor])                    <位置边界>
  Quant        -> Group  | ([Group] (Group|Range|Pure Quant_Cont) [Quant])    <限定符>
  Group        -> Range  | ([Range]  Group_Cont  [Group])                     <分组>   
  Range        -> Pure   | ([Pure]   Range_Cont  [Range])                     <字符集>
  Pure         -> String | ([String] Escape_Cont [Pure])                      <纯字符>
  
  In_Range     -> During | ([During] Escape_Cont [In_Range]                   <字符集-转义>
  During       -> String | ([String] During_Cont [During])                    <字符集区间>
  
  <内容>
  Or_Cont      ->  '|'                                           <分割符-内容>
  Anchor_Cont  ->  '^'|'$'                                       <位置边界-内容>
  Quant_Cont   -> '{' Digit [','] [Digit] '}' |'*'|'+'|'?'       <限定符-内容>
  Group_Cont   -> '('['?:'|'?='|'?!''?<='|'?<!'] RegExpr ')'     <分组-内容>
  Range_Cont   -> '['['^'] In_Range ']'                          <字符集-内容>
  Escape_Cont  -> '\' Single                                     <转义符-内容>
  During_Cont  ->  Single '-' Single                             <字符集区间-内容>
  
  String       -> Single { Single }                                                             <字符串>
  Single       -> Symbol | Word | Digit                                                         <单字符>
  Symbol       -> '\'|'|'|'^'|'$'|'{'|'}'|'*'|'+'|'?'|'.'|'['|']'|'('|')'|...|'-'|'_'|':'|' '   <所有符号>
  Word         -> 'A'|'B'|'C'|...|'Z'|'a'|'b'|'c'|...|'z'                                       <所有字母>
  Digit        -> '0'|'1'|'2'|'3'|...|'9'|'10'|'11'|...                                         <所有数字>
  Empty        -> ''                                                                            <空>
  
  ------------------------------------------------------------------------------------------------------ End --
*/


// 节点类型
export const Node_Type = {
  OR: "or",   // 分割符
  ANCHOR: "anchor", // 位置边界
  QUANT: "quant",  // 限定符
  GROUP: "group",  // 分组
  RANGE: "range",  // 字符集
  PURE: "pure",  // 纯字符
  
  OR_CONT: "orCont",  // 分割符-内容
  ANCHOR_CONT: "anchorCont", // 位置边界-内容
  QUANT_CONT: "quantCont",  // 限定符-内容
  GROUP_CONT: "groupCont",  // 分组-内容
  RANGE_CONT: "rangeCont",  // 字符集-内容
  ESCAPE_CONT: "escapeCont",  // 转义符-内容
  DURING_CONT: "duringCont",  // 字符集区间-内容
  
  STRING: "string",  // 字符串
  SINGLE: "single",  // 单字符
};


/**
 * @param {String} regStrOut 外部的正则字符串
 */
export function toTreemap(regStrOut) {
  // 转为每一个节点对象组成的层级对象
  /* 节点对象结构为
    {
      content: 具体内容值
      ind: 在字符串中的下标
      type: 节点类型
      prefix: 前缀
      suffix: 后缀
      children: [] 子节点列表
    }
   */ 

  const rootArr = parseRegExpr(regStrOut);
  return rootArr;
}

/****** ----------------------------------  解析  ------------------------------------ ******/

/**
 * RegExpr 解析::=  Or
 */
function parseRegExpr(contOut) {
  // 没有时
  if (!contOut) return [];

  return parseOr(contOut);
}


/**
 * Or 解析::=  Anchor | ([Anchor] Or_Cont [Or])
 */
function parseOr(contOut, isParent = false) {
  // 没有时
  if (!contOut) return [];

  const execRet  = execOr(contOut);
  if (!execRet) {
    // Anchor 解析
    if (isParent) {
      return [{
        content: contOut,
        type: Node_Type.OR,
        prefix: " ",
        suffix: " ",
        children: parseAnchor(contOut)
      }];
    } else {
      return parseAnchor(contOut);
    }
  }

  // Range 解析
  const matchChar = execRet[0], matchInd = execRet['index'];
  const viewData = [];
  const splitArr = splitFromIndex(contOut, matchInd, matchInd + matchChar.length);
  // console.log("[ parseGroup ]:", splitArr);
  
  // 前项 Anchor
  viewData.push({
    content: splitArr[0],
    type: Node_Type.OR,
    prefix: " ",
    suffix: " ",
    children: parseAnchor(splitArr[0])
  });
  // 分割项 Or_Cont
  viewData.push(...parseOrCont(splitArr[1]));
  // 后项 Or
  viewData.push(...parseOr(splitArr[2], true));
    
  return viewData;
}

/**
 * Anchor 解析::=  Quant | ([Quant] Anchor_Cont [Anchor]) 
 */
function parseAnchor(contOut) {
  // 没有时
  if (!contOut) return [];

  const execRet  = execAnchor(contOut);
  if (!execRet) {
    // Quant 解析
    return parseQuant(contOut);
  }

  // Range 解析
  const matchChar = execRet[0], matchInd = execRet['index'];
  const viewData = [];
  const splitArr = splitFromIndex(contOut, matchInd, matchInd + matchChar.length);
  // console.log("[ parseGroup ]:", splitArr);
  
  // 前项 Pure
  viewData.push(...parseQuant(splitArr[0]));
  // 分割项 Range_Cont
  viewData.push(...parseAnchorCont(splitArr[1]));
  // 后项 Range
  viewData.push(...parseAnchor(splitArr[2]));
    
  return viewData;
}

/**
 * Quant 解析::=  Group | ([Group] (Group|Range|Pure Quant_Cont) [Quant])
 */
function parseQuant(contOut) {
  // 没有时
  if (!contOut) return [];

  const execRet  = execQuant(contOut);
  if (!execRet) {
    // Group 解析
    return parseGroup(contOut);
  }

  // Range 解析
  const matchChar = execRet[0], matchInd = execRet['index'];
  const viewData = [];

  let splitArr = [];
  if (matchChar == "{") {
    splitArr = splitFromPaired(contOut, matchChar)
  } else {
    splitArr = splitFromIndex(contOut, matchInd, matchInd + matchChar.length);
  }
  // console.log("[ parseQuant ]:", splitArr);
  
  // 前项 Pure
  viewData.push(...parseGroup(splitArr[0]));
  // 分割项 Range_Cont
  viewData.push(...parseQuantCont(splitArr[1]));
  // 后项 Range
  viewData.push(...parseQuant(splitArr[2]));
  
  // 最后需要合并一下
  return mergeLimitQuant(viewData);
}

/**
 * Group 解析::=  Range | ([Range] Group_Cont [Group]
 */
function parseGroup(contOut) {
  // 没有时
  if (!contOut) return [];

  const execRet  = execGroup(contOut);
  if (!execRet) {
    // Range 解析
    return parseRange(contOut);
  }

  // Range 解析
  const matchChar = execRet[0], matchInd = execRet['index'];
  const viewData = [];
  const splitArr = splitFromPaired(contOut, matchChar);
  // console.log("[ parseGroup ]:", splitArr);
  
  // 前项 Pure
  viewData.push(...parseRange(splitArr[0]));
  // 分割项 Range_Cont
  viewData.push(...parseGroupCont(splitArr[1]));
  // 后项 Range
  viewData.push(...parseGroup(splitArr[2]));
    
  return viewData;
}

/**
 * Range 解析::=  Pure | ([Pure] Range_Cont [Range])
 */
function parseRange(contOut) {
  // 没有时
  if (!contOut) return [];

  const execRet  = execRange(contOut);
  if (!execRet) {
    // Pure 解析
    return parsePure(contOut);
  }

  // Range 解析
  const matchChar = execRet[0], matchInd = execRet['index'];
  const viewData = [];
  const splitArr = splitFromPaired(contOut, matchChar);
  // console.log("[ parseRange ]:", splitArr);
  
  // 前项 Pure
  viewData.push(...parsePure(splitArr[0]));
  // 分割项 Range_Cont
  viewData.push(...parseRangeCont(splitArr[1]));
  // 后项 Range
  viewData.push(...parseRange(splitArr[2]));
    
  return viewData;
}

/**
 * In_Range 解析::=  During | ([During] Escape_Cont [In_Range])
 */
function parseInRange(contOut) {
  // 没有时
  if (!contOut) return [];

  const execRet  = execEscape(contOut);
  if (!execRet) {
    // During 解析
    return parseDuring(contOut);
  }

  // Escape 解析
  const matchChar = execRet[0], matchInd = execRet['index'];
  const viewData = [];
  const splitArr = splitFromIndex(contOut, matchInd, matchInd + matchChar.length);
  // console.log("[ parseInRange ]:", splitArr);
  
  // 前项 String
  viewData.push(...parseDuring(splitArr[0]));
  // 分割项 Escape_Cont
  viewData.push(...parseEscapeCont(splitArr[1]));
  // 后项 Pure
  viewData.push(...parseInRange(splitArr[2]));
    
  return viewData;
}

/**
 * During 解析::=  String | ([String] During_Cont [During]) 
 */
function parseDuring(contOut) {
  // 没有时
  if (!contOut) return [];

  const execRet  = execDuring(contOut); 
  // String 解析
  if (!execRet) {
    return parseString(contOut, true);
  }

  // Escape 解析
  const matchChar = execRet[0], matchInd = execRet['index'];
  const viewData = [];
  const splitArr = splitFromIndex(contOut, matchInd, matchInd + matchChar.length);
  // console.log("[ parseDuring ]:", splitArr);
  
  // 前项 String
  viewData.push(...parseString(splitArr[0]));
  // 分割项 Escape_Cont
  viewData.push(...parseDuringCont(splitArr[1]));
  // 后项 Pure
  viewData.push(...parseDuring(splitArr[2]));
    
  return viewData;
}

/**
 * Pure 解析::=  String | ([String] Escape_Cont [Pure])
 */
function parsePure(contOut) {
  // 没有时
  if (!contOut) return [];

  const execRet  = execEscape(contOut); 
  // String 解析
  if (!execRet) {
    return parseString(contOut);
  }

  // Escape 解析
  const matchChar = execRet[0], matchInd = execRet['index'];
  const viewData = [];
  const splitArr = splitFromIndex(contOut, matchInd, matchInd + matchChar.length);
  // console.log("[ parsePure ]", splitArr);
  
  // 前项 String
  viewData.push(...parseString(splitArr[0]));
  // 分割项 Escape_Cont
  viewData.push(...parseEscapeCont(splitArr[1]));
  // 后项 Pure
  viewData.push(...parsePure(splitArr[2]));
    
  return viewData;
}

/****** ----------------------------------  内容  ------------------------------------ ******/

/**
 * Or_Cont 解析: '|'   
 */
function parseOrCont(contOut) {
  // 没有时
  if (!contOut) return [];

  // 内容对象
  return [{
    content: contOut,
    type: Node_Type.OR_CONT,
  }];
}

/**
 * Quant_Cont 解析: '^'|'$'
 */
function parseAnchorCont(contOut) {
  // 没有时
  if (!contOut) return [];

  // 内容对象
  return [{
    content: contOut,
    type: Node_Type.ANCHOR_CONT,
  }];
}

/**
 * Quant_Cont 解析: '{' Digit [','] [Digit] '}' |'*'|'+'|'?'
 */
function parseQuantCont(contOut) {
  // 没有时
  if (!contOut) return [];

  // 内容对象
  return [{
    content: contOut,
    type: Node_Type.QUANT,
  }];
}

/**
 * Group_Cont 解析: 前缀 + 内容体(RegExpr) + 后缀，子项解析
 */
function parseGroupCont(contOut) {
  // 没有时
  if (!contOut) return [];

  let prefix = "(", suffix = ")";
  let content = contOut.slice(1, -1);

  const execPre = /^\?<?[:=!]/.exec(content); // todo 正则有问题
  if (execPre) {
    prefix += execPre[0];
    content = content.slice(execPre[0].length);
  }

  // 内容对象
  return [{
    content,
    type: Node_Type.GROUP_CONT,
    prefix,
    suffix,
    children: parseRegExpr(content)
  }];
}

/**
 * Range_Cont 解析: 前缀 + 内容体(In_Range) + 后缀，子项解析
 */
function parseRangeCont(contOut) {
  // 没有时
  if (!contOut) return [];

  let prefix = "[", suffix = "]";
  let content = contOut.slice(1, -1);

  const execPre = /^\^/.exec(content);
  if (execPre) {
    prefix += execPre[0];
    content = content.slice(execPre[0].length);
  }

  // 内容对象
  return [{
    content,
    type: Node_Type.RANGE_CONT,
    prefix,
    suffix,
    children: parseInRange(content)
    // children:[{
    //   type: Node_Type.RANGE,
    //   options: parseInRange(content)
    // }]
  }];
}

/**
 * Escape_Cont 解析: '\' Single
 */
function parseEscapeCont(contOut) {
  // 没有时
  if (!contOut) return [];

  // 内容对象
  return [{
    content: contOut,
    type: Node_Type.ESCAPE_CONT,
  }];
}

/**
 * During_Cont 解析: 'Single '-' Single
 */
function parseDuringCont(contOut) {
  // 没有时
  if (!contOut) return [];

  // 内容对象
  return [{
    content: contOut,
    type: Node_Type.DURING_CONT,
  }];
}

/**
 * String 解析: 单字符，或者一个整体
 */
function parseString(contOut, isSingle) {
  // 没有时
  if (!contOut) return []

  // 拆成单字符
  if (isSingle) {
    const charData = [];
    contOut.split("").map(singleChar => {
      charData.push({
        content: singleChar,
        type: Node_Type.SINGLE,
      });
    });
    return charData;
  }

  // 作为一个整体
  return [{
    content: contOut,
    type: Node_Type.STRING,
  }];
}

/****** ----------------------------------  检查  ------------------------------------ ******/

/**
 * 检查匹配: 分割符 |
 * 
 * @param {String} strWhole 要匹配的字符串
 * @returns 一个匹配结果数组或 null
 */
function execOr(strWhole) {
  if (!strWhole) return null;

  // 先找到非转义的字符 ｜
  const reg = /(?<!\\)\|/g;
  let execRes = null; // 是否有匹配
  let isPaired = false; // 匹配前的括号是否成对

  do {
    execRes = reg.exec(strWhole);
    if (execRes) {
      isPaired = checkBrackets(strWhole.slice(0, execRes.index), "(");
    }
  } while (execRes && !isPaired);

  return isPaired ? execRes : null;
}

/**
 * 检查匹配: 位置符号 ^ $
 * 
 * @param {String} strWhole 要匹配的字符串
 * @returns 一个匹配结果数组或 null
 */
function execAnchor(strWhole) {
  if (!strWhole) return null;

  // 先找到非转义的字符
  const reg = /(?<!\\)((?<!\[)\^|\$)/g;
  let execRes = null; // 是否有匹配
  let isPaired = false; // 匹配前的括号是否成对

  do {
    execRes = reg.exec(strWhole);
    if (execRes) {
      isPaired = checkBrackets(strWhole.slice(0, execRes.index), "(");
    }
  } while (execRes && !isPaired);

  return isPaired ? execRes : null;
}

/**
 * 检查匹配: 数量 {n} {n,} {n,m} * + ?  *? +? ?? 
 * 
 * @param {String} strWhole 要匹配的字符串
 * @returns 一个匹配结果数组或 null
 */
function execQuant(strWhole) {
  if (!strWhole) return null;

  // 先找到非转义的字符
  const reg = /(?<!\\)(\*\?|\+\?|\?\?|\*|\+|\?|\{)/g;
  let execRes = null; // 是否有匹配
  let isPaired = false; // 匹配前的括号是否成对

  do {
    execRes = reg.exec(strWhole);
    if (execRes) {
      isPaired = checkBrackets(strWhole.slice(0, execRes.index), "(");
    }
  } while (execRes && !isPaired);

  return isPaired ? execRes : null;
}

/**
 * 检查匹配: 分组 () (?:) (?=) (?!) (?<=) (?<!)
 */
function execGroup(regCont) {
  const reg = /(?<!\\)\(/;
  const res = reg.exec(regCont);
  // console.log("[execGroup 分组] res:", res);
  return res;
}

/**
 * 检查匹配: 字符集 [] [^]
 */
function execRange(regCont) {
  const reg = /(?<!\\)\[/;
  const res = reg.exec(regCont);
  // console.log("[execRange 字符集] res:", res);
  return res;
}

/**
 * 检查匹配: 转义 \
 */
function execEscape(regCont) {
  const reg = /\\(\d+|[^0-9\s]{1})/;
  const res = reg.exec(regCont);
  // console.log("[execEscape 转义] res:", res);
  return res;
}

/**
 * 检查匹配: 区间 A-Z
 */
function execDuring(regCont) {
  const reg = /\S(?<!\\)-\S/;
  const res = reg.exec(regCont);
  // console.log("[execDuring 区间] res:", res);
  return res;
}


/****** ----------------------------------  帮助方法  ------------------------------------ ******/

/**
 * 根据所给下标，分割为 前、字符串、后
 * 
 * @param {String} strWhole 全部字符串
 * @param {String} sInd 要分割的开始下标
 * @param {String} eInd 要分割的结束下标
 * @returns 最后分割后的字符串数组
 */
function splitFromIndex(strWhole, sInd, eInd) {
  if(sInd > -1) {
    return [
      strWhole.slice(0, sInd),
      strWhole.slice(sInd, eInd),
      strWhole.slice(eInd),
    ];
  }

  return [strWhole];
}

/**
 * 根据所给成对符号，分割为 前、符号及其内部内容、后
 * 
 * @param {String} strWhole 全部字符串
 * @param {String} strBracket 要分割的括号键
 * @returns 最后分割后的字符串数组
 */
function splitFromPaired(strWhole, strBracket) {
  // todo 这里匹配的时候要考虑转义
  const [sInd, eInd] = matchBracket(strWhole, strBracket);
  if(sInd > -1) {
    return [
      strWhole.slice(0, sInd),
      strWhole.slice(sInd, eInd),
      strWhole.slice(eInd),
    ];
  }

  return [strWhole];
}

/**
 * 找到匹配的成对括号下标
 */
function checkBrackets(strWhole, strBracket) {
  const mapping = {
    "(": [/(?<!\\)\(/g, /(?<!\\)\)/g],
    "[": [/(?<!\\)\[/g, /(?<!\\)\]/g],
    "{": [/(?<!\\)\{/g, /(?<!\\)\}/g],
  };
  const [strFront, strEnd] = mapping[strBracket];

  const countFront = strWhole.match(strFront)?.length ?? 0;
  const countEnd = strWhole.match(strEnd)?.length ?? 0;
  // console.log("strWhole:", strWhole, "countFront:", countFront, "countEnd:", countEnd);

  return countFront == countEnd;
}

/**
 * 找到匹配的成对括号下标
 */
function matchBracket(strWhole, strBracket) {
  const mapping = {
    "(": ["(", ")"],
    "[": ["[", "]"],
    "{": ["{", "}"],
  };
  const [strFront, strEnd] = mapping[strBracket];
  // todo 将转义的处理掉，只是为了搜索方便
  const strWholeNew = strWhole.replaceAll("\\" + strFront, "Aa").replaceAll("\\" + strEnd, "Bb");

  let count = 0;
  let sInd = -1;
  let eInd = -1;

  for (let i = 0; i < strWholeNew.length; i++) {
    const charItem = strWholeNew[i];
    if (charItem == strFront) {
      count++;
      if (sInd < 0) {
        sInd = i;
      }
    } else if (charItem == strEnd) {
      count--;
      if (count == 0) {
        eInd = i;
        break;
      }
    }
  }
  return [sInd, eInd + 1]
}

/**
 * 合并量词和限制范围
 */
function mergeLimitQuant(outArr) {
  // console.log("合并量词 [前]:", outArr);

  const mergeArr = [];
  for (let i = 0; i < outArr.length; i++) {
    const curr = outArr[i];
    const next = outArr[i + 1];
    if (!next) {
      // 最后一个
      mergeArr.push(curr);
    } else if (next.type != Node_Type.QUANT) {
      // 后一个不是 数量
      mergeArr.push(curr);
    } else {
      const {content: currCont, type: currType, suffix: currSuffix = ""} = curr;
      const {content: nextCont, type: nextType} = next;
      if (currType == Node_Type.STRING) {
        const contArr = [
          currCont.slice(0, -1),
          currCont.slice(-1),
        ];
        // console.log("contArr:", contArr);

        // 字符串，前面的项
        if (contArr[0]) {
          mergeArr.push({
            ...curr,
            content: contArr[0]
          });
        }
        // 字符串，要拼接的项
        mergeArr.push({
          ...curr,
          content: contArr[1],
          type: currType + "_" + nextType,
          quant: nextCont
        });
      } else {
        mergeArr.push({
          ...curr,
          type: currType + "_" + nextType,
          suffix: currSuffix,
          quant: nextCont
        });
      }
      i++;
    }
  }
  // console.log("合并量词 [后]:", mergeArr);
  return mergeArr;
}