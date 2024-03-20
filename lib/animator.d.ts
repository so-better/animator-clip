import { Clip } from './clip';
export type AnimatorOptionsType = {
    start?: (clip: Clip, el: HTMLElement) => void;
    stop?: (clip: Clip, el: HTMLElement) => void;
    complete?: (clip: Clip, el: HTMLElement) => void;
    reset?: (clip: Clip, el: HTMLElement) => void;
    beforeUpdate?: (clip: Clip, el: HTMLElement, style?: string, value?: number) => void;
    update?: (clip: Clip, el: HTMLElement, style?: string, value?: number) => void;
};
/**
 * Animator类对象
 */
export declare class Animator {
    $el: HTMLElement;
    $options?: AnimatorOptionsType;
    clips: Clip[];
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
     * @param {Object} clip
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
}
