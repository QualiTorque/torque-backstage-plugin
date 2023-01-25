# @qtorque/backstage-torque-plugin

Welcome to the torque plugin!

It is a plugin for the Backstage application that shows infrasture details created in Torque

## Requirements

This plugin requires `@qtorque/backstage-plugin-torque-backend` because it connects to the backend to make requests to the Torque API.

## Installation

First, install the plugin to your backstage app:

```bash
yarn workspace app add @qtorque/backstage-torque-plugin
```

Then in your Entity Page (`./packages/app/src/components/catalog/EntityPage.tsx`) add the `TorqueCardComponent`. You can also use the `isTorqueAvailable` function to make sure Torque is avavailable in your component:

```diff
+import { isTorqueAvailable, TorqueCardComponent } from '@qtorque/backstage-torque-plugin';
...
const overviewContent = (
  <Grid item md={6}>
    <EntityAboutCard variant="gridItem" />
  </Grid>
+   <EntitySwitch>
+     <EntitySwitch.Case if={isTorqueAvailable}>
+       <Grid item md={6}>
+         <TorqueCardComponent />
+       </Grid>
+     </EntitySwitch.Case>
+   </EntitySwitch>
```

Add annotations to types that have Torque apps display:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: "torque demo" # Change
  description: Standard Lambda Service
  annotations:
    "torque.io/space": "Sample" # Change
spec:
  type: service
  owner: david.stark@quali.com
  lifecycle: experimental
```

In your `./app-config.yaml`, provide configuration to `torque` section:

```yaml
torque:
  token: ${TORQUE_TOKEN} # without Bearer
  serverUrl: ${TORQUE_URL} # default is https://portal.qtorque.io
```
