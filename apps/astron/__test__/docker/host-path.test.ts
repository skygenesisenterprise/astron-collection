import { mapPathToHostTree } from "@astron-collection/server/utils/docker/host-path";
import { describe, expect, it } from "vitest";

const BASE_PATH = "/etc/astron-collection";
const VOLUME_PATH = "/var/lib/docker/volumes/astron-collection-config/_data";

describe("mapPathToHostTree", () => {
	it("leaves a path outside the configuration tree alone", () => {
		expect(mapPathToHostTree("/srv/data", BASE_PATH, VOLUME_PATH)).toBe(
			"/srv/data",
		);
	});

	it("leaves a sibling directory that only shares the prefix alone", () => {
		expect(
			mapPathToHostTree("/etc/astron-collection-old/torrc", BASE_PATH, VOLUME_PATH),
		).toBe("/etc/astron-collection-old/torrc");
	});

	it("keeps the path when the tree is mounted at the same path", () => {
		expect(
			mapPathToHostTree("/etc/astron-collection/onion/abc/torrc", BASE_PATH, BASE_PATH),
		).toBe("/etc/astron-collection/onion/abc/torrc");
	});

	it("maps the path onto the source the daemon mounts", () => {
		expect(
			mapPathToHostTree(
				"/etc/astron-collection/onion/abc/torrc",
				BASE_PATH,
				VOLUME_PATH,
			),
		).toBe(`${VOLUME_PATH}/onion/abc/torrc`);
	});

	it("maps the configuration root itself", () => {
		expect(mapPathToHostTree(BASE_PATH, BASE_PATH, VOLUME_PATH)).toBe(
			VOLUME_PATH,
		);
	});
});
