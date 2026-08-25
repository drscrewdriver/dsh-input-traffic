/**
 * Auto-continue core — 平台无关的纯逻辑, 吸收自 dsh-auto-continue
 * (https://github.com/HsiangNianian/dsh-auto-continue, MIT, v0.8.1 的
 * src/shared/core.ts), 按 input-traffic 的纯 client 定位裁剪:
 *
 * - 只吸收「错误分类 / 自适应退避 / 幂等护栏 / 模板填充」这些无宿主依赖的纯函数;
 * - 不吸收宿主引擎(host firehose / agent.followup / SSE 桥)——那会破坏本插件
 *   「纯浏览器侧、不改官方源码」的定位, 且与「冻结会话省钱」方向相反(见 README 兼容性);
 * - 全部函数无任何 @deepseek-ai/* 值导入, 通过 client bundle purity gate。
 *
 * 应用场景: dock 的「续跑」——检测到会话停下但排队消息未处理完(疑似中断)时,
 * 分类失败、按退避节奏重发, 永久性错误则停止并提示人工介入。
 */
/** 一次发送失败的可分类事实(从 send 的 reject error 里提取)。 */
export interface FailureFacts {
    /** 稳定机器路由码(如 UPSTREAM、RATE_LIMIT_EXCEEDED)。 */
    code?: string;
    /** 人类可读的失败描述。 */
    message: string;
    /** 供应商 HTTP 状态码(可用时)。 */
    status?: number;
}
/**
 * 错误分类: 该失败是否值得重试续跑。
 * 永久性失败(认证/余额/模型不存在/上下文超限等)重试也不会成功, 应停止并提示用户;
 * 其余(网络、超时、5xx、429 等)视为临时性失败, 允许自动重发。
 */
export declare function isTransientFailure(failure: FailureFacts): boolean;
/**
 * 消息文本分类: 仅明确属于网络/传输类的临时错误才值得重试。
 * 其余(序列化失败、配置/宿主内部错误等)视为永久性——重试无益。
 */
export declare function isTransientAgentError(message: string): boolean;
/** 自适应退避: 同一会话连续失败时的有效重试间隔。 */
export declare function effectiveCooldown(consecutive: number, base: number, factor: number, max: number): number;
/** 模板填充所需上下文(全部可选, 缺失的占位符填为空串)。 */
export interface TemplateContext {
    /** 失败事实(错误码/消息/HTTP 状态), 对应 {code}/{message}/{status}。 */
    facts?: FailureFacts;
    /** 失败前最后一次工具调用的名称, 对应 {tool}。 */
    tool?: string;
    /** 连续失败次数(含本次), 对应 {errorCount}。 */
    errorCount?: number;
    /** 自失败发生以来的毫秒数, 对应 {elapsed}。 */
    elapsedMs?: number;
    /** 上一步工具结果摘要(截断), 对应 {result}(护栏模板用)。 */
    result?: string;
}
/** 把毫秒格式化为人类可读的经过时长(如 65s → 1m5s)。 */
export declare function formatElapsed(ms: number | undefined): string;
/** 用失败事实填充续跑模板占位符({code}/{message}/{status}/{tool}/{errorCount}/{elapsed}/{result})。 */
export declare function fillTemplate(template: string, ctx: TemplateContext): string;
/** 上一步工具调用的判定结果: 是否已确认完成, 以及文本摘要。 */
export interface ToolResultFacts {
    /** 工具是否成功完成(内部失败或 isError 视为未成功)。 */
    ok: boolean;
    /** 工具输出的文本摘要(截断)。 */
    excerpt: string;
}
/** 从 tool/result 事件载荷提取成功与否与文本摘要(幂等护栏: 续跑时提示别重复执行)。 */
export declare function toolResultFacts(data: {
    error?: {
        name?: string;
        code?: string;
    };
    message?: {
        content?: Array<{
            type?: string;
            content?: unknown;
            isError?: boolean;
        }>;
    };
}): ToolResultFacts;
/** 续跑配置(全部可选, 解析时回落默认值)。 */
export interface AutoContinueSettings {
    /** 续跑时自动发送的消息文本(可含模板占位符)。 */
    continueText?: string;
    /** 宽限期: 停下多久后视为中断再自动重发(ms)。 */
    graceMs?: number;
    /** 同一会话两次自动续跑的最小间隔(ms)。 */
    cooldownMs?: number;
    /** 连续自动续跑上限; 超过后停止, 直到用户介入或成功回合。 */
    maxConsecutive?: number;
    /** 连续失败时的退避系数。 */
    backoffFactor?: number;
    /** 自适应退避的上限(ms)。 */
    backoffMaxMs?: number;
    /**
     * 自动续跑: 检测到疑似中断时自动重发排队消息。
     * 默认关闭——纯 client 拿不到 turn/end reason, 无法区分「用户主动停止」与
     * 「非人为中断」, 故默认只提示不擅自续跑(与 auto-continue 的 paused 不同)。
     */
    autoResume?: boolean;
    /** 全局暂停续跑(如冻结期间)。 */
    paused?: boolean;
}
/** 完全解析后的续跑配置(内置默认值 + 用户覆盖)。 */
export type AutoContinueConfig = Required<AutoContinueSettings>;
/** 内置默认值(与 dock 的 localStorage 持久化键一致)。 */
export declare const DEFAULT_CONFIG: AutoContinueConfig;
/** 把(可能不完整的)配置解析为完整配置(合法数字/布尔校验 + 兜底默认)。 */
export declare function resolveConfig(section: AutoContinueSettings | undefined): AutoContinueConfig;
//# sourceMappingURL=auto-continue-core.d.ts.map