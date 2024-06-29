var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class Clip {
  constructor(options) {
    //唯一标志
    __publicField(this, "id");
    //样式名称
    __publicField(this, "style");
    //样式最终值
    __publicField(this, "value");
    //动画速度，即每次样式改变的量
    __publicField(this, "speed");
    //是否自由模式
    __publicField(this, "free", false);
    //动画每次更新间隔时间
    __publicField(this, "interval", 0);
    //配置参数
    __publicField(this, "$options");
    //样式单位，无单位则为undefined
    __publicField(this, "$unit");
    //动画api
    __publicField(this, "$requestAnimationFrame");
    //0表示动画初始状态，1表示动画进行状态，2表示动画停止状态，3表示动画完成状态
    __publicField(this, "state", 0);
    //自定义事件数组
    __publicField(this, "$events", [
      //动画开始事件
      {
        name: "start",
        handler: function() {
        }
      },
      //动画结束事件
      {
        name: "complete",
        handler: function() {
        }
      },
      //动画更新之前
      {
        name: "beforeUpdate",
        handler: function() {
        }
      },
      //动画更新事件
      {
        name: "update",
        handler: function() {
        }
      },
      //动画停止事件
      {
        name: "stop",
        handler: function() {
        }
      },
      //动画重置事件
      {
        name: "reset",
        handler: function() {
        }
      }
    ]);
    //连续调用的动画
    __publicField(this, "$chainClip");
    //0表示普通clip，1表示chain型clip
    __publicField(this, "$type", 0);
    //属性值初始值
    __publicField(this, "$initValue");
    //animator实例
    __publicField(this, "$parent");
    //每次动画帧执行时的时间戳记录
    __publicField(this, "$timeStamp", 0);
    if (!options) {
      this.free = true;
    } else if (typeof options == "object" && options) {
      if (typeof options.free == "boolean") {
        this.free = options.free;
      } else {
        this.free = false;
      }
      if (!this.free) {
        if (typeof options.style == "string" && options.style) {
          this.style = options.style;
        } else {
          throw new TypeError("The style argument should be a string");
        }
        if (typeof options.value == "number") {
          this.value = options.value;
          this.$unit = null;
        } else if (typeof options.value == "string" && options.value) {
          this.value = parseFloat(options.value);
          if (options.value.endsWith("px")) {
            this.$unit = "px";
          } else if (options.value.endsWith("rem")) {
            this.$unit = "rem";
          } else if (options.value.endsWith("em")) {
            this.$unit = "em";
          } else {
            throw new Error("Currently, only attribute values of px, rem, and em units are supported");
          }
        } else {
          throw new TypeError("The value argument should be a number or string");
        }
        if (typeof options.speed == "number") {
          this.speed = options.speed;
        } else {
          throw new TypeError("The speed argument should be a number");
        }
      }
    } else {
      throw new Error("The construction parameter of the clip must be a non-null object");
    }
    this.$requestAnimationFrame = this.__getRequestAnimationFrame();
  }
  /**
   * 执行动画
   */
  start() {
    if (!this.$parent || !this.$parent.$el) {
      throw new ReferenceError("The clip has not been added to the animator");
    }
    if (!this.free) {
      let oldValue = this.__getUnitCssValue();
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
    this.$timeStamp = Date.now();
    this.interval = 0;
    this.state = 1;
    this.$parent.$options.start.apply(this.$parent, [this, this.$parent.$el]);
    this.__emit("start");
    let doFun = () => {
      if (this.state != 1) {
        return;
      }
      let now = Date.now();
      this.interval = now - this.$timeStamp;
      this.$timeStamp = now;
      if (this.free) {
        this.$parent.$options.beforeUpdate.apply(this.$parent, [this, this.$parent.$el]);
        this.__emit("beforeUpdate");
        this.$parent.$options.update.apply(this.$parent, [this, this.$parent.$el]);
        this.__emit("update");
        this.$requestAnimationFrame.apply(window, [doFun]);
      } else {
        let currentValue = this.__getUnitCssValue();
        this.$parent.$options.beforeUpdate.apply(this.$parent, [this, this.$parent.$el, this.style, currentValue]);
        this.__emit("beforeUpdate", [this.style, currentValue]);
        let newValue = currentValue + this.speed;
        if (this.$unit) {
          this.$parent.$el.style.setProperty(this.style, newValue + this.$unit, "important");
        } else {
          this.$parent.$el.style.setProperty(this.style, newValue + "", "important");
        }
        this.$parent.$options.update.apply(this.$parent, [this, this.$parent.$el, this.style, newValue]);
        this.__emit("update", [this.style, newValue]);
        if (this.speed > 0 && newValue >= this.value || this.speed < 0 && newValue <= this.value) {
          if (this.$unit) {
            this.$parent.$el.style.setProperty(this.style, this.value + this.$unit, "important");
          } else {
            this.$parent.$el.style.setProperty(this.style, this.value + "", "important");
          }
          this.$timeStamp = 0;
          this.interval = 0;
          this.state = 3;
          this.$parent.$options.complete.apply(this.$parent, [this, this.$parent.$el]);
          this.__emit("complete");
          if (this.$chainClip) {
            if (this.$parent.hasClip(this.$chainClip)) {
              this.$parent.removeClip(this.$chainClip).addClip(this.$chainClip);
            } else {
              this.$parent.addClip(this.$chainClip);
            }
            this.$chainClip.start();
          }
        } else {
          this.$requestAnimationFrame.apply(window, [doFun]);
        }
      }
    };
    this.$requestAnimationFrame.apply(window, [doFun]);
    return this;
  }
  /**
   * 停止动画
   */
  stop() {
    if (!this.$parent || !this.$parent.$el) {
      throw new ReferenceError("The clip has not been added to the animator");
    }
    if (this.state != 1) {
      return this;
    }
    this.$timeStamp = 0;
    this.interval = 0;
    this.state = 2;
    this.$parent.$options.stop.apply(this.$parent, [this, this.$parent.$el]);
    this.__emit("stop");
    return this;
  }
  /**
   * 重置动画
   */
  reset(reStoreStyle) {
    if (!this.$parent || !this.$parent.$el) {
      throw new ReferenceError("The clip has not been added to the animator");
    }
    if (this.state == 0) {
      return this;
    }
    if (typeof reStoreStyle != "boolean") {
      reStoreStyle = true;
    }
    this.$timeStamp = 0;
    this.interval = 0;
    this.state = 0;
    if (!this.free && reStoreStyle) {
      this.$parent.$el.style.setProperty(this.style, this.$initValue + "", "important");
    }
    this.$parent.$options.reset.apply(this.$parent, [this, this.$parent.$el]);
    this.__emit("reset");
    if (this.$type == 1) {
      this.$parent.removeClip(this);
    }
    return this;
  }
  /**
   * 连续执行动画
   * @param {Object} clip
   */
  chain(clip) {
    if (!clip) {
      throw new TypeError("The parameter is not defined");
    }
    if (!(clip instanceof Clip)) {
      throw new TypeError("The parameter is not a Clip instance");
    }
    if (clip.$parent) {
      throw new ReferenceError("The clip has been added to an animator instance and cannot be passed as a chain argument");
    }
    clip.$type = 1;
    this.$chainClip = clip;
    return clip;
  }
  /**
   * 主动触发完成事件
   */
  emitComplete() {
    if (!this.free) {
      return;
    }
    if (this.state == 0 || this.state == 3) {
      return;
    }
    this.state = 3;
    this.$parent.$options.complete.apply(this.$parent, [this, this.$parent.$el]);
    this.__emit("complete");
    if (this.$chainClip) {
      if (this.$parent.hasClip(this.$chainClip)) {
        this.$parent.removeClip(this.$chainClip).addClip(this.$chainClip);
      } else {
        this.$parent.addClip(this.$chainClip);
      }
      this.$chainClip.start();
    }
  }
  /**
   * 自定义事件执行
   */
  on(eventName, handler) {
    let event = this.__getEvent(eventName);
    if (event) {
      event.handler = handler;
    } else {
      throw new Error(eventName + " is an illegal event");
    }
    return this;
  }
  /**
   * requestAnimationFrame兼容性封装
   */
  __getRequestAnimationFrame() {
    let animation = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
    if (!animation) {
      let lastTime = 0;
      animation = function(callback) {
        let currTime = Date.now();
        let timeToCall = Math.max(0, 1e3 / 60 - (currTime - lastTime));
        window.setTimeout(callback, timeToCall);
        lastTime = currTime + timeToCall;
      };
    }
    return animation;
  }
  /**
   * 触发自定义事件
   * @param {Object} eventName
   * @param {Object} params
   */
  __emit(eventName, params) {
    let event = this.__getEvent(eventName);
    if (event) {
      if (params) {
        event.handler.apply(this, [this.$parent.$el, ...params]);
      } else {
        event.handler.apply(this, [this.$parent.$el]);
      }
    }
  }
  /**
   * 获取事件数组中指定事件
   * @param {Object} eventName
   */
  __getEvent(eventName) {
    let arr = this.$events.filter((event) => {
      return event.name == eventName;
    });
    return arr[0];
  }
  /**
   * 获取元素基于单位$unit的值
   */
  __getUnitCssValue() {
    let value = parseFloat(this.__getCssStyle(this.$parent.$el, this.style));
    if (this.$unit == "rem") {
      return this.__px2rem(value);
    } else if (this.$unit == "em") {
      return this.__px2em(this.$parent.$el, value);
    }
    return value;
  }
  /**
   * 获取元素指定样式值
   * @param {Object} el
   * @param {Object} cssName
   */
  __getCssStyle(el, cssName) {
    if (typeof cssName == "string") {
      let cssText = "";
      if (document.defaultView && document.defaultView.getComputedStyle) {
        cssText = document.defaultView.getComputedStyle(el)[cssName];
      } else {
        cssText = el.currentStyle[cssName];
      }
      return cssText;
    }
    return null;
  }
  /**
   * px转为rem
   * @param {Object} number
   */
  __px2rem(number) {
    let fs = this.__getCssStyle(document.documentElement, "font-size");
    return number / parseFloat(fs);
  }
  /**
   * px转为em
   * @param {Object} el
   * @param {Object} number
   */
  __px2em(el, number) {
    let parentNode = el.parentNode || el.parentElement;
    let fs = this.__getCssStyle(parentNode, "font-size");
    return number / parseFloat(fs);
  }
}
class Animator {
  //构造方法
  constructor(el, options) {
    //动画绑定元素
    __publicField(this, "$el");
    //参数配置
    __publicField(this, "$options");
    //该实例下的所有clip实例
    __publicField(this, "clips");
    if (typeof el == "string" && el) {
      this.$el = document.body.querySelector(el);
    } else {
      this.$el = el;
    }
    this.$options = options;
    this.clips = [];
    if (!this.$el) {
      throw new ReferenceError("The first construction argument of an animator should be an element or selector");
    }
    if (!(this.$el instanceof Node) || this.$el.nodeType !== 1) {
      throw new TypeError("The first construction argument of an animator should be an element or selector");
    }
    if (typeof this.$options != "object" || !this.$options) {
      this.$options = {};
    }
    if (typeof this.$options.start != "function") {
      this.$options.start = function() {
      };
    }
    if (typeof this.$options.complete != "function") {
      this.$options.complete = function() {
      };
    }
    if (typeof this.$options.beforeUpdate != "function") {
      this.$options.beforeUpdate = function() {
      };
    }
    if (typeof this.$options.update != "function") {
      this.$options.update = function() {
      };
    }
    if (typeof this.$options.stop != "function") {
      this.$options.stop = function() {
      };
    }
    if (typeof this.$options.reset != "function") {
      this.$options.reset = function() {
      };
    }
  }
  /**
   * 判断是否包含某个clip
   */
  hasClip(clip) {
    if (!clip.$parent || typeof clip.id != "number" || isNaN(clip.id)) {
      return false;
    }
    return this.clips.some((item) => {
      return item.id === clip.id;
    });
  }
  /**
   * 将clip添加到队列
   */
  addClip(clip) {
    if (!clip) {
      throw new TypeError("Parameter does not exist");
    }
    if (!(clip instanceof Clip)) {
      throw new TypeError("The parameter is not a Clip instance");
    }
    if (!this.hasClip(clip) && clip.$parent) {
      throw new Error("The clip has been added to other animator");
    }
    if (this.hasClip(clip)) {
      throw new Error("The clip has been added to the animator");
    }
    if (this.clips.length == 0) {
      clip.id = 0;
    } else {
      let maxClipId = this.clips[0].id;
      clip.id = maxClipId + 1;
    }
    clip.$parent = this;
    if (!clip.free) {
      if (clip.$unit) {
        clip.$initValue = clip.__getUnitCssValue() + clip.$unit;
      } else {
        clip.$initValue = clip.__getUnitCssValue();
      }
    }
    this.clips.unshift(clip);
    return this;
  }
  /**
   * 将clip移出队列
   * @param {Object} clip
   */
  removeClip(clip) {
    if (!clip) {
      throw new TypeError("Parameter does not exist");
    }
    if (!(clip instanceof Clip)) {
      throw new TypeError("The parameter is not a Clip instance");
    }
    if (!clip.$parent || typeof clip.id != "number" || isNaN(clip.id)) {
      throw new Error("The clip has not been added to the animator");
    }
    if (!this.hasClip(clip)) {
      throw new Error("The clip does not belong to the animator");
    }
    this.clips = this.clips.filter((item) => {
      return item.id != clip.id;
    });
    clip.state = 0;
    clip.$timeStamp = 0;
    clip.interval = 0;
    if (!clip.free) {
      clip.$parent.$el.style.setProperty(clip.style, clip.$initValue + "", "important");
      clip.$initValue = void 0;
    }
    clip.$parent = void 0;
    clip.id = void 0;
    return this;
  }
  /**
   * 移除全部clip
   */
  removeAllClips() {
    let clips = [...this.clips];
    clips.forEach((clip) => {
      this.removeClip(clip);
    });
    return this;
  }
  /**
   * 获取正在运行的clip
   */
  getClips() {
    return this.clips.filter((clip) => {
      return clip.state == 1;
    });
  }
  /**
   * 获取停止状态的clip
   */
  getStopClips() {
    return this.clips.filter((clip) => {
      return clip.state == 2;
    });
  }
  /**
   * 获取已完成的clip
   */
  getCompleteClips() {
    return this.clips.filter((clip) => {
      return clip.state == 3;
    });
  }
  /**
   * 执行动画
   */
  start() {
    this.clips.forEach((clip) => {
      clip.start();
    });
    return this;
  }
  /**
   * 停止动画
   */
  stop() {
    this.clips.forEach((clip) => {
      clip.stop();
    });
    return this;
  }
  /**
   * 重置动画
   */
  reset(reStoreStyle) {
    this.clips.forEach((clip) => {
      clip.reset(reStoreStyle);
    });
    return this;
  }
}
export {
  Animator,
  Clip,
  Animator as default
};
