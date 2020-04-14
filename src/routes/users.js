const express = require('express')
const routes = express.Router()

const users = require("../app/controllers/users")

const userValidator = require("../app/validators/users")
const { adminOnly } = require("../app/middlewares/session")

routes.get('/', adminOnly, userValidator.index, users.index)
routes.get('/register', adminOnly, users.registerForm)
routes.get('/edit/:id', adminOnly, userValidator.show, users.show)

routes.post('/', adminOnly, userValidator.post, users.post)
routes.put('/', adminOnly, userValidator.put, users.put)
routes.delete('/', adminOnly, userValidator.userDelete, users.delete)

module.exports = routes