let User = require('../controller/userController');

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
        socket.emit('system', {msg: "login_success", type: "success"});
        this.io.emit()
    }

    init() {
        this.io.on('connection', (socket) => {
            "use strict";
            let session = socket.handshake.session;
            if (session.user && session.user.pseudo) this.login(socket, session.user.pseudo);
            socket.on('chat_message', (data) => {

            });
            socket.on('register', (data) => {
                data.last_ip = socket.handshake.headers['x-forwarded-for'] || "noip";
                let reg = User.register(data);
                reg.then((doc) => {
                    this.login(socket, doc.pseudo);
                });
                reg.catch((err) => {
                    socket.emit('system', {msg: "register_fail", type: "error"});
                });
            });
            socket.on('login', (data) => {
                data.last_ip = socket.handshake.headers['x-forwarded-for'] || "noip";
                let log = User.login(data)
                log.then((doc) => {
                    if (doc) {
                        this.login(socket, doc.pseudo);
                    } else {
                        socket.emit('system', {msg: "login_fail", type: "error"});
                    }
                });
                log.catch((err) => {
                    socket.emit('system', {msg: "login_fail", type: "error"});
                });

            })
        });
    }
}

module.exports = Socket;