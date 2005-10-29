//TODO
// X when fields is called, see if there are any existing fields.  If so, remove the accessors for those.  Then add the accessors for the new fields.  Update the fields list.  The primary key field needs to get stored elsewhere
// - write the following REST functions:
//     - insert
//     - update
//     - retrieve
//     - delete
// X write id

// TODO Future
// Allow support for multiple primary key fields
// #################################################################
var JSDBI = Class.create();
JSDBI.prototype = {
    initialize: function () {
    },

    id: function () {
        // call the accessor for the primary key (gross syntax, I know)
        return this[this.__primaryKey]();
    },

    setup: function () {
        // TODO 
    },
};

// These are class methods, and thus, aren't included in the prototype.  This
// means they can't be called on instantiated objects


// gets/sets the base REST url for this class.  All actions are performed
// against this url.  If the object is specific to an already existing object,
// then the object primary key fields are appended to the url, separated by
// slashes, ie: http://localhost/rest/artist/1 or http://localhost/rest/track/1/2
JSDBI.url = function (url) {
    if(url){
        this.prototype.__url = url;
    } else {
        return this.prototype.__url;
    }
};

// gets/sets up the the allowed fields for the jsdbi object.  Accepts a
// array of field names.
JSDBI.fields = function (fields) {
    if(fields){
        if(this.prototype.__fields && this.prototype.__fields.length > 0){
            // we had previous fields, so delete all the previous accessors
            for(var i=0; i<fields.length;i++){
                delete this.prototype[fields[i]];
            }
        }

        // create all the new accessors
        for(var i=0; i<fields.length;i++){
            var field = fields[i];
            this.prototype[field] = this.__createAccessor(field);
        }

        // save the primary key
        this.prototype.__primaryKey = fields[0];

        // set the list of accessors
        this.prototype.__fields = fields;
    } else {
        return this.prototype.__fields;
    }
};

// This creates nifty closures for us
JSDBI.__createAccessor = function (field){
    return function (value) {
        var thisfield = field;
        if(value){
            this['__'+thisfield] = value;
        } else {
            return this['__'+thisfield];
        }
    };
}



// ################

// ***** Setup ******
var Music = {
    Version: '0.1-alpha'
};

// ################

Music.DBI = Class.create();
Music.DBI.extend(JSDBI);
Music.DBI.prototype = (new JSDBI()).extend( {
    initialize: function () {
    },
});

Music.DBI.url('http://localhost/rest/artist');

// ################

Music.Artist = Class.create();
Music.Artist.extend(Music.DBI);
Music.Artist.prototype = (new Music.DBI()).extend( {
    initialize: function () {
    },

    intro: function () {
    }
});

// basic class setup
Music.Artist.fields(['artistid', 'name']);

// #################################################################

document.write("Music.Artist.url: "+Music.Artist.url());
document.write("<br/>");
document.write("Music.Artist.fields: "+Music.Artist.fields());
document.write("<br/>");
var artist = new Music.Artist();
artist.name('fred');
artist.artistid(12);

document.write("name: "+artist.name());
document.write("<br/>");
document.write("artistid: "+artist.artistid());
document.write("<br/>");
document.write("id: "+artist.id());
document.write("<br/>");
for(prop in artist){
    document.write("property: "+prop);
    document.write("<br/>");
}
