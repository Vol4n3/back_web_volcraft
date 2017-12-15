"use strict";
let User = require('../controller/userController');
let Profile = require('../controller/profileController');
let Session = require('../controller/sessionController');
let Message = require('../controller/messageController');
let http = require('http');

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

    getSocketIdByProfile(profileId) {
        for (let socketId in this.users) {
            if (this.users[socketId].data) {
                if (this.users[socketId].data.profileId.equals(profileId)) {
                    return socketId;
                }
            }
        }
        return null;
    }

    addAttempt(socketId) {
        this.users[socketId].attempts++;
        if (this.users[socketId].attempts > 20) this.io.sockets.connected[socketId].disconnect();
    }

    buildMessage(socket, data, profileData) {
        let msg;
        let analyseText = Message.analyse(data.text);
        switch (analyseText.type) {
            case 'private_message':
                // todo: WIP
                Profile.findByPseudo(analyseText.data).then((doc) => {
                    const target = this.getSocketIdByProfile(doc._id);
                    if (target) {
                        msg = Message.buildForClient(profileData, analyseText.text, new Date());
                        this.io.to(target).emit('private_message', {
                            from: profileData.pseudo,
                            message: msg
                        });
                        socket.emit('private_message', {
                            from: doc.pseudo,
                            message: msg
                        })
                    } else {

                    }
                }).catch(() => {
                    //non trouvable
                });
                break;
            case 'command_random_gif':
                break;
            case 'command_url':
                break;
            default:
                if (data.channel === "default") {
                    Message.create(this.users[socket.id].data.userId, data);
                }
                msg = Message.buildForClient(profileData, data.text, new Date());
                this.io.in(data.channel).emit('chanel_message', {
                    message: msg,
                    channel: data.channel
                });
                break;
        }
    }

    isNotSpam(socketId) {
        this.addAttempt(socketId);
        return this.users[socketId].attempts < 5;
    }

    sendConnected() {
        setTimeout(() => {
            let connected = [];
            for (let socketId in this.users) {
                if (this.users[socketId].data) {
                    connected.push({
                        profile: this.users[socketId].data.profileId,
                        pseudo: this.users[socketId].data.pseudo
                    })
                }
            }
            this.io.emit('connected', connected);
        }, 1000);
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
        this.sendConnected();
    }

    logout(socketId) {
        Session.logout(socketId).then(() => {
            this.users[socketId].data = null;
            this.io.sockets.connected[socketId].emit('sys_login', {msg: "logout_success", type: "success"});
        }).catch(() => {
            this.io.sockets.connected[socketId].emit('sys_login', {msg: "logout_error", type: "error"})
        });
        this.sendConnected();
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
            socket.join('default');
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
                    Session.connect(data.token, socket).then((loginData) => {
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
                if (this.isNotSpam(socket.id)) {
                    // getProfile and make message
                    let profileId = (this.users[socket.id].data) ? this.users[socket.id].data.profileId : null;
                    if (profileId) {
                        Profile.getOne(profileId).then((profileData) => {
                            this.buildMessage(socket, data, profileData);
                        }).catch((err) => {
                            //console.log(err);
                        });
                    } else {
                        let now = new Date();
                        socket.emit('sys_chat', {msg: "not_logged", type: "error", date: now.toISOString()});
                    }
                } else {
                    sendSpamMessage(socket);
                }
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