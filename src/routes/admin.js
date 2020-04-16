const express = require('express')
const routes = express.Router()

const { adminOnly } = require("../app/middlewares/session")

const users = require('./users')
const chefs = require('./chefs')
const recipes = require("./recipes")

const profile = require("../app/controllers/profile")

const profileValidator = require("../app/validators/profile")

routes.get('/profile', profileValidator.show, profile.show)
routes.put('/profile', profileValidator.put, profile.put)
routes.get('/recipes/dashboard', profileValidator.myRecipes, profile.myRecipes)

routes.use('/recipes', recipes)
routes.use('/chefs', chefs)
routes.use('/users', adminOnly, users)

module.exports = routes