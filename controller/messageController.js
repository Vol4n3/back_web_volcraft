let messageModel = require('../model/messageModel')
class messageController {
    static getLast(){
        return Promise((resolve,reject)=>{
            messageModel.get().then(function (doc) {
                
            })
        })
    }
}
module.exports = messageController;