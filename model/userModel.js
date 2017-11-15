"use strict";
let mongoose = require('mongoose');
let crypto = require('crypto');

const dbName = "user";

function crypt(data) {
    return crypto.createHmac('sha256', data)
        .update(process.env.SECRET || 'hmcdo')
        .digest('hex');
}

function filterUpdate(data, level, rational, group) {
    return level > 1 || rational === "owner" ? data : {
        email: data.email,
        password: data.password,
        last_ip: data.last_ip,
    }
}

function filterCreate(data, level) {
    return level > 1 ? data : {
        pseudo: data.pseudo,
        email: data.email,
        password: data.password,
        last_ip: data.last_ip,
    }
}

function filterShow(rational, group) {
    if(rational === "owner" ){
        return {}
    }
}

function filterRemove(level, rational) {

}

function init(schema) {
    schema.statics.register = function (data, level) {
        data.password = crypt(data.password);
        let dbObject = new model(filterCreate(data, level));
        return dbObject.save();
    };
    schema.statics.get = function (data, level, rational, group) {
        if (level > 1){
            return this.findById(data);
        }
        return this.findById(data)
            .select(filterShow(rational, group));
    };
    schema.statics.login = function(data) {
        if (data.pseudo) {
            return this.findOne({
                pseudo: data.pseudo,
                password: crypt(data.password)
            })
        }
    }
}

function getSchema() {
    return {
        pseudo: {
            type: String,
            unique: true,
            required: true,
            trim: true
        },
        email: {
            type: String,
            unique: true,
            sparse: true
        },
        password: {
            type: String,
            required: true
        },
        group: {
            type: String,
            default: "default"
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
        }
    }
}

let schema = new mongoose.Schema(getSchema());
init(schema);
let model = mongoose.model(dbName, schema);

module.exports = model;