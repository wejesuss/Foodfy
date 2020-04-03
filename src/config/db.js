const { Pool } = require('pg')

module.exports = new Pool({
    database : "foodfy",
    user : "",
    password: "",
    host : "localhost",
    port: 5432
})