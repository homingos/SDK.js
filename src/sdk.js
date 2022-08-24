import closeIframe from './closeIFrame';
import assert from './helper/assert';
import placeOrder from './placeOrder';
import receiveMessage from './receiveMessage';
import renderWithRetry from './renderWithRetry';
import sendMessage from './sendMessage';

/**
 * Handles all the browser's AuthN/AuthZ flows
 * @constructor
 * @param {Object} options
 * @param {String} options.key the API Key found on your Application settings page
 * @param {String} [options.environment] enviornment sandbox | production
 */
function init(options) {
  /* eslint-disable */
  try {
    assert.check(
      options,
      { type: 'object', message: 'clientData parameter is not valid' },
      {
        key: { type: 'string', message: 'key is required' },
        environment: {
          type: 'string',
          message: 'environment is required'
        }
      }
    );

    if (options.overrides) {
      assert.check(options.overrides, {
        type: 'object',
        message: 'overrides option is not valid'
      });
    }
  } catch (err) {
    throw new Error(err.message)
  }
  /* eslint-enable */

  this.clientData = options;

  // core methods
  this.renderWithRetry = renderWithRetry;
  this.placeOrder = placeOrder;
  this.receiveMessage = receiveMessage;
  this.sendMessage = sendMessage;
  this.close = closeIframe;

  /* eslint-enable */
}

export default init;