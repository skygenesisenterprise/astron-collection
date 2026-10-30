import { ApiError } from "../adapters/notployApi.js";
export function asRecord(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value))
        return undefined;
    return value;
}
export function asArray(value) {
    return Array.isArray(value) ? value : [];
}
export function getString(record, key) {
    const value = record?.[key];
    return typeof value === "string" ? value : undefined;
}
export function getBoolean(record, key) {
    const value = record?.[key];
    return typeof value === "boolean" ? value : undefined;
}
export function getArray(record, key) {
    return asArray(record?.[key]);
}
export function truncateText(value, max = 500) {
    if (!value)
        return null;
    return value.length <= max ? value : `${value.slice(0, max)}…`;
}
export function nowIso() {
    return new Date().toISOString();
}
export function summarizeDeployment(record) {
    return {
        deploymentId: getString(record, "deploymentId") ?? null,
        title: getString(record, "title") ?? null,
        status: (getString(record, "status") ?? "unknown").toLowerCase(),
        createdAt: getString(record, "createdAt") ?? null,
        startedAt: getString(record, "startedAt") ?? null,
        finishedAt: getString(record, "finishedAt") ?? null,
        errorMessage: truncateText(getString(record, "errorMessage")),
        isPreview: getBoolean(record, "isPreviewDeployment") ?? false,
    };
}
export function isTerminalDeployment(status) {
    return status === "done" || status === "error" || status === "cancelled";
}
export function deploymentTimestamp(summary) {
    const raw = summary.createdAt ?? summary.startedAt;
    const parsed = raw ? Date.parse(raw) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : 0;
}
export function compareDeploymentsNewestFirst(a, b) {
    return deploymentTimestamp(summarizeDeployment(b)) - deploymentTimestamp(summarizeDeployment(a));
}
export async function fetchApplication(context, applicationId) {
    const data = await context.api.request({
        method: "GET",
        path: "/application.one",
        params: { applicationId },
        idempotent: true,
        signal: context.signal,
    });
    const application = asRecord(data);
    if (!application) {
        throw new ApiError({
            code: "api_error",
            message: "The Notploy API returned an unexpected application payload",
        });
    }
    return application;
}
export async function fetchDeployments(context, applicationId) {
    const data = await context.api.request({
        method: "GET",
        path: "/deployment.all",
        params: { applicationId },
        idempotent: true,
        signal: context.signal,
    });
    return asArray(data)
        .map(asRecord)
        .filter((record) => record !== undefined)
        .sort(compareDeploymentsNewestFirst);
}
export function findDeployment(deployments, deploymentId) {
    if (!deploymentId)
        return deployments[0];
    return (deployments.find((record) => getString(record, "deploymentId") === deploymentId) ?? undefined);
}
/** Collapses volatile identifiers so failures can be grouped. */
export function errorSignature(message) {
    if (!message)
        return "unknown";
    return (message.split("\n")[0] ?? message)
        .toLowerCase()
        .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, "<uuid>")
        .replace(/\b[0-9a-f]{12,}\b/g, "<hash>")
        .replace(/\b\d+(\.\d+)?\b/g, "<n>")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160);
}
export function projectApplicationSummary(application) {
    const environment = asRecord(application.environment);
    const project = environment ? asRecord(environment.project) : undefined;
    return {
        applicationId: getString(application, "applicationId") ?? null,
        appName: getString(application, "appName") ?? null,
        name: getString(application, "name") ?? null,
        applicationStatus: getString(application, "applicationStatus") ?? null,
        sourceType: getString(application, "sourceType") ?? null,
        buildType: getString(application, "buildType") ?? null,
        serverId: getString(application, "serverId") ?? null,
        environmentId: getString(environment, "environmentId") ?? null,
        environmentName: getString(environment, "name") ?? null,
        projectId: getString(project, "projectId") ?? null,
        projectName: getString(project, "name") ?? null,
        domainCount: getArray(application, "domains").length,
    };
}
