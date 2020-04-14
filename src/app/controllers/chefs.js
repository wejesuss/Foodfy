const Chefs = require('../models/chefs')
const ChefFiles = require('../models/filesChefs')

const loadPaginateService = require('../services/loadPaginateService')
const deleteImageService = require('../services/deleteImageService')

const { addSrcToFilesArray, createSrc } = require('../../lib/utils')

exports.index = async function(req, res) {
    let { page, limit } = req.query
    try {
        page = page || 1
        limit = limit || 8

        let { chefs, pagination } = await loadPaginateService.load('Chefs', page, limit)

        if(!chefs[0]) return res.render("admin/chefs/index", { error: "Erro ao carregar chefs!"})

        return res.render("admin/chefs/index", { 
            chefs, 
            pagination
        })
    } catch (err) {
        console.error(err)
        return res.render("admin/chefs/index", {
            error: "Chefes não encontrados!"
        })
    }
}

exports.create = function(req, res) {
    try {
        return res.render("admin/chefs/create")
    } catch (err) {
        console.error(err)
    }
}

exports.post = async function(req, res) {
    try {
        const fileId = await ChefFiles.create({ name: req.file.filename, path: req.file.path })
        
        if(fileId) {
            req.body.file_id = fileId
            req.body.name = req.body.name.replace(/(')/g, "$1'")
            const id = await Chefs.create(req.body)
            
            const chef = await Chefs.find(id)
            const newFile = await ChefFiles.findOne({ where: {file_id: chef.file_id} }, 
            {   tableB: 'chefs', 
                rule:'files.id = chefs.file_id'
            })
    
            if(newFile)
                newFile.src = createSrc(newFile)
        
            return res.render("admin/chefs/edit", { 
                chef, 
                file: newFile,
                success: "Chefe criado com sucesso!"
            })
        }
    } catch (err) {
        console.error(err)
        return res.render("admin/chefs/create", {
            chef: req.body,
            error: "Algum erro ocorreu, tente novamente!"
        })
    }
}

exports.show = async function(req, res) {
    const { id } = req.params
    try {
        const { error, listChefs, chef } = req

        if (error) return res.render("admin/chefs/index", {
            chefs: listChefs.chefs,
            pagination: listChefs.pagination,
            error: error.message
        })

        const recipes = await Chefs.selectRecipesById(id)
        
        const searchFilesPromise = recipes.map(recipe => ChefFiles.findRecipesFiles(recipe.id))
        let files = await Promise.all(searchFilesPromise)
        files = addSrcToFilesArray(files)
    
        return res.render("admin/chefs/chef", { chef, recipes, files })   
    } catch (err) {
        console.error(err)
        return res.render("admin/chefs/chef", {
            error: "Erro inesperado, tente novamente!"
        })
    }
}

exports.edit = async function(req, res) {
    const { id } = req.params
    try {
        const chef = await Chefs.find(id)

        let { chefs } = await loadPaginateService.load('Chefs', 1, 8)
        if (!chef) return res.render("admin/chefs/index", {
            chefs,
            pagination: {},
            error: "Chefe não encontrado!"
        })
    
        const file = await ChefFiles.findOne({ where: {file_id: chef.file_id} }, 
        {   tableB: 'chefs', 
            rule:'files.id = chefs.file_id'
        })
        
        if(file)
            file.src = createSrc(file)
    
        return res.render("admin/chefs/edit", { chef, file })   
    } catch (err) {
        console.error(err)
    }
}

exports.put = async function(req, res) {
    try {
        if(req.body.removed_files) {
            const removed_files = req.body.removed_files.split(',')
            const lasIndex = removed_files.length - 1
            removed_files.splice(lasIndex, 1)
    
            const removedFilesPromise = removed_files.map(id => ChefFiles.delete(req.body.id, id))
                
            const files = await Promise.all(removedFilesPromise)
            files.map(file => {
                deleteImageService.load('delete', file)
            })
        }

        if (req.body.file_id == '') req.body.file_id = null
        const file = await ChefFiles.findOne({ where: {file_id: req.body.file_id} }, 
        {   tableB: 'chefs', 
            rule:'files.id = chefs.file_id'
        })
    
        let fileId
        if(!file && req.file) {
            fileId = await ChefFiles.create({ name: req.file.filename, path: req.file.path })
        }
        
        if(!fileId) fileId = req.body.file_id
    
        await Chefs.update(req.body.id, {
            name: req.body.name.replace(/(')/g, "$1'"),
            file_id: fileId
        })
        
        const chef = await Chefs.find(req.body.id)
        const newFile = await ChefFiles.findOne({ where: {file_id: chef.file_id} }, 
        {   tableB: 'chefs', 
            rule:'files.id = chefs.file_id'
        })

        if(newFile)
            newFile.src = createSrc(newFile)

        return res.render("admin/chefs/edit", { 
            chef, 
            file: newFile,
            success: "Chefe atualizado com sucesso!"
        }) 
    } catch (err) {
        console.error(err)
        return res.render("admin/chefs/edit", {
            chef: req.body,
            error: "Algum erro ocorreu, tente novamente!"
        })
    }
}

exports.delete = async function(req, res) {
    let { id: chef_id, file_id } = req.body
    try {
        if(file_id == '') file_id = null

        const file = await ChefFiles.delete(chef_id, file_id)
        deleteImageService.load('delete', file)

        await Chefs.delete(chef_id)

        let {chefs, pagination} = await loadPaginateService.load('Chefs', 1, 8)

        return res.render("admin/chefs/index", {
            chefs,
            pagination,
            success: "Chefe deletado com sucesso!"
        })
    } catch (err) {
        console.error(err)
    }
}