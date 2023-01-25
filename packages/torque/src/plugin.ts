import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const torquePlugin = createPlugin({
  id: 'torque',
  routes: {
    root: rootRouteRef,
  },
});

export const TorquePage = torquePlugin.provide(
  createRoutableExtension({
    name: 'TorquePage',
    component: () =>
      import('./components/MainComponent').then(m => m.MainComponent),
    mountPoint: rootRouteRef,
  }),
);
