"use strict";
let mongoose = require('mongoose');
const dbName = "profile";

function init(schema) {
    schema.statics.create = function () {
        let dbObject = new model({});
        return dbObject.save();
    };
}
function getSchema() {
    return {
        group: {
            type: String,
            default: "default"
        },
        image: {
            type: String,
            default: "/img/profil.png"
        },
        birthday: {
            type: Date
        },
        motd:{
            type: String
        },
        description:{
            type: String
        }
    };
}
let schema = new mongoose.Schema(getSchema());
init(schema);
let model = mongoose.model(dbName, schema);

module.exports = model;