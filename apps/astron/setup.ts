import { exec } from "node:child_process";
import { exit } from "node:process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

import { setupDirectories } from "@astron-collection/server/setup/config-paths";
import { initializePostgres } from "@astron-collection/server/setup/postgres-setup";
import {
	initializeNetwork,
	initializeSwarm,
} from "@astron-collection/server/setup/setup";
import {
	createDefaultMiddlewares,
	createDefaultServerTraefikConfig,
	createDefaultTraefikConfig,
	initializeStandaloneTraefik,
	TRAEFIK_VERSION,
} from "@astron-collection/server/setup/traefik-setup";

(async () => {
	try {
		setupDirectories();
		createDefaultMiddlewares();
		await initializeSwarm();
		await initializeNetwork();
		createDefaultTraefikConfig();
		createDefaultServerTraefikConfig();
		await execAsync(`docker pull traefik:v${TRAEFIK_VERSION}`);
		await initializeStandaloneTraefik();
		await initializePostgres();
		console.log("Astron Collection setup completed");
		exit(0);
	} catch (e) {
		console.error("Error in astron-collection setup", e);
	}
})();
