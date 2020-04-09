const db = require('../../config/db')

const Base = require('./Base')
Base.init({ table: "chefs" })

module.exports = {
    ...Base,
    async find(id) {
        try {
            const query = `SELECT ${this.table}.*, count(recipes) AS total_recipes
            FROM ${this.table}
            LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
            WHERE chefs.id = ${id}
            GROUP BY chefs.id
            `

            const results = await db.query(query)

            return results.rows[0]
        } catch (error) {
            console.error(error)
        }
    },
    async paginate(params) {
        try {
            let { limit, offset } = params
            if(limit < 0 ||offset < 0) {
                limit *= -1
                offset *= -1
            }

            const query = `SELECT ${this.table}.*, (SELECT count(*) FROM ${this.table}) AS total, 
            count(recipes) AS total_recipes
            FROM ${this.table}
            LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
            GROUP BY chefs.id
            ORDER BY id ASC
            LIMIT $1 OFFSET $2
            `
            
            const results = await db.query(query, [limit, offset])
         
            return results.rows
        } catch (error) {
            console.error(error)
        }
    },
    async selectRecipesById(id) {
        try {
            let query = `SELECT recipes.*, chefs.name as chef_name
            FROM recipes
            LEFT JOIN ${this.table} ON (chefs.id = recipes.chef_id)
            WHERE chefs.id = ${id}
            ORDER BY recipes.created_at DESC
            `

            const results = await db.query(query)

            return results.rows
        } catch (err) {
            console.error(err)
        }
    },
}