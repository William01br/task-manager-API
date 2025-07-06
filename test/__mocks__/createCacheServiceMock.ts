import { ICacheService } from '@src/infra/cache/redis/ICacheService';

export const createCacheServiceMock = (): jest.Mocked<ICacheService> => {
  return {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  };
};
