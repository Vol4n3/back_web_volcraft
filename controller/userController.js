let userModel = require('../model/userModel');
let Session = require('../controller/sessionController');
class userController {
    static register(data) {

        return new Promise((resolve, reject) => {
            userModel.register(data, 1)
                .then((doc) => {
                if(doc){
                    resolve({pseudo: doc.pseudo});
                }else{
                    reject({msg: 'bad_register'});
                }
                })
                .catch((err) => {
                    reject({msg: err});
                });
        });
    }

    static login(socket,data) {
        return new Promise((resolve, reject) => {
            data.last_ip = socket.handshake.headers['x-forwarded-for'] || "noip";
            userModel.login(data).then((userData) => {
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
        })
    }
}

module.exports = userController;