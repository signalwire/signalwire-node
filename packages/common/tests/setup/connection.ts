import logger from '../../src/util/logger'
const Connection = require('../../src/services/Connection')
jest.mock('../../src/services/Connection')


jest.mock('uuid', () => {
  return {
    v4: jest.fn(() => 'mocked-uuid')
  };
});


logger.disableAll()
