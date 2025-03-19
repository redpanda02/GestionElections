const fs = require('fs');
const path = require('path');
const swaggerJsdoc = require('../src/config/swagger');

const outputPath = path.resolve(__dirname, '../docs/api-spec.json');

fs.writeFileSync(outputPath, JSON.stringify(swaggerJsdoc, null, 2));
console.log(`Documentation API générée dans ${outputPath}`); 