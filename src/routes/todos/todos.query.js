require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const verify_token = require('../../middleware/auth.js');

router.get('/todos', verify_token, (req, res) => {
    const user_mail = req.email;
    db.query('SELECT id FROM user WHERE email = ?', user_mail, (err, result) => {
        if (err) {
            res.setHeader('content-type', 'application/json');
            return res.status(500).send(JSON.stringify({msg: "Internal server error"}));
        }
        const user_id = result[0];
        const query = 'SELECT id, title, description, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") AS created_at, DATE_FORMAT(due_time, "%Y-%m-%d %H:%i:%s") AS due_time, user_id, status FROM todo WHERE user_id = ?';
        db.query(query, user_id, (todo_err, todo_result) => {
            if (todo_err) {
                return res.status(500).json({msg: "Internal server error"});
            }
            for (let i = 0; i < todo_result.length; i++) {
                todo_result[i].id = todo_result[i].id + "";
            }
            res.json(todo_result);
        })
    })
})

router.get('/todos/:id', verify_token, (req, res) => {
    const todo_id = req.params.id;
    const query = 'SELECT id, title, description, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") AS created_at, DATE_FORMAT(due_time, "%Y-%m-%d %H:%i:%s") AS due_time, user_id, status FROM todo WHERE id = ?';
    db.query(query, todo_id, (err, result) => {
        if (err) {
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