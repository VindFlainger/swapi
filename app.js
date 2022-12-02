const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path')
const ReqError = require("./modules/ReqError");
require('dotenv').config()

const user = require('./routes/user/index')
const spec = require('./routes/spec/index')
const any = require('./routes/any/index')


const specialists = require("./routes/specialists");
const filters = require("./routes/filters");
const registration = require("./routes/registration")
const auth = require("./routes/auth")
const check = require("./routes/check")
const data = require("./routes/data")
const upload = require("./routes/upload")
const socket = require('./sockets/index')


const app = express();





app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

/*app.use(function (req, res, next) {
    console.log('%s %s %s', req.method, req.url, req.path)
    next()
})*/

app.use('/user', user)
app.use('/spec', spec)
app.use('/any', any)

app.use('/specialists', specialists)
app.use('/filters', filters)
app.use('/registration', registration)
app.use('/auth', auth)
app.use('/check', check)
app.use('/data', data)
app.use('/upload', upload)





app.use(function (req, res, next) {
    next(new ReqError(2, 'this request does not exist'));
})

app.use((err, req, res, next) => {
    if (err instanceof ReqError) {
        res.status(err.status).json({
            message: err.message,
            code: err.code
        })
    } else {
        res.status(500).json({
            message: err.message,
            code: 0
        })
    }
})

const server = app.listen(process.env.PORT)
socket.listen(server)



module.exports = app;











