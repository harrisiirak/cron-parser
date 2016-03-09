'use strict';

/**
 * Polyfill. IE Number.isNaN does not support method 'isNaN'.
 */
Number.isNaN = Number.isNaN || function(value) {
    return typeof value === 'number' && isNaN(value);
}