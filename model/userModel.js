"use strict";
let mongoose = require('mongoose');

const dbName = "user";

function getSchema() {
    return {
        pseudo: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 16
        },
        email: {
            type: String,
            unique: true,
            sparse: true,
            maxlength: 255
        },
        password: {
            type: String,
            required: true
        },
        level: {
            type: Number,
            default: 1
        },
        created_at: {
            type: Date,
            default: Date.now
        },
        last_connection: {
            type: Date,
            default: Date.now
        },
        last_update: {
            type: Date,
            default: Date.now
        },
        connection_count: {
            type: Number,
            default: 0
        },
        last_ip: {
            type: String,
        },
        credit: {
            type: Number,
            default: 0
        },
        mailing: {
            type: Boolean,
            default: true
        },
        active: {
            type: Boolean,
            default:true
        },
        profile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'profile'
        }
    }
}

let schema = new mongoose.Schema(getSchema());

let model = mongoose.model(dbName, schema);

module.exports = model;