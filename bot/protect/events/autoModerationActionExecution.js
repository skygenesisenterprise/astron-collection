export const name = "autoModerationActionExecution";

export async function execute(execution, { services, logger }) {
  try {
    await services.security.onAutomodExecution(execution);
  } catch (error) {
    logger.error("automod execution handling failed", { err: error });
  }
}
