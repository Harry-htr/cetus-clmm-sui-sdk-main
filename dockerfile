# Start from a base Node image
FROM node:20.1.0

# Set the working directory in the Docker container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the npm dependencies in the Docker container
RUN npm cache clean --force
RUN npm install

# Copy the rest of your app's source code to the working directory
COPY . .

# Expose port (Replace "your_port" with the port that your app listens on)
EXPOSE 3000

# Start your app
CMD [ "node", "tests/dist/tests/app.js" ]
