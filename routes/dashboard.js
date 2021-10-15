const dashboardRouter = require('express').Router(),
hljs  = require('highlight.js'),
{ redirectIfNotLoggedIn, isSnippetModified, preventIndentedFirstLine } = require('../utilities.js'),
db = require('../database/dbmanager.js'),
{ validationResult } = require('express-validator'),
validator = require('../validator.js'),

DASHBOARD_PAGE_TITLE = 'Dashboard',
MESSAGES_PAGE_TITLE = 'Messages',
DEFAULT_MESSAGE_PAGE_TITLE = 'Message',
DELETE_MESSAGE_PAGE_TITLE = 'Delete message',
MESSAGE_NOT_FOUND_TITLE = 'Message not found',
ADD_LANGUAGE_PAGE_TITLE = 'Add language',
EDIT_LANGUAGE_PAGE_TITLE = 'Edit language',
LANGUAGE_NOT_FOUND_TITLE = 'Language not found',
DELETE_LANGUAGE_PAGE_TITLE = 'Delete language'

dashboardRouter.get('/dashboard', redirectIfNotLoggedIn, async (req, res) => {
    const model = { 
        pageTitle: DASHBOARD_PAGE_TITLE,
        errors: []
    }

    try {
        const snippets = await db.snippets.countSnippets(),
        folders = await db.folders.countFolders(),
        messages = await db.messages.countMessages(),
        latestCodeSnippet = await db.snippets.getLatestSnippet(),
        languages = await db.languages.getAllLanguages()

        model.snippetsCount = snippets.count
        model.foldersCount = folders.count
        model.messagesCount = messages.count
        model.languages = languages

        if (latestCodeSnippet !== undefined) { // If not empty
            model.latestCodeSnippet = latestCodeSnippet
            if(isSnippetModified(latestCodeSnippet)) model.modified = true

            // Overwriting the code with the highlighted code
            if(latestCodeSnippet.language != null) 
                model.latestCodeSnippet.code = hljs.highlight(preventIndentedFirstLine(latestCodeSnippet.code), {language: latestCodeSnippet.language}).value 
            else model.latestCodeSnippet.code = hljs.highlightAuto(preventIndentedFirstLine(latestCodeSnippet.code)).value

        }

        res.render('dashboard.hbs', model)
    } catch (error) {
        model.errors.push(error)
        res.render('dashboard.hbs', model)
    }    
})

dashboardRouter.get('/messages', redirectIfNotLoggedIn, async (req, res) => {
    const model = {
        pageTitle: MESSAGES_PAGE_TITLE,
        errors: []
    }

    try {
        model.messages = await db.messages.getAllMessages()
        res.render('messages.hbs', model)
    } catch (error) {
        model.errors.push(error)
        res.render('messages.hbs', model)
    }
})

dashboardRouter.get('/message/:id', redirectIfNotLoggedIn, async (req, res) => {
    const model = {
        pageTitle: DEFAULT_MESSAGE_PAGE_TITLE,
        errors: []
    },
    messageId = req.params.id

    try {
        const message = await db.messages.getMessage(messageId)
        if (message === undefined) return res.render('404.hbs', {pageTitle: MESSAGE_NOT_FOUND_TITLE})
    } catch (error) {
        model.errors.push(error)
        res.render('message.hbs', model)
    }
})

dashboardRouter.get('/delete-message/:id', redirectIfNotLoggedIn, async (req, res) => {
    const model = {
        pageTitle: DELETE_MESSAGE_PAGE_TITLE,
        errors: []
    },
    messageId = req.params.id
    try {
        const message = await db.messages.getMessage(messageId)
        if(message === undefined) return res.render('404.hbs', {pageTitle: MESSAGE_NOT_FOUND_TITLE}) 
        
        model.message = message
        res.render('delete-message.hbs', model)
    } catch (error) {
        model.errors.push(error)
        res.render('delete-message.hbs', model)
    }
})

