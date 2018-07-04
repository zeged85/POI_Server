create table POIs(
id int IDENTITY,
name varchar(255),
description varchar(255),
address varchar(255),
pic varchar(255),
category varchar(255),
total_score int default 0,
num_of_votes int default 0,
num_of_views int default 0,
primary key (id)
);