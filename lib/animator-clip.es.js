class Clip {
  constructor(options) {
    this.id = void 0;
    this.style = void 0;
    this.value = void 0;
    this.speed = void 0;
    this.free = false;
    this.interval = 0;
    this.$options = options;
    this.$unit = void 0;
    this.$requestAnimationFrame = void 0;
    this.state = 0;
    this.$events = [];
    this.$chainClip = void 0;
    this.$type = 0;
    this.$initValue = void 0;
    this.$parent = void 0;
    this.$timeStamp = 0;
    this.__init();
  }
  /**
   * 初始化参数
   */
  __init() {
    if (!this.$options) {
      this.free = true;
      this.$options = void 0;
    } else if (typeof this.$options == "object" && this.$options) {
      if (typeof this.$options.free == "boolean") {
        this.free = this.$options.free;
      } else {
        this.free = false;
      }
      if (!this.free) {
        if (typeof this.$options.style == "string" && this.$options.style) {
          this.style = this.$options.style;
        } else {
          throw new TypeError("The style argument should be a string");
        }
        if (typeof this.$options.value == "number") {
          this.value = this.$options.value;
          this.$unit = null;
        } else if (typeof this.$options.value == "string" && this.$options.value) {
          this.value = parseFloat(this.$options.value);
          if (this.$options.value.endsWith("px")) {
            this.$unit = "px";
          } else if (this.$options.value.endsWith("rem")) {
            this.$unit = "rem";
          } else if (this.$options.value.endsWith("em")) {
            this.$unit = "em";
          } else {
            throw new Error("Currently, only attribute values of px, rem, and em units are supported");
          }
        } else {
          throw new TypeError("The value argument should be a number or string");
        }
        if (typeof this.$options.speed == "number") {
          this.speed = this.$options.speed;
        } else {
          throw new TypeError("The speed argument should be a number");
        }
      }
    } else {
      throw new Error("The construction parameter of the clip must be a non-null object");
    }
    this.$requestAnimationFrame = this.__getRequestAnimationFrame();
    this.$events = [
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
    ];
  }
  /**
   * 执行动画
   */
  start() {
    if (!this.$parent || !this.$parent.$el) {
      throw new ReferenceError("The clip has not been added to the animator");
    }
    if (!this.free) {
      let oldValue = this._getUnitCssValue();
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
    this.$parent.$options.start.call(this.$parent, this, this.$parent.$el);
    this.__emit("start");
    let doFun = () => {
      if (this.state != 1) {
        return;
      }
      let now = Date.now();
      this.interval = now - this.$timeStamp;
      this.$timeStamp = now;
      if (this.free) {
        this.$parent.$options.beforeUpdate.call(this.$parent, this, this.$parent.$el);
        this.__emit("beforeUpdate");
        this.$parent.$options.update.call(this.$parent, this, this.$parent.$el);
        this.__emit("update");
        this.$requestAnimationFrame.call(window, doFun);
      } else {
        let currentValue = this._getUnitCssValue();
        this.$parent.$options.beforeUpdate.call(this.$parent, this, this.$parent.$el, this.style, currentValue);
        this.__emit("beforeUpdate", [this.style, currentValue]);
        let newValue = Number((currentValue + this.speed).toFixed(2));
        if (this.$unit) {
          this.$parent.$el.style.setProperty(this.style, newValue + this.$unit, "important");
        } else {
          this.$parent.$el.style.setProperty(this.style, newValue, "important");
        }
        this.$parent.$options.update.call(this.$parent, this, this.$parent.$el, this.style, newValue);
        this.__emit("update", [this.style, newValue]);
        if (this.speed > 0 && newValue >= this.value || this.speed < 0 && newValue <= this.value) {
          if (this.$unit) {
            this.$parent.$el.style.setProperty(this.style, this.value + this.$unit, "important");
          } else {
            this.$parent.$el.style.setProperty(this.style, this.value, "important");
          }
          this.$timeStamp = 0;
          this.interval = 0;
          this.state = 3;
          this.$parent.$options.complete.call(this.$parent, this, this.$parent.$el);
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
          this.$requestAnimationFrame.call(window, doFun);
        }
      }
    };
    this.$requestAnimationFrame.call(window, doFun);
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
    this.$parent.$options.stop.call(this.$parent, this, this.$parent.$el);
    this.__emit("stop");
    return this;
  }
  /**
   * 重置动画
   */
  reset() {
    if (!this.$parent || !this.$parent.$el) {
      throw new ReferenceError("The clip has not been added to the animator");
    }
    if (this.state == 0) {
      return this;
    }
    this.$timeStamp = 0;
    this.interval = 0;
    this.state = 0;
    if (!this.free) {
      this.$parent.$el.style.setProperty(this.style, this.$initValue, "important");
    }
    this.$parent.$options.reset.call(this.$parent, this, this.$parent.$el);
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
    this.$parent.$options.complete.call(this.$parent, this, this.$parent.$el);
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
   * @param {Object} eventName
   * @param {Object} handler
   */
  on(eventName, handler) {
    let event = this._getEvent(eventName);
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
    let event = this._getEvent(eventName);
    if (event) {
      if (params) {
        event.handler.call(this, this.$parent.$el, ...params);
      } else {
        event.handler.call(this, this.$parent.$el);
      }
    }
  }
  /**
   * 获取事件数组中指定事件
   * @param {Object} eventName
   */
  _getEvent(eventName) {
    let arr = this.$events.filter((event) => {
      return event.name == eventName;
    });
    return arr[0];
  }
  /**
   * 获取元素基于单位$unit的值
   */
  _getUnitCssValue() {
    let value = parseFloat(this._getCssStyle(this.$parent.$el, this.style));
    if (this.$unit == "rem") {
      return this._px2rem(value);
    } else if (this.$unit == "em") {
      return this._px2em(this.$parent.$el, value);
    }
    return value;
  }
  /**
   * 获取元素指定样式值
   * @param {Object} el
   * @param {Object} cssName
   */
  _getCssStyle(el, cssName) {
    if (typeof cssName == "string") {
      let cssText = "";
      if (document.defaultView && document.defaultView.getComputedStyle) {
        cssText = document.defaultView.getComputedStyle(el)[cssName];
      } else {
        cssText = el.currentStyle[cssName];
      }
      return cssText;
    } else {
      return null;
    }
  }
  /**
   * rem转为px
   * @param {Object} number
   */
  _rem2px(number) {
    let fs = this._getCssStyle(document.documentElement, "font-size");
    let num = Number((number * parseFloat(fs)).toFixed(2));
    return num;
  }
  /**
   * px转为rem
   * @param {Object} number
   */
  _px2rem(number) {
    let fs = this._getCssStyle(document.documentElement, "font-size");
    let num = Number((number / parseFloat(fs)).toFixed(2));
    return num;
  }
  /**
   * px转为em
   * @param {Object} el
   * @param {Object} number
   */
  _px2em(el, number) {
    let parentNode = el.parentNode || el.parentElement;
    let fs = this._getCssStyle(parentNode, "font-size");
    let num = Number((number / parseFloat(fs)).toFixed(2));
    return num;
  }
  /**
   * em转为px
   * @param {Object} el
   * @param {Object} number
   */
  _em2px(el, number) {
    let parentNode = el.parentNode || el.parentElement;
    let fs = this._getCssStyle(parentNode, "font-size");
    let num = Number((number * parseFloat(fs)).toFixed(2));
    return num;
  }
}
class Animator {
  //构造方法
  constructor(el, options) {
    this.$el = el;
    this.$options = options;
    this.clips = [];
    this.__init();
  }
  /**
   * 初始化方法
   */
  __init() {
    if (typeof this.$el == "string" && this.$el) {
      this.$el = document.body.querySelector(this.$el);
    }
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
   * @param {Object} clip
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
   * @param {Object} clip
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
        clip.$initValue = clip._getUnitCssValue() + clip.$unit;
      } else {
        clip.$initValue = clip._getUnitCssValue();
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
      clip.$parent.$el.style.setProperty(clip.style, clip.$initValue, "important");
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
  reset() {
    this.clips.forEach((clip) => {
      clip.reset();
    });
    return this;
  }
}
export {
  Animator,
  Clip
};
