const ERROR_500 = 'Internal Server Error',
FOREIGN_KEY_CONSTRAINT_ERROR_MESSAGE = 'Either the selected language or folder have been removed',
FOREIGN_KEY_CONSTRAINT_ERROR_NUMBER = 19

module.exports = class Snippets {
    #db
    constructor(db) {
        this.#db = db
        this.#db.run(`CREATE TABLE IF NOT EXISTS Snippets
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            code TEXT NOT NULL,
            folderId INT,
            languageId INT,
            postDate TEXT DEFAULT CURRENT_TIMESTAMP,
            lastModified TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (folderId) REFERENCES Folders(id)
            ON DELETE SET NULL,
            FOREIGN KEY (languageId) REFERENCES Languages(id)
            ON DELETE SET NULL
            )`)
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
            
            this.#db.run(sql, params, (error) => {
                if(error) {
                    if (error.errno == FOREIGN_KEY_CONSTRAINT_ERROR_NUMBER) reject(FOREIGN_KEY_CONSTRAINT_ERROR_MESSAGE)
                    else reject(ERROR_500)
                }
                resolve('Added code snippet.')
            })
        })
    }

    getSnippet(id) {
        return new Promise((resolve, reject) => {
            // query & param
            const query = `SELECT  *,
                        (SELECT name FROM Folders WHERE id = Snippets.folderId) AS folder,
                        (SELECT name FROM Languages WHERE id = Snippets.languageId) AS language
                        FROM Snippets WHERE id = ?`,
            param = [id]

            this.#db.get(query, param, (error, row) => {
                if (error) reject(ERROR_500)
                resolve (row)
            })
        })
    }

    getAllSnippets() {
        return new Promise((resolve, reject) => {
            // query
            const query = `SELECT  *,
                        (SELECT name FROM Folders WHERE id = Snippets.folderId) AS folder,
                        (SELECT name FROM Languages WHERE id = Snippets.languageId) AS language
                        FROM Snippets`
            
                this.#db.all(query, [], (error, rows) => {
                    if (error) reject(ERROR_500)
                    resolve(rows)
                })
        })
    }

    getSnippets(limit, offset) {
        return new Promise((resolve, reject) => {
            // query & params
            const query = `SELECT  *,
                        (SELECT name FROM Folders WHERE id = Snippets.folderId) AS folder,
                        (SELECT name FROM Languages WHERE id = Snippets.languageId) AS language
                        FROM Snippets ORDER BY id DESC 
                        LIMIT ? OFFSET ?`,
                params = [limit, offset]
            
                this.#db.all(query, params, (error, rows) => {
                    if (error) reject(ERROR_500)
                    resolve(rows)
                })
        })
    }

    getSnippetsSearchResult(search, languageId, limit, offset) {
        return new Promise((resolve, reject) => {

            let query, params

            if (languageId == "all") {
                query = `SELECT  *,
                        (SELECT name FROM Folders WHERE id = Snippets.folderId) AS folder,
                        (SELECT name FROM Languages WHERE id = Snippets.languageId) AS language
                        FROM Snippets WHERE title LIKE ? ORDER BY id DESC 
                        LIMIT ? OFFSET ?`       
                params = ['%'+search+'%', limit, offset]
            
            } else if (languageId == "unspecified") {
                query = `SELECT  *,
                        (SELECT name FROM Folders WHERE id = Snippets.folderId) AS folder,
                        (SELECT name FROM Languages WHERE id = Snippets.languageId) AS language
                        FROM Snippets WHERE title LIKE ? AND languageId IS NULL ORDER BY id DESC
                        LIMIT ? OFFSET ?` 
                params = ['%'+search+'%', limit, offset]
            
            } else {
                query = `SELECT  *,
                        (SELECT name FROM Folders WHERE id = Snippets.folderId) AS folder,
                        (SELECT name FROM Languages WHERE id = Snippets.languageId) AS language
                        FROM Snippets WHERE title LIKE ? AND languageId = ? ORDER BY id DESC
                        LIMIT ? OFFSET ?` 
                params = ['%'+search+'%', languageId, limit, offset]
            }      
            
            this.#db.all(query, params, (error, rows) => {
                if (error) reject(ERROR_500)
                resolve(rows)
            })
        })
    }

    getSearchTotalItems(search, languageId) {
        return new Promise((resolve, reject) => {
            
            let query, params
            
            if (languageId == "all") {
                query = `SELECT COUNT(id) AS count FROM Snippets
                        WHERE title LIKE ?`    
                params = ['%'+search+'%']

            } else if (languageId == "unspecified") {
                query = `SELECT COUNT(id) AS count FROM Snippets 
                            WHERE title LIKE ? AND languageId IS NULL`
                params = ['%'+search+'%']
            
            } else {
                query = `SELECT COUNT(id) AS count FROM Snippets 
                            WHERE title LIKE ? AND languageId = ?`
                params = ['%'+search+'%', languageId]
            }      
            
            this.#db.get(query, params, (error, row) => {
                if (error) reject(ERROR_500)
                resolve(row)
            })
        })
    }


    getAllFolderSnippets(folderId) {
        return new Promise((resolve, reject) => {
            // query & param
            const query = `SELECT *,
                        (SELECT name FROM Languages WHERE id = Snippets.languageId) AS language
                        FROM Snippets WHERE folderId = ?`,
            param = [folderId]
            
            this.#db.all(query, param, (error, rows) => {
                if (error) reject(ERROR_500)
                resolve(rows)
            })
        })
    }

    getLatestSnippet () {
        return new Promise((resolve, reject) => {
            // query 
            const query = `SELECT  *,
                        (SELECT name FROM Folders WHERE id = Snippets.folderId) AS folder,
                        (SELECT name FROM Languages WHERE id = Snippets.languageId) AS language
                        FROM Snippets 
                        ORDER BY id DESC LIMIT 1`

            this.#db.get(query, [], (error, row) => {
                if (error) reject(ERROR_500)
                resolve (row)
            })
        })
    }

    updateSnippet(id, title, code, folderId, languageId) {
        return new Promise((resolve, reject) => {
            // Change to null if empty
            let folderID = folderId,
                languageID = languageId
            if (folderID == '') folderID = null
            if (languageID == '') languageID = null

            // sql & params
            const sql = `UPDATE Snippets SET title = ?, code = ?, folderId = ?, languageId = ?, lastModified = DateTime('NOW') WHERE id = ?`,
                params = [title, code, folderID, languageID, id]
            
            this.#db.run(sql, params, (error) => {
                if(error) {
                    if (error.errno == FOREIGN_KEY_CONSTRAINT_ERROR_NUMBER) reject(FOREIGN_KEY_CONSTRAINT_ERROR_MESSAGE)
                    else reject(ERROR_500)
                }
                resolve('Updated code snippet')
            })
        })
    }

    deleteSnippet(snippetId) {
        return new Promise((resolve, reject) => {
            // sql & param
            const sql = `DELETE FROM Snippets WHERE id = ?`,
                param = [snippetId]
            
            this.#db.run(sql, param, (error) => {
                if (error) reject(ERROR_500)
                resolve('Deleted code snippet.')
            })
        })
    }

    countSnippets() {
        return new Promise((resolve, reject) => {
            // query
            const query = `SELECT COUNT(*) as count FROM Snippets`

            this.#db.get(query, [], (error, row) => {
                if (error) reject(ERROR_500)
                resolve (row)
            })
        })
    }

}