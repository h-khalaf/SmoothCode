// highlight.js
const hljs  = require('highlight.js')

// Functions & middlewares

function redirectIfNotLoggedIn (req, res, next) {
    if(!req.session.isLoggedIn)
        res.status(401).redirect('/login') // Unauthorized
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
            modifiedCode += lines[i] + '\n' + '...' // adds ... to make it clear that code is longer or equal to "firstLinesToKeep"
        } else {
            modifiedCode += lines[i] + '\n'
        }
    }
    return modifiedCode
}

function paginate(currentPage, pageLimit, totalItems) {
    const totalPages = Math.ceil(totalItems / pageLimit)
    console.log(totalPages)
    let prevPage, nextPage
    currentPage = parseInt(currentPage)
    if (currentPage <= 1) {
        currentPage = 1
        if(totalPages > currentPage) 
            nextPage = currentPage + 1
        prevPage = false
    }
    else if (currentPage >= totalPages) {
        currentPage = totalPages
        prevPage = currentPage - 1
        nextPage = false
    } else {
        prevPage = currentPage - 1
        nextPage = currentPage + 1
    }

    return {
        prevPage: prevPage,
        currentPage: currentPage,
        nextPage: nextPage,
        offset: (currentPage - 1) * pageLimit,
        limit: pageLimit
    }
}


function highlightSnippets(firstLinesToKeep, snippets) {
    // split and highlight code using the stored language, otherwise auto highlight
    // takes in firstLinesToKeep and snippets (model.snippets)

    for(const snippet of snippets) {
        snippet['code'] = splitCodeLines(snippet.code, firstLinesToKeep)
        if(snippet.language != null) 
            snippet.code = hljs.highlight(snippet.code, {language: snippet.language}).value 
        else snippet.code = hljs.highlightAuto(snippet.code).value

        if(isSnippetModified(snippet)) snippet.modified = true
    }
}

function highlightSnippet(snippet) {
    // Overwriting the code with the highlighted code
    // takes in snippet object (model.snippet)

    if(snippet.language != null) 
        snippet.code = hljs.highlight(preventIndentedFirstLine(snippet.code), {language: snippet.language}).value 
    else snippet.code = hljs.highlightAuto(preventIndentedFirstLine(snippet.code)).value
}

module.exports = {
    redirectIfNotLoggedIn,
    redirectToDashboardIfLoggedIn,
    baseModel,
    keepFirstLetters,
    keepFirstLettersObjectArray,
    isSnippetModified,
    preventIndentedFirstLine,
    splitCodeLines,
    paginate,
    highlightSnippet,
    highlightSnippets
}
