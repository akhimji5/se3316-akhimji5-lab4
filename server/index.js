// mongodb
require('./config/db');

const express = require('express');
const app = express();
const port = 5000;

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const UserRouter = require('./routes/user')
app.use('/user', UserRouter)


app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
