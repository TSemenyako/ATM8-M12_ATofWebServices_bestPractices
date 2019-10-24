const http = require('http');

const cookieStorage = {
  cookies: []
};

/**
 *  Gets cookies from response
 * @param {http.IncomingMessage} response 
 * @returns {string[]}
 */
function getCookies(response) {
  return response.headers['set-cookie'];
}

/** Adds cookies to in memory object in order to manipulate them further
 * @param {string[]} cookie 
 * */
function addCookiesToStorage(cookie) {
  let separatedCookies = separateCookie(cookie);
  for (const cookie of separatedCookies) {
    if (!cookieStorage.cookies.includes(cookie)) {
      cookieStorage.cookies.push(cookie);
    }
  }
}

/** 
 * Creates property in cookieStorage object corresponding a specific cookie
 * @param {string} name 
 * */
function createCookieProperty(name) {
  cookieStorage.cookies
    .filter(cookie => cookie.includes(name))
    .forEach(cookie => cookieStorage[name] = cookie);
  
  if (!cookieStorage[name]) {
    console.error(`Cookie that includes "${name}" was not returned with any response.`);
    process.exit(1);
  }
}

/** 
 * Divides cookie from response into array of cookie
 * @param {string[]} cookies 
 * @returns {string[]}
 * */
function separateCookie(cookies) {
  const separator = '; ';
  return cookies.join(separator).split(separator);
}

module.exports = {
  cookieStorage,
  getCookies,
  addCookiesToStorage,
  createCookieProperty
};