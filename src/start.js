require('@babel/register')({
    presets: [ "@babel/env" ],
    plugins: [ "@babel/plugin-transform-flow-strip-types", "@babel/plugin-proposal-class-properties" ]
});

module.exports = require('./mains.js');
