"use strict";
let User = require('../controller/userController');
let Profile = require('../controller/profileController');
let Session = require('../controller/sessionController');
let Message = require('../controller/messageController');

class Socket {
    constructor(io) {
        this.io = io;
        this.init();
        this.users = {};
        setInterval(() => {
            //try catch if user was deleted on ticks
            try {
                for (let socketId in this.users) {
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
            this.users[socket.id] = {
                attempts: 0,
                channels: ['default']
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
            socket.on('join_channel', (data) => {
                if (this.isNotSpam(socket.id)) {
                    socket.join(data.channel);
                    this.users[socket.id].channels.push(data.channel);

                } else {
                    sendSpamMessage(socket);
                }
            });
            socket.on('leave_channel', (data) => {
                if (this.isNotSpam(socket.id)) {
                    socket.leave(data.channel);
                    this.users[socket.id].channels.push(data.channel);
                    let i = this.users[socket.id].channels.indexOf(data.channel);
                    if (i !== -1) this.users[socket.id].channels.splice(i, 1);
                } else {
                    sendSpamMessage(socket);
                }
            });
            socket.on('chat_message', (data) => {
                // getProfile and make message

                if (data.channel === "default") {
                    Message.create(this.users[socket.id].userId, data);
                }
                let msg = Message.makeClientFormat(profile,data.text);
                this.io.emit('chanel_message',{
                    msg : msg,
                    channel : data.channel
                });
            });
            socket.on('private_message', (data) => {
                //search username online and send socket
                //socket.to(socketId)
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