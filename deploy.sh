#!/bin/bash
# Custom Kudu deployment script

# Navigate to the wwwroot folder
cd /home/site/wwwroot

# Install npm packages
echo "Installing npm packages..."
npm install

# Build the app if you have a build step
echo "Building the app..."
npm run build
