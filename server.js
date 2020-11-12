'use strict';
const methodOverride = require('method-override');
const superagent = require('superagent');
const express = require('express');
const app = express();
const cors = require('cors');
const pg = require('pg');
require('dotenv').config();
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);
// App (express)

app.use(cors());
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT;
// Enable CSS
app.get('/css', testCSS);
app.get('/about', testAbout);
app.get('/index', testIndex);
// Enable CSS

app.use('/public', express.static('public'));
function testCSS(req, res) {
    res.render('pages/recipes/partials/header');
}
function testAbout(req, res) {
    res.render('pages/recipes/aboutus');
}
function testIndex(req, res) {
    res.render('pages/recipes/index');
}


const SPOONACULAR_API_KEY = process.env.SPOONACAULR_API_KEY;


app.get('/searches/new', searchForm);

function searchForm(req, res) {
    res.render('pages/recipes/new');
}
app.get('/', homePage);
app.get('/yourFavorite', favoritePage);
app.post('/search_name', searchName);
app.post('/details', details);
app.post('/favorite', addToFavorite);
app.get('/favorite/:id', viewdetails);
app.delete('/favorite/:id', deletebook);
app.put('/favorite/:id', updatebook);
app.use('*', errorFunction);





function errorFunction(request, response) {
    response.status(404).render('pages/recipes/error');
}

function addToFavorite(req, res) {
    let { image, title, readyInMinutes, summary, stepDetails } = req.body;
    let SQL = 'INSERT INTO recipe (image_url, title, readyInMinutes, summary, stepDetails) VALUES ($1, $2, $3, $4, $5) RETURNING id; ';
    let values = [image, title, readyInMinutes, summary, stepDetails];
    console.log(values);
    client.query(SQL, values).then(data => {

        res.redirect(`/favorite/${data.rows[0].id}`)

    }).catch(console.error);


}


function homePage(request, response) {
    response.status(200).render('pages/recipes/index');
};



function viewdetails(req, res) {
    let SQL = 'SELECT * FROM recipe WHERE id=$1;';
    let val = [req.params.id];

    client.query(SQL, val)
        .then(result => {
            console.log(result.rows[0])
            res.render('pages/recipes/fav', { view: result.rows[0] });
        }).catch(console.error);


}



function deletebook(req, res) {
    let deletebook = req.body;
    let SQL = `DELETE FROM recipe WHERE id=$1;`;
    let val = [req.params.id];

    client.query(SQL, val).then(res.redirect('/yourFavorite')).catch(console.error);

}




function updatebook(req, res) {

    let updatedata = req.body;
    let SQL = `UPDATE recipe SET title=$1,  image_url=$2, readyInMinutes=$3 ,summary=$4 ,stepDetails=$5 WHERE id=$6;`;
    let values = [updatedata.title, updatedata.image, updatedata.readyinminutes, updatedata.summary, updatedata.stepdetails, req.params.id.toString()];
    console.log('here valu', values);
    client.query(SQL, values)
        .then(res.redirect(`/favorite/${req.params.id.toString()}`))
}


















function details(req, res) {


    const queryParams = {
        titleMatch: req.body.titleMatch,
        maxAlcohol: 0,
        addRecipeInformation: true,
        fillIngredients: true,
    };


    let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.SPOONACULAR_API_KEY}`;
    console.log(process.env.SPOONACULAR_API_KEY);
    return superagent.get(url)
        .query(queryParams)
        .then(value => {
            let myresult = value.body.results.map(elementX => {
                let extendedIng = elementX.extendedIngredients.map(x => {
                    return new Ingredient(x);
                })
                let analyzedInst = elementX.analyzedInstructions.map(x => {
                    return x.steps.map(hi => {
                        return new Step(hi);
                    })

                })
                let name = new NameD(elementX);

                let resultArray = [name, analyzedInst, extendedIng];
                return resultArray;
            })

            return myresult;
        })
        .then(result => {

            res.render('pages/recipes/details', { recipeResults: result[0] });

        })
        .catch((err) => {
            res.send('something went wrong..  ' + err);
        })
}

function NameD(value) {
    this.title = value.title;
    this.image = value.image;
    this.readyInMinutes = value.readyInMinutes;
    this.spoonacularScore = value.spoonacularScore;
    this.summary = value.summary;
    // this.dishTypes = value.dishTypes.join(',');

};
//extendedIngredients
function Ingredient(value) {
    this.smallImage = `https://spoonacular.com/cdn/ingredients_100x100/${value.image}`;
    this.OriginalString = value.originalString;

};
//analyzedInstructions.steps
function Step(value) {
    this.stepNumber = value.number;
    this.stepDetails = value.step;
};



