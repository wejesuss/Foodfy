const { unlinkSync } = require('fs')
const { randomBytes } = require('crypto')
const { hash } = require('bcryptjs')

const User = require('../models/users')
const RecipeFiles = require('../models/filesRecipes')

const loadPaginateService = require('../services/loadPaginateService')
const mailer = require('../../lib/mailer')

const email = (name, email, password) => `<h5>Sua senha chegou :)</h5>
<p>Aqui está sua senha do seu usuário foodfy, você pode alterá-la a qualquer momento!</p>
<p>
    Tome conta dela ${name}
    <br>
    Email:
    ${email}
    <br>
    Senha:
    <strong>${password}</strong>
</p>`

exports.index = async function(req, res) {
    const { users, pagination } = req.listUsers
    try {
        return res.render("admin/isAdmin/listUsers", { users, pagination })
    } catch (err) {
        console.error(err)
        return res.render("admin/isAdmin/listUsers", {
            error: "Erro inesperado, tente novamente!"
        })
    }
}

exports.registerForm = async function(req, res) {
    try {
        return res.render('admin/isAdmin/register')   
    } catch (err) {
        console.error(err)
        return res.redirect("/admin/users")
    }
}

exports.post = async function(req, res) {
    try {
        (!req.body.is_admin) ? req.body.is_admin = false : req.body.is_admin = true

        const password = randomBytes(8).toString("hex")
        req.body.password = await hash(password, 8)

        req.body.name = req.body.name.replace(/(')/g, "$1'")
        await User.create(req.body)
        await mailer.sendMail({
            from: 'no-reply@foodfy.com',
            to: req.body.email,
            subject: 'Senha usuario Foodfy',
            html: email(req.body.name, req.body.email, password)
        })

        return res.render("messages/success", {
            success: "Usuário cadastrado com sucesso!"
        }) 
    } catch (err) {
        console.error(err)
        return res.render("messages/error", {
            error: "Erro inesperado, tente novamente!"
        })
    }    
}

exports.show = async function(req, res) {
    const { user } = req
    try {
        return res.render("admin/isAdmin/user", { 
            user
        })
    } catch (err) {
        console.error(err)
        return res.render("messages/error", { 
            error: "Desculpe! Algum erro ocorreu!"
        })
    }
}

exports.put = async function(req, res) {
    const { user } = req
    try {
        let { id, name, email, is_admin } = req.body
        name = name.replace(/(')/g, "$1'")
        await User.update(id, {
            name,
            email,
            is_admin
        })

        const {users, pagination} = await loadPaginateService.load('Users', 1, 6)
        return res.render("admin/isAdmin/listUsers", {
            users,
            pagination,
            success: "Usuário atualizado com sucesso!"
        })
    } catch (err) {
        console.error(err)
        return res.render("admin/isAdmin/user", {
            user,
            error: "Algum erro aconteceu!"
        })
    }
}

exports.delete = async function(req, res) {
    const { users, pagination } = req.listUsers
    try {
        const results = await User.delete(req.body.id)

        results.map(result => {
            result.map(async file => {
                try {
                    await RecipeFiles.delete(file.id)
                    unlinkSync(file.path)
                } catch (err) {
                    console.error(err)
                }
            })
        })

        return res.render("messages/success", {
            success: "Conta deletada com sucesso!"
        })
    } catch (err) {
        console.error(err)
        return res.render("admin/isAdmin/listUsers", {
            users,
            pagination,
            error: "Erro ao deletar essa conta!"
        })
    }
}