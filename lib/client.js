window.__ModuleLoader__.load({
	id: "dsh-input-traffic",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/locales.ts
		/** `steer` client dictionaries (zh / en / ja / ko). */
		/** Dictionary namespace owned by this plugin. */
		const NS = "steer";
		/** Combined dictionary map covering all 9 languages. */
		const dictionaries = {
			zh: {
				"family.title": "输入流量",
				"family.busyEnter": "busy-Enter 行为（本插件接管）",
				"family.desc": "普通回车在繁忙时进入排队（queue），不会打断当前回答；打断请用输入区的冻结/转向按钮。该行为由本插件自动接管，无需配置。",
				"queue.count": "{n} 条排队消息",
				"queue.edit": "编辑排队消息",
				"queue.edit.unsupported": "包含非文本内容，暂不支持编辑",
				"queue.save": "保存排队消息",
				"queue.cancelEdit": "取消编辑",
				"queue.remove": "删除排队消息",
				"queue.removeFailed": "删除失败：这条消息可能已经开始发送。",
				"queue.editFailed": "编辑失败：这条消息可能已经开始发送。",
				"queue.editFailed.pulledBack": "编辑失败，内容已退回主输入框，请确认后重新发送。",
				"steer.inflight": "{n} 条正在插入",
				"steer.now": "打断并输入",
				"steer.now.aria": "红色：打断当前动作并立即输入",
				"steer.now.unsupported": "包含非文本内容，暂不支持打断",
				"steer.nowFailed": "打断失败，请重试。",
				"steer.next": "插话发送",
				"steer.next.aria": "黄色：当前动作结束后插入输入",
				"steer.nextFailed": "插话发送失败，请重试。",
				"steer.later": "排队到下一轮",
				"steer.later.aria": "绿色：排队，上一轮输入的动作都结束后再处理",
				"steer.revoke": "收回排队",
				"steer.revoke.aria": "绿色：撤销插入，收回排队（下一轮处理）",
				"steer.revoke.unsupported": "包含非文本内容，暂不支持收回",
				"steer.revokeFailed": "收回排队失败，请重试。",
				"steer.moveUp": "上移",
				"steer.moveDown": "下移",
				"steer.reorder.unsupported": "包含非文本内容，暂不支持排序",
				"steer.reorderFailed": "调整顺序失败，请重试。",
				"steer.reorderStale": "队列已变化，本次排序已取消，请重试。",
				"steer.dragReorder": "拖动调整顺序",
				"steer.pullBack": "打回输入框编辑",
				"steer.pullBack.unsupported": "包含非文本内容，暂不支持打回编辑",
				"steer.pullBack.composerBusy": "主输入框已有内容，请先发送或清空后再打回",
				"steer.pullBackFailed": "打回输入框失败，请重试。",
				"steer.badge.now": "打断中",
				"steer.badge.next": "插话中",
				"steer.badge.later": "排队",
				"steer.unavailable.running": "仅运行中可规划",
				"steer.clear": "取消并清空",
				"steer.clear.confirm": "确认清空？",
				"steer.clear.cancel": "取消清空",
				"steer.clear.aria": "取消当前执行并清空全部排队消息",
				"steer.clearFailed": "取消并清空失败，请重试。",
				"steer.freeze": "冻结追加",
				"steer.resume": "恢复追加",
				"steer.frozen": "已冻结：当前轮次完成后暂停，排队消息将在恢复后继续",
				"steer.frozenInput": "已冻结：输入已暂停，恢复后继续",
				"steer.frozenBadge": "已冻结",
				"steer.freezeFailed": "冻结失败，请重试。",
				"steer.resumeFailed": "恢复失败，请重试。"
			},
			en: {
				"family.title": "Input Traffic",
				"family.busyEnter": "busy-Enter behavior (managed by this plugin)",
				"family.desc": "Plain Enter queues while busy instead of interrupting; use the freeze/steer control in the composer to interrupt. Managed automatically — nothing to configure.",
				"queue.count": "{n} queued messages",
				"queue.edit": "Edit queued message",
				"queue.edit.unsupported": "Contains non-text content; editing is unsupported",
				"queue.save": "Save queued message",
				"queue.cancelEdit": "Cancel edit",
				"queue.remove": "Remove queued message",
				"queue.removeFailed": "Remove failed: the message may have started sending.",
				"queue.editFailed": "Edit failed: the message may have started sending.",
				"queue.editFailed.pulledBack": "Edit failed; the content was moved back to the composer, please review and resend.",
				"steer.inflight": "{n} inserting",
				"steer.now": "Interrupt and send",
				"steer.now.aria": "Red: interrupt the running action and send now",
				"steer.now.unsupported": "Contains non-text content; interrupting is unsupported",
				"steer.nowFailed": "Interrupt failed, please retry.",
				"steer.next": "Send after action",
				"steer.next.aria": "Yellow: insert after the current action finishes",
				"steer.nextFailed": "Steering failed, please retry.",
				"steer.later": "Queue for next turn",
				"steer.later.aria": "Green: queue; processed after all previously steered actions finish",
				"steer.revoke": "Pull back to queue",
				"steer.revoke.aria": "Green: revoke the insertion and queue for the next turn",
				"steer.revoke.unsupported": "Contains non-text content; revoking is unsupported",
				"steer.revokeFailed": "Revoke failed, please retry.",
				"steer.moveUp": "Move up",
				"steer.moveDown": "Move down",
				"steer.reorder.unsupported": "Contains non-text content; reordering is unsupported",
				"steer.reorderFailed": "Reorder failed, please retry.",
				"steer.reorderStale": "The queue changed; this reorder was cancelled, please retry.",
				"steer.dragReorder": "Drag to reorder",
				"steer.pullBack": "Edit in composer",
				"steer.pullBack.unsupported": "Contains non-text content; pulling back is unsupported",
				"steer.pullBack.composerBusy": "The composer already has content; send or clear it first",
				"steer.pullBackFailed": "Pull back failed, please retry.",
				"steer.badge.now": "interrupting",
				"steer.badge.next": "steering",
				"steer.badge.later": "queued",
				"steer.unavailable.running": "Planning requires a running session",
				"steer.clear": "Cancel and clear",
				"steer.clear.confirm": "Confirm clear?",
				"steer.clear.cancel": "Cancel clearing",
				"steer.clear.aria": "Cancel the current run and clear all queued messages",
				"steer.clearFailed": "Cancel and clear failed, please retry.",
				"steer.freeze": "Freeze & append",
				"steer.resume": "Resume & append",
				"steer.frozen": "Frozen: the current turn finishes, then the queue pauses until resumed",
				"steer.frozenInput": "Frozen: input paused, resume to continue",
				"steer.frozenBadge": "frozen",
				"steer.freezeFailed": "Freeze failed, please retry.",
				"steer.resumeFailed": "Resume failed, please retry."
			},
			ja: {
				"family.title": "入力トラフィック",
				"family.busyEnter": "busy-Enter 動作（本プラグインが管理）",
				"family.desc": "通常の Enter はビジー時にキューへ入ります（割り込みなし）。割り込みは入力欄の凍結/ステアで。自動管理のため設定不要。",
				"queue.count": "{n} 件のキューイング済みメッセージ",
				"queue.edit": "キューイング済みメッセージを編集",
				"queue.edit.unsupported": "非テキストコンテンツが含まれており、編集はサポートされていません",
				"queue.save": "キューイング済みメッセージを保存",
				"queue.cancelEdit": "編集をキャンセル",
				"queue.remove": "キューイング済みメッセージを削除",
				"queue.removeFailed": "削除失敗：メッセージの送信が既に開始されている可能性があります。",
				"queue.editFailed": "編集失敗：メッセージの送信が既に開始されている可能性があります。",
				"queue.editFailed.pulledBack": "編集失敗。コンテンツはコンポーザに戻されました。確認後再送信してください。",
				"steer.inflight": "{n} 件挿入中",
				"steer.now": "中断して送信",
				"steer.now.aria": "赤：実行中のアクションを中断して即座に送信",
				"steer.now.unsupported": "非テキストコンテンツが含まれており、中断はサポートされていません",
				"steer.nowFailed": "中断失敗。再試行してください。",
				"steer.next": "アクション後に送信",
				"steer.next.aria": "黄：現在のアクション完了後に挿入",
				"steer.nextFailed": "ステア失敗。再試行してください。",
				"steer.later": "次のターンまでキューイング",
				"steer.later.aria": "緑：キューイング。以前のステア済みアクションがすべて完了してから処理",
				"steer.revoke": "キューに戻す",
				"steer.revoke.aria": "緑：挿入を取り消し、次のターンまでキューイング",
				"steer.revoke.unsupported": "非テキストコンテンツが含まれており、取り消しはサポートされていません",
				"steer.revokeFailed": "取り消し失敗。再試行してください。",
				"steer.moveUp": "上へ移動",
				"steer.moveDown": "下へ移動",
				"steer.reorder.unsupported": "非テキストコンテンツが含まれており、並べ替えはサポートされていません",
				"steer.reorderFailed": "並べ替え失敗。再試行してください。",
				"steer.reorderStale": "キューが変更されました。本次の並べ替えはキャンセルされました。再試行してください。",
				"steer.dragReorder": "ドラッグして並べ替え",
				"steer.pullBack": "コンポーザに送り直して編集",
				"steer.pullBack.unsupported": "非テキストコンテンツが含まれており、送り直しはサポートされていません",
				"steer.pullBack.composerBusy": "コンポーザに既にコンテンツがあります。送信またはクリアしてください",
				"steer.pullBackFailed": "送り直し失敗。再試行してください。",
				"steer.badge.now": "中断中",
				"steer.badge.next": "ステア中",
				"steer.badge.later": "キューイング済み",
				"steer.unavailable.running": "実行中のみプランニング可能",
				"steer.clear": "取り消して全消去",
				"steer.clear.confirm": "消去を確認？",
				"steer.clear.cancel": "消去をキャンセル",
				"steer.clear.aria": "実行を停止し、すべてのキューイング済みメッセージを消去",
				"steer.clearFailed": "取り消して全消去失敗。再試行してください。",
				"steer.freeze": "凍結して追加",
				"steer.resume": "再開して追加",
				"steer.frozen": "凍結中：現在のターン完了後一時停止、再開後にキューが継続",
				"steer.frozenInput": "凍結中：入力一時停止、再開後に継続",
				"steer.frozenBadge": "凍結済み",
				"steer.freezeFailed": "凍結失敗。再試行してください。",
				"steer.resumeFailed": "再開失敗。再試行してください。"
			},
			ko: {
				"family.title": "입력 트래픽",
				"family.busyEnter": "busy-Enter 동작(이 플러그인이 관리)",
				"family.desc": "일반 Enter는 사용 중일 때 큐에 들어가 현재 답변을 끊지 않습니다. 중단이 필요하면 입력 창의 동결/스티어 버튼을 사용하세요. 자동 관리되므로 설정이 없습니다.",
				"queue.count": "{n}개 대기열 메시지",
				"queue.edit": "대기열 메시지 편집",
				"queue.edit.unsupported": "비텍스트 콘텐츠가 포함되어 있어 편집이 지원되지 않습니다",
				"queue.save": "대기열 메시지 저장",
				"queue.cancelEdit": "편집 취소",
				"queue.remove": "대기열 메시지 삭제",
				"queue.removeFailed": "삭제 실패: 메시지 전송이 이미 시작되었을 수 있습니다.",
				"queue.editFailed": "편집 실패: 메시지 전송이 이미 시작되었을 수 있습니다.",
				"queue.editFailed.pulledBack": "편집 실패. 콘텐츠가 컴포저로 돌아갔습니다. 확인 후 다시 전송하세요.",
				"steer.inflight": "{n}개 삽입 중",
				"steer.now": "중단 후 전송",
				"steer.now.aria": "빨간색: 실행 중인 액션을 중단하고 즉시 전송",
				"steer.now.unsupported": "비텍스트 콘텐츠가 포함되어 있어 중단이 지원되지 않습니다",
				"steer.nowFailed": "중단 실패. 다시 시도하세요.",
				"steer.next": "액션 후 전송",
				"steer.next.aria": "노란색: 현재 액션 완료 후 삽입",
				"steer.nextFailed": "스티어 실패. 다시 시도하세요.",
				"steer.later": "다음 턴까지 대기",
				"steer.later.aria": "초록색: 대기. 이전 스티어된 액션이 모두 완료된 후 처리",
				"steer.revoke": "대기열로 되돌리기",
				"steer.revoke.aria": "초록색: 삽입 취소, 다음 턴까지 대기",
				"steer.revoke.unsupported": "비텍스트 콘텐츠가 포함되어 있어 취소가 지원되지 않습니다",
				"steer.revokeFailed": "취소 실패. 다시 시도하세요.",
				"steer.moveUp": "위로 이동",
				"steer.moveDown": "아래로 이동",
				"steer.reorder.unsupported": "비텍스트 콘텐츠가 포함되어 있어 재정렬이 지원되지 않습니다",
				"steer.reorderFailed": "재정렬 실패. 다시 시도하세요.",
				"steer.reorderStale": "대기열이 변경되었습니다. 이번 재정렬이 취소되었습니다. 다시 시도하세요.",
				"steer.dragReorder": "드래그로 재정렬",
				"steer.pullBack": "컴포저로 되돌려 편집",
				"steer.pullBack.unsupported": "비텍스트 콘텐츠가 포함되어 있어 되돌리기가 지원되지 않습니다",
				"steer.pullBack.composerBusy": "컴포저에 이미 콘텐츠가 있습니다. 먼저 전송하거나 비우세요",
				"steer.pullBackFailed": "되돌리기 실패. 다시 시도하세요.",
				"steer.badge.now": "중단 중",
				"steer.badge.next": "스티어 중",
				"steer.badge.later": "대기열",
				"steer.unavailable.running": "실행 중에만 계획 가능",
				"steer.clear": "취소 후 전체 지우기",
				"steer.clear.confirm": "지우기 확인?",
				"steer.clear.cancel": "지우기 취소",
				"steer.clear.aria": "현재 실행을 중지하고 모든 대기열 메시지를 지우기",
				"steer.clearFailed": "취소 후 전체 지우기 실패. 다시 시도하세요.",
				"steer.freeze": "동결 후 추가",
				"steer.resume": "재개 후 추가",
				"steer.frozen": "동결됨: 현재 턴 완료 후 일시정지, 재개 시 대기열 계속",
				"steer.frozenInput": "동결됨: 입력 일시정지, 재개 시 계속",
				"steer.frozenBadge": "동결됨",
				"steer.freezeFailed": "동결 실패. 다시 시도하세요.",
				"steer.resumeFailed": "재개 실패. 다시 시도하세요."
			},
			fr: {
				"family.title": "Trafic d'entrée",
				"family.busyEnter": "Comportement busy-Enter (géré par ce plugin)",
				"family.desc": "Entrée simple met en file d'attente quand occupé sans interrompre ; utilisez le bouton geler/rediriger du composeur pour interrompre. Géré automatiquement — rien à configurer.",
				"queue.count": "{n} messages en file d'attente",
				"queue.edit": "Modifier le message en file d'attente",
				"queue.edit.unsupported": "Contient du contenu non textuel ; modification non prise en charge",
				"queue.save": "Enregistrer le message en file d'attente",
				"queue.cancelEdit": "Annuler la modification",
				"queue.remove": "Supprimer le message en file d'attente",
				"queue.removeFailed": "Échec de la suppression : le message a peut-être commencé à être envoyé.",
				"queue.editFailed": "Échec de la modification : le message a peut-être commencé à être envoyé.",
				"queue.editFailed.pulledBack": "Échec de la modification ; le contenu a été renvoyé au composeur, veuillez vérifier et renvoyer.",
				"steer.inflight": "{n} en cours d'insertion",
				"steer.now": "Interrompre et envoyer",
				"steer.now.aria": "Rouge : interrompre l'action en cours et envoyer immédiatement",
				"steer.now.unsupported": "Contient du contenu non textuel ; interruption non prise en charge",
				"steer.nowFailed": "Échec de l'interruption, veuillez réessayer.",
				"steer.next": "Envoyer après l'action",
				"steer.next.aria": "Jaune : insérer après la fin de l'action en cours",
				"steer.nextFailed": "Échec de la redirection, veuillez réessayer.",
				"steer.later": "Mettre en file pour le prochain tour",
				"steer.later.aria": "Vert : mettre en file ; traité après la fin de toutes les actions redirigées",
				"steer.revoke": "Rappeler en file d'attente",
				"steer.revoke.aria": "Vert : annuler l'insertion et mettre en file pour le prochain tour",
				"steer.revoke.unsupported": "Contient du contenu non textuel ; rappel non pris en charge",
				"steer.revokeFailed": "Échec du rappel, veuillez réessayer.",
				"steer.moveUp": "Déplacer vers le haut",
				"steer.moveDown": "Déplacer vers le bas",
				"steer.reorder.unsupported": "Contient du contenu non textuel ; réordonnancement non pris en charge",
				"steer.reorderFailed": "Échec du réordonnancement, veuillez réessayer.",
				"steer.reorderStale": "La file a changé ; ce réordonnancement a été annulé, veuillez réessayer.",
				"steer.dragReorder": "Glisser pour réordonner",
				"steer.pullBack": "Renvoyer au composeur pour modification",
				"steer.pullBack.unsupported": "Contient du contenu non textuel ; renvoi non pris en charge",
				"steer.pullBack.composerBusy": "Le composeur contient déjà du contenu ; envoyez ou effacez d'abord",
				"steer.pullBackFailed": "Échec du renvoi au composeur, veuillez réessayer.",
				"steer.badge.now": "interruption",
				"steer.badge.next": "redirection",
				"steer.badge.later": "en file",
				"steer.unavailable.running": "Planification possible uniquement en cours d'exécution",
				"steer.clear": "Annuler et tout effacer",
				"steer.clear.confirm": "Confirmer l'effacement ?",
				"steer.clear.cancel": "Annuler l'effacement",
				"steer.clear.aria": "Annuler l'exécution en cours et effacer tous les messages en file d'attente",
				"steer.clearFailed": "Échec de l'annulation et de l'effacement, veuillez réessayer.",
				"steer.freeze": "Geler et ajouter",
				"steer.resume": "Reprendre et ajouter",
				"steer.frozen": "Gélé : le tour en cours se termine puis la file est suspendue jusqu'à la reprise",
				"steer.frozenInput": "Gélé : entrée suspendue, reprendre pour continuer",
				"steer.frozenBadge": "gelé",
				"steer.freezeFailed": "Échec du gel, veuillez réessayer.",
				"steer.resumeFailed": "Échec de la reprise, veuillez réessayer."
			},
			de: {
				"family.title": "Eingabeverkehr",
				"family.busyEnter": "Busy-Enter-Verhalten (von diesem Plugin verwaltet)",
				"family.desc": "Einfaches Enter reiht bei Beschäftigung ein, statt zu unterbrechen; zum Unterbrechen die Einfrieren/Steuern-Schaltfläche im Composer verwenden. Automatisch verwaltet — keine Konfiguration nötig.",
				"queue.count": "{n} Nachrichten in der Warteschlange",
				"queue.edit": "Warteschlangennachricht bearbeiten",
				"queue.edit.unsupported": "Enthält Nicht-Text-Inhalt; Bearbeiten nicht unterstützt",
				"queue.save": "Warteschlangennachricht speichern",
				"queue.cancelEdit": "Bearbeitung abbrechen",
				"queue.remove": "Warteschlangennachricht entfernen",
				"queue.removeFailed": "Entfernen fehlgeschlagen: Die Nachricht wurde möglicherweise bereits gesendet.",
				"queue.editFailed": "Bearbeiten fehlgeschlagen: Die Nachricht wurde möglicherweise bereits gesendet.",
				"queue.editFailed.pulledBack": "Bearbeiten fehlgeschlagen; Inhalt wurde in den Composer zurückverschoben, bitte prüfen und erneut senden.",
				"steer.inflight": "{n} werden eingefügt",
				"steer.now": "Unterbrechen und senden",
				"steer.now.aria": "Rot: Laufende Aktion unterbrechen und sofort senden",
				"steer.now.unsupported": "Enthält Nicht-Text-Inhalt; Unterbrechen nicht unterstützt",
				"steer.nowFailed": "Unterbrechen fehlgeschlagen, bitte erneut versuchen.",
				"steer.next": "Nach Aktion senden",
				"steer.next.aria": "Gelb: Nach Abschluss der aktuellen Aktion einfügen",
				"steer.nextFailed": "Steuerung fehlgeschlagen, bitte erneut versuchen.",
				"steer.later": "Für nächste Runde einreihen",
				"steer.later.aria": "Grün: Einreihen; Verarbeitung nach Abschluss aller zuvor gesteuerten Aktionen",
				"steer.revoke": "Zurück in Warteschlange",
				"steer.revoke.aria": "Grün: Einfügung widerrufen und für nächste Runde einreihen",
				"steer.revoke.unsupported": "Enthält Nicht-Text-Inhalt; Widerrufen nicht unterstützt",
				"steer.revokeFailed": "Widerrufen fehlgeschlagen, bitte erneut versuchen.",
				"steer.moveUp": "Nach oben",
				"steer.moveDown": "Nach unten",
				"steer.reorder.unsupported": "Enthält Nicht-Text-Inhalt; Umsortieren nicht unterstützt",
				"steer.reorderFailed": "Umsortieren fehlgeschlagen, bitte erneut versuchen.",
				"steer.reorderStale": "Warteschlange geändert; Umsortierung abgebrochen, bitte erneut versuchen.",
				"steer.dragReorder": "Ziehen zum Umsortieren",
				"steer.pullBack": "In Composer zurückholen",
				"steer.pullBack.unsupported": "Enthält Nicht-Text-Inhalt; Zurückholen nicht unterstützt",
				"steer.pullBack.composerBusy": "Composer enthält bereits Inhalt; zuerst senden oder leeren",
				"steer.pullBackFailed": "Zurückholen fehlgeschlagen, bitte erneut versuchen.",
				"steer.badge.now": "unterbricht",
				"steer.badge.next": "steuert",
				"steer.badge.later": "eingereiht",
				"steer.unavailable.running": "Planung nur während der Ausführung möglich",
				"steer.clear": "Abbrechen und leeren",
				"steer.clear.confirm": "Leeren bestätigen?",
				"steer.clear.cancel": "Leeren abbrechen",
				"steer.clear.aria": "Aktuelle Ausführung abbrechen und alle Warteschlangennachrichten leeren",
				"steer.clearFailed": "Abbrechen und Leeren fehlgeschlagen, bitte erneut versuchen.",
				"steer.freeze": "Einfrieren & anhängen",
				"steer.resume": "Fortsetzen & anhängen",
				"steer.frozen": "Eingefroren: Aktuelle Runde endet, dann pausiert die Warteschlange bis zur Fortsetzung",
				"steer.frozenInput": "Eingefroren: Eingabe pausiert, fortsetzen um weiterzumachen",
				"steer.frozenBadge": "eingefroren",
				"steer.freezeFailed": "Einfrieren fehlgeschlagen, bitte erneut versuchen.",
				"steer.resumeFailed": "Fortsetzen fehlgeschlagen, bitte erneut versuchen."
			},
			it: {
				"family.title": "Traffico di input",
				"family.busyEnter": "Comportamento busy-Enter (gestito da questo plugin)",
				"family.desc": "Invio semplice accoda quando occupato senza interrompere; usa il pulsante congela/devia nel compositore per interrompere. Gestito automaticamente — nessuna configurazione necessaria.",
				"queue.count": "{n} messaggi in coda",
				"queue.edit": "Modifica messaggio in coda",
				"queue.edit.unsupported": "Contiene contenuto non testuale; modifica non supportata",
				"queue.save": "Salva messaggio in coda",
				"queue.cancelEdit": "Annulla modifica",
				"queue.remove": "Rimuovi messaggio in coda",
				"queue.removeFailed": "Rimozione fallita: il messaggio potrebbe aver iniziato l'invio.",
				"queue.editFailed": "Modifica fallita: il messaggio potrebbe aver iniziato l'invio.",
				"queue.editFailed.pulledBack": "Modifica fallita; il contenuto è stato riportato nel compositore, verificare e reinviare.",
				"steer.inflight": "{n} in inserimento",
				"steer.now": "Interrompi e invia",
				"steer.now.aria": "Rosso: interrompi l'azione in corso e invia immediatamente",
				"steer.now.unsupported": "Contiene contenuto non testuale; interruzione non supportata",
				"steer.nowFailed": "Interruzione fallita, riprovare.",
				"steer.next": "Invia dopo l'azione",
				"steer.next.aria": "Giallo: inserisci al termine dell'azione corrente",
				"steer.nextFailed": "Deviazione fallita, riprovare.",
				"steer.later": "Accoda per il prossimo turno",
				"steer.later.aria": "Verde: accoda; elaborato al termine di tutte le azioni deviate precedenti",
				"steer.revoke": "Riporta in coda",
				"steer.revoke.aria": "Verde: revoca l'inserimento e accoda per il prossimo turno",
				"steer.revoke.unsupported": "Contiene contenuto non testuale; revoca non supportata",
				"steer.revokeFailed": "Revoca fallita, riprovare.",
				"steer.moveUp": "Sposta su",
				"steer.moveDown": "Sposta giù",
				"steer.reorder.unsupported": "Contiene contenuto non testuale; riordino non supportato",
				"steer.reorderFailed": "Riordino fallito, riprovare.",
				"steer.reorderStale": "La coda è cambiata; riordino annullato, riprovare.",
				"steer.dragReorder": "Trascina per riordinare",
				"steer.pullBack": "Riporta nel compositore per modifica",
				"steer.pullBack.unsupported": "Contiene contenuto non testuale; riporto non supportato",
				"steer.pullBack.composerBusy": "Il compositore contiene già contenuto; inviare o svuotare prima",
				"steer.pullBackFailed": "Riporto nel compositore fallito, riprovare.",
				"steer.badge.now": "interruzione",
				"steer.badge.next": "deviazione",
				"steer.badge.later": "in coda",
				"steer.unavailable.running": "Pianificazione disponibile solo durante l'esecuzione",
				"steer.clear": "Annulla e svuota",
				"steer.clear.confirm": "Confermare lo svuotamento?",
				"steer.clear.cancel": "Annulla svuotamento",
				"steer.clear.aria": "Annulla l'esecuzione corrente e svuota tutti i messaggi in coda",
				"steer.clearFailed": "Annullamento e svuotamento falliti, riprovare.",
				"steer.freeze": "Congela e aggiungi",
				"steer.resume": "Riprendi e aggiungi",
				"steer.frozen": "Congelato: il turno corrente termina, poi la coda si sospende fino alla ripresa",
				"steer.frozenInput": "Congelato: input sospeso, riprendere per continuare",
				"steer.frozenBadge": "congelato",
				"steer.freezeFailed": "Congelamento fallito, riprovare.",
				"steer.resumeFailed": "Ripresa fallita, riprovare."
			},
			ru: {
				"family.title": "Входящий поток",
				"family.busyEnter": "Поведение busy-Enter (управляется этим плагином)",
				"family.desc": "Обычный Enter ставит в очередь при занятости, не прерывая; для прерывания используйте кнопку заморозки/перенаправления в поле ввода. Управляется автоматически — настройка не требуется.",
				"queue.count": "{n} сообщений в очереди",
				"queue.edit": "Редактировать сообщение в очереди",
				"queue.edit.unsupported": "Содержит нетекстовый контент; редактирование не поддерживается",
				"queue.save": "Сохранить сообщение в очереди",
				"queue.cancelEdit": "Отменить редактирование",
				"queue.remove": "Удалить сообщение из очереди",
				"queue.removeFailed": "Не удалось удалить: сообщение, возможно, уже отправляется.",
				"queue.editFailed": "Не удалось отредактировать: сообщение, возможно, уже отправляется.",
				"queue.editFailed.pulledBack": "Не удалось отредактировать; содержимое возвращено в поле ввода, проверьте и отправьте снова.",
				"steer.inflight": "{n} вставляется",
				"steer.now": "Прервать и отправить",
				"steer.now.aria": "Красный: прервать текущее действие и отправить немедленно",
				"steer.now.unsupported": "Содержит нетекстовый контент; прерывание не поддерживается",
				"steer.nowFailed": "Не удалось прервать, повторите.",
				"steer.next": "Отправить после действия",
				"steer.next.aria": "Жёлтый: вставить после завершения текущего действия",
				"steer.nextFailed": "Не удалось перенаправить, повторите.",
				"steer.later": "В очередь на следующий ход",
				"steer.later.aria": "Зелёный: в очередь; обработка после завершения всех предыдущих перенаправленных действий",
				"steer.revoke": "Отозвать в очередь",
				"steer.revoke.aria": "Зелёный: отменить вставку и поставить в очередь на следующий ход",
				"steer.revoke.unsupported": "Содержит нетекстовый контент; отзыв не поддерживается",
				"steer.revokeFailed": "Не удалось отозвать, повторите.",
				"steer.moveUp": "Вверх",
				"steer.moveDown": "Вниз",
				"steer.reorder.unsupported": "Содержит нетекстовый контент; пересортировка не поддерживается",
				"steer.reorderFailed": "Не удалось пересортировать, повторите.",
				"steer.reorderStale": "Очередь изменилась; пересортировка отменена, повторите.",
				"steer.dragReorder": "Перетащите для пересортировки",
				"steer.pullBack": "Вернуть в поле ввода",
				"steer.pullBack.unsupported": "Содержит нетекстовый контент; возврат не поддерживается",
				"steer.pullBack.composerBusy": "В поле ввода уже есть содержимое; отправьте или очистите сначала",
				"steer.pullBackFailed": "Не удалось вернуть в поле ввода, повторите.",
				"steer.badge.now": "прерывание",
				"steer.badge.next": "перенаправление",
				"steer.badge.later": "в очереди",
				"steer.unavailable.running": "Планирование доступно только во время выполнения",
				"steer.clear": "Отменить и очистить",
				"steer.clear.confirm": "Подтвердить очистку?",
				"steer.clear.cancel": "Отменить очистку",
				"steer.clear.aria": "Отменить текущее выполнение и очистить все сообщения в очереди",
				"steer.clearFailed": "Не удалось отменить и очистить, повторите.",
				"steer.freeze": "Заморозить и добавить",
				"steer.resume": "Возобновить и добавить",
				"steer.frozen": "Заморожено: текущий ход завершится, затем очередь приостановится до возобновления",
				"steer.frozenInput": "Заморожено: ввод приостановлен, возобновите для продолжения",
				"steer.frozenBadge": "заморожено",
				"steer.freezeFailed": "Не удалось заморозить, повторите.",
				"steer.resumeFailed": "Не удалось возобновить, повторите."
			},
			es: {
				"family.title": "Tráfico de entrada",
				"family.busyEnter": "Comportamiento busy-Enter (gestionado por este plugin)",
				"family.desc": "Enter simple pone en cola cuando está ocupado sin interrumpir; usa el botón congelar/redirigir del compositor para interrumpir. Gestionado automáticamente — nada que configurar.",
				"queue.count": "{n} mensajes en cola",
				"queue.edit": "Editar mensaje en cola",
				"queue.edit.unsupported": "Contiene contenido no textual; edición no compatible",
				"queue.save": "Guardar mensaje en cola",
				"queue.cancelEdit": "Cancelar edición",
				"queue.remove": "Eliminar mensaje en cola",
				"queue.removeFailed": "Error al eliminar: el mensaje puede haber comenzado a enviarse.",
				"queue.editFailed": "Error al editar: el mensaje puede haber comenzado a enviarse.",
				"queue.editFailed.pulledBack": "Error al editar; el contenido fue devuelto al compositor, revise y reenvíe.",
				"steer.inflight": "{n} insertándose",
				"steer.now": "Interrumpir y enviar",
				"steer.now.aria": "Rojo: interrumpir la acción en curso y enviar inmediatamente",
				"steer.now.unsupported": "Contiene contenido no textual; interrupción no compatible",
				"steer.nowFailed": "Error al interrumpir, inténtelo de nuevo.",
				"steer.next": "Enviar después de la acción",
				"steer.next.aria": "Amarillo: insertar después de que termine la acción actual",
				"steer.nextFailed": "Error al redirigir, inténtelo de nuevo.",
				"steer.later": "Encolar para el próximo turno",
				"steer.later.aria": "Verde: encolar; se procesa cuando terminen todas las acciones redirigidas previas",
				"steer.revoke": "Devolver a la cola",
				"steer.revoke.aria": "Verde: revocar la inserción y encolar para el próximo turno",
				"steer.revoke.unsupported": "Contiene contenido no textual; revocación no compatible",
				"steer.revokeFailed": "Error al revocar, inténtelo de nuevo.",
				"steer.moveUp": "Mover arriba",
				"steer.moveDown": "Mover abajo",
				"steer.reorder.unsupported": "Contiene contenido no textual; reordenación no compatible",
				"steer.reorderFailed": "Error al reordenar, inténtelo de nuevo.",
				"steer.reorderStale": "La cola cambió; reordenación cancelada, inténtelo de nuevo.",
				"steer.dragReorder": "Arrastrar para reordenar",
				"steer.pullBack": "Devolver al compositor para editar",
				"steer.pullBack.unsupported": "Contiene contenido no textual; devolución no compatible",
				"steer.pullBack.composerBusy": "El compositor ya tiene contenido; envíe o vacíe primero",
				"steer.pullBackFailed": "Error al devolver al compositor, inténtelo de nuevo.",
				"steer.badge.now": "interrumpiendo",
				"steer.badge.next": "redirigiendo",
				"steer.badge.later": "en cola",
				"steer.unavailable.running": "Planificación solo disponible durante la ejecución",
				"steer.clear": "Cancelar y vaciar",
				"steer.clear.confirm": "¿Confirmar vaciado?",
				"steer.clear.cancel": "Cancelar vaciado",
				"steer.clear.aria": "Cancelar la ejecución actual y vaciar todos los mensajes en cola",
				"steer.clearFailed": "Error al cancelar y vaciar, inténtelo de nuevo.",
				"steer.freeze": "Congelar y añadir",
				"steer.resume": "Reanudar y añadir",
				"steer.frozen": "Congelado: el turno actual termina y la cola se pausa hasta la reanudación",
				"steer.frozenInput": "Congelado: entrada pausada, reanude para continuar",
				"steer.frozenBadge": "congelado",
				"steer.freezeFailed": "Error al congelar, inténtelo de nuevo.",
				"steer.resumeFailed": "Error al reanudar, inténtelo de nuevo."
			}
		};
		//#endregion
		//#region src/client/freeze-store.ts
		/** Session id → per-session freeze state. */
		const states = /* @__PURE__ */ new Map();
		const listeners = /* @__PURE__ */ new Set();
		/** Stable empty snapshot: `useSyncExternalStore` needs a reference-stable
		*  value for unset sessions so unchanged consumers never re-render. */
		const EMPTY = {
			frozen: false,
			pending: []
		};
		/** Minimal snapshot store (no runtime dependency, stable identity per mount). */
		const freezeStore = {
			/** Snapshot for one session; reference-stable until that session changes. */
			getSnapshot(sessionId) {
				return states.get(sessionId) ?? EMPTY;
			},
			subscribe(listener) {
				listeners.add(listener);
				return () => {
					listeners.delete(listener);
				};
			},
			/** Replace one session's state; unset sessions fall back to EMPTY. */
			set(sessionId, next) {
				if (next.frozen === false && next.pending.length === 0) states.delete(sessionId);
				else states.set(sessionId, next);
				emit();
			}
		};
		/** Edit one detached queued message's text in place. */
		function updatePendingAt(sessionId, index, text) {
			const pending = states.get(sessionId)?.pending;
			if (pending === void 0) return;
			const entry = pending[index];
			if (entry === void 0) return;
			const next = [...pending];
			next[index] = {
				...entry,
				text
			};
			freezeStore.set(sessionId, {
				frozen: true,
				pending: next
			});
		}
		/** Change one detached queued message's planned insertion tier. */
		function setTierAt(sessionId, index, tier) {
			const pending = states.get(sessionId)?.pending;
			if (pending === void 0) return;
			const entry = pending[index];
			if (entry === void 0) return;
			const next = [...pending];
			next[index] = {
				...entry,
				tier
			};
			freezeStore.set(sessionId, {
				frozen: true,
				pending: next
			});
		}
		/** Remove one detached queued message. */
		function removePendingAt(sessionId, index) {
			const pending = states.get(sessionId)?.pending;
			if (pending === void 0) return;
			freezeStore.set(sessionId, {
				frozen: true,
				pending: pending.filter((_, i) => i !== index)
			});
		}
		/** Move one detached queued message to a new position (reorder while frozen). */
		function movePending(sessionId, from, to) {
			if (from === to) return;
			const pending = states.get(sessionId)?.pending;
			if (pending === void 0) return;
			const next = [...pending];
			const [moved] = next.splice(from, 1);
			if (moved === void 0) return;
			next.splice(to, 0, moved);
			freezeStore.set(sessionId, {
				frozen: true,
				pending: next
			});
		}
		function emit() {
			for (const listener of listeners) listener();
		}
		//#endregion
		//#region \0dsh-css:E:\test\rewrite-agently\mine-dsh-plugins\dsh-input-traffic\src\client\steer-queue-dock.module.css.mjs
		const css$1 = ".FNESVa_dock{box-sizing:border-box;width:min(calc(100% - var(--dsh-composer-side-clearance,16px) - var(--dsh-composer-side-clearance,16px) - var(--dsh-composer-dock-inset,8px) - var(--dsh-composer-dock-inset,8px)), calc(var(--dsh-chat-content-width,100%) - var(--dsh-composer-dock-inset,8px) - var(--dsh-composer-dock-inset,8px)));max-width:calc(var(--dsh-composer-card-max-width,var(--dsh-chat-content-width,100%)) - var(--dsh-composer-dock-inset,8px) - var(--dsh-composer-dock-inset,8px));padding:0 var(--dsh-composer-dock-inset,8px);flex:none;margin:0 auto}.FNESVa_panel{background:var(--dsw-alias-bg-layer-1,#fffc);border:1px solid var(--dsw-alias-border-l2,#00000014);border-radius:10px;overflow:hidden}.FNESVa_toolbar{border-bottom:1px solid var(--dsw-alias-border-l2,#0000000f);align-items:center;gap:8px;padding:4px 8px;display:flex}.FNESVa_header{color:var(--dsw-alias-label-secondary,#6b7280);cursor:pointer;background:0 0;border:0;align-items:center;gap:6px;padding:2px 6px;font-size:12px;display:inline-flex}.FNESVa_header:disabled{cursor:default}.FNESVa_lead{color:var(--dsw-alias-label-tertiary,#9ca3af);display:inline-flex}.FNESVa_count{font-weight:600}.FNESVa_chevron{color:var(--dsw-alias-label-tertiary,#9ca3af);display:inline-flex}.FNESVa_toolbarActions{margin-left:auto}.FNESVa_clear{color:var(--dsw-alias-label-secondary,#6b7280);cursor:pointer;background:0 0;border:1px solid #0000;border-radius:6px;align-items:center;gap:4px;padding:3px 8px;font-size:12px;display:inline-flex}.FNESVa_freeze{border:1px solid var(--dsw-alias-border-l3,#0000001f);color:var(--dsw-alias-label-secondary,#6b7280);cursor:pointer;background:0 0;border-radius:6px;align-items:center;gap:4px;padding:3px 8px;font-size:12px;display:inline-flex}.FNESVa_freeze[aria-pressed=true]{border-color:var(--dsw-alias-state-success-primary,#30a46c);color:var(--dsw-alias-state-success-primary,#30a46c)}.FNESVa_freeze:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,#0000000a)}.FNESVa_freeze:disabled{opacity:.5;cursor:default}.FNESVa_frozenBanner{border-bottom:1px solid var(--dsw-alias-border-l2,#0000000f);background:color-mix(in srgb, var(--dsw-alias-state-success-primary,#30a46c) 8%, transparent);color:var(--dsw-alias-state-success-primary,#30a46c);padding:4px 10px;font-size:12px}.FNESVa_frozenList{margin:0;padding:4px;list-style:none}.FNESVa_frozenRow{border-radius:6px;align-items:center;gap:8px;padding:4px 6px;display:flex}.FNESVa_frozenMark{color:var(--dsw-alias-label-tertiary,#9ca3af);flex:none;margin-left:auto;font-size:11px}.FNESVa_clear:hover:not(:disabled){border-color:var(--dsw-alias-border-l3,#0000001f);background:var(--dsw-alias-interactive-bg-hover,#0000000a)}.FNESVa_clear:disabled{opacity:.5;cursor:default}.FNESVa_clearConfirm{border-color:var(--dsw-alias-state-error-primary,#e5484d);color:var(--dsw-alias-state-error-primary,#e5484d)}.FNESVa_clearConfirm:hover:not(:disabled){border-color:var(--dsw-alias-state-error-primary,#e5484d);background:color-mix(in srgb, var(--dsw-alias-state-error-primary,#e5484d) 8%, transparent)}.FNESVa_clearCancel{color:var(--dsw-alias-label-secondary,#6b7280);cursor:pointer;background:0 0;border:1px solid #0000;border-radius:6px;align-items:center;gap:4px;padding:3px 8px;font-size:12px;display:inline-flex}.FNESVa_clearCancel:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,#0000000a)}.FNESVa_clearLabel{font-size:12px}.FNESVa_list{margin:0;padding:4px;list-style:none}.FNESVa_row{border-radius:6px;align-items:center;gap:8px;padding:4px 6px;display:flex}.FNESVa_row[draggable=true]{cursor:grab}.FNESVa_row[draggable=true]:active{cursor:grabbing}.FNESVa_rowDragOver{outline:2px dashed var(--dsw-alias-border-l4,#00000040);outline-offset:-2px;background:var(--dsw-alias-interactive-bg-hover,#0000000d)}.FNESVa_row:hover{background:var(--dsw-alias-interactive-bg-hover,#00000008)}.FNESVa_row[data-editing]{align-items:flex-start}.FNESVa_preview{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-primary,#1f2937);flex:1;font-size:13px;overflow:hidden}.FNESVa_badge{white-space:nowrap;border-radius:999px;flex:none;align-items:center;gap:4px;padding:1px 6px;font-size:11px;line-height:16px;display:inline-flex}.FNESVa_badgeLabel{color:inherit}.FNESVa_badgeNow{color:var(--dsw-alias-state-error-primary,#e5484d);background:color-mix(in srgb, var(--dsw-alias-state-error-primary,#e5484d) 10%, transparent)}.FNESVa_badgeNext{color:var(--dsw-alias-state-warn-primary,#e8a33d);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary,#e8a33d) 12%, transparent)}.FNESVa_badgeLater{color:var(--dsw-alias-state-success-primary,#30a46c);background:color-mix(in srgb, var(--dsw-alias-state-success-primary,#30a46c) 12%, transparent)}.FNESVa_badgeNow .FNESVa_dot{background:var(--dsw-alias-state-error-primary,#e5484d)}.FNESVa_badgeNext .FNESVa_dot{background:var(--dsw-alias-state-warn-primary,#e8a33d)}.FNESVa_badgeLater .FNESVa_dot{background:var(--dsw-alias-state-success-primary,#30a46c)}.FNESVa_steeringList{margin:0;padding:0 4px 4px;list-style:none}.FNESVa_steeringList .FNESVa_row{opacity:.85}.FNESVa_editor{border:1px solid var(--dsw-alias-border-l3,#00000026);background:var(--dsw-alias-bg-layer-2,#fff);resize:none;border-radius:6px;flex:1;min-width:0;max-height:160px;padding:4px 6px;font-size:13px;line-height:20px;overflow-y:auto}.FNESVa_actions{align-items:center;gap:2px;display:inline-flex}.FNESVa_action{width:24px;height:24px;color:var(--dsw-alias-label-tertiary,#9ca3af);cursor:pointer;background:0 0;border:0;border-radius:6px;justify-content:center;align-items:center;display:inline-flex}.FNESVa_action:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,#0000000d);color:var(--dsw-alias-label-primary,#1f2937)}.FNESVa_action:disabled{opacity:.4;cursor:default}.FNESVa_plan{border-left:1px solid var(--dsw-alias-border-l2,#00000014);align-items:center;gap:2px;margin-left:4px;padding-left:6px;display:inline-flex}.FNESVa_tier{cursor:pointer;background:0 0;border:1px solid #0000;border-radius:6px;justify-content:center;align-items:center;width:20px;height:20px;padding:0;display:inline-flex}.FNESVa_tier:hover:not(:disabled){border-color:var(--dsw-alias-border-l4,#0003)}.FNESVa_tier:disabled{cursor:default}.FNESVa_tierNow{background:#e5484d1f;border-color:#e5484d}.FNESVa_tierNext{background:#e8a33d1f;border-color:#e8a33d}.FNESVa_tierLater{border-color:var(--dsw-alias-state-success-primary,#30a46c);background:color-mix(in srgb, var(--dsw-alias-state-success-primary,#30a46c) 12%, transparent)}.FNESVa_dot{border-radius:50%;width:10px;height:10px}.FNESVa_tierNow .FNESVa_dot{background:#e5484d}.FNESVa_tierNext .FNESVa_dot{background:#e8a33d}.FNESVa_tierLater .FNESVa_dot{background:#30a46c}";
		const tagId$1 = "dsh-input-traffic/steer-queue-dock.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-input-traffic";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var steer_queue_dock_module_css_default = {
			"dock": "FNESVa_dock",
			"list": "FNESVa_list",
			"toolbar": "FNESVa_toolbar",
			"actions": "FNESVa_actions",
			"badgeLabel": "FNESVa_badgeLabel",
			"editor": "FNESVa_editor",
			"count": "FNESVa_count",
			"header": "FNESVa_header",
			"frozenBanner": "FNESVa_frozenBanner",
			"clearCancel": "FNESVa_clearCancel",
			"rowDragOver": "FNESVa_rowDragOver",
			"steeringList": "FNESVa_steeringList",
			"clear": "FNESVa_clear",
			"action": "FNESVa_action",
			"frozenRow": "FNESVa_frozenRow",
			"frozenMark": "FNESVa_frozenMark",
			"plan": "FNESVa_plan",
			"toolbarActions": "FNESVa_toolbarActions",
			"freeze": "FNESVa_freeze",
			"lead": "FNESVa_lead",
			"preview": "FNESVa_preview",
			"badgeLater": "FNESVa_badgeLater",
			"tierNow": "FNESVa_tierNow",
			"row": "FNESVa_row",
			"panel": "FNESVa_panel",
			"badgeNow": "FNESVa_badgeNow",
			"dot": "FNESVa_dot",
			"tierLater": "FNESVa_tierLater",
			"badgeNext": "FNESVa_badgeNext",
			"tier": "FNESVa_tier",
			"tierNext": "FNESVa_tierNext",
			"chevron": "FNESVa_chevron",
			"badge": "FNESVa_badge",
			"frozenList": "FNESVa_frozenList",
			"clearLabel": "FNESVa_clearLabel",
			"clearConfirm": "FNESVa_clearConfirm"
		};
		//#endregion
		//#region src/client/steer-queue-dock.tsx
		/**
		* Three-tier steering queue dock: the shadowing replacement for the official
		* `conversation.input.dock` entry (same cell id `queue`, priority -1, so the
		* lower priority wins and the official QueueDock never renders while this
		* plugin is mounted).
		*
		* Every queued row carries three planning buttons:
		* - green (later, the default state): the row already queues for the next
		*   turn —plain Enter keeps feeding rows here; pressing green on a row that
		*   was already steered (yellow) revokes the insertion and pulls it back to
		*   later (the yellow flow is reversible);
		* - yellow (next): strict-steer the row into the running turn, consumed at
		*   the next step boundary (after the current action finishes);
		* - red (now): cancel the running turn, then remove the row and re-send its
		*   text as a fresh message —the re-send arms the harness wake latch (the
		*   converged driver restarts) and the interrupted input is processed as the
		*   next turn's input. A plain steer after cancel would re-insert a message
		*   that is already pending in next-turn and the inbox rejects it.
		*
		* The toolbar also exposes a queue-level "cancel and clear" that stops the
		* current run and removes every queued row, plus a session-level
		* freeze/resume toggle for the peak-hour scenario: freeze stops the current
		* run while preserving the queue (keepInbox), resume re-arms the driver by
		* re-sending the first queued row so the preserved work continues.
		*/
		/**
		* Suppress the OFFICIAL queue dock entirely: our shadowing entry owns the
		* `queue` cell, so the official dock is only ever mounted as a crash fallback
		* — and its per-row 插话发送 duplicates our yellow tier. Hide the whole
		* container by its css-module class (the `_7yHdaG` hash is baked into the
		* host build and stable across restarts), plus the aria-label match as a
		* second net in case the host rehashes.
		*/
		const HIDE_OFFICIAL_QUEUE_CSS = "[class*=\"_7yHdaG_dock\"]{display:none!important}";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=\"dsh-input-traffic/hide-official-steer\"]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-input-traffic";
			tag.dataset.pluginCss = "dsh-input-traffic/hide-official-steer";
			tag.textContent = HIDE_OFFICIAL_QUEUE_CSS;
			document.head.appendChild(tag);
		}
		/** Busy marker for a whole-queue rebuild (reorder); locks every row action. */
		const REORDER_MARK = "__reorder__";
		/** localStorage key for the manual collapse state (dsh-queue-plus parity). */
		const COLLAPSE_KEY = "dsh-input-traffic:collapsed";
		/**
		* Project the tier badge of one inbox row from its placement. Pure so the
		* row rendering and its tests share one truth.
		* @param placement - the inbox projection placement.
		* @returns the tier badge, or null for non-visible context rows.
		*/
		function badgeFor(placement) {
			if (placement === "steering") return "next";
			if (placement === "queued") return "later";
			return null;
		}
		/**
		* Auto-grow one edit textarea to its content. The CSS max-height caps the
		* growth; beyond it the textarea scrolls internally. Height is reset first so
		* shrink (deleting lines) also tracks the content.
		* @param el - the textarea to resize in place.
		*/
		function resizeEditor(el) {
			el.style.height = "auto";
			el.style.height = `${el.scrollHeight}px`;
		}
		/**
		* Concatenate a queued row's text blocks; null when the row carries anything
		* non-text (attachments) or no content — mirrors the host queue dock's own
		* helper (ui-conversation client.js `textOf`). Wire rows do NOT carry a
		* `.text` field; the text lives in `content` blocks.
		*/
		function textOf(content) {
			if (content === void 0 || content.length === 0) return null;
			if (!content.every((block) => block.type === "text")) return null;
			const joined = content.map((block) => block.text ?? "").join("");
			return joined === "" ? null : joined;
		}
		/**
		* Queue strip with three-tier planning: one item renders directly; multiple
		* items default to a collapsible count header; an empty queue renders nothing.
		*/
		function SteerQueueDock({ sessionId, useSession, useProjection, input, updateQueue, cancel, send, setDraft, notify, t }) {
			const inbox = useProjection("inbox");
			const queue = (0, react.useMemo)(() => (inbox?.["next-turn"] ?? []).map((row) => ({
				...row,
				text: textOf(row.content) ?? row.text ?? null
			})), [inbox]);
			const steering = (0, react.useMemo)(() => (inbox?.["next-step"] ?? []).map((row) => ({
				...row,
				text: textOf(row.content) ?? row.text ?? null
			})), [inbox]);
			const running = useSession((s) => s.running);
			const queueMutable = useSession((s) => s.subagent === null || s.subagent.address.mode === "continuable");
			const [editing, setEditing] = (0, react.useState)(null);
			const [busy, setBusy] = (0, react.useState)(null);
			const [clearing, setClearing] = (0, react.useState)(false);
			const [confirmClear, setConfirmClear] = (0, react.useState)(false);
			const confirmTimer = (0, react.useRef)(null);
			const dragIndex = (0, react.useRef)(null);
			const [dragOver, setDragOver] = (0, react.useState)(null);
			const [collapsed, setCollapsed] = (0, react.useState)(() => {
				try {
					const v = localStorage.getItem(COLLAPSE_KEY);
					return v === null ? true : v === "1";
				} catch {
					return true;
				}
			});
			const { frozen, pending: frozenPending } = (0, react.useSyncExternalStore)(freezeStore.subscribe, () => freezeStore.getSnapshot(sessionId ?? ""));
			const sid = sessionId ?? "";
			const listId = (0, react.useId)();
			const editorRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (queue.length === 0 && !collapsed) setCollapsed(true);
				if (editing !== null && !editing.id.startsWith("frozen:") && (!queueMutable || !queue.some((row) => row.id === editing.id))) setEditing(null);
			}, [
				collapsed,
				editing,
				queue,
				queueMutable
			]);
			(0, react.useEffect)(() => {
				try {
					localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
				} catch {}
			}, [collapsed]);
			(0, react.useEffect)(() => () => {
				if (confirmTimer.current !== null) clearTimeout(confirmTimer.current);
			}, []);
			const editingId = editing?.id;
			(0, react.useEffect)(() => {
				if (editingId === void 0) return;
				const el = editorRef.current;
				if (el !== null) resizeEditor(el);
			}, [editingId]);
			if (queue.length === 0 && steering.length === 0 && !running && !frozen) return null;
			const interactionActive = queueMutable && (editing !== null || busy !== null || clearing);
			const expanded = !collapsed || interactionActive;
			const listVisible = queue.length === 1 || expanded;
			const planDisabled = !queueMutable || !running || frozen;
			const nothingPending = queue.length === 0 && steering.length === 0;
			const reorderUnsupported = queue.some((row) => row.text === null);
			const applyAction = async (itemId, action, failure) => {
				setBusy(itemId);
				try {
					await updateQueue(itemId, action);
					return true;
				} catch {
					notify("error", failure);
					return false;
				} finally {
					setBusy((current) => current === itemId ? null : current);
				}
			};
			const saveEdit = async () => {
				if (editing === null || typeof editing.text !== "string" || editing.text.trim() === "") return;
				const itemId = editing.id;
				const text = editing.text;
				setBusy(itemId);
				try {
					await updateQueue(itemId, {
						kind: "edit",
						content: [{
							type: "text",
							text
						}]
					});
					setEditing(null);
				} catch {
					if (input.draft.trim() === "") {
						setDraft(text);
						setEditing(null);
						notify("error", t("queue.editFailed.pulledBack"));
					} else notify("error", t("queue.editFailed"));
				} finally {
					setBusy((current) => current === itemId ? null : current);
				}
			};
			const steerRow = async (row, tier) => {
				setBusy(row.id);
				try {
					if (tier === "now") {
						await cancel();
						await updateQueue(row.id, { kind: "remove" });
						if (row.text !== null) await send(row.text);
					} else await updateQueue(row.id, { kind: "steer" });
				} catch {
					notify("error", tier === "now" ? t("steer.nowFailed") : t("steer.nextFailed"));
				} finally {
					setBusy((current) => current === row.id ? null : current);
				}
			};
			/**
			* Revoke a steered (yellow) or interrupting (red) row back to later: remove
			* the admitted row and re-send its text as a queued follow-up, so it lands
			* in next-turn again (the yellow flow is reversible).
			*/
			const revokeToLater = async (row) => {
				if (row.text === null) return;
				setBusy(row.id);
				try {
					await updateQueue(row.id, { kind: "remove" });
					await send(row.text);
				} catch {
					notify("error", t("steer.revokeFailed"));
				} finally {
					setBusy((current) => current === row.id ? null : current);
				}
			};
			/**
			* Rebuild the queue in a new order: remove every queued row, then re-send
			* the texts sequentially so the agent's next-turn list matches the new
			* order. Concurrency protection (dsh-queue-plus parity): if a remove fails
			* with queue-item-not-found, the agent already claimed that row — the
			* rebuild stops immediately and nothing is re-sent, so the changed queue
			* is never scrambled.
			*/
			const rebuildQueue = async (rows, next) => {
				setBusy(REORDER_MARK);
				try {
					for (const row of rows) try {
						await updateQueue(row.id, { kind: "remove" });
					} catch (error) {
						if (error instanceof Error && error.message.includes("queue-item-not-found")) {
							notify("error", t("steer.reorderStale"));
							return;
						}
						throw error;
					}
					for (const row of next) if (row.text !== null) await send(row.text);
				} catch {
					notify("error", t("steer.reorderFailed"));
				} finally {
					setBusy(null);
				}
			};
			/**
			* Move one queued row up/down in the FIFO order (arrow buttons).
			*/
			const reorder = async (rowId, delta) => {
				const rows = queue;
				const index = rows.findIndex((row) => row.id === rowId);
				const target = index + delta;
				if (index < 0 || target < 0 || target >= rows.length) return;
				const next = [...rows];
				const swapped = next[index];
				next[index] = next[target];
				next[target] = swapped;
				if (next.some((row) => row.text === null)) {
					notify("error", t("steer.reorder.unsupported"));
					return;
				}
				await rebuildQueue(rows, next);
			};
			/**
			* Move one row to an absolute position (drag-and-drop drop handler).
			*/
			const reorderTo = async (fromIndex, toIndex) => {
				if (fromIndex === toIndex) return;
				const rows = queue;
				if (rows[fromIndex] === void 0 || rows[toIndex] === void 0) return;
				const next = [...rows];
				const [moved] = next.splice(fromIndex, 1);
				if (moved === void 0) return;
				next.splice(toIndex, 0, moved);
				if (next.some((row) => row.text === null)) {
					notify("error", t("steer.reorder.unsupported"));
					return;
				}
				await rebuildQueue(rows, next);
			};
			/** Arm or execute the two-step clear confirmation. */
			const armClear = () => {
				if (confirmClear) {
					if (confirmTimer.current !== null) clearTimeout(confirmTimer.current);
					setConfirmClear(false);
					clearAll();
					return;
				}
				setConfirmClear(true);
				if (confirmTimer.current !== null) clearTimeout(confirmTimer.current);
				confirmTimer.current = setTimeout(() => setConfirmClear(false), 3e3);
			};
			/** Abort the armed clear confirmation (the explicit cancel button). */
			const cancelClear = () => {
				if (confirmTimer.current !== null) clearTimeout(confirmTimer.current);
				setConfirmClear(false);
			};
			/** Save an in-place edit of one detached (frozen) queued message. */
			const saveFrozenEdit = async (index) => {
				if (editing === null) return;
				const text = editing.text.trim();
				if (text === "") {
					setEditing(null);
					return;
				}
				updatePendingAt(sid, index, text);
				setEditing(null);
			};
			const clearAll = async () => {
				setClearing(true);
				const pending = [...queue, ...steering];
				try {
					await cancel();
					await Promise.all(pending.map((row) => updateQueue(row.id, { kind: "remove" }).catch(() => void 0)));
				} catch {
					notify("error", t("steer.clearFailed"));
				} finally {
					setClearing(false);
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: steer_queue_dock_module_css_default.dock,
				"data-steer-dock": "",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: steer_queue_dock_module_css_default.panel,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: steer_queue_dock_module_css_default.toolbar,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: steer_queue_dock_module_css_default.header,
								"aria-controls": listId,
								"aria-expanded": expanded,
								disabled: queue.length <= 1 || interactionActive,
								onClick: () => {
									setCollapsed((value) => !value);
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: steer_queue_dock_module_css_default.lead,
										"aria-hidden": true,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconQueueOutlineMedium, {})
									}),
									queue.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: steer_queue_dock_module_css_default.count,
										children: t("queue.count", { n: queue.length })
									}),
									queue.length > 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: steer_queue_dock_module_css_default.chevron,
										"aria-hidden": true,
										children: expanded ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineMedium, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineMedium, {})
									})
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: steer_queue_dock_module_css_default.toolbarActions,
								children: [confirmClear && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: steer_queue_dock_module_css_default.clearCancel,
									"aria-label": t("steer.clear.cancel"),
									disabled: clearing || busy !== null || nothingPending,
									onClick: cancelClear,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: steer_queue_dock_module_css_default.clearLabel,
										children: t("steer.clear.cancel")
									})
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									label: confirmClear ? t("steer.clear.confirm") : t("steer.clear"),
									side: "top",
									delayMs: 500,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: `${steer_queue_dock_module_css_default.clear} ${confirmClear ? steer_queue_dock_module_css_default.clearConfirm : ""}`,
										"aria-label": confirmClear ? t("steer.clear.confirm") : t("steer.clear"),
										disabled: clearing || busy !== null || nothingPending,
										onClick: armClear,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineMedium, { size: 14 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: steer_queue_dock_module_css_default.clearLabel,
											children: confirmClear ? t("steer.clear.confirm") : t("steer.clear")
										})]
									})
								})]
							})]
						}),
						frozen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: steer_queue_dock_module_css_default.frozenBanner,
							role: "status",
							children: t("steer.frozen")
						}),
						frozen && frozenPending.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: steer_queue_dock_module_css_default.frozenList,
							"data-testid": "frozen-list",
							children: frozenPending.map((entry, i) => {
								const editingFrozen = editing?.id === `frozen:${i}`;
								const text = entry.text;
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
									className: `${steer_queue_dock_module_css_default.frozenRow} ${dragOver === i && frozen ? steer_queue_dock_module_css_default.rowDragOver : ""}`,
									"data-tier": entry.tier === "force" ? "now" : entry.tier === "safe_point" ? "next" : "later",
									"data-editing": editingFrozen ? "" : void 0,
									draggable: !editingFrozen,
									title: !editingFrozen ? t("steer.dragReorder") : void 0,
									onDragStart: (event) => {
										if (editingFrozen) return;
										dragIndex.current = i;
										event.dataTransfer.effectAllowed = "move";
										event.dataTransfer.setData("text/plain", String(i));
									},
									onDragOver: (event) => {
										if (dragIndex.current === null) return;
										event.preventDefault();
										setDragOver(i);
									},
									onDrop: (event) => {
										event.preventDefault();
										const from = dragIndex.current;
										dragIndex.current = null;
										setDragOver(null);
										if (from !== null) movePending(sid, from, i);
									},
									onDragEnd: () => {
										dragIndex.current = null;
										setDragOver(null);
									},
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: steer_queue_dock_module_css_default.lead,
											"aria-hidden": true,
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconQueueOutlineMedium, {})
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SteerBadge, {
											tier: entry.tier === "force" ? "now" : entry.tier === "safe_point" ? "next" : "later",
											t
										}),
										editingFrozen ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
											ref: editorRef,
											autoFocus: true,
											className: steer_queue_dock_module_css_default.editor,
											"aria-label": t("queue.edit"),
											rows: 1,
											value: editing?.text ?? text,
											onChange: (event) => {
												setEditing({
													id: `frozen:${i}`,
													text: event.currentTarget.value
												});
											},
											onInput: (event) => {
												resizeEditor(event.currentTarget);
											},
											onKeyDown: (event) => {
												if (event.key === "Escape") {
													setEditing(null);
													return;
												}
												if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
													event.preventDefault();
													saveFrozenEdit(i);
												}
											}
										}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: steer_queue_dock_module_css_default.preview,
											children: text
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: steer_queue_dock_module_css_default.actions,
											children: editingFrozen ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
												label: t("queue.save"),
												side: "bottom",
												delayMs: 500,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: steer_queue_dock_module_css_default.action,
													"aria-label": t("queue.save"),
													disabled: editing === null || editing.text.trim() === "",
													onClick: () => {
														saveFrozenEdit(i);
													},
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineMedium, { size: 14 })
												})
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
												label: t("queue.cancelEdit"),
												side: "bottom",
												delayMs: 500,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: steer_queue_dock_module_css_default.action,
													"aria-label": t("queue.cancelEdit"),
													onClick: () => {
														setEditing(null);
													},
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineMedium, { size: 14 })
												})
											})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
													label: t("steer.moveUp"),
													side: "bottom",
													delayMs: 500,
													disabled: i === 0,
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: steer_queue_dock_module_css_default.action,
														"aria-label": t("steer.moveUp"),
														disabled: i === 0,
														onClick: () => movePending(sid, i, i - 1),
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineMedium, {})
													})
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
													label: t("steer.moveDown"),
													side: "bottom",
													delayMs: 500,
													disabled: i === frozenPending.length - 1,
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: steer_queue_dock_module_css_default.action,
														"aria-label": t("steer.moveDown"),
														disabled: i === frozenPending.length - 1,
														onClick: () => movePending(sid, i, i + 1),
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineMedium, {})
													})
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
													label: t("queue.edit"),
													side: "bottom",
													delayMs: 500,
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: steer_queue_dock_module_css_default.action,
														"aria-label": t("queue.edit"),
														onClick: () => {
															setEditing({
																id: `frozen:${i}`,
																text
															});
														},
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutlineMedium, { size: 14 })
													})
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
													label: t("queue.remove"),
													side: "bottom",
													delayMs: 500,
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														className: steer_queue_dock_module_css_default.action,
														"aria-label": t("queue.remove"),
														onClick: () => removePendingAt(sid, i),
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineMedium, { size: 14 })
													})
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													className: steer_queue_dock_module_css_default.plan,
													role: "group",
													"aria-label": t("steer.later.aria"),
													children: [
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
															label: t("steer.now"),
															side: "bottom",
															delayMs: 500,
															children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																type: "button",
																className: `${steer_queue_dock_module_css_default.tier} ${steer_queue_dock_module_css_default.tierNow}`,
																"aria-label": t("steer.now"),
																"aria-pressed": entry.tier === "force" || void 0,
																onClick: () => setTierAt(sid, i, "force"),
																children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																	className: steer_queue_dock_module_css_default.dot,
																	"aria-hidden": true
																})
															})
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
															label: t("steer.next"),
															side: "bottom",
															delayMs: 500,
															children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																type: "button",
																className: `${steer_queue_dock_module_css_default.tier} ${steer_queue_dock_module_css_default.tierNext}`,
																"aria-label": t("steer.next"),
																"aria-pressed": entry.tier === "safe_point" || void 0,
																onClick: () => setTierAt(sid, i, "safe_point"),
																children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																	className: steer_queue_dock_module_css_default.dot,
																	"aria-hidden": true
																})
															})
														}),
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
															label: t("steer.later"),
															side: "bottom",
															delayMs: 500,
															children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
																type: "button",
																className: `${steer_queue_dock_module_css_default.tier} ${steer_queue_dock_module_css_default.tierLater}`,
																"aria-label": t("steer.later"),
																"aria-pressed": entry.tier === "queue" || void 0,
																onClick: () => setTierAt(sid, i, "queue"),
																children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																	className: steer_queue_dock_module_css_default.dot,
																	"aria-hidden": true
																})
															})
														})
													]
												})
											] })
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: steer_queue_dock_module_css_default.frozenMark,
											children: t("steer.frozenBadge")
										})
									]
								}, i);
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							id: listId,
							className: steer_queue_dock_module_css_default.list,
							hidden: !listVisible,
							children: listVisible && queue.map((row, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
								className: `${steer_queue_dock_module_css_default.row} ${dragOver === index ? steer_queue_dock_module_css_default.rowDragOver : ""}`,
								"data-tier": badgeFor("queued") ?? void 0,
								"data-editing": editing?.id === row.id ? "" : void 0,
								draggable: queueMutable && !reorderUnsupported && busy === null && !frozen,
								title: queueMutable && !reorderUnsupported && busy === null && !frozen ? t("steer.dragReorder") : void 0,
								onDragStart: (event) => {
									dragIndex.current = index;
									event.dataTransfer.effectAllowed = "move";
									event.dataTransfer.setData("text/plain", String(index));
								},
								onDragOver: (event) => {
									if (dragIndex.current === null) return;
									event.preventDefault();
									setDragOver(index);
								},
								onDrop: (event) => {
									event.preventDefault();
									const from = dragIndex.current;
									dragIndex.current = null;
									setDragOver(null);
									if (from !== null) reorderTo(from, index);
								},
								onDragEnd: () => {
									dragIndex.current = null;
									setDragOver(null);
								},
								children: [
									queue.length === 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: steer_queue_dock_module_css_default.lead,
										"aria-hidden": true,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconQueueOutlineMedium, {})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SteerBadge, {
										tier: badgeFor("queued"),
										t
									}),
									editing?.id === row.id ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										ref: editorRef,
										autoFocus: true,
										className: steer_queue_dock_module_css_default.editor,
										"aria-label": t("queue.edit"),
										rows: 1,
										value: editing.text,
										onChange: (event) => {
											setEditing({
												id: row.id,
												text: event.currentTarget.value
											});
										},
										onInput: (event) => {
											resizeEditor(event.currentTarget);
										},
										onKeyDown: (event) => {
											if (event.key === "Escape") {
												setEditing(null);
												return;
											}
											if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
												event.preventDefault();
												saveEdit();
											}
										}
									}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: steer_queue_dock_module_css_default.preview,
										children: row.text
									}),
									queueMutable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: steer_queue_dock_module_css_default.actions,
										children: editing?.id === row.id ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
											label: t("queue.save"),
											side: "bottom",
											delayMs: 500,
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: steer_queue_dock_module_css_default.action,
												"aria-label": t("queue.save"),
												disabled: busy !== null || editing.text.trim() === "",
												onClick: () => {
													saveEdit();
												},
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineMedium, { size: 14 })
											})
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
											label: t("queue.cancelEdit"),
											side: "bottom",
											delayMs: 500,
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: steer_queue_dock_module_css_default.action,
												"aria-label": t("queue.cancelEdit"),
												disabled: busy !== null,
												onClick: () => {
													setEditing(null);
												},
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineMedium, { size: 14 })
											})
										})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
												label: t("steer.moveUp"),
												side: "bottom",
												delayMs: 500,
												disabled: frozen || reorderUnsupported,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: steer_queue_dock_module_css_default.action,
													"aria-label": t("steer.moveUp"),
													title: reorderUnsupported ? t("steer.reorder.unsupported") : void 0,
													disabled: busy !== null || frozen || reorderUnsupported,
													onClick: () => {
														reorder(row.id, -1);
													},
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineMedium, {})
												})
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
												label: t("steer.moveDown"),
												side: "bottom",
												delayMs: 500,
												disabled: frozen || reorderUnsupported,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: steer_queue_dock_module_css_default.action,
													"aria-label": t("steer.moveDown"),
													title: reorderUnsupported ? t("steer.reorder.unsupported") : void 0,
													disabled: busy !== null || frozen || reorderUnsupported,
													onClick: () => {
														reorder(row.id, 1);
													},
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineMedium, {})
												})
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
												label: t("queue.edit"),
												side: "bottom",
												delayMs: 500,
												disabled: row.text === null,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: steer_queue_dock_module_css_default.action,
													"aria-label": t("queue.edit"),
													title: row.text === null ? t("queue.edit.unsupported") : void 0,
													disabled: busy !== null || row.text === null,
													onClick: () => {
														if (row.text !== null) setEditing({
															id: row.id,
															text: row.text ?? ""
														});
													},
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutlineMedium, { size: 14 })
												})
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
												label: t("queue.remove"),
												side: "bottom",
												delayMs: 500,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: steer_queue_dock_module_css_default.action,
													"aria-label": t("queue.remove"),
													disabled: busy !== null,
													onClick: () => {
														applyAction(row.id, { kind: "remove" }, t("queue.removeFailed"));
													},
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineMedium, { size: 14 })
												})
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: steer_queue_dock_module_css_default.plan,
												role: "group",
												"aria-label": t("steer.later.aria"),
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
														label: t("steer.now"),
														side: "bottom",
														delayMs: 500,
														disabled: planDisabled || row.text === null,
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
															type: "button",
															className: `${steer_queue_dock_module_css_default.tier} ${steer_queue_dock_module_css_default.tierNow}`,
															"aria-label": t("steer.now"),
															title: planDisabled ? t("steer.unavailable.running") : row.text === null ? t("steer.now.unsupported") : void 0,
															disabled: busy !== null || planDisabled || row.text === null,
															onClick: () => {
																steerRow(row, "now");
															},
															children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																className: steer_queue_dock_module_css_default.dot,
																"aria-hidden": true
															})
														})
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
														label: t("steer.next"),
														side: "bottom",
														delayMs: 500,
														disabled: planDisabled,
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
															type: "button",
															className: `${steer_queue_dock_module_css_default.tier} ${steer_queue_dock_module_css_default.tierNext}`,
															"aria-label": t("steer.next"),
															title: planDisabled ? t("steer.unavailable.running") : void 0,
															disabled: busy !== null || planDisabled,
															onClick: () => {
																steerRow(row, "next");
															},
															children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																className: steer_queue_dock_module_css_default.dot,
																"aria-hidden": true
															})
														})
													}),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
														label: t("steer.later"),
														side: "bottom",
														delayMs: 500,
														children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
															type: "button",
															className: `${steer_queue_dock_module_css_default.tier} ${steer_queue_dock_module_css_default.tierLater}`,
															"aria-label": t("steer.later"),
															"aria-pressed": true,
															disabled: busy !== null || clearing,
															onClick: () => {},
															children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
																className: steer_queue_dock_module_css_default.dot,
																"aria-hidden": true
															})
														})
													})
												]
											})
										] })
									})
								]
							}, row.id))
						}),
						steering.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: steer_queue_dock_module_css_default.steeringList,
							"data-steering-list": "",
							children: steering.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
								className: steer_queue_dock_module_css_default.row,
								"data-tier": badgeFor("steering") ?? void 0,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: steer_queue_dock_module_css_default.lead,
										"aria-hidden": true,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconQueueOutlineMedium, {})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SteerBadge, {
										tier: badgeFor("steering"),
										t
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: steer_queue_dock_module_css_default.preview,
										children: row.text
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: steer_queue_dock_module_css_default.actions,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
											label: t("steer.revoke"),
											side: "bottom",
											delayMs: 500,
											disabled: row.text === null,
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: `${steer_queue_dock_module_css_default.tier} ${steer_queue_dock_module_css_default.tierLater}`,
												"aria-label": t("steer.revoke"),
												title: row.text === null ? t("steer.revoke.unsupported") : void 0,
												disabled: busy !== null || row.text === null || frozen,
												onClick: () => {
													revokeToLater(row);
												},
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: steer_queue_dock_module_css_default.dot,
													"aria-hidden": true
												})
											})
										})
									})
								]
							}, row.id))
						})
					]
				})
			});
		}
		/** Badge label keys per tier. */
		const BADGE_KEYS = {
			now: "steer.badge.now",
			next: "steer.badge.next",
			later: "steer.badge.later"
		};
		/** Badge tint classes per tier (present at bundle time; typed through the css-modules declaration). */
		const BADGE_CLASSES = {
			now: steer_queue_dock_module_css_default.badgeNow,
			next: steer_queue_dock_module_css_default.badgeNext,
			later: steer_queue_dock_module_css_default.badgeLater
		};
		/** One row's tier badge: colored dot + label; context rows render nothing. */
		function SteerBadge({ tier, t }) {
			if (tier === null) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: `${steer_queue_dock_module_css_default.badge} ${BADGE_CLASSES[tier]}`,
				"data-badge": tier,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: steer_queue_dock_module_css_default.dot,
					"aria-hidden": true
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: steer_queue_dock_module_css_default.badgeLabel,
					children: t(BADGE_KEYS[tier])
				})]
			});
		}
		//#endregion
		//#region src/client/session-guard-bridge.ts
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
		async function sessionGuardStopNextTurn(sessionId) {
			return callGuard(sessionId, "stopNextTurn");
		}
		/** 尽力调用 sessionGuard.resume。失败静默。 */
		async function sessionGuardResume(sessionId) {
			return callGuard(sessionId, "resume");
		}
		async function callGuard(sessionId, action) {
			try {
				const res = await fetch("/session-guard/rpc", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						sessionId,
						action
					})
				});
				if (!res.ok) return false;
				return (await res.json().catch(() => null))?.ok === true;
			} catch {
				return false;
			}
		}
		try {
			globalThis.__DSH_SESSION_GUARD_BRIDGE__ = true;
		} catch {}
		//#endregion
		//#region \0dsh-css:E:\test\rewrite-agently\mine-dsh-plugins\dsh-input-traffic\src\client\freeze-button.module.css.mjs
		const css = ".BUSMDW_freeze{border:1px solid var(--dsw-alias-border-l3,#0000001f);height:24px;color:var(--dsw-alias-label-secondary,#6b7280);cursor:pointer;white-space:nowrap;background:0 0;border-radius:6px;align-items:center;gap:4px;padding:0 8px;font-size:12px;display:inline-flex}.BUSMDW_freeze:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,#0000000a)}.BUSMDW_freeze[aria-pressed=true]{border-color:var(--dsw-alias-state-success-primary,#30a46c);color:var(--dsw-alias-state-success-primary,#30a46c);background:color-mix(in srgb, var(--dsw-alias-state-success-primary,#30a46c) 8%, transparent)}.BUSMDW_label{font-size:12px}";
		const tagId = "dsh-input-traffic/freeze-button.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-input-traffic";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var freeze_button_module_css_default = {
			"freeze": "BUSMDW_freeze",
			"label": "BUSMDW_label"
		};
		//#endregion
		//#region src/client/freeze-button.tsx
		/**
		* Session freeze/resume control, mounted in the composer's right tool row
		* (`conversation.input.right`) so it is reachable before anything queues.
		*
		* Peak-hour pause semantics: freeze does NOT interrupt the running turn —it
		* finishes naturally. The queued messages are detached (removed, preserved in
		* the shared store), so the driver finds no pending work and stops after the
		* current turn. Resume re-submits the preserved texts, waking the driver and
		* continuing the queue.
		*
		* dsh-session-guard 协作（D8 fail-open）：
		* - 冻结 = 前端摘队列（本插件）+ composer block（阻止新输入漏进对话） + 尽力调服务端
		*   sessionGuard.stopNextTurn（停掉 session 下一回合；session-guard 未装时静默跳过）。
		* - 解冻 = 清 composer block + **先** await sessionGuard.resume（让被打断回合的自然
		*   下一步先发生），**再**重投队列（later 级条目因此排在自然 next turn 之后，不再插队）。
		* - 本插件只做冻结增强，不承担重试/暂停决策（归后端，D9）。
		*/
		/**
		* Freeze/resume toggle for the peak-hour scenario.
		* @param props - slot props; the session snapshot drives the detach list.
		*/
		function FreezeButton({ useProjection, updateQueue, cancel, send, sendSteer, sessionId, setComposerBlock, notify, t }) {
			const sid = sessionId ?? "";
			const { frozen } = (0, react.useSyncExternalStore)(freezeStore.subscribe, () => freezeStore.getSnapshot(sid));
			const inbox = useProjection("inbox");
			const freeze = async () => {
				const steeredIds = new Set((inbox?.["next-step"] ?? []).map((row) => row.id));
				const rows = [...inbox?.["next-turn"] ?? [], ...inbox?.["next-step"] ?? []].map((row) => ({
					...row,
					text: textOf(row.content) ?? row.text ?? null
				}));
				const pending = rows.flatMap((row) => typeof row.text === "string" && row.text !== "" ? [{
					text: row.text,
					tier: steeredIds.has(row.id) ? "safe_point" : "queue"
				}] : []);
				await Promise.all(rows.map((row) => updateQueue(row.id, { kind: "remove" }).catch(() => void 0)));
				freezeStore.set(sid, {
					frozen: true,
					pending
				});
				setComposerBlock?.(t("steer.frozenInput"));
				if (sessionId !== void 0) sessionGuardStopNextTurn(sessionId);
			};
			const resume = async () => {
				const pending = freezeStore.getSnapshot(sid).pending;
				freezeStore.set(sid, {
					frozen: false,
					pending: []
				});
				setComposerBlock?.(void 0);
				try {
					if (sessionId !== void 0) await sessionGuardResume(sessionId);
					for (const entry of pending) {
						if (entry.tier === "force") await cancel();
						if (entry.tier === "safe_point" && sendSteer !== void 0) await sendSteer(entry.text);
						else await send(entry.text);
					}
				} catch {
					notify("error", t("steer.resumeFailed"));
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: freeze_button_module_css_default.freeze,
				"aria-label": frozen ? t("steer.resume") : t("steer.freeze"),
				"aria-pressed": frozen || void 0,
				title: frozen ? t("steer.frozen") : void 0,
				onClick: () => {
					if (frozen) resume();
					else freeze();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: freeze_button_module_css_default.label,
					children: frozen ? t("steer.resume") : t("steer.freeze")
				})
			});
		}
		//#endregion
		//#region src/client/family-card.tsx
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
		const row = {
			display: "flex",
			alignItems: "center",
			justifyContent: "space-between",
			gap: 12,
			padding: "8px 0",
			fontSize: 13
		};
		const label = { color: "var(--dsw-alias-label-primary, inherit)" };
		const dim = {
			color: "var(--dsw-alias-label-tertiary, rgba(127,127,127,.8))",
			fontSize: 12,
			lineHeight: 1.5
		};
		function InputTrafficFamilyCard({ scope, t }) {
			const pinned = (0, react.useSyncExternalStore)((listener) => scope.subscribe(listener), () => scope.getSnapshot()).value?.busyEnter ?? "queue";
			const tr = (key) => t ? t(key) : FALLBACK_ZH[key] ?? key;
			return (0, react.createElement)("div", { style: {
				display: "grid",
				gap: 6
			} }, (0, react.createElement)("div", { style: row }, (0, react.createElement)("span", { style: label }, tr("family.busyEnter")), (0, react.createElement)("span", { style: dim }, `busyEnter = ${pinned}`)), (0, react.createElement)("p", { style: {
				...dim,
				margin: 0
			} }, tr("family.desc")));
		}
		/** 无 locale 服务时的中文兜底（与 zh 字典键一一对应）。 */
		const FALLBACK_ZH = {
			"family.busyEnter": "busy-Enter 行为（本插件接管）",
			"family.desc": "普通回车在繁忙时进入排队（queue），不会打断当前回答；打断请用输入区的冻结/转向按钮。该行为由本插件自动接管，无需配置。"
		};
		//#endregion
		//#region src/client/hide-enter-row.tsx
		/** Render nothing: the official busy-Enter row is hidden while mounted. */
		function HideEnterRow(_props) {
			return null;
		}
		//#endregion
		//#region src/client/compat.ts
		/**
		* Pin the busy-Enter field through whichever durable-settings service this
		* host line carries, then hand the resolved scope to `onScope`.
		*
		* Both variants are scoped sub-injects: on a host without the service the
		* fiber waits forever WITHOUT blocking the plugin's other faces (same posture
		* as the family tab's slot-inject when the family holder is absent).
		*/
		function registerSettingsFaces(ctx, deps) {
			ctx.inject(["configForms"], (configForms) => {
				const scope = configForms.get(deps.namespace);
				scope.set(deps.field, deps.value);
				deps.onScope(scope);
			});
			ctx.inject(["settingsScope"], (settingsScope) => {
				const scope = settingsScope.bind({ namespace: deps.namespace });
				scope.set(deps.field, deps.value);
				deps.onScope(scope);
			});
		}
		/**
		* Draft back-fill normalized across host lines: prefers the direct
		* `.setDraft` (0.1.7+), falls back to the `.actions` parking spot (≤0.1.5).
		* Pure shape probing on the conversation row object — no version reads.
		*/
		function draftWriter(conversation, actx) {
			return (text) => {
				const row = conversation.input.for(actx);
				if (typeof row.setDraft === "function") row.setDraft(text);
				else row.actions?.setDraft(text);
			};
		}
		//#endregion
		//#region src/client/index.ts
		/** Durable conversation settings namespace owned by ui-conversation. */
		const CONVERSATION_SETTINGS_NAMESPACE = "ui-conversation";
		/** Busy-Enter field inside that namespace; the plugin pins it to queue. */
		const BUSY_ENTER_FIELD = "busyEnter";
		/**
		* Display order of the queue strip inside `conversation.input.dock`.
		*
		* List rows render sorted by `order` ascending, so a value above every other
		* contributor keeps the strip as the bottom-most entry of the band — directly
		* on top of the composer card. Known contributors (stable across hosts
		* 0.1.5-rc.1 → 0.2.0-rc.2): `todo` 0, official `queue` 20,
		* `dsh-perm-gate.notice` 30, `dsh-tidy-display-entry` 0. DSH has no "last"
		* slot semantics, so this is a convention, not a
		* structural guarantee: a third party registering a larger value could still
		* land below us.
		*/
		const QUEUE_DOCK_ORDER = 1e3;
		/**
		* Deliver one plain-text message into the session's next step. The exposed
		* conversation `send` verb only queues into the next turn, so resume steers
		* through the session face's steer-mode prompt instead (no harness change).
		* @param ctx - root context (resolves the session face behind the scope).
		* @param actx - agent-scoped context of the owning session.
		* @param text - message text to deliver.
		*/
		function steerPrompt(actx, text) {
			const conversation = actx.get("conversation");
			if (conversation === void 0) return Promise.reject(/* @__PURE__ */ new Error("steer resume: conversation service unavailable"));
			return conversation.send(text);
		}
		/**
		* Services required by the browser half. Only the six-line-universal faces
		* live here — the durable-settings face (`configForms` on 0.1.7+,
		* `settingsScope` on ≤0.1.5) is resolved by scoped sub-injects inside the
		* compat waist, because a plugin-level inject of a per-line service would
		* leave the WHOLE fiber PENDING on the other line (silent total deactivation).
		*/
		const inject = [
			"slots",
			"locale",
			"sessions",
			"conversation"
		];
		/**
		* Client plugin body: dictionaries, busy-Enter pinning, and the two slot
		* shadowings.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, dictionaries), "dsh-input-traffic: dictionaries");
			const tFamily = ctx.locale.bind(NS);
			registerSettingsFaces(ctx, {
				namespace: CONVERSATION_SETTINGS_NAMESPACE,
				field: BUSY_ENTER_FIELD,
				value: "queue",
				onScope: (scope) => {
					ctx.slots.inject("dsh-family.tab", () => ctx.slots.register({
						name: "dsh-family.tab",
						id: "input-traffic",
						order: 50,
						label: () => tFamily("family.title"),
						locale: NS,
						inject: () => ({ scope })
					}, InputTrafficFamilyCard));
				}
			});
			ctx.slots.inject("conversation.input.dock", () => ctx.slots.register({
				name: "conversation.input.dock",
				id: "queue",
				order: QUEUE_DOCK_ORDER,
				priority: -1,
				locale: NS,
				inject: (sessionId) => {
					const actx = ctx.sessions.scope(sessionId);
					if (actx === void 0) throw new Error(`steer dock: session "${sessionId}" resolved no scope`);
					const conversation = actx.get("conversation");
					if (conversation === void 0) throw new Error("steer dock: conversation service unavailable");
					return {
						updateQueue: (itemId, action) => conversation.updateQueue(itemId, action),
						cancel: () => conversation.cancel(),
						send: (text) => conversation.send(text),
						setDraft: draftWriter(conversation, actx),
						notify: (level, text) => {
							conversation.input.for(actx).notify(level, text);
						}
					};
				}
			}, SteerQueueDock));
			ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
				name: "conversation.input.right",
				id: "steer-freeze",
				order: 30,
				locale: NS,
				inject: (sessionId) => {
					const actx = ctx.sessions.scope(sessionId);
					if (actx === void 0) throw new Error(`steer freeze: session "${sessionId}" resolved no scope`);
					const conversation = actx.get("conversation");
					if (conversation === void 0) throw new Error("steer freeze: conversation service unavailable");
					return {
						updateQueue: (itemId, action) => conversation.updateQueue(itemId, action),
						cancel: () => conversation.cancel(),
						send: (text) => conversation.send(text),
						sendSteer: (text) => steerPrompt(actx, text),
						sessionId: String(sessionId),
						setDraft: draftWriter(conversation, actx),
						notify: (level, text) => {
							conversation.input.for(actx).notify(level, text);
						},
						setComposerBlock: (reason) => {
							conversation.blocks.set(sessionId, reason === void 0 ? void 0 : { reason });
						}
					};
				}
			}, FreezeButton));
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "composer-enter",
				order: 20,
				priority: -1,
				locale: NS
			}, HideEnterRow));
		}
		//#endregion
		exports.QUEUE_DOCK_ORDER = QUEUE_DOCK_ORDER;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map