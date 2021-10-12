module.exports = class Messages {
    constructor(db) {
        this.db = db
        this.db.run(`CREATE TABLE IF NOT EXISTS Messages
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            postDate TEXT DEFAULT CURRENT_TIMESTAMP)`)
    }

    insertMessage (name, email, message) {
        return new Promise((resolve, reject) => {
            // sql & params
            const sql = `INSERT INTO Messages (name, email, message) VALUES (?, ?, ?)`,
                params = [name, email, message]
            
            this.db.run(sql, params, (error) => {
                if (error) reject('Internal Server Error')
                resolve('Message successfully sent')
            })
        })
    }

    getAllMessages() {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM Messages ORDER BY id DESC` // Latest first

            this.db.all(query, [], (error, rows) => {
                if(error) reject('Internal Server Error')
                resolve (rows)
            })
        })
    }

    getMessage(id) {
        return new Promise((resolve, reject) => {
            // query & params
            const query = `SELECT * FROM Messages WHERE id = ?`,
                params = [id]
            
            this.db.get(query, params, (error, row) => {
                if (error) reject('Internal Server Error')
                resolve (row)
            })
        })
    }

    countMessages() {
        return new Promise((resolve, reject) => {
            // query
            const query = `SELECT COUNT(*) AS count FROM Messages`

            this.db.get(query, [], (error, row) => {
                if (error) reject('Internal Server Error')
                resolve (row)
            })
        })
    }
}
