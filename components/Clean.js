'use strict';

const { _compact, _castArray } = require('./lodash');

class Clean {
    static validateDimensions(dimensions) {
        dimensions = _compact(_castArray(dimensions)).filter(
            dimension => dimension > 0 && !isNaN(dimension)
        );

        return dimensions.length === 2 ? dimensions : '';
    }
}

module.exports = Clean;
