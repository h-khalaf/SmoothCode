const mainRouter = require('express').Router(),
{ redirectToDashboardIfLoggedIn } = require('../utilities.js'),

INDEX_PAGE_TITLE = 'Home',
ERROR_404_PAGE_TTITLE = 'Page Not Found'

// Route handlers

// Index page
mainRouter.get('/' , redirectToDashboardIfLoggedIn, (req, res) => {
    const model = { pageTitle: INDEX_PAGE_TITLE }
    res.render('start.hbs', model)
})

mainRouter.use(require('./admin.js'))
mainRouter.use(require('./contact.js'))
mainRouter.use(require('./dashboard.js'))
mainRouter.use(require('./folder.js'))
mainRouter.use(require('./snippet.js'))


// 404 Error page
mainRouter.get('/404', (req, res) => {
    const model = { pageTitle: ERROR_404_PAGE_TTITLE }
    res.status(404).render('404.hbs', model)
})

// Capture 404 errors (Must be last route)
mainRouter.use((req, res) => {
    res.redirect('/404')
})

module.exports = mainRouter
