/**
 * Companion invariant for the input-traffic client plugin.
 *
 * The takeover contract: the plugin owns the busy-Enter queue surface while
 * the official composer keeps the Enter-as-queue path. If the conversation
 * service or the input-dock declaration is absent, the plugin must not
 * silently degrade to the official two-mode busy-Enter row —?the settings row
 * it hides would otherwise leave the user with a preference the plugin no
 * longer honours.
 */
export const STEER_INPUT_INVARIANT = 'dsh-input-traffic requires the conversation service and the input-dock slot; refusing partial takeover'
