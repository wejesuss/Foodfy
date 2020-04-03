const User = require('../models/users')

exports.show = async function(req, res) {
    const { user } = req
    try {
        return res.render("admin/profiles/profile", { user })
    } catch (err) {
        console.error(err)
        return res.render("admin/profiles/profile", {
            user: req.body,
            error: "Erro inesperado, tente novamente!"
        })
    }
}

exports.put = async function(req, res) {
    const { userId: id } = req.session
    try {
        let { name, email } = req.body

        await User.update(id, {
            name,
            email
        })

        return res.render("admin/profiles/profile", {
            user: req.body,
            success: "Usuário atualizado com sucesso!"
        })
    } catch (err) {
        console.error(err)
        return res.render("admin/profiles/profile", {
            user: req.body,
            error: "Algum erro aconteceu. Tente novamente!"
        })
    }
}

exports.myRecipes = async function(req, res) {
    let { recipes, files, pagination } = req.pageRecipes
    try {
        return res.render("admin/recipes/index", { 
            recipes, 
            pagination, 
            files 
        })
    } catch (err) {
        console.error(err)
        return res.redirect("/admin")
    }
}