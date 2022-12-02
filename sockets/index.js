const User = require("../db/User");
const {Server} = require('socket.io')
const Message = require('../db/Message')
const {idValidator} = require("../modules/customValidators");


const io = new Server()
const sockets = new Map()


io.use((socket, next) => {
    if (!socket.handshake.auth.token || !socket.handshake.auth.email) return next(new Error('auth data required'))
    User.checkToken(socket.handshake.auth.email, socket.handshake.auth.token)
        .then(data => {
            if (!data) return next(new Error('invalid long-live token'))
            socket.request.role = data.role
            socket.request.user_id = data._id.toString()
            next()
        })
        .catch(err => {
            next(err)
        })
})


io.on("connection", (socket) => {
    sockets.set(socket.request.user_id, socket.id)

   socket.on('disconnect', ()=>{
       sockets.delete(socket.request.user_id)
   })

    socket.on('message:add', (userId, text, callback) => {
        if (idValidator(userId)) {
            Message.sendMessage(socket.request.user_id, userId, text)
                .then(data => {
                    callback(data)
                    if (sockets.get(userId)) {
                        io.sockets.to(sockets.get(userId)).emit('message:new', data)
                    }
                })
        }
    })

    socket.on('message:read', (userId, offset) => {
        Message.setReadOffset(socket.request.user_id, userId, offset)
            .then(() => {
                if (sockets.get(userId)) {
                    io.sockets.to(sockets.get(userId)).emit('message:viewed', socket.request.user_id, offset)
                }
            })
    })
});




module.exports = io