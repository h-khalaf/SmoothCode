const folderRouter = require('express').Router(),
{ redirectIfNotLoggedIn, keepFirstLettersObjectArray } = require('../utilities.js'),
{ validationResult } = require('express-validator'),
db = require('../database/dbmanager.js'),
validator = require('../validator.js')

FOLDERS_PAGE_TITLE = 'Folders',
CREATE_FOLDER_PAGE_TITLE = 'Create Folder',
EDIT_FOLDER_PAGE_TITLE = 'Edit Folder',
DELETE_FOLDER_PAGE_TITLE = 'Delete Folder'

folderRouter.get('/folders', async (req, res) => {
    const model = {
        pageTitle: FOLDERS_PAGE_TITLE,
        errors: []
    }

    try {
        model.folders = await db.folders.getAllFolders()
        keepFirstLettersObjectArray(model.folders, 'name', 18)
        res.render('folders.hbs', model)
    } catch (error) {
        model.errors.push(error)
        res.render('folders.hbs')
    }
})

folderRouter.get('/folder/:id', validator.paramIdEscaping, async (req, res) => {
    const model = {
        errors: []
    },
    
    folderId = req.params.id
    try {
        const folder = await db.folders.getFolder(folderId)
        if(folder === undefined) return res.redirect('/404') // Folder does not exist

        model.folder = folder
        model.pageTitle = folder.name
        model.snippets = await db.snippets.getAllFolderSnippets(folderId)
        
        keepFirstLettersObjectArray(model.snippets, 'title', 18)
        res.render('folder.hbs', model)
    } catch (error) {
        model.errors.push(error)
        res.render('folder.hbs', model)
    }
})

folderRouter.get('/create-folder', redirectIfNotLoggedIn, (req, res) => {
    const model = { pageTitle: CREATE_FOLDER_PAGE_TITLE }
    res.render('create-folder.hbs', model)
})

folderRouter.post('/create-folder', redirectIfNotLoggedIn, validator.folderCreateValidation, async (req, res) => {
    const model = { 
        pageTitle: CREATE_FOLDER_PAGE_TITLE,
        errors: [],
        folderName: req.body.folderName
    }

    validationErrors = validationResult(req)
        if (!validationErrors.isEmpty()) {
            validationErrors.array().forEach(e => model.errors.push(e.msg)) // pushing only error messages
            return res.render('create-folder.hbs', model)
        }

        try {
            await db.folders.createFolder(model.folderName)
            res.redirect('/dashboard')
        } catch (error) {
            model.errors.push(error)
            res.render('create-folder.hbs', model)
        }
})

folderRouter.get('/edit-folder/:id', redirectIfNotLoggedIn, validator.paramIdEscaping, async (req, res) => {
    const model = { 
        pageTitle: EDIT_FOLDER_PAGE_TITLE,
        errors: [] 
    },
    folderId = req.params.id
    try {
        const folder = await db.folders.getFolder(folderId)
        if(folder === undefined) return res.redirect('/404') // Folder does not exist

        model.folder = folder
        res.render('edit-folder.hbs', model)
    } catch (error) {
        model.errors.push(error)
        res.render('edit-folder.hbs', model)
    }
})

folderRouter.post('/edit-folder', redirectIfNotLoggedIn, validator.folderUpdateValidation, async (req, res) => {
    const model = { 
        pageTitle: EDIT_FOLDER_PAGE_TITLE,
        errors: [] 
    },
    folderId = req.body.folderId,
    folderName = req.body.folderName,

    validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
        validationErrors.array().forEach(e => model.errors.push(e.msg)) // pushing only error messages

        model.folder = { 
            id: folderId,
            name: folderName
        }
        return res.render('edit-folder.hbs', model)
    }

    try {
        await db.folders.updateFolder(folderId, folderName)
        res.redirect('/dashboard')
    } catch (error) {
        model.errors.push(error)
        res.render('edit-folder.hbs', model)
    }
})


folderRouter.get('/delete-folder/:id', redirectIfNotLoggedIn, validator.paramIdEscaping, async (req, res) => {
    const model = {
        pageTitle: DELETE_FOLDER_PAGE_TITLE,
        errors: []
    },
    folderId = req.params.id
    try {
        const folder = await db.folders.getFolder(folderId)
        if(folder === undefined) return res.redirect('/404') // Folder does not exist
        
        model.folder = folder
        res.render('delete-folder.hbs', model)
    } catch (error) {
        model.errors.push(error)
        res.render('delete-folder.hbs', model)
    }
})

folderRouter.post('/delete-folder', redirectIfNotLoggedIn, validator.bodyIdEscaping, async (req, res) => {
    const model = {
        pageTitle: DELETE_FOLDER_PAGE_TITLE,
        errors: []
    },
    folderId = req.body.id
    
    try {
        await db.snippets.setSnippetsFolderToNull(folderId)
        await db.folders.deleteFolder(folderId)
        res.redirect('/folders')
    } catch (error) {
        model.errors.push(error)
        res.render('delete-folder.hbs', model)
    }
})

module.exports = folderRouter
