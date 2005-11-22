var i=0;
var VisibleKernel = Class.create();
VisibleKernel.extend(JSDBI);
VisibleKernel.superclass = JSDBI;

VisibleKernel.fields(['container_object',
                      'contained_object',
                      'collapsed',
                      'height',
                      'width',
                      'x',
                      'y']);
VisibleKernel.primaryKeys(['container_object', 'contained_object']);
VisibleKernel.url('/rest/vkernel');
VisibleKernel.elementTag('visiblekernel');
VisibleKernel.has_a('contained_object','Kernel');
VisibleKernel.has_a('container_object','Kernel');

// multiple inheritance from both JSDBI and Draggable
VisibleKernel.prototype = (new JSDBI()).extend(new Draggable()).extend( {
    initialize: function(container_object,contained_object,htmlElement,x,y,width,height,collapsed) {
        this.type        = 'Kernel';
        this.container_object(container_object);
        this.contained_object(contained_object);
        this.__x=x;
        this.__y=y;
        this.__width=width;
        this.__height=height;
        this.__collapsed=collapsed;
        this.htmlElement = htmlElement;

        // listeners that get notified when this visible kernel moves
        this.__moveListeners = [];
        // listeners that get notified when this visible kernel changes size
        this.__sizeListeners = [];
        // listeners that get notified when this visible kernel starts moving or changing size (start of the drag)
        this.__startChangeListeners = [];
        // listeners that get notified when this visible kernel stops moving or changing size (end of the drag)
        this.__endChangeListeners = [];

        if(this.htmlElement){
            this.setup();
        }
    },

    setup: function () {
        this.fetchElements();
        this.registerHandlers();
//        this.hydrateChildren();

        // add this object as a property of the htmlElement, so we can get back
        // to it if all we have is the element
        this.htmlElement.kernel = this;
    },

    // returns the id in the form '1/2'
    idString: function() {
        var id = this.id().join('/');
        return id;
    },

    // creates the actual html for this kernel
    // XXX this is a bunch of garbage - need to unify this html with the stuff in root/Kernel/kernel.tt
    realize: function(parent) {
        this.htmlElement = document.createElement('div');
        this.htmlElement.id="vkernel"+this.idString();
        this.htmlElement.className="vkernel collapsed";
        var expandButtonLabel = this.collapsed() ? '+' : '-';
        this.htmlElement.innerHTML+=
           "<div class=\"leftgrippie\"></div>"
           +"<input type=button value='"+expandButtonLabel+"' class='expandbutton'/>"
           +"<input type=button value='X' class='removebutton'/>"
           +"<input type=button value='R' class='relationshipbutton'/>"
           +"<input value=\"\" type=\"text\" class=\"namefield\"/>"
           +"<div class=\"rightgrippie\"/></div>"
           +"<div class=\"body\">"
           +"</div>"
           +"<div class=\"corner\">"
           +"</div>";
        parent.appendChild(this.htmlElement);
        this.setup();
        this.x(this.x());
        this.y(this.y());
        this.setWidth(this.width());
        this.setHeight(this.height());
        if(this.kernel().name() === undefined){
            this.namefield.value = '';
        } else {
            this.namefield.value = this.kernel().name();
        }
        this.layout();
    },

    hydrateChildren: function() {
        var children = this.kernel().children();
//        alert("hydrate children called.  Found "+children.length+" children");
        for(var i=0; i<children.length; i++){
            var child = children[i];
//            alert("hydrating "+child.kernel().name());
            child.realize(this.body);
        }
    },

    kernel: function() {
        return this.contained_object();
    },

    fetchElements: function () {
        this.namefield = Utils.getElementsByClassName(this.htmlElement, 'namefield')[0];
        this.body = Utils.getElementsByClassName(this.htmlElement, 'body')[0];
        this.corner = Utils.getElementsByClassName(this.htmlElement, 'corner')[0];
        this.relationshipbutton = Utils.getElementsByClassName(this.htmlElement, 'relationshipbutton')[0];
        this.expandbutton = Utils.getElementsByClassName(this.htmlElement, 'expandbutton')[0];
        this.removebutton = Utils.getElementsByClassName(this.htmlElement, 'removebutton')[0];
    },

    // prevents the default browser action for this event from occuring
    preventDefault: function(e) {
        if ( e.preventDefault != undefined )
           e.preventDefault();
        else
           e.returnValue = false;
    },

    registerHandlers: function() {
        // set up the dnd
        dndMgr.registerDraggable( this );
        dndMgr.registerDraggable( new KernelCornerDraggable(this.corner, this) );
        dndMgr.registerDropZone( new CustomDropzone(this.body,this) );

        // setup the namefield actions
        Utils.registerEventListener(this.namefield,'blur', this.updateName.bindAsEventListener(this));
        Utils.registerEventListener(this.namefield,'keyup', this.layoutNamefield.bind(this));

        // setup the click handlers
        Utils.registerEventListener(this.body,'dblclick', this.addNewKernel.bindAsEventListener(this));
        Utils.registerEventListener(this.htmlElement,'dblclick', this.makeView.bindAsEventListener(this));
        
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
        // drag in namefield should select text, not drag object
        Utils.registerEventListener(this.namefield,
                                   'mousedown',
                                   Utils.terminateEvent.bindAsEventListener(this));
        // double click in namefield should select text, not create kernel
        Utils.registerEventListener(this.namefield,
                                   'dblclick',
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

    // make this kernel into the current view (ie, switch the url to this kernel)
    makeView: function(e){
        window.location = '/kernel/view/'+this.kernel().id();
        Utils.terminateEvent(e);
    },

    startCreateRelationship: function(e){
        newRelationship.startDrag(e,this);
    },

    clearSelectionAndTerminate: function(e){
        dndMgr.clearSelection();
        Utils.terminateEvent(e);
        this.preventDefault(e);
    },

    // XXX should use this for adding to the view as well
    addNewKernel: function (e){
        // get the mouse event coordinates
        var posx = 0;
        var posy = 0;
        if (!e) var e = window.event;
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        }
        else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft;
            posy = e.clientY + document.body.scrollTop;
        }

        var parentPos = Utils.toViewportPosition(this.body);

        var x = (posx-parentPos.x)*100/this.body.clientWidth;
        var y = (posy-parentPos.y)*100/this.body.clientHeight;
        var dummyDiv = document.createElement('div');
        dummyDiv.className='dummyDiv';
        dummyDiv.style.left=x+'%';
        dummyDiv.style.top=y+'%';
        dummyDiv.style.width='30%';
        dummyDiv.style.height='34px'; //XXX jon hates me
        this.body.appendChild(dummyDiv);

        window.setTimeout(this.createVKernel.bind(this),5,x,y,dummyDiv);
        Utils.terminateEvent(e);
    },

    createVKernel: function(x,y,dummyDiv){
        var vkernel = VisibleKernel.insert({container_object: this.contained_object(),
                                            x: x,
                                            y: y,
                                            width: 30,
                                            height: 30,
                                            collapsed: 1});
        this.body.removeChild(dummyDiv);
        vkernel.realize(this.body);
        dndMgr.updateSelection(vkernel,false);
        vkernel.namefield.focus();
    },

    // removes the html element from the view, and then notifies the server
    destroy: function () {
        this.htmlElement.parentNode.removeChild(this.htmlElement);
        return VisibleKernel.superclass.prototype.destroy.call(this);
    },

    // performs internal visual layout of the html elements for this kernel
    layout: function(){
        this.layoutResize();
//        this.layoutCorner();
        this.layoutNamefield();
    },

    // causes the namefield to relayout
    layoutNamefield: function() {
        this.namefield.style.width = this.getNameFieldWidth()+'px';

        // scroll the text field all the way to the left again - apparently
        // setting the value of a text input field again causes it to properly
        // scroll all the way to the left
        this.namefield.value = this.namefield.value;
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

    // returns the desired width of the name field.  Usually the width of the text in the field, but bounded by the minimum width
    getNameFieldWidth: function(){
        // TODO make 20 into a constant - min namefield width
        return Math.max(this.getTextWidth(this.namefield.value,this.getStyle(this.namefield,'font-size'))*1.15+10,20);
    },

    getTextWidth: function(text,size){
        if(VisibleKernel.textSizingBox === undefined){
            VisibleKernel.textSizingBox = document.createElement('span');
            VisibleKernel.textSizingBox.innerHTML = 'a';
            // put it way off the left side of the page so it's not visible
            var body = document.getElementsByTagName('body')[0];
            body.appendChild(VisibleKernel.textSizingBox);
            VisibleKernel.textSizingBox.style.position = 'absolute';
            VisibleKernel.textSizingBox.style.left = '-500px';
        }
        VisibleKernel.textSizingBox.style.fontSize = size;
        VisibleKernel.textSizingBox.firstChild.data = text;
        return VisibleKernel.textSizingBox.offsetWidth;
    },

    toggleCollapsed: function() {
        if(this.expandbutton.value == '-'){
            this.expandbutton.value = '+';
        } else {
            this.expandbutton.value = '-';
        }
        if(this.collapsed()){
            this.collapsed(0);
        } else {
            this.collapsed(1);
        }
        this.update();
    },

    // Just sets the internal collapsed value
    setCollapsed: function(collapsed) {
        return VisibleKernel.superclass.prototype.collapsed.call(this, collapsed);
    },

    collapsed: function(collapsed) {
        if(collapsed == undefined) {
            // skip it
            var results = VisibleKernel.superclass.prototype.collapsed.call(this);
            return results;
        } if(collapsed){
            var results = VisibleKernel.superclass.prototype.collapsed.call(this, 1);
            if(this.htmlElement){
                this.htmlElement.className += ' collapsed';
//                this.setHeight(this.getMinHeight());
            }
            this.notifyEndChangeListeners();
            return results;
        } else {
            // XXX why doesn't calling the accessor work?
//            return VisibleKernel.superclass.prototype.collapsed.call(this, false);
            this.__collapsed=0;
            if(this.htmlElement){
                this.htmlElement.className = this.htmlElement.className.replace(/ collapsed|collapsed /, '');
//                this.setHeight(this.getMinHeight());
            }
            this.notifyEndChangeListeners();
            return 0;
        }
    },

    getStyle: function(el,styleProp) {
	if (el.currentStyle){
		var y = el.currentStyle[styleProp];
	}else if (window.getComputedStyle){
		var y = document.defaultView.getComputedStyle(el,null).getPropertyValue(styleProp);
        }
	return y;
    },
    // Just sets the internal x coordinate
    setX: function(x) {
        this.notifyMoveListeners(x,this.y());
        return VisibleKernel.superclass.prototype.x.call(this, x);
    },

    // Sets the x coordinate as a percentage of the parent object's width and moves the object accordingly
    x: function(x) {
        if(x && this.htmlElement){
            this.htmlElement.style.left = x+"%";
            this.notifyMoveListeners(x,this.y());
        }
        return VisibleKernel.superclass.prototype.x.call(this, x);
    },

    // Just sets the internal y coordinate
    setY: function(y) {
        this.notifyMoveListeners(this.x(),y);
        return VisibleKernel.superclass.prototype.y.call(this, y);
    },

    // Sets the y coordinate as a percentage of the parent object's height and moves the object accordingly
    y: function(y) {
        if(y && this.htmlElement){
            this.htmlElement.style.top = y+"%";
            this.notifyMoveListeners(this.x(),y);
        }
        return VisibleKernel.superclass.prototype.y.call(this, y);
    },

    // Sets the width as a percentage of the parent object's width and moves the object accordingly
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
        var results = VisibleKernel.superclass.prototype.width.call(this, width);
        if(width != undefined){
            this.notifySizeListeners(width,this.height());
        }
        return results;
    },

    // Sets the height as a percentage of the parent object's width and moves the object accordingly
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

    // Just sets the internal height
    height: function(height) {
        var results = VisibleKernel.superclass.prototype.height.call(this, height);
        if(height != undefined){
            this.notifySizeListeners(this.width(),height);
        }
        return results;
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
            return 0; // height of name field
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

    notifyStartChangeListeners: function (width, height){
        for(var i=0;i<this.__startChangeListeners.length;i++){
            this.__startChangeListeners[i](this);
        }
    },

    notifyEndChangeListeners: function (width, height){
        for(var i=0;i<this.__endChangeListeners.length;i++){
            this.__endChangeListeners[i](this);
        }
    },

    updateName: function (e) {
        var targ;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug
            targ = targ.parentNode;

        // XXX jsdbi relationships are working yet, so we don't have a kernel :(
        this.contained_object().name(targ.value);
        this.contained_object().update();
    },


    reparent: function(vkernel) {
        var parentElement = vkernel.body;

        // Can't make element child of it's own child and don't reparent it if
        // it's already in the right element
        if(!Utils.hasAncestor(parentElement,this.htmlElement)
          && this.htmlElement.parentNode != parentElement){
            // figure out the new x and y percentages
            var pos = Utils.toViewportPosition(this.htmlElement);
            var parentPos = Utils.toViewportPosition(parentElement);

            var width = this.htmlElement.clientWidth;
            var height = this.htmlElement.clientHeight;
            this.htmlElement.parentNode.removeChild(this.htmlElement);

            this.x((pos.x-parentPos.x)*100/parentElement.clientWidth);
            this.y((pos.y-parentPos.y)*100/parentElement.clientHeight);
            this.setWidth(width*100/parentElement.clientWidth);
            this.setHeight(height*100/parentElement.clientHeight);

            parentElement.appendChild(this.htmlElement);

            // update the db
            this.container_object(vkernel.kernel());
            this.update();
        }
    },

    // Returns whether or not this kernel is currently selected
    isSelected: function () {
        return this.htmlElement.className.indexOf('selected') != -1;
    },

    // Mark this kernel as not selected
    deselect: function () {
        if( this.isSelected()){
            this.htmlElement.className = this.htmlElement.className.replace(/ selected/, '');
        }
    },

    // Rico draggable stuff

    // Select this kernel
    select: function () {
        if( !this.isSelected() ){
            this.htmlElement.className += ' selected';
        }
    },

    startDrag: function() {
        this.notifyStartChangeListeners();

        // change the startx/starty offsets so they're correct when we pop up
        // into the document body
        var parentPos = Utils.toViewportPosition(this.htmlElement.parentNode);
        this.startx -= parentPos.x;
        this.starty -= parentPos.y;

        // convert this element to pixels, so it doesn't change size as we reparent
        this.htmlElement.style.width=this.htmlElement.clientWidth+'px';
        this.htmlElement.style.height=this.htmlElement.clientHeight+'px';

        // pop the element up into the document body, so it can drag anywhere
        this.htmlElement.parentNode.removeChild(this.htmlElement);
        document.body.appendChild(this.htmlElement);
    },
 
    endDrag: function() {
        // TODO need to make sure at the end of the drag, the element ends up back down inside a kernel body
        this.notifyEndChangeListeners();
        this.x(Number(chopPx(this.htmlElement.style.left))*100
                       / this.htmlElement.parentNode.clientWidth);
        this.y(Number(chopPx(this.htmlElement.style.top))*100
                       / this.htmlElement.parentNode.clientHeight);
        this.update();
    },
 
    duringDrag: function() {
//        this.setX(Number(chopPx(this.htmlElement.style.left))*100
//                          / this.htmlElement.parentNode.clientWidth);
//        this.setY(Number(chopPx(this.htmlElement.style.top))*100
//                          / this.htmlElement.parentNode.clientHeight);
    },
 
    cancelDrag: function() {
        this.notifyEndChangeListeners();
    },


 
});

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
//       this.sizeFromCorner();
       this.vkernel.notifyEndChangeListeners();
    },

    endDrag: function() {
//       this.sizeFromCorner();
       this.vkernel.notifyEndChangeListeners();
       this.vkernel.layoutCorner();
       this.vkernel.update();
    },
 
    duringDrag: function() {
        this.sizeFromCorner();
    },

    sizeFromCorner: function(){
        var cornerWidth = this.htmlElement.clientWidth;
        var cornerHeight = this.htmlElement.clientHeight;
        var w = Number(chopPx(this.htmlElement.style.left)) + cornerWidth;
        var h = Number(chopPx(this.htmlElement.style.top)) + cornerHeight;
        if(!this.vkernel.collapsed()){
            this.vkernel.setHeight(h*100/this.vkernel.htmlElement.parentNode.clientHeight);
        }
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
           if(draggableObjects[i].type != 'Kernel'){
               continue;
           }
           draggableObjects[i].reparent(this.vkernel);
       }
   },

   showHover: function() {
   },

   hideHover: function() {
   },

   activate: function() {
   },

   deactivate: function() {
   }
});

function chopPx (str) {
    return str.replace(/[a-z]+/i, '');
}
