const mysql = require("mysql2");
const dbConfig = require("../config/dbConfig");

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to MySQL database.");
});

module.exports = connection;