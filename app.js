// npm packages
const express = require('express'),
handlebars = require('express-handlebars'),
path = require('path'),
session = require('express-session'),
cookieParser = require('cookie-parser'),
randomString = require('randomstring'),
SQLiteStore = require('connect-sqlite3')(session),
csrfProtection = require('csurf')({cookie: true}),

// Files
routes = require('./routes'),
{ baseModel } = require('./utilities.js'),

PORT = 8080,
app = express()
require('./database/dbmanager.js')

// Urlencode middleware (for POST requests)
app.use(express.json())
app.use(express.urlencoded({extended : false}))

// csurf 
app.use(cookieParser())

// Path to static folder
app.use('/static', express.static(path.join(__dirname, '/static')))

// Setting engine to hbs files
app.engine('hbs', handlebars ({
    extname: 'hbs',
    defaultLayout: 'main',
    partialsDir: __dirname + '/views/partials',
    layoutsDir: __dirname + '/views/layouts'
}))

// Session settings
app.use(
    session({
        secret: randomString.generate(),
        resave: false,
        saveUninitialized: false,
        store: new SQLiteStore({db: 'sessions.db'})
    })
)

// CsrfProtection (Declared here instead of using it on every route)
app.use(csrfProtection)

// Base model
app.use(baseModel)

// Include routes
app.use(routes)

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
})
