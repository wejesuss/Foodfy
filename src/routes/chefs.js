const express = require('express')
const routes = express.Router()

const multer = require('../app/middlewares/multer')
const { adminOnly } = require("../app/middlewares/session")

const chefs = require("../app/controllers/chefs")

const chefValidator = require("../app/validators/chefs")

routes.get('/', chefs.index)
routes.get('/create', adminOnly, chefs.create)
routes.get('/:id', chefValidator.show, chefs.show)
routes.get('/:id/edit', adminOnly, chefs.edit)

routes.post('/', adminOnly, multer.single('photos'), chefValidator.post, chefs.post)
routes.put('/', adminOnly, multer.single('photos'), chefValidator.put, chefs.put)
routes.delete('/', adminOnly, chefValidator.chefDelete, chefs.delete)

module.exports = routes