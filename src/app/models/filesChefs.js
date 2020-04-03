const db = require('../../config/db')

const Base = require('./Base')
Base.init({ table: "files" })

module.exports = {
    ...Base,
    async findRecipesFiles(recipe_id) {
        try {
            const results = await db.query(`SELECT file_id AS id, recipe_id, files.name, files.path
            FROM recipe_files
            LEFT JOIN files ON (files.id = recipe_files.file_id)
            WHERE recipe_files.recipe_id = ${recipe_id}
            ORDER BY files.name`)

            return results.rows[0]
        } catch (err) {
            console.error(err)
        }
    },
    async delete(chef_id, id) {
        try {
            await db.query(`UPDATE chefs SET file_id = NULL WHERE id = ${chef_id}`)

            let result = await db.query(`SELECT * FROM files WHERE id = ${id}`)
            const file = result.rows[0]

            await db.query(`DELETE FROM files WHERE id = $1`, [id])

            return file
        } catch (err) {
            console.error(err)
        }
    }
}