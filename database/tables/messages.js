const ERROR_500 = 'Internal Server Error'

module.exports = class Messages {
    #db
    constructor(db) {
        this.#db = db
        this.#db.run(`CREATE TABLE IF NOT EXISTS Messages
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            postDate TEXT DEFAULT CURRENT_TIMESTAMP,
            readDate TEXT DEFAULT NULL)`)
    }

    insertMessage (name, email, message) {
        return new Promise((resolve, reject) => {
            // sql & params
            const sql = `INSERT INTO Messages (name, email, message) VALUES (?, ?, ?)`,
                params = [name, email, message]
            
            this.#db.run(sql, params, (error) => {
                if (error) reject(ERROR_500)
                resolve('Message successfully sent')
            })
        })
    }

    getAllMessages() {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM Messages ORDER BY id DESC` // Latest first

            this.#db.all(query, [], (error, rows) => {
                if(error) reject(ERROR_500)
                resolve (rows)
            })
        })
    }

    getMessage(id) {
        return new Promise((resolve, reject) => {
            // query & param
            const query = `SELECT * FROM Messages WHERE id = ?`,
                param = [id]
            
            this.#db.get(query, param, (error, row) => {
                if (error) reject(ERROR_500)
                resolve (row)
            })
        })
    }

    setReadDate(id) {
        return new Promise((resolve, reject) => {
            // sql & param
            const sql = `UPDATE Messages SET readDate = DateTime('NOW') WHERE id = ?`,
                param = [id]
    
            this.#db.run(sql, param, (error) => {
                if (error) reject(ERROR_500)
                resolve('Message successfully deleted')
            })
        })
    }


    deleteMessage(id) {
        return new Promise((resolve, reject) => {
            // sql & param
            const sql = `DELETE FROM Messages WHERE id = ?`,
                param = [id]
    
            this.#db.run(sql, param, (error) => {
                if (error) reject(ERROR_500)
                resolve('Message successfully deleted')
            })
        })
    }

    countMessages() {
        return new Promise((resolve, reject) => {
            // query
            const query = `SELECT COUNT(*) AS count FROM Messages`

            this.#db.get(query, [], (error, row) => {
                if (error) reject(ERROR_500)
                resolve (row)
            })
        })
    }
}
