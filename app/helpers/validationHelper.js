'use strict';

const errorMessageFormatter = function (errors) {
    return errors.map((error) => {
        return '(' + error.param + ' : ' + error.value + ') ' + error.msg;
    });
};

module.exports = {
    errorMessageFormatter
};
