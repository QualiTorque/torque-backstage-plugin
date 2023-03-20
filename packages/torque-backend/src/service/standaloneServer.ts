import { createServiceBuilder } from '@backstage/backend-common';
import { Server } from 'http';
import { Logger } from 'winston';
import { Config } from '@backstage/config';
import { createRouter } from './router';

export interface ServerOptions {
  port: number;
  enableCors: boolean;
  logger: Logger;
  config: Config;
}

export async function startStandaloneServer(
  options: ServerOptions,
): Promise<Server> {
  const logger = options.logger.child({ service: 'torque-backend-backend' });
  logger.debug('Starting application server...');
  const router = await createRouter({
    config: options.config,
    logger,
  });

  let service = createServiceBuilder(module)
    .setPort(options.port)
    .addRouter('/torque', router);
  if (options.enableCors) {
    console.log();
    // service = service.enableCors({ origin: 'http://localhost:3000' });
  }

  return await service.start().catch(err => {
    logger.error(err);
    process.exit(1);
  });
}

module.hot?.accept();
