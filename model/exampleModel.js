"use strict";
let mongoose = require('mongoose');
const dbName = "dbName";

function init(schema) {

}
function getSchema() {
    return {};
}
let schema = new mongoose.Schema(getSchema());
init(schema);
let model = mongoose.model(dbName, schema);

module.exports = model;