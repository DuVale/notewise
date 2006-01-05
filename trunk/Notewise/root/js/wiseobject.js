var WiseObject = Class.create();
WiseObject.prototype = {};
JSDBI.inherit(WiseObject,new Draggable());

WiseObject.prototype.extend({

    initialize: function() {
        // listeners that get notified when this visible kernel moves
        this.__moveListeners = [];
        // listeners that get notified when this visible kernel changes size
        this.__sizeListeners = [];
        // listeners that get notified when this visible kernel starts moving or changing size (start of the drag)
        this.__startChangeListeners = [];
        // listeners that get notified when this visible kernel stops moving or changing size (end of the drag)
        this.__endChangeListeners = [];
    },

    // XXX this is necessary because inheritance is kinda borked
    collapsed: function (collapsed) {
        return this.superclass.collapsed.call(this, collapsed);
    },

    setup: function () {
        this.fetchElements();
        this.registerHandlers();
    },

    // creates the actual html for this object. Subclasses should override this
    // supply the actual html node in this.htmlElement.
    realize: function(parent) {
        parent.appendChild(this.htmlElement);
        this.setup();
        this.x(this.x());
        this.y(this.y());
        this.setWidth(this.width());
        this.setHeight(this.height());
        this.layout();
        
        // clean out whitespace only child nodes, in the hopes of improving layoutResize speed
        Element.cleanWhitespace(this.htmlElement);
    },

    // retrieves references to all the relevant html elements and stores them
    // as properties in this object
    fetchElements: function () {
        this.body = Utils.getElementsByClassName(this.htmlElement, 'body')[0];
        this.corner = Utils.getElementsByClassName(this.htmlElement, 'corner')[0];
        this.relationshipbutton = Utils.getElementsByClassName(this.htmlElement, 'relationshipbutton')[0];
        this.removebutton = Utils.getElementsByClassName(this.htmlElement, 'removebutton')[0];
    },

    // retrieves references to all the relevant html elements and stores them
    // as properties in this object
    fetchElements: function () {
        this.body = Utils.getElementsByClassName(this.htmlElement, 'body')[0];
        this.corner = Utils.getElementsByClassName(this.htmlElement, 'corner')[0];
        this.relationshipbutton = Utils.getElementsByClassName(this.htmlElement, 'relationshipbutton')[0];
        this.removebutton = Utils.getElementsByClassName(this.htmlElement, 'removebutton')[0];
    }
});
