DROP TABLE IF EXISTS recipe;

CREATE TABLE recipe(
    id  SERIAL PRIMARY KEY,
    image_url VARCHAR (1000),
    title VARCHAR (255),
    readyInMinutes VARCHAR (255),
    summary VARCHAR (1000000),
    stepDetails VARCHAR (1000000)
)
