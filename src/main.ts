import * as core from "@actions/core";

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Add new tapplet to the registry
    // await addTappletToRegistry(tappletCandidate)
    // core.notice(`The ${tappletCandidate.displayName} tapplet added to registry`)

    // Set outputs for other workflow steps to use
    core.setOutput("status", true);
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
