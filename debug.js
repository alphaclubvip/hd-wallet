const commandLineArgs = require('command-line-args')
const options = commandLineArgs([
    { name: 'verbose', alias: 'v', type: Boolean, defaultOption: false },
    { name: 'src', type: String, multiple: true, defaultOption: true },
    { name: 'timeout', alias: 't', type: Number }
])

console.log(options)
