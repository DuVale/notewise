var Note = Class.create();
Note.extend(JSDBI);
Note.prototype = {};
JSDBI.inherit(Note,new JSDBI());
JSDBI.inherit(Note,new WiseObject());

// Setup the JSDBI data access
Note.fields(['id', 'container_object', 'content', 'height', 'width', 'x', 'y']);
Note.url('rest/note');
Note.elementTag('note');
Note.contentField('content');
Note.has_a('container_object','Kernel');

// multiple inheritance from both JSDBI and Draggable
Note.prototype.extend({
    
    initialize: function(id,container_object,htmlElement,x,y,width,height,content) {
        
        if(htmlElement != undefined) {
            this.htmlElement = htmlElement;
            this.htmlElement.note=this;
            this.setup();
        }
        
        this.type        = 'Note';
        this.id(id);
        this.container_object(container_object);
        this.__x=x;
        this.__y=y;
        this.__width=width;
        this.__height=height;
        this.__content=content;
        this.superclass=Note.superclass;

        JSDBI.prototype.initialize.call(this);
        WiseObject.prototype.initialize.call(this);

        // XXX blah, hackage.  For some reason, toString doesn't get inherited from
        // JSDBI.prototype via JSDBI.inherit(), nor can we set it up like all our other methods.

        this.toString = function () {
            return JSDBI.prototype.toString.call(this);
        }
    },

    // creates the actual html for this kernel
    // XXX this is a bunch of garbage - need to unify this html with the stuff
    // in root/Kernel/kernel.tt.  Maybe think about shipping the html as part
    // of the xml?  Or maybe a seperate ajax call?
    realize: function(parent) {
        
        this.htmlElement = document.createElement('div');
        this.htmlElement.id="note"+this.id();
        this.htmlElement.className="note";
        var innerHTML =
           "<div class=\"leftgrippie\"></div>"
           +"<div class=\"relationshiphalo\"></div>"
           +"<input type=button value='X' class='removebutton'/>"
           +"<textarea class='body'>"
           + this.content()
           +"</textarea>"
           +"<div class=\"corner\">"
           +"</div>";
        this.htmlElement.innerHTML = innerHTML;
        this.htmlElement.note=this;
        WiseObject.prototype.realize.call(this,parent);
    },

    // setup all the event listeners
    registerHandlers: function() {
        WiseObject.prototype.registerHandlers.call(this);
        
        // setup the blur handler for the textarea
        this.body.__hasFocus = false;
        this.body.onfocus = this.bodyFocus.bindAsEventListener(this);
        this.body.onblur = this.contentChanged.bindAsEventListener(this);

        // TODO DRY - consolidate these into a big list of element/event pairs
        // Setup action terminators

        // dragging on the body shouldn't drag the object
        Utils.registerEventListener(this.body, 'mousedown',
                                    Utils.terminateEvent.bindAsEventListener(this));

        Utils.registerEventListener(this.body, 'dblclick',
                                    Utils.terminateEvent.bindAsEventListener(this));
                                    
        Utils.registerEventListener(this.body, 'click',
                                    Utils.terminateEvent.bindAsEventListener(this));

    },

    getMinHeight: function() {
        return 100;
    },

    getMinWidth: function() {
        return 100;
    },

    collapsed: function(){
        return 0;
    },

    bodyFocus: function (e) {
      this.body.__hasFocus = true;
    },
    
    contentChanged: function (e) {
        var text = this.body.value;
        if(text != this.content()) {
            this.content(text);
            this.update();
        }
        this.body.__hasFocus = false;
    },

    // Select this kernel
    select: function () {
        if (this.body.__hasFocus) this.retainFocus = true;
        else this.retainFocus = false;
  
        WiseObject.prototype.select.call(this,parent);
    },

    // Mark this kernel as not selected
    deselect: function () {
        this.body.retainFocus = false;
        WiseObject.prototype.deselect.call(this,parent);
    },

    startDrag: function() {
        if (this.body.__hasFocus) { 
          this.body.retainFocus = true; 
        } else { 
          this.body.retainFocus = false; 
        }
        WiseObject.prototype.startDrag.call(this,parent);
    },
 
    endDrag: function() {
        WiseObject.prototype.endDrag.call(this,parent);

        if(this.retainFocus) {
          this.body.focus();
        }
    },
 
    cancelDrag: function() {
        WiseObject.prototype.cancelDrag.call(this,parent);
        
        if(this.retainFocus)
          this.body.focus();
    },

    // makes notes compatible with visible ojbects for relationships
    // (see initialize() in js/relationship.js)
    contained_object: function() {
        return this;
    }
});
