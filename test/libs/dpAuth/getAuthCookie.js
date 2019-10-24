const fs = require('fs');
const cookieProvider = require('./docketingPortalAuthProvider');

(async () => {
  const parameters = getInputDictionary(process.argv);
  validateParameters(parameters);
  let authCookie;
  try {
    authCookie = await cookieProvider.getAuthCookie(parameters.userName, parameters.password, parameters.baseUrl);
    if (authCookie) {
      fs.writeFile(parameters.authCookieFilePath, authCookie, err => {
        if (err) throw err;
        else console.log(`Authentication cookie ${authCookie} was successfully written to ${parameters.authCookieFilePath}`);
      });
      console.log('cookie received:' + authCookie);
      return authCookie;
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

/**
 * Validates command line parameters
 * @param {{}} parameters
 * */
function validateParameters(parameters) {
  const errors = ['userName', 'password', 'baseUrl', 'authCookieFilePath']
    .filter(parameter => !parameters[parameter])
    .map(parameter => `"${parameter}" parameter is missing`);

  if (errors.length > 0) {
    errors.forEach(error => console.error(error));
    process.exit(1);
  }
}

/**
 * @param {string[]} inputs
 * @returns {{}}
 * */
function getInputDictionary(inputs) {
  return inputs.slice(2).reduce((dictionary, input) => {
    const pair = input.split('=');
    if (pair.length === 2) dictionary[pair[0]] = pair[1];
    return dictionary;
  }, {});
}