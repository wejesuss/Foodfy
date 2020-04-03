const express = require('express')
const routes = express.Router()

const guest = require("../app/controllers/guest")

const chefValidator = require("../app/validators/chefs")

routes.get('/', guest.index)
routes.get('/about', function(req, res) {
    return res.render("guest/about")
})
routes.get('/recipes', guest.list)
routes.get('/recipes/:id', guest.show)

routes.get('/chefs', chefValidator.listChefs, guest.listChefs)
routes.get('/chefs/:id', chefValidator.show, guest.showChef)

module.exports = routes