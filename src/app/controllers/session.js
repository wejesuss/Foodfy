const crypto = require('crypto')
const { hash } = require('bcryptjs')

const User = require("../models/users")

const mailer = require('../../lib/mailer')
const email = (token) => `<h2>Perdeu a senha?</h2>
<p>Não se preocupe, clique no link abaixo para recuperar sua senha.</p>
<br>
<br>
<p>
    <a href="http://localhost:5000/users/password-reset?token=${token}" target="_blank">
    RECUPERAR SENHA
    </a>
</p>
`

exports.loginForm = function(req, res) {
    try {
        return res.render("session/login")
    } catch (err) {
        console.error(err)
        return res.redirect("/")
    }
}

exports.login = async function(req, res) {
    try {
        req.session.userId = req.user.id
        const currentUser = await User.findOne({ where: {id: req.session.userId} })

        if(currentUser.is_admin == true)
            req.session.isAdmin = true
        
        return res.redirect("/admin/profile")
    } catch (err) {
        console.error(err)
    }
}

exports.logout = function(req, res) {
    try {
        req.session.destroy()
        return res.redirect("/users/login")
    } catch (err) {
        console.error(err)
    }
}

exports.forgotForm = function(req, res) {
    try {
        req.session.destroy()
        return res.render("session/forgot-password")
    } catch (err) {
        console.error(err)
        return res.render("session/forgot-password", {
            eror: "Erro inesperado, tente novamente!"
        })
    }
}

exports.forgot = async function(req, res) {
    const user = req.user
    try {
        const token = crypto.randomBytes(20).toString("hex")
        
        let expires = new Date()
        expires = expires.setHours(expires.getHours() + 1)

        await User.update(user.id, {
            reset_token: token,
            reset_token_expires: expires
        })
        
        mailer.sendMail({
            from: "no-reply@foodfy.com",
            to: user.email,
            subject: "Recuperação de senha",
            html: email(token)
        })

        return res.render("session/forgot-password", {
            success: "Verifique seu Email para prosseguir."
        })

    } catch (err) {
        console.error(err)
        return res.render("session/forgot-password", {
            user,
            error: "Erro inesperado, tente novamente!"
        })
    }
}

exports.resetForm = function(req, res) {
    try {
        req.session.destroy()
        return res.render("session/password-reset", { token: req.query.token })
    } catch (err) {
        console.error(err)
        return res.render("session/forgot-password", {
            eror: "Erro inesperado, tente novamente!"
        })
    }
}

exports.reset = async function(req, res) {
    const { user } = req
    const { password, token } = req.body
    try {
        const newPassword = await hash(password, 8)

        await User.update(user.id, {
            password: newPassword,
            reset_token: ''
        })

        return res.render("session/login", {
            user: req.body,
            success: "Senha atualizada com sucesso!"
        })
    } catch (err) {
        console.error(err)
        return res.render("session/password-reset", {
            user: req.body,
            token,
            error: "Erro inesperado, tente novamente!"
        })
    }
}