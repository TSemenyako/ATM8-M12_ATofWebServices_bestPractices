const rpn = require('request-promise-native');
const authProvider = require('./docketingPortalAuthProvider');
const cookieHelper = require('./cookieHelper');

const getAllCookies = async function (env) {
    const username = env.username;
    const password = env.password;
    const url = env.uri + '/UI';

    const authCookies = await authProvider.loginAndGetAuthCookies(username, password, url);
    const uiResponse = await rpn({
        uri: url,
        method: 'GET',
        headers: {
            "User-Agent": "Request-Promise",
            Cookie: [authCookies.ipmsIpm, authCookies.authUserName]
        },
        resolveWithFullResponse: true,      //Get the full response instead of just the body
        simple: false                       // if true, status codes other than 2xx should also reject the promise
    });
    const clientCodeCookie = cookieHelper
        .getCookies(uiResponse)
        .filter(cookie => cookie.includes('ipms.ipm.clientcode'))[0]
        .split(";")
        .filter(cookiePart => cookiePart.includes('ipms.ipm.clientcode'))[0];
    authCookies.clientCode = clientCodeCookie;

    const currentUrl = env.uri + "/UsersManagement/Users/current/";
    const currentUserResponse = await rpn({
        uri: currentUrl,
        method: 'GET',
        headers: {
            "User-Agent": "Request-Promise",
            Cookie: [
                authCookies.ipmsIpm,
                authCookies.authUserName,
                authCookies.clientCode]
        },
        resolveWithFullResponse: true,      //Get the full response instead of just the body
        simple: false                       // if true, status codes other than 2xx should also reject the promise
    });
    const currentUserInfoCookie = cookieHelper
        .getCookies(currentUserResponse)
        .filter(cookie => cookie.includes('ipms.ipm.currentuserinfo'))[0]
        .split(";")
        .filter(cookiePart => cookiePart.includes('ipms.ipm.currentuserinfo'))[0];
    authCookies.currentUserInfo = currentUserInfoCookie;

    return authCookies;
}

module.exports = { getAllCookies };