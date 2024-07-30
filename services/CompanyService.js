const CompanySchema = require('../schemas/Company')
const _ = require('lodash')
const async = require('async')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

var Company = mongoose.model('Company', CompanySchema)

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