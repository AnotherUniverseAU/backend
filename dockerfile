# Use an official Node.js 18 runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Clone your NestJS project from Git
RUN git clone https://github.com/newxxson/BE_AU.git .

# Install dependencies
RUN npm install

# Build the project
RUN npm run build

# Define the command to run your app using CMD which defines your runtime
CMD ["npm", "run", "start:prod"]
