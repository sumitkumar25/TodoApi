const expect = require('expect');
const request = require('supertest');
const { app } = require('../server');
const { Todo } = require('../model/todo');
const { ObjectID } = require('mongodb');
const testTodos = [
    { _id: new ObjectID(), text: "Test todo a" },
    { _id: new ObjectID(), text: "Test todo b" },
    { _id: new ObjectID(), text: "Test todo c" },
    { _id: new ObjectID(), text: "Test todo d" }
]
beforeEach((done) => {
    Todo.remove({})
        .then(() => {
            return Todo.insertMany(testTodos);
        }).then(() => {
            done();
        })
});
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