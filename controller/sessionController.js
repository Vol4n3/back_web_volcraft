let SessionModel = require('../model/sessionModel');

class SessionController {
    static write(socket, userData) {
        return new Promise((resolve, reject) => {
            SessionModel.findOneAndRemove({
                user : userData._id
            }).then(()=>{
                let session = new SessionModel({
                    socketId: socket.id,
                    user: userData._id
                });
                session.save().then((sessionData) => {
                    resolve({
                        token: sessionData._id
                    });
                }).catch(() => {
                    reject({
                        msg: "cant_write_session"
                    })
                });
            });
        });
    }

    static connect(socket, token) {
        let today = new Date();
        let yesterday = new Date().setDate(today.getDate() - 1);
        return new Promise((resolve, reject) => {

            SessionModel.findOneAndUpdate({
                _id : token,
                created_at : {
                    $gte: yesterday,
                    $lt: today
                }
            }, {
                socketId: socket.id,
                created_at: new Date()
            }).populate( 'user').then((sessionData) => {
                if (sessionData) {
                    resolve({
                        userId : sessionData.user._id,
                        profileId : sessionData.user.profile,
                        pseudo: sessionData.user.pseudo,
                        token: sessionData._id
                    });
                } else {
                    reject({msg: 'session_not_found'})
                }
            }).catch(() => {
                reject({msg: 'session_error'})
            })

        });
    }

    static logout(socket) {
        return new Promise((resolve, reject) => {
            SessionModel.findOneAndRemove({
                socketId: socket.id
            }).then((doc) => {
                if(doc){
                    resolve();
                }else{
                    reject();
                }
            }).catch(() => {
                reject();
            });
        });

    }
}

module.exports = SessionController;