const https = require('https');
const http = require('http');
const cookieHelper = require('./cookieHelper');

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36';

/**
 * Sends https GET request
 * @param {http.RequestOptions} options
 * @returns {Promise<http.IncomingMessage>}
 */
async function getAsync(options) {
  try {
    return new Promise((resolve, reject) => {
      options = {
        ...options,
        method: 'GET',
        headers: {
        'User-Agent': userAgent,
            'cookie': options.headers.cookie
        }
      };

      https
        .request(options, response => {
          response.on('data', data => response.body = data.toString());
          const cookies = cookieHelper.getCookies(response);
          if (cookies) {
            cookieHelper.addCookiesToStorage(cookies);
          }
          resolve(response);
        })
        .on('error', error => reject(error))
        .end();
    });
  } catch (error) {
    console.error(error);
  }
}

/**
 * Sends https POST request
 * @param {http.RequestOptions} options
 * @param {string} body
 * @returns {Promise<http.IncomingMessage>}
 * */
async function postAsync(options, body) {
  try {
    return new Promise((resolve, reject) => {
      options = {
        ...options,
        method: 'POST',
        headers: {
        'User-Agent': userAgent,
            'Content-Type': 'application/x-www-form-urlencoded',
            'cookie': options.headers.cookie
        }
      };

      const request = https.request(options, response => {
        const cookies = cookieHelper.getCookies(response);
        if (cookies) {
          cookieHelper.addCookiesToStorage(cookies);
        }
        resolve(response);
      });

      if (body) {
        request.write(body);
      }

      request.on('error', error => reject(error));
      request.end();
    });
  } catch (error) {
    console.error(error);
  }
}

/**
 * Gets path from URL object
 * @param {URL} url
 * @returns {string}
*/
function getPath(url) {
  return url.pathname + url.search;
}

/**
 * Gets hidden input element value from response body
 * @param {string} body
 * @param {string} propertyName
 * @returns {string}
 * */
function getHiddenInputValue(body, propertyName) {
  return body.match(new RegExp(`<input type=\"hidden\" name=\"${propertyName}\" value=\"(.*)\" \.+\/>`))[1];
}

module.exports = {
  getAsync,
  postAsync,
  getPath,
  getHiddenInputValue
};