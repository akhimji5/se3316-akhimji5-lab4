const mongoose = require('mongoose');

// Schema Definition
const SuperheroSchema = new mongoose.Schema({
    id: Number,
    name: String,
    gender: String,
    eyeColor: String,
    race: String,
    hairColor: String,
    height: Number,
    publisher: String,
    skinColor: String,
    alignment: String,
    weight: Number,
    powers: [String]

    
});

const Superhero = mongoose.model('Superhero', SuperheroSchema);


module.exports = Superhero;