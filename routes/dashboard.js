const dashboardRouter = require('express').Router(),
hljs  = require('highlight.js'),
{ redirectIfNotLoggedIn } = require('../utilities.js'),
db = require('../database/dbmanager.js'),

DASHBOARD_PAGE_TITLE = 'Dashboard',
MESSAGES_PAGE_TITLE = 'Messages',
DEFAULT_MESSAGE_PAGE_TITLE = 'Message',
DELETE_MESSAGE_PAGE_TITLE = 'Delete message',
MESSAGE_NOT_FOUND_TITLE = 'Message not found'

dashboardRouter.get('/dashboard', redirectIfNotLoggedIn, async (req, res) => {
    const model = { 
        pageTitle: DASHBOARD_PAGE_TITLE,
        errors: []
    }

    try {
        const snippets = await db.snippets.countSnippets(),
        folders = await db.folders.countFolders(),
        messages = await db.messages.countMessages(),
        lastestCodeSnippet = await db.snippets.getLatestSnippet()
        
        model.snippetsCount = snippets.count
        model.foldersCount = folders.count
        model.messagesCount = messages.count
        model.lastestCodeSnippet = lastestCodeSnippet
        // Overwriting the code with the highlighted code
        model.lastestCodeSnippet.code = hljs.highlightAuto(lastestCodeSnippet.code).value 

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

module.exports = dashboardRouter
