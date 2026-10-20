import app from './app.js';
import { config } from './config/env.js';

const server = app.listen(config.port, () => {
  console.log(`🌿 Manospring Healthcare Platform listening on http://localhost:${config.port}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server gracefully.');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Closing HTTP server gracefully.');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
