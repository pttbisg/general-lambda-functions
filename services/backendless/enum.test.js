const { BACKENDLESS } = require('./enum');

describe('BACKENDLESS', () => {
    test('Should return correct enum', () => {
        const inputs = [
            {
                in: BACKENDLESS.APP_ID_PROD,
                out: "",
            },
            {
                in: BACKENDLESS.APP_KEY_PROD,
                out: "",
            },
            {
                in: BACKENDLESS.TABLE.SKUOutboundISGOrders,
                out: "SKU_Outbound_ISGOrders",
            },
            {
                in: BACKENDLESS.DEFAULT.OFFSET,
                out: 0,
            },
            {
                in: BACKENDLESS.DEFAULT.PAGESIZE,
                out: 100,
            },
            {
                in: BACKENDLESS.TABLE.SKUMatching,
                out: "SKU_matching",
            },
            {
                in: BACKENDLESS.TABLE.SKUInbound,
                out: "SKU_Inbound",
            },
            {
                in: BACKENDLESS.TABLE.SKUOutbound,
                out: "SKU_Outbound",
            },
            {
                in: BACKENDLESS.TABLE.SKUOutboundISGOrders,
                out: "SKU_Outbound_ISGOrders",
            },
        ];

        inputs.forEach(input => {
            expect(input.in).toBe(input.out);
        })
    })
})
