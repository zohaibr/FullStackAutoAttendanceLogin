let path = require('path');

module.exports = {
    entry: './index.js',
    output: {
        filename: 'background.js',
        path: path.join(__dirname, 'fullStackAutoLogin'),
        publicPath: '/'
    }
};