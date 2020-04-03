const Recipes = require('../models/recipes')
const RecipeFiles = require('../models/filesRecipes')

const loadPaginateService = require('../services/loadPaginateService')
const deleteImageService = require('../services/deleteImageService')

const { addSrcToFilesArray } = require('../../lib/utils')

function checkAllFields(body) {
    const keys = Object.keys(body)
    for (const key of keys) {
        if (body[key] == "" && key != "information" && key != "removed_files") {
            return {
                recipe: body,
                error: "Por favor preencha todos os campos."
            }
        }
    }
}

async function index(req, res, next) {
    let { page, limit } = req.query
    try {
        page = page || 1
        limit = limit || 4
    
        let { error, recipes, files, pagination } = await loadPaginateService.load('Recipes', page, limit)
        if(error) return res.render("admin/recipes/index", { error })

        req.pageRecipes = {
            recipes,
            files,
            pagination
        }

        next() 
    } catch (err) {
        console.error(err)
        return res.redirect("/")
    }
}

async function post(req, res, next) {
    try {
        const options = await Recipes.recipeSelectOptions()

        let { recipes, files, pagination } = await loadPaginateService.load('Recipes', 1, 4)
        req.recipesForErrorPage = { 
            recipes, 
            files, 
            pagination 
        }

        if(!options) return res.render("admin/recipes/index", {
            recipes,
            pagination,
            files,
            error: "Erro ao encontrar chefes!"
        })

        const checkedFields = checkAllFields(req.body)
        if(checkedFields) return res.render("admin/recipes/create", { ...checkedFields })

        if(req.files.length == 0) return res.render("admin/recipes/create", {
            recipe: req.body,
            chefs: options,
            error: "Envie ao menos uma imagem!"
        })

        next()
    } catch (err) {
        console.error(err)
    }
}

async function put(req, res, next) {
    const { removed_files } = req.body
    try {
        const checkedFields = checkAllFields(req.body)
        if(checkedFields) return res.render("admin/recipes/edit", { ...checkedFields })
        
        if(removed_files) {
            let oldFiles = await RecipeFiles.findAll({ where: {recipe_id: req.body.id} })
            oldFiles = await addSrcToFilesArray(oldFiles)
    
            const removedFiles = removed_files.split(',')
            const lastIndex = removedFiles.length - 1
            removedFiles.splice(lastIndex, 1)
    
            if ((req.files && req.files.length == 0) && removedFiles.length == oldFiles.length) {
                const options = await Recipes.recipeSelectOptions()
                return res.render("admin/recipes/edit", {
                    recipe: req.body,
                    files: oldFiles,
                    chefs: options,
                    error: "Mande ao menos uma imagem!"
                })
            }
    
            const removedFilesPromise = removedFiles.map(async id => {
                const file = (await RecipeFiles.find(id))
                deleteImageService.load('delete', file)
                return RecipeFiles.delete(id)
            })
                
            await Promise.all(removedFilesPromise)
        }
        
        next()
    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    index,
    post,
    put
}