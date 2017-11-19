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
        return new Promise((resolve, reject) => {
            SessionModel.findByIdAndUpdate(token, {
                socketId: socket.id,
                created_at: new Date()
            }).populate('user').then((sessionData) => {
                if (sessionData) {
                    resolve({
                        pseudo: sessionData.user.pseudo,
                        token: sessionData._id
                    });
                } else {
                    reject({msg: 'session_not_found'})
                }
            }).catch((err) => {
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