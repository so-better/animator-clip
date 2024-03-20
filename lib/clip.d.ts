/**
 * 单一属性动画类
 */
import { Animator } from './animator';
export type ClipOptionsType = {
    style?: string;
    value?: number | string;
    speed?: number;
    free?: boolean;
};
export type EventType = {
    name: string;
    handler: (...args: any) => void;
};
export declare class Clip {
    id?: number;
    style?: string;
    value?: number;
    speed?: number;
    free: boolean;
    interval: number;
    $options?: ClipOptionsType;
    $unit?: string | null;
    $requestAnimationFrame: any;
    state: number;
    $events: EventType[];
    $chainClip?: Clip;
    $type: number;
    $initValue?: string | number;
    $parent?: Animator;
    $timeStamp: number;
    constructor(options: ClipOptionsType);
    /**
     * 执行动画
     */
    start(): this;
    /**
     * 停止动画
     */
    stop(): this;
    /**
     * 重置动画
     */
    reset(reStoreStyle?: boolean): this;
    /**
     * 连续执行动画
     * @param {Object} clip
     */
    chain(clip: Clip): Clip;
    /**
     * 主动触发完成事件
     */
    emitComplete(): void;
    /**
     * 自定义事件执行
     */
    on(eventName: string, handler: (...args: any) => void): this;
    /**
     * requestAnimationFrame兼容性封装
     */
    private __getRequestAnimationFrame;
    /**
     * 触发自定义事件
     * @param {Object} eventName
     * @param {Object} params
     */
    private __emit;
    /**
     * 获取事件数组中指定事件
     * @param {Object} eventName
     */
    private __getEvent;
    /**
     * 获取元素基于单位$unit的值
     */
    __getUnitCssValue(): number;
    /**
     * 获取元素指定样式值
     * @param {Object} el
     * @param {Object} cssName
     */
    private __getCssStyle;
    /**
     * px转为rem
     * @param {Object} number
     */
    private __px2rem;
    /**
     * px转为em
     * @param {Object} el
     * @param {Object} number
     */
    private __px2em;
}
