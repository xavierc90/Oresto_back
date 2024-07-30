const BookingService = require('../../services/BookingService');
const UserService = require('../../services/UserService');
const chai = require('chai');
const expect = chai.expect;
const _ = require('lodash');

let tab_id_users = [];
let users = [
    {
        firstName: "Detenteur de réservation 1",
        lastName: "Client",
        email:"client1@gmail.com",
        phone_number: "+33601020304",
        password: "azerty"
    },    
    {
        firstName: "Detenteur de réservation 2",
        lastName: "Client",
        email:"client2@gmail.com",
        phone_number: "+33601020304",
        password: "azerty"
    },    
    {
        firstName: "Detenteur de réservation 3",
        lastName: "Client",
        username: "client3",
        email:"client3@gmail.com",
        phone_number: "+33601020304",
        password: "azerty"
    },    
    {
        firstName: "Detenteur de réservation 4",
        lastName: "Client",
        username: "client4",
        email:"client4@gmail.com",
        password: "azerty"
    }
];

let id_booking_valid = "";
let bookings = [];

// Création des utilisateurs fictifs
it("Création des utilisateurs fictifs", (done) => {
    UserService.addManyUsers(users, null, function (err, value) {
        tab_id_users = _.map(value, '_id');
        done();
    });
});

function rdm_user(tab) {
    let rdm_id = tab[Math.floor(Math.random() * tab.length)];
    return rdm_id;
}

// Tests pour addOneBooking
describe("addOneBooking", () => {
    it("Réservation correcte - S", (done) => {
        var booking = {
            company_id: new mongoose.Types.ObjectId(), // Remplacez par un ID valide de la compagnie si nécessaire
            table_id: new mongoose.Types.ObjectId(),   // Remplacez par un ID valide de la table si nécessaire
            date: new Date(),
            nbr_persons: 4,
            status: "waiting",
            user_id: rdm_user(tab_id_users)
        };
        BookingService.addOneBooking(booking, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('_id');
            expect(value).to.haveOwnProperty('company_id');
            expect(value).to.haveOwnProperty('table_id');
            expect(value).to.haveOwnProperty('date');
            expect(value).to.haveOwnProperty('nbr_persons');
            expect(value).to.haveOwnProperty('status');
            id_booking_valid = value._id;
            bookings.push(value);
            done();
        });
    });

    it("réservation incorrecte (Sans company_id) - E", (done) => {
        var booking_no_valid = {
            table_id: new mongoose.Types.ObjectId(),   // Remplacez par un ID valide de la table si nécessaire
            date: new Date(),
            nbr_persons: 4,
            status: "waiting",
            user_id: rdm_user(tab_id_users)
        };
        BookingService.addOneBooking(booking_no_valid, null, function (err, value) {
            expect(err).to.haveOwnProperty('msg');
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1);
            expect(err).to.haveOwnProperty('fields');
            expect(err['fields']).to.haveOwnProperty('company_id');
            expect(err['fields']['company_id']).to.equal('Path `company_id` is required.');
            done();
        });
    });
});