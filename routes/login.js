const loginRouter = require('express').Router(),
bcrypt = require('bcrypt'),
{ redirectToDashboardIfLoggedIn } = require('../utilities.js'),

LOGIN_PAGE_TITLE = 'Sign in',
LOGOUT_ERROR_TITLE = 'Failed to logout',
USERNAME = 'admin',
HASHED_PASSWORD = '$2b$10$t6RIOzAucOJ1PNkrkw/..uIo3xruZBZoaeF85x0PZ0m9bRA6J6Bk2'

loginRouter.get('/login', redirectToDashboardIfLoggedIn, (req, res) => {
    const model = { pageTitle: LOGIN_PAGE_TITLE }
    res.render('login.hbs', model)
})

loginRouter.post('/login', redirectToDashboardIfLoggedIn, async (req, res) =>{
    // According to instructions, login authentication should be hardcoded.
    // Notice: login form is not validated here because there is no interaction with the database.
    const model = { 
        pageTitle: LOGIN_PAGE_TITLE,
        errors: []
    },
    {username, password} = req.body

    let passwordMatchesWithHash = false;
    try {
        passwordMatchesWithHash = await bcrypt.compare(password, HASHED_PASSWORD)
    } catch (error) {
        model.errors.push('Internal Server Error')
        res.render ('login.hbs', model)
    }

    if(username.toLowerCase() == USERNAME && passwordMatchesWithHash) {
        req.session.isLoggedIn = true
        res.redirect('/dashboard')
    } else {
        model.username = username
        model.errors.push('Wrong login credentials')
        res.render('login.hbs', model)
    }
})

loginRouter.post('/logout', (req, res) => {
    model = {
        pageTitle: LOGOUT_ERROR_TITLE,
        errors: []
    }

    req.session.destroy((error) => {
        if (error) {
            model.errors.push('Failed to sign out')
            res.render('dashboard.hbs', model)
        }
        else res.redirect('/login')
    })
})


module.exports = loginRouter
