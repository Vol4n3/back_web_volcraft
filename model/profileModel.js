"use strict";
let mongoose = require('mongoose');
const dbName = "profile";

function getSchema() {
    return {
        pseudo: {
            type: String,
            unique: true,
            required: true,
            trim: true
        },
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

let model = mongoose.model(dbName, schema);

module.exports = model;