const formatInformationService = {
    load(service, information) {
        this.information = information

        return formatInformationService[service]()
    },
    toNewLineTag() {
        const arrayOfBrokenLines = this.information.split("\r\n")
        const stringWithLineBreakTags = arrayOfBrokenLines.join("<br>")
        if (stringWithLineBreakTags) {
            return stringWithLineBreakTags
        }
    },
    toNewLineCharacter() {
        const arrayOfBrokenLines = this.information.split("<br>")
        const stringWithLineBreakTags = arrayOfBrokenLines.join("\r\n")
        if (stringWithLineBreakTags) {
            return stringWithLineBreakTags
        }
    }
}

module.exports = formatInformationService