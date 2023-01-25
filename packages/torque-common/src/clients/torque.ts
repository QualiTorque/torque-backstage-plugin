

import fetch from "cross-fetch";
import { backOff } from "exponential-backoff";
import { EnvironmentsResponsePayload } from "../types/environment";

export type TorqueClient = ReturnType<typeof createTorqueClient>


class FetchError extends Error {
    status: number;
    statusText: string;
    constructor(message: string, { status, statusText }: { status: number; statusText: string }) {
      super(message);
      this.status = status;
      this.statusText = statusText;
    }
  }

export function createTorqueClient( token: string, serverUrl: string = 'https://portal.qtorque.io' ) {
    const api = `${serverUrl}/api`;

    return {
        createSpace(payload: {name: string}) {
            const url = 'spaces';
            return _fetch<unknown>('POST', url, payload)
        },
        connectRepo(
                space: string,
                payload: {
                    repository_name: string,
                    repository_url: string,
                    repository_type: string,
                    access_token: string,
                    type: string
                }){
            const url = `spaces/${space}/repositories`;
            return _fetch<{ providerId: string }>('POST', url, payload)
        },

        connectBitBucketRepo(
            space: string,
            payload: {
              repository_name: string,
              repository_url: string,
              type: string
            }) {
          const url = `spaces/${space}/repositories/bitbucketServer`;
          return _fetch<unknown>('POST', url, payload)
        },
        
        associateK8sExecutionHost(space: string, executionHost: string, payload: { default_namespace: string, default_service_account: string   }) {
            const url = `executionhosts/k8s/${executionHost}/spaces/${space}`;
            return _fetch<unknown>('POST', url, payload);
        },
        createBpFromAssetCandidate(
          space: string,
          repo_name: string,
          candidate: {
            name: string,
            override_blueprint: boolean
            path: string,
            repository_url: string,
            type: string
          }) {
          const payload = { 'blueprints_candidates': [candidate], 'repository_name': repo_name };
          const url = `spaces/${space}/blueprints`;
          return _fetch<unknown>('POST', url, payload);
        },
        publishBlueprint(space: string, payload: { blueprint_name: string, is_editable: boolean } ) {
          const url = `spaces/${space}/catalog`;
          return _fetch<unknown>('POST', url, payload);
        },
        startEnvironment(space: string, payload: {blueprint_name: string, sandbox_name: string}) {
          const url = `spaces/${space}/environments`;
          return _fetch<unknown>('POST', url, payload);
        },
        async getEnvironments(space: string, environment_name: string = '') {
          let url = `spaces/${space}/environments`;
          if (environment_name) {
            url += `?environment_name=${environment_name}`;
          }
          const result = await _fetch('GET', url);
          return EnvironmentsResponsePayload.parse(result); 
        }
    };

    async function _fetch<R = unknown>(method: 'POST' | 'GET', url: string, payload: unknown = undefined): Promise<R> {
        const options: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };
    
        if (payload) {
          options.body = JSON.stringify(payload);
        }
    
        return await backOff<R>(async () => {
          const r = await fetch(`${api}/${url}`, options);
          if (r.ok) {
            const t = await r.text();
            if (t) {
              // return r.json() as R;
              return JSON.parse(t);
            } else {
              return null as unknown as R;
            }
          }
          const status = r.status;
          const statusText = r.statusText;
          const body = await r.text();
          throw new FetchError(`Fetch ${method} to ${url} failed due to error: ${body}`, {status, statusText});
        }, {
          numOfAttempts: 3,
          retry: async (e: FetchError) => e.status === 403
        });
      }
}

// export type EnvironmentsResponse = Awaited<ReturnType<typeof 