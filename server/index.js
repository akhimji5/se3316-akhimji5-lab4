const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use('/', express.static('../client'));

app.use(bodyParser.json());

// Load superhero data
const superheroInfo = require('./superhero_info.json');
const superheroPowers = require('./superhero_powers.json');

// Create an endpoint to get all superhero information by ID
app.get('/superhero/:id', (req, res) => {
  const id = req.params.id;
  const superhero = superheroInfo.find(hero => hero.id.toString() === id);
  if (!superhero) {
    return res.status(404).json({ error: 'Superhero not found' });
  }
  res.json(superhero);
});

// Create an endpoint to get all powers by superhero ID
app.get('/superhero/:id/powers', (req, res) => {
  const id = req.params.id;
  const superhero = superheroInfo.find(hero => hero.id.toString() === id);
  if (!superhero) {
    return res.status(404).json({ error: 'Superhero not found' });
  }

  const powers = superheroPowers.find(power => power.hero_names === superhero.name);

  if (!powers) {
    return res.status(404).json({ error: 'Superhero not found' });
  }
  
  const truePowers = Object.keys(powers).filter(powerName => powers[powerName] === 'True');
  
  res.json(truePowers);
});

// Create an endpoint to get available publisher names
app.get('/publishers', (req, res) => {
  const publishers = [...new Set(superheroInfo.map(hero => hero.Publisher))];

  res.json(publishers);
});

// Create an endpoint to search for superheroes by a specific field
app.get('/search', (req, res) => {
  const { field, keyword, n } = req.query;
  if (!field || !keyword) {
    return res.status(400).json({ error: 'Field and Keyword are required' });
  }

  let matchingSuperheroes = [];

  if (field === 'power') {
    const matchingPowerHeroes = superheroPowers.filter((power) =>
      power[keyword] === 'True'
    );

    matchingSuperheroes = superheroInfo.filter((hero) => {
      return matchingPowerHeroes.some((powerHero) =>
        powerHero.hero_names === hero.name
      );
    });
  } else {
    matchingSuperheroes = superheroInfo.filter((hero) => 
      hero[field] &&
      hero[field].toString().toLowerCase().includes(keyword.toLowerCase())
    );
  }

  if (matchingSuperheroes.length === 0) {
    return res.status(404).json({ error: 'No matching superheroes found' });
  }

  var firstNMatchingSuperheroIDs = matchingSuperheroes.map(hero => hero.id);

  if(n>0){
    firstNMatchingSuperheroIDs = firstNMatchingSuperheroIDs.slice(0, n)
  }

  res.json(firstNMatchingSuperheroIDs);
});

const lists = {}

app.get('/lists', (req, res) => {
  res.json(lists)
})

// Create an endpoint to create a new favorite list
app.post('/lists', (req, res) => {
  const { listName } = req.body;
  if (!listName) {
    return res.status(400).json({ error: 'List name is required' });
  }
  if (lists[listName]) {
    return res.status(409).json({ error: 'List with the same name already exists' });
  }

  lists[listName] = [];
  res.status(200).json({ message: 'List created successfully' });
});

// Create an endpoint to save superhero IDs to a given list
app.put('/lists/:listName', (req, res) => {
  const listName = req.params.listName;
  const { superheroIds } = req.body;
  if (!superheroIds) {
    return res.status(400).json({ error: 'Superhero IDs are required' });
  }

  if (!lists[listName]) {
    return res.status(404).json({ error: 'List does not exist' });
  }

  const existingSuperheroes = lists[listName];
  const duplicateSuperheroes = superheroIds.filter(id => existingSuperheroes.includes(id));

  if (duplicateSuperheroes.length > 0) {
    return res.status(409).json({ error: 'Superhero(s) already exist in the list' });
  }

  superheroIds.forEach(superheroId => {lists[listName].push(superheroId)})

  res.status(200).json({ message: `Superhero list '${listName}' updated successfully.`});
});

// Create an endpoint to get the list of superhero IDs for a given list
app.get('/lists/:listName/superheroes', (req, res) => {
  const listName = req.params.listName;
  if (!lists[listName]) {
    return res.status(404).json({ error: 'List does not exist' });
  }

  const superheroIDs = lists[listName];
  res.json(superheroIDs);
});

// Create an endpoint to delete a list of superheroes by name
app.delete('/lists/:listName', (req, res) => {
  const listName = req.params.listName;
  if (!lists[listName]) {
    return res.status(404).json({ error: 'List does not exist' });
  }

  delete lists[listName];
  res.json({ message: 'List deleted successfully' });
});

// Create an endpoint to get a list of names, information, and powers of superheroes saved in a given list
app.get('/lists/:listName/superheroes/info', (req, res) => {
  const listName = req.params.listName;
  if (!lists[listName]) {
    return res.status(404).json({ error: 'List does not exist' });
  }

  const superheroIDs = lists[listName];
  const result = superheroInfo
        .filter(hero => superheroIDs.includes(hero.id)) // Filter superheroes in the list
        .map(hero => {
            const powers = superheroPowers.find(power => power.hero_names === hero.name);
            if (powers) {
                // Filter powers that are set to "True"
                const truePowers = Object.keys(powers).filter(powerName => powers[powerName] === 'True');
                hero.powers = truePowers;
            }
            return hero;
        });

  res.json(result);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