dashboardRouter.post('/delete-message', redirectIfNotLoggedIn, async (req, res) => {
    const model = {
        pageTitle: DELETE_MESSAGE_PAGE_TITLE,
        errors: []
    },
    messageId = req.body.id
    
    try {
        await db.messages.deleteMessage(messageId)
        res.redirect('/dashboard')
    } catch (error) {
        model.errors.push(error)
        res.render('delete-message.hbs', model)
    }
})

dashboardRouter.get('/add-language', redirectIfNotLoggedIn, (req, res) => {
    const model = { pageTitle: ADD_LANGUAGE_PAGE_TITLE }
    res.render('add-language.hbs', model)
})

dashboardRouter.post('/add-language', redirectIfNotLoggedIn, validator.addLanguageValidation, async (req, res) => {
    const model = {
        pageTitle: ADD_LANGUAGE_PAGE_TITLE,
        errors: [],
        language: req.body.language
    }

    validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
        validationErrors.array().forEach(e => model.errors.push(e.msg)) // pushing only error messages
        return res.render('add-language.hbs', model)
    }

    try {
        const isAvailable = await db.languages.languageIsAvailable(model.language)
        if(isAvailable) {
            try {
                await db.languages.insertLanguage(model.language)
                res.redirect('/dashboard')
            } catch (error) {
                model.errors.push(error)
                res.render('add-language.hbs', model)                
            }
        } else {
            model.errors.push('Language is already added')
            res.render('add-language.hbs', model)
        }
    } catch (error) {
        model.errors.push(error)
        res.render('add-language.hbs', model)
    }
})

dashboardRouter.get('/edit-language/:id', redirectIfNotLoggedIn, async (req, res) => {
    const model = {
        pageTitle: EDIT_LANGUAGE_PAGE_TITLE,
        errors: []
    },
    languageId = req.params.id
    try {
        const language = await db.languages.getLanguage(languageId)
        if(language === undefined) return res.render('404.hbs', {pageTitle: LANGUAGE_NOT_FOUND_TITLE})
        
        model.language = language
        res.render('edit-language.hbs', model)
    } catch (error) {
        model.errors.push(error)
        res.render('edit-language.hbs', model)
    }
})

dashboardRouter.post('/edit-language', redirectIfNotLoggedIn, validator.languageUpdateValidation, async (req, res) => {
    const model = {
        pageTitle: EDIT_LANGUAGE_PAGE_TITLE,
        errors: [],
        language: {
            id: req.body.languageId,
            name: req.body.languageName
        }
    },
    
    validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
        validationErrors.array().forEach(e => model.errors.push(e.msg)) // pushing only error messages
        return res.render('edit-language.hbs', model)
    }

    try {
        await db.languages.updateLanguage(languageId, languageName)
        res.redirect('/dashboard')
    } catch (error) {
        model.errors.push(error)
        res.render('edit-language.hbs', model)
    }
})

dashboardRouter.get('/delete-language/:id', redirectIfNotLoggedIn, async (req, res) => {
    const model = {
        pageTitle: DELETE_LANGUAGE_PAGE_TITLE,
        errors: []
    },
    languageId = req.params.id
    
    try {
        const language = await db.languages.getLanguage(languageId)
        if(language === undefined) return res.render('404.hbs', {pageTitle: LANGUAGE_NOT_FOUND_TITLE}) 
        
        model.language = language
        res.render('delete-language.hbs', model)
    } catch (error) {
        model.errors.push(error)
        res.render('delete-language.hbs', model)
    }
})

dashboardRouter.post('/delete-language', redirectIfNotLoggedIn, async (req, res) => {
    const model = {
        pageTitle: DELETE_LANGUAGE_PAGE_TITLE,
        errors: [],
        language: {
            id: req.body.id,
            name: req.body.name
        }
    }

    try {
        await db.snippets.setSnippetsLanguageToNull(model.language.id)
        await db.languages.deleteLanguage(model.language.id)
        res.redirect('/dashboard')
    } catch (error) {
        model.errors.push(error)
        res.render('delete-language.hbs', model)
    }
})

module.exports = dashboardRouter
