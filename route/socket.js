let User = require('../controller/userController');
let Session = require('../controller/sessionController');

class Socket {
    constructor(io) {
        this.io = io;
        this.init();
        this.users = {};
        setInterval(() => {
            try {
                for (let socketId in this.users) {
                    //console.log(this.users[socketId].data);
                    this.users[socketId].attempts = 0;
                }
            }
            catch (e) {

            }
        }, 5000)
    }

    addAttempt(socketId) {
        this.users[socketId].attempts++;
    }

    isNotSpam(socketId) {
        this.addAttempt(socketId);
        return this.users[socketId].attempts < 5;
    }



    login(socket, loginData) {
        this.io.emit();
        this.users[socket.id].data = loginData;
        socket.emit('sys_login', {msg: "login_success", type: "success", token: loginData.token});
    }

    logout(socket) {


        Session.logout(socket).then(() => {
            this.users[socket.id].data = null;
            socket.emit('sys_login', {msg: "logout_success", type: "success"});
        }).catch(() => {
            socket.emit('sys_login', {msg: "logout_error", type: "error"})
        });


    }

    init() {
        let sendSpamMessage = (sock) => {
            sock.emit('system', {msg: "spam"});
        };
        this.io.on('connection', (socket) => {
            "use strict";
            this.users[socket.id] = {
                attempts: 0,
            };
            socket.on('session_login', (data) => {
                if (this.isNotSpam(socket.id)) {
                    Session.connect(socket, data.token).then((loginData) => {
                        this.login(socket, loginData);
                    }).catch(() => {
                        socket.emit('sys_login', {msg: "login_fail", type: "error"});
                    });
                } else {
                    sendSpamMessage(socket);
                }
            });
            socket.on('join_chanel', (data) => {
                if (this.isNotSpam(socket.id)) {
                    socket.join(data.chanel);
                } else {
                    sendSpamMessage(socket);
                }
            });
            socket.on('leave_chanel', (data) => {
                if (this.isNotSpam(socket.id)) {
                    socket.leave(data.chanel);
                } else {
                    sendSpamMessage(socket);
                }
            });
            socket.on('chat_message', (data) => {

            });
            socket.on('logout', () => {
                this.logout(socket);
            });
            socket.on('disconnect', () => {
                delete this.users[socket.id];
            });
            socket.on('register', (data) => {
                if (this.isNotSpam(socket.id)) {
                    data.last_ip = socket.handshake.headers['x-forwarded-for'] || "noip";
                    User.register(data).then(() => {
                        socket.emit('sys_login', {msg: "register_success", type: "success"});
                    }).catch(() => {
                        socket.emit('sys_login', {msg: "register_fail", type: "error"});
                    });
                } else {
                    sendSpamMessage(socket);
                }
            });
            socket.on('login', (data) => {
                if (this.isNotSpam(socket.id)) {
                    User.login(socket, data).then((loginData) => {
                        this.login(socket, loginData);
                    }).catch(() => {
                        socket.emit('sys_login', {msg: "login_fail", type: "error"});
                    });
                } else {
                    sendSpamMessage(socket);
                }
            });
        });
    }
}

module.exports = Socket;