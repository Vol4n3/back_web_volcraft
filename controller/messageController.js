let messageModel = require('../model/messageModel');

class messageController {
    static getLastest(chanel) {
        return new Promise((resolve, reject) => {
            messageModel.find({
                chanel: chanel
            }).sort('-date').limit(50).populate({
                path: 'user',
                populate: {
                    path: 'profile'
                }
            }).then((doc)=>{
                if(doc){
                    resolve(doc);
                }else{
                    reject({msg : "not_messages"});
                }
            }).catch((err)=>{
                reject(err);
            })
        })
    }
}

module.exports = messageController;