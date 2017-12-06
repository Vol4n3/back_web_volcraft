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

    static connect(token,socket) {
        let today = new Date();
        let yesterday = new Date().setDate(today.getDate() - 1);
        let updateData = {
            created_at: new Date()
        };
        if(socket) updateData['socketId'] = socket.id;
        return new Promise((resolve, reject) => {
            SessionModel.findOneAndUpdate({
                _id : token,
                created_at : {
                    $gte: yesterday,
                    $lt: today
                }
            }, updateData).populate( 'user').then((sessionData) => {
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

    static logout(socketId) {
        return new Promise((resolve, reject) => {
            SessionModel.findOneAndRemove({
                socketId: socketId
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