const db = require('../../config/db')

const RecipeFiles = require('../models/filesRecipes')

const Base = require('./Base')
Base.init({ table: 'users' })

module.exports = {
    ...Base,
    async delete(id) {
        try {
            let results = await db.query(`SELECT recipes.* FROM recipes 
            LEFT JOIN users ON (users.id = recipes.user_id)
            WHERE users.id = ${id}`)
            const recipes = results.rows

            const findFilesPromise = recipes.map(recipe =>  RecipeFiles.findAll({ where: {recipe_id: recipe.id} }))
            let filesResults = await Promise.all(findFilesPromise)

            await db.query(`DELETE FROM users WHERE id = $1`, [id])

            return filesResults
        } catch (error) {
            console.error(error)
        }
    },
    async listRecipes(params) {
        try {
            const { limit, offset, user_id } = params

            let query = "",
                orderBy = `ORDER BY created_at DESC`,
                filterQuery = "",
                limitByUser = `WHERE recipes.user_id = ${user_id}`
                totalQuery = `(
                    SELECT count(*) FROM recipes WHERE recipes.user_id = ${user_id}
                ) AS total`

            query = `SELECT recipes.*, ${totalQuery}, chefs.name as chef_name
                FROM recipes
                LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
                ${filterQuery}
                ${limitByUser}
                ${orderBy} LIMIT $1 OFFSET $2
            `
            let results = await db.query(query, [limit, offset])

            return results.rows
        } catch (err) {
            console.error(err)
        }
    }
}