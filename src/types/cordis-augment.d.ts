/**
 * Cordis context augmentation for the client services this plugin consumes.
 *
 * `@deepseek-ai/dsh-client-runtime` — which published a ready-made
 * `ClientContext` carrying exactly these members — was removed in
 * v0.1.2-alpha.1. Harness client plugins now import `Context` from
 * `@deepseek-ai/cordis` and declare their service reads here, the same way
 * every package under `packages/client/` does.
 *
 * The service members are declared on `Context` because the plugin declares
 * them in `inject`; a read of an undeclared service still goes through
 * `ctx.get`, which stays `undefined`-typed.
 */
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Slot registry: wait for a declaration, register, roll back with the fiber. */
    slots: import('@deepseek-ai/dsh-client-ui-slots').SlotsFace
    /** Session registry: scope resolution for session-addressed services. */
    sessions: import('@deepseek-ai/dsh-api-session-controller/client').ISessions
    /** Locale dictionaries and bound translates. */
    locale: import('@deepseek-ai/dsh-client-locale/client').LocaleFace
    /** Durable settings namespace binding. */
    settingsScope: import('@deepseek-ai/dsh-client-ui-settings/client').SettingsScopeFace
    /** Outward conversation face (scope-addressed verbs). */
    conversation: import('@deepseek-ai/dsh-client-ui-conversation/client').IConversation
  }
}
