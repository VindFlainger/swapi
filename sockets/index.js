const User = require("../db/User");
const {Server} = require('socket.io')
const Message = require('../db/Message')
const {idValidator} = require("../utils/customValidators");


const io = new Server()
const users = new Map()


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

io.users = users


io.on("connection", (socket) => {
    users.set(socket.request.user_id, socket.id)

   socket.on('disconnect', ()=>{
       users.delete(socket.request.user_id)
   })

    socket.on('message:add', (userId, text, callback) => {
        if (idValidator(userId)) {
            Message.sendMessage(socket.request.user_id, userId, text)
                .then(data => {
                    callback(data)
                    if (users.get(userId)) {
                        io.sockets.to(users.get(userId)).emit('message:new', data)
                    }
                })
        }
    })

    socket.on('message:read', (userId, offset) => {
        Message.setReadOffset(socket.request.user_id, userId, offset)
            .then(() => {
                if (users.get(userId)) {
                    io.sockets.to(users.get(userId)).emit('message:viewed', socket.request.user_id, offset)
                }
            })
    })
});




module.exports = io