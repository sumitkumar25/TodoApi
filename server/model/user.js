const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
/**
 * User:
 * email : string
 * password: string //hashing bcrypt
 * tokens : [{access,token}]
 */
var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 3,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});
UserSchema.methods.generateAuthToken = function() {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({ _id: user._id.toHexString(), access }, 'abc123').toString();
    var payload = {
        access,
        token
    };
    user.tokens.push(payload);
    return user.save()
        .then(() => {
            return token;
        })
};
UserSchema.methods.toJSON = function() {
    var user = this;
    var userObj = user.toObject();
    return _.pick(userObj, ['_id', 'email']);
}
var User = mongoose.model('users', UserSchema);

module.exports = { User };