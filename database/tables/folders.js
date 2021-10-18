module.exports = class Folders {
    #db
    constructor(db) {
        this.#db = db
        this.#db.run(`CREATE TABLE IF NOT EXISTS Folders
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL)`)
    }

    createFolder(name) {
        return new Promise((resolve, reject) => {
            // sql & param
            const sql = `INSERT INTO Folders (name) VALUES (?)`,
                param = [name]
            
            this.#db.run(sql, param, (error) => {
                if (error) reject('Internal Server Error')
                resolve('Folder successfully created')
            })
        })
    }

    getFolder(id) {
        return new Promise((resolve, reject) => {
            // query & param
            const query = `SELECT * FROM Folders WHERE id = ?`,
                param = [id]
            
            this.#db.get(query, param, (error, row) => {
                if (error) reject('Internal Server Error')
                resolve (row)
            })
        })
    }

    getAllFolders() {
        return new Promise((resolve, reject) => {
            // query
            const query = `SELECT F.id AS id, F.name AS name, 
                (SELECT COUNT(id) FROM Snippets WHERE folderId =  F.id) AS snippetsCount 
                FROM Folders F`

            this.#db.all(query, [], (error, rows) => {
                if (error) reject('Internal Server Error')
                resolve (rows)
            })
        })
    }
    
    updateFolder(id, name) {
        return new Promise((resolve, reject) => {
            // sql & params
            const sql = `UPDATE Folders SET name = ? WHERE id = ?`,
                params = [name, id]
            
            this.#db.run(sql, params, (error) => {
                if (error) reject('Internal Server Error')
                resolve('Folder successfully edited')
            })
        })
    }

    deleteFolder(id) {
        return new Promise((resolve, reject) => {
            // sql & param
            const sql = `DELETE FROM Folders WHERE id = ?`,
                param = [id]
    
            this.#db.run(sql, param, (error) => {
                if (error) reject('Internal Server Error')
                resolve('Folder successfully deleted')
            })
        })
    }

    countFolders() {
        return new Promise((resolve, reject) => {
            // query
            const query = `SELECT COUNT(*) as count FROM Folders`

            this.#db.get(query, [], (error, row) => {
                if (error) reject('Internal Server Error')
                resolve (row)
            })
        })
    }
}
