require('./config/config')
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');
var { mongoose } = require('./db/mongoose');
var { Todo } = require('./model/todo');
var { User } = require('./model/user');
var { authenticate } = require('./middleware/authenticate')

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
app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
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
app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        _creator: req.user._id
    }).then((doc) => {
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
app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(400).send();
    }
    Todo.find({ _id: id, _creator: req.user._id }).then(doc => {
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
app.delete('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Todo.findOneAndRemove({ _id: id, _creator: req.user._id }).then(doc => {
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
app.patch('/todos/:id', authenticate, (req, res) => {
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
    Todo.findOneAndUpdate({ _id: id, _creator: req.user._id }, { $set: body }, { new: true })
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

app.post('/users', (req, res) => {
    var body = _.pick(req.body, 'email', 'password');
    var user = new User(body);

    user.save()
        .then(() => {
            return user.generateAuthToken()
        })
        .then(token => {
            res.header('x-auth', token).send(user)
        })
        .catch(e => {
            res.status(400).send(e)
        })
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, 'email', 'password');
    User.findByCredentials(body.email, body.password)
        .then((user) => {
            user.generateAuthToken().then(token => {
                res.header('x-auth', token).send(user);
            })
        }).catch(e => {
            console.info('error', e);
            res.status(400).send();
        });
});
app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token)
        .then(() => {
            res.status(200).send();
        }, () => {
            res.status(400).send();
        })
});
app.listen(port, () => {
    console.log(`started on post ${port}`);
});
module.exports = { app };