const { unlinkSync } = require('fs')

const deleteImageService = {
    load(service, file) {
        this.file = file
        
        return deleteImageService[service]()
    },
    delete() {
        try {
            unlinkSync(this.file.path)
        } catch (err) {
            console.error(err)
        }
    }
}

module.exports = deleteImageService