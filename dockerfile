# Use an official Node.js 18 runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Install git, and make sure the package lists are updated
RUN apt-get update && apt-get install -y git \
    && rm -rf /var/lib/apt/lists/*  # Clean up to reduce image size

# Ensure .ssh directory exists
RUN mkdir -p /root/.ssh

# Add the SSH key
COPY .docker/id_rsa /root/.ssh/id_rsa

# Set the correct permissions on the key and the .ssh directory
RUN chmod 600 /root/.ssh/id_rsa && chmod 700 /root/.ssh

# Make sure SSH host keys are set up
RUN ssh-keyscan github.com >> /root/.ssh/known_hosts

# Clone your repository using SSH
# RUN git clone -b dev --single-branch git@github.com:AnotherUniverseAU/backend.git .
RUN git clone git@github.com:AnotherUniverseAU/backend.git .

# Install dependencies
RUN npm install

# Build the project
RUN npm run build

# Define the command to run your app using CMD which defines your runtime
CMD ["npm", "run", "start:prod"]
