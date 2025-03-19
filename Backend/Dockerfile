# Image de base
FROM node:18-alpine

# Création du répertoire de l'application
WORKDIR /usr/src/app

# Installation des dépendances globales
RUN apk add --no-cache python3 make g++

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm ci --only=production

# Copie des fichiers sources
COPY . .

# Création des dossiers nécessaires
RUN mkdir -p logs uploads

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Exposition du port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"] 