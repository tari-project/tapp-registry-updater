import * as fs from 'fs'
import path from 'path'
import { addAndFormatCodeowners } from './codeowners/codeowners'
import {
  RegistryManifest,
  RegistryUpdaterOutputs,
  TappletManifest
} from './types/registry'

const TAPPLETS_REGISTRY_MANIFEST_FILE = 'tapplets-registry.manifest.json'

const findManifestFiles = (dir: string): string[] => {
  const manifestFiles: string[] = []

  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      manifestFiles.push(...findManifestFiles(filePath))
    } else if (file.endsWith('tapplet.manifest.json')) {
      manifestFiles.push(filePath)
    }
  })

  return manifestFiles
}
export function addTappletToRegistry(): RegistryUpdaterOutputs {
  const registryManifestPath = path.join(
    'dist',
    TAPPLETS_REGISTRY_MANIFEST_FILE
  )

  // Create an empty registry.manifest.json file if it doesn't exist
  if (!fs.existsSync(registryManifestPath)) {
    fs.writeFileSync(registryManifestPath, '{}')
  }

  // Initialize the registry.json file with the base structure
  const registryManifest: RegistryManifest = JSON.parse(
    fs.readFileSync(registryManifestPath, 'utf8')
  )

  let registryManifestVer = '1.0.0'
  if (!registryManifest.manifestVersion) {
    registryManifest.registeredTapplets = {}
  } else {
    // Increment the manifestVersion number
    let [major, minor, patch] = registryManifest.manifestVersion
      .split('.')
      .map(Number)
    patch++
    registryManifestVer = `${major}.${minor}.${patch}`
  }

  registryManifest.manifestVersion = registryManifestVer
  fs.writeFileSync(
    registryManifestPath,
    JSON.stringify(registryManifest, null, 2)
  )

  // Search for all manifest.json files and extract fields
  const tappPath = path.join('.')
  const tappletManifestFiles = findManifestFiles(tappPath)

  for (const file of tappletManifestFiles) {
    console.log(file)
    const tappletManifest: TappletManifest = JSON.parse(
      fs.readFileSync(file, 'utf8')
    )
    const packageName = tappletManifest.packageName
    const displayName = tappletManifest.displayName
    const author = tappletManifest.author
    const about = tappletManifest.about
    const audits = tappletManifest.audits
    const codeowners = tappletManifest.repository.codeowners
    const category = tappletManifest.category
    const logoUrl = tappletManifest.design.logoPath
    const backgroundUrl = tappletManifest.design.backgroundPath
    const version = tappletManifest.version
    const integrity = tappletManifest.source.location.npm.integrity
    const registryUrl = tappletManifest.source.location.npm.distTarball

    // Check if the packageName already exists in the registry.manifest.json file
    if (registryManifest.registeredTapplets[packageName]) {
      // If it exists, add the new version
      registryManifest.registeredTapplets[packageName].versions[version] = {
        integrity,
        registryUrl
      }
    } else {
      // If it doesn't exist, add the new tapplet
      registryManifest.registeredTapplets[packageName] = {
        id: packageName,
        metadata: {
          displayName,
          logoUrl,
          backgroundUrl,
          author,
          about,
          codeowners,
          audits,
          category
        },
        versions: {
          [version]: {
            integrity,
            registryUrl
          }
        }
      }
    }

    // Add codeowners
    addAndFormatCodeowners(packageName, codeowners)
  }

  fs.writeFileSync(
    registryManifestPath,
    JSON.stringify(registryManifest, null, 2)
  )

  return {
    registeretTappsNr: tappletManifestFiles.length,
    registryManifestVer
  }
}
