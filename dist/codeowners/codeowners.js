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
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAndFormatCodeowners = exports.writeToFile = exports.formatContents = exports.getFileContents = void 0;
/* eslint-disable no-process-env */
const util_1 = require("util");
const fs = __importStar(require("fs"));
const core = __importStar(require("@actions/core"));
const formatters_1 = require("./formatters");
function getFileContents(filePath, defaultFileDetectionLocations = [
    'CODEOWNERS',
    'docs/CODEOWNERS',
    '.github/CODEOWNERS'
]) {
    let locationsToCheck = defaultFileDetectionLocations;
    if (filePath && filePath.length > 0) {
        const thisPlatformPath = core.toPlatformPath(filePath);
        core.debug(`Using specified path: ${thisPlatformPath}`);
        locationsToCheck = [thisPlatformPath];
    }
    else {
        core.info('Did not find specified input path, using default detection method.');
    }
    const existingPaths = locationsToCheck.filter(path => {
        return fs.existsSync(path);
    });
    return existingPaths.map(path => {
        core.notice(`Found CODEOWNERS file at '${path}' to reformat.`);
        return {
            path,
            contents: fs.readFileSync(path, 'utf8')
        };
    });
}
exports.getFileContents = getFileContents;
function formatContents(fileContents, formatType = 'lined-up', removeEmptyLines = true) {
    core.debug(`Using format type: ${formatType}`);
    const formatter = (0, formatters_1.getAppropriateFormatter)(formatType);
    const lines = fileContents.contents.split('\n');
    const lineLengths = lines
        .filter(line => {
        return !line.startsWith('#') && line.length > 0;
    })
        .map(line => {
        const [path, ..._] = line.trim().split(/\s+/);
        return path.length;
    });
    const maxLineLength = Math.max(...lineLengths);
    let formattedLines = lines.map(line => {
        return formatter.formatLine(line, maxLineLength);
    });
    if (removeEmptyLines) {
        core.debug('Removing empty lines...');
        formattedLines = formattedLines.filter(line => line.length > 0);
    }
    let newFormattedContents = formattedLines.join('\n');
    if (!newFormattedContents.endsWith('\n')) {
        newFormattedContents += '\n';
    }
    return {
        path: fileContents.path,
        contents: newFormattedContents
    };
}
exports.formatContents = formatContents;
function writeToFile(fileContent, newFileName = 'CODEOWNERS') {
    const newFilePath = fileContent.path.includes('/')
        ? `${fileContent.path.substring(0, fileContent.path.lastIndexOf('/'))}/${newFileName}`
        : fileContent.path;
    fs.writeFileSync(newFilePath, fileContent.contents);
}
exports.writeToFile = writeToFile;
function addAndFormatCodeowners(packageName, codeowners) {
    console.log(packageName, codeowners);
    try {
        let currentCodeowners = getFileContents();
        if (currentCodeowners.length === 0) {
            const errorMsg = 'No CODEOWNERS file(s) found.';
            core.error(errorMsg);
            throw new Error(errorMsg);
        }
        const formattedCodeowners = currentCodeowners.map(fileContents => {
            if (codeowners.length > 0) {
                const packageDir = packageName.concat(packageName.endsWith('/') ? ' ' : '/ ');
                const codeownerFilePattern = packageDir.concat(codeowners.join(' '));
                if (fileContents.contents.includes(packageDir)) {
                    const replacedContent = fileContents.contents.replace(new RegExp(`^${packageDir}.*$`, 'gm'), codeownerFilePattern);
                    fileContents.contents = replacedContent;
                }
                else {
                    fileContents.contents =
                        fileContents.contents.concat(codeownerFilePattern);
                }
            }
            return formatContents(fileContents);
        });
        const changedFiles = [];
        // TODO double check if any difference
        currentCodeowners = getFileContents();
        formattedCodeowners.forEach((fileContents, index) => {
            if (currentCodeowners[index].contents !== fileContents.contents) {
                core.notice(`Changed detected for '${fileContents.path}'.`);
                changedFiles.push(fileContents.path);
                writeToFile(fileContents, 'CODEOWNERS');
            }
            else {
                core.notice(`No changes detected for '${fileContents.path}'`);
            }
        });
        if (changedFiles.length > 0) {
            core.notice(`Made changes to the following files: ${changedFiles}`);
        }
        else {
            core.notice('No changes were made to any files.');
        }
    }
    catch (error) {
        core.debug((0, util_1.inspect)(error));
        core.setOutput('success', false);
        core.setFailed(error.message);
    }
}
exports.addAndFormatCodeowners = addAndFormatCodeowners;
//# sourceMappingURL=codeowners.js.map