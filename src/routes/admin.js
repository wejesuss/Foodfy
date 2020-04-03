const express = require('express')
const routes = express.Router()
const multer = require('../app/middlewares/multer')

const recipes = require("../app/controllers/recipes")
const chefs = require("../app/controllers/chefs")
const users = require("../app/controllers/users")
const profile = require("../app/controllers/profile")

const recipeValidator = require("../app/validators/recipes")
const chefValidator = require("../app/validators/chefs")
const userValidator = require("../app/validators/users")
const profileValidator = require("../app/validators/profile")
const { ownersAndAdminOnly, adminOnly } = require("../app/middlewares/session")

routes.get('/profile', profileValidator.show, profile.show)
routes.put('/profile', profileValidator.put, profile.put)
routes.get('/recipes/dashboard', profileValidator.myRecipes, profile.myRecipes)

routes.get('/recipes', recipeValidator.index, recipes.index)
routes.get('/recipes/create', recipes.create)
routes.get('/recipes/:id', recipes.show)
routes.get('/recipes/:id/edit', ownersAndAdminOnly, recipes.edit)

routes.post('/recipes', multer.array('photos', 5), recipeValidator.post, recipes.post)
routes.put('/recipes', multer.array('photos', 5), ownersAndAdminOnly, recipeValidator.put, recipes.put)
routes.delete('/recipes', ownersAndAdminOnly, recipes.delete)

routes.get('/chefs', chefs.index)
routes.get('/chefs/create', adminOnly, chefs.create)
routes.get('/chefs/:id', chefValidator.show, chefs.show)
routes.get('/chefs/:id/edit', adminOnly, chefs.edit)

routes.post('/chefs', adminOnly, multer.single('photos'), chefValidator.post, chefs.post)
routes.put('/chefs', adminOnly, multer.single('photos'), chefValidator.put, chefs.put)
routes.delete('/chefs', adminOnly, chefValidator.chefDelete, chefs.delete)

routes.get('/users', adminOnly, userValidator.index, users.index)
routes.get('/users/register', adminOnly, users.registerForm)
routes.get('/users/edit/:id', adminOnly, userValidator.show, users.show)

routes.post('/users', adminOnly, userValidator.post, users.post)
routes.put('/users', adminOnly, userValidator.put, users.put) 
routes.delete('/users', adminOnly, userValidator.userDelete, users.delete)

module.exports = routes