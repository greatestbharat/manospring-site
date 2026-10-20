import app from './app.js';
import { config } from './config/env.js';

const server = app.listen(config.port, config.host, () => {
  console.log(`🌿 Manospring Healthcare Platform listening on http://${config.host}:${config.port}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  console.log(`🤖 Groq AI: ${config.groqApiKey ? 'configured' : 'not configured'}`);
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
