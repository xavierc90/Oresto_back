const mongoose = require('mongoose')

/* Connexion à la base de données */
require('../utils/database')

describe("UserService", () => {
  require('./services/UserService.test')
})

// describe("UserController", () => {
//   require('./controllers/UserController.test')
// })

describe("API - Mongo", () => {
  it("Vider les dbs. - S", () => {
    if (process.env.npm_lifecycle_event == 'test')
      mongoose.connection.db.dropDatabase()
  })
  })