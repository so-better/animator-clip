import { Animator } from './animator';
import * as CSS from 'csstype';
/**
 * 动画帧实例构建参数
 */
export type ClipOptionsType = {
    /**
     * 样式名称
     */
    style?: keyof CSS.Properties;
    /**
     * 样式最终值
     */
    value?: string | number;
    /**
     * 动画速度，即每次改变的量
     */
    speed?: number;
    /**
     * 是否自由模式
     */
    free?: boolean;
    /**
     * 动画开始事件
     */
    onStart?: (this: Clip, el: HTMLElement) => void;
    /**
     * 动画停止事件
     */
    onStop?: (this: Clip, el: HTMLElement) => void;
    /**
     * 动画重置事件
     */
    onReset?: (this: Clip, el: HTMLElement) => void;
    /**
     * 动画更新前事件，此时样式还未改变
     */
    onBeforeUpdate?: (this: Clip, el: HTMLElement, style?: keyof CSS.Properties, value?: string | number) => void;
    /**
     * 动画更新时事件，此时样式已经改变
     */
    onUpdate?: (this: Clip, el: HTMLElement, style?: keyof CSS.Properties, value?: string | number) => void;
    /**
     * 动画完成事件
     */
    onComplete?: (this: Clip, el: HTMLElement) => void;
};
/**
 * 单一动画帧
 */
export declare class Clip {
    /**
     * 样式名称
     */
    style?: keyof CSS.Properties;
    /**
     * 样式最终值
     */
    value?: number;
    /**
     * 动画速度，即每次改变的量
     */
    speed?: number;
    /**
     * 是否自由模式
     */
    free: boolean;
    /**
     * 动画开始事件
     */
    onStart?: (this: Clip, el: HTMLElement) => void;
    /**
     * 动画停止事件
     */
    onStop?: (this: Clip, el: HTMLElement) => void;
    /**
     * 动画重置事件
     */
    onReset?: (this: Clip, el: HTMLElement) => void;
    /**
     * 动画更新前事件，此时样式还未改变
     */
    onBeforeUpdate?: (this: Clip, el: HTMLElement, style?: keyof CSS.Properties, value?: string | number) => void;
    /**
     * 动画更新时事件，此时样式已经改变
     */
    onUpdate?: (this: Clip, el: HTMLElement, style?: keyof CSS.Properties, value?: string | number) => void;
    /**
     * 动画完成事件
     */
    onComplete?: (this: Clip, el: HTMLElement) => void;
    /**
     * 唯一key
     */
    key: number;
    /**
     * 类型，0表示普通clip，1表示chain型clip
     */
    type: 0 | 1;
    /**
     * 动画每次更新的间隔时间，单位ms
     */
    interval: number;
    /**
     * 样式的单位
     */
    unit?: 'px' | 'em' | 'rem';
    /**
     * requestAnimationFrame动画API
     */
    requestAnimationFrame: typeof window.requestAnimationFrame | ((callback: () => number) => number);
    /**
     * 动画状态，0表示动画初始状态，1表示动画进行状态，2表示动画停止状态，3表示动画完成状态
     */
    state: 0 | 1 | 2 | 3;
    /**
     * 链式调用的动画
     */
    chainClip?: Clip;
    /**
     * 样式初始值
     */
    initValue?: string | number;
    /**
     * animator实例
     */
    parent?: Animator;
    /**
     * 每次动画帧执行的时间戳记录
     */
    timeStamp: number;
    constructor(options: ClipOptionsType);
    /**
     * 开始动画
     */
    start(): this;
    /**
     * 停止动画
     */
    stop(): this;
    /**
     * 重置动画
     */
    reset(resetStyle?: boolean | undefined): this;
    /**
     * 链式调用动画
     */
    chain(clip: Clip): Clip;
    /**
     * 主动触发完成事件
     */
    emitComplete(): void;
    /**
     * 获取元素基于单位unit的值
     */
    getUnitCssValue(): number;
    /**
     * requestAnimationFrame兼容性封装
     */
    private getRequestAnimationFrame;
    /**
     * 获取单位值
     */
    private getUnit;
    /**
     * px转为em
     */
    private px2em;
}
