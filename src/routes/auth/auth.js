require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../../config/db');
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.post('/register', (req, res) => {
    const checkUserQuery = 'SELECT COUNT(*) as count FROM user WHERE email = ?';
    const { email, name, firstname, password } = req.body;
    if (!email || !name || !firstname || !password) {
        return res.status(400).json({msg: "Bad parameter"});
    }
    db.query(checkUserQuery, req.body.email, (err, result) => {
        if (err) {
            return res.status(500).json({msg: "Internal server error"});
        }
        if (result[0].count > 0) {
            return res.status(409).json({msg: "Account already exists"});
        }
        bcrypt.hash(req.body.password, 10, (hash_error, hashed_password) => {
            if (hash_error) {
                return res.status(500).json({msg: "Internal server error"});
            }
            const insert_user_query = 'INSERT INTO user (email, password, name, firstname) VALUES (?, ?, ?, ?)';
            db.query(insert_user_query, [email, hashed_password, name, firstname], (insert_error, result) => {
                if (insert_error) {
                    return res.status(500).json({msg: "Internal server error"});
                }
                const token = jwt.sign({"email": email, "name": name, "firstname": firstname}, `${process.env.SECRET}`, {expiresIn: '2h'});
                res.status(201).json({token});
            })
        })
    })
})

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({msg: "Bad parameter"});
    }
    db.query('SELECT * FROM user where email = ?', [email], (err, results) => {
        if (err) {
            return res.status(500).json({msg: "Internal server error"});
        }
        if (results.length === 0) {
            return res.status(401).json({msg: "Invalid Credentials"});
        }
        const user = results[0];
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return res.status(500).json({msg: "Internal server error"});
            }
            if (result) {
                const token = jwt.sign({"email": user.email, "name": user.name, "firstname": user.firstname}, `${process.env.SECRET}`, {expiresIn: '2h'});
                res.status(201).json({token});
            } else {
                res.status(401).json({msg: "Invalid Credentials"});
            }
        });
    });
});

module.exports = router;
