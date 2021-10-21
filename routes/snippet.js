const snippetRouter = require('express').Router(),
{ validationResult } = require('express-validator'),
db = require('../database/dbmanager.js'),
validator = require('../validator.js'),
{ redirectIfNotLoggedIn, isSnippetModified, paginate, highlightSnippet, highlightSnippets } = require('../utilities.js'),

SNIPPETS_PAGE_TITLE = 'Snippets',
SNIPPET_DEFAULT_PAGE_TITLE = 'Snippet',
ADD_SNIPPET_PAGE_TITLE = 'Add Snippet',
EDIT_SNIPPET_PAGE_TITLE = 'Edit Snippet',
DELETE_SNIPPET_PAGE_TITLE = 'Delete Snippet',
SNIPPET_NOT_FOUND_TITLE = 'Snippet not found',
PAGE_NOT_FOUND = 'Page not found'

snippetRouter.get('/snippets', async (req, res) => { 
    const currentPage = 1,
        pageLimit = 10
    
    try {
        const {search, language} = req.query
        let snippets, paginataion
        
        const languages = await db.languages.getAllLanguages()

        if(search || language) { // Search
            const totalItems = await db.snippets.getSearchTotalItems(search, language)
            paginataion = paginate(currentPage, pageLimit, totalItems.count)
            snippets = await db.snippets.getSnippetsSearchResult(search, language, paginataion.limit, paginataion.offset)
        } else {
            const totalItems = await db.snippets.countSnippets()
            paginataion = paginate(currentPage, pageLimit, totalItems.count)
            snippets = await db.snippets.getSnippets(paginataion.limit, paginataion.offset)
        }
        
        const model = {
            pageTitle: SNIPPETS_PAGE_TITLE,
            snippets: snippets,
            currentPage: paginataion.currentPage,
            prevPage: paginataion.prevPage,
            nextPage: paginataion.nextPage,
            languages: languages,
            searchValue: search
        }

        highlightSnippets(10, model.snippets)

        res.render('snippets.hbs', model)
    } catch (error) {
        const model = {pageTitle: SNIPPETS_PAGE_TITLE, errors: [error]}
        res.render('snippets.hbs', model)
    }
    
    
})

snippetRouter.get('/snippets/page/:currentPage', async (req, res) => {
    const currentPage = req.params.currentPage,
        pageLimit = 10
    if (Number.isNaN(parseInt(currentPage))) return res.render('404.hbs', {pageTitle: PAGE_NOT_FOUND})
    
    try {
        const {search, language} = req.query
        let snippets, paginataion

        const languages = await db.languages.getAllLanguages()

        if(search || language) { // Search
            const totalItems = await db.snippets.getSearchTotalItems(search, language)
            paginataion = paginate(currentPage, pageLimit, totalItems.count)
            snippets = await db.snippets.getSnippetsSearchResult(search, language, paginataion.limit, paginataion.offset)
        } else {
            const totalItems = await db.snippets.countSnippets()
            paginataion = paginate(currentPage, pageLimit, totalItems.count)
            snippets = await db.snippets.getSnippets(paginataion.limit, paginataion.offset)
        }
        
        const model = {
            pageTitle: SNIPPETS_PAGE_TITLE,
            snippets: snippets,
            currentPage: paginataion.currentPage,
            prevPage: paginataion.prevPage,
            nextPage: paginataion.nextPage,
            languages: languages,
            searchValue: search
        }

        highlightSnippets(10, model.snippets)

        res.render('snippets.hbs', model)
    } catch (error) {
        const model = {pageTitle: SNIPPETS_PAGE_TITLE, errors: [error]}
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
            // fetch preselected option values
            model.preSelectedLanguage = await db.languages.getLanguage(model.languageId)
            model.preSelectedFolder = await db.folders.getFolder(model.folderId)

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
        
        model.folders = await db.folders.getAllFolders()
        model.languages = await db.languages.getAllLanguages()
        // fetch preselected option values
        model.preSelectedLanguage = await db.languages.getLanguage(model.languageId)
        model.preSelectedFolder = await db.folders.getFolder(model.folderId)

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
        
        model.snippet = snippet
        model.folders = await db.folders.getAllFolders()
        model.languages = await db.languages.getAllLanguages()
        
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
            // fetch preselected option values
            model.preSelectedLanguage = await db.languages.getLanguage(model.snippet.language)
            model.preSelectedFolder = await db.folders.getFolder(model.snippet.folder)
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
        if(isSnippetModified(snippet)) 
            model.modified = true 

        highlightSnippet(model.snippet)

        res.render('snippet.hbs', model)
    } catch (error) {
        model.errors.push(error)
        res.render('snippet.hbs', model)
    }
})

module.exports = snippetRouter
