
const hljs = require('highlight.js')

module.exports = class Languages {
    constructor(db) {
        this.db = db
        this.db.run(`CREATE TABLE IF NOT EXISTS Languages
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE)`)
    }

    insertCommonLanguages() {
        return new Promise((resolve, reject) => {

            // languages that are supported by hljs
            const hljsLanguages = hljs.listLanguages()
            // sql
            const sql = `INSERT INTO Languages (name) VALUES (?)`

            for (const language of hljsLanguages) {
                this.db.run(sql, [language], (error) => {
                    if (error) reject('Internal Server Error')
                })
            }
            resolve('hljs languages successfully added (values cannot be duplicated)')
        })
    }

    insertLanguage(name) {
        return new Promise((resolve, reject) => {

            // sql & param
            const sql = `INSERT INTO Languages (name) VALUES (?)`,
                param = [name]

            this.db.run(sql, param, (error) => {
                if (error) reject('Internal Server Error')
                resolve('Language successfully added')
            })
        })
    }

    languageIsAvailable(name) {
        return new Promise((resolve, reject) => {
            // query & param
            const query = `SELECT * FROM Languages WHERE name = ?`,
                param = [name]
            
            this.db.all(query, param, (error, result) => {
                if (error) reject('Internal Server Error')
                if (result.length > 0) resolve(false)
                else resolve(true)
            })
        })
    }

    getLanguage(id) {
        return new Promise((resolve, reject) => {
            // query & param
            const query = `SELECT * FROM Languages WHERE id = ?`,
                param = [id]
            
            this.db.get(query, param, (error, row) => {
                if (error) reject('Internal Server Error')
                resolve (row)
            })
        })
    }

    getAllLanguages() {
        return new Promise((resolve, reject) => {
            // query 
            const query = `SELECT * FROM Languages ORDER BY name ASC`

            this.db.all(query, [], (error, rows) => {
                if (error) reject('Internal Server Error')
                resolve (rows)
            })
        })
    }

    updateLanguage(id, name) {
        return new Promise((resolve, reject) => {
            // sql & params
            const sql = `UPDATE Languages SET name = ? WHERE id = ?`,
                params = [name, id]
            
            this.db.run(sql, params, (error) => {
                if (error) reject('Internal Server Error')
                resolve('Language successfully edited')
            })
        })
    }

    deleteLanguage(id) {
        return new Promise((resolve, reject) => {
            // sql & param
            const sql = `DELETE FROM Languages WHERE id = ?`,
                param = [id]
    
            this.db.run(sql, param, (error) => {
                if (error) reject('Internal Server Error', error)
                resolve('Language successfully deleted')
            })
        })
    }
}
