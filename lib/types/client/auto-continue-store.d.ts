/**
 * Auto-continue store — 中断检测与续跑配置的共享状态。
 *
 * 与 freeze-store 同构(无运行时依赖、稳定 identity per mount、可测试):
 * - interrupted: 检测到「会话停下但排队消息未处理完」(疑似非人为中断)时置位,
 *   dock 据此显示续跑提示条;
 * - 续跑配置持久化到 localStorage(键 `dsh-input-traffic:auto-continue`),
 *   自动续跑默认关闭(纯 client 拿不到 turn/end reason, 无法与用户主动停止
 *   区分, 故默认只提示、不擅自续跑)。
 */
import { type AutoContinueConfig, type AutoContinueSettings } from './auto-continue-core.ts';
/** localStorage 持久化键(续跑配置)。 */
export declare const CONFIG_KEY = "dsh-input-traffic:auto-continue";
export interface AutoContinueState {
    /** 是否检测到疑似中断(提示条可见性)。 */
    interrupted: boolean;
    /** 连续自动续跑次数(按配置上限封顶)。 */
    consecutive: number;
    /** 上次续跑尝试时间戳(退避节流用)。 */
    lastAttemptAt: number;
}
/** 最小快照 store(与 freeze-store 同构)。 */
export declare const autoContinueStore: {
    getSnapshot(): AutoContinueState;
    subscribe(listener: () => void): () => void;
};
/** 当前解析后的续跑配置。 */
export declare function readAutoContinueConfig(): AutoContinueConfig;
/** 持久化续跑配置(部分覆盖, 缺失回落默认)。 */
export declare function setAutoContinueConfig(patch: AutoContinueSettings): void;
/** 标记检测到疑似中断(dock 显示提示条)。 */
export declare function markInterrupted(): void;
/** 清除中断标志(用户手动续跑 / 队列清空 / 会话重新运行)。 */
export declare function clearInterrupted(): void;
/** 记录一次续跑尝试(推进连续计数与退避节流)。 */
export declare function noteRetry(consecutive: number): void;
/** 重置续跑状态(成功回合 / 用户介入后)。 */
export declare function resetAutoContinue(): void;
/** 测试重置。 */
export declare function resetAutoContinueStore(): void;
//# sourceMappingURL=auto-continue-store.d.ts.map