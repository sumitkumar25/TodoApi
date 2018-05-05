const expect = require('expect');
const request = require('supertest');
const { app } = require('../server');
const { Todo } = require('../model/todo');
beforeEach((done) => {
    Todo.remove({}).then(() => {
        done();
    })
});
describe('POST /todos', () => {
    console.info('inside test')
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
                    expect(todos.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            })
    })
});