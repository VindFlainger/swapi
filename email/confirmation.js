const transporter = require('./transporter')


exports.sendEmailAuth = (email, token) => {
    return transporter.sendMail({
        to: email,
        subject: 'Подтверждение регистрации',
        text: `http://${process.env.HOST}/registration?token=${token}`
    })
}

exports.sendTempPassword = (email, password) => {
    return transporter.sendMail({
        to: email,
        subject: 'Восстановление пароля',
        text: `Ваш временный пароль ${password}`
    })
}




