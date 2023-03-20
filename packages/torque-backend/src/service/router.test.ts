import { getVoidLogger } from '@backstage/backend-common';
import express from 'express';
import request from 'supertest';

describe('createRouter', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
