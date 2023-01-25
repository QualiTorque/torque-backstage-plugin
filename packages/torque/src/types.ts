import { Entity } from '@backstage/catalog-model';

export type TorqueAnnotationedEntity = {
  metadata: {
    annotations: {
      "torque.io/space": string
    }
  }
} & Entity;