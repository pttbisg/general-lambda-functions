"use strict";

const axios = require("axios");

const { BACKENDLESS } = require("./enum");

class POCBackendlessToAirtableService {
    buildBackendlessPayload(booleanColumn, dateColumn, formulaColumn, numberColumn, phoneColumn, singleSelectColumn, stringColumn, objectID, ownerID, created, updated, deleted, ) {
        let res = {};

        if(booleanColumn != null) { res['boolean_column'] = booleanColumn };
        if(dateColumn) { res['date_column'] = dateColumn };
        if(formulaColumn) { res['formula_column'] =  parseFloat(formulaColumn) };
        if(numberColumn) { res['number_column'] = parseFloat(numberColumn) };
        if(phoneColumn) { res['phone_column'] = phoneColumn };
        if(singleSelectColumn) { res['single_select_column'] = singleSelectColumn };
        if(stringColumn) { res['string_column'] = stringColumn };
        if(objectID) { res['objectID'] = objectID };
        if(ownerID) { res['ownerID'] = ownerID };
        if(created) { res['created'] = created };
        if(updated) { res['updated'] = updated };
        if(deleted) { res['deleted'] = deleted };

        return res;
    }

    async insert(data) {
        const res = await axios.post(
            `https://api.backendless.com/${BACKENDLESS.APP_ID_PROD}/${BACKENDLESS.APP_KEY_PROD}/data/${BACKENDLESS.TABLE.POCBackendlessToAirtable}`,
            data,
        );

        return res.data;
    }

    async update(id, data) {
        const res = await axios.put(
            `https://api.backendless.com/${BACKENDLESS.APP_ID_PROD}/${BACKENDLESS.APP_KEY_PROD}/data/${BACKENDLESS.TABLE.POCBackendlessToAirtable}/${id}`,
            data,
        )

        return res.data;
    }

    async softDelete(id) {
        const res = await axios.put(
            `https://api.backendless.com/${BACKENDLESS.APP_ID_PROD}/${BACKENDLESS.APP_KEY_PROD}/data/${BACKENDLESS.TABLE.POCBackendlessToAirtable}/${id}`,
            {
                "deleted": new Date(),
            },
        )

        return res.data;
    }
}


module.exports = {
    POCBackendlessToAirtableService,
}
