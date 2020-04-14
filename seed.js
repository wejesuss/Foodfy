const faker = require('faker')
faker.locale= 'pt_BR'
const { hash } = require('bcryptjs')

const { chefs: dataChefs, recipes: dataRecipes } = require('./backupfoodfy.json')

const Users = require('./src/app/models/users')
const Recipes = require('./src/app/models/recipes')
const RecipeFiles = require('./src/app/models/filesRecipes')
const Chefs = require('./src/app/models/chefs')
const ChefFiles = require('./src/app/models/filesChefs')

const limitChefs = 3
const limitRecipes = 8
const limitUsers = 3
const chefsIds = []
let usersIds = []

async function createChef(chef, file) {
    const fileId = await ChefFiles.create(file)

    chef.file_id = fileId
    const chefId = await Chefs.create(chef)

    return chefId
}

async function createRecipe(recipe, file) {
    const recipeId = await Recipes.create(recipe)
    
    const fileId = await RecipeFiles.create(file)
    await RecipeFiles.createRecipeFiles(recipeId, fileId)

    return recipeId
}

async function createUsers() {
    let iteration = 0
    const password = await hash('123', 8)

    let user = {
        name: faker.name.findName().replace(/(')/g, "$1'"),
        email: 'adminfoodfy@gmail.com',
        password,
        is_admin: true
    }

    let userId = await Users.create(user)
    usersIds.push(userId)

    while (iteration < limitUsers) {
        const name = faker.name.findName().replace(/(')/g, "$1'")
        user = {
            name,
            email: faker.internet.email(name),
            password,
            is_admin: faker.random.boolean()
        }

        userId = await Users.create(user)
        usersIds.push(userId)

        iteration++
    }
}

async function createOriginalChefs() {
    let iteration = 0
    while (iteration < dataChefs.length) {
        const { name, path } = dataChefs[iteration]
        
        const file = {
            name: `${Date.now().toString()}-${name}`,
            path
        }
        
        const chef = { name }

        const chefId = await createChef(chef, file)
        chefsIds.push(chefId)

        iteration++
    }
}

async function createOriginalRecipes() {
    let iteration = 0
    while (iteration < dataRecipes.length) {
        const { title, path, ingredients, preparation, information } = dataRecipes[iteration]
        
        const recipe = {
            title, 
            chef_id: chefsIds[Math.floor(Math.random() * chefsIds.length)] || 1,
            user_id: usersIds[Math.floor(Math.random() * usersIds.length)] || 1, 
            ingredients, 
            preparation, 
            information
        }

        const file = {
            name: `${Date.now().toString()}-${title}`,
            path
        }
        
        await createRecipe(recipe, file)

        iteration++
    }
}

async function createChefs() {
    let iteration = 0
    while (iteration < limitChefs) {
        const name = faker.name.findName().replace(/(')/g, "$1'")
        const file = {
            name: `${Date.now().toString()}-${name}`,
            path: 'public/images/recipes-and-chefs/chefs.jpg'
        }
        
        const chef = { name }

        const chefId = await createChef(chef, file)
        chefsIds.push(chefId)

        iteration++
    }
}

async function createRecipes() {
    let iteration = 0
    while (iteration < limitRecipes) {
        const title = faker.name.title().replace(/(')/g, "$1'")
        const recipe = {
            title, 
            chef_id: chefsIds[Math.floor(Math.random() * chefsIds.length)] || 1,
            user_id: usersIds[Math.floor(Math.random() * usersIds.length)] || 1, 
            ingredients: faker.lorem.paragraph(Math.ceil(Math.random() * 5)).split('. '), 
            preparation: faker.lorem.paragraph(Math.ceil(Math.random() * 4)).split('. '), 
            information: faker.lorem.paragraph(Math.floor(Math.random() * 3))
        }

        const file = {
            name: `${Date.now().toString()}-${title}`,
            path: 'public/images/recipes-and-chefs/recipes.png'
        }
        
        await createRecipe(recipe, file)

        iteration++
    }
}

async function init() {
    await createUsers()
    await createOriginalChefs()
    await createOriginalRecipes()
    await createChefs()
    await createRecipes()
}

init()