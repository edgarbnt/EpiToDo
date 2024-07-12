const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    database: `${process.env.MYSQL_DATABASE}`,
    host: `${process.env.MYSQL_HOST}`,
    user: `${process.env.MYSQL_USER}`,
    password: `${process.env.MYSQL_ROOT_PASSWORD}`
});

module.exports = db;