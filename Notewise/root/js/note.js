var Note = Class.create();
Note.extend(JSDBI);
Note.prototype = {};
JSDBI.inherit(Note,new JSDBI());
JSDBI.inherit(Note,new Draggable());

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

        // listeners that get notified when this visible kernel moves
        this.__moveListeners = [];
        // listeners that get notified when this visible kernel changes size
        this.__sizeListeners = [];
        // listeners that get notified when this visible kernel starts moving or changing size (start of the drag)
        this.__startChangeListeners = [];
        // listeners that get notified when this visible kernel stops moving or changing size (end of the drag)
        this.__endChangeListeners = [];
        JSDBI.prototype.initialize.call(this);
    },
    setup: function () {
        this.fetchElements();
        this.registerHandlers();
    },
    // creates the actual html for this kernel
    // XXX this is a bunch of garbage - need to unify this html with the stuff in root/Kernel/kernel.tt.  Maybe think about shipping the html as part of the xml?  Or maybe a seperate ajax call?
    realize: function(parent) {
        
        this.htmlElement = document.createElement('div');
        this.htmlElement.id="note"+this.id();
        this.htmlElement.className="note";
        var innerHTML =
           "<div class=\"leftgrippie\"></div>"
           +"<input type=button value='X' class='removebutton'/>"
           +"<input type=button value='R' class='relationshipbutton'/>"
           +"<div class=\"rightgrippie\"/></div>"
           +"<textarea class='body'>"
           + this.content()
           +"</textarea>"
           +"<div class=\"corner\">"
           +"</div>";
        this.htmlElement.innerHTML = innerHTML;
        parent.appendChild(this.htmlElement);
        this.fetchElements();
        this.registerHandlers();
        this.x(this.x());
        this.y(this.y());
        this.setWidth(this.width());
        this.setHeight(this.height());
        this.layout();
    },

    // retrieves references to all the relevant html elements and stores them
    // as properties in this object
    fetchElements: function () {
        this.body = Utils.getElementsByClassName(this.htmlElement, 'body')[0];
        this.corner = Utils.getElementsByClassName(this.htmlElement, 'corner')[0];
        this.relationshipbutton = Utils.getElementsByClassName(this.htmlElement, 'relationshipbutton')[0];
        this.removebutton = Utils.getElementsByClassName(this.htmlElement, 'removebutton')[0];
    },

    // setup all the event listeners
    registerHandlers: function() {
        
        // set up the dnd
        dndMgr.registerDraggable( this );
        dndMgr.registerDraggable( new KernelCornerDraggable(this.corner, this) );

        // setup the blur handler for the textarea
        this.body.onblur = this.contentChanged.bindAsEventListener(this);

        // setup the click handlers
        // Utils.registerEventListener(this.namefield,'click', this.selectAndTerminate.bindAsEventListener(this));
        // Utils.registerEventListener(this.namelink,'click', Utils.terminateEvent.bindAsEventListener(this));
        // Utils.registerEventListener(this.namelink,'mousedown', Utils.terminateEvent.bindAsEventListener(this));
        
        // setup the relationship button
        Utils.registerEventListener(this.relationshipbutton,
                                   'mousedown',
                                   this.startCreateRelationship.bindAsEventListener(this));

        // setup the remove button
        Utils.registerEventListener(this.removebutton,
                                   'click',
                                   this.destroy.bind(this));

        // TODO DRY - consolidate these into a big list of element/event pairs
        // Setup action terminators

        // dragging on any of the buttons shouldn't drag the object
        Utils.registerEventListener(this.relationshipbutton,
                                   'mousedown',
                                   Utils.terminateEvent.bindAsEventListener(this));
        Utils.registerEventListener(this.removebutton,
                                   'mousedown',
                                   Utils.terminateEvent.bindAsEventListener(this));

        // doubleclicking on any of the buttons shouldn't do anything
        Utils.registerEventListener(this.relationshipbutton,
                                   'dblclick',
                                   Utils.terminateEvent.bindAsEventListener(this));
        Utils.registerEventListener(this.removebutton,
                                   'dblclick',
                                   Utils.terminateEvent.bindAsEventListener(this));
    },

    // Select this object and terminate the event
    selectAndTerminate: function(e) {
        dndMgr.clearSelection();
        dndMgr.updateSelection(this,false);
        this.namefield.focus();
        Utils.terminateEvent(e)
    },

    // starts the process of creating a relationship
    startCreateRelationship: function(e){
        newRelationship.startDrag(e,this);
    },

    // removes the html element from the view, and then notifies the server
    destroy: function () {
        this.htmlElement.parentNode.removeChild(this.htmlElement);
        return this.superclass.destroy.call(this);
    },

    // performs internal visual layout of the html elements for this kernel
    layout: function(){
        this.layoutResize();
    //    this.layoutCorner();
    //    this.layoutNamefield();
    },

    // causes the resize corner to relayout
    layoutCorner: function() {
        this.corner.style.left = '';
        this.corner.style.top = '';
        this.corner.style.right = '0px';
        this.corner.style.bottom = '0px';
    },

    // causes the internal elements to resize if necessary
    layoutResize: function() {
    },

    // Toggles whether the kernel is fixed width or not
    // Accepts:
    //   fixed - a boolean indicating whether the kernel should be fixed width
    //   width - the number of pixels for the min width (and max width, in the case it is fixed width)
    setFixedWidth: function(fixed, width){
        width = (width+50);
        if(fixed){
            this.htmlElement.style.maxWidth = width+'px';
        } else {
            this.htmlElement.style.maxWidth = '';
        }
        this.htmlElement.style.minWidth = width+'px';
        window.status = "setFixedWidth set minWidth to "+width;
    },

    // Just sets the internal x coordinate but don't change the display
    setX: function(x) {
        this.notifyMoveListeners(x+'%',this.y()+'%');
        return this.superclass.x.call(this, x);
    },

    // Sets the x coordinate as a percentage of the parent object's width and moves the object accordingly
    x: function(x) {
        if(x && this.htmlElement){
            this.htmlElement.style.left = x+"%";
            this.notifyMoveListeners(x+'%',this.y()+'%');
        }
        return this.superclass.x.call(this, x);
    },

    // Just sets the internal y coordinate but don't change the display
    setY: function(y) {
        this.notifyMoveListeners(this.x()+'%',y+'%');
        return this.superclass.y.call(this, y);
    },

    // Sets the y coordinate as a percentage of the parent object's height and moves the object accordingly
    y: function(y) {
        if(y && this.htmlElement){
            this.htmlElement.style.top = y+"%";
            this.notifyMoveListeners(this.x()+'%',y+'%');
        }
        return this.superclass.y.call(this, y);
    },

    // TODO setWidth/width and setHeight/height are backwards from setX/x and
    // setY/y - unify

    // Sets the width as a percentage of the parent object's width and moves
    // the object accordingly
    setWidth: function(width) {
        var results;
        if(width != undefined){
            results = this.width(this.checkWidth(width));
            if(this.htmlElement){
                this.htmlElement.style.width = results+"%";
            }
            this.layoutResize();
            this.layoutCorner();
        } else {
            results = this.width(this.checkWidth(width));
        }
        return results;
    },

    // Just sets the internal width
    width: function(width) {
        var results = this.superclass.width.call(this, width);
        if(width != undefined){
            this.notifySizeListeners(width+'%',this.height()+'%');
        }
        return results;
    },

    // Sets the height as a percentage of the parent object's width and moves
    // the object accordingly
    setHeight: function(height) {
        var results;
        if(height != undefined){
            results = this.height(this.checkHeight(height));
            if(this.htmlElement){
                this.htmlElement.style.height = results+"%";
            }
            this.layoutResize();
            this.layoutCorner();
        } else {
            results = this.height(this.checkHeight(height));
        }
        return results;
    },

    // Just sets the internal height  but don't change the display
    height: function(height) {
        var results = this.superclass.height.call(this, height);
        if(height != undefined){
            this.notifySizeListeners(this.width()+'%',height+'%');
        }
        return results;
    },

    // returns the current actual onscreen size of the object in percent
    currentHeight: function() {
        if(this.collapsed()){
            return this.htmlElement.clientHeight*100/this.htmlElement.parentNode.clientHeight;
        } else {
            return this.height();
        }
    },

    // returns the current actual onscreen size of the object in percent
    currentWidth: function() {
        if(this.collapsed()){
            return this.htmlElement.clientWidth*100/this.htmlElement.parentNode.clientWidth;
        } else {
            return this.width();
        }
    },

    // checks to make sure the height is ok, and returns a corrected value if it isn't
    checkHeight: function(h){
        //TODO fix this to work with the new percentages
//        var minHeight=this.getMinHeight();
//        var maxHeight=this.getMaxHeight();
//        if(h < minHeight){
//            h = minHeight;
//        } else if(h > maxHeight){
//            h = maxHeight;
//        }
        return h;
    },

    // checks to make sure the width is ok, and returns a corrected value if it isn't
    checkWidth: function(w){
        //TODO fix this to work with the new percentages
//        var minWidth=this.getMinWidth();
//        var maxWidth=this.getMaxWidth();
//        if(w < minWidth){
//            w = minWidth;
//        } else if(w > maxWidth){
//            w = maxWidth;
//        }
        return w;
    },

    getMinHeight: function() {
        //TODO
        if(this.collapsed()){
            return 0;
        } else {
            return 100;
        }
    },

    getMaxHeight: function() {
        //TODO
        if(this.collapsed()){
            return 30; // height of name field
        } else {
            return 2000;
        }
    },

    getMinWidth: function() {
        var nameFieldWidth =  this.getNameFieldWidth()+30;
        if(this.collapsed()){
            return nameFieldWidth;
        } else {
            return Math.max(nameFieldWidth,100);
        }
    },

    getMaxWidth: function() {
        //TODO
        return 2000;
    },

    getMinX: function() {
        //TODO
        return 0;
    },

    getMaxX: function() {
        //TODO
        return 2000;
    },

    getMinY: function() {
        //TODO
        return 0;
    },

    getMaxY: function() {
        //TODO
        return 2000;
    },

    // Adds a movement listener.  The notify method will called whenever this
    // visible kernel moves, with the parameters this object, newX, and new Y
    addMoveListener: function (notifyMethod){
        this.__moveListeners.push(notifyMethod);
    },

    // Adds a size listener.  The notify method will called whenever this
    // visible kernel is resized, with the parameters this object, new width,
    // and new height
    addSizeListener: function (notifyMethod){
        this.__sizeListeners.push(notifyMethod);
    },

    // Adds a start change listener.  The notify method will called whenever
    // this visible kernel starts resizing or moving.  The notify method will
    // get this object as a parameter.
    addStartChangeListener: function (notifyMethod){
        this.__startChangeListeners.push(notifyMethod);
    },

    // Adds an end change listener.  The notify method will called whenever
    // this visible kernel stops resizing or moving.  The notify method will
    // get this object as a parameter.
    addEndChangeListener: function (notifyMethod){
        this.__endChangeListeners.push(notifyMethod);
    },

    notifyMoveListeners: function (x,y){
        for(var i=0;i<this.__moveListeners.length;i++){
            this.__moveListeners[i](this,x,y);
        }
    },

    notifySizeListeners: function (width, height){
        for(var i=0;i<this.__sizeListeners.length;i++){
            this.__sizeListeners[i](this,width,height);
        }
    },

    notifyStartChangeListeners: function (){
        for(var i=0;i<this.__startChangeListeners.length;i++){
            this.__startChangeListeners[i](this);
        }
    },

    notifyEndChangeListeners: function (){
        for(var i=0;i<this.__endChangeListeners.length;i++){
            this.__endChangeListeners[i](this);
        }
    },

    // accepts the vkernel to reparent to, and whether or not to notify the server about it
    reparent: function(vkernel, do_update) {
        var parentElement = vkernel.body;

        // Can't make element child of it's own child and don't reparent it if
        // it's already in the right element
        if(Utils.hasAncestor(parentElement,this.htmlElement)
          || this.htmlElement.parentNode == parentElement){
            return;
        }

        // Save all the old position and size info in pixels, so we can
        // recalculate it with the new parent
        var pos = Utils.toViewportPosition(this.htmlElement);
        var parentPos = Utils.toViewportPosition(parentElement);
        var width = this.htmlElement.clientWidth;
        var height = this.htmlElement.clientHeight;

        // actually reparent
        parentElement.appendChild(this.htmlElement);

        // switch all the position and size info to match the new parent
        this.x((pos.x-parentPos.x)*100/parentElement.clientWidth);
        this.y((pos.y-parentPos.y)*100/parentElement.clientHeight);
        this.setWidth(width*100/parentElement.clientWidth);

        // move the object to the frontmost layer
        dndMgr.moveToFront(this.htmlElement);

        // update the db

        // this is a hack to avoid having to retrieve the kernel object
        // itself, since we don't really need it right now
        this.container_object(vkernel.kernel_id());
        this.update();
    },
    
    contentChanged: function (e) {
        var text = this.body.value;
        if(text != this.content()) {
            this.content(text);
            this.update();
        }
    },

    // Returns whether or not this kernel is currently selected
    isSelected: function () {
        return Element.hasClassName(this.htmlElement,'selected');
    },

    // Rico draggable stuff

    // Select this kernel
    select: function () {
        if( !this.isSelected() ){
            Element.removeClassName(this.htmlElement,'notselected');
            Element.addClassName(this.htmlElement,'selected');
        }
        dndMgr.moveToFront(this.htmlElement);
    },

    // Mark this kernel as not selected
    deselect: function () {
        if( this.isSelected()){
            Element.removeClassName(this.htmlElement,'selected');
            Element.addClassName(this.htmlElement,'notselected');
        }
    },

    startDrag: function() {
        this.notifyStartChangeListeners();

        // change the startx/starty offsets so they're correct when we pop up
        // into the document body
        var parentPos = Utils.toViewportPosition(this.htmlElement.parentNode);
        this.startx -= parentPos.x;
        this.starty -= parentPos.y;

        // make sure the original position is relative to the viewport, not the
        // parent, so it ends up back in the same place if the drag is canceled
        this.origPos = Utils.toViewportPosition(this.htmlElement);

        // convert this element to pixels, so it doesn't change size as we reparent
        this.htmlElement.style.width=this.htmlElement.clientWidth+'px';
        this.htmlElement.style.height=this.htmlElement.clientHeight+'px';

        // pop the element up into the document body, so it can drag anywhere
        this.oldParentNode = this.htmlElement.parentNode;
        this.htmlElement.parentNode.removeChild(this.htmlElement);
        document.body.appendChild(this.htmlElement);
    },
 
    endDrag: function() {
        // TODO need to make sure at the end of the drag, the element ends up back down inside a kernel body
        delete this.oldParentNode;
        this.notifyEndChangeListeners();
        
        this.update();
    },
 
    duringDrag: function() {
        var parentPos = Utils.toViewportPosition(this.oldParentNode);
        this.setX(Number(chopPx(this.htmlElement.style.left))*100
                       / this.oldParentNode.clientWidth);
        this.setY((Number(chopPx(this.htmlElement.style.top))-parentPos.y)*100
                       / this.oldParentNode.clientHeight);
    },
 
    cancelDrag: function() {
        var parentElement = this.oldParentNode;

        var pos = Utils.toViewportPosition(this.htmlElement);
        var parentPos = Utils.toViewportPosition(parentElement);
        var width = this.htmlElement.clientWidth;
        var height = this.htmlElement.clientHeight;

        parentElement.appendChild(this.htmlElement);


        var elementStyle = this.htmlElement.style;
        elementStyle.left = ((pos.x-parentPos.x)*100/parentElement.clientWidth) + '%';
        elementStyle.top = ((pos.y-parentPos.y)*100/parentElement.clientHeight) + '%';
        elementStyle.width = (width*100/parentElement.clientWidth) + '%';
        elementStyle.height = (height*100/parentElement.clientHeight) + '%';

        this.notifyEndChangeListeners();
    }
});