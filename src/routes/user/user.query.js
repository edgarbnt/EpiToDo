require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const verify_token = require('../../middleware/auth.js');

router.get('/user', verify_token, (req, res) => {
    const user_mail = req.email;
    const query = 'SELECT id, email, password, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") AS created_at, firstname, name FROM user WHERE email = ?';
    db.query(query, user_mail, (err, result) => {
        if (err) {
            return res.status(500).json({msg: "Internal server error"});
        }
        result[0].id = result[0].id + "";
        res.json(result[0]);
    })
});

router.get('/user/todos', verify_token, (req, res) => {
    const user_mail = req.email;
    db.query('SELECT id FROM user WHERE email = ?', user_mail, (err, result) => {
        if (err) {
            return res.status(500).json({msg: "Internal server error"});
        }
        const user_id = result[0];
        const query = 'SELECT id, title, description, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") AS created_at, DATE_FORMAT(due_time, "%Y-%m-%d %H:%i:%s") AS due_time, user_id, status FROM todo WHERE user_id = ?';
        db.query(query, user_id, (err, result) => {
            if (err) {
                return res.status(500).json({msg: "Internal server error"});
            }
            for (let i = 0; i < result.length; i++) {
                result[i].id = result[i].id + "";
            }
            res.json(result);
        })
    })
})

router.get('/users/:param', verify_token, (req, res) => {
    const user_param = req.params.param;
    const query = 'SELECT id, email, password, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") AS created_at, firstname, name FROM user WHERE id = ? OR email = ?';
    db.query(query, [user_param, user_param], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({msg: "Internal server error"});
        }
        if (result.length < 1) {
            return res.status(404).json({msg: "Not found"});
        }
        result[0].id = result[0].id + "";
        res.json(result[0]);
    })
})

module.exports = router;