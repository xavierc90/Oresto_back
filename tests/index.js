const mongoose = require('mongoose')

/* Connexion à la base de données */
require('../utils/database')


// Tests pour Users
// describe("UserService", () => {
//   require('./services/UserService.test')
// })

// describe("UserController", () => {
//   require('./controllers/UserController.test')
// })


// Tests pour réservations

// describe("BookingService", () => {
//   require('./services/BookingService.test')
// })

// describe("BookingController", () => {
//   require('./services/BookingController.test')
// })

// Tests pour les compagnies

describe("CompanyService", () => {
  require('./services/CompanyService.test')
})

describe("CompanyController", () => {
  require('./controllers/CompanyController.test')
})

// Tests pour les tables

// describe("TableService", () => {
//   require('./services/TableService.test')
// })

// describe("TableController", () => {
//   require('./controllers/TableController.test')
// })

// Vider la base de données test

describe("API - Mongo", () => {
  it("Vider les dbs. - S", () => {
    if (process.env.npm_lifecycle_event == 'test')
      mongoose.connection.db.dropDatabase()
  })
  })