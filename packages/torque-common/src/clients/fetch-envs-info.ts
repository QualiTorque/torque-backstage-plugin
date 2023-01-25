import { TorqueClient } from './torque';

export async function fetchEnvsInfo({ client }: { client: TorqueClient; }, space: string) {
  const environments = await client.getEnvironments(space);

  return environments;

//   return await Promise.all(environments.map(async (env) => {
//     const [runtime, resources] = await Promise.all([
//       client.getRuntimeInfo(appId, env.id),
//       client.getActiveEnvironmentResources(appId, env.id),
//     ]);

//     return {
//       ...env,
//       runtime,
//       resources
//     };
// }));
}

export type FetchEnvsInfoResponse = Awaited<ReturnType<typeof fetchEnvsInfo>>;
// export type FetchAppInfoEnvironment = FetchAppInfoResponse[0]