const express = require('express');
const router = express.Router();
const Superhero = require('../models/superhero');

// Create an endpoint to get all superhero information by ID
router.get('getById/:id', async (req, res) => {
  const id = req.params.id.trim();
  try {
    const superhero = await Superhero.findOne({ id });
    if (!superhero) {
      return res.status(404).json({ error: 'Superhero not found' });
    }
    res.json(superhero);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).send('Server error');
  }
});

// Create an endpoint to get all powers by superhero ID
router.get('getPowersById/:id/powers', async (req, res) => {
  const id = req.params.id.trim();
  try {
    const superhero = await Superhero.findOne({ id });
    if (!superhero) {
      return res.status(404).json({ error: 'Superhero not found' });
    }

    const powers = superhero.powers || [];

    res.json(powers);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).send('Server error');
  }
});

// Create an endpoint to get available publisher names
router.get('/publishers', async (req, res) => {
  try {
    const publishers = await Superhero.distinct('publisher');
    res.json(publishers);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).send('Server error');
  }
});

// Create an endpoint to search for superheroes by a specific field
router.get('/search', async (req, res) => {
  const { name, race, power, publisher } = req.query;

  try {
    const query = {};

    // Build the query based on the provided parameters
    if (name) query.name = new RegExp(`^${name}`, 'i');
    if (race) query.race = new RegExp(`^${race}`, 'i');
    if (power) query.powers = new RegExp(`^${power}`, 'i');
    if (publisher) query.publisher = new RegExp(`^${publisher}`, 'i');

    const matchingSuperheroes = await Superhero.find(query);

    if (matchingSuperheroes.length === 0) {
      return res.status(404).json({ message: 'No matching superheroes found' });
    }

    res.json(matchingSuperheroes);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;