// Functions & middlewares

function redirectIfNotLoggedIn (req, res, next) {
    if(!req.session.isLoggedIn)
        res.redirect('/login')
    else next()
}

function redirectToDashboardIfLoggedIn (req, res, next) {
    if (req.session.isLoggedIn)
        res.redirect('/dashboard')
    else next()
}

function baseModel (req, res, next) {
    res.locals.isLoggedIn = req.session.isLoggedIn
    res.locals.csrfToken = req.csrfToken()
    res.locals.currentYear = new Date().getFullYear()
    next()
}

function keepFirstLetters(string, maxLineCharacters) {
    if(string.length > maxLineCharacters) {
        return string.substring(0, maxLineCharacters-3) + '...'
    }
    return string
}

function keepFirstLettersObjectArray (arrayOfObjects, key, maxLineCharacters) {
    // Loops through an array of objects and modifies a value using its key
    for (const arrObject of arrayOfObjects)
        arrObject[key] = keepFirstLetters(arrObject[key], maxLineCharacters)
}

function isSnippetModified (snippet) {
    if (snippet.postDate !== snippet.lastModified)
        return true
    return false
}

function preventIndentedFirstLine(code) {
    return '\n' + code  // To prevent extra indent tab on first line code, bad solution is better than none ;)
}

function splitCodeLines(code, firstLinesToKeep) {
    const lines = code.split('\n', firstLinesToKeep)
    let modifiedCode = '\n' // To prevent extra indent tab on first line code, bad solution is better than none ;)

    const linesLength = lines.length
    for(let i = 0; i < linesLength; i++) {
        if (i == firstLinesToKeep-1) {
            modifiedCode += lines[i] + '\n' + '...' // adds ... to make it clear that code is longer than "firstLinesToKeep"
        } else {
            modifiedCode += lines[i] + '\n'
        }
    }
    return modifiedCode
}


module.exports = {
    redirectIfNotLoggedIn,
    redirectToDashboardIfLoggedIn,
    baseModel,
    keepFirstLetters,
    keepFirstLettersObjectArray,
    isSnippetModified,
    preventIndentedFirstLine,
    splitCodeLines
}
