// mongodb
require('./config/db');
const cors = require('cors');

const express = require('express');
const app = express();
const port = 5000;

app.use(cors({
  origin: 'http://localhost:3000' 
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const UserRouter = require('./routes/user')
app.use('/user', UserRouter)

const SuperheroRouter = require('./routes/superhero')
app.use('/superhero', SuperheroRouter)

const ListRouter = require('./routes/list')
app.use('/list', ListRouter)

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
