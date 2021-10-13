const mainRouter = require('express').Router(),
{ redirectToDashboardIfLoggedIn } = require('../utilities.js'),

INDEX_PAGE_TITLE = 'Home',
ERROR_PAGE_TTITLE = 'Page Not Found'

// Route handlers

// Index page
mainRouter.get('/' , redirectToDashboardIfLoggedIn, (req, res) => {
    const model = { pageTitle: INDEX_PAGE_TITLE }
    res.render('start.hbs', model)
})

mainRouter.use(require('./login.js'))
mainRouter.use(require('./contact.js'))
mainRouter.use(require('./dashboard.js'))
mainRouter.use(require('./folder.js'))
mainRouter.use(require('./snippet.js'))

// Capture 404 errors (Must be last route)
mainRouter.use((req, res) => {
    const model = { pageTitle: ERROR_PAGE_TTITLE }
    res.status(404).render('404.hbs', model)
})

module.exports = mainRouter
