const Table = require('../schemas/Table')

module.exports.addOneTable = async function(tableData, callback) {
    try {
        const newTable = new Table(tableData);
        const errors = newTable.validateSync();
        if (errors) {
            const text = Object.keys(errors.errors).map((key) => {
                return errors.errors[key].message;
            }).join(' ');

            const fieldsWithError = _.transform(Object.keys(errors.errors), (result, key) => {
                result[key] = errors.errors[key].message;
            }, {});

            const err = {
                msg: text,
                fields_with_error: Object.keys(errors.errors),
                fields: fieldsWithError,
                type_error: 'validator'
            };
            return callback(err);
        }
        await newTable.save();
        callback(null, newTable.toObject());
    } catch (error) {
        callback(error);
    }
};
