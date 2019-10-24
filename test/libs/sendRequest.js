const rpn = require('request-promise-native');

async function sendRestRequestWithHeader(opts, cookies) {
    const options = {
        uri: opts.uri,
        method: opts.method,
        headers: {
            "User-Agent": "Request-Promise",
            "Content-Type": "application/json",
            Cookie: [
                cookies.ipmsIpm,
                cookies.authUserName,
                cookies.clientCode,
                cookies.currentUserInfo]
        },
        body: opts.body,
        resolveWithFullResponse: true,      //Get the full response instead of just the body
        simple: false,                       // if true, status codes other than 2xx should also reject the promise
        json: true
    };

    const response = await rpn(options);
    return response;
}

module.exports = sendRestRequestWithHeader;