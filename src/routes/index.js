const express = require('express')
const routes = express.Router()
const admin = require('./admin')
const home = require('./home')

const session = require("../app/controllers/session")

const { preventRepeatedLogin, registeredUsersOnly } = require("../app/middlewares/session")
const { validateLogin, validateForgot, validateReset } = require("../app/validators/session")

routes.use("/", home)

routes.get('/users/login', preventRepeatedLogin, session.loginForm)
routes.post('/users/login', validateLogin, session.login)
routes.post('/users/logout', session.logout)

routes.use("/admin", registeredUsersOnly, admin)

routes.get('/users/forgot-password', session.forgotForm)
routes.post('/users/forgot-password', validateForgot, session.forgot)
routes.get('/users/password-reset', session.resetForm)
routes.post('/users/password-reset', validateReset, session.reset)


routes.get('/users', function (req, res) {
    return res.redirect('/users/login')
})

routes.get('/admin', function (req, res) {
    return res.redirect('/admin/recipes')
})

module.exports = routes