"use strict";
let mongoose = require('mongoose');
let crypto = require('crypto');
let profileModel = require('./profileModel');

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
        profile: data.profile,
    }
}

function filterShow(rational, group) {
    if(rational === "owner" ){
        return {}
    }
}

function filterRemove(level, rational) {

}

function init(model) {
    model.schema.statics.register = function (data, level) {
        return new Promise((resolve, reject)=>{
            profileModel.create().then((profileDoc)=>{
                data.password = crypt(data.password);
                data.profile = profileDoc._id;
                console.log(profileDoc);
                let dbObject = new model(filterCreate(data, level));
                return dbObject.save().then((doc)=>{
                    resolve(doc)
                }).catch((err)=>{
                    reject(err);
                });

            }).catch(()=>{

            });
        });

    };
    model.schema.statics.get = function (data, level, rational, group) {
        if (level > 1){
            return this.findById(data);
        }
        return this.findById(data)
            .select(filterShow(rational, group));
    };
    model.schema.statics.login = function(data) {
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
            ref: 'user'
        }
    }
}

let schema = new mongoose.Schema(getSchema());

let model = mongoose.model(dbName, schema);
// todo find the probleme
init(model);

module.exports = model;