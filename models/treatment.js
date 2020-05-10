const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema({
    name: String,
    area: String,
    time: Number,
    price: Number,
});
module.exports = mongoose.model('Treatment', treatmentSchema);
