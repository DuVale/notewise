// This javascript module presents a simple CRUD interface for REST web services.
// Requires Prototype.js 1.3.1 - http://prototype.conio.net/
//
// Use it like the following:
//
//      // Basic class setup
//      Music.Artist = Class.create();
//      Music.Artist.extend(JSDBI);
//      Music.Artist.prototype = (new JSDBI()).extend( {
//          initialize: function () {
//          },
//      });
//      
//      Music.Artist.fields(['artistid', 'name']);
//      Music.Artist.url('http://someserver/rest/artist');
//      Music.Artist.elementTag('artist'); //optional
//     
//      // In the calling code
//      
//      var artist = Music.Artist.insert({name: 'Billy'});
//      var artistid = artist.id();
//      
//      artist = Music.Artist.retrieve(artistid);
//      document.write("name: "+artist.name());
//      
//      artist.name('Fred');
//      artist.update();
//      
//      artist.destroy();
//
// The REST interface must use a single url endpoint, with primary keys for the
// objects appended to the end of the url, like http://localhost/rest/artist/1
// where 1 is the primary key of the artist requested.  Retrieve and create
// will be called on the base url (http://localhost/rest/artist) and update and
// delete will be called on the object's url (http://localhost/rest/artist/1).
//
// Actions are mapped onto the REST interface in the following manner:
// retrieve - HTTP GET
// insert - HTTP PUT (accepts CGI params for field values)
// update - HTTP POST (accepts CGI params for field values)
// delete - HTTP DELETE
//
// Assuming the docTag set to 'response' and the elementTag is set to 'artist',
// the xml returned from the server should look like:
//
// <response>
//    <artist name="Fred" artistid="80"/>
// </response>
//
//
// Copyright (C) 2005 Scotty Allen <scotty@scottyallen.com>
//
// This code is freely distributable under the terms of an MIT-style license.
//
// Inspired heavily by Class::DBI - http://search.cpan.org/~tmtm/Class-DBI/lib/Class/DBI.pm
// Thanks to Scott Williams, Chris Whipple, and Jon Raphelson for letting me bounce ideas off them

// TODO current list
//  Handle errors from the server

// TODO future list
//  Allow support for server push updating
//  Allow for other field types than strings (like arrays and more complex data structures)
//  Allow for more flexible definition of the REST interface
//  Allow hydration of fields (relationships)

// #################################################################
var JSDBI = Class.create();
JSDBI.Version = '0.2';
JSDBI.prototype = {
    initialize: function () {
    },

    // Returns the primary key for this object
    id: function () {
        // call the accessor for the primary key (gross syntax, I know)
        if(this.__primaryKeys){
            var ids = new Array;
            for(var i=0;i<this.__primaryKeys.length;i++){
                var keyName=this.__primaryKeys[i]
                ids.push(this[keyName]());
            }
            return ids;
        } else {
            var primaryKey = this.fields()[0];
            return this[primaryKey]();
        }
    },

    // Sends any updated fields in the object to the server.
    update: function() {
        var params = this.__getParams();
        var request = new Ajax.Request(this.url(), { method: 'post',
                                                     parameters: params,
                                                     asynchronous: true} );
        return;
    },

    // Deletes this object from the server.
    //  XXX it won't let me name this delete - is destroy a good name?
    destroy: function() {
        var request = new Ajax.Request(this.url(), { method: 'delete',
                                                     asynchronous: false} );
        return;
    },

    // Returns the server url for this object (for updating and deleting)
    url: function() {
        var url;
        if(typeof this.id() == 'number'
           || typeof this.id() == 'string'){
            url = this.__url+'/'+this.id();
        } else if (typeof this.id() == 'object'){
            url = this.__url+'/'+this.id().join('/');
        } else {
            alert ('id of unknown type: '+(typeof this.id()));
        }
        return url;
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
    },

    // returns the names of the fields for this object
    fields: function() {
        return this.__fields;
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
        // set default elementTag if it's not already set
        if((this.elementTag()) === undefined){
            var chunks = url.split('/');
            this.elementTag(chunks[chunks.length-1]);
        }
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
            for(var i=0; i<this.prototype.__fields.length;i++){
                delete this.prototype[this.prototype.__fields[i]];
            }
        }

        // create all the new accessors
        for(var i=0; i<fields.length;i++){
            var field = fields[i];
            this.prototype[field] = this.__createAccessor(field);
        }

        // set the list of accessors
        return this.prototype.__fields = fields;
    } else {
        return this.prototype.__fields;
    }
};

// This may optionally be used to specify multiple primary keys.  You should
// also include these fields in the general list of fields.
JSDBI.primaryKeys = function (keyNames) {
    if(keyNames){
        return this.prototype.__primaryKeys = keyNames;
    } else {
        return this.prototype.__primaryKeys;
    }
}

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

    var url;
    if(typeof id == 'number'
       || typeof id == 'string' ){
        url = this.url()+'/'+id;
    } else if (typeof id == 'object'){
        url = this.__url;
        for(var i=0;i<this.__primaryKeys.length;i++){
            var keyName=this.__primaryKeys[i]
            url = url+'/'+id[keyName];
        }
    } else {
        alert("couldn't match type of id: "+typeof id);
    }
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
        window.status="key: "+key;
        object[key](value);
    }
    var params = object.__getParams();
    var request = new Ajax.Request(this.url(),
                                        { method: 'put',
                                          parameters: params,
                                          asynchronous: false} );
//    alert(request.transport.responseText);
    object.__populate(request.transport.responseXML);
    return object;
};

