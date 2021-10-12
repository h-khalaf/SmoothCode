const loginRouter = require('express').Router(),
bcrypt = require('bcrypt'),
{ redirectToDashboardIfLoggedIn } = require('../utilities.js'),

LOGIN_PAGE_TITLE = 'Sign in'

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
    { username, password } = req.body,
    hashedPassword = '$2b$10$t6RIOzAucOJ1PNkrkw/..uIo3xruZBZoaeF85x0PZ0m9bRA6J6Bk2'

    let passwordMatchesWithHash = false;
    try {
        passwordMatchesWithHash = await bcrypt.compare(password, hashedPassword)
    } catch (error) {
        model.errors.push('Internal Server Error')
        res.render ('login.hbs', model)
    }

    if(username.toLowerCase() == 'admin' && passwordMatchesWithHash) {
        req.session.isLoggedIn = true
        res.redirect('/dashboard')
    } else {
        model.username = username
        model.errors.push('Wrong login credentials')
        res.render('login.hbs', model)
    }
})

loginRouter.post('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error)
            console.log('Failed to sign out')
    })
    res.redirect('/login')
})


module.exports = loginRouter
