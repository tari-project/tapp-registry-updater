export interface TappletManifest {
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

export interface RegistryManifest {
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

export interface RegistryUpdaterOutputs {
  registeretTappsNr: number
  registryManifestVer: string
}
