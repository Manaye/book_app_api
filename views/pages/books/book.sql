DROP TABLE IF EXISTS bookshelf;

CREATE TABLE bookshelf(
id SERIAL PRIMARY KEY,
author text ,
title varchar(225),
isbn varchar(225),
image_url varchar(255),
description text,
bookshelf varchar(255)

);


