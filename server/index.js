// mongodb
require('./config/db');

const app = require('express')();
const port = 3000;

const bodyParser = require('body-parser');
app.use(bodyParser);

const UserRouter = require('./routes/user')
app.use('/user', UserRouter)

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
