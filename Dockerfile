# Étape 1 : Build
FROM node:20-alpine AS build

WORKDIR /app

# Variables pour éviter les erreurs ESLint et CI
ENV DISABLE_ESLINT_PLUGIN=true
ENV CI=false

COPY package*.json ./
RUN npm install

COPY . .
# RUN npm run build

# On expose le port par défaut de Vite (5173) ou CRA (3000)
EXPOSE 5173

# On lance le serveur de dev
# --host est indispensable pour que Docker puisse rediriger le trafic
CMD ["npm", "run", "dev", "--", "--host"]