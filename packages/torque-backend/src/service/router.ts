/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { createTorqueClient } from '@qtorque/backstage-plugin-torque-common';

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;
  const token = config.getString('torque.token');
  const torqueUrl = config.getString('torque.serverUrl');
  
  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.send({ status: 'ok' });
  });

  router.get('/environments', async (request, response) => {
    let { space, environment_name } = request.query as { space: string, environment_name: string};

    // Mandatory headers and http status to keep connection open
    response.writeHead(200, {
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
    });

    const client = createTorqueClient( token, torqueUrl );

    let timeout: NodeJS.Timeout;

    let prevData = '';


    function fetchEnvs(interval: number) {
      async function update() {
        const result = await client.getEnvironments(space, environment_name);
        // const result = await fetchAppInfo({ client }, appId);
        const data = JSON.stringify(result);
        if (prevData !== data) {
          response.write(`event: update-success\ndata: ${data}\n\n`);
          flush(response);
          prevData = data;
        }
      };

      update()
        .then(() => {
          timeout = setTimeout(() => fetchEnvs(interval), interval);
        })
        .catch((e) => {
          response.write(`event: update-failure\ndata: ${e.message}\n\n`);
          flush(response);
          logger.error(`Error encountered trying to update environment`);
          response.end();
        })
    }
    request.on('close', () => clearTimeout(timeout));
    fetchEnvs(10000);
  });
  router.use(errorHandler());
  return router;
}

function flush(response: express.Response) {
  const flushable = response as unknown as { flush: Function };
  if (typeof flushable.flush === 'function') {
    flushable.flush();
  }
}
