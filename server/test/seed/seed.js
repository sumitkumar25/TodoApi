const { ObjectID } = require('mongodb');
const { Todo } = require('./../../model/todo');
const { User } = require('./../../model/user');
const jwt = require('jsonwebtoken');
const testTodos = [
    { _id: new ObjectID(), text: "Test todo a", completed: false, _creator: userAid },
    { _id: new ObjectID(), text: "Test todo b", completed: true, completedAt: new Date().getTime(), _creator: userBid },
    { _id: new ObjectID(), text: "Test todo c", _creator: userAid },
    { _id: new ObjectID(), text: "Test todo d", _creator: userAid }
];
const userAid = new ObjectID();
const userBid = new ObjectID();
const testUsers = [{
    _id: userAid,
    email: "test@test.com",
    password: 'user1password',
    tokens: [{
        access: 'auth',
        token: jwt.sign({ _id: userAid, access: 'auth' }, process.env.JWT_SEC).toString()
    }]
}, {
    _id: userBid,
    email: "testB@test.com",
    password: 'user2password',
}]
const populate = (done) => {
    Todo.remove({})
        .then(() => {
            return Todo.insertMany(testTodos);
        }).then(() => {
            done();
        });
}
const populateUser = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(testUsers[0]).save();
        var userTwo = new User(testUsers[1]).save();
        Promise.all([userOne, userTwo]).then(() => {
            done();
        });
    })
}
module.exports = {
    testTodos,
    populate,
    populateUser,
    testUsers
}