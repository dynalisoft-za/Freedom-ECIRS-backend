import { buildApp } from './app';
import { config } from './config/env';
import { testConnection } from './config/database';

async function start() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Build and start the app
    const app = await buildApp();

    await app.listen({
      port: config.port,
      host: config.host,
    });

    console.log(`\n🚀 Freedom ECIRS Backend running on:`);
    console.log(`   - Local:   http://localhost:${config.port}`);
    console.log(`   - Network: http://${config.host}:${config.port}`);
    console.log(`   - API:     http://localhost:${config.port}${config.apiPrefix}`);
    console.log(`   - Docs:    http://localhost:${config.port}/docs\n`);

    // Graceful shutdown
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        console.log(`\n${signal} received, closing server gracefully...`);
        await app.close();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

start();
