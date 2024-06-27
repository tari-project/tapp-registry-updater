#!/bin/bash

# Create the dist folder if it doesn't exist
if [ ! -d dist ]; then
  mkdir dist
fi

# Create an empty registry.manifest.json file in the dist folder if it doesn't exist
if [ ! -f dist/registry.manifest.json ]; then
  > dist/registry.manifest.json
fi

# Initialize the registry.json file with the base structure
manifest_version=$(jq -r '.manifestVersion' dist/registry.manifest.json)
if [ -z "$manifest_version" ]; then
  manifest_version="1.0.0"
  echo '{"manifestVersion": "'$manifest_version'", "registeredTapplets": {}}' > dist/registry.manifest.json
else 
  # Increment the manifestVersion number
  IFS='.' read -r major minor patch <<< "$manifest_version"
  patch=$((patch+1))
  manifest_version="$major.$minor.$patch"
  jq ".manifestVersion = \"$manifest_version\"" dist/registry.manifest.json > dist/temp.json && mv dist/temp.json dist/registry.manifest.json
fi


# Search for all manifest.json files and extract fields
for file in $(find . -type f -name tapplet.manifest.json); do
  packageName=$(jq -r '.packageName' "$file")
  displayName=$(jq -r '.displayName' "$file")
  authorName=$(jq -r '.author.name' "$file")
  authorWebsite=$(jq -r '.author.website' "$file")
  codeowners=$(jq -r '.repository.codeowners[]' "$file")
  category=$(jq -r '.category' "$file")
  logoPath=$(jq -r '.design.logoPath' "$file")
  version=$(jq -r '.version' "$file")
  integrity=$(jq -r '.source.location.npm.integrity' "$file")
  registryUrl=$(jq -r '.source.location.npm.distTarball' "$file")

  # Check if the packageName already exists in the registry.manifest.json file
  if jq -e ".registeredTapplets.\"$packageName\"" dist/registry.manifest.json > /dev/null; then
    # If it exists, add the new version
    temp_json=$(jq ".registeredTapplets.\"$packageName\".versions += {\"$version\": {\"integrity\": \"$integrity\", \"registryUrl\": \"$registryUrl\"}}" dist/registry.manifest.json)
  else
    # If it doesn't exist, add the new tapplet
    temp_json=$(jq ".registeredTapplets += {\"$packageName\": {\"id\": \"$packageName\", \"metadata\": {\"displayName\": \"$displayName\", \"author\": {\"name\": \"$authorName\", \"website\": \"$authorWebsite\"}, \"codeowners\": [\"$codeowners\"], \"audits\": [], \"category\": \"$category\", \"logoPath\": \"$logoPath\"}, \"versions\": {\"$version\": {\"integrity\": \"$integrity\", \"registryUrl\": \"$registryUrl\"}}}}" dist/registry.manifest.json)
  fi

  echo "$temp_json" > dist/registry.manifest.json
done