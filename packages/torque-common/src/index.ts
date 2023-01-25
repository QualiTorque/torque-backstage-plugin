/***/
/**
 * Common functionalities for the torque plugin.
 *
 * @packageDocumentation
 */

/**
 * In this package you might for example declare types that are common
 * between the frontend and backend plugin packages.
 */
export type CommonType = {
  field: string
}

/**
 * Or you might declare some common constants.
 */
export const COMMON_CONSTANT = 1
export * from './clients/torque';
export * from './types/environment';
export * from './clients/fetch-envs-info';
