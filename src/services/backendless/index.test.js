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

describe('BackendlessService.calculateSKUInboundQty', () => {
    let backendlessServiceMock;
    beforeEach(() => {
        backendlessServiceMock = sinon.stub(backendlessService, "aggregateTable");
    })

    afterEach(() => {
        backendlessServiceMock.restore();
    })

    it('Should be able to run to retrieve >= 100 SKU inbound records', () => {

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

        backendlessService.calculateSKUInboundQty('foo').then(res => {
            expect(res.length).toBe(105);
        }).catch(err => {
            expect(err).toBe(null);
        })
    });
});


describe('BackendlessService.calculateSKUOutboundISGOrderQty', () => {
    let backendlessServiceMock;
    beforeEach(() => {
        backendlessServiceMock = sinon.stub(backendlessService, "aggregateTable");
    })

    afterEach(() => {
        backendlessServiceMock.restore();
    })

    it('Should be able to run to retrieve >= 100 SKU outbound ISGOrder records', () => {
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

        backendlessService.calculateSKUOutboundISGOrderQty('foo').then(res => {
            expect(res.length).toBe(105);
        }).catch(err => {
            expect(err).toBe(null);
        })
    });
});



describe('BackendlessService.calculateSKUOutboundQty', () => {
    let backendlessServiceMock;
    beforeEach(() => {
        backendlessServiceMock = sinon.stub(backendlessService, "aggregateTable");
    })

    afterEach(() => {
        backendlessServiceMock.restore();
    })

    it('Should be able to run to retrieve >= 100 SKU outbound ISGOrder records', () => {
        

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

        backendlessService.calculateSKUOutboundQty('foo').then(res => {
            expect(res.length).toBe(105);
        }).catch(err => {
            expect(err).toBe(null);
        })

        backendlessServiceMock.restore();
    });
});
