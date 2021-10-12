const { check, validationResult } = require('express-validator'),
contactRouter = require('express').Router(),
{ redirectToDashboardIfLoggedIn } = require('../utilities.js'),
db = require('../database/dbmanager.js'),
{ contactValidation } = require('../validator.js'),

CONTACT_PAGE_TITLE = 'Contact'



contactRouter.route('/contact')
    .get(redirectToDashboardIfLoggedIn, (req, res) => {
        const model = { pageTitle: CONTACT_PAGE_TITLE }
        res.render('contact.hbs', model)
    })
    .post(redirectToDashboardIfLoggedIn, contactValidation, async (req, res) => {
        const model  = { 
            pageTitle: CONTACT_PAGE_TITLE,
            errors: []
        },
        { name, email, message } = req.body,
        
        validationErrors = validationResult(req)
        if (!validationErrors.isEmpty()) {
            validationErrors.array().forEach(e => model.errors.push(e.msg)) // pushing only error messages

            model.name = name
            model.email = email
            model.message = message

            return res.render('contact.hbs', model);
        }
        // Insert into db ⬇
        try {
            const result = await db.messages.insertMessage(name, email, message)
            model.successMsg = result
            res.render('contact.hbs', model)
        } catch (error) {
            model.errors.push(error)
            res.render('contact.hbs', model)
        }
    })
    
module.exports = contactRouter
