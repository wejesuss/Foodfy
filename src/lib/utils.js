module.exports = {
    addSrcToFilesArray(files) {
        let filesWithSrc = files.map(file => ({ 
            ...file,
            src: `${file.path.replace("public", "")}`
        }))

        return filesWithSrc
    },
    createSrc(file) {
        let src = `${file.path.replace("public", "")}`

        return src
    }
}