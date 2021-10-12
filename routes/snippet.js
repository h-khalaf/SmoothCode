const snippetRouter = require('express').Router(),
{ validationResult } = require('express-validator'),
db = require('../database/dbmanager.js'),
validator = require('../validator.js'),
{ redirectIfNotLoggedIn, highlightCode } = require('../utilities.js'),
hljs = require('highlight.js'),

SNIPPETS_PAGE_TITLE = 'Snippets',
SNIPPET_DEFAULT_PAGE_TITLE = 'Snippet',
ADD_SNIPPET_PAGE_TITLE = 'Add Snippet',
EDIT_SNIPPET_PAGE_TITLE = 'Edit Snippet',
DELETE_SNIPPET_PAGE_TITKE = 'Delete Snippet'

snippetRouter.get('/snippets', async (req, res) => { 
    const model = { 
        pageTitle: SNIPPETS_PAGE_TITLE,
        errors: [] 
    }

    try {
        model.snippets = await db.snippets.getAllSnippets() 
        res.render('snippets.hbs', model)
    } catch (error) {
        model.errors.push = error
        res.render('snippets.hbs', model)
    }
})


snippetRouter.get('/add-snippet', redirectIfNotLoggedIn, async (req, res) => {
    const model = { 
        pageTitle: ADD_SNIPPET_PAGE_TITLE,
        errors: [] 
    }

    try {
        model.folders = await db.folders.getAllFolders()
        res.render('add-snippet.hbs', model)
    } catch (error) {
        model.errors.push(error)
        res.render('add-snippet.hbs', model)
    }
})

snippetRouter.post('/add-snippet', redirectIfNotLoggedIn, validator.snippetValidation, async (req, res) => {
    const model = { 
        pageTitle: ADD_SNIPPET_PAGE_TITLE,
        errors: [],
        title: req.body.title,
        folderId: req.body.folder,
        code: req.body.code
    },

    validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
        validationErrors.array().forEach(e => model.errors.push(e.msg)) // pushing only error messages
        try {
            model.folders = await db.folders.getAllFolders()
        } catch (error) {
            model.errors.push(error)
        }
        return res.render('add-snippet.hbs', model)
    }

    try {
        await db.snippets.insertSnippet(model.title, model.code, model.folderId)
        res.redirect('/dashboard')
    } catch (error) {
        model.errors.push(error)
        console.log(model)
        res.render('add-snippet.hbs', model)
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
        if (snippet === undefined) return res.render('404.hbs') // Snippet does not exists

        model.pageTitle = snippet.title // Page title changed here...
        model.snippet = snippet
        
        highlightCode(model.snippet.code)
        res.render('snippet.hbs', model)
    } catch (error) {
        model.errors.push(error)
        res.render('snippet.hbs', model)
    }
})

snippetRouter.get('/edit-snippet/:id', redirectIfNotLoggedIn, async (req, res) => {
    const model = {
        pageTitle: EDIT_SNIPPET_PAGE_TITLE,
        errors: []
    },
    snippetId = req.params.id
    try {
        const snippet = await db.snippets.getSnippet(snippetId)
        if (snippet === undefined) return res.render('404.hbs') // Snippet does not exists
        
        model.folders = await db.folders.getAllFolders()
        model.snippet = snippet
        res.render('edit-snippet.hbs')
    } catch (error) {
        model.errors.push(error)
        res.render('edit-snippet.hbs', model)
    }
})

snippetRouter.post('edit-snippet', redirectIfNotLoggedIn, validator.snippetValidation, async (req, res) => {

})

module.exports = snippetRouter