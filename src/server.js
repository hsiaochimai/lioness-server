
const app = require('./app')
const db = require('./db')
const { router: loginRouter, localStrategy, jwtStrategy, setKnexInstance, } = require('./auth')

const { PORT, DB_URL } = require('./config')

const knexInstance = db()
app.set('db', knexInstance)
setKnexInstance(knexInstance)

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})

console.log('hello')
