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
        if (this.users[socketId].attempts > 20) this.io.sockets.connected[socketId].disconnect();
    }

    isNotSpam(socketId) {
        this.addAttempt(socketId);
        return this.users[socketId].attempts < 5;
    }


    login(socket, loginData) {
        for (let u in this.users) {
            if (this.users[u].data && this.users[u].data.userId.equals(loginData.userId)) {
                this.users[u].data = null;
                this.io.sockets.connected[u].emit('sys_login', {msg: "logout_success", type: "success"});
            }
        }
        this.users[socket.id].data = loginData;
        socket.emit('sys_login', {msg: "login_success", type: "success", token: loginData.token});
    }

    logout(socketId) {
        Session.logout(socketId).then(() => {
            this.users[socketId].data = null;
            this.io.sockets.connected[socketId].emit('sys_login', {msg: "logout_success", type: "success"});
        }).catch(() => {
            this.io.sockets.connected[socketId].emit('sys_login', {msg: "logout_error", type: "error"})
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
            Message.getLastest('default').then((docs) => {
                let messages = [];
                for (let doc of docs) {
                    let m = Message.buildForClient(doc.user.profile, doc.text, doc.created_at);
                    messages.push(m)
                }
                socket.emit('chat_history', {
                    channel: 'default',
                    messages: messages
                });
            }).catch(() => {

            });

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
                    this.users[socket.id].channels.pushUnique(data.channel);

                } else {
                    sendSpamMessage(socket);
                }
            });
            socket.on('leave_channel', (data) => {
                if (this.isNotSpam(socket.id)) {
                    socket.leave(data.channel);
                    this.users[socket.id].channels.deleteOne(data.channel);
                } else {
                    sendSpamMessage(socket);
                }
            });
            socket.on('chat_message', (data) => {
                // getProfile and make message
                let profileId = (this.users[socket.id].data) ? this.users[socket.id].data.profileId : null;
                if (profileId) {
                    Profile.getOne(profileId).then((profileData) => {
                        let today = new Date();
                        if (data.channel === "default") {
                            Message.create(this.users[socket.id].data.userId, data);
                        }
                        let msg = Message.buildForClient(profileData, data.text, today);
                        this.io.emit('chanel_message', {
                            message: msg,
                            channel: data.channel
                        });
                    });
                } else {
                    socket.emit('sys_login', {msg: "login_fail", type: "error"});
                }
            });
            socket.on('private_message', (data) => {
                //search username online and send socket
                //socket.to(socketId)
            });
            socket.on('logout', () => {
                this.logout(socket.id);
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