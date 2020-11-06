'use strict';

require('dotenv').config();

const PORT = process.env.PORT || 3000;
const methodOverride = require('method-override');
const superagent = require('superagent');
const express = require('express');
const app = express();
const cors = require('cors');
const pg = require('pg');
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);
// App (express)
app.use(cors());
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));

// Enable CSS
app.use(express.static('public'));



// Listen
client.connect().then(() => {
    app.listen(PORT, () => console.log(`You Successfully Connected To Port ${PORT}`));
}).catch(() => console.log(`Could not connect to database`));