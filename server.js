'use strict';
const methodOverride = require('method-override');
const superagent = require('superagent');
const express = require('express');
const app = express();
const cors = require('cors');
const pg = require('pg');
require('dotenv').config();
// const DATABASE_URL = process.env.DATABASE_URL;
// const client = new pg.Client(DATABASE_URL);
// App (express)
app.use(cors());
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT;
// Enable CSS
app.use(express.static('public'));
const SPOONACULAR_API_KEY = process.env.SPOONACAULR_API_KEY;


app.get('/searches/new', searchForm);

function searchForm(req, res) {
    res.render('pages/recipes/new');
}


let page = 1;
app.get('/search_name', searchName);

function searchName(req, res) {
    let ining;
    if (req.query.includeIngredients.length > 1) {
        ining = req.query.includeIngredients.join('+');
    } else if (req.query.includeIngredients.length === 1) {
        ining = req.query.includeIngredients[0];
    }
    let excing;
    if (req.query.excludeIngredients.length > 1) {
        excing = req.query.excludeIngredients.join('+');
    } else if (req.query.excludeIngredients.length === 1) {
        excing = req.query.excludeIngredients[0];
    }
    // let url = `https://api.spoonacular.com/recipes/complexSearch?query=${req.query}&apiKey=${SPOONACULAR_API_KEY}&fillIngredients=true`

    const numPerPage = 10;
    const start = ((page - 1) * numPerPage + 1);
    page += 1;
    const queryParams = {
        apiKey: SPOONACULAR_API_KEY,
        query: req.query.query,
        maxAlcohol: 0,
        addRecipeInformation: true,
        fillIngredients: true,
        offset: start,
        number: numPerPage,
    };

    if (ining !== 'none') { queryParams.includeIngredients = ining; }
    if (excing !== 'none') { queryParams.excludeIngredients = excing; }
    if (req.query.cuisine !== 'all') { queryParams.cuisine = req.query.cuisine; }
    if (req.query.diet !== 'none') { queryParams.diet = req.query.diet; }
    if (req.query.type !== 'all') { queryParams.type = req.query.type; }

    let url = `https://api.spoonacular.com/recipes/complexSearch`;
    return superagent.get(url)
        .query(queryParams)
        .then(value => {
            res.send(value.body.results.map(elementX => {
                new Name(elementX);
                value.body.results.extendedIngredients.map(elementY => {
                    new Ingredient(elementY);
                });
                value.body.results.analyzedInstructions.steps.map(elementZ => {
                    new Steps(elementZ);
                });
            }));
        })
        .then(results => {
            res.render('pages/recipes/show', { searchResults: results });
            console.log(results);
        }).catch(() => {
            res.send('something went wrong..  ');
        })
}

function Name(value) {
    this.title = value.title;
    this.image = value.image;
    this.readyInMinutes = value.readyInMinutes;
    this.spoonacularScore = value.spoonacularScore;
    this.summary = value.summary;
    this.dishTypes = value.dishTypes.join(',');
}
//extendedIngredients
function Ingredient(value) {
    this.image = `https://spoonacular.com/cdn/ingredients_100x100/${value.image}`;
    this.originalString = value.originalString;
}
//analyzedInstructions.steps
function Steps(value) {
    this.number = value.number;
    this.step = value.step;
}
// Listen
app.listen(PORT, () => console.log(`You Successfully Connected To Port ${PORT}`));





