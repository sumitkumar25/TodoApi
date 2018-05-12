const expect = require('expect');
const request = require('supertest');
const { app } = require('../server');
const { Todo } = require('../model/todo');
const { ObjectID } = require('mongodb');
const {
    testTodos,
    populate,
    populateUser,
    testUsers
} = require('./seed/seed');
beforeEach(populate);
beforeEach(populateUser);
describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'test todo text';
        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBeGreaterThan(0);
                    expect(todos[todos.length - 1].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            })
    });
    it('should run model validation', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(testTodos.length);
                    done();
                }).catch((e) => done(e));
            })
    })
});

describe('GET/todos should return all todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(testTodos.length);
            })
            .end(done)
    })
});

describe('GET/todos/:id should return todo with given id', () => {
    var testId = testTodos[0]._id.toHexString();
    it('should fetch todo with valid id', (done) => {
        request(app)
            .get(`/todos/${testId}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todos.text).toBe(testTodos[0].text);
            })
            .end(done);
    });
    it('should throw 400 for invalid id', (done) => {
        request(app)
            .get(`/todos/123`)
            .expect(400)
            .end(done);
    });
    it('should throw 400 for valid id and no match', (done) => {
        request(app)
            .get(`/todos/${new ObjectID()}`)
            .expect(400)
            .end(done);
    });
});
describe('DELETE/todos/:id should return todo with given id', () => {
    var testId = testTodos[0]._id.toHexString();
    it('should DELETE todo with valid id', (done) => {
        request(app)
            .delete(`/todos/${testId}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todos.text).toBe(testTodos[0].text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(testId)
                    .then((doc) => {
                        expect(doc).toNotExist();
                        done();
                    }).catch(e => done(e));
            });
    });
    it('should throw 400 for invalid id', (done) => {
        request(app)
            .delete(`/todos/123`)
            .expect(404)
            .end(done);
    });
    it('should throw 400 for valid id and no match', (done) => {
        request(app)
            .delete(`/todos/${new ObjectID()}`)
            .expect(404)
            .end(done);
    });
});

describe('PATCH/todos/:id', () => {
    var testId = testTodos[0]._id.toHexString();
    it('should set completed of todo to true and return completed at property', (done) => {
        request(app)
            .patch(`/todos/${testId}`)
            .send({
                completed: true,
                text: 'testText'
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.completed).toBe(true);
                expect(res.body.todos.text).toBe('testText');
                expect(res.body.todos.completedAt).toBeA('number');
            })
            .end(done);
    });
    it('should set completed of todo to false and completed at property as null', (done) => {
        request(app)
            .patch(`/todos/${testId}`)
            .send({ completed: false })
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.completed).toBe(false);
                expect(res.body.todos.completedAt).toNotExist();
            })
            .end(done);
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', testUsers[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(testUsers[0]._id.toHexString());
                expect(res.body.email).toBe(testUsers[0].email);
            })
            .end(done);
    });
    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect(res => {
                expect(res.body).toEqual({})
            })
            .end(done);
    });
});

describe('POST/users', () => {
    var email = 'example@example.com';
    var pass = '123454546';
    it('should create a user', (done) => {
        request(app)
            .post('/users')
            .send({ email, password: pass })
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);

            })
            .end(done)
    });
    it('should return validation error for invalid request', (done) => {
        request(app)
            .post('/users')
            .send({ email, password: 'pass' })
            .expect(400)
            .end(done)
    });
    it('should not create user if user email exist', (done) => {
        request(app)
            .post('/users')
            .send({ email: 'test@test.com', password: 'passasdasasd' })
            .expect(400)
            .end(done)
    });
})