const { compare } = require('bcryptjs')

const User = require('../models/users')

async function validateLogin(req, res, next) {
    let { email, password } = req.body
    try {
        const user = await User.findOne({ where: {email} })

        if(!user) return res.render("session/login", {
            user: req.body,
            error: "Usuário não cadastrado!"
        })
    
        const passed = await compare(password, user.password)
    
        if(!passed) return res.render("session/login", {
            user: req.body,
            error: "Senha incorreta."
        })
    
        req.user = user
    
        next()   
    } catch (err) {
        console.error(err)
        return res.render("session/login", {
            user: req.body,
            error: "Erro inesperado, tente novamente!"
        })
    }
}

async function validateForgot(req, res, next) {
    const { email } = req.body
    try {
        const user = await User.findOne({ where: {email} })
        
        if(!user) return res.render("session/forgot-password", {
            user: req.body,
            error: "Email não cadastrado!"
        })

        let now = new Date()
        let expires = Number(user.reset_token_expires)
        let resetExpires = new Date(expires)
        
        if((user.reset_token_expires != null || user.reset_token_expires != '') && 
        now.getDay() == resetExpires.getDay() && now.getHours() < resetExpires.getHours()) {
            return res.render("session/forgot-password", {
                user: req.body,
                error: "Você tentou recuperar sua senha há pouco tempo!"
            })
        }

        req.user = user
        
        next()
    } catch (err) {
        console.error(err)
        return res.render("session/forgot-password", {
            user: req.body,
            error: "Erro inesperado, tente novamente!"
        })
    }
}

async function validateReset(req, res, next) {
    const { token, email, password, passwordRepeat } = req.body
    try {
        const user = await User.findOne({ where: {email} })

        if(!user) return res.render("session/password-reset", {
            user: req.body,
            token,
            error: "Email não cadastrado!"
        })

        if (password != passwordRepeat) return res.render("session/password-reset", {
            user: req.body,
            token,
            error: "Senhas não coincidem."
        })

        if(!token || (token != user.reset_token)) return res.render("session/password-reset", {
            user: req.body,
            token,
            error: "Token inválido. Solicite um novo, ou tente novamente!"
        })

        const now = new Date()
        if(now.getTime() > user.reset_token_expires) return res.render("session/password-reset", {
            user: req.body,
            token,
            error: "Token expirado, solicite uma nova recuperação de senha!"
        })

        req.user = user
        
        next()
    } catch (err) {
        console.error(err)
        return res.render("session/forgot-password", {
            user: req.body,
            error: "Erro inesperado, tente novamente!"
        })
    }
}

module.exports = {
    validateLogin,
    validateForgot,
    validateReset
}