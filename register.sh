#!/bin/bash

# Create an empty registry.json file
> registry.json

# Initialize the registry.json file with the base structure
echo '{"manifestVersion": "1.0.0", "registeredTapplets": {}}' > registry.json

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

  # Check if the packageName already exists in the registry.json file
  if jq -e ".registeredTapplets.\"$packageName\"" registry.json > /dev/null; then
    # If it exists, add the new version
    temp_json=$(jq ".registeredTapplets.\"$packageName\".versions += {\"$version\": {\"integrity\": \"$integrity\", \"registryUrl\": \"$registryUrl\"}}" registry.json)
  else
    # If it doesn't exist, add the new tapplet
    temp_json=$(jq ".registeredTapplets += {\"$packageName\": {\"id\": \"$packageName\", \"metadata\": {\"displayName\": \"$displayName\", \"author\": {\"name\": \"$authorName\", \"website\": \"$authorWebsite\"}, \"codeowners\": [\"$codeowners\"], \"audits\": [], \"category\": \"$category\", \"logoPath\": \"$logoPath\"}, \"versions\": {\"$version\": {\"integrity\": \"$integrity\", \"registryUrl\": \"$registryUrl\"}}}}" registry.json)
  fi

  echo "$temp_json" > registry.json
done