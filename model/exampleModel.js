"use strict";
let mongoose = require('mongoose');
const dbName = "dbName";


function getSchema() {
    return {};
}
let schema = new mongoose.Schema(getSchema());

let model = mongoose.model(dbName, schema);

module.exports = model;