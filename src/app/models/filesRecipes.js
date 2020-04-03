const db = require('../../config/db')

const Base = require('./Base')
Base.init({ table: 'files' })

module.exports = {
    ...Base,
    createRecipeFiles(recipe_id, file_id) {
        try {
            return db.query(`
                INSERT INTO recipe_files (
                    recipe_id,
                    file_id
                ) VALUES ($1, $2)
                RETURNING id
            `, [recipe_id, file_id])
        } catch (err) {
            console.error(err)
        }
    },
    async findAll(filters) {
        try {
            let query = `SELECT file_id AS id, recipe_id, files.name, files.path
            FROM ${this.table}
            LEFT JOIN recipe_files ON (${this.table}.id = recipe_files.file_id)`

            Object.keys(filters).map(key => {
                query = `${query} ${key}`
                
                Object.keys(filters[key]).map(filter => {
                    query = `${query} recipe_files.${filter} = '${filters[key][filter]}' `
                })
            })
            query = `${query}
            ORDER BY files.name
            `
            let results = await db.query(query)
            
            return results.rows
        } catch (err) {
            console.error(err)
        }
    },
    async delete(file_id) {
        try {
            await db.query(`DELETE FROM recipe_files WHERE file_id = ${file_id}`)

            return db.query(`DELETE FROM ${this.table} WHERE id = $1`, [file_id])
        } catch (err) {
            console.error(err)
        }
    }
}