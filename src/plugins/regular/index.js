import { toNodeArr } from "./nodeArr.js";
import { toAstree, Node_Type } from "./astree.js";

class RegularDerive {

  /**
   * @param {String} regInput 输入的正则字符串
   */
  constructor(regInput) {
    // 构造函数主体
    // 此处的 regInput 其实只是 /.../ 中间的内容值
    // 包含4种格式：

    //  RegExp 正则（暂略）
    
    //  String 字符串

    console.log("regInput:", regInput);

    this.str = regInput + "";
    
    //  Array 数组
    this.arr = toNodeArr(this.str);
    
    //  Astree 语法树
    this.ast = toAstree(this.str);
  }

  /*
  // 静态块
  static {
    // 静态初始化代码
  }
  // 静态方法
  static myStaticMethod() {
    // myStaticMethod 主体
    }
    */
  // 静态字段
  static nodeType = Node_Type;

  /*
  // 实例字段
  myField = "foo";
  // 实例方法
  myMethod() {
    // myMethod 主体
  }
  */

  /*
  // 字段、方法、静态字段、静态方法、静态块都可以使用“私有”形式
  #myPrivateField = "bar";
  #myPrivateMethod() {
    // myPrivateMethod 主体
  }
  */
}

export default RegularDerive;