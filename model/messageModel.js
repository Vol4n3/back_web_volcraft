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
            maxlength : 320
        },
        created_at: {
            type: Date,
            default: Date.now
        },
        channel: {
            type: String,
            default: 'default'
        }
    };
}
let schema = new mongoose.Schema(getSchema());
init(schema);
let model = mongoose.model(dbName, schema);

module.exports = model;