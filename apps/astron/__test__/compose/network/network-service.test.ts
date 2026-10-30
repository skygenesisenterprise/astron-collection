import type { ComposeSpecification } from "@astron-collection/server";
import {
	addSuffixToServiceNetworks,
	generateRandomHash,
} from "@astron-collection/server";
import { expect, test } from "vitest";
import { parse } from "yaml";

const composeFile = `
version: "3.8"

services:
  web:
    image: nginx:latest
    networks:
      - frontend
      - backend

  api:
    image: myapi:latest
    networks:
      - backend
`;

test("Add suffix to networks in services", () => {
	const composeData = parse(composeFile) as ComposeSpecification;

	const suffix = generateRandomHash();

	if (!composeData?.services) {
		return;
	}
	const services = addSuffixToServiceNetworks(composeData.services, suffix);
	const actualComposeData = { ...composeData, services };

	expect(actualComposeData?.services?.web?.networks).toContain(
		`frontend-${suffix}`,
	);

	expect(actualComposeData?.services?.api?.networks).toContain(
		`backend-${suffix}`,
	);

	const apiNetworks = actualComposeData?.services?.api?.networks;

	expect(apiNetworks).toBeDefined();
	expect(actualComposeData?.services?.api?.networks).toContain(
		`backend-${suffix}`,
	);
});

// Caso 2: Objeto con aliases
const composeFile2 = `
version: "3.8"

services:
  api:
    image: myapi:latest
    networks:
      frontend:
        aliases:
          - api

networks:
  frontend:
    driver: bridge
`;

test("Add suffix to networks in services with aliases", () => {
	const composeData = parse(composeFile2) as ComposeSpecification;

	const suffix = generateRandomHash();

	if (!composeData?.services) {
		return;
	}
	const services = addSuffixToServiceNetworks(composeData.services, suffix);
	const actualComposeData = { ...composeData, services };

	expect(actualComposeData.services?.api?.networks).toHaveProperty(
		`frontend-${suffix}`,
	);

	const networkConfig = actualComposeData?.services?.api?.networks as {
		[key: string]: { aliases?: string[] };
	};
	expect(networkConfig[`frontend-${suffix}`]).toBeDefined();
	expect(networkConfig[`frontend-${suffix}`]?.aliases).toContain("api");

	expect(actualComposeData.services?.api?.networks).not.toHaveProperty(
		"frontend-ash",
	);
});

const composeFile3 = `
version: "3.8"

services:
  redis:
    image: redis:alpine
    networks:
      backend:

networks:
  backend:
    driver: bridge
`;

test("Add suffix to networks in services (Object with simple networks)", () => {
	const composeData = parse(composeFile3) as ComposeSpecification;

	const suffix = generateRandomHash();

	if (!composeData?.services) {
		return;
	}
	const services = addSuffixToServiceNetworks(composeData.services, suffix);
	const actualComposeData = { ...composeData, services };

	expect(actualComposeData.services?.redis?.networks).toHaveProperty(
		`backend-${suffix}`,
	);
});

const composeFileCombined = `
version: "3.8"

services:
  web:
    image: nginx:latest
    networks:
      - frontend
      - backend

  api:
    image: myapi:latest
    networks:
      frontend:
        aliases:
          - api

  redis:
    image: redis:alpine
    networks:
      backend:

networks:
  frontend:
    driver: bridge

  backend:
    driver: bridge
`;

test("Add suffix to networks in services (combined case)", () => {
	const composeData = parse(composeFileCombined) as ComposeSpecification;

	const suffix = generateRandomHash();

	if (!composeData?.services) {
		return;
	}
	const services = addSuffixToServiceNetworks(composeData.services, suffix);
	const actualComposeData = { ...composeData, services };

	// Caso 1: ListOfStrings
	expect(actualComposeData.services?.web?.networks).toContain(
		`frontend-${suffix}`,
	);
	expect(actualComposeData.services?.web?.networks).toContain(
		`backend-${suffix}`,
	);

	// Caso 2: Objeto con aliases
	const apiNetworks = actualComposeData.services?.api?.networks as {
		[key: string]: unknown;
	};
	expect(apiNetworks).toHaveProperty(`frontend-${suffix}`);
	expect(apiNetworks[`frontend-${suffix}`]).toBeDefined();
	expect(apiNetworks).not.toHaveProperty("frontend");

	// Caso 3: Objeto con redes simples
	const redisNetworks = actualComposeData.services?.redis?.networks;
	expect(redisNetworks).toHaveProperty(`backend-${suffix}`);
	expect(redisNetworks).not.toHaveProperty("backend");
});

const composeFile7 = `
version: "3.8"

services:
  web:
    image: nginx:latest
    networks:
      - astron-collection-network
`;

test("It shouldn't add suffix to astron-collection-network in services", () => {
	const composeData = parse(composeFile7) as ComposeSpecification;

	const suffix = generateRandomHash();

	if (!composeData?.services) {
		return;
	}
	const networks = addSuffixToServiceNetworks(composeData.services, suffix);
	const service = networks.web;

	expect(service).toBeDefined();
	expect(service?.networks).toContain("astron-collection-network");
});

const composeFile8 = `
version: "3.8"

services:
  web:
    image: nginx:latest
    networks:
      - frontend
      - backend
      - astron-collection-network


  api:
    image: myapi:latest
    networks:
      frontend:
        aliases:
          - api
      astron-collection-network:
        aliases:
          - api
  redis:
    image: redis:alpine
    networks:
      astron-collection-network:
  db:
    image: myapi:latest
    networks:
      astron-collection-network:
        aliases:
          - apid

`;

test("It shouldn't add suffix to astron-collection-network in services multiples cases", () => {
	const composeData = parse(composeFile8) as ComposeSpecification;

	const suffix = generateRandomHash();

	if (!composeData?.services) {
		return;
	}
	const networks = addSuffixToServiceNetworks(composeData.services, suffix);
	const service = networks.web;
	const api = networks.api;
	const redis = networks.redis;
	const db = networks.db;

	const dbNetworks = db?.networks as {
		[key: string]: unknown;
	};

	const apiNetworks = api?.networks as {
		[key: string]: unknown;
	};

	expect(service).toBeDefined();
	expect(service?.networks).toContain("astron-collection-network");

	expect(redis?.networks).toHaveProperty("astron-collection-network");
	expect(dbNetworks["astron-collection-network"]).toBeDefined();
	expect(apiNetworks["astron-collection-network"]).toBeDefined();
});
