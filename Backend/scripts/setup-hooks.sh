#!/bin/bash

# Installation de husky
npm install husky --save-dev

# Activation des hooks
npx husky install

# Ajout du hook pre-commit
npx husky add .husky/pre-commit "npm run lint && npm test"

# Ajout du hook pre-push
npx husky add .husky/pre-push "npm run test:coverage" 