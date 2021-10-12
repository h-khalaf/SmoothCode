dashboardRouter = require('express').Router(),
{ redirectIfNotLoggedIn, highlightCode } = require('../utilities.js'),
db = require('../database/dbmanager.js'),
{ validationResult } = require('express-validator'),
validator = require('../validator.js'),

DASHBOARD_PAGE_TITLE = 'Dashboard',
MESSAGES_PAGE_TITLE = 'Messages'

dashboardRouter.get('/dashboard', redirectIfNotLoggedIn, async (req, res) => {
    const model = { 
        pageTitle: DASHBOARD_PAGE_TITLE,
        errors: []
    }

    try {
        const snippetsCount = await db.snippets.countSnippets(),
        foldersCount = await db.folders.countFolders(),
        messagesCount = await db.messages.countMessages(),
        lastestCodeSnippet = await db.snippets.getLatestSnippet(),
        folders = await db.folders.getAllFolders()
        
        model.snippetsCount = snippetsCount.count
        model.foldersCount = foldersCount.count
        model.messagesCount = messagesCount.count
        model.lastestCodeSnippet = lastestCodeSnippet
        model.folders = folders

        if(categories.postDate !== categories.lastModified)
            model.categories.edited = true


        highlightCode(model.code)

        res.render('dashboard.hbs', model)
    } catch (error) {
        model.errors.push(error)
        res.render('dashboard.hbs', model)
    }    
})



module.exports = dashboardRouter
