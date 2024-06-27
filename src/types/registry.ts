interface Author {
  name: string
  website: string
}

interface About {
  summary: string
  description: string
}

interface Audits {
  auditor: string
  report: string
}
interface Design {
  logoPath: string
  backgroundPath: string
}

interface Repository {
  type: string
  url: string
  codeowners: string[]
}

interface SourceLocationNpm {
  npm: {
    packageName: string
    registry: string
    distTarball: string
    integrity: string
  }
}

interface Source {
  location: SourceLocationNpm
}

export interface TappletManifest {
  packageName: string
  version: string
  displayName: string
  status: string
  category: string
  author: Author
  about: About
  audits: Audits[]
  design: Design
  repository: Repository
  source: Source
  manifestVersion: string
}

export interface RegistryManifest {
  manifestVersion: string
  registeredTapplets: {
    [packageName: string]: {
      id: string
      metadata: {
        displayName: string
        author: Author
        logoUrl: string
        backgroundUrl: string
        about: About
        codeowners: string[]
        audits: Audits[]
        category: string
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
