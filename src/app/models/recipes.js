const db = require('../../config/db')

const Base = require('./Base')
Base.init({ table: 'recipes' })

module.exports = {
    ...Base,
    async find(filters) {
        try {
            let query = `SELECT recipes.*, chefs.name as chef_name
            FROM recipes
            LEFT JOIN chefs ON (chefs.id = recipes.chef_id)`

            Object.keys(filters).map(key => {
                query = `${query} ${key}`
                
                Object.keys(filters[key]).map(filter => {
                    query = `${query} recipes.${filter} = '${filters[key][filter]}' `
                })
            })
            
            let results = await db.query(query)
            
            return results.rows[0]
        } catch (err) {
            console.error(err)
        }
    },
    async recipeSelectOptions() {
        try {
          let results = await db.query(`SELECT chefs.name, chefs.id FROM chefs`)

          return results.rows
        } catch (err) {
            console.error(err)
        }
    },
    async paginate(params) {
        try {
            const { filter, limit, offset } = params

            let query = "",
                orderBy = `ORDER BY created_at DESC`,
                filterQuery = "",
                totalQuery = `(
                SELECT count(*) FROM recipes
            ) AS total`

            if (filter) {
                orderBy = `ORDER BY updated_at DESC`
                filterQuery = `
            WHERE recipes.title ILIKE '%${filter}%'
            `
                totalQuery = `(
                SELECT count(*) FROM recipes
                ${filterQuery}
            ) AS total`
            }

            query = `SELECT recipes.*, ${totalQuery}, chefs.name as chef_name
                FROM recipes
                LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
                ${filterQuery}
                ${orderBy} LIMIT $1 OFFSET $2
            `
            let results = await db.query(query, [limit, offset])

            return results.rows
        } catch (err) {
            console.error(err)
        }
    }
}