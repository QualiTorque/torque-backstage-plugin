# @qtorque/backstage-plugin-torque-backend

`@qtorque/backstage-plugin-torque-backend` is a plugin for the Backstage backend app. It provides a route that `@qtorque/backstage-plugin-torque` is using to communicate with Torque API and scaffolder action to create a service and all needed infrastruction with Torque.

## Installation

1. Install `@qtorque/backstage-plugin-torque-backend` plugin with,

```bash
yarn workspace backend add @qtorque/backstage-plugin-torque-backend
```

2. Create `./packages/backend/src/plugins/torque.ts` with the following content,

```ts
import { createRouter } from '@qtorque/backstage-plugin-torque-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
  });
}
```

3. Add `torque` api route to `./packages/backend/src/index.ts`.

```diff
import humanitec from './plugins/humanitec';
+ import torque from './plugins/torque';

const searchEnv = useHotMemoize(module, () => createEnv('search'));
+ const torqueEnv = useHotMemoize(module, () => createEnv('torque'));

const apiRouter = Router();
apiRouter.use('/catalog', await catalog(catalogEnv));
+ apiRouter.use('/torque', await torque(torqueEnv));
```

4. Add configuration to `app-config.yaml`

```yaml
torque:
  token: ${TORQUE_TOKEN} # without Bearer
  executionHost: ${TORQUE_AGENT_NAME} # the name of agent registered in Torque
  serverUrl: ${TORQUE_URL} # default is https://portal.qtorque.io
  ghAccessToken: ${GITHUB_TOKEN} # github token
```

## Scaffolder Actions

This plugin provides the following scaffolder actions:

### create-app

`create-app` will prepare an infrastructure in Torque and create an environment for service. 

#### Installation

To make this action available, you can add it to your scaffolder plugin configuration in `./packages/backend/src/plugins/scaffolder.ts`

```diff
# import createTorqueApp action
+ import { createTorqueApp } from "@qtorque/backstage-plugin-torque-backend";

# register the action
  const actions = [
    ...builtInActions,
    createTorqueApp({
+      token: config.getString('torque.token'),
+      executionHost: config.getString('torque.executionHost'),
+      ghAccessToken: config.getString('torque.ghAccessToken'),
+      serverUrl: config.getOptionalString('torque.serverUrl')
    })
  ];
```

### Usage

Add the action to your template,

```yaml
    - name: Deploy with Torque
      id: torque-app-id
      action: torque:create-app
      input:
        serviceName: ${{ parameters.componentName }} # The name of service that will be created in Torque. 
        # Will be used as space, assets repo, blueprint repo and grain names
        assetRepo: ${{ steps.publish.output.remoteUrl }} # The asset repo that will be connected to Torque
        blueprintRepo: ${{ steps.publish.output.remoteUrl }} # The blueprints repo that will be connected to Torque
        serviceAccount: 'default' # A k8s service account to assign to agent
        namespace: default # A k8s namespace to assign to agent
        blueprintName: ${{ parameters.componentName }} # The name of a blueprint you that will be a source for sandbox environment
```
