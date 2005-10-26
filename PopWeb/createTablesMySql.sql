CREATE TABLE IF NOT EXISTS object_id (
    id MEDIUMINT UNSIGNED UNIQUE NOT NULL AUTO_INCREMENT,
    type ENUM('kernel','note','relationship') NOT NULL,
    PRIMARY KEY (id)
) ENGINE = MYISAM;

CREATE TABLE IF NOT EXISTS kernel (
    id MEDIUMINT UNSIGNED UNIQUE NOT NULL,
    name TINYTEXT,
    uri TINYTEXT,
    source TEXT,
    created DATETIME NOT NULL,
    lastModified TIMESTAMP NOT NULL,
    lastViewed TIMESTAMP NOT NULL,
    FULLTEXT INDEX kernelnames (name),
    INDEX kernelModified (lastModified),
    INDEX kernelViewed (lastViewed),
    KEY (id),
    -- "KEY" doubles as "INDEX" in MySQL evidently...
    --  PRIMARY KEY (name(255))
    KEY (name(255)),
    -- The PRIMARY KEY declaration guarantees uniqueness; MySQL doesn't like
    --   the UNIQUE keyword explicitly on the name field.
    FOREIGN KEY (id) REFERENCES object_id(id)
    -- Warning: Foreign keys not honored in MyISAM tables!  (And we can't use
    --   InnoDB tables because they have no full text search, and are optimized
    --   for OLTP, not retrieval-only.)
) ENGINE = MYISAM;

CREATE TABLE IF NOT EXISTS note (
    container MEDIUMINT UNSIGNED NOT NULL,
    id MEDIUMINT UNSIGNED UNIQUE NOT NULL,
    content TEXT NOT NULL,
    source TEXT,
    created DATETIME NOT NULL,
    lastModified TIMESTAMP NOT NULL,
    x SMALLINT,
    y SMALLINT,
    w SMALLINT,
    h SMALLINT,
    FULLTEXT INDEX notes (content),
    INDEX containerNotes (container),
    PRIMARY KEY (id),
    FOREIGN KEY (id) REFERENCES object_id(id),
    FOREIGN KEY (container) REFERENCES object_id(id)
) ENGINE = MYISAM;

CREATE TABLE IF NOT EXISTS relationship_type (
    id SMALLINT UNSIGNED UNIQUE NOT NULL AUTO_INCREMENT,
    relationship_type TINYTEXT,
    PRIMARY KEY (id),
    KEY (relationship_type(255))
    -- (See above note for PRIMARY KEY declaration.)
) ENGINE = MYISAM;

CREATE TABLE IF NOT EXISTS relationship (
    relationship_id MEDIUMINT UNSIGNED UNIQUE NOT NULL,
    part1 MEDIUMINT UNSIGNED NOT NULL,
    part2 MEDIUMINT UNSIGNED NOT NULL,
    nav ENUM('fromleft','fromright','bi','non') NOT NULL,
    type SMALLINT UNSIGNED,
    INDEX part1relIndex (part1),
    INDEX part2relIndex (part2),
    PRIMARY KEY (part1, part2, type),
    FOREIGN KEY (rel_id) REFERENCES object_id(id),
    FOREIGN KEY (part1) REFERENCES object_id(id),
    FOREIGN KEY (part2) REFERENCES object_id(id),
    FOREIGN KEY (reltypeId) REFERENCES relationship_type(reltypeId)
) ENGINE = MYISAM;

CREATE TABLE masked_relationship (
    relationship INT NOT NULL,
    container INT NOT NULL,
    PRIMARY KEY (relationship, container),
    INDEX relidIndex (relationship),
    INDEX containeridIndex (container),
    FOREIGN KEY (relationship) REFERENCES relationship(id),
    FOREIGN KEY (container) REFERENCES kernel(id)
) ENGINE = MYISAM;

CREATE TABLE IF NOT EXISTS contained_object (
    container_object MEDIUMINT UNSIGNED NOT NULL,
    contained_object MEDIUMINT UNSIGNED NOT NULL,
    x SMALLINT,
    y SMALLINT,
    width SMALLINT,
    height SMALLINT,
    collapsed TINYINT,
    -- Note: MySQL "BOOLEAN" type is just a synonym for TINYINT(1).  As in C,
    --   zero is false, nonzero is true.
    PRIMARY KEY (container_object, contained_object),
    FOREIGN KEY (container_object) REFERENCES object_id(id),
    FOREIGN KEY (contained_object) REFERENCES object_id(id),
    INDEX objectsContainingObjects (container_object),
    INDEX objectsContainedInObjects (contained_object)
) ENGINE = MYISAM;

CREATE TABLE IF NOT EXISTS preference (
    prefkey TINYTEXT NOT NULL,
    prefvalue TEXT,
    PRIMARY KEY (prefkey(255))
);

CREATE TABLE quicksearch_choice (
    exactSearchString VARCHAR(255) NOT NULL,
    chosenKernel INT NOT NULL,
    numberOfTimes INT NOT NULL,
    lastChosen TIMESTAMP NOT NULL,
    INDEX searchStringIndex (exactSearchString),
    PRIMARY KEY (exactSearchString, chosenKernel),
    FOREIGN KEY (chosenKernel) REFERENCES kernel(id)
);
