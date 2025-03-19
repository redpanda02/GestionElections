const cluster = require('cluster');
const os = require('os');
const logger = require('./config/logger');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  
  logger.info(`Master ${process.pid} is running`);
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  require('./server');
  logger.info(`Worker ${process.pid} started`);
} 