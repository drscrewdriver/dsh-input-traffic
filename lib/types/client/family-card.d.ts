/**
 * 输入流量 —— 「起子插件设置」family tab 的只读状态卡。
 *
 * 本插件是纯 client 接管型：没有自有 Config，busyEnter 在 apply 时钉死为
 * `queue`（写 ui-conversation entry），官方 General 行同时被压掉。因此这张卡
 * **只读**：展示钉死状态与使用说明，不提供任何写入口——提供 busyEnter 切换
 * 会与接管设计（apply 重新钉死）打架。
 *
 * 数据面：`configForms.get('ui-conversation')` 的快照（跨 entry 读，宿主
 * describe 镜像对该 entry 本就服务——官方 Enter 行就是它的编辑器）。
 */
import { type JSX } from 'react';
/** 只读快照面（configForms 原生句柄的结构化子集）。 */
export interface FamilyCardScope {
    getSnapshot(): {
        status: string;
        value: {
            busyEnter?: string;
        } | undefined;
        writable: boolean;
    };
    subscribe(listener: () => void): () => void;
}
export interface FamilyCardProps {
    /** 活引用：≤0.1.5 settingsScope 永不 resolve 时保持 undefined（降级渲染）。 */
    scope?: FamilyCardScope;
    t?: (key: string, params?: Record<string, unknown>) => string;
}
export declare function InputTrafficFamilyCard({ scope, t }: FamilyCardProps): JSX.Element;
//# sourceMappingURL=family-card.d.ts.map