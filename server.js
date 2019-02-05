require('dotenv').config();
require('./lib/utils/connect')();

const app = require('./lib/app');

const PORT = process.env.PORT || 27017 ;





// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
