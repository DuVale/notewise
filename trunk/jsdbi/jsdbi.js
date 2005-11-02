// TODO my todo list
// X when fields is called, see if there are any existing fields.  If so, remove the accessors for those.  Then add the accessors for the new fields.  Update the fields list.  The primary key field needs to get stored elsewhere
// X write the following REST functions:
//     X insert
//     X update
//     X retrieve
//     X delete
// X write id
// - do something about errors from the server
// - default elementTag to last piece of url

// TODO future todo list
// Allow support for multiple primary key fields
// #################################################################
var JSDBI = Class.create();
JSDBI.prototype = {
    initialize: function () {
        // TODO not sure I actually need to do anything here, but it's possible
    },

    // Returns the primary key for this object
    id: function () {
        // call the accessor for the primary key (gross syntax, I know)
        return this[this.__primaryKey]();
    },

    // Sends any updated fields in the object to the server.
    update: function() {
        var params = this.__getParams();
        var request = new Ajax.Request(this.__url+'/'+this.id(),
                                            { method: 'post',
                                              parameters: params,
                                              asynchronous: false} );
        return;
    },

    // Deletes this object from the server.
    //  XXX it won't let me name this delete - is destroy a good name?
    destroy: function() {
        var request = new Ajax.Request(this.__url+'/'+this.id(),
                                            { method: 'delete',
                                              asynchronous: false} );
        return;
    },

    // Takes in an xml element or document, and populates the fields for this object from it
    __populate: function(xml) {
        if(xml.constructor == '[XMLDocument]'){
            var elements = xml.getElementsByTagName(this.__docTag);
            elements = elements[0].getElementsByTagName(this.__elementTag);
            xml = elements[0];
        }
        for(var i=0;i<this.__fields.length;i++){
            var field = this.__fields[i];
            this[field](xml.getAttribute(field));
        }
    },

    // returns a string containing all the fields for this object joined together as cgi parameters
    __getParams: function() {
        var paramList = "";
        for(var i=0;i<this.__fields.length;i++){
            var fieldName = this.__fields[i];
            if(this[fieldName]() == undefined){
                // skip undefined values
                continue;
            }
            if(paramList){
                paramList = paramList + '&';
            }
            paramList = paramList + escape(fieldName)+'='+escape(this[fieldName]());
        }
        return paramList;
    }
};

// These are class methods, and thus, aren't included in the prototype.  This
// means they can't be called on instantiated objects

// gets/sets the base REST url for this class.  All actions are performed
// against this url.  If the object is specific to an already existing object,
// then the object primary key field is appended to the url, separated by
// a slash, ie: http://localhost/rest/artist/1
JSDBI.url = function (url) {
    if(url){
        return this.prototype.__url = url;
    } else {
        return this.prototype.__url;
    }
};

// gets/sets the base xml tag for the xml documents returned from the server
// for this class.  Defaults to 'response'
JSDBI.prototype.__docTag = 'response';
JSDBI.docTag = function (docTag) {
    if(docTag){
        return this.prototype.__docTag = docTag;
    } else {
        return this.prototype.__docTag;
    }
};

// gets/sets the  xml tag for the elements that represent this object in xml
// documents returned from the server.  Defaults to the last segment of the url
// (Ie, the url http://localhost/rest/artist will result in the elementTag
// 'artist'
// TODO setup default
JSDBI.elementTag = function (elementTag) {
    if(elementTag){
        return this.prototype.__elementTag = elementTag;
    } else {
        return this.prototype.__elementTag;
    }
};

// gets/sets up the the allowed fields for the jsdbi object.  Accepts a
// array of field names.
JSDBI.fields = function (fields) {
    if(fields){
        if(this.prototype.__fields && this.prototype.__fields.length > 0){
            // we had previous fields, so delete all the previous accessors
            for(var i=0; i<this.prototype__fields.length;i++){
                delete this.prototype[this.prototype.__fields[i]];
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
        return this.prototype.__fields = fields;
    } else {
        return this.prototype.__fields;
    }
};

// This creates nifty closures for us
JSDBI.__createAccessor = function (field){
    return function (value) {
        var thisfield = field;
        if(value){
            return this['__'+thisfield] = value;
        } else {
            return this['__'+thisfield];
        }
    };
};

// Retrieves an existing object from the server, given the object id
JSDBI.retrieve = function (id) {
    // more crazy shit - this actually gets an instance of the current class,
    // amazingly
    var object = new this();

    var url = this.url()+'/'+id;
    var request = new Ajax.Request(url,
                                   { method: 'get',
                                     asynchronous: false } );

    object.__populate(request.transport.responseXML);
    return object;
};

// Creates a new object on the server.  Accepts an associative array (object) of values for the new object.
JSDBI.insert = function (values) {
    var object = new this();
    for(key in values){
        var value = values[key];
        object[key](value);
    }
    var params = object.__getParams();
    var request = new Ajax.Request(this.url(),
                                        { method: 'put',
                                          parameters: params,
                                          asynchronous: false} );
    object.__populate(request.transport.responseXML);
    return object;
};

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
    }
});

Music.DBI.docTag('response');

// ################

Music.Artist = Class.create();
Music.Artist.extend(Music.DBI);
Music.Artist.prototype = (new Music.DBI()).extend( {
    initialize: function () {
    },
});

// basic class setup
Music.Artist.fields(['artistid', 'name']);
Music.DBI.url('http://home.scottyallen.com/jsdbi/Music/script/music_cgi.cgi/rest/artist');
Music.Artist.elementTag('artist');

// #################################################################

document.write("**Insert**");
document.write("<br/>");
var artist2 = Music.Artist.insert({name: 'Billy'});
var artistid = artist2.id();
document.write("name: "+artist2.name());
document.write("<br/>");
document.write("artistid: "+artist2.artistid());
document.write("<br/>");
document.write("id: "+artist2.id());
document.write("<br/>");
document.write("paramList: "+artist2.__getParams());
document.write("<br/>");

document.write("**Retrieve**");
document.write("<br/>");
artist2 = Music.Artist.retrieve(artistid);
document.write("name: "+artist2.name());
document.write("<br/>");
document.write("artistid: "+artist2.artistid());
document.write("<br/>");
document.write("id: "+artist2.id());
document.write("<br/>");
document.write("paramList: "+artist2.__getParams());
document.write("<br/>");

artist2.name('Fred');
artist2.update();

document.write("**Update**");
document.write("<br/>");
document.write("name: "+artist2.name());
document.write("<br/>");
document.write("artistid: "+artist2.artistid());
document.write("<br/>");
document.write("id: "+artist2.id());
document.write("<br/>");
document.write("paramList: "+artist2.__getParams());
document.write("<br/>");

artist2 = Music.Artist.retrieve(artistid);
document.write("**ReRetrieved**");
document.write("<br/>");
document.write("name: "+artist2.name());
document.write("<br/>");
document.write("artistid: "+artist2.artistid());
document.write("<br/>");
document.write("id: "+artist2.id());
document.write("<br/>");
document.write("paramList: "+artist2.__getParams());
document.write("<br/>");

artist2.destroy();
document.write("**Deleted**");
