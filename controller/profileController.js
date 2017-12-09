let profileModel = require('../model/profileModel');

class profileController {
    static create(pseudo) {
        return new Promise((resolve, reject) => {
            let profile = new profileModel({pseudo: pseudo});
            profile.save().then((doc) => {
                resolve(doc);
            }).catch((err) => {
                reject(err);
            })
        });
    }

    static update(id, data) {
        return new Promise((resolve, reject) => {
            if (data.birthday) {
                data.birthday = new Date(data.birthday);
            }
            profileModel.findByIdAndUpdate(id, data,{runValidators: true}).then((newProfile) => {
                resolve(newProfile);
            }).catch(() => {
                reject();
            });

        });
    }

    static getOne(id) {

        return new Promise((resolve, reject) => {
            profileModel.findById(id).then((doc) => {
                if (doc) {
                    let date;
                    if(doc.birthday){
                        date = doc.birthday.toISOString().slice(0, -14);
                    }
                    resolve({
                        _id: doc._id,
                        pseudo: doc.pseudo,
                        birthday: date,
                        description: doc.description,
                        image: doc.image,
                        group: doc.group,
                        motd: doc.motd,
                    });
                } else {
                    reject();
                }
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