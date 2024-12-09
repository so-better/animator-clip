var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class Animator {
  constructor(el, options) {
    /**
     * 动画绑定的元素
     */
    __publicField(this, "$el");
    /**
     * 动画开始事件
     */
    __publicField(this, "onStart");
    /**
     * 动画停止事件
     */
    __publicField(this, "onStop");
    /**
     * 动画重置事件
     */
    __publicField(this, "onReset");
    /**
     * 动画更新前事件，此时样式还未改变
     */
    __publicField(this, "onBeforeUpdate");
    /**
     * 动画更新时事件，此时样式已经改变
     */
    __publicField(this, "onUpdate");
    /**
     * 动画完成事件
     */
    __publicField(this, "onComplete");
    /**
     * 动画下的实例
     */
    __publicField(this, "children", []);
    this.$el = typeof el == "string" && el ? document.body.querySelector(el) : el;
    if (options == null ? void 0 : options.onStart) this.onStart = options.onStart;
    if (options == null ? void 0 : options.onStop) this.onStop = options.onStop;
    if (options == null ? void 0 : options.onReset) this.onReset = options.onReset;
    if (options == null ? void 0 : options.onBeforeUpdate) this.onBeforeUpdate = options.onBeforeUpdate;
    if (options == null ? void 0 : options.onUpdate) this.onUpdate = options.onUpdate;
    if (options == null ? void 0 : options.onComplete) this.onComplete = options.onComplete;
  }
  /**
   * 判断是否包含某个clip
   */
  hasClip(clip) {
    if (!clip.parent) {
      return false;
    }
    if (!this.children.length) {
      return false;
    }
    return this.children.some((item) => {
      return item.key === clip.key;
    });
  }
  /**
   * 将clip添加到队列
   */
  addClip(clip) {
    if (!this.hasClip(clip) && !!clip.parent) {
      throw new Error("The clip has been added to other animator");
    }
    if (this.hasClip(clip)) {
      throw new Error("The clip has been added to the animator");
    }
    clip.parent = this;
    if (!clip.free) {
      if (!!clip.unit) {
        clip.initValue = clip.getUnitCssValue() + clip.unit;
      } else {
        clip.initValue = clip.getUnitCssValue();
      }
    }
    this.children.push(clip);
    return this;
  }
  /**
   * 将clip移出队列
   */
  removeClip(clip) {
    if (!clip.parent) {
      throw new Error("The clip has not been added to the animator");
    }
    if (!this.hasClip(clip)) {
      throw new Error("The clip does not belong to the animator");
    }
    const index = this.children.findIndex((item) => item.key == clip.key);
    this.children = this.children.splice(index, 1);
    clip.state = 0;
    clip.timeStamp = 0;
    clip.interval = 0;
    if (!clip.free) {
      clip.parent.$el.style.setProperty(clip.style, clip.initValue + "", "important");
      clip.initValue = void 0;
    }
    clip.parent = void 0;
    return this;
  }
  /**
   * 移除全部clip
   */
  removeAllClips() {
    let i = 0;
    while (i < this.children.length) {
      const clip = this.children[i];
      this.removeClip(clip);
    }
    return this;
  }
  /**
   * 获取正在运行的clip
   */
  getClips() {
    return this.children.filter((item) => {
      return item.state == 1;
    });
  }
  /**
   * 获取停止状态的clip
   */
  getStopClips() {
    return this.children.filter((item) => {
      return item.state == 2;
    });
  }
  /**
   * 获取已完成的clip
   */
  getCompleteClips() {
    return this.children.filter((item) => {
      return item.state == 3;
    });
  }
  /**
   * 开始动画
   */
  start() {
    this.children.forEach((item) => {
      item.start();
    });
    return this;
  }
  /**
   * 停止动画
   */
  stop() {
    this.children.forEach((item) => {
      item.stop();
    });
    return this;
  }
  /**
   * 重置动画
   */
  reset(resetStyle) {
    this.children.forEach((item) => {
      item.reset(resetStyle);
    });
    return this;
  }
}
const dataName = "_dap-datas";
const data = {
  /**
   * 移除指定数据
   * @param {Object} el
   * @param {Object} key
   */
  remove(el, key) {
    const data2 = el[dataName] || {};
    if (key) {
      delete data2[key];
      el[dataName] = data2;
    } else {
      el[dataName] = {};
    }
  },
  /**
   * 判断是否含有指定数据
   * @param {Object} el
   * @param {Object} key
   */
  has(el, key) {
    return (el[dataName] || {}).hasOwnProperty(key);
  },
  /**
   * 获取元素指定数据
   * @param {Object} el
   * @param {Object} key
   */
  get(el, key) {
    const data2 = el[dataName] || {};
    return !!key ? data2[key] : data2;
  },
  /**
   * 设置元素指定数据
   * @param {Object} el
   * @param {Object} key
   * @param {Object} value
   */
  set(el, key, value) {
    const data2 = el[dataName] || {};
    data2[key] = value;
    el[dataName] = data2;
  }
};
const string = {
  /**
   * 向指定位置插入字符串
   * @param {Object} original 原始字符串
   * @param {Object} str 插入的字符串
   * @param {Object} index 插入的位置
   */
  insert(original, str, index2) {
    if (index2 < 0) {
      throw new Error("The third argument cannot be less than 0");
    }
    return original.substring(0, index2) + str + original.substring(index2, original.length);
  },
  /**
   * 删除指定位置的字符串
   * @param {Object} original 原始字符串
   * @param {Object} index 删除的位置序列
   * @param {Object} num 删除的字符串长度
   */
  delete(original, index2, num) {
    if (index2 < 0) {
      throw new Error("The second argument cannot be less than 0");
    }
    if (num < 0) {
      throw new Error("The third argument cannot be less than 0");
    }
    return original.substring(0, index2) + original.substring(index2 + num, original.length);
  },
  /**
   * 替换指定位置的字符串
   * @param {Object} original 原始字符串
   * @param {Object} start 开始位置
   * @param {Object} end 结束位置
   * @param {Object} str 替换的字符串
   */
  replace(original, start, end, str) {
    if (start < 0) {
      throw new Error("The second argument cannot be less than 0");
    }
    if (end < 0) {
      throw new Error("The third argument cannot be less than 0");
    }
    return original.substring(0, start) + str + original.substring(end, original.length);
  },
  /**
   * 去除字符串空格
   * @param {Object} str 原始字符串
   * @param {Object} global 为true时去除所有空格，否则只去除两边空格
   */
  trim(str, global) {
    let result = str.replace(/(^\s+)|(\s+$)/g, "");
    if (global) {
      result = result.replace(/\s/g, "");
    }
    return result;
  }
};
const number = {
  /**
   * 数字格式化
   * @param {Number} num
   */
  formatNumber(num) {
    if (this.isNumber(num)) {
      return num.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
    }
    return num.toString();
  },
  /**
   * 判断是否数字
   * @param {Object} num
   */
  isNumber(num) {
    if (typeof num == "number" && !isNaN(num)) {
      return true;
    }
    return false;
  },
  /**
   * 多个数的加法运算
   */
  add(...values) {
    return values.reduce((num, value) => {
      let r1 = 0;
      let r2 = 0;
      let m = 0;
      try {
        r1 = num.toString().split(".")[1].length;
      } catch (e) {
      }
      try {
        r2 = value.toString().split(".")[1].length;
      } catch (e) {
      }
      m = Math.pow(10, Math.max(r1, r2));
      return (num * m + value * m) / m;
    });
  },
  /**
   * 多个数的减法运算
   */
  subtract(...values) {
    return values.reduce((num, value) => {
      let r1 = 0;
      let r2 = 0;
      let m = 0;
      try {
        r1 = num.toString().split(".")[1].length;
      } catch (e) {
      }
      try {
        r2 = value.toString().split(".")[1].length;
      } catch (e) {
      }
      m = Math.pow(10, Math.max(r1, r2));
      return (num * m - value * m) / m;
    });
  },
  /**
   * 多个数的乘法运算
   */
  mutiply(...values) {
    return values.reduce((num, value) => {
      let m = 0;
      let s1 = num.toString();
      let s2 = value.toString();
      try {
        m += s1.split(".")[1].length;
      } catch (e) {
      }
      try {
        m += s2.split(".")[1].length;
      } catch (e) {
      }
      return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
    });
  },
  /**
   * 多个数的除法运算
   */
  divide(...values) {
    return values.reduce((num, value) => {
      let t1 = 0;
      let t2 = 0;
      let s1 = num.toString();
      let s2 = value.toString();
      try {
        t1 = s1.split(".")[1].length;
      } catch (e) {
      }
      try {
        t2 = s2.split(".")[1].length;
      } catch (e) {
      }
      return Number(s1.replace(".", "")) / Number(s2.replace(".", "")) * Math.pow(10, t2 - t1);
    });
  }
};
const element = {
  /**
   * 判断是否是Window对象
   * @param {Object} data 入参
   */
  isWindow(data2) {
    return data2 && data2 instanceof Window;
  },
  /**
   * 获取元素距离某个定位祖先元素左侧/顶部/底部/右侧的距离
   * @param {Object} el 元素
   * @param {Object} root 定位父元素或者祖先元素，未指定则为document.body
   */
  getElementPoint(el, root) {
    if (!this.isElement(root)) {
      root = document.body;
    }
    if (!this.isContains(root, el)) {
      throw new Error("The second argument and the first argument have no hierarchical relationship");
    }
    const obj = el;
    let offsetTop = 0;
    let offsetLeft = 0;
    while (this.isElement(el) && this.isContains(root, el) && root !== el) {
      offsetTop += el.offsetTop;
      offsetLeft += el.offsetLeft;
      el = el.offsetParent;
    }
    let offsetRight = root.offsetWidth - offsetLeft - obj.offsetWidth;
    let offsetBottom = root.offsetHeight - offsetTop - obj.offsetHeight;
    return {
      top: offsetTop,
      left: offsetLeft,
      right: offsetRight,
      bottom: offsetBottom
    };
  },
  /**
   * 判断某个元素是否包含指定元素，包含相等关系和父子关系
   * @param {Object} parentNode 父元素或祖先元素
   * @param {Object} childNode 子元素
   */
  isContains(parentNode, childNode) {
    if (parentNode === childNode) {
      return true;
    }
    if (parentNode.contains) {
      return parentNode.contains(childNode);
    }
    if (parentNode.compareDocumentPosition) {
      return !!(parentNode.compareDocumentPosition(childNode) & 16);
    }
    return false;
  },
  /**
   * 判断某个元素是否是指定元素的父元素
   * @param {Object} parentNode 父元素
   * @param {Object} childNode 子元素
   */
  isParentNode(parentNode, childNode) {
    if (parentNode === childNode) {
      return false;
    }
    return childNode.parentNode === parentNode;
  },
  /**
   * 查找某个元素下指定选择器的子元素
   * @param {Object} el 元素
   * @param {Object} selector 支持多选择器，等同于querySelectorAll的参数
   */
  children(el, selector) {
    const elements = Array.from(el.querySelectorAll(selector ?? "*"));
    return Array.from(elements).filter((elm) => this.isParentNode(el, elm));
  },
  /**
   * 查找某个元素下指定选择器的兄弟元素
   * @param {Object} el 元素
   * @param {Object} selector 取值等同于queryselectorAll的参数，支持多选择器
   */
  siblings(el, selector) {
    if (!el.parentNode) {
      return [];
    }
    const elements = Array.from(el.parentNode.querySelectorAll(selector ?? "*"));
    return elements.filter((elm) => elm.parentNode === el.parentNode && elm != el);
  },
  /**
   * rem与px单位转换
   * @param {Object} num rem数值
   */
  rem2px(num) {
    const fs = this.getCssStyle(document.documentElement, "font-size");
    return number.mutiply(num, parseFloat(fs));
  },
  /**
   * rem与px单位转换
   * @param {Object} num px数值
   */
  px2rem(num) {
    const fs = this.getCssStyle(document.documentElement, "font-size");
    return number.divide(num, parseFloat(fs));
  },
  /**
   * 获取元素的内容宽度，内容宽度不包括border和padding
   * @param {Object} el 支持css选择器字符串，未指定则表示document.body
   */
  width(el) {
    if (typeof el == "string" && el) {
      el = document.body.querySelector(el);
    }
    if (!this.isElement(el)) {
      el = document.body;
    }
    const clientWidth = el.clientWidth;
    const paddingLeft_width = parseFloat(this.getCssStyle(el, "padding-left"));
    const paddingRight_width = parseFloat(this.getCssStyle(el, "padding-right"));
    return number.subtract(clientWidth, paddingLeft_width, paddingRight_width);
  },
  /**
   * 获取元素的内容高度，内容高度不包括border和padding
   * @param {Object} el 支持css选择器字符串 未指定则表示document.body
   */
  height(el) {
    if (typeof el == "string" && el) {
      el = document.body.querySelector(el);
    }
    if (!this.isElement(el)) {
      el = document.body;
    }
    const clientHeight = el.clientHeight;
    const paddingTop_height = parseFloat(this.getCssStyle(el, "padding-top"));
    const paddingBottom_height = parseFloat(this.getCssStyle(el, "padding-bottom"));
    return number.subtract(clientHeight, paddingTop_height, paddingBottom_height);
  },
  /**
   * 移除class
   * @param {Object} el 元素
   * @param {Object} className 支持多类,以空格划分
   */
  removeClass(el, className) {
    const classArray = string.trim(className).split(/\s+/);
    classArray.forEach((item) => {
      el.classList.remove(item);
    });
  },
  /**
   * 添加class
   * @param {Object} el 元素
   * @param {Object} className 支持多类,以空格划分
   */
  addClass(el, className) {
    const classArray = string.trim(className).split(/\s+/);
    classArray.forEach((item) => {
      el.classList.add(item);
    });
  },
  /**
   * 判断指定元素是否含有指定类名
   * @param {Object} el 元素
   * @param {Object} className 支持多类,以空格划分
   */
  hasClass(el, className) {
    const classArray = string.trim(className).split(/\s+/);
    return classArray.every((item) => {
      return el.classList.contains(item);
    });
  },
  /**
   * 监听元素滚动到顶部或者底部
   * @param {Object} el 支持css选择器字符串 未指定则为窗口滚动
   * @param {Object} callback 回调函数
   */
  scrollTopBottomTrigger(el, callback) {
    if (typeof el == "string" && el) {
      el = document.body.querySelector(el);
    }
    let scrollEle = window;
    if (this.isElement(el) && el != document.body && el != document.documentElement) {
      scrollEle = el;
    }
    if (typeof el == "function") {
      callback = el;
    }
    let flag = true;
    scrollEle.addEventListener("scroll", () => {
      if (this.getScrollTop(scrollEle) <= 0) {
        const options = {
          state: "top",
          target: scrollEle
        };
        if (!flag) {
          return;
        }
        if (typeof callback == "function") {
          flag = false;
          callback(options);
        }
      } else {
        const options = {
          state: "bottom",
          target: scrollEle
        };
        let height = 0;
        if (scrollEle == window) {
          height = window.innerHeight;
        } else {
          height = scrollEle.clientHeight;
        }
        if (number.add(this.getScrollTop(scrollEle), height) + 1 >= this.getScrollHeight(scrollEle) && height != this.getScrollHeight(scrollEle)) {
          if (!flag) {
            return;
          }
          if (typeof callback == "function") {
            flag = false;
            callback(options);
          }
        } else {
          flag = true;
        }
      }
    });
  },
  /**
   * 获取文档或元素的总宽度
   * @param {Object} el 支持css选择器字符串 未指定则表示整个页面文档
   */
  getScrollWidth(el) {
    if (typeof el == "string" && el) {
      el = document.body.querySelector(el);
    }
    let scrollWidth = 0;
    if (this.isElement(el) && el != document.documentElement && el != document.body) {
      scrollWidth = el.scrollWidth;
    } else {
      if (document.documentElement.scrollWidth == 0 || document.body.scrollWidth == 0) {
        scrollWidth = document.documentElement.scrollWidth || document.body.scrollWidth;
      } else {
        scrollWidth = document.documentElement.scrollWidth > document.body.scrollWidth ? document.documentElement.scrollWidth : document.body.scrollWidth;
      }
    }
    return scrollWidth;
  },
  /**
   * 获取文档或者元素的总高度
   * @param {Object} el 支持css选择器字符串 未指定则表示整个页面文档
   */
  getScrollHeight(el) {
    if (typeof el == "string" && el) {
      el = document.body.querySelector(el);
    }
    let scrollHeight = 0;
    if (this.isElement(el) && el != document.documentElement && el != document.body) {
      scrollHeight = el.scrollHeight;
    } else {
      if (document.documentElement.scrollHeight == 0 || document.body.scrollHeight == 0) {
        scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      } else {
        scrollHeight = document.documentElement.scrollHeight > document.body.scrollHeight ? document.documentElement.scrollHeight : document.body.scrollHeight;
      }
    }
    return scrollHeight;
  },
  /**
   * 设置滚动条在Y轴上的距离
   * @param {Object} options {el,number,time} el支持css选择器字符串 未指定则为窗口滚动
   */
  setScrollTop(options) {
    let isWindow = false;
    let el = options.el;
    if (typeof el == "string" && el) {
      el = document.body.querySelector(el);
    }
    const number$1 = options.number || 0;
    const time = options.time || 0;
    if (!this.isElement(el) || el == document.body || el == document.documentElement || el == window) {
      isWindow = true;
    }
    return new Promise((resolve) => {
      if (time <= 0) {
        if (isWindow) {
          document.documentElement.scrollTop = document.body.scrollTop = number$1;
        } else {
          el.scrollTop = number$1;
        }
        resolve();
      } else {
        const spacingTime = 10;
        let spacingIndex = number.divide(time, spacingTime);
        let nowTop = this.getScrollTop(el);
        const everTop = number.divide(number.subtract(number$1, nowTop), spacingIndex);
        const scrollTimer = setInterval(() => {
          if (spacingIndex > 0) {
            spacingIndex--;
            if (isWindow) {
              document.documentElement.scrollTop = document.body.scrollTop = nowTop = number.add(nowTop, everTop);
            } else {
              el.scrollTop = nowTop = number.add(nowTop, everTop);
            }
          } else {
            clearInterval(scrollTimer);
            resolve();
          }
        }, spacingTime);
      }
    });
  },
  /**
   * 获取滚动条在Y轴上滚动的距离
   * @param {Object} el 支持css选择器字符串 未指定则为窗口滚动
   */
  getScrollTop(el) {
    if (typeof el == "string" && el) {
      el = document.body.querySelector(el);
    }
    let scrollTop = 0;
    if (this.isElement(el) && el != document.body && el != document.documentElement && el != window) {
      scrollTop = el.scrollTop;
    } else {
      if (document.documentElement.scrollTop == 0 || document.body.scrollTop == 0) {
        scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      } else {
        scrollTop = document.documentElement.scrollTop > document.body.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop;
      }
    }
    return scrollTop;
  },
  /**
   * 获取滚动条在X轴上滚动的距离
   * @param {Object} el 支持css选择器字符串 未指定则为窗口滚动
   */
  getScrollLeft(el) {
    if (typeof el == "string" && el) {
      el = document.body.querySelector(el);
    }
    let scrollLeft = 0;
    if (this.isElement(el) && el != document.body && el != document.documentElement && el != window) {
      scrollLeft = el.scrollLeft;
    } else {
      if (document.documentElement.scrollLeft == 0 || document.body.scrollLeft == 0) {
        scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
      } else {
        scrollLeft = document.documentElement.scrollLeft > document.body.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft;
      }
    }
    return scrollLeft;
  },
  /**
   * 设置滚动条在X轴上的距离
   * @param {Object} options {el,number,time} el支持css选择器字符串 未指定则为窗口滚动
   */
  setScrollLeft(options) {
    let isWindow = false;
    let el = options.el;
    if (typeof el == "string" && el) {
      el = document.body.querySelector(el);
    }
    const number$1 = options.number || 0;
    const time = options.time || 0;
    if (!this.isElement(el) || el == document.body || el == document.documentElement || el == window) {
      isWindow = true;
    }
    return new Promise((resolve) => {
      if (time <= 0) {
        if (isWindow) {
          document.documentElement.scrollLeft = document.body.scrollLeft = number$1;
        } else {
          el.scrollLeft = number$1;
        }
        resolve();
      } else {
        const spacingTime = 10;
        let spacingIndex = number.divide(time, spacingTime);
        let nowLeft = this.getScrollLeft(el);
        const everLeft = number.divide(number.subtract(number$1, nowLeft), spacingIndex);
        let scrollTimer = setInterval(() => {
          if (spacingIndex > 0) {
            spacingIndex--;
            if (isWindow) {
              document.documentElement.scrollLeft = document.body.scrollLeft = nowLeft = number.add(nowLeft, everLeft);
            } else {
              el.scrollLeft = nowLeft = number.add(nowLeft, everLeft);
            }
          } else {
            clearInterval(scrollTimer);
            resolve();
          }
        }, spacingTime);
      }
    });
  },
  /**
   * 获取元素指定样式
   * @param {Object} el 元素
   * @param {Object} cssName 样式名称
   */
  getCssStyle(el, cssName) {
    let cssText = "";
    if (document.defaultView && document.defaultView.getComputedStyle) {
      cssText = document.defaultView.getComputedStyle(el)[cssName];
    } else {
      cssText = el.currentStyle[cssName];
    }
    return cssText;
  },
  /**
   * 判断字符串属于哪种选择器
   * @param {Object} selector
   */
  getCssSelector(selector) {
    if (/^#{1}/.test(selector)) {
      return {
        type: "id",
        value: selector.substring(1)
      };
    }
    if (/^\./.test(selector)) {
      return {
        type: "class",
        value: selector.substring(1)
      };
    }
    if (/^\[(.+)\]$/.test(selector)) {
      let value = "";
      const attribute = string.trim(selector, true).substring(1, string.trim(selector, true).length - 1);
      const arry = attribute.split("=");
      if (arry.length == 1) {
        value = arry[0];
      }
      if (arry.length == 2) {
        value = {
          attributeName: arry[0],
          attributeValue: arry[1].replace(/\'/g, "").replace(/\"/g, "")
          //去除属性值的单引号或者双引号
        };
      }
      return {
        type: "attribute",
        value
      };
    }
    return {
      type: "tag",
      value: selector
    };
  },
  /**
   * 获取元素距离可视窗口的位置
   * @param {Object} el 支持css选择器字符串 未指定则为document.body
   */
  getElementBounding(el) {
    if (typeof el == "string" && el) {
      el = document.body.querySelector(el);
    }
    if (!this.isElement(el)) {
      el = document.body;
    }
    const point = el.getBoundingClientRect();
    const top = point.top;
    const bottom = number.subtract(document.documentElement.clientHeight || window.innerHeight, point.bottom);
    const left = point.left;
    const right = number.subtract(document.documentElement.clientWidth || window.innerWidth, point.right);
    return {
      top,
      bottom,
      left,
      right
    };
  },
  /**
   * 判断是否是元素
   * @param {Object} el
   */
  isElement(el) {
    return !!el && el instanceof Node && el.nodeType === 1;
  },
  /**
   * 字符串转dom
   * @param {Object} html
   */
  string2dom(html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    if (template.content.children.length == 1) {
      return template.content.children[0];
    }
    return Array.from(template.content.children);
  }
};
const createUniqueKey = () => {
  let key = data.get(window, "animator-clip-key") || 0;
  key++;
  data.set(window, "animator-clip-key", key);
  return key;
};
class Clip {
  constructor(options) {
    /**
     * 样式名称
     */
    __publicField(this, "style");
    /**
     * 样式最终值
     */
    __publicField(this, "value");
    /**
     * 动画速度，即每次改变的量
     */
    __publicField(this, "speed");
    /**
     * 是否自由模式
     */
    __publicField(this, "free", false);
    /**
     * 动画开始事件
     */
    __publicField(this, "onStart");
    /**
     * 动画停止事件
     */
    __publicField(this, "onStop");
    /**
     * 动画重置事件
     */
    __publicField(this, "onReset");
    /**
     * 动画更新前事件，此时样式还未改变
     */
    __publicField(this, "onBeforeUpdate");
    /**
     * 动画更新时事件，此时样式已经改变
     */
    __publicField(this, "onUpdate");
    /**
     * 动画完成事件
     */
    __publicField(this, "onComplete");
    // 以下是不参与构建实例的属性
    /**
     * 唯一key
     */
    __publicField(this, "key", createUniqueKey());
    /**
     * 类型，0表示普通clip，1表示chain型clip
     */
    __publicField(this, "type", 0);
    /**
     * 动画每次更新的间隔时间，单位ms
     */
    __publicField(this, "interval", 0);
    /**
     * 样式的单位
     */
    __publicField(this, "unit");
    /**
     * requestAnimationFrame动画API
     */
    __publicField(this, "requestAnimationFrame");
    /**
     * 动画状态，0表示动画初始状态，1表示动画进行状态，2表示动画停止状态，3表示动画完成状态
     */
    __publicField(this, "state", 0);
    /**
     * 链式调用的动画
     */
    __publicField(this, "chainClip");
    /**
     * 样式初始值
     */
    __publicField(this, "initValue");
    /**
     * animator实例
     */
    __publicField(this, "parent");
    /**
     * 每次动画帧执行的时间戳记录
     */
    __publicField(this, "timeStamp", 0);
    if (options) {
      this.style = options.style;
      this.speed = options.speed;
      this.free = options.free ?? false;
      this.value = typeof options.value == "number" ? options.value : parseFloat(options.value);
      this.unit = this.getUnit(options.value);
      if (options.onStart) this.onStart = options.onStart;
      if (options.onStop) this.onStop = options.onStop;
      if (options.onReset) this.onReset = options.onReset;
      if (options.onBeforeUpdate) this.onBeforeUpdate = options.onBeforeUpdate;
      if (options.onUpdate) this.onUpdate = options.onUpdate;
      if (options.onComplete) this.onComplete = options.onComplete;
    } else {
      this.free = true;
    }
    this.requestAnimationFrame = this.getRequestAnimationFrame();
  }
  /**
   * 开始动画
   */
  start() {
    var _a, _b;
    if (!this.parent || !this.parent.$el) {
      throw new Error("The clip has not been added to the animator");
    }
    if (!this.free) {
      const oldValue = this.getUnitCssValue();
      if (this.speed > 0 && oldValue >= this.value) {
        return this;
      }
      if (this.speed < 0 && oldValue <= this.value) {
        return this;
      }
    }
    if (this.state == 1 || this.state == 3) {
      return this;
    }
    this.timeStamp = Date.now();
    this.interval = 0;
    this.state = 1;
    (_a = this.parent.onStart) == null ? void 0 : _a.apply(this.parent, [this, this.parent.$el]);
    (_b = this.onStart) == null ? void 0 : _b.apply(this, [this.parent.$el]);
    const doFun = () => {
      var _a2, _b2, _c, _d, _e, _f, _g, _h, _i, _j;
      if (this.state != 1) {
        return 1;
      }
      const now = Date.now();
      this.interval = now - this.timeStamp;
      this.timeStamp = now;
      if (this.free) {
        (_a2 = this.parent.onBeforeUpdate) == null ? void 0 : _a2.apply(this.parent, [this, this.parent.$el]);
        (_b2 = this.onBeforeUpdate) == null ? void 0 : _b2.apply(this, [this.parent.$el]);
        (_c = this.parent.onUpdate) == null ? void 0 : _c.apply(this.parent, [this, this.parent.$el]);
        (_d = this.onUpdate) == null ? void 0 : _d.apply(this, [this.parent.$el]);
        this.requestAnimationFrame.apply(window, [doFun]);
      } else {
        const currentValue = this.getUnitCssValue();
        (_e = this.parent.onBeforeUpdate) == null ? void 0 : _e.apply(this.parent, [this, this.parent.$el, this.style, currentValue]);
        (_f = this.onBeforeUpdate) == null ? void 0 : _f.apply(this, [this.parent.$el, this.style, currentValue]);
        const newValue = currentValue + this.speed;
        if (this.unit) {
          this.parent.$el.style.setProperty(this.style, newValue + this.unit, "important");
        } else {
          this.parent.$el.style.setProperty(this.style, newValue + "", "important");
        }
        (_g = this.parent.onUpdate) == null ? void 0 : _g.apply(this.parent, [this, this.parent.$el, this.style, newValue]);
        (_h = this.onUpdate) == null ? void 0 : _h.apply(this, [this.parent.$el, this.style, newValue]);
        if (this.speed > 0 && newValue >= this.value || this.speed < 0 && newValue <= this.value) {
          if (this.unit) {
            this.parent.$el.style.setProperty(this.style, this.value + this.unit, "important");
          } else {
            this.parent.$el.style.setProperty(this.style, this.value + "", "important");
          }
          this.timeStamp = 0;
          this.interval = 0;
          this.state = 3;
          (_i = this.parent.onComplete) == null ? void 0 : _i.apply(this.parent, [this, this.parent.$el]);
          (_j = this.onComplete) == null ? void 0 : _j.apply(this, [this.parent.$el]);
          if (this.chainClip) {
            if (this.parent.hasClip(this.chainClip)) {
              this.parent.removeClip(this.chainClip).addClip(this.chainClip);
            } else {
              this.parent.addClip(this.chainClip);
            }
            this.chainClip.start();
          }
        } else {
          this.requestAnimationFrame.apply(window, [doFun]);
        }
      }
      return 1;
    };
    this.requestAnimationFrame.apply(window, [doFun]);
    return this;
  }
  /**
   * 停止动画
   */
  stop() {
    var _a, _b;
    if (!this.parent || !this.parent.$el) {
      throw new Error("The clip has not been added to the animator");
    }
    if (this.state != 1) {
      return this;
    }
    this.timeStamp = 0;
    this.interval = 0;
    this.state = 2;
    (_a = this.parent.onStop) == null ? void 0 : _a.apply(this.parent, [this, this.parent.$el]);
    (_b = this.onStop) == null ? void 0 : _b.apply(this, [this.parent.$el]);
    return this;
  }
  /**
   * 重置动画
   */
  reset(resetStyle = true) {
    var _a, _b;
    if (!this.parent || !this.parent.$el) {
      throw new Error("The clip has not been added to the animator");
    }
    if (this.state == 0) {
      return this;
    }
    this.timeStamp = 0;
    this.interval = 0;
    this.state = 0;
    if (!this.free && resetStyle) {
      this.parent.$el.style.setProperty(this.style, this.initValue + "", "important");
    }
    (_a = this.parent.onReset) == null ? void 0 : _a.apply(this.parent, [this, this.parent.$el]);
    (_b = this.onReset) == null ? void 0 : _b.apply(this, [this.parent.$el]);
    if (this.type == 1) {
      this.parent.removeClip(this);
    }
    return this;
  }
  /**
   * 链式调用动画
   */
  chain(clip) {
    if (clip.parent) {
      throw new Error("The clip has been added to an animator instance and cannot be passed as a chain argument");
    }
    clip.type = 1;
    this.chainClip = clip;
    return clip;
  }
  /**
   * 主动触发完成事件
   */
  emitComplete() {
    var _a, _b;
    if (!this.parent || !this.parent.$el) {
      throw new Error("The clip has not been added to the animator");
    }
    if (!this.free) {
      return;
    }
    if (this.state == 0 || this.state == 3) {
      return;
    }
    this.state = 3;
    (_a = this.parent.onComplete) == null ? void 0 : _a.apply(this.parent, [this, this.parent.$el]);
    (_b = this.onComplete) == null ? void 0 : _b.apply(this, [this.parent.$el]);
    if (this.chainClip) {
      if (this.parent.hasClip(this.chainClip)) {
        this.parent.removeClip(this.chainClip).addClip(this.chainClip);
      } else {
        this.parent.addClip(this.chainClip);
      }
      this.chainClip.start();
    }
  }
  /**
   * 获取元素基于单位unit的值
   */
  getUnitCssValue() {
    const value = parseFloat(element.getCssStyle(this.parent.$el, this.style));
    if (this.unit == "rem") {
      return element.px2rem(value);
    }
    if (this.unit == "em") {
      return this.px2em(this.parent.$el, value);
    }
    return value;
  }
  /**
   * requestAnimationFrame兼容性封装
   */
  getRequestAnimationFrame() {
    if (window.requestAnimationFrame) {
      return window.requestAnimationFrame;
    }
    let lastTime = 0;
    return function(callback) {
      let currTime = Date.now();
      let timeToCall = Math.max(0, 1e3 / 60 - (currTime - lastTime));
      window.setTimeout(callback, timeToCall);
      lastTime = currTime + timeToCall;
      return 1;
    };
  }
  /**
   * 获取单位值
   */
  getUnit(value) {
    if (typeof value == "number") {
      return;
    }
    if (value.endsWith("px")) {
      return "px";
    }
    if (value.endsWith("rem")) {
      return "rem";
    }
    if (value.endsWith("em")) {
      return "em";
    }
  }
  /**
   * px转为em
   */
  px2em(el, number2) {
    const parentNode = el.parentNode || el.parentElement;
    const fs = element.getCssStyle(parentNode, "font-size");
    return number2 / parseFloat(fs);
  }
}
export {
  Animator,
  Clip
};
