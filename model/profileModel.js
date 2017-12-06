"use strict";
let mongoose = require('mongoose');
const dbName = "profile";

function getSchema() {
    return {
        pseudo: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 16
        },
        group: {
            type: String,
            default: "default"
        },
        image: {
            type: String,
            default: "/img/profil.png",
            maxlength: 2048
        },
        birthday: {
            type: Date
        },
        motd:{
            type: String,
            maxlength: 255
        },
        description:{
            type: String,
            maxlength: 2048
        }
    };
}
let schema = new mongoose.Schema(getSchema());

let model = mongoose.model(dbName, schema);

module.exports = model;