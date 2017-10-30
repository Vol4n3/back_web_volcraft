let User = require('../model/userModel');

class Socket {
    constructor(io) {
        this.io = io;
        this.init();
        this.users = {};
    }

    login(socket, pseudo) {
        let session = socket.handshake.session;
        session.user = {
            pseudo: pseudo,
            socketId: socket.id
        };
        this.users[socket.id] = {
            pseudo: pseudo
        };
        socket.emit('system', {msg: "login_success",type:"success"});
        this.io.emit()
    }

    init() {
        this.io.on('connection', function (socket) {
            "use strict";
            let session = socket.handshake.session;
            if (session.user.pseudo) this.login(socket, session.user.pseudo);
            socket.on('chat_message', (data) => {

            });
            socket.on('login', (data) => {
                data.last_ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address;
                User.login(data).then((doc) => {
                    if (doc) {
                        this.login(socket,doc.pseudo);
                    } else {
                        socket.emit('system', {msg: "login_fail",type:"error"});
                        User.register(data).then((doc) => {
                            this.login(socket,doc.pseudo);
                        }, (err) => {
                            socket.emit('system',{msg: "register_fail",type:"error"});
                        });
                    }
                }, (err) => {
                    socket.emit('system',{msg: "login_fail",type:"error"});
                });

            })
        });
    }
}

module.exports = Socket;