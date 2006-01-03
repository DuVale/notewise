// A visible kernel is a normal kernel on a view that's draggable and renameable.

var VisibleKernel = Class.create();
VisibleKernel.extend(JSDBI);

// multiple inheritance from both JSDBI and Draggable
VisibleKernel.prototype = {};
JSDBI.inherit(VisibleKernel,new JSDBI());
JSDBI.inherit(VisibleKernel,new Draggable());
JSDBI.inherit(VisibleKernel,new KernelObject());

// Setup the JSDBI data access
VisibleKernel.fields(['container_object',
                      'contained_object',
                      'collapsed',
                      'height',
                      'width',
                      'x',
                      'y']);
VisibleKernel.primaryKeys(['container_object', 'contained_object']);
VisibleKernel.url('rest/vkernel');
VisibleKernel.elementTag('visiblekernel');
VisibleKernel.has_a('contained_object','Kernel');
VisibleKernel.has_a('container_object','Kernel');

VisibleKernel.prototype.extend({
    initialize: function(container_object,contained_object,htmlElement,x,y,width,height,collapsed) {
        KernelObject.prototype.initialize.call(this, htmlElement);
    
        this.type        = 'Kernel';
        this.container_object(container_object);
        this.contained_object(contained_object);
        this.__x=x;
        this.__y=y;
        this.__width=width;
        this.__height=height;
        this.__collapsed=collapsed;

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
        KernelObject.prototype.setup.call(this);

        // add this object as a property of the htmlElement, so we can get back
        // to it if all we have is the element
        this.htmlElement.kernel = this;
    },

    // returns the id in the form '1/2' where the first number is the
    // container_id and the second number is the contained_id
    idString: function() {
        var id = this.id().join('/');
        return id;
    },

    // creates the actual html for this kernel
    // XXX this is a bunch of garbage - need to unify this html with the stuff in root/Kernel/kernel.tt.  Maybe think about shipping the html as part of the xml?  Or maybe a seperate ajax call?
    realize: function(parent) {
        this.htmlElement = document.createElement('div');
        this.htmlElement.id="vkernel"+this.idString();
        this.htmlElement.className="vkernel collapsed";
        var expandButtonLabel = this.collapsed() ? '+' : '-';
        var name;
        if(this.kernel().name() === undefined){
            name = '';
        } else {
            name = this.kernel().name();
        }
        var innerHTML =
           "<div class=\"leftgrippie\"></div>"
           +"<input type=button value='"+expandButtonLabel+"' class='expandbutton'/>"
           +"<input type=button value='X' class='removebutton'/>"
           +"<input type=button value='R' class='relationshipbutton'/>"
           +"<input value=\"\" type=\"text\" class=\"namefield\" autocomplete=\"off\" value=\""+name+"\"/>"
           +"<a class=\"namelink\" href=\"/kernel/view/"+this.__getField('contained_object')+"\">"
           +name+"</a>"
           +"<div class=\"rightgrippie\"/></div>"
           +"<div class=\"body\">"
           +"</div>"
           +"<div class=\"corner\">"
           +"</div>";
        this.htmlElement.innerHTML = innerHTML;
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

    // create html elements for the child objects
    hydrateChildren: function() {
        var children = this.kernel().children();
        for(var i=0; i<children.length; i++){
            var child = children[i];
            child.realize(this.body);
        }
    },

    kernel: function() {
        return this.contained_object();
    },

    kernel_id: function() {
        return this.__getField('contained_object');
    },

    // retrieves references to all the relevant html elements and stores them
    // as properties in this object
    fetchElements: function () {
        KernelObject.prototype.fetchElements.call(this);
        this.body = Utils.getElementsByClassName(this.htmlElement, 'body')[0];
        this.namelink = Utils.getElementsByClassName(this.htmlElement, 'namelink')[0];
        this.body = Utils.getElementsByClassName(this.htmlElement, 'body')[0];
        this.corner = Utils.getElementsByClassName(this.htmlElement, 'corner')[0];
        this.relationshipbutton = Utils.getElementsByClassName(this.htmlElement, 'relationshipbutton')[0];
        this.expandbutton = Utils.getElementsByClassName(this.htmlElement, 'expandbutton')[0];
        this.removebutton = Utils.getElementsByClassName(this.htmlElement, 'removebutton')[0];
    },

    // setup all the event listeners
    registerHandlers: function() {
        KernelObject.prototype.registerHandlers.call(this);

        // TODO check to see if all these terminate event listeners are necessary

        // set up the dnd
        dndMgr.registerDraggable( this );
        dndMgr.registerDraggable( new KernelCornerDraggable(this.corner, this) );

        // setup the click handlers
        Utils.registerEventListener(this.htmlElement,'dblclick', this.makeView.bindAsEventListener(this));
        Utils.registerEventListener(this.namefield,'click', this.selectAndTerminate.bindAsEventListener(this));
        Utils.registerEventListener(this.namelink,'click', Utils.terminateEvent.bindAsEventListener(this));
        Utils.registerEventListener(this.namelink,'mousedown', Utils.terminateEvent.bindAsEventListener(this));
        
        // setup the relationship button
        Utils.registerEventListener(this.relationshipbutton,
                                   'mousedown',
                                   this.startCreateRelationship.bindAsEventListener(this));

        // setup the remove button
        Utils.registerEventListener(this.removebutton,
                                   'click',
                                   this.destroy.bind(this));

        // setup the collapsed button
        Utils.registerEventListener(this.expandbutton,
                                   'click',
                                   this.toggleCollapsed.bind(this));

        // TODO DRY - consolidate these into a big list of element/event pairs
        // Setup action terminators
        Utils.registerEventListener(this.body,
                                   'mousedown',
                                   this.clearSelectionAndTerminate.bindAsEventListener(this));
        // dragging on any of the buttons shouldn't drag the object
        Utils.registerEventListener(this.relationshipbutton,
                                   'mousedown',
                                   Utils.terminateEvent.bindAsEventListener(this));
        Utils.registerEventListener(this.expandbutton,
                                   'mousedown',
                                   Utils.terminateEvent.bindAsEventListener(this));
        Utils.registerEventListener(this.removebutton,
                                   'mousedown',
                                   Utils.terminateEvent.bindAsEventListener(this));

        // doubleclicking on any of the buttons shouldn't do anything
        Utils.registerEventListener(this.relationshipbutton,
                                   'dblclick',
                                   Utils.terminateEvent.bindAsEventListener(this));
        Utils.registerEventListener(this.expandbutton,
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

    // make this kernel into the current view (ie, switch the url to this kernel)
    makeView: function(e){
        window.location = '/kernel/view/'+this.kernel().id();
        Utils.terminateEvent(e);
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
//        this.layoutCorner();
        this.layoutNamefield();
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
        if(this.body != undefined){
            this.body.style.width = (this.htmlElement.clientWidth - 4) + 'px';
            this.body.style.height = (this.htmlElement.clientHeight - 2 - this.body.offsetTop) + 'px';
        }
        this.resizeChildren();
    },

    // Size the namefield appropriate
    layoutNamefield: function() {
        var width = KernelObject.prototype.layoutNamefield.call(this);
        this.setFixedSize(this.collapsed());
    },

    // Toggles whether the kernel is fixed width or not, and updates the width if it is.
    // Accepts:
    //   fixed - a boolean indicating whether the kernel should be fixed width
    setFixedSize: function(fixed){
//        var oldWidth = this.htmlElement.clientWidth;
//        var oldMinWidth = this.htmlElement.style.minWidth;
        width = (this.getNameFieldWidth()+50);
        if(fixed){
            this.htmlElement.style.width = width+'px';
            this.htmlElement.style.height = '';
        } else {
            this.htmlElement.style.width = this.width() + '%';
            this.htmlElement.style.height = this.height() + '%';
        }

//        if(oldWidth < width
//           || oldMinWidth != (width+'px') ){
            this.layoutResize();
//        }
    },

    // Toggles whether the kernel is collapsed or not
    toggleCollapsed: function() {
        if(this.expandbutton.value == '-'){
            this.expandbutton.value = '+';
        } else {
            this.expandbutton.value = '-';
        }
        if(this.collapsed()){
            this.collapsed(false);
        } else {
            this.collapsed(true);
        }
        this.update();
    },

    // Just sets the internal collapsed value but don't change the display
    setCollapsed: function(collapsed) {
        return this.superclass.collapsed.call(this, collapsed);
    },

    // Set whether the kernel is collapsed
    collapsed: function(collapsed) {
        var results;
        if(collapsed == undefined) {
            // skip it
            results = this.superclass.collapsed.call(this);
            return results;
        } else if(collapsed){
            results = this.superclass.collapsed.call(this, 1);
            if(this.htmlElement){
                Element.addClassName(this.htmlElement,'collapsed');
                this.setFixedSize(true);
            }
            this.notifyEndChangeListeners();
        } else {
            results = this.superclass.collapsed.call(this, 0);
            if(this.htmlElement){
                Element.removeClassName(this.htmlElement,'collapsed');
                this.setFixedSize(false);
            }
            this.notifyEndChangeListeners();
        }
        this.layoutResize();
        return results;
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
    // height should be in percentage
    checkHeight: function(h){
        var minHeight=this.getMinHeight();
        var parentHeight=this.htmlElement.parentNode.clientHeight;
        var heightPixels=(parentHeight * h)/100;
        if(heightPixels < minHeight){
            h = minHeight*100/parentHeight;
        }
        return h;
    },

    // checks to make sure the width is ok, and returns a corrected value if it isn't
    // width should be in percentage
    checkWidth: function(w){
        var minWidth=this.getMinWidth();
        var parentWidth=this.htmlElement.parentNode.clientWidth;
        var widthPixels=(parentWidth * w)/100;
        if(widthPixels < minWidth){
            w = minWidth*100/parentWidth;
        }
        return w;
    },

    getMinHeight: function() {
        return 100;
    },

    getMinWidth: function() {
        var nameFieldWidth =  this.getNameFieldWidth()+50;
        return Math.max(nameFieldWidth,100);
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
        if(!this.collapsed()){
            // don't set the size if we're collapsed, cause it'll wipe
            // out the currently saved size
            this.setHeight(height*100/parentElement.clientHeight);
            this.setWidth(width*100/parentElement.clientWidth);
        }

        // move the object to the frontmost layer
        dndMgr.moveToFront(this.htmlElement);

        // relayout
        this.layoutResize();

        // update the db

        // this is a hack to avoid having to retrieve the kernel object
        // itself, since we don't really need it right now
        this.container_object(vkernel.kernel_id());
        this.update();
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

// This is totally a hack, but it more or less works.  The idea is that we think of the corner image as it's own separate draggable object.  However, the duringDrag event that fires while it is being dragged resizes the associate kernel appropriately. When the drag finishes, the size of the kernel is written out.

var KernelCornerDraggable = Class.create();
KernelCornerDraggable.prototype = (new Draggable()).extend( {
    initialize: function( htmlElement, vkernel ) {
        this.type        = 'KernelCorner';
        this.htmlElement = htmlElement;
        this.vkernel        = vkernel;
    },
 
    startDrag: function() {
       this.vkernel.notifyStartChangeListeners();
    },
 
    cancelDrag: function() {
       this.sizeFromCorner(); // XXX 12/19 just turned this back on - could be an issue
       this.vkernel.notifyEndChangeListeners();
    },

    endDrag: function() {
       this.vkernel.notifyEndChangeListeners();
       this.vkernel.layoutCorner();
       this.vkernel.update();
    },
 
    duringDrag: function() {
        this.sizeFromCorner();
    },

    // size the associated kernel based on the position of the corner
    sizeFromCorner: function(){
        var cornerWidth = this.htmlElement.clientWidth;
        var cornerHeight = this.htmlElement.clientHeight;
        var w = Number(chopPx(this.htmlElement.style.left)) + cornerWidth;
        var h = Number(chopPx(this.htmlElement.style.top)) + cornerHeight;
        //if(!this.vkernel.collapsed()){
        this.vkernel.setHeight(h*100/this.vkernel.htmlElement.parentNode.clientHeight);
        //}
        this.vkernel.setWidth(w*100/this.vkernel.htmlElement.parentNode.clientWidth);
        this.vkernel.layoutResize();
    },
 
    select: function() {
    }
 
} );

var CustomDropzone = Class.create();

CustomDropzone.prototype = (new Dropzone()).extend( {

   initialize: function( htmlElement, vkernel ) {
        this.type        = 'Kernel';
        this.htmlElement = htmlElement;
        this.vkernel        = vkernel;
   },

   accept: function(draggableObjects) {
       for(var i=0;i<draggableObjects.length;i++){
           if(draggableObjects[i].type != 'Kernel' && draggableObjects[i].type != 'Note'){
               continue;
           }
           draggableObjects[i].reparent(this.vkernel);
       }
   },

   // XXX showHover and hideHover are all broken, because rico dnd doesn't understand layers
   showHover: function() {
//        Element.addClassName(this.htmlElement,'activated');
   },

   hideHover: function() {
//        Element.removeClassName(this.htmlElement,'activated');
//       alert("hid hover: "+this.htmlElement.className);
   },

   activate: function() {
   },

   deactivate: function() {
   }
});

// chops any 'px' from the end of the string
function chopPx (str) {
    return str.replace(/[a-z]+/i, '');
}
