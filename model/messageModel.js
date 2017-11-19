"use strict";
let mongoose = require('mongoose');
const dbName = "message";

function init(schema) {

}
function getSchema() {
    return {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        text: {
            type: String,
        },
        created_at: {
            type: Date,
            default: Date.now
        },
        chanel: {
            type: String,
            default: 'common'
        }
    };
}
let schema = new mongoose.Schema(getSchema());
init(schema);
let model = mongoose.model(dbName, schema);

module.exports = model;