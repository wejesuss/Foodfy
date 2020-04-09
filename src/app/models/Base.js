const db = require('../../config/db')

async function find(filters, table, join) {
    try {
        let query = `SELECT * FROM ${table}`

        if(join) {
            const { tableB, rule, aliases } = join

            if(aliases) {
                query = `SELECT ${table}.*, ${aliases}
                FROM ${table}
                LEFT JOIN ${tableB} ON (${rule})
                `
            } else {
                query = `SELECT ${table}.*
                FROM ${table}
                LEFT JOIN ${tableB} ON (${rule})
                `
            }
        }

        if(filters) {
            Object.keys(filters).map(key => {
            query += ` ${key}
            `
                Object.keys(filters[key]).map(field => {
                    query += ` ${field} = '${filters[key][field]}'
                    `
                })
            })
        }

        if(join && join.orderBy)
            query += ` ORDER BY ${join.orderBy}`

        return db.query(query)
    } catch (err) {
        console.error(err)
    }
}

const Base = {
    init({ table }) {
        if(!table) throw new Error("Invalid table name!")

        this.table = table
        return this
    },
    async findAll(filters, join) {
        try {
            const results = await find(filters, this.table, join)
            return results.rows
        } catch (err) {
            console.error(err)
        }
    },
    async find(id, join) {
        try {
            const results = await find({ where: {id} }, this.table, join)
            return results.rows[0]
        } catch (err) {
            console.error(err)
        }
    },
    async findOne(filters, join) {
        try {
            const results = await find(filters, this.table, join)
            return results.rows[0]
        } catch (err) {
            console.error(err)
        }
    },
    async create(fields) {
        try {
            const keys = []
            const values = []
            let query = `INSERT INTO ${this.table}`

            Object.keys(fields).map(key => {
                keys.push(key)

                if (Array.isArray(fields[key])) {
                    const separetWithComma = '","'
                    values.push(`'{"${fields[key].join(separetWithComma)}"}'`)
                } else {
                    values.push(`'${fields[key]}'`)
                }
            })

            query += ` (
                ${keys.join(',')}
            ) VALUES (${values.join(',')})
            RETURNING id
            `
            const results = await db.query(query)

            return results.rows[0].id
        } catch (err) {
            console.error(err)
        }
    },
    update(id, fields) {
        try {
            const values = []
            let query = `UPDATE ${this.table} SET`

            Object.keys(fields).map(key => {
                if (Array.isArray(fields[key])) {
                    const separetWithComma = '","'
                    values.push(`${key} = '{"${fields[key].join(separetWithComma)}"}'`)
                } else {
                    values.push(`${key} = '${fields[key]}'`)
                }
            })

            query += `
                ${values.join(',')}
            WHERE id = ${id}
            `

            return db.query(query)
        } catch (err) {
            console.error(err)
        }
    },
    delete(id) {
        try {
            return db.query(`DELETE FROM ${this.table} WHERE id = ${id}`)
        } catch (err) {
            console.error(err)
        }
    },
    async paginate(params) {
        try {
            const { limit, offset } = params

            let query = `SELECT ${this.table}.*, (
                SELECT count(*) FROM ${this.table}
            ) AS total
            FROM ${this.table}
            ORDER BY id ASC
            LIMIT $1 OFFSET $2
            `
            
            const results = await db.query(query, [limit, offset])
            
            return results.rows
        } catch (err) {
            console.error(err)
        }
    }
}

module.exports = Base