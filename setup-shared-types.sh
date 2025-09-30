#!/bin/bash

# Script to build and link the shared-types package

# Navigate to the shared-types directory
cd "$(dirname "$0")/workspaces/shared-types"

# Install dependencies
npm install

# Build the package
npm run build

# Create a symlink in the global node_modules
npm link

# Navigate to each micro frontend and link to the shared-types package
cd ../application-shell
npm link @angular-microfrontends-poc/shared-types

cd ../feature-one-app
npm link @angular-microfrontends-poc/shared-types

cd ../feature-two-app
npm link @angular-microfrontends-poc/shared-types

echo "Successfully linked shared-types package to all micro frontends"