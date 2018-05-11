require('./config/config')
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');
var { mongoose } = require('./db/mongoose');
var { Todo } = require('./model/todo');
var { User } = require('./model/user');

var app = express();
const port = process.env.PORT;
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
/**
 *  read todo
 */
app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(400).send();
    }
    Todo.findById(id).then(doc => {
        if (!doc) {
            return res.status(400).send();
        }
        res.send({
            todos: doc
        })
    }, e => {
        res.status(400).send();
    });
});
/**
 * remove
 */
app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Todo.findByIdAndRemove(id).then(doc => {
        if (!doc) {
            return res.status(404).send();
        }
        res.send({
            todos: doc
        })
    }).catch(e => {
        res.status(400).send();
    });
});
/**
 * Update
 */
app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }
    Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
        .then(doc => {
            if (!doc) {
                return res.status(404).send();
            }
            res.send({
                todos: doc
            })
        }).catch(e => {
            res.status(400).send()
        })

});
app.listen(port, () => {
    console.log(`started on post ${port}`);
});
module.exports = { app };