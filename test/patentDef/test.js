const chai = require('chai');
const expect = chai.expect;
const sendRequest = require('../libs/sendRequest');
const envConfig = require('../config_data/envConfig.json');
const authCookies = require('../libs/dpAuth/allCookies');
const generateDockNum = require('../libs/generateDockNum');
let createDefData = require('./createDefData.json');
let findDefData = require('./findDefData.json');
let deleteDefData = require('./deleteDefData.json');

describe('Docketing Portal API', async function () {
    let cookies;
    let response;
    let masterID;
    let docketNumber = "AT_Test";


    describe('should create DEF and', async function () {
        for (let createDefDataItem of createDefData) {

            before('create a user session and send response', async function () {
                this.timeout(50000);
                docketNumber = await generateDockNum();
                propertyReference = createDefDataItem.body.filingObjectDefinition.Properties.find(p => p.ColumnName.toUpperCase() === "DOCKETNUMBER");
                propertyReference.Value = docketNumber;
                createDefDataItem.uri = envConfig.uri + createDefDataItem.uri;
                cookies = await authCookies.getAllCookies(envConfig);

                response = await sendRequest(createDefDataItem, cookies);
                masterID = response.body.FilingSectionDefinition.RecordId;
                console.log('===> Record masterID: ' + masterID);
            });

            it('should receive a response with status 200 for request ' + createDefDataItem.uri, async function () {
                expect(response.statusCode).to.equal(200);
            });

            it('should receive response body as an object for request ' + createDefDataItem.uri, () => {
                expect(response.body).to.be.a('object');
            });

            it('should receive response body that contains ' + `${docketNumber}` + ' for request ' + createDefDataItem.uri, () => {
                expect(JSON.stringify(response.body)).to.contain(docketNumber);
            });

            it('should receive response content-type = application/json for request ' + createDefDataItem.uri, () => {
                expect(response.headers['content-type']).to.exist;
                expect(response.headers['content-type']).to.contain('application/json');
            });
        }
    })


    describe('should find created DEF in the query and', async function () {
        for (let findDefDataItem of findDefData) {
            before('create a user session and send response', async function () {
                this.timeout(50000);
                fieldAliasReference = findDefDataItem.body.Filters.find(p => p.FieldAlias.toUpperCase() === "PAM$DOCKETNUMBER");
                fieldAliasReference.LeftFieldValue = docketNumber;
                findDefDataItem.uri = envConfig.uri + findDefDataItem.uri;
                cookies = await authCookies.getAllCookies(envConfig);

                response = await sendRequest(findDefDataItem, cookies);
            });

            it('should receive a response with status 200 for request ' + findDefDataItem.uri, async function () {
                expect(response.statusCode).to.equal(200);
            });

            it('should receive response body as an object for request ' + findDefDataItem.uri, () => {
                expect(response.body).to.be.a('object');
            });

            it('should receive response body that contains ' + `${docketNumber}` + ' for request ' + findDefDataItem.uri, () => {
                expect(JSON.stringify(response.body)).to.contain(docketNumber);
            });

            it('should receive response content-type = application/json for request ' + findDefDataItem.uri, () => {
                expect(response.headers['content-type']).to.exist;
                expect(response.headers['content-type']).to.contain('application/json');
            });
        }
    })

    describe('should delete created DEF and', async function () {
        for (let deleteDefDataItem of deleteDefData) {

            before('create a user session and send response', async function () {
                this.timeout(50000);
                deleteDefDataItem.body.MasterId = masterID;
                deleteDefDataItem.uri = envConfig.uri + deleteDefDataItem.uri;
                cookies = await authCookies.getAllCookies(envConfig);
                response = await sendRequest(deleteDefDataItem, cookies);
            });


            it('should receive a response with status 200 for request ' + deleteDefDataItem.uri, async function () {
                expect(response.statusCode).to.equal(200);
            });

            it('should receive response body as an object for request ' + deleteDefDataItem.uri, () => {
                expect(response.body).to.be.a('object');
            });

            it('should receive ReturnCode=0 in response body for request ' + deleteDefDataItem.uri, () => {
                expect(JSON.stringify(response.body.ReturnCode)).to.equal('0');
            });

            it('should receive response content-type = application/json for request ' + deleteDefDataItem.uri, () => {
                expect(response.headers['content-type']).to.exist;
                expect(response.headers['content-type']).to.contain('application/json');
            });
        }
    })
})