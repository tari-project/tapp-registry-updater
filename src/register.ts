import * as fs from 'fs'
import path from 'path'
import { addAndFormatCodeowners } from './codeowners/codeowners'

interface TappletManifest {
  packageName: string
  displayName: string
  author: {
    name: string
    website: string
  }
  repository: {
    codeowners: string[]
  }
  category: string
  design: {
    logoPath: string
  }
  version: string
  source: {
    location: {
      npm: {
        integrity: string
        distTarball: string
      }
    }
  }
}

interface RegistryManifest {
  manifestVersion: string
  registeredTapplets: {
    [packageName: string]: {
      id: string
      metadata: {
        displayName: string
        author: {
          name: string
          website: string
        }
        codeowners: string[]
        audits: string[]
        category: string
        logoPath: string
      }
      versions: {
        [version: string]: {
          integrity: string
          registryUrl: string
        }
      }
    }
  }
}

interface RegistryUpdaterOutputs {
  registeretTappsNr: number
  registryManifestVer: string
}

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
  const registryManifestPath = 'registry.manifest.json'

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
  console.log(tappPath)
  console.log(tappletManifestFiles)
  for (const file of tappletManifestFiles) {
    console.log(file)
    const tappletManifest: TappletManifest = JSON.parse(
      fs.readFileSync(file, 'utf8')
    )
    const packageName = tappletManifest.packageName
    const displayName = tappletManifest.displayName
    const authorName = tappletManifest.author.name
    const authorWebsite = tappletManifest.author.website
    const codeowners = tappletManifest.repository.codeowners[0]
    const category = tappletManifest.category
    const logoPath = tappletManifest.design.logoPath
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
          author: {
            name: authorName,
            website: authorWebsite
          },
          codeowners: [codeowners],
          audits: [],
          category,
          logoPath
        },
        versions: {
          [version]: {
            integrity,
            registryUrl
          }
        }
      }
    }
    addAndFormatCodeowners(packageName, [codeowners])
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
