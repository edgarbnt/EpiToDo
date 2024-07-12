require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const verify_token = require('../../middleware/auth.js');
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.put('/users/:id', verify_token, (req, res) => {
    const user_id = req.params.id;
    const { email, password, firstname, name } = req.body;
    if (!email || !password || !firstname || !name) {
        return res.status(400).json({msg: "Bad parameter"});
    }
    bcrypt.hash(password, 10, (hash_error, hash) => {
        if (hash_error) {
            return res.status(500).json({msg: "Internal server error"});
        }
        const query = 'UPDATE user SET email = ?, password = ?, firstname = ?, name = ? WHERE id = ?';
        db.query(query, [email, hash, firstname, name, user_id], (insert_error, result) => {
            if (insert_error) {
                return res.status(500).json({msg: "Internal server error"});
            }
            if (result.length < 1) {
                return res.status(404).json({msg: "Not found"});
            }
            const select_query = 'SELECT id, email, password, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") AS created_at, firstname, name FROM user WHERE id = ?';
            db.query(select_query, user_id, (err, select_result) => {
                if (err) {
                    return res.status(500).json({msg: "Internal server error"});
                }
                if (select_result.length < 1) {
                    return res.status(404).json({msg: "Not found"});
                }
                select_result[0].id = select_result[0].id + "";
                res.json(select_result[0]);
            })
        })
    })
})

router.delete('/users/:id', verify_token, (req, res) => {
    const user_id = req.params.id;
    db.query('DELETE FROM user WHERE id = ?', user_id, (err, result) => {
        if (err) {
            return res.status(500).json({msg: "Internal server error"});
        }
        if (result.length < 1) {
            return res.status(404).json({msg: "Not found"});
        }
        return res.status(200).json({msg: `Successfully deleted record number: ${req.params.id}`});
    })
})

module.exports = router;