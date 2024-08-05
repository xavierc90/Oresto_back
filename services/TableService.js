const Table = require('../schemas/Table')

// Ajouter une table  //
module.exports.addOneTable = async function (table, options, callback) {
    try {
        table.company_id = options && options.company ? options.company._id:table.company_id
        var new_table = new Table(table)
        var errors = new_table.validateSync()
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
            await new_table.save()
            callback(null, new_table.toObject())
        }
    } catch (error) {
            callback(error)
        }
}
