import { Clip } from './clip';
import * as CSS from 'csstype';
/**
 * 构造参数
 */
export type AnimatorOptionsType = {
    /**
     * 动画开始事件
     */
    onStart?: (this: Animator, clip: Clip, el: HTMLElement) => void;
    /**
     * 动画停止事件
     */
    onStop?: (this: Animator, clip: Clip, el: HTMLElement) => void;
    /**
     * 动画重置事件
     */
    onReset?: (this: Animator, clip: Clip, el: HTMLElement) => void;
    /**
     * 动画更新前事件，此时样式还未改变
     */
    onBeforeUpdate?: (this: Animator, clip: Clip, el: HTMLElement, style?: keyof CSS.Properties, value?: number) => void;
    /**
     * 动画更新时事件，此时样式已经改变
     */
    onUpdate?: (this: Animator, clip: Clip, el: HTMLElement, style?: keyof CSS.Properties, value?: number) => void;
    /**
     * 动画完成事件
     */
    onComplete?: (this: Animator, clip: Clip, el: HTMLElement) => void;
};
/**
 * 动画类
 */
export declare class Animator {
    /**
     * 动画绑定的元素
     */
    $el?: HTMLElement;
    /**
     * 动画开始事件
     */
    onStart?: (this: Animator, clip: Clip, el: HTMLElement) => void;
    /**
     * 动画停止事件
     */
    onStop?: (this: Animator, clip: Clip, el: HTMLElement) => void;
    /**
     * 动画重置事件
     */
    onReset?: (this: Animator, clip: Clip, el: HTMLElement) => void;
    /**
     * 动画更新前事件，此时样式还未改变
     */
    onBeforeUpdate?: (this: Animator, clip: Clip, el: HTMLElement, style?: keyof CSS.Properties, value?: number) => void;
    /**
     * 动画更新时事件，此时样式已经改变
     */
    onUpdate?: (this: Animator, clip: Clip, el: HTMLElement, style?: keyof CSS.Properties, value?: number) => void;
    /**
     * 动画完成事件
     */
    onComplete?: (this: Animator, clip: Clip, el: HTMLElement) => void;
    /**
     * 动画下的实例
     */
    children: Clip[];
    constructor(el: HTMLElement | string, options?: AnimatorOptionsType);
    /**
     * 判断是否包含某个clip
     */
    hasClip(clip: Clip): boolean;
    /**
     * 将clip添加到队列
     */
    addClip(clip: Clip): this;
    /**
     * 将clip移出队列
     */
    removeClip(clip: Clip): this;
    /**
     * 移除全部clip
     */
    removeAllClips(): this;
    /**
     * 获取正在运行的clip
     */
    getClips(): Clip[];
    /**
     * 获取停止状态的clip
     */
    getStopClips(): Clip[];
    /**
     * 获取已完成的clip
     */
    getCompleteClips(): Clip[];
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
    reset(resetStyle?: boolean): this;
}
