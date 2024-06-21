import * as core from '@actions/core'
import { addTappletToRegistry } from './register'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Add new tapplet to the registry
    const outputs = addTappletToRegistry()
    core.notice(
      `Registry updated to version ${outputs.registryManifestVer}: ${outputs.registeretTappsNr} tapplet(s) have been registered.`
    )

    // Set outputs for other workflow steps to use
    core.setOutput('registry-version', outputs.registryManifestVer)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
