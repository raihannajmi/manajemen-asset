FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Using npm install instead of pnpm since the project uses npm globally in the backend 
# (though user was running pnpm in frontend previously, we will use npm for standard docker flow 
# or install pnpm if needed). Let's use npm to be safe.
RUN npm install

# Copy source code
COPY . .

# Expose Vite default port
EXPOSE 5173

# Start dev server on all interfaces
CMD ["npm", "run", "dev", "--", "--host"]
