const querystring = require('querystring');
const httpHelper = require('./httpHelper');
const cookieHelper = require('./cookieHelper');

/**
 * Gets authentication cookie
 * @param {string} userName
 * @param {string} password
 * @param {string} baseUrl
 * @returns {string}
 */
async function loginAndGetAuthCookies(userName, password, baseUrl) {
  const url = new URL(baseUrl);
  const cookieNames = {
    idsrvXsrf: 'idsrv.xsrf',
    signInMessage: 'SignInMessage',
    tempUserName: 'TempUserName',
    idsrv: 'idsrv=',
    idsvrSession: 'idsvr.session',
    authUserName: 'Auth.UserName',
    ipmsIpm: 'ipms.ipm',
    ipmsIpmClientCode: 'ipms.ipm.clientcode',
    ipmsIpmCurrentUser: 'ipms.ipm.currentuserinfo'
  };

  const options = {
    host: url.hostname,
    path: url.pathname,
    headers: {
      cookie: []
    }
  };

  let response = await httpHelper.getAsync(options);
  const authConnectUrl = new URL(response.headers.location);
  response = await httpHelper.getAsync({ ...options, path: httpHelper.getPath(authConnectUrl) });

  const signInUrl = new URL(response.headers.location);
  const signInParam = signInUrl.searchParams;
  cookieHelper.createCookieProperty(cookieNames.signInMessage);
  options.headers.cookie = [cookieHelper.cookieStorage[cookieNames.signInMessage]];

  response = await httpHelper.getAsync({ ...options, path: httpHelper.getPath(signInUrl) });
  const idsrvXsrfFromBody = httpHelper.getHiddenInputValue(response.body, cookieNames.idsrvXsrf);
  cookieHelper.createCookieProperty(cookieNames.idsrvXsrf);
  let queryStr = new URLSearchParams(signInParam);
  queryStr.append('userName', userName);
  options.headers.cookie = [
    cookieHelper.cookieStorage[cookieNames.signInMessage],
    cookieHelper.cookieStorage[cookieNames.idsrvXsrf]
  ];

  response = await httpHelper.getAsync({ ...options, path: `/auth/Account/LoginProviders?${queryStr.toString()}` });
  cookieHelper.createCookieProperty(cookieNames.tempUserName);
  options.headers.cookie = [
    cookieHelper.cookieStorage[cookieNames.tempUserName],
    cookieHelper.cookieStorage[cookieNames.signInMessage],
    cookieHelper.cookieStorage[cookieNames.idsrvXsrf]
  ];
  let body = querystring.stringify({
    'idsrv.xsrf': idsrvXsrfFromBody,
    username: userName,
    password: password,
    btnLoginSubmit: 'Sign in'
  });

  response = await httpHelper.postAsync({ ...options, path: httpHelper.getPath(signInUrl) }, body);
  cookieHelper.createCookieProperty(cookieNames.idsrv);
  cookieHelper.createCookieProperty(cookieNames.idsvrSession);
  options.headers.cookie = [
    cookieHelper.cookieStorage[cookieNames.tempUserName],
    cookieHelper.cookieStorage[cookieNames.idsrvXsrf],
    cookieHelper.cookieStorage[cookieNames.idsrv],
    cookieHelper.cookieStorage[cookieNames.idsvrSession]
  ];

  response = await httpHelper.getAsync({ ...options, path: httpHelper.getPath(authConnectUrl) });
  cookieHelper.createCookieProperty(cookieNames.authUserName);
  body = querystring.stringify({
    code: httpHelper.getHiddenInputValue(response.body, 'code'),
    state: httpHelper.getHiddenInputValue(response.body, 'state')
  });
  options.headers.cookie = [cookieHelper.cookieStorage[cookieNames.authUserName]];
  response = await httpHelper.postAsync({ ...options, path: url.pathname }, body);
  cookieHelper.createCookieProperty(cookieNames.ipmsIpm);

  const cookies = {
      ipmsIpm: cookieHelper.cookieStorage[cookieNames.ipmsIpm],
      authUserName: cookieHelper.cookieStorage[cookieNames.authUserName],
  };

  return cookies;
}

module.exports = {
  loginAndGetAuthCookies
};