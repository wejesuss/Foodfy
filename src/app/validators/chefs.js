const Chefs = require('../models/chefs')
const ChefFiles = require('../models/filesChefs')
const loadPaginateService = require('../services/loadPaginateService')

const { createSrc } = require('../../lib/utils')

function checkAllFields(body) {
    const keys = Object.keys(body)

    for (const key of keys) {
        if (body[key] == "" && key != "file_id" &&  key != "removed_files") {
            return {
                chef: body,
                error: "Por favor preencha todos os campos."
            }
        }
    }
}

async function listChefs(req, res, next) {
    let { page, limit } = req.query
    try {
        page = page || 1
        limit = limit || 8

        let { chefs, pagination } = await loadPaginateService.load('Chefs', page, limit)
        
        req.loadChefs = {
            chefs,
            pagination
        }

        next()
    } catch (err) {
        console.error(err)
    }
}

async function post(req, res, next) {
    try {
        const checkedFields = checkAllFields(req.body)
        if(checkedFields) return res.render("admin/chefs/create", { ...checkedFields })

        if(!req.file) return res.render("admin/chefs/create", {
            chef: req.body,
            error: "Mande uma imagem por favor!"
        })

        next()
    } catch (err) {
        console.error(err)
    }
}

async function show(req, res, next) {
    const { id } = req.params
    try {
        const chef = await Chefs.find(id)
    
        let {chefs, pagination} = await loadPaginateService.load('Chefs', 1, 8)
    
        if (!chef) {
            req.listChefs = { chefs, pagination }
            req.error = { message: "Chefe não encontrado!" }
        } else {
            const file = await ChefFiles.findOne(
            { where: {file_id: chef.file_id} }, 
            {   tableB: 'chefs', 
                rule:'files.id = chefs.file_id'
            })
            
            if(file)
            chef.avatar_url = createSrc(file)
            
            req.chef = chef
        }
        
        next()
    } catch (err) {
        console.error(err)
    }
}

async function put(req, res, next) {
    try {
        const checkedFields = checkAllFields(req.body)
        if(checkedFields) return res.render("admin/chefs/edit", { ...checkedFields })
        
        const chef = await Chefs.find(req.body.id)
        const file = await ChefFiles.findOne(
        { where: {file_id: chef.file_id} }, 
        {   tableB: 'chefs', 
            rule:'files.id = chefs.file_id'
        })
        
        if(file)
            file.src = createSrc(file)
        
        if(req.body.removed_files && !req.file) return res.render("admin/chefs/edit", { 
            chef, 
            file,
            error: "Chefe não pode ficar sem foto!"
        }) 

        next()
    } catch (err) {
        console.error(err)
    }
}

async function chefDelete(req, res, next) {
    const { id: chef_id, file_id } = req.body
    try {
        const recipes = await Chefs.selectRecipesById(chef_id)

        if(file_id == '') file_id = null
        const file = await ChefFiles.findOne({ where: {file_id: file_id} }, 
        {   tableB: 'chefs', 
            rule:'files.id = chefs.file_id'
        })

        if(file)
            file.src = createSrc(file)

        if(recipes[0]) {
            return res.render("admin/chefs/edit", {
                chef: req.body,
                file,
                error: "Não pode excluir chefes que possuem receitas!"
            })
        }

        next()
    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    post,
    show,
    put,
    chefDelete,
    listChefs
}