module.exports.maxLength = length => [v => v.length <= length, `max {PATH} length is ${length} received {VALUE}`]
