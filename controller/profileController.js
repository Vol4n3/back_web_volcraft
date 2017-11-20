let profileModel = require('../model/profileModel');

class profileController {
    static create(pseudo) {
        return new Promise((resolve, reject) => {
            let profile = new profileModel({pseudo : pseudo});
            profile.save().then((doc) => {
                resolve(doc);
            }).catch((err) => {
                reject(err);
            })
        });
    }

    static remove(id) {
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