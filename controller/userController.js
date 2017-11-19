let userModel = require('../model/userModel');
let Session = require('../controller/sessionController');
let Profile = require('../controller/profileController');
let crypto = require('crypto');
class userController {

    static filterRemove(level, rational) {

    }

    static filterShow(rational, group) {
        if(rational === "owner" ){
            return {}
        }
    }
    static filterCreate(data, level) {
        return level > 1 ? data : {
            pseudo: data.pseudo,
            email: data.email,
            password: data.password,
            last_ip: data.last_ip,
            profile: data.profile,
        }
    }
    static filterUpdate(data, level, rational, group) {
        return level > 1 || rational === "owner" ? data : {
            email: data.email,
            password: data.password,
            last_ip: data.last_ip,
        }
    }
    static crypt(data) {
        return crypto.createHmac('sha256', data)
            .update(process.env.SECRET || 'hmcdo')
            .digest('hex');
    }
    static register(data) {
        return new Promise((resolve, reject) => {

            Profile.create().then((profileDoc)=>{
                data.password = this.crypt(data.password);
                data.profile = profileDoc._id;
                let user = new userModel(this.filterCreate(data, 1));
                return user.save().then((doc)=>{
                    resolve(doc);
                }).catch((err)=>{
                    Profile.delete(profileDoc._id);
                    reject(err);
                });
            }).catch((err)=>{
                reject(err);
            });
        });
    }

    static login(socket,data) {
        return new Promise((resolve, reject) => {
            if(data.pseudo.length < 4){
                reject({msg: "pseudo_not_good"});
            }else{
                data.last_ip = socket.handshake.headers['x-forwarded-for'] || "noip";
                userModel.findOneAndUpdate({
                    pseudo: data.pseudo,
                    password: this.crypt(data.password)
                },{
                    last_connection: new Date(),
                }).then((userData) => {
                    if (userData) {
                        let pseudo = userData.pseudo;
                        Session.write(socket,userData).then((sessionData) => {
                            resolve({
                                pseudo : pseudo,
                                token: sessionData.token
                            });
                        }).catch(()=>{
                            reject({msg: "error_on_create_session"})
                        });
                    } else {
                        reject({msg: "not_found"});
                    }
                })
            }
        })
    }
}

module.exports = userController;