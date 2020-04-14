const express = require('express')
const routes = express.Router()

const multer = require('../app/middlewares/multer')
const { ownersAndAdminOnly } = require("../app/middlewares/session")

const recipes = require("../app/controllers/recipes")

const recipeValidator = require("../app/validators/recipes")

routes.get('/', recipeValidator.index, recipes.index)
routes.get('/create', recipes.create)
routes.get('/:id', recipes.show)
routes.get('/:id/edit', ownersAndAdminOnly, recipes.edit)

routes.post('/', multer.array('photos', 5), recipeValidator.post, recipes.post)
routes.put('/', multer.array('photos', 5), ownersAndAdminOnly, recipeValidator.put, recipes.put)
routes.delete('/', ownersAndAdminOnly, recipes.delete)

module.exports = routes