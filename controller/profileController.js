let profileModel = require('../model/profileModel');

class exampleController {
    static create() {
        return new Promise((resolve, reject) => {
            profileModel.create().then((doc) => {
                resolve(doc);
            }).catch((err) => {
                reject(err);
            })
        });
    }
}

module.exports = exampleController;