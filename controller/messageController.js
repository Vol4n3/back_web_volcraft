let messageModel = require('../model/messageModel');

class messageController {
    static getLastest(channel) {
        return new Promise((resolve, reject) => {

            messageModel.find({
                channel: channel
            }).limit(50).sort({created_at: -1}).populate({
                path: 'user',
                populate: {
                    path: 'profile'
                }
            }).then((doc) => {
                if (doc) {
                    doc.reverse();
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
    static buildForClient(profile, text, date) {
        return {
            pseudo: profile.pseudo,
            text: text,
            img: profile.image,
            profileId: profile._id,
            date: date.toDateString(),
            datetime: date
        }
    }

    static analyse(msg) {
        const reg_giphy = /^\/giphy\s?(\S*)?/i;
        const reg_notify = /@(\S*)/ig;
        const reg_private_msg = /^@(\S*)/i.exec(msg);
        if(reg_private_msg){
            msg.replace(reg_private_msg[0],'');
            return {
                text : msg,
                data : reg_private_msg[1],
                type: 'private_message'
            }
        }
        return {
            text : msg,
            type: "global",
            data : "pseudo"
        };
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