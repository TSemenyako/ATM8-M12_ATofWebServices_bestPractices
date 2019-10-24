const chai = require('chai');
const expect = chai.expect;
const sendRequest = require('../libs/sendRequest');
const testData = require('./data.json');
const envConfig = require('../config_data/envConfig.json');
const authCookies = require('../libs/dpAuth/allCookies');

describe('Docketing Portal API', async function () {
    let cookies;
    let response;

    testData.map(async function (testDataRow) {
        before('create a user session and send response', async function () {
            this.timeout(50000);
            testDataRow.uri = envConfig.uri + testDataRow.uri;
            console.log('===> uri: ' + testDataRow.uri);
            cookies = await authCookies.getAllCookies(envConfig);
            console.log('===> BEFORE cookies: ' + JSON.stringify(cookies));
            response = await sendRequest(testDataRow, cookies);
            console.log('===> testDataRow.uri: ' + testDataRow.uri);
        });

        it('should receive a response with status 200 for request ' + testDataRow.uri, async function () {
            console.log('===> response.statusCode: ' + response.statusCode);
            expect(response.statusCode).to.equal(200);
        });

        it('should receive body part as a string for request ' + testDataRow.uri, () => {
            console.log('===> response.body: ' + response.body);
            expect(response.body).to.be.a('string');
        });

        it('should receive content-type = text/html for request ' + testDataRow.uri, () => {
            console.log(`===> response.headers['content-type']: ` + response.headers['content-type']);
            expect(response.headers['content-type']).to.exist;
            expect(response.headers['content-type']).to.contain('text/html');
        });
    })

})