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