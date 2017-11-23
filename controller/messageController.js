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

    /**
     *
     * @param profile
     * @param text
     * @param {Date} date
     */
    static buildForClient(profile,text,date){
        return {
            pseudo: profile.pseudo,
            text: text,
            img: profile.image,
            date: date.toDateString(),
            datetime: date
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