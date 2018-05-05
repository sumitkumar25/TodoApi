const expect = require('expect');
const request = require('supertest');
const { app } = require('../server');
const { Todo } = require('../model/todo');
const testTodos = [
    { text: "Test todo a" },
    { text: "Test todo b" },
    { text: "Test todo c" },
    { text: "Test todo d" }
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