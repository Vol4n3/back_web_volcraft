let profileModel = require('../model/profileModel');

class profileController {
    static create() {
        return new Promise((resolve, reject) => {
            let profile = new profileModel({});
            profile.save().then((doc) => {
                resolve(doc);
            }).catch((err) => {
                reject(err);
            })
        });
    }

    static delete(id) {
        return new Promise((resolve, reject) => {
            profileModel.findByIdAndRemove(id).then((doc) => {
                resolve(doc);
            }).catch((err) => {
                reject(err);
            })
        })
    }
}

module.exports = profileController;