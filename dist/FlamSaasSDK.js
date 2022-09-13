/**
 * flamsdk v1.0.3
 * Author: bucharitesh
 * Date: 2022-09-12
 * License: MIT
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.FlamSaasSDK = {}));
})(this, (function (exports) { 'use strict';

  //const SDK_BASE_URL = 'https://saas-sdk-flam.vercel.app';
  const SDK_BASE_URL = 'http://localhost:3000';

  const PAGES = {
    main: SDK_BASE_URL,
    error: `${SDK_BASE_URL}/error`
  };

  let trackOrder = null;

  /**
   * Renders the UI for Placing Order
   * @function
   * @param {String} url url to either order flow or error page
   */

  async function renderWithRetry(url) {
    const body = document.querySelector('body');

    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.id = 'saas-sdk-style';
    styleSheet.innerText = `
    body {
      overflow: hidden;
    }

    .flam-sdk-loading-wrapper {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;

      min-height: 100vh;
      min-width: 100vw;
      overflow: hidden;
      border: none;
      background: rgba(0,0,0, 0.4);

      display: flex;
      justify-content: center;
      align-items: center;
    }

    #flam-sdk-iframe {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;

      min-height: 100vh;
      min-width: 100vw;
      border: none;
    }

    .flam-sdk-loading {
      position: relative;
      width: 80px;
      height: 80px;
    }

    .flam-sdk-loading div {
      box-sizing: border-box;
      display: block;
      position: absolute;
      width: 64px;
      height: 64px;
      margin: 8px;
      border: 3px solid #000;
      border-radius: 50%;
      animation: flam-sdk-loading 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      border-color: #000 transparent transparent transparent;
    }
    .flam-sdk-loading div:nth-child(1) {
      animation-delay: -0.45s;
    }
    .flam-sdk-loading div:nth-child(2) {
      animation-delay: -0.3s;
    }
    .flam-sdk-loading div:nth-child(3) {
      animation-delay: -0.15s;
    }
    @keyframes flam-sdk-loading {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `;

    document.head.appendChild(styleSheet);

    const UI = document.createElement('div');
    UI.id = 'flam-sdk-wrapper';

    var RegExp = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;

    const newUrl = () => {
      if (
        this.order_details &&
        this.order_details.theme &&
        this.order_details.theme.color &&
        RegExp.test(this.order_details.theme.color)
      ) {
        const x = '/?theme=';
        return url + x + encodeURIComponent(this.order_details.theme.color);
      }
      return url;
    };

    UI.innerHTML = `
      <div class="flam-sdk-loading-wrapper" id="flam-sdk-loading-wrapper">
        <div class="flam-sdk-loading" id="flam-sdk-loading"><div></div><div></div><div></div><div></div></div>
      </div>
      <iframe id="flam-sdk-iframe" style="opacity: 0" name="flam-sdk-iframe" src="${newUrl()}" style="opacity: 0"></iframe>      
    `;

    body.appendChild(UI);

    const iFrame = document.getElementById('flam-sdk-iframe');

    iFrame.addEventListener('load', async e => {
      e.preventDefault();

      try {
        // check if website available in PRODUCTION
        if (this.clientData.environment == 'PRODUCTION') {
          await fetch(PAGES.main);
        }

        // hide initial loading
        document.getElementById('flam-sdk-loading-wrapper').style.display =
          'none';

        // Show the iframe content
        iFrame.style.opacity = '1';

        // message event handler
        trackOrder = e => {
          this.receiveMessage(e);
        };

        // event listener for receiving messages from iframe
        window.addEventListener('message', trackOrder);

        // save window context for sending messages to iframe
        this.iWindow = document.getElementById('flam-sdk-iframe').contentWindow;
      } catch (err) {
        if (err.message === 'Failed to fetch') {
          this.close();
          this.callback({
            code: 500,
            message: 'Unable to acess SDK Website!'
          });
          return;
        }
        this.callback({
          code: 500,
          message: 'Something went wrong!'
        });
      }
    });
  }

  function close() {
    window.removeEventListener('message', trackOrder);

    // remove the UI
    const element = document.getElementById('flam-sdk-wrapper');
    if (element) {
      element.remove();
    }

    // remove the styles
    const styleSheet = document.getElementById('saas-sdk-style');

    if (styleSheet) {
      styleSheet.remove();
    }
  }

  var toString = Object.prototype.toString;

  function attribute(o, attr, type, text) {
      type = type === 'array' ? 'object' : type;
      if (o && typeof o[attr] !== type) {
          throw new Error(text);
      }
  }

  function variable(o, type, text) {
      if (typeof o !== type) {
          throw new Error(text);
      }
  }

  function value(o, values, text) {
      if (values.indexOf(o) === -1) {
          throw new Error(text);
      }
  }

  function check(o, config, attributes) {
      if (!config.optional || o) {
          variable(o, config.type, config.message);
      }
      if (config.type === 'object' && attributes) {
          var keys = Object.keys(attributes);

          for (var index = 0; index < keys.length; index++) {
              var a = keys[index];
              if (!attributes[a].optional || o[a]) {
                  if (!attributes[a].condition || attributes[a].condition(o)) {
                      attribute(o, a, attributes[a].type, attributes[a].message);
                      if (attributes[a].values) {
                          value(o[a], attributes[a].values, attributes[a].value_message);
                      }
                  }
              }
          }
      }
  }

  /**
   * Wrap `Array.isArray` Polyfill for IE9
   * source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
   *
   * @param {Array} array
   * @private
   */
  function isArray(array) {
      if (this.supportsIsArray()) {
          return Array.isArray(array);
      }

      return toString.call(array) === '[object Array]';
  }

  function supportsIsArray() {
      return Array.isArray != null;
  }

  var assert = {
      check: check,
      attribute: attribute,
      variable: variable,
      value: value,
      isArray: isArray,
      supportsIsArray: supportsIsArray
  };

  /**
   * Runs the SDK for Placing Order
   * @function
   * @param {Object} options
   * @param {String} options.key the API Key found on your Application settings page
   * @param {String} [options.environment] enviornment sandbox | production
   */

  // TODO: write the parameter descriptions

  async function placeOrder(order_details, callback) {
    try {
      // validate client data
      assert.check(
        this.clientData,
        { type: 'object', message: 'init data is invalid' },
        {
          key: { type: 'string', message: "'key' is required string." },
          environment: {
            optional: true,
            type: 'string',
            message: "'environment' must be string."
          }
        }
      );

      // validate order_details
      assert.check(
        order_details,
        {
          type: 'object',
          message: "'order details' is not valid."
        },
        {
          productId: {
            type: 'string',
            message: "'productId' is required string."
          },
          refId: { type: 'string', message: "'refId' is required string." },
          photo: {
            optional: true,
            type: 'string',
            message: "'photo' must be string."
          },
          video: {
            optional: true,
            type: 'string',
            message: "'video' must be string."
          },
          prefill: {
            optional: true,
            type: 'object',
            message: "'prefill' must be object."
          },
          animation: {
            optional: true,
            type: 'string',
            message: "'animation' must be string."
          },
          theme: {
            optional: true,
            type: 'object',
            message: "'theme' must be object."
          },
          logo: {
            optional: true,
            type: 'string',
            message: "'logo' must be string."
          }
        }
      );

      // validate callback function
      assert.check(callback, {
        type: 'function',
        message: "'callback' is required function."
      });

      // save order_details
      this.order_details = order_details;

      // render the success UI
      let url = `${PAGES.main}`;

      this.callback = callback;

      await this.renderWithRetry(url);
    } catch (err) {
      if (callback && typeof callback === 'function') {
        // render error UI
        let url = `${PAGES.error}/Something went wrong!`;
        await this.renderWithRetry(url);
        // callback to client with error
        await callback({ code: 400, message: err.message }, null);
      } else {
        throw "'callback' is required function.";
      }
    }
    document.activeElement.blur();
  }

  function receiveMessage(event) {
    if (event.origin == PAGES.main) {
      switch (event.data.type) {
        case 'CLOSE':
          this.close();
          break;
        case 'READY_TO_RECEIVE':
          this.sendMessage({
            type: 'INITIAL_DATA',
            payload: {
              client_data: this.clientData,
              order_details: this.order_details
            }
          });
          break;
        case 'READY_TO_RECEIVE_ERR':
          this.sendMessage({
            type: 'INITIAL_DATA_ERR',
            payload: {
              ...this.clientData,
              email:
                this.order_details &&
                this.order_details.prefill &&
                this.order_details.prefill.email
                  ? this.order_details.prefill.email
                  : '',
              phone:
                this.order_details &&
                this.order_details.prefill &&
                this.order_details.prefill.phone
                  ? this.order_details.prefill.phone
                  : ''
            }
          });
          break;
        case 'CREATED':
          this.callback(null, {
            code: 201,
            data: event.data.payload,
            message: 'Order placed successfully!'
          });
          this.close();
          break;
        case 'ERROR':
          this.callback(
            {
              code: event.data.payload.code,
              message: event.data.payload.message
            },
            null
          );
          break;
      }
    }
  }

  function sendMessage(message) {
    this.iWindow.postMessage(message, PAGES.main);
  }

  /**
   * Initializes a SDK instance
   * @constructor
   * @param {Object} options
   * @param {String} options.key the API Key found on your Application settings page
   * @param {String} [options.environment] enviornment SANDBOX | PRODUCTION
   */
  function init(options) {
    /* eslint-disable */

    // validate the client's input for 'init'
    try {
      assert.check(
        options,
        { type: 'object', message: 'init parameter is not valid.' },
        {
          key: { type: 'string', message: "'key' is required string." },
          environment: {
            optional: true,
            type: 'string',
            message: "'environment' must be string."
          }
        }
      );
    } catch (err) {
      // assert method above throws error with given message which we further throw to client.
      if (err && err.message) {
        throw err.message;
      }
      throw 'Something went wrong!';
    }

    // set environment to 'PRODUCTION' if stated by client, otherwise 'SANDBOX'
    options.environment =
      options &&
      typeof options.environment === 'string' &&
      options.environment.toUpperCase() === 'PRODUCTION'
        ? 'PRODUCTION'
        : 'SANDBOX';

    // save options to clientData
    this.clientData = options;

    /* eslint-enable */
  }

  // core methods
  init.prototype.renderWithRetry = renderWithRetry;
  init.prototype.placeOrder = placeOrder;
  init.prototype.receiveMessage = receiveMessage;
  init.prototype.sendMessage = sendMessage;
  init.prototype.close = close;

  var version = { raw: '1.0.3' };
  version.raw;

  var index = { version: version, init: init };

  exports["default"] = index;
  exports.init = init;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
