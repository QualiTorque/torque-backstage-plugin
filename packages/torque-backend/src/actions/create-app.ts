import { createTemplateAction } from '@backstage/plugin-scaffolder-backend';
import { createTorqueClient } from '@qtorque/backstage-plugin-torque-common';

interface TorqueCreateApp {
  token: string;
  serverUrl: string | undefined;
  executionHost: string;
  ghAccessToken: string;
}

export function createTorqueApp({ token, serverUrl, executionHost, ghAccessToken="" }: TorqueCreateApp) {
  return createTemplateAction<{
    serviceName: string,
    assetRepo: string,
    blueprintRepo: string,
    serviceAccount: string,
    namespace: string,
    blueprintName: string
    repoType: string
  }>({
    id: 'torque:create-app',
    schema: {
      input: {
        required: ['serviceName', 'assetRepo', 'blueprintRepo', 'namespace', 'blueprintName'],
        type: 'object',
        properties: {
          serviceName: {
            type: 'string',
            title: 'Service Name',
            description: 'The name of service that will be created in Torque'
          },
          assetRepo: {
            type: 'string',
            title: 'Assets Repo Url', 
            description: "The asset repo that will be connected to Torque"
          },
          blueprintRepo: {
            type: 'string',
            title: 'Blueprint Repo Url',
            description: "The blueprints repo that will be connected to Torque"
          },
          namespace: {
            type: 'string',
            title: 'Namespace',
            description: "The namespace of the environment runner"
          },
          blueprintName: {
            type: 'string',
            title: 'Blueprint Name',
            description: "The name of a blueprint you that will be a source for sandbox environment"
          },
          serviceAccount: {
            type: 'string'
          },
          repoType: {
            type: 'string'
          }
        },
      }
    },
    async handler({ logger, input }) {
      const client = createTorqueClient( token, serverUrl );
      try {
        logger.info(`Creating space with name '${input.serviceName}'`);
        await client.createSpace({name: input.serviceName});
        logger.info(`Associating k8s execution host '${executionHost}' to space '${input.serviceName}'`);
        await client.associateK8sExecutionHost(input.serviceName, executionHost, {default_service_account: input.serviceAccount, default_namespace: input.namespace});
        
        // TODO: refactor
        if (input.repoType == "bitbucketServer") {
          logger.info(`Connecting assets repo '${input.assetRepo}' to the space '${input.serviceName}' `);
          await client.connectBitBucketRepo(
            input.serviceName,
            {
              repository_url: input.assetRepo,
              repository_name: input.serviceName,
              type: 'asset'
            }
          );

          logger.info(`Connecting blueprint repo '${input.blueprintRepo}' to space '${input.serviceName}'`);
          await client.connectBitBucketRepo(
            input.serviceName,
            {
              repository_url: input.assetRepo,
              repository_name: 'blueprints',
              type: 'sandbox'
            }
          );
        }
        else if (input.repoType == "github")  {
          logger.info(`Connecting assets repo '${input.assetRepo}' to the space '${input.serviceName}' `);
          await client.connectRepo(
            input.serviceName,
            {
              repository_url: input.assetRepo,
              access_token: ghAccessToken,
              repository_name: input.serviceName,
              repository_type: 'github',
              type: 'asset'
            }
          );

          logger.info(`Connecting blueprint repo '${input.blueprintRepo}' to space '${input.serviceName}'`);
          await client.connectRepo(
            input.serviceName,
            {
              repository_url: input.blueprintRepo,
              access_token: ghAccessToken,
              repository_name: 'blueprints',
              repository_type: 'github',
              type: 'sandbox'
            }
          );
        }
        else {
          var msg = `Unknown repo type '${input.repoType}'`;
          logger.error(msg);
          throw(msg);
        }
        
      } catch(e) {
        logger.error(e);
        throw e;
      }
      
      logger.info(`Publishing blueprint '${input.blueprintName}' to the Torque catalog`);
      for (let i = 0; i < 5; i++) {
        try {
          await client.publishBlueprint(
            input.serviceName,
            {
              blueprint_name: input.blueprintName,
              is_editable: false
            }
          );
        } catch(e) {
          logger.warn(`Unable to publish the blueprint due to error: ${e}. Waiting for a blueprint to appear in the repo`);
          if (i == 4)
            throw e;
          else
            await new Promise(f => setTimeout(f, 15000));
        }
      }

      logger.info(`Starting sandbox environment`);
      try {
        await client.startEnvironment(input.serviceName, {blueprint_name: input.blueprintName, sandbox_name: input.serviceName});
      }
      catch (e) {
        if (e instanceof Error) {
          logger.warn(`The sandbox ${input.serviceName} hasn't been started. Reason: ${e.message}`);
        } else {
          logger.warn(`The sandbox ${input.serviceName} hasn't been started. Reason: ${e}`);
        }
      }
    }
  });
}
