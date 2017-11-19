"use strict";
let mongoose = require('mongoose');
const dbName = "session";

function getSchema() {
    return {
        socketId: {
            type: String,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        created_at: {
            type: Date,
            default: Date.now
        },
    };
}
let schema = new mongoose.Schema(getSchema());

let model = mongoose.model(dbName, schema);

module.exports = model;