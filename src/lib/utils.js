module.exports = {
    date(timestamp) {
        const birthDate = new Date(timestamp)

        const year = birthDate.getFullYear()
        const month = `0${birthDate.getMonth() + 1}`.slice(-2)
        const day = `0${birthDate.getDate()}`.slice(-2)
        
        return {
            iso:`${year}-${month}-${day}`,
            birthDay:`${day}/${month}`,
            format:`${day}/${month}/${year}`
        }
    },
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