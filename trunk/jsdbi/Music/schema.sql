CREATE TABLE cd (
  cdid   int primary key auto_increment,
  artist INTEGER, # references 'artist'
  title  VARCHAR(255),
  year   CHAR(4)
);

CREATE TABLE artist (
    artistid integer primary key auto_increment,
    name varchar(255)
);

create table track (
    trackid integer primary key auto_increment,
    cd integer,
    position integer,
    title varchar(255)
);
