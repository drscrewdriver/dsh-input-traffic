/**
 * input-traffic ↔ dsh-session-guard 透传桥（D8 fail-open）。
 *
 * input-traffic **只做冻结增强**（队列冻结/解冻），服务端会话门（暂停/恢复会话）
 * 归 dsh-session-guard 插件。冻结/解冻按钮触发时，尽力调用
 * `sessionGuard.stopNextTurn` / `resume`；**插件未装**（路由 404 / 网络失败 /
 * 返回错误）→ 静默跳过，**绝不报错**，前端冻结仍正常生效。
 *
 * 不吸收任何 auto-continue / 重试逻辑（重试归后端 dsh-session-guard，D9）。
 */
/** 尽力调用 sessionGuard.stopNextTurn（停掉 session 下一回合）。失败静默。 */
export declare function sessionGuardStopNextTurn(sessionId: string): Promise<boolean>;
/** 尽力调用 sessionGuard.resume。失败静默。 */
export declare function sessionGuardResume(sessionId: string): Promise<boolean>;
declare global {
    var __DSH_SESSION_GUARD_BRIDGE__: boolean | undefined;
}
//# sourceMappingURL=session-guard-bridge.d.ts.map