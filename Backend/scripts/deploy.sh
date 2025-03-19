#!/bin/bash

# Vérifier si on est en production
if [ "$NODE_ENV" != "production" ]; then
    echo "Ce script doit être exécuté en production"
    exit 1
fi

# Arrêter les conteneurs existants
docker-compose -f docker-compose.prod.yml down

# Construire les nouvelles images
docker-compose -f docker-compose.prod.yml build

# Démarrer les services
docker-compose -f docker-compose.prod.yml up -d

# Exécuter les migrations
docker-compose -f docker-compose.prod.yml exec api npm run db:migrate

# Vérifier l'état des services
docker-compose -f docker-compose.prod.yml ps

echo "Déploiement terminé avec succès!" 