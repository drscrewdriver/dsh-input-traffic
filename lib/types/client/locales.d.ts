/** `steer` namespace dictionaries. */
/** Dictionary namespace owned by this plugin. */
export declare const NS = "steer";
/** Simplified Chinese dictionary (the key-set source of truth). */
export declare const zh: {
    'queue.count': string;
    'queue.edit': string;
    'queue.edit.unsupported': string;
    'queue.save': string;
    'queue.cancelEdit': string;
    'queue.remove': string;
    'queue.removeFailed': string;
    'queue.editFailed': string;
    'queue.editFailed.pulledBack': string;
    'steer.inflight': string;
    'steer.now': string;
    'steer.now.aria': string;
    'steer.now.unsupported': string;
    'steer.nowFailed': string;
    'steer.next': string;
    'steer.next.aria': string;
    'steer.nextFailed': string;
    'steer.later': string;
    'steer.later.aria': string;
    'steer.revoke': string;
    'steer.revoke.aria': string;
    'steer.revoke.unsupported': string;
    'steer.revokeFailed': string;
    'steer.moveUp': string;
    'steer.moveDown': string;
    'steer.reorder.unsupported': string;
    'steer.reorderFailed': string;
    'steer.reorderStale': string;
    'steer.dragReorder': string;
    'steer.pullBack': string;
    'steer.pullBack.unsupported': string;
    'steer.pullBack.composerBusy': string;
    'steer.pullBackFailed': string;
    'steer.badge.now': string;
    'steer.badge.next': string;
    'steer.badge.later': string;
    'steer.unavailable.running': string;
    'steer.clear': string;
    'steer.clear.confirm': string;
    'steer.clear.cancel': string;
    'steer.clear.aria': string;
    'steer.clearFailed': string;
    'steer.freeze': string;
    'steer.resume': string;
    'steer.frozen': string;
    'steer.frozenInput': string;
    'steer.frozenBadge': string;
    'steer.freezeFailed': string;
    'steer.resumeFailed': string;
};
/** English dictionary (keys mirror zh). */
export declare const en: Record<keyof typeof zh, string>;
/** Dictionary key union. */
export type SteerKey = keyof typeof zh;
//# sourceMappingURL=locales.d.ts.map