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

app.post('/search_name', searchName);
app.post('/details', details);




















function details(req, res){


    const queryParams = {
        titleMatch: req.body.titleMatch,
        maxAlcohol: 0,
        addRecipeInformation: true,
        fillIngredients: true,
    };


    let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.SPOONACULAR_API_KEY}`;
    return superagent.get(url)
        .query(queryParams)
        .then(value => {     
                let myresult= value.body.results.map(elementX => {
                    let extendedIng=elementX.extendedIngredients.map(x=>{
                        return new Ingredient(x);
                    })
                    let analyzedInst=elementX.analyzedInstructions.map(x=>{
                        return x.steps.map(hi=>{
                            return new Step(hi);
                        })
                        
                    })
                    let name = new NameD(elementX);

                    let resultArray =[name , analyzedInst ,extendedIng] ;
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
    if(ining !== null){

        if (ining.length > 1) {
            ining = ining.join('+');
        } else if (ining.length === 1) {
            ining = ining[0];
        }
      
    } 
    
    let temp_input_exclude = req.body.excludeIngredients;
    let excing = temp_input_exclude.match(regex);
    if(excing !== null){

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
        page:Number(req.body.page)+1,
        searchVar:req.body.query,
        ining:req.body.includeIngredients,
        excing:req.body.excludeIngredients,
        cuisine:req.body.cuisine,
        diet:req.body.diet,
        type:req.body.type,
    }
    
    let previousPage = {
        page:Number(req.body.page)-1,
        searchVar:req.body.query,
        ining:req.body.includeIngredients,
        excing:req.body.excludeIngredients,
        cuisine:req.body.cuisine,
        diet:req.body.diet,
        type:req.body.type,
    }

    let CurrentPage ={
        page:Number(req.body.page),
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
                return value.body.results.map(elementX => {
                return new Name(elementX);
                })
        })
        .then(result => {

            res.render('pages/recipes/show', { recipeResults: result ,nioh:nextPage,nioh2:previousPage , nioh3:CurrentPage});
        })
        .catch((err) => {
            res.send('something went wrong..  ' + err);
        })

        



        
}















function checkNext(req, res) {
    let page = req.body.page;
   console.log('hi ');
    
    let regex = /\b[A-z][A-z]*/g;

    let temp_input_include = req.body.includeIngredients;
    let ining = temp_input_include.match(regex);
    if(ining !== null){

        if (ining.length > 1) {
            ining = ining.join('+');
        } else if (ining.length === 1) {
            ining = ining[0];
        }
      
    } 
    
    let temp_input_exclude = req.body.excludeIngredients;
    let excing = temp_input_exclude.match(regex);
    if(excing !== null){

        if (excing.length > 1) {
            excing = excing.join('+');
        } else if (excing.length === 1) {
            excing = excing[0];
        }

    }

    const numPerPage = 10;
    const start = ((page - 1) * numPerPage + 1);
    page += 1;
    const queryParamsNext = {
        query: req.body.query,
        maxAlcohol: 0,
        addRecipeInformation: true,
        fillIngredients: true,
        offset: start+1,
        number: numPerPage,
    };

   

    if (ining !== null) { queryParamsNext.includeIngredients = ining; }
    if (excing !== null) {queryParamsNext.excludeIngredients = excing; }

    if (req.body.cuisine !== 'all') { queryParamsNext.cuisine = req.body.cuisine; }
    if (req.body.diet !== 'none') { queryParamsNext.diet = req.body.diet; }
    if (req.body.type !== 'all') { queryParamsNext.type = req.body.type; }

    let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${process.env.SPOONACULAR_API_KEY}`;
  
    return superagent.get(url)
        .query( queryParamsNext)
        .then(value => {     
                return value.body.results.map(elementX => {
                return new Name(elementX);
                })
        })
        .then(result => {
            console.log(result);
            if(result.length < 1){
                res.render('pages/recipes/show', { nextPage : 'false'});
            }else if(result.length >1){
                res.render('pages/recipes/show', { nextPage : 'true'});

            }
        })
        .catch((err) => {
            res.send('something went wrong..  ' + err);
        })
        
}









function Name(value) {
    this.title = value.title;
    this.image = value.image;
};


// Listen
app.listen(PORT, () => console.log(`You Successfully Connected To Port ${PORT}`));
