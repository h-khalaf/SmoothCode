const snippetRouter = require('express').Router(),
{ validationResult } = require('express-validator'),
db = require('../database/dbmanager.js'),
validator = require('../validator.js'),
{ redirectIfNotLoggedIn, isSnippetModified, splitCodeLines, preventIndentedFirstLine } = require('../utilities.js'),
hljs  = require('highlight.js'),

SNIPPETS_PAGE_TITLE = 'Snippets',
SNIPPET_DEFAULT_PAGE_TITLE = 'Snippet',
ADD_SNIPPET_PAGE_TITLE = 'Add Snippet',
EDIT_SNIPPET_PAGE_TITLE = 'Edit Snippet',
DELETE_SNIPPET_PAGE_TITLE = 'Delete Snippet',
SNIPPET_NOT_FOUND_TITLE = 'Snippet not found'

snippetRouter.get('/snippets', async (req, res) => { 
    const model = { 
        pageTitle: SNIPPETS_PAGE_TITLE,
        errors: [] 
    }
    // req.query returns an object, create a custom function..
    const query = req.query  // save query uri and send it back ?=key=value...
    console.log(query)

    try {
        model.snippets = await db.snippets.getAllSnippets() 
        model.languages = await db.languages.getAllLanguages()

        // split and highlight code using the stored language, otherwise auto highlight
        const firstLinesToKeep = 10
        for(const snippet of model.snippets) {
            snippet['code'] = splitCodeLines(snippet.code, firstLinesToKeep)
            if(snippet.language != null) 
                snippet.code = hljs.highlight(snippet.code, {language: snippet.language}).value 
            else snippet.code = hljs.highlightAuto(snippet.code).value

            if(isSnippetModified(snippet)) snippet.modified = true
        }
        res.render('snippets.hbs', model)
    } catch (error) {
        model.errors.push = error
        res.render('snippets.hbs', model)
    }
})


snippetRouter.get('/snippet/add', redirectIfNotLoggedIn, async (req, res) => {
    const model = { 
        pageTitle: ADD_SNIPPET_PAGE_TITLE,
        errors: [] 
    }

    try {
        model.folders = await db.folders.getAllFolders()
        model.languages = await db.languages.getAllLanguages()
        res.render('add-snippet.hbs', model)
    } catch (error) {
        model.errors.push(error)
        res.render('add-snippet.hbs', model)
    }
})

snippetRouter.post('/snippet/add', redirectIfNotLoggedIn, validator.addSnippetValidation, async (req, res) => {
    const model = { 
        pageTitle: ADD_SNIPPET_PAGE_TITLE,
        errors: [],
        title: req.body.title,
        folderId: req.body.folder,
        languageId: req.body.language,
        code: req.body.code
    },

    validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
        validationErrors.array().forEach(e => model.errors.push(e.msg)) // pushing only error messages
        try {
            model.folders = await db.folders.getAllFolders()
            model.languages = await db.languages.getAllLanguages()
        } catch (error) {
            model.errors.push(error)
        }
        return res.render('add-snippet.hbs', model)
    }

    try {
        await db.snippets.insertSnippet(model.title, model.code, model.folderId, model.languageId)
        res.redirect('/dashboard')
    } catch (error) {
        model.errors.push(error)
        console.log(model)
        res.render('add-snippet.hbs', model)
    }
})

snippetRouter.get('/snippet/edit/:id', redirectIfNotLoggedIn, async (req, res) => {
    const model = {
        pageTitle: EDIT_SNIPPET_PAGE_TITLE,
        errors: []
    },
    snippetId = req.params.id
    try {
        const snippet = await db.snippets.getSnippet(snippetId)
        if (snippet === undefined) return res.render('404.hbs', {pageTitle: SNIPPET_NOT_FOUND_TITLE})
        
        model.folders = await db.folders.getAllFolders()
        model.languages = await db.languages.getAllLanguages()
        model.snippet = snippet
        res.render('edit-snippet.hbs', model)
    } catch (error) {
        model.errors.push(error)
        res.render('edit-snippet.hbs', model)
    }
})

snippetRouter.post('/snippet/edit', redirectIfNotLoggedIn, validator.snippetUpdateValidation, async (req, res) => {
    const model = {
        pageTitle: EDIT_SNIPPET_PAGE_TITLE,
        errors: [],
        snippet: {
            title:  req.body.title,
            language: req.body.language,
            folder: req.body.folder,
            code: req.body.code,
            id: req.body.id
        }
    },

    validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
        validationErrors.array().forEach(e => model.errors.push(e.msg)) // pushing only error messages
        try {
            model.languages = await db.languages.getAllLanguages()
            model.folders = await db.folders.getAllFolders()
        } catch (error) {
            model.errors.push(error)
        }
        return res.render('edit-snippet.hbs', model)
    }

    try {
        await db.snippets.updateSnippet(model.snippet.id, model.snippet.title, model.snippet.code, model.snippet.folder, model.snippet.language)
        res.redirect('/dashboard')
    } catch (error) {
        model.errors.push(error)
        res.render('edit-snippet.hbs', model)
    }
})

snippetRouter.get('/snippet/delete/:id', redirectIfNotLoggedIn, async (req, res) => {
    const model = {
        pageTitle: DELETE_SNIPPET_PAGE_TITLE,
        errors: []
    },
    snippetId = req.params.id
    
    try {
        const snippet = await db.snippets.getSnippet(snippetId)
        if(snippet === undefined) return res.render('404.hbs', {pageTitle: SNIPPET_NOT_FOUND_TITLE}) 
        
        model.snippet = snippet
        res.render('delete-snippet.hbs', model)
    } catch (error) {
        model.errors.push(error)
        res.render('delete-snippet.hbs', model)
    }
})

snippetRouter.post('/snippet/delete', redirectIfNotLoggedIn, async (req, res) => {
    const model = {
        pageTitle: DELETE_SNIPPET_PAGE_TITLE,
        errors: [],
        snippet: {
            id: req.body.id,
            title: req.body.title
        }
    }
    try {
        await db.snippets.deleteSnippet(model.snippet.id)
        res.redirect('/dashboard')
    } catch (error) {
        model.errors.push(error)
        res.render('delete-snippet.hbs', model)
    }
})

snippetRouter.get('/snippet/:id', async (req, res) => {
    const model = {
        pageTitle: SNIPPET_DEFAULT_PAGE_TITLE, // If no error occurs, page title will be title of the code snippet
        errors: []
    },
    snippetId = req.params.id
    try {
        const snippet = await db.snippets.getSnippet(snippetId)
        if (snippet === undefined) return res.render('404.hbs', {pageTitle: SNIPPET_NOT_FOUND_TITLE})

        model.pageTitle = snippet.title // Page title changed here...
        model.snippet = snippet

        // If modified display last modified date in hbs file
        if(isSnippetModified(snippet)) model.modified = true 

        // Overwriting the code with the highlighted code
        if(snippet.language != null) 
            model.snippet.code = hljs.highlight(preventIndentedFirstLine(snippet.code), {language: snippet.language}).value 
        else model.snippet.code = hljs.highlightAuto(preventIndentedFirstLine(snippet.code)).value

        res.render('snippet.hbs', model)
    } catch (error) {
        model.errors.push(error)
        res.render('snippet.hbs', model)
    }
})

module.exports = snippetRouter
