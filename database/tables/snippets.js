module.exports = class Snippets {
    constructor(db) {
        this.db = db
        this.db.run(`CREATE TABLE IF NOT EXISTS Snippets
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            code TEXT NOT NULL,
            folderId INT,
            languageId INT,
            postDate TEXT DEFAULT CURRENT_TIMESTAMP,
            lastModified TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (folderId) REFERENCES Folders(id),
            FOREIGN KEY (languageId) REFERENCES Languages(id))`)
    }

    insertSnippet(title, code, folder, language) {
        return new Promise((resolve, reject) => {
            // Change to null if empty
            let folderId = folder,
                languageId = language
            if (folderId == '') folderId = null
            if (languageId == '') languageId = null
            
            // sql & params
            const sql = `INSERT INTO Snippets (title, code, folderId, languageId) VALUES (?, ?, ?, ?)`,
                params = [title, code, folderId, languageId] 
            
            this.db.run(sql, params, (error) => {
                if (error) reject('Internal Server Error')
                resolve('Added code snippet.')
            })
        })
    }

    getSnippet(snippetId) {
        return new Promise((resolve, reject) => {
            // query & param
            const query = `SELECT * FROM Snippets WHERE id = ?`,
                param = [snippetId]

            this.db.get(query, param, (error, row) => {
                if (error) reject('Internal Server Error')
                resolve (row)
            })
        })
    }

    getAllSnippets() {
        return new Promise((resolve, reject) => {
            // query
            const query = `SELECT * FROM Snippets`
            
                this.db.all(query, [], (error, rows) => {
                    if (error) reject('Internal Server Error')
                    resolve(rows)
                })
        })
    }

    getAllFolderSnippets(folderId) {
        return new Promise((resolve, reject) => {
            // query & param
            const query = `SELECT * FROM Snippets WHERE folderId = ?`,
                param = [folderId]
            
            this.db.all(query, param, (error, rows) => {
                if (error) reject('Internal Server Error')
                resolve(rows)
            })
        })
    }

    getLatestSnippet () {
        return new Promise((resolve, reject) => {
            // query 
            const query = `SELECT * FROM Snippets ORDER BY id DESC LIMIT 1`

            this.db.get(query, [], (error, row) => {
                if (error) reject('Internal Server Error')
                resolve (row)
            })
        })
    }

    updateSnippet(id, title, code, folder, language) {
        return new Promise((resolve, reject) => {
            // Change to null if empty
            let folderId = folder,
                languageId = language
            if (folderId == '') folderId = null
            if (languageId == '') languageId = null

            // sql & params
            const sql = `UPDATE Snippets SET title = ?, code = ?, folderId = ?, languageId = ?, lastModified = DateTime('NOW') WHERE id = ?`,
                params = [title, code, folderId, languageId, id]
            
            this.db.run(sql, params, (error) => {
                if (error) reject('Internal Server Error')
                resolve('Updated code snippet')
            })
        })
    }

    deleteSnippet(snippetId) {
        return new Promise((resolve, reject) => {
            // sql & param
            const sql = `DELETE FROM Snippets WHERE id = ?`,
                param = [snippetId]
            
            this.db.run(sql, param, (error) => {
                if (error) reject('Internal Server Error')
                resolve('Deleted code snippet.')
            })
        })
    }

    setSnippetsFolderToNull(folderId) {
        return new Promise((resolve, reject) => {
            // sql & param
            const sql = `UPDATE Snippets SET folderId = NULL, lastModified = DateTime('NOW') WHERE folderId = ?`,
                param = [folderId]
            
            this.db.run(sql, param, (error) => {
                if (error) reject('Internal Server Error')
                resolve('Updated snippets folder')
            })
        })
    }

    setSnippetsLanguageToNull(languageId) {
        return new Promise((resolve, reject) => {
            // sql & param
            const sql = `UPDATE Snippets SET languageId = NULL, lastModified = DateTime('NOW') WHERE languageId = ?`,
                param = [languageId]
            
            this.db.run(sql, param, (error) => {
                if (error) reject('Internal Server Error')
                resolve('Updated snippets language')
            })
        })
    }

    countSnippets() {
        return new Promise((resolve, reject) => {
            // query
            const query = `SELECT COUNT(*) as count FROM Snippets`

            this.db.get(query, [], (error, row) => {
                if (error) reject('Internal Server Error')
                resolve (row)
            })
        })
    }

}