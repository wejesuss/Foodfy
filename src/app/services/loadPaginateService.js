const User = require("../models/users")
const Recipes = require("../models/recipes")
const Chefs = require("../models/chefs")
const RecipeFiles = require("../models/filesRecipes")
const ChefFiles = require("../models/filesChefs")

const { addSrcToFilesArray, createSrc } = require('../../lib/utils')

function createPagination(items, page, limit) {
    let pagination
    if(items[0]) {
        pagination = {
            total: Math.ceil(items[0].total / limit),
            page,
            limit
        }
    }

    return pagination
}

const loadPaginateService = {
    load(service, page, limit, filter) {
        if(limit < 0) limit *= -1 
        let offset = limit * (page - 1)
        this.params = {limit, offset, filter}
        this.page = page

        return this[service]()
    },
    async Recipes() {
        try {
            let { limit } = this.params
            const recipes = await Recipes.paginate(this.params)
            
            if(!recipes[0]) return {
                error: "Nenhuma receita encontrada!"
            }
    
            let pagination = createPagination(recipes, this.page, limit)
    
            const searchFilesPromise = recipes.map(recipe => RecipeFiles.findAll({ where: {recipe_id: recipe.id} }))
            let files = await Promise.all(searchFilesPromise)
            files = files.reduce((imagesArray, currentImage) => {
                if(currentImage[0]) imagesArray.push(currentImage[0])
    
                return imagesArray
            }, [])
            files = addSrcToFilesArray(files)
            
            return {
                recipes,
                pagination,
                files
            }
        } catch (err) {
            console.error(err)
        }
    },
    async Chefs() {
        try {
            let { limit } = this.params
            
            const chefs = await Chefs.paginate(this.params)
                    
            let pagination = createPagination(chefs, this.page, limit)

            const chefsPromise = chefs.map(async chef => {
                const file = await ChefFiles.findOne(
                    { where: {file_id: chef.file_id} }, { 
                        tableB: 'chefs', 
                        rule:'files.id = chefs.file_id'
                    })
        
                if(file)
                    chef.avatar_url = createSrc(file)
            })
            await Promise.all(chefsPromise)

            return { chefs, pagination }   
        } catch (err) {
            console.error(err)
        }
    },
    async Users() {    
        let { limit } = this.params
    
        const users = await User.paginate(this.params)
        
        let pagination = createPagination(users, this.page, limit)
    
        return { 
            users, 
            pagination 
        }
    }
}

module.exports = loadPaginateService