var express = require('express');
var bodyParser = require('body-parser');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./model/todo');
var { User } = require('./model/user');

var app = express();
/** 
 * middle ware
 * */
app.use(bodyParser.json());
/**
 *  routes
 */

/**
 * create todo
 */
app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });
    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    })
});

/**
 * read todos
 */
app.get('/todos', (req, res) => {
    Todo.find().then((doc) => {
        res.send({
            todos: doc
        });
    }, (e) => {
        res.status(400).send(e);
    })
});
app.listen(3000, () => {
    console.log('started on post 3000');
});
module.exports = { app };