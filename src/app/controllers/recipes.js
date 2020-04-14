const Recipes = require('../models/recipes')
const RecipeFiles = require('../models/filesRecipes')

const loadPaginateService = require('../services/loadPaginateService')
const formatInformationService = require('../services/formatInformationService')
const deleteImageService = require('../services/deleteImageService')

const { addSrcToFilesArray } = require('../../lib/utils')

exports.index = async function(req, res) {
    let { recipes, files, pagination } = req.pageRecipes
    try {
        return res.render("admin/recipes/index", { 
            recipes, 
            pagination, 
            files 
        })
    } catch (err) {
        console.error(err)
        return res.redirect("/")
    }
}

exports.create = async function(req, res) {
    try {
        const options = await Recipes.recipeSelectOptions()

        let { recipes, files } = await loadPaginateService.load('Recipes', 1, 4)
        files = await addSrcToFilesArray(files)

        if(!options) return res.render("admin/recipes/index", {
            recipes,
            pagination: {},
            files,
            error: "Erro ao encontrar chefes!"
        })
    
        return res.render('admin/recipes/create', {chefs: options})
    } catch (err) {
        console.error(err)
        return res.redirect("/admin/recipes")
    }
}

exports.post = async function(req, res) {
    const { recipesForErrorPage } = req
    try {
        const filesPromise = req.files.map(file => RecipeFiles.create({ name: file.filename, path: file.path }))
        let filesIds = await Promise.all(filesPromise)
        filesIds = filesIds.sort()
    
        req.body.user_id = req.session.userId

        if(req.body.information)
            req.body.information = formatInformationService.load('toNewLineTag', req.body.information)
        req.body.title = req.body.title.replace(/(')/g, "$1'")

        const recipeId = await Recipes.create(req.body)       
        const recipeFilesPromise = filesIds.map(id => RecipeFiles.createRecipeFiles(recipeId, id))
        await Promise.all(recipeFilesPromise)
        
        let { recipes, pagination, files } = await loadPaginateService.load('Recipes', 1, 4)
    
        return res.render(`admin/recipes/index`, {
            recipes,
            pagination,
            files,
            success: "Receita criada com sucesso!"
        })
    } catch (err) {
        console.error(err)
        return res.render("admin/recipes/index", {
            recipes: recipesForErrorPage.recipes,
            pagination: recipesForErrorPage.pagination,
            files: recipesForErrorPage.files,
            error: "Erro ao criar receita! Tente novamente mais tarde."
        })
    }
}

exports.show = async function(req, res) {
    const { id } = req.params
    try {
        const recipe = await Recipes.find({ where: {id} })
        
        let { recipes, files } = await loadPaginateService.load('Recipes', 1, 4)
        if (!recipe) return res.render(`admin/recipes/index`, {
            recipes,
            pagination: {},
            files,
            error: "Receita não encontrada!"
        })
    
        files = await RecipeFiles.findAll({ where: {recipe_id: recipe.id} })
        files = await addSrcToFilesArray(files)
    
        return res.render("admin/recipes/recipe", {recipe, files})   
    } catch (err) {
        console.error(err)
    }
}

exports.edit = async function(req, res) {
    try {
        const { id } = req.params
        const recipe = await Recipes.find({ where: {id} })

        let { recipes, files } = await loadPaginateService.load('Recipes', 1, 4)
        if (!recipe) return res.render(`admin/recipes/index`, {
            recipes,
            pagination: {},
            files,
            error: "Receita não encontrada!"
        })
    
        const options = await Recipes.recipeSelectOptions()
        if(!options) return res.render("admin/recipes/index", {
            recipes,
            pagination: {},
            files,
            error: "Erro ao encontrar chefes!"
        })

        files = await RecipeFiles.findAll({ where: {recipe_id: recipe.id} })
        files = await addSrcToFilesArray(files)

        if(recipe.information)
            recipe.information = formatInformationService.load('toNewLineCharacter', recipe.information)
        
        return res.render('admin/recipes/edit', { recipe, chefs: options, files })   
    } catch (err) {
        console.error(err)
    }
}

exports.put = async function(req, res) {
    let { recipes, files, pagination } = await loadPaginateService.load('Recipes', 1, 4)
    try {
        let filesIds
        if(req.files.length != 0) {
            const oldFiles = await RecipeFiles.findAll({ where: {recipe_id: req.body.id} })
            const totalFiles = oldFiles.length + req.files.length
            
            if(totalFiles <= 5) {
                const filesPromise = req.files.map(file => RecipeFiles.create({ name: file.filename, path: file.path }))
                filesIds = await Promise.all(filesPromise)
                filesIds = filesIds.sort()
            }
        }
    
        if(filesIds) {
            const recipeFilesPromise = filesIds.map(id => RecipeFiles.createRecipeFiles(req.body.id, id))
            await Promise.all(recipeFilesPromise)
        }
        
        if(req.body.information)
            req.body.information = formatInformationService.load('toNewLineTag', req.body.information)
        req.body.title = req.body.title.replace(/(')/g, "$1'")

        const { id, title, chef_id, ingredients, preparation, information } = req.body
        await Recipes.update(id, { 
            title, 
            chef_id, 
            ingredients, 
            preparation, 
            information
        })
    
        const recipe = await Recipes.find({ where: {id} })
        let files = await RecipeFiles.findAll({ where: {recipe_id: recipe.id} })
        files = await addSrcToFilesArray(files)

        return res.render("admin/recipes/recipe", {
            recipe,
            files,
            success: "Receita atualizada com sucesso!"
        })    
    } catch (err) {
        console.error(err)
        return res.render("admin/recipes/index", {
            recipes,
            files,
            pagination,
            error: "Algum erro inesperado ocorreu!"
        })   
    }
}

exports.delete = async function(req, res) {
    const { id } = req.body
    try {
        const files = await RecipeFiles.findAll({ where: {recipe_id: id} })
        await Recipes.delete(id)
    
        const removeFilesPromise = files.map(file => {
            deleteImageService.load('delete', file)
            return RecipeFiles.delete(file.id)
        })
        await Promise.all(removeFilesPromise)
    
        let { recipes, files: recipesFiles, pagination } = await loadPaginateService.load('Recipes', 1, 4)
        return res.render("admin/recipes/index", {
            recipes,
            files: recipesFiles,
            pagination,
            success: "Receita deletada com sucesso!"
        })
    } catch (err) {
        console.error(err)
    }  
}