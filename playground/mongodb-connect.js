const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        console.log('unable to connect', err);
    }
    const db = client.db('TodoApp');
    db.collection('Todos').insertOne({
        text: 'somethng to do',
        completed: false
    }, (err, res) => {
        if (err) {
            return console.log('error while inserting todo', err);
        }
        console.log(JSON.stringify(res, undefined, 2));
    });

    db.collection('Users').insertOne({
        name: 'test',
        age: 12,
        location: 'city'
    }, (err, res) => {
        console.log(err);
        console.log(res);
        if (err) {
            return console.log('error while inserting todo', err);
        }
        console.log(JSON.stringify(res, undefined, 2));
    })
    client.close();
});