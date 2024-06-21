"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTappletToRegistry = void 0;
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const codeowners_1 = require("./codeowners/codeowners");
const findManifestFiles = (dir) => {
    const manifestFiles = [];
    fs.readdirSync(dir).forEach(file => {
        const filePath = path_1.default.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            manifestFiles.push(...findManifestFiles(filePath));
        }
        else if (file.endsWith('tapplet.manifest.json')) {
            manifestFiles.push(filePath);
        }
    });
    return manifestFiles;
};
function addTappletToRegistry() {
    const registryManifestPath = 'registry.manifest.json';
    // Create an empty registry.manifest.json file if it doesn't exist
    if (!fs.existsSync(registryManifestPath)) {
        fs.writeFileSync(registryManifestPath, '{}');
    }
    // Initialize the registry.json file with the base structure
    let registryManifest = JSON.parse(fs.readFileSync(registryManifestPath, 'utf8'));
    if (!registryManifest.manifestVersion) {
        registryManifest.manifestVersion = '1.0.0';
        registryManifest.registeredTapplets = {};
        fs.writeFileSync(registryManifestPath, JSON.stringify(registryManifest, null, 2));
    }
    else {
        // Increment the manifestVersion number
        let [major, minor, patch] = registryManifest.manifestVersion
            .split('.')
            .map(Number);
        patch++;
        registryManifest.manifestVersion = `${major}.${minor}.${patch}`;
        fs.writeFileSync(registryManifestPath, JSON.stringify(registryManifest, null, 2));
    }
    // Search for all manifest.json files and extract fields
    const tappPath = path_1.default.join('.');
    const tappletManifestFiles = findManifestFiles(tappPath);
    console.log(tappPath);
    console.log(tappletManifestFiles);
    for (const file of tappletManifestFiles) {
        console.log(file);
        const tappletManifest = JSON.parse(fs.readFileSync(file, 'utf8'));
        const packageName = tappletManifest.packageName;
        const displayName = tappletManifest.displayName;
        const authorName = tappletManifest.author.name;
        const authorWebsite = tappletManifest.author.website;
        const codeowners = tappletManifest.repository.codeowners[0];
        const category = tappletManifest.category;
        const logoPath = tappletManifest.design.logoPath;
        const version = tappletManifest.version;
        const integrity = tappletManifest.source.location.npm.integrity;
        const registryUrl = tappletManifest.source.location.npm.distTarball;
        // Check if the packageName already exists in the registry.manifest.json file
        if (registryManifest.registeredTapplets[packageName]) {
            // If it exists, add the new version
            registryManifest.registeredTapplets[packageName].versions[version] = {
                integrity,
                registryUrl
            };
        }
        else {
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
            };
        }
        (0, codeowners_1.addAndFormatCodeowners)(packageName, [codeowners]);
    }
    fs.writeFileSync(registryManifestPath, JSON.stringify(registryManifest, null, 2));
    return tappletManifestFiles.length;
}
exports.addTappletToRegistry = addTappletToRegistry;
//# sourceMappingURL=register.js.map