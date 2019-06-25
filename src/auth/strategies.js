'use strict';
const { Strategy: LocalStrategy } = require('passport-local');

// Assigns the Strategy export to the name JwtStrategy using object destructuring
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Assigning_to_new_variable_names
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const { JWT_SECRET } = require('../config');

let knex; //knex instance

const setKnexInstance = (k => knex = k)

const localStrategy = new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  async (email, password, callback) => {
    let user = { name: 'Foo' };
    // User.findOne({ username: username })
    //   .then(_user => {
    //     user = _user;
    //     if (!user) {
    //       // Return a rejected promise so we break out of the chain of .thens.
    //       // Any errors like this will be handled in the catch block.
    //       return Promise.reject({
    //         reason: 'LoginError',
    //         message: 'Incorrect username or password'
    //       });
    //     }
    //     return user.validatePassword(password);
    //   })
    //   .then(isValid => {
    //     if (!isValid) {
    //       return Promise.reject({
    //         reason: 'LoginError',
    //         message: 'Incorrect username or password'
    //       });
    //     }
    //     return callback(null, user);
    //   })
    //   .catch(err => {
    //     if (err.reason === 'LoginError') {
    //       return callback(null, false, err);
    //     }
    //     return callback(err, false);
    //   });

    // good
    user = await knex('users')
      .where('email', '=', email)
      .first()
      .then(result => {
        return result
      })

    if (user === undefined) {
      return callback(new Error('INCORRECT_CREDENTIALS'), false);
    }

    //TODO bcrypt the passwords
    if (user.password !== password) {
      return callback(new Error('INCORRECT_CREDENTIALS'), false);
    }

    //succes
    return callback(null, user);

  });

const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: JWT_SECRET,
    // Look for the JWT as a Bearer auth header
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    // Only allow HS256 tokens - the same as the ones we issue
    algorithms: ['HS256']
  },
  (payload, done) => {
    done(null, payload.user);
  }
);

module.exports = { localStrategy, jwtStrategy, setKnexInstance };
