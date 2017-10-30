let userModel = require('../model/userModel');

class userController {
    static register(data) {
        return new Promise((resolve, reject) => {
            userModel.register(data, 1).then((doc) => {
                resolve({pseudo: doc.pseudo});
            }, (err) => {
                if (err.code === 11000) {
                    reject({msg: err.errmsg});
                }
            });
        });
    }

    static login(data) {
        return new Promise((resolve, reject) => {
            userModel.login(data).then((doc) => {
                resolve({pseudo: doc.pseudo});
            }, (err) => {
                if (err.code === 11000) {
                    reject({msg: err.errmsg});
                }
            })
        });
    }
}

module.exports = userController;