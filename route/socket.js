let User = require('../controller/userController');
let Session = require('../controller/sessionController');

class Socket {
    constructor(io) {
        this.io = io;
        this.init();
        this.users = {};
    }

    login(socket, loginData) {
        this.io.emit();
        this.users[socket.id] = {
            pseudo: loginData.pseudo
        };
        socket.emit('sys_login', {msg: "login_success", type: "success", token: loginData.token});
    }

    logout(socket) {
        Session.logout(socket).then(() => {
            delete this.users[socket.id];
            socket.emit('sys_login', {msg: "logout_success", type: "success"});
        }).catch(() => {
            socket.emit('sys_login', {msg: "logout_error", type: "error"})
        });
    }

    init() {
        this.io.on('connection', (socket) => {
            "use strict";

            socket.on('session_login', (data) => {
                Session.connect(socket, data.token).then((loginData) => {
                    this.login(socket,loginData);
                }).catch(() => {
                })
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
                data.last_ip = socket.handshake.headers['x-forwarded-for'] || "noip";
                User.register(data).then((doc) => {
                    socket.emit('sys_login', {msg: "register_success", type: "success"});
                }).catch((err) => {
                    socket.emit('sys_login', {msg: "register_fail", type: "error"});
                });
            });
            socket.on('login', (data) => {
                User.login(socket, data).then((loginData) => {
                    this.login(socket, loginData);
                }).catch((err) => {
                    socket.emit('sys_login', {msg: "login_fail", type: "error"});
                });
            })
        });
    }
}

module.exports = Socket;