// -----------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------


function searchName(req, res) {
    let page = req.body.page;


    let regex = /\b[A-z][A-z]*/g;

    let temp_input_include = req.body.includeIngredients;
    let ining = temp_input_include.match(regex);
    if (ining !== null) {

        if (ining.length > 1) {
            ining = ining.join('+');
        } else if (ining.length === 1) {
            ining = ining[0];
        }

    }

    let temp_input_exclude = req.body.excludeIngredients;
    let excing = temp_input_exclude.match(regex);
    if (excing !== null) {

        if (excing.length > 1) {
            excing = excing.join('+');
        } else if (excing.length === 1) {
            excing = excing[0];
        }

    }

    const numPerPage = 10;
    const start = ((page - 1) * numPerPage + 1);
    page += 1;
    const queryParams = {
        query: req.body.query,
        maxAlcohol: 0,
        addRecipeInformation: true,
        fillIngredients: true,
        offset: start,
        number: numPerPage,
    };

    let nextPage = {
        page: Number(req.body.page) + 1,
        searchVar: req.body.query,
        ining: req.body.includeIngredients,
        excing: req.body.excludeIngredients,
        cuisine: req.body.cuisine,
        diet: req.body.diet,
        type: req.body.type,
    }

    let previousPage = {
        page: Number(req.body.page) - 1,
        searchVar: req.body.query,
        ining: req.body.includeIngredients,
        excing: req.body.excludeIngredients,
        cuisine: req.body.cuisine,
        diet: req.body.diet,
        type: req.body.type,
    }

    let CurrentPage = {
        page: Number(req.body.page),
    }

    if (ining !== null) { queryParams.includeIngredients = ining; }
    if (excing !== null) { queryParams.excludeIngredients = excing; }

    if (req.body.cuisine !== 'all') { queryParams.cuisine = req.body.cuisine; }
    if (req.body.diet !== 'none') { queryParams.diet = req.body.diet; }
    if (req.body.type !== 'all') { queryParams.type = req.body.type; }

    let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.SPOONACULAR_API_KEY}`;



    return superagent.get(url)
        .query(queryParams)
        .then(value => {
            let myresult = value.body.results.map(elementX => {
                let extendedIng = elementX.extendedIngredients.map(x => {
                    return new Ingredient(x);
                })
                let analyzedInst = elementX.analyzedInstructions.map(x => {
                    return x.steps.map(hi => {
                        return new Step(hi);
                    })

                })
                let name = new Name(elementX);

                let resultArray = [name, analyzedInst, extendedIng];
                return resultArray;
            })

            return myresult;

        })
        .then(result => {


            res.render('pages/recipes/show', { recipeResults: result, nioh: nextPage, nioh2: previousPage, nioh3: CurrentPage });
        })
        .catch((err) => {
            res.send('something went wrong..  ' + err);
        })






}


function Name(value) {

    this.title = value.title;
    this.image = value.image;
    this.readyInMinutes = value.readyInMinutes;
    this.summary = value.summary;


};
function Ingredient(value) {
    this.smallImage = `https://spoonacular.com/cdn/ingredients_100x100/${value.image}`;
    this.OriginalString = value.originalString;

};
//analyzedInstructions.steps
function Step(value) {
    this.stepNumber = value.number;
    this.stepDetails = value.step;
};


function favoritePage(request, response) {
    const selectAll = 'SELECT * FROM recipe;';
    client.query(selectAll).then(recipeData => {
        let recipez = recipeData.rows.map((value) => value);
        const responseObject = { favo: recipez };
        response.status(200).render('pages/recipes/yourFavorite', responseObject);
    });
}



// Listen
client.connect().then(() => {
    app.listen(PORT, () => console.log(`You Successfully Connected To Port: ${PORT}`));
}).catch(() => console.log(`Could not connect to database`));
