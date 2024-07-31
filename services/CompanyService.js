const CompanySchema = require('../schemas/Company')
const _ = require('lodash')
const async = require('async')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

var Company = mongoose.model('Company', CompanySchema)


// Ajouter un restaurant //
module.exports.addOneCompany = async function (company, options, callback) {
    try {
        company.user_id = options && options.user ? options.user._id: company.user_id
        var new_company = new Company(company)
        var errors = new_company.validateSync()
        if (errors) {
            errors = errors['errors']
            var text = Object.keys(errors).map((e) => {
                return errors[e]['properties']['message']
            }).join(' ')
            var fields = _.transform(Object.keys(errors), function (result, value) {
                result[value] = errors[value]['properties']['message']
            }, {})
            var err = {
                msg: text,
                fields_with_error: Object.keys(errors),
                fields: fields,
                type_error: "validator"
            }
            callback(err)
        } else {
            await new_company.save()
            callback(null, new_company.toObject())
        }
    } catch (error) {
            callback(error)
        }
}

// Ajouter plusieurs restaurants //

module.exports.addManyCompanies = async function (companies, options, callback) {
    var errors = [];
    // Vérifier les erreurs de validation
    for (var i = 0; i < companies.length; i++) {
        var company = companies[i];
        var new_company = new Company({
            ...company
        })
        var error = new_company.validateSync();
        if (error) {
            error = error['errors'];
            var text = Object.keys(error).map((e) => {
                return error[e]['properties']['message'];
            }).join(' ');
            var fields = _.transform(Object.keys(error), function (result, value) {
                result[value] = error[value]['properties']['message'];
            }, {});
            errors.push({
                msg: text,
                fields_with_error: Object.keys(error),
                fields: fields,
                index: i,
                type_error: "validator"
            });
        }
    }
    
    if (errors.length > 0) {
        callback(errors);
    } else {
        try {
            // Tenter d'insérer les articles
            const data = await Company.insertMany(companies, { ordered: false });
            callback(null, data);
        } catch (error) {
            if (error.code === 11000) { // Erreur de duplicité
                const duplicateErrors = error.writeErrors.map(err => {
                    const field = err.err.errmsg.split(" dup key: { ")[1].split(':')[0].trim(); // Big brain
                    return {
                        msg: `Duplicate key error: ${field} must be unique.`,
                        fields_with_error: [field],
                        fields: { [field]: `The ${field} is already taken.` },
                        index: err.index,
                        type_error: "duplicate"
                    };
                });
                callback(duplicateErrors);
            } else {
                callback(error); // Autres erreurs
            }
        }
    }
}

// Tests de la fonction pour la recherche de plusieurs restaurants

module.exports.findManyCompanies = function (tab_field, values, options, callback) {
    const validFields = ['name', 'address', 'postal_code', 'city', 'country'];
    const minSearchLength = 2;

    if (!Array.isArray(tab_field) || tab_field.length === 0) {
        return callback({
            msg: 'Les champs de recherche doivent être un tableau.',
            type_error: 'no-valid'
        });
    }

    if (!Array.isArray(values) || values.length !== tab_field.length || values.some(value => value.length < minSearchLength)) {
        return callback({
            msg: 'Chaque valeur de recherche doit contenir au moins deux caractères.',
            type_error: 'no-valid'
        });
    }

    const invalidFields = tab_field.filter(field => !validFields.includes(field));
    if (invalidFields.length > 0) {
        return callback({
            msg: `Les champs (${invalidFields.join(',')}) ne sont pas des champs de recherche autorisés.`,
            type_error: 'no-valid',
            field_not_authorized: invalidFields
        });
    }

    const query = {
        $and: tab_field.map((field, index) => ({
            [field]: { $regex: new RegExp(values[index], 'i') }
        }))
    };

    const opts = { populate: options && options.populate ? ['user_id'] : [] };

    Company.find(query, null, opts)
        .then(results => {
            if (results.length > 0) {
                callback(null, results);
            } else {
                callback({
                    msg: 'Aucun restaurant trouvé.',
                    type_error: 'no-found'
                });
            }
        })
        .catch(err => {
            callback({
                msg: 'Erreur interne MongoDB.',
                type_error: 'error-mongo'
            });
        });
};