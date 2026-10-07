//#region lib/types/bridge.js
/** Route pair for one settings ns — client and server must derive identically. */
function bridgeRoutesFor(ns) {
	return {
		describe: `/api/${ns}/settings/describe`,
		mutate: `/api/${ns}/settings/mutate`
	};
}
function readJsonBody(reqRaw, limit = 262144) {
	const req = reqRaw;
	return new Promise((resolve, reject) => {
		const chunks = [];
		let size = 0;
		req.on("data", (chunk) => {
			const buf = chunk;
			size += buf.length;
			if (size > limit) {
				reject(/* @__PURE__ */ new Error("bridge body too large"));
				req.resume?.();
				return;
			}
			chunks.push(buf);
		});
		req.on("end", () => {
			const raw = Buffer.concat(chunks).toString("utf8");
			if (raw === "") {
				resolve({});
				return;
			}
			try {
				resolve(JSON.parse(raw));
			} catch (e) {
				reject(e instanceof Error ? e : new Error(String(e)));
			}
		});
		req.on("error", reject);
	});
}
function sendJson(res, code, body) {
	res.writeHead(code, {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-cache"
	});
	res.end(JSON.stringify(body));
}
function isConflict(e) {
	return e instanceof Error && /conflict|revision/i.test(e.message);
}
function registerSettingsBridgeRoutes(server, getSettingsSvc, ns) {
	if (typeof server !== "object" || server === null) return [];
	const ws = typeof server.register === "function" ? server : void 0;
	if (ws === void 0) return [];
	const offs = [];
	const routes = bridgeRoutesFor(ns);
	offs.push(ws.register({
		kind: "exact",
		path: routes.describe,
		handler: (rawReq, rawRes) => {
			const req = rawReq;
			const res = rawRes;
			if (req.method !== "POST") {
				sendJson(res, 405, {
					ok: false,
					code: "method-not-allowed"
				});
				return;
			}
			const svc = getSettingsSvc();
			if (svc === void 0 || typeof svc.describe !== "function") {
				sendJson(res, 200, {
					ok: false,
					code: "settings-unavailable",
					message: "settings service not resolved yet"
				});
				return;
			}
			try {
				const descriptor = svc.describe({ redactSecrets: true }).find((d) => d.ns === ns);
				if (descriptor === void 0) {
					sendJson(res, 200, {
						ok: false,
						code: "ns-not-registered",
						message: `settings namespace "${ns}" is not registered`
					});
					return;
				}
				sendJson(res, 200, {
					ok: true,
					value: {
						descriptor,
						writable: svc.writable !== false
					}
				});
			} catch (e) {
				sendJson(res, 200, {
					ok: false,
					code: "internal",
					message: e instanceof Error ? e.message : String(e)
				});
			}
		}
	}));
	offs.push(ws.register({
		kind: "exact",
		path: routes.mutate,
		handler: (rawReq, rawRes) => {
			const req = rawReq;
			const res = rawRes;
			if (req.method !== "POST") {
				sendJson(res, 405, {
					ok: false,
					code: "method-not-allowed"
				});
				return;
			}
			const svc = getSettingsSvc();
			const mutate = svc === void 0 ? void 0 : svc.mutate;
			if (typeof mutate !== "function") {
				sendJson(res, 200, {
					ok: false,
					code: "settings-unavailable",
					message: "settings service mutate not available"
				});
				return;
			}
			readJsonBody(req).then((body) => {
				const ops = body.ops;
				if (!Array.isArray(ops) || ops.some((op) => !op || typeof op !== "object" || !(op.op in {
					set: 1,
					unset: 1
				}))) {
					sendJson(res, 200, {
						ok: false,
						code: "settings-rejected",
						message: "malformed bridge mutate ops"
					});
					return;
				}
				const expectedRevision = typeof body.expectedRevision === "number" ? body.expectedRevision : void 0;
				mutate.call(svc, ns, ops, expectedRevision).then(() => {
					const descriptor = svc.describe({ redactSecrets: true }).find((d) => d.ns === ns);
					if (descriptor === void 0) {
						sendJson(res, 200, {
							ok: false,
							code: "internal",
							message: `namespace "${ns}" disposed after mutate`
						});
						return;
					}
					sendJson(res, 200, {
						ok: true,
						value: { descriptor }
					});
				}).catch((e) => {
					sendJson(res, 200, isConflict(e) ? {
						ok: false,
						code: "settings-conflict",
						message: e instanceof Error ? e.message : String(e)
					} : {
						ok: false,
						code: "internal",
						message: e instanceof Error ? e.message : String(e)
					});
				});
			}).catch((e) => {
				sendJson(res, 200, {
					ok: false,
					code: "bad-request",
					message: e instanceof Error ? e.message : String(e)
				});
			});
		}
	}));
	return offs;
}
//#endregion
//#region lib/types/index.js
/** The settings namespace the browser half pins (`ui-conversation.busyEnter`). */
const BRIDGE_NS = "ui-conversation";
/** webServer hosts the bridge route pair. */
const inject = ["webServer"];
/** @param ctx - host-side context; registers the bridge route pair. */
function apply(ctx) {
	const settingsRef = {};
	ctx.inject(["settings"], (child) => {
		settingsRef.svc = child.settings;
	});
	ctx.effect(() => {
		const injected = ctx;
		const offs = registerSettingsBridgeRoutes(injected.webServer ?? injected.get?.("webServer"), () => settingsRef.svc, BRIDGE_NS);
		return () => {
			for (const off of offs) off();
		};
	}, "dsh-input-traffic: settings bridge routes");
}
//#endregion
export { apply, inject };
