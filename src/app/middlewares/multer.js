const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/images/recipes-and-chefs")

    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now().toString()}-${file.originalname}`)

    }
})

const fileFilter = (req, file, cb) => {
    const isaccepted = ['image/png', 'image/jpg', 'image/jpeg']
    .filter(acceptedFile => acceptedFile == file.mimetype)

    if(isaccepted) return cb(null, true)

    return cb(null, false)
}

module.exports = multer({
    storage,
    fileFilter
})