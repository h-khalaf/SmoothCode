const dashboardRouter = require('express').Router(),
{ redirectIfNotLoggedIn, isSnippetModified, highlightSnippet } = require('../utilities.js'),
db = require('../database/dbmanager.js'),
{ validationResult } = require('express-validator'),
validator = require('../validator.js'),

DASHBOARD_PAGE_TITLE = 'Dashboard',
MESSAGES_PAGE_TITLE = 'Messages',
MESSAGE_PAGE_TITLE = 'Message',
DELETE_MESSAGE_PAGE_TITLE = 'Delete message',
MESSAGE_NOT_FOUND_TITLE = 'Message not found',
ADD_LANGUAGE_PAGE_TITLE = 'Add language',
EDIT_LANGUAGE_PAGE_TITLE = 'Edit language',
LANGUAGE_NOT_FOUND_TITLE = 'Language not found',
DELETE_LANGUAGE_PAGE_TITLE = 'Delete language',
ADD_HLJS_LANGUAGES_PAGE_TITLE = 'Add hljs languages'

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

            highlightSnippet(model.latestCodeSnippet)

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

dashboardRouter.get('/message/delete/:id', redirectIfNotLoggedIn, async (req, res) => {
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

dashboardRouter.post('/message/delete', redirectIfNotLoggedIn, async (req, res) => {
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

dashboardRouter.get('/message/:id', redirectIfNotLoggedIn, async (req, res) => {
    const model = {
        pageTitle: MESSAGE_PAGE_TITLE,
        errors: []
    },
    messageId = req.params.id

    try {
        const message = await db.messages.getMessage(messageId)
        if (message === undefined) return res.render('404.hbs', {pageTitle: MESSAGE_NOT_FOUND_TITLE})

        if(message.readDate == null) {
            await db.messages.setReadDate(messageId)
            model.message = await db.messages.getMessage(messageId)
        } else {
            model.message = message
        }
        
        res.render('message.hbs', model)
    } catch (error) {
        model.errors.push(error)
        res.render('message.hbs', model)
    }
})


dashboardRouter.get('/language/add', redirectIfNotLoggedIn, (req, res) => {
    const model = { pageTitle: ADD_LANGUAGE_PAGE_TITLE }
    res.render('add-language.hbs', model)
})

dashboardRouter.post('/language/add', redirectIfNotLoggedIn, validator.addLanguageValidation, async (req, res) => {
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

dashboardRouter.get('/language/hljs', redirectIfNotLoggedIn, (req, res) => {
    const model = {pageTitle: ADD_HLJS_LANGUAGES_PAGE_TITLE}
    res.render('add-hljs-languages.hbs', model)
})

dashboardRouter.post('/language/hljs', redirectIfNotLoggedIn, async (req, res) => {
    const model = {
        pageTitle: ADD_HLJS_LANGUAGES_PAGE_TITLE,
        errors: []
    }

    try {
        await db.languages.insertHljsLanguages()
        res.redirect('/dashboard')
    } catch (error) {
        model.errors.push(error)
        res.render('add-hljs-languages.hbs', model)
    }
})

dashboardRouter.get('/language/edit/:id', redirectIfNotLoggedIn, async (req, res) => {
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

dashboardRouter.post('/language/edit', redirectIfNotLoggedIn, validator.languageUpdateValidation, async (req, res) => {
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
        await db.languages.updateLanguage(model.language.id, model.language.name)
        res.redirect('/dashboard')
    } catch (error) {
        model.errors.push(error)
        res.render('edit-language.hbs', model)
    }
})

dashboardRouter.get('/language/delete/:id', redirectIfNotLoggedIn, async (req, res) => {
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

dashboardRouter.post('/language/delete', redirectIfNotLoggedIn, async (req, res) => {
    const model = {
        pageTitle: DELETE_LANGUAGE_PAGE_TITLE,
        errors: [],
        language: {
            id: req.body.id,
            name: req.body.name
        }
    }

    try {
        await db.languages.deleteLanguage(model.language.id)
        res.redirect('/dashboard')
    } catch (error) {
        model.errors.push(error)
        res.render('delete-language.hbs', model)
    }
})

module.exports = dashboardRouter
