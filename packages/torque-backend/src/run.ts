import { getRootLogger } from '@backstage/backend-common';
import yn from 'yn';
import { startStandaloneServer } from './service/standaloneServer';
import { loadBackendConfig } from '@backstage/backend-common';


const port = process.env.PLUGIN_PORT ? Number(process.env.PLUGIN_PORT) : 7007;
const enableCors = yn(process.env.PLUGIN_CORS, { default: false });
const logger = getRootLogger();

loadBackendConfig({
  argv: process.argv,
  logger,
}).then((config) => {
  return startStandaloneServer({ port, enableCors, logger, config });
})
  .catch(err => {
    logger.error(err);
    process.exit(1);
  });

process.on('SIGINT', () => {
  logger.info('CTRL+C pressed; exiting.');
  process.exit(0);
});
