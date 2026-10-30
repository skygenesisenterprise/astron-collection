/**
 * Engine wiring for the Next.js host.
 *
 * The status platform (storage + services + HTTP application) is created
 * once per process and cached on `globalThis`, the same pattern the console
 * app uses for its database pool — dev servers and route handlers all share
 * one SQLite handle. The notification outbox worker is started alongside.
 */

import type { OutboxWorkerHandle } from "@astron-collection/status";
import { createStatusPlatform, type StatusPlatform } from "@astron-collection/status";

const globalForStatus = globalThis as unknown as {
	astronCollectionStatus?: StatusPlatform;
	astronCollectionStatusWorker?: OutboxWorkerHandle | null;
};

export const getPlatform = (): StatusPlatform => {
	if (!globalForStatus.astronCollectionStatus) {
		const platform = createStatusPlatform();
		globalForStatus.astronCollectionStatus = platform;
		if (platform.mode === "read-write") {
			globalForStatus.astronCollectionStatusWorker = platform.startWorkers();
		}
	}
	return globalForStatus.astronCollectionStatus;
};
