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

VisibleKernel.prototype = (new JSDBI()).extend( {
    initialize: function(container_object,contained_object,htmlElement,kernel) {
        this.container_object(container_object);
        this.contained_object(contained_object);
        this.htmlElement = htmlElement;
        this.kernel = kernel;
        // listeners that get notified when this visible kernel moves
        this.__moveListeners = new Array();
        // listeners that get notified when this visible kernel changes size
        this.__sizeListeners = new Array();
        if(this.htmlElement){
            this.setup();
        }
    },

    setup: function () {
        this.fetchElements();
        this.registerHandlers();
        // XXX debug
        this.addMoveListener(function(kernel,x,y){
            window.status = "got move: "+x+"x"+y;
        });
        this.addSizeListener(function(kernel,w,h){
            window.status = "got resize: "+w+"x"+h;
        });
    },

    idString: function() {
        var id = this.id().join('/');
        return id;
    },

    // creates the actual html for this kernel
    // XXX this is a bunch of garbage - need to unify this html with the stuff in root/Kernel/kernel.tt
    realize: function(parent) {
        this.htmlElement = document.createElement('div');
        this.htmlElement.id="vkernel"+this.idString();
        this.htmlElement.className="vkernel";
        this.htmlElement.innerHTML+=
           "<div class=\"leftgrippie\"></div>"
           +"<input type=button value='-' class='expandbutton'/>"
           +"<input type=button value='X' class='removebutton'/>"
           +"<input type=button value='R' class='relationshipbutton'/>"
           +"<input value=\"here\" type=\"text\" id=\"namefield"+this.idString()+"\" class=\"namefield\"/>"
           +"<div class=\"rightgrippie\"/></div>"
           +"<div class=\"body\" id=\"body"+this.idString()+"\">"
           +"</div>"
           +"<div class=\"corner\" id='vkcorner"+this.idString()+"'>"
           +"</div>";
//        this.namefield.value = this.kernel.name;
        this.x(this.x());
        this.y(this.y());
        parent.appendChild(this.htmlElement);
        this.setup();
        this.namefield.value = '';
        this.layout();
    },

    fetchElements: function () {
        this.namefield = document.getElementById('namefield'+this.idString());
        this.body = document.getElementById('body'+this.idString());
        this.corner = document.getElementById('vkcorner'+this.idString());
        this.relationshipbutton = (this.htmlElement.getElementsByClassName('relationshipbutton'))[0];
        this.expandbutton = (this.htmlElement.getElementsByClassName('expandbutton'))[0];
        this.removebutton = (this.htmlElement.getElementsByClassName('removebutton'))[0];
    },

    // Kills the event so it doesn't propogate up the component hierarchy
    terminateEvent: function(e) {
        dndMgr._terminateEvent(e);
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
        dndMgr.registerDraggable( new KernelDraggable('vkernel'+this.idString(), this) );
        dndMgr.registerDraggable( new KernelCornerDraggable('vkcorner'+this.idString(), this) );
        dndMgr.registerDropZone( new CustomDropzone('body'+this.idString(),this) );

        // setup the namefield actions
        this.registerEventListener(this.namefield,'blur', this.updateName.bindAsEventListener(this));
        this.registerEventListener(this.namefield,'keyup', this.layoutNamefield.bind(this));
        this.registerEventListener(this.namefield,
                                   'mousedown',
                                   this.mouseDownHandler.bindAsEventListener(this));

        // setup the click handlers
        this.registerEventListener(this.htmlElement,
                                   'mousedown',
                                   this.mouseDownHandler.bindAsEventListener(this));
        this.registerEventListener(this.body,'dblclick', this.addNewKernel.bindAsEventListener(this));
        
        // setup the relationship button
        this.registerEventListener(this.relationshipbutton,
                                   'mousedown',
                                   this.startCreateRelationship.bindAsEventListener(this));

        // setup the remove button
        this.registerEventListener(this.removebutton,
                                   'click',
                                   this.destroy.bind(this));

        // Setup action terminators
        this.registerEventListener(this.body,
                                   'mousedown',
                                   this.clearSelectionAndTerminate.bindAsEventListener(this));
        // drag in namefield should select text, not drag object
        this.registerEventListener(this.namefield,
                                   'mousedown',
                                   this.terminateEvent.bindAsEventListener(this));
        // double click in namefield should select text, not create kernel
        this.registerEventListener(this.namefield,
                                   'dblclick',
                                   this.clearSelectionAndTerminate.bindAsEventListener(this));
        // dragging on any of the buttons shouldn't drag the object
        this.registerEventListener(this.relationshipbutton,
                                   'mousedown',
                                   this.terminateEvent.bindAsEventListener(this));
        this.registerEventListener(this.expandbutton,
                                   'mousedown',
                                   this.terminateEvent.bindAsEventListener(this));
        this.registerEventListener(this.removebutton,
                                   'mousedown',
                                   this.terminateEvent.bindAsEventListener(this));
    },

    startCreateRelationship: function(e){
        newRelationship.startDrag(e,this);
    },

    clearSelectionAndTerminate: function(e){
        SelectionManager.clearSelection();
        this.terminateEvent(e);
        this.preventDefault(e);
    },

    // event should be of the form 'mousedown' not 'onmousedown'.
    registerEventListener: function(element,event,eventListener){
        if ( typeof document.implementation != "undefined" &&
             document.implementation.hasFeature("HTML",   "1.0") &&
             document.implementation.hasFeature("Events", "2.0") &&
             document.implementation.hasFeature("CSS",    "2.0") ) {
            element.addEventListener(event, eventListener, false);
        } else {
            element.attachEvent("on"+event, eventListener);
        }
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

        var parentPos = RicoUtil.toViewportPosition(this.body);

        var x = posx-parentPos.x;
        var y = posy-parentPos.y;
        var vkernel = VisibleKernel.insert({container_object: this.contained_object(),
                                            x: x,
                                            y: y,
                                            width: 100,
                                            height: 100,
                                            collapsed: 1});
        vkernel.realize(this.body);
        vkernel.select();
        vkernel.namefield.focus();
        this.terminateEvent(e);
    },

    // removes the html element from the view, and then notifies the server
    destroy: function () {
        this.htmlElement.parentNode.removeChild(this.htmlElement);
        return VisibleKernel.superclass.prototype.destroy.call(this);
    },

    mouseDownHandler: function(e) {
        SelectionManager.clearSelection();
        this.select();
//        dndMgr._terminateEvent(e);
    },

    // performs internal visual layout of the html elements for this kernel
    layout: function(){
        this.layoutResize();
        this.layoutCorner();
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
        this.corner.style.left = (this.width() - this.corner.clientWidth)+'px';
        this.corner.style.top = (this.height() - this.corner.clientHeight)+'px';
    },

    // causes the internal elements to resize if necessary
    layoutResize: function() {
        var body = (this.htmlElement.getElementsByClassName('body'))[0];
        body.style.height = (this.height() - 34)+'px';
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

    // Sets the x coordinate and moves the object accordingly
    x: function(x) {
        if(x && this.htmlElement){
            this.htmlElement.style.left = x+"px";
            this.notifyMoveListeners(x,this.y());
        }
        return VisibleKernel.superclass.prototype.x.call(this, x);
    },

    // Just sets the internal y coordinate
    setY: function(y) {
        this.notifyMoveListeners(this.x(),y);
        return VisibleKernel.superclass.prototype.y.call(this, y);
    },

    // Sets the y coordinate and moves the object accordingly
    y: function(y) {
        if(y && this.htmlElement){
            this.htmlElement.style.top = y+"px";
            this.notifyMoveListeners(this.x(),y);
        }
        return VisibleKernel.superclass.prototype.y.call(this, y);
    },

    // Just sets the internal width
    setWidth: function(width) {
        this.notifySizeListeners(width,this.height());
        return VisibleKernel.superclass.prototype.width.call(this, width);
    },

    // Sets the width and moves the object accordingly
    width: function(width) {
        if(width && this.htmlElement){
            this.htmlElement.style.width = width+"px";
            this.notifySizeListeners(width,this.height());
        }
        return VisibleKernel.superclass.prototype.width.call(this, width);
    },

    // Just sets the internal height
    setHeight: function(height) {
        this.notifySizeListeners(this.width(),height);
        return VisibleKernel.superclass.prototype.height.call(this, height);
    },

    // Sets the width and moves the object accordingly
    height: function(height) {
        if(height && this.htmlElement){
            this.htmlElement.style.height = height+"px";
            this.notifySizeListeners(this.width(),height);
        }
        return VisibleKernel.superclass.prototype.height.call(this, height);
    },

    // Adds a movement listener.  The notify method will called whenever this visible kernel moves, with the parameters this object, newX, and new Y
    addMoveListener: function (notifyMethod){
        this.__moveListeners.push(notifyMethod);
    },

    // Adds a size listener.  The notify method will called whenever this visible kernel is resized, with the parameters this object, new width, and new height
    addSizeListener: function (notifyMethod){
        this.__sizeListeners.push(notifyMethod);
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

    updateName: function (e) {
        var targ;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug
            targ = targ.parentNode;

        // XXX jsdbi relationships are working yet, so we don't have a kernel :(
//        this.kernel.name(targ.value);
    },


//    populate: function(xml){
//        var vkernelElements = xml.getElementsByTagName("visiblekernel");
//
//        var vkernelElement = vkernelElements[0];
//        this.container_id = vkernelElement.getAttribute("container_id");
//        this.x = vkernelElement.getAttribute("x");
//        this.y = vkernelElement.getAttribute("y");
//        this.width = vkernelElement.getAttribute("width");
//        this.height = vkernelElement.getAttribute("height");
//        this.collapsed = vkernelElement.getAttribute("collapsed");
//
//        // create the associated kernel if necessary
//        var kernelXML = (xml.getElementsByTagName("kernel"))[0];
//        if(!this.kernel){
//            this.kernel = new Kernel();
//
//            // pass on the population opportunity to the kernel
//            this.kernel.populate(kernelXML);
//        }
//        this.id = this.container_id+'/'+this.kernel.id;
//    },

    // Returns whether or not this kernel is currently selected
    isSelected: function () {
        return this.htmlElement.className.indexOf('selected') != -1;
    },

    // Select this kernel
    select: function () {
        if( !this.isSelected() ){
            this.htmlElement.className += ' selected';
        }
    },

    // Mark this kernel as not selected
    deselect: function () {
        if( this.isSelected()){
            this.htmlElement.className = this.htmlElement.className.replace(/ selected|selected /, '');
        }
    },

    reparent: function(vkernel) {
        var parentElement = vkernel.body;

        // Can't make element child of it's own child and don't reparent it if it's already in the right element
        if(!parentElement.hasAncestor(this.htmlElement)
          && this.htmlElement.parentNode != parentElement){
            // figure out the new x and y
            var pos = RicoUtil.toViewportPosition(this.htmlElement);
            var parentPos = RicoUtil.toViewportPosition(parentElement);
            var newX = pos.x-parentPos.x;
            var newY = pos.y-parentPos.y;

            this.htmlElement.parentNode.removeChild(this.htmlElement);

            this.y(pos.y-parentPos.y);
            this.x(pos.x-parentPos.x);

            parentElement.appendChild(this.htmlElement);
        }
    }
});

var KernelDraggable = Class.create();
KernelDraggable.prototype = (new Rico.Draggable()).extend( {

   initialize: function( htmlElement, vkernel ) {
      this.type        = 'Kernel';
      this.htmlElement = $(htmlElement);
      this.vkernel        = vkernel;
   },

   startDrag: function() {
   },

   endDrag: function() {
       this.vkernel.update();
   },

   duringDrag: function() {
       this.vkernel.setX(Number(chopPx(this.htmlElement.style.left)));
       this.vkernel.setY(Number(chopPx(this.htmlElement.style.top)));
   },

   cancelDrag: function() {
   },

   select: function() {
   }

} );

var i =0;

var KernelCornerDraggable = Class.create();
KernelCornerDraggable.prototype = (new Rico.Draggable()).extend( {
    initialize: function( htmlElement, vkernel ) {
        this.type        = 'KernelCorner';
        this.htmlElement = $(htmlElement);
        this.vkernel        = vkernel;
    },
 
    startDrag: function() {
    },
 
    endDrag: function() {
         this.vkernel.update();
    },
 
    duringDrag: function() {
        var cornerWidth = this.htmlElement.clientWidth;
        var cornerHeight = this.htmlElement.clientHeight;
        var w = Number(chopPx(this.htmlElement.style.left)) + cornerWidth;
        var h = Number(chopPx(this.htmlElement.style.top)) + cornerHeight;

        // set limits on size
        var minWidth=100;
        var minHeight=100;
        if(w < minWidth){
            this.htmlElement.style.left=(minWidth-cornerWidth)+'px';
            this.vkernel.width(minWidth);
        } else {
            this.vkernel.width(w);
        }
        if(h < minHeight){
            this.htmlElement.style.top=(minHeight-cornerHeight)+'px';
            this.vkernel.height(minHeight);
        } else {
          this.vkernel.height(h);
        }
        this.vkernel.layoutResize();
    },
 
    cancelDrag: function() {
    },
 
    select: function() {
    }
 
} );

var CustomDropzone = Class.create();

CustomDropzone.prototype = (new Rico.Dropzone()).extend( {

   initialize: function( htmlElement, vkernel ) {
        this.type        = 'Kernel';
        this.htmlElement = $(htmlElement);
        this.vkernel        = vkernel;
   },

   accept: function(draggableObjects) {
       for(var i=0;i<draggableObjects.length;i++){
           if(draggableObjects[i].type != 'Kernel'){
               continue;
           }
           draggableObjects[i].vkernel.reparent(this.vkernel);
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

var SelectionManager = Class.create();
SelectionManager.clearSelection = function() {
    var elements = document.getElementsByClassName('selected');
    for(var i=0;i<elements.length;i++){
        var element = elements[i];
        element.className = element.className.replace(/ selected|selected /, '');
    }
    document.getElementById('mysearchfield').focus();
};
