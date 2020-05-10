const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: String,
    beds: Number,
    guests: Number,
    price: Number,
});
module.exports = mongoose.model('Room', roomSchema);
