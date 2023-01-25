import { array, object, string, boolean, number } from 'zod';

// TODO: remove nullable() where it's not needed

export const Environment = object({
    id: string().nullable(),
    owner: object({
      first_name: string().nullable(),
      last_name: string().nullable(),
      email: string().nullable(),
      join_date: string().nullable(),
      display_first_name: string().nullable(),
      display_last_name: string().nullable(),
    }),
    details: object({
      definition: object({
        metadata: object({
          name: string().nullable(),
          automation: boolean().nullable(),
          blueprint: string().nullable(),
          blueprint_name: string().nullable(),
          blueprint_inputs: array(
            object({
              name: string().nullable(),
              type: string({}).nullable(),
              default_value: string().nullable(),
              has_default_value: boolean().nullable(),
              sensitive: boolean().nullable(),
              description: string().nullable(),
              allowed_values: array(string()).nullable()
            })
          )
        })
      }),
      state: object({
        current_state: string().nullable(),
        execution: object({
          retention: object({ kind: string() }),
          start_time: string().nullable(),
          end_time: string().nullable()
        }),
        drift: object({
          deployment: object({ detected: boolean() }),
          asset: object({
            detected: boolean().nullable(),
            deployed_commit_sha: string().nullable(),
            latest_commit_sha: string().nullable()
          })
        })
      }),
      computed_status: string()
    }),
    cost: object({
      sum: number().nullable(),
      last_update: string().nullable(),
      final: boolean().nullable(),
      currency: string().nullable(),
      incomplete: boolean()
    }).nullable()
});

export const EnvironmentsResponsePayload = array(Environment);
