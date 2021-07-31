"use strict";

const sinon = require('sinon');

const { BackendlessService } = require('./index');

const backendlessService = new BackendlessService();


describe('BackendlessService.retrieveAllSKUMatchingByUserOID', () => {
    it('Should be able to run to retrieve >= 100 SKU matching records', () => {
        let backendlessServiceMock = sinon.stub(backendlessService, "retrieveSKUMatchingByUserOID");

        let dataOf100 = () => {
            let result = [];

            for(let i = 0; i <  100; i++) {
                result.push({
                    'foo': i,
                });
            }

            return result;
        };

        let dataOf5 = () => {
            let result = [];

            for(let i = 0; i <  5; i++) {
                result.push({
                    'foo': i,
                });
            }

            return result;
        };



        backendlessServiceMock.onFirstCall().returns(dataOf100());
        backendlessServiceMock.onSecondCall().returns(dataOf5());

        backendlessService.retrieveAllSKUMatchingByUserOID('foo').then(res => {
            expect(res.length).toBe(105);
        }).catch(err => {
            expect(err).toBe(null);
        })
    });
});

describe('BackendlessService.retrieveAllSKUInboundBySKUMatchingOID', () => {
    it('Should be able to run to retrieve >= 100 SKU inbound records', () => {
        let backendlessServiceMock = sinon.stub(backendlessService, "retrieveSKUInboundBySKUMatchingOID");

        let dataOf100 = () => {
            let result = [];

            for(let i = 0; i <  100; i++) {
                result.push({
                    'foo': i,
                });
            }

            return result;
        };

        let dataOf5 = () => {
            let result = [];

            for(let i = 0; i <  5; i++) {
                result.push({
                    'foo': i,
                });
            }

            return result;
        };



        backendlessServiceMock.onFirstCall().returns(dataOf100());
        backendlessServiceMock.onSecondCall().returns(dataOf5());

        backendlessService.retrieveAllSKUInboundBySKUMatchingOID('foo').then(res => {
            expect(res.length).toBe(105);
        }).catch(err => {
            expect(err).toBe(null);
        })
    });
});


describe('BackendlessService.retrieveAllSKUOutboundISGOrdersBySKUMatchingOID', () => {
    it('Should be able to run to retrieve >= 100 SKU outbound ISGOrder records', () => {
        let backendlessServiceMock = sinon.stub(backendlessService, "retrieveSKUOutboundISGOrdersBySKUMatchingOID");

        let dataOf100 = () => {
            let result = [];

            for(let i = 0; i <  100; i++) {
                result.push({
                    'foo': i,
                });
            }

            return result;
        };

        let dataOf5 = () => {
            let result = [];

            for(let i = 0; i <  5; i++) {
                result.push({
                    'foo': i,
                });
            }

            return result;
        };



        backendlessServiceMock.onFirstCall().returns(dataOf100());
        backendlessServiceMock.onSecondCall().returns(dataOf5());

        backendlessService.retrieveAllSKUOutboundISGOrdersBySKUMatchingOID('foo').then(res => {
            expect(res.length).toBe(105);
        }).catch(err => {
            expect(err).toBe(null);
        })
    });
});



describe('BackendlessService.retrieveAllSKUOutboundBySKUMatchingOID', () => {
    it('Should be able to run to retrieve >= 100 SKU outbound ISGOrder records', () => {
        let backendlessServiceMock = sinon.stub(backendlessService, "retrieveSKUOutboundBySKUMatchingOID");

        let dataOf100 = () => {
            let result = [];

            for(let i = 0; i <  100; i++) {
                result.push({
                    'foo': i,
                });
            }

            return result;
        };

        let dataOf5 = () => {
            let result = [];

            for(let i = 0; i <  5; i++) {
                result.push({
                    'foo': i,
                });
            }

            return result;
        };



        backendlessServiceMock.onFirstCall().returns(dataOf100());
        backendlessServiceMock.onSecondCall().returns(dataOf5());

        backendlessService.retrieveAllSKUOutboundBySKUMatchingOID('foo').then(res => {
            expect(res.length).toBe(105);
        }).catch(err => {
            expect(err).toBe(null);
        })
    });
});
