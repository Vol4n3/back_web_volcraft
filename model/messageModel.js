"use strict";
let mongoose = require('mongoose');
const dbName = "message";

function init(schema) {
    schema.statics.get = function(){
        return schema.find().sort('-date').limit(50).populate({
            path : 'user',
            populate : {
                path: 'profile'
            }
        })
    }
}
/*pseudo: 'Vol4n3',
    txt: 'test"qsd"',
    img: 'http://www.aiphone.fr/images/mobile/icone_compte.png',
    date: '2017',*/
function getSchema() {
    return {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        text: {
            type: String,
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