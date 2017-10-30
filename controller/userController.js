let userModel = require('../model/userModel');

class userController {
    static register(data) {

        return new Promise((resolve, reject) => {
            userModel.register(data, 1).then((doc) => {
                resolve({pseudo: doc.pseudo});
            }, (err) => {
                    reject({msg: err});
            });
        });
    }

    static login(data) {
        return new Promise((resolve, reject) => {
            userModel.login(data).then((doc) => {
                if(doc){
                    resolve({pseudo: doc.pseudo});
                }else{
                    reject({msg: "not_found"});
                }
            }, (err) => {
                    reject({msg: err});
            })
        });
    }
}

module.exports = userController;