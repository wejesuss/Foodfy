const Recipes = require('../models/recipes')
const RecipeFiles = require('../models/filesRecipes')
const Chefs = require('../models/chefs')
const ChefFiles = require('../models/filesChefs')
const loadPaginateService = require('../services/loadPaginateService')

const { addSrcToFilesArray } = require('../../lib/utils')

const searchForm = true

exports.index = async function(req, res) {
    const home = {
        title:"As melhores receitas",
        presentation:"Aprenda a construir os melhores pratos com receitas criadas por profissionais do mundo inteiro.",
        chef_url:'/images/layouts/assets/chef.png'        
    }
    try {
        const limit = 6
        let { files, recipes } = await loadPaginateService.load('Recipes', 1, limit)
    
        return res.render("guest/home", { home, recipes, files, searchForm })   
    } catch (err) {
        console.error(err)
        return res.render("guest/home", {
            home,
            error: "Erro inesperado, tente novamente!"
        })
    }
}

exports.list = async function(req, res) {
    let { filter, page, limit } = req.query
    try {
        page = page || 1
        limit = limit || 3
        
        let { error, recipes, pagination, files } = await loadPaginateService.load('Recipes', page, limit, filter)
        if(error) return res.render("guest/recipes", { error, searchForm })
        
        return res.render("guest/recipes", { recipes, filter, pagination, files, searchForm})   
    } catch (err) {
        console.error(err)
        return res.render("guest/recipes", {
            searchForm,
            filter,
            error: "Erro inesperado, tente novamente!"
        })
    }
}

exports.show = async function(req, res) {
    const { id } = req.params
    try {
        let { recipes, files } = await loadPaginateService.load('Recipes', 1, 6)
        
        const recipe = await Recipes.find({ where: {id} })
        if(!recipe) return res.render("guest/recipes", {
            recipes,
            files,
            pagination: {},
            error: "Receita não encontrada!",
            searchForm
        })
    
        let recipeFiles = await RecipeFiles.findAll({ where: {recipe_id: recipe.id} })
        recipeFiles = addSrcToFilesArray(recipeFiles)
    
        return res.render("guest/recipe", { recipe, files: recipeFiles, searchForm })
    } catch (err) {
        console.error(err)
        return res.render("guest/recipe", {
            error: "Erro inesperado, tente novamente!"
        })
    }
}

exports.showChef = async function(req, res) {
    const { id } = req.params
    try {
        const { error, listChefs, chef } = req

        if (error) return res.render("guest/chefs", {
            chefs: listChefs.chefs,
            pagination: listChefs.pagination,
            error: error.message
        })

        const recipes = await Chefs.selectRecipesById(id)
        
        const searchFilesPromise = recipes.map(recipe => ChefFiles.findRecipesFiles(recipe.id))
        let files = await Promise.all(searchFilesPromise)
        files = await addSrcToFilesArray(files)
    
        return res.render('guest/chef', { chef, recipes, files })   
    } catch (err) {
        console.error(err)
        return res.render("guest/chefs", {
            error: "Erro inesperado, tente novamente!"
        })
    }
}

exports.listChefs = async function(req, res) {
    let { chefs, pagination } = req.loadChefs
    try {
        if(!chefs[0]) return res.render("guest/chefs", { error: "Chefes não encontrados!"})

        return res.render('guest/chefs', { 
            chefs, 
            pagination
        })
    } catch (err) {
        console.error(err)
        return res.render("guest/chefs", {
            chefs,
            pagination,
            error: "Erro inesperado, tente novamente!"
        })
    }
}