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
            // Tenter d'insérer les restaurants
            const data = await Company.insertMany(companies, { ordered: false });
            callback(null, data);
        } catch (error) {
            callback(error);
        }
    }}

// Fonction pour la recherche d'un restaurant //

module.exports.findOneCompany = function (tab_field, value, options, callback) {
    var opts = {populate: options && options.populate ? ['user_id'] : []}
    var field_unique = ["name", "address", "city", "postal_code", "country"];
    
    if (tab_field && Array.isArray(tab_field) && value && _.filter(tab_field, (e) => { return field_unique.indexOf(e) == -1}).length == 0) {
       var obj_find = [];
       _.forEach(tab_field, (e) => {
           obj_find.push({ [e]: value })
       })
       Company.findOne({ $or: obj_find }, null, opts).then((value) => {
           if (value) {
            callback(null, value.toObject());
           } else {
            callback({ msg: "Restaurant non trouvé.", type_error: "no-found" });
           }
       }).catch((err) => {
           callback({ msg: "Error interne mongo.", type_error: "error-mongo" });
       })
    }
    else {
        let msg = "";
        if (!tab_field || !Array.isArray(tab_field)) {
            msg += "Les champs de recherche sont incorrects. ";
        }
        if (!value) {
            msg += msg ? "Et la valeur de recherche est vide. " : "La valeur de recherche est vide. ";
        }
        if (_.filter(tab_field, (e) => { return field_unique.indexOf(e) == -1}).length > 0) {
            var field_not_authorized = _.filter(tab_field, (e) => { return field_unique.indexOf(e) == -1})
            msg += msg ? ` Et (${field_not_authorized.join(",")}) ne sont pas des champs de recherche autorisés.` :
             `Les champs (${field_not_authorized.join(",")}) ne sont pas des champs de recherche autorisés.`
             callback({ msg: msg, type_error: 'no-valid', field_not_authorized: field_not_authorized });
        }
        else
            callback({ msg: msg, type_error: 'no-valid' });
        }
    }

// Fonction pour la recherche de plusieurs restaurants

module.exports.findManyCompanies = function (search, page, limit, options, callback) {
    page = !page ? 1 : parseInt(page);
    limit = !limit ? 10 : parseInt(limit);
    var populate = options && options.populate ? ['user_id'] : [];
    
    if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
        return callback({ msg: `Format de ${isNaN(page) ? 'page' : 'limit'} invalide.`, type_error: 'no-valid' });
    }
    
    let query_mongo = search ? { $or: ["name", "postal_code", "city", "country"].map((field) => ({ [field]: { $regex: search, $options: 'i' } })) } : {};
    
    Company.countDocuments(query_mongo).then((count) => {
        if (count > 0) {
            const skip = (page - 1) * limit;
            Company.find(query_mongo, null, { skip: skip, limit: limit, populate: populate, lean: true }).then((results) => {
                callback(null, {
                    results: results, 
                    count: count 
                });
            }).catch((e) => {
                callback({ msg: 'Erreur lors de la recherche des restaurants.', type_error: 'error-mongo', error: e });
            });
        } else {
            callback(null, { results: [], count: 0 });
        }
    }).catch((e) => {
        callback({ msg: 'Erreur lors de la recherche des restaurants.', type_error: 'error-mongo', error: e });
    });
};

// Fonction pour rechercher un restaurant avec son id
module.exports.findOneCompanyById = function (company_id, options, callback) {
    var opts = {populate: options && options.populate ? ['user_id'] : []}
    if (company_id && mongoose.isValidObjectId(company_id)) {
        Company.findById(company_id, null, opts).then((value) => {
            try {
                if (value) {
                    callback(null, value.toObject());
                } else {
                    callback({ msg: "Aucun restaurant trouvé.", type_error: "no-found" });
                }
            }
            catch (e) {
            }
        }).catch((err) => {
            callback({ msg: "Impossible de chercher l'élément.", type_error: "error-mongo" });
        });
    } else {
        callback({ msg: "ObjectId non conforme.", type_error: 'no-valid' });
    }
}

