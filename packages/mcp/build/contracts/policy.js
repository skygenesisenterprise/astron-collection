export function allow(risk, reason) {
    return { allowed: true, code: "policy_denied", reason, risk, requiresApproval: false };
}
export function deny(code, reason, risk, requiresApproval = false) {
    return { allowed: false, code, reason, risk, requiresApproval };
}
