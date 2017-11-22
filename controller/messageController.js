let messageModel = require('../model/messageModel');

class messageController {
    static getLastest(channel) {
        return new Promise((resolve, reject) => {
            messageModel.find({
                channel: channel
            }).sort('-date').limit(50).populate({
                path: 'user',
                populate: {
                    path: 'profile'
                }
            }).then((doc) => {
                if (doc) {
                    resolve(doc);
                } else {
                    reject({msg: "not_messages"});
                }
            }).catch((err) => {
                reject(err);
            })
        })
    }
    static makeClientFormat(profile,text){
        return {
            pseudo: profile.pseudo,
            text: text,
            img: 'https://www.ecosources.info/images/energie_batiment/eolienne_axe_vertical_Darri.jpg',
            date: '2017',
            datetime: '2017-12-25'
        }
    }
    static create(userId, data) {
        return new Promise((resolve, reject) => {
            let message = new messageModel({
                user: userId,
                text: data.text,
                channel: data.channel
            });
            message.save().then(() => {
                resolve();
            }).catch(() => {
               reject();
            })
        });
    }
}

module.exports = messageController;