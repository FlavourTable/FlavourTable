DROP TABLE IF EXISTS recipe;

CREATE TABLE recipe(
    id  SERIAL PRIMARY KEY,
    image_url VARCHAR (255),
    title VARCHAR (255),
    readyInMinutes VARCHAR (255),
    summary VARCHAR (255),
    stepDetails VARCHAR (255)
)
