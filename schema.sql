DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures(
    sigId SERIAL primary key,
    Sig TEXT not null,
    userid INTEGER not null
);




DROP TABLE IF EXISTS users;

CREATE TABLE users(
    userid SERIAL primary key,
    first VARCHAR(255) not null,
    last VARCHAR(255) not null,
    email VARCHAR unique not null,
    hashedpass VARCHAR not null,
    created_at TIMESTAMP default CURRENT_TIMESTAMP
 );



DROP TABLE IF EXISTS user_profiles;

CREATE TABLE user_profiles(
    profile_id SERIAL primary key,
    age INTEGER,
    city VARCHAR(255),
    homepage VARCHAR(255),
    userid INTEGER not null,
    created_at TIMESTAMP default CURRENT_TIMESTAMP
);






-- You should also change the signatures table so that it has a column for the user id. You need to be able to map signatures to users and users to signatures.
