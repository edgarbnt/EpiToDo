require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./config/db');
const app = express();
const port = `${process.env.PORT}`;
const auth_routes = require('./routes/auth/auth');
const user_query_routes = require('./routes/user/user.query')
const user_routes = require('./routes/user/user')
const todos_query_routes = require('./routes/todos/todos.query')
const todos_routes = require('./routes/todos/todos')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(auth_routes);
app.use(user_query_routes);
app.use(user_routes);
app.use(todos_query_routes);
app.use(todos_routes);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})