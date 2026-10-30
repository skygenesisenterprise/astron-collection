export function toOperationView(operation) {
    return {
        id: operation.id,
        capability: operation.capability,
        status: operation.status,
        createdAt: operation.createdAt,
        updatedAt: operation.updatedAt,
        ...(operation.completedAt ? { completedAt: operation.completedAt } : {}),
        resourceIds: operation.resourceIds,
        ...(operation.data !== undefined ? { data: operation.data } : {}),
        ...(operation.error ? { error: operation.error } : {}),
        ...(operation.verification ? { verification: operation.verification } : {}),
    };
}
