const User = require('../models/users')
const loadPaginateService = require('../services/loadPaginateService')

function checkAllFields(body) {
    const keys = Object.keys(body)

    for (const key of keys) {
        if (body[key] == "") {
            return {
                user: body,
                error: "Por favor preencha todos os campos."
            }
        }
    }
}

async function verifyUserIsAdmin(userId) {
    const user = await User.findOne({ where: {id: userId} })
    
    if(user && user.is_admin == true) return {
        isAdmin: true,
        isPrincipal: (user.id == 1) ? true : false
    }
}

async function index(req, res, next) {
    let { page, limit } = req.query
    try {
        page = page || 1
        limit = limit || 6
        
        const { users, pagination } = await loadPaginateService.load('Users', page, limit)

        if(!users[0]) return res.render("admin/isAdmin/listUsers", {
            error: "Erro ao carregar usuários!"
        })

        req.listUsers = { users, pagination }

        next()
    } catch (err) {
        console.error(err)
        return res.redirect("/admin/")
    }
}

async function post(req, res, next) {
    const { email } = req.body
    try {
        const checkedFields = checkAllFields(req.body)
        if(checkedFields) return res.render("admin/isAdmin/register", { ...checkedFields })
        
        const user = await User.findOne({ where: {email} })
        if (user) {
            return res.render("admin/isAdmin/register", {
                user: req.body,
                error: "Email já cadastrado!"
            })
        }

        next()
    } catch (err) {
        console.error(err)
    }
}

async function show(req, res, next) {
    const { id } = req.params
    try {
        const userIsAdmin = await verifyUserIsAdmin(req.session.userId)

        const user = await User.find(id)
    
        const { users, pagination } = await loadPaginateService.load('Users', 1, 6)
        if (!user) return res.render("admin/isAdmin/listUsers", {
            users,
            pagination: {},
            error: "Usuário não encontrado!"
        })

        const isPrincipal = userIsAdmin.isPrincipal,
            isAdmin = user.is_admin
        
        if(isPrincipal == false && (isAdmin == true && user.id != req.session.userId)) {
            return res.render("admin/isAdmin/listUsers", { 
                users,
                pagination,
                error: "Nao pode alterar este usuário!"
            })
        }

        req.user = user

        next()
    } catch (err) {
        console.error(err)
    }
}

async function put(req, res, next) {
    try {
        const { users, pagination } = await loadPaginateService.load('Users', 1, 6)
        const userIsAdmin = await verifyUserIsAdmin(req.session.userId)
        if(userIsAdmin.isPrincipal == false && req.body.id == 1) return res.render("admin/isAdmin/listUsers", {
            users,
            pagination,
            error: "Este usuário não pode ser editado!"
        })

        const checkedFields = checkAllFields(req.body)
        if(checkedFields) return res.render("admin/isAdmin/user", { ...checkedFields })
    
        const user = await User.findOne({ where: {id: req.body.id} })

        let isAdmin = false
        if(!req.body.is_admin && userIsAdmin.isPrincipal == true) isAdmin = false
        if(!req.body.is_admin && user.id == req.session.userId) isAdmin = true
        if(user.is_admin == true && userIsAdmin.isPrincipal == false) isAdmin = true
        if(req.body.is_admin) isAdmin = true
        
        req.body.is_admin = isAdmin
        req.user = user

        next()
    } catch (err) {
        console.error(err)
        return res.redirect("/admin/users")
    }
}

async function userDelete(req, res, next) {
    try {
        const userIsAdmin = await verifyUserIsAdmin(req.session.userId)
        const { users, pagination } = await loadPaginateService.load('Users', 1, 6)

        const userToBeDelete = await verifyUserIsAdmin(req.body.id)

        const canNotDelete = userToBeDelete && userToBeDelete.isAdmin == true &&
            userIsAdmin.isPrincipal == false
        
        if(canNotDelete || req.session.userId == req.body.id) {
            return res.render("admin/isAdmin/listUsers", {
                users,
                pagination,
                error: "Esta conta não pode ser deletada!"
            })
        }

        req.listUsers = { users, pagination }

        next()
    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    index,
    post,
    show,
    put,
    userDelete
}