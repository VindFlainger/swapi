const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path')
require('dotenv').config()
const upload = require('./uploader/multer_upload')

const user = require('./routes/user/index')
const spec = require('./routes/spec/index')

const Img = require('./db/Img')
const app = express();


app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use('/user', user)
app.use('/spec', spec)


app.post('/upload', upload.single('avatar'), (req, res) => {
    Img.create({file: req.file.filename ,name: req.file.originalname})
        .then((fb)=>{
            res.json({filename: req.file.originalname, id: fb._id})
        })
})

app.get('/load', upload.single('avatar'), (req, res) => {
    Img.findOne({_id: req.query.id})
        .then((data)=>{
            console.log(data)
            res.json({path: `/static/documents/${data.file}`})
        })
})


app.use(function (req, res, next) {
    next(createError(404));
});

app.use((err, req, res, next) => {
    res.json({error: err.message})
})


app.listen(process.env.PORT)


module.exports = app;
















/*
User.insertMany([
    {
        id: 200000004,
        name: 'Шизик',
        surname: 'Шизикович',
        number: '37544545886',
        email: 'girzhon1970@gmail.com',
        birth: new Date('2000-02-23').getTime(),
        sex: 'male',
        role: 'spec',
        avatar: 'firstava.png',
        about: 'Фрик',
        registration: {
            email: 'girzhon1970@gmail.com',
            password: 'qwerty',
        },
        qualification: {
            education: [{
                institution: 'Шизофреническая лебечница №9',
                graduation: Date.now() + 1000000,
                documents: [
                    {
                        img: 'universaldoc.png',
                        name: 'Универсальный сертификат'
                    }
                ]
            }
            ],
            category: {
                name: 'Ведущий псих',
                documents: [
                    {
                        img: 'universaldoc.png',
                        name: 'Универсальный сертификат'
                    }
                ]
            }
            ,
            experience: 15
        },
        confirmation: [{
            name: 'Диплом почетного психа',
            img: 'firstphoto.png',
            date: Date.now(),
            documents: [
                {
                    img: 'firstphoto.png',
                    name: 'Сертификат дол***ба'
                }
            ]
        }],
        events: [
            {
                name: 'Побег из палаты',
                img: 'secondphoto.png',
                date: Date.now()
            }
        ],

        specialization: [
            {
                name: 'Десткая психология',
                id: 12
            }
        ]
    }


])*/
