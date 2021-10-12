module.exports = class Snippets {
    constructor(db) {
        this.db = db
        this.db.run(`CREATE TABLE IF NOT EXISTS Snippets
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            code TEXT NOT NULL,
            folderId INT,
            postDate TEXT DEFAULT CURRENT_TIMESTAMP,
            lastModified TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (folderId) REFERENCES Folders(id))`)
    }

    insertSnippet(title, code, folder) {
        return new Promise((resolve, reject) => {
            // Change folderId to NULL if folder string empty
            let folderId = folder
            if (folderId == '') folderId = null
            
            // sql & params
            const sql = `INSERT INTO Snippets (title, code, folderId) VALUES (?, ?, ?)`,
                params = [title, code, folderId] 
            
            this.db.run(sql, params, (error) => {
                if (error) reject('Internal Server Error')
                resolve('Added code snippet.')
            })
        })
    }

    getSnippet(snippetId) {
        return new Promise((resolve, reject) => {
            // query & params
            const query = `SELECT * FROM Snippets WHERE id = ?`,
                params = [snippetId]

            this.db.get(query, params, (error, row) => {
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
            // query
            const query = `SELECT * FROM Snippets WHERE folderId = ?`,
                params = [folderId]
            
            this.db.all(query, params, (error, rows) => {
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

    updateSnippet(id, title, code, folder) {
        return new Promise((resolve, reject) => {
            // Change to NULL if empty
            let folderId = folder
            if (folderId == '') folderId = null

            // sql & params
            const sql = `UPDATE Snippets SET title = ?, code = ?, folderId = ?, lastModified = DateTime('NOW') WHERE id = ?`,
                params = [title, code, folderId, id]
            
            this.db.run(sql, params, (error) => {
                if (error) reject('Internal Server Error')
                resolve('Updated code snippet')
            })
        })
    }

    deleteSnippet(snippetId) {
        return new Promise((resolve, reject) => {
            // sql & params
            const sql = `DELETE FROM Snippets WHERE id = ?`,
                params = [snippetId]
            
            this.db.run(sql, params, (error) => {
                if (error) reject('Internal Server Error')
                resolve('Deleted code snippet.')
            })
        })
    }

    setSnippetsFolderToNull(folderId) {
        return new Promise((resolve, reject) => {
            // sql & params
            const sql = `UPDATE Snippets SET folderId = NULL, lastModified = DateTime('NOW') WHERE folderId = ?`,
                params = [folderId]
            
            this.db.run(sql, params, (error) => {
                if (error) reject('Internal Server Error')
                resolve('Updated snippets folder')
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