// Fonction pour rechercher plusieurs restaurants avec leur id 
module.exports.findManyCompaniesById = function (companies_id, options, callback) {
    var opts = {populate: (options && options.populate ? ['user_id'] : []), lean: true}
    if (companies_id && Array.isArray(companies_id) && companies_id.length > 0 && companies_id.filter((e) => { return mongoose.isValidObjectId(e)}).length == companies_id.length) {
        companies_id = companies_id.map((e) => { return new ObjectId(e) })
        Company.find({ _id: companies_id }, null, opts).then((value) => {
            try {
                if (value && Array.isArray(value) && value.length != 0) {
                    callback(null, value);
                } else {
                    callback({ msg: "Aucun restaurant trouvé.", type_error: "no-found" });
                }
            }
            catch (e) {
                
            }
        }).catch((err) => {
            callback({ msg: "Impossible de chercher l'élément.", type_error: "error-mongo" });
        });
    }
    else if (companies_id && Array.isArray(companies_id) && companies_id.length > 0 && companies_id.filter((e) => { return mongoose.isValidObjectId(e)}).length != companies_id.length) {
        callback({ msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.", type_error: 'no-valid', fields: companies_id.filter((e) => { return !mongoose.isValidObjectId(e)}) });
    }
    else if (companies_id && !Array.isArray(companies_id)) {
        callback({ msg: "L'argument n'est pas un tableau.", type_error: 'no-valid' });

    }
    else {
        callback({ msg: "Tableau non conforme.", type_error: 'no-valid' });
    }
}

// Fonction pour modifier un restaurant
module.exports.updateOneCompany = function (company_id, update, options, callback) {
    if (company_id && mongoose.isValidObjectId(company_id)) {
        update.updated_at = new Date();
        Company.findByIdAndUpdate(new ObjectId(company_id), update, { returnDocument: 'after', runValidators: true }).then((value) => {
            try {
                if (value) {
                    callback(null, value.toObject())}
                else {
                    callback({ msg: "article non trouvé.", type_error: "no-found" })
                }
            } catch (e) {
                
                callback(e)
            }
        }).catch((errors) => {
            if (errors.code === 11000) {
                var field = Object.keys(errors.keyPattern)[0]
                const duplicateErrors = {
                    msg: `Duplicate key error: ${field} must be unique.`,
                    fields_with_error: [field],
                    fields: { [field]: `The ${field} is already taken.` },
                    type_error: "duplicate"
                };
                callback(duplicateErrors)
            } else {
                errors = errors['errors']
                var text = Object.keys(errors).map((e) => {
                    return errors[e]['properties']['message']
                }).join(' ')
                var fields = _.transform(Object.keys(errors), function (result, value) {
                    result[value] = errors[value]['properties']['message'];
                }, {});
                var err = {
                    msg: text,
                    fields_with_error: Object.keys(errors),
                    fields: fields,
                    type_error: "validator"
                }
                callback(err)
            }
        })
    }
    else {
        callback({ msg: "Id invalide.", type_error: 'no-valid' })
    }
}

// Fonction pour modifier plusieurs restaurants 

module.exports.updateManyCompanies = function (companies_id, update, options, callback) {
    if (companies_id && Array.isArray(companies_id) && companies_id.length > 0 && companies_id.filter((e) => { return mongoose.isValidObjectId(e)}).length == companies_id.length) {
        companies_id = companies_id.map((e) => { return new ObjectId(e) })
        update.updated_at = new Date();
        Company.updateMany({ _id: companies_id }, update, { runValidators: true }).then((value) => {
                try { 
                if (value && value.matchedCount != 0)
                    callback(null, value)
                else {
                    callback({ msg: "Aucun restaurant trouvé.", type_error: "no-found" })
                }
            } catch (e) {
                
                callback(e)
            }
        }).catch((errors) => {
            if (errors.code === 11000) {
                var field = Object.keys(errors.keyPattern)[0]
                const duplicateErrors = {
                    msg: `Duplicate key error: ${field} must be unique.`,
                    fields_with_error: [field],
                    fields: { [field]: `The ${field} is already taken.` },
                    type_error: "duplicate"
                };
                callback(duplicateErrors)
            } else {
                errors = errors['errors']
                var text = Object.keys(errors).map((e) => {
                    return errors[e]['properties']['message']
                }).join(' ')
                var fields = _.transform(Object.keys(errors), function (result, value) {
                    result[value] = errors[value]['properties']['message'];
                }, {});
                var err = {
                    msg: text,
                    fields_with_error: Object.keys(errors),
                    index: errors.index,
                    fields: fields,
                    type_error: "validator"
                }
                callback(err)
            }
        })
    }
    else {
        callback({ msg: "Id invalide.", type_error: 'no-valid' })
    }
}

// Fonction pour supprimer un restaurant

module.exports.deleteOneCompany = function (company_id, options, callback) {
    if (company_id && mongoose.isValidObjectId(company_id)) {
        Company.findByIdAndDelete(company_id).then((value) => {
            try {
                if (value)
                    callback(null, value.toObject())
                else
                callback({ msg: "Restaurant non trouvé.", type_error: "no-found" });
            }
            catch (e) {
                
                callback(e)
            }
        }).catch((e) => {
            callback({ msg: "Impossible de chercher l'élément.", type_error: "error-mongo" });
        })
    }
    else {
        callback({ msg: "Id invalide.", type_error: 'no-valid' })
    }
}

// Fonction pour supprimer plusieurs restaurants

module.exports.deleteManyCompanies = function(companies_id, options, callback) {
    if (companies_id && Array.isArray(companies_id) && companies_id.length > 0 && companies_id.filter((e) => { return mongoose.isValidObjectId(e)}).length == companies_id.length) {
        companies_id = companies_id.map((e) => {return new ObjectId(e)})
        Company.deleteMany({_id: companies_id}).then((value) => {
            callback(null, value)
        }).catch((err) => {
            callback({ msg: "Erreur mongo suppression.", type_error: "error-mongo" }); 
        })
    }
    else if (companies_id && Array.isArray(companies_id) && companies_id.length > 0 && companies_id.filter((e) => { return mongoose.isValidObjectId(e)}).length != companies_id.length) {
        callback({ msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.", type_error: 'no-valid', fields: companies_id.filter((e) => { return !mongoose.isValidObjectId(e)}) });
    }
    else if (companies_id && !Array.isArray(companies_id)) {
        callback({ msg: "L'argument n'est pas un tableau.", type_error: 'no-valid' });

    }
    else {
        callback({ msg: "Tableau d'id invalide.", type_error: 'no-valid' })
    }
}