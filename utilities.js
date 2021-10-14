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


module.exports = {
    redirectIfNotLoggedIn,
    redirectToDashboardIfLoggedIn,
    baseModel,
    keepFirstLetters,
    keepFirstLettersObjectArray
}
