require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../../config/db');
const verify_token = require('../../middleware/auth.js');
const bodyParser = require("body-parser");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/todos', verify_token, (req, res) => {
    const { title, description, due_time, user_id, status } = req.body;
    if (!title || !description || !due_time || !user_id || !status) {
        return res.status(400).json({msg: "Bad parameter"});
    }
    const insert_todo_query = 'INSERT INTO todo (title, description, due_time, user_id, status) VALUES (?, ?, ?, ?, ?)';
    db.query(insert_todo_query, [title, description, due_time, user_id, status],(insert_error, insert_result) => {
        if (insert_error) {
            return res.status(500).json({msg: "Internal server error"});
        }
        const query = 'SELECT id, title, description, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") AS created_at, DATE_FORMAT(due_time, "%Y-%m-%d %H:%i:%s") AS due_time, user_id, status FROM todo WHERE id = ?';
        db.query(query, title, (err, result) => {
            if (err) {
                return res.status(500).json({msg: "Internal server error"});
            }
            result[0].id = result[0].id + "";
            res.status(201).json(result[0]);
        })
    })
})

router.put('/todos/:id', verify_token, (req, res) => {
    const todo_id = req.params.id;
    const { title, description, due_time, user_id, status } = req.body;
    if (!title || !description || !due_time || !user_id || !status) {
        return res.status(400).json({msg: "Bad parameter"});
    }
    const update_query = 'UPDATE todo SET title = ?, description = ?, due_time = ?, user_id  = ?, status = ? WHERE id = ?';
    db.query(update_query, [title, description, due_time, user_id, status, todo_id], (update_error, update_result) => {
        if (update_error) {
            return res.status(500).json({msg: "Internal server error"});
        }
        if (update_result < 1) {
            return res.status(404).json({msg: "Not found"});
        }
        const select_query = 'SELECT id, title, description, DATE_FORMAT(created_at, "%Y-%m-%d %H:%i:%s") AS created_at, DATE_FORMAT(due_time, "%Y-%m-%d %H:%i:%s") AS due_time, user_id, status FROM todo WHERE id = ?';
        db.query(select_query, todo_id, (err, result) => {
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
})

router.delete('/todos/:id', verify_token, (req, res) => {
    const todo_id = req.params.id;
    db.query('DELETE FROM todo WHERE id = ?', todo_id, (err, result) => {
        if (err) {
            return res.status(500).json({msg: "Internal server error"});
        }
        if (result.length < 1) {
            return res.status(404).json({msg: "Not found"});
        }
        return res.status(200).json({msg: `Successfully deleted record number: ${todo_id}`});
    })
})

module.exports = router;