### animator-clip
###### 基于requestAnimationFrame封装的轻量级JS动画插件

> animator-clip是一个基于JavaScript的requestAnimationFrame API 封装的轻量级JS动画插件，用以执行简单的css样式变更动画，仅支持样式值为px单位的数值或者无单位的数值属性变更，使用的时候请注意。

```
npm install animator-clip --save
```

```
import AnimatorClip from "animator-clip"
```

###### animator-clip使用方法
1. 引入animator和clip对象

```
const {Animator,Clip} = AnimatorClip;
```

2. 创建animator实例

```
//animator实例在创建时，构造函数包含el和options两个参数
//el：动画绑定的元素，即该元素进行动画
//options：参数配置，目前主要是一些animator事件的设置，包含start，complete，stop、update、reset五个事件
var animator = new Animator(el,options);
```

3. 创建clip实例

```
var clip = new Clip(options)
//options参数表示该clip的配置，主要包含style、value、speed三个参数
//style：产生变化的css属性名称，如："height"、"width"、"top"、"left"等
//value：动画目标值，需要带上单位，如果是没有单位的值，则直接写数值，如style为"opacity"时，值可以直接设置数字，如果是px单位的值，则需要带上该单位
//speed：动画速度，只能填写数字，如果value的值是px单位的值，speed表示的也是px单位的数值，以此类推
```

4. 将clip添加到animator中

```
animator.addClip(clip);//clip必须添加到animator中才能进行动画过程
```

5. 执行动画

```
animator.start();//运行动画
```

6. ......
 

> 具体使用方法请参阅[：animator-clip](https://www.mvi-web.cn/library/23)