"use strict";
let mongoose = require('mongoose');
const dbName = "session";

function init(schema) {
    schema.statics.create = function (data) {
        let dbObject = new model(data);
        return dbObject.save();
    };
    schema.statics.logout = function (socket) {
        return model.where({
            socketId: socket
        }).findOneAndRemove();
    };
    schema.pre('save',function (next) {
        model.where({
           user : this.user
        }).findOneAndRemove().then(()=>{
            next();
        });
    });
}
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
init(schema);
let model = mongoose.model(dbName, schema);

module.exports = model;