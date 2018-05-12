const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
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
//instance meathod
UserSchema.methods.generateAuthToken = function() {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SEC).toString();
    user.tokens = user.tokens.concat({
        access,
        token
    });
    return user.save()
        .then((res) => {
            return token;
        })
}
UserSchema.methods.toJSON = function() {
    var user = this;
    var userObj = user.toObject();
    return _.pick(userObj, ['_id', 'email']);
};
UserSchema.methods.removeToken = function(token) {
    var user = this;
    return user.update({
        $pull: {
            token: token
        }
    })
};

/**
 * model meathod
 */
UserSchema.statics.findByCredentials = function(email, password) {
    var user = this;
    return User.findOne({ email }).then(user => {
        if (!user) {
            return Promise.reject;
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password.toString(), user.password, (err, res) => {
                if (res) {
                    resolve(user)
                } else {
                    reject();
                }
            });
        })
    })
};
UserSchema.statics.findByToken = function(token) {
    var User = this;
    var decoded = null;
    try {
        decoded = jwt.verify(token, process.env.JWT_SEC);
    } catch (error) {
        return Promise.reject();
    }
    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
}
UserSchema.pre('save', function(next) {
    user = this;
    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (error, hash) => {
                user.password = hash;
                next();
            })
        });
    } else {
        next();
    }
});
var User = mongoose.model('users', UserSchema);

module.exports = { User };