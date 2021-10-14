const sqlite = require('sqlite3').verbose(),

folders = require('./tables/folders.js'),
snippets = require('./tables/snippets.js'),
messages = require('./tables/messages.js'),
languages = require('./tables/languages.js')

class Database {
    constructor(dbname) {
        this.db = new sqlite.Database(dbname)

        // Enable FK constraint 
        this.db.run('PRAGMA foreign_keys = ON')
    
        // Tables
        this.folders = new folders(this.db)
        this.languages = new languages(this.db)
        this.snippets = new snippets(this.db)
        this.messages = new messages(this.db)
    }

    close() {
        this.db.close()
    }
}

module.exports = new Database('smoothcode.db')
