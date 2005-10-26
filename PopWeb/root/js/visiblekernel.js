var VisibleKernel = Class.create();

VisibleKernel.prototype = {

    initialize: function(container_id,contained_id,htmlElement,kernel) {
        this.container_id = container_id;
        this.id = container_id+'/'+contained_id;
        this.htmlElement = htmlElement;
        this.kernel = kernel;
        if(this.htmlElement){
            this.namefield = document.getElementById('namefield'+this.id);
            this.registerHandlers();
        }
    },

    // creates the actual html for this kernel
    realize: function(parent) {
        this.htmlElement = document.createElement('div');
        parent.appendChild(this.htmlElement);
        this.htmlElement.id="vkernel"+this.id;
        this.htmlElement.className="vkernel";
        this.htmlElement.innerHTML+=
           "<div class=\"leftgrippie\"></div>"
           +"<input value=\"here\" type=\"text\" id=\"namefield"+this.id+"\" class=\"namefield\"/>"
           +"<div class=\"rightgrippie\"/></div>"
           +"<div class=\"body\">"
           +"</div>"
           +"<div class=\"corner\" id='vkcorner"+this.id+"'>"
           +"</div>";
        this.namefield = document.getElementById('namefield'+this.id);
        this.namefield.value = this.kernel.name;
        this.setX(this.x);
        this.setY(this.y);
        this.registerHandlers();
        this.layout();
    },

    onMouseDownTextFieldListener: function(e) {
        dndMgr._terminateEvent(e);
    },

    resizeHandler: function(){
    },

    registerHandlers: function() {
        dndMgr.registerDraggable( new KernelDraggable('vkernel'+this.id, this) );
        dndMgr.registerDraggable( new KernelCornerDraggable('vkcorner'+this.id, this) );
        this.registerEventListener(this.namefield,'mousedown', this.onMouseDownTextFieldListener.bindAsEventListener(this));
        this.registerEventListener(this.namefield,'blur', this.updateName.bindAsEventListener(this));
        this.registerEventListener(this.namefield,'keypress', this.layout.bind(this));
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

    setX: function(x) {
        this.x=x;
        this.htmlElement.style.left = x+"px";
    },

    setY: function(y) {
        this.y=y;
        this.htmlElement.style.top = y+"px";
    },

    // performs internal visual layout of the html elements for this kernel
    layout: function(){
        var body = (this.htmlElement.getElementsByClassName('body'))[0];
        body.style.height = (this.height - 32)+'px';

        var corner = (this.htmlElement.getElementsByClassName('corner'))[0];
        corner.style.left = (this.width - corner.clientWidth)+'px';
        corner.style.top = (this.height - corner.clientHeight)+'px';

        // XXX move this out to another method to improve resize performance
        this.namefield.style.width = this.getNameFieldWidth()+'px';
    },

    // returns the desired width of the name field.  Usually the width of the text in the field, but bounded by the minimum width
    getNameFieldWidth: function(){
        // TODO make 20 into a constant - min namefield width
        return Math.max(this.getTextWidth(this.namefield.value,this.getStyle(this.namefield,'font-size'))+15,20);
    },

    getTextWidth: function(text,size){
        if(VisibleKernel.textSizingBox === undefined){
            VisibleKernel.textSizingBox = document.createElement('span');
            VisibleKernel.textSizingBox.innerHTML = 'a';
            // put it way off the left side of the page so it's not visible
            var body = document.getElementsByTagName('body')[0];
            body.appendChild(VisibleKernel.textSizingBox);
            VisibleKernel.textSizingBox.style.position = 'absolute';
//            VisibleKernel.textSizingBox.style.left = '-500px';
        }
        VisibleKernel.textSizingBox.style.fontSize = size;
        window.status = "fontSize: "+ size;
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

    setWidth: function(width) {
        this.width=width;
        this.htmlElement.style.width = width+"px";
    },

    setHeight: function(height) {
        this.height=height;
        this.htmlElement.style.height = height+"px";
    },

    setCollapsed: function(collapsed) {
        this.collapsed=collapsed;
    },

    updateName: function (e) {
        var targ;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug
            targ = targ.parentNode;

        this.kernel.setName(targ.value);
    },


    populate: function(xml){
        var vkernelElements = xml.getElementsByTagName("visiblekernel");

        var vkernelElement = vkernelElements[0];
        this.container_id = vkernelElement.getAttribute("container_id");
        this.x = vkernelElement.getAttribute("x");
        this.y = vkernelElement.getAttribute("y");
        this.width = vkernelElement.getAttribute("width");
        this.height = vkernelElement.getAttribute("height");
        this.collapsed = vkernelElement.getAttribute("collapsed");

        // create the associated kernel if necessary
        var kernelXML = (xml.getElementsByTagName("kernel"))[0];
        if(!this.kernel){
            this.kernel = new Kernel();

            // pass on the population opportunity to the kernel
            this.kernel.populate(kernelXML);
        }
        this.id = this.container_id+'/'+this.kernel.id;
    },

    sync: function(xml){
       var x = this.htmlElement.style.left;
       var y = this.htmlElement.style.top;
       new Ajax.Request('/rest/vkernel/update/',{ asynchronous: true, parameters: 'container_object='+this.container_id+'&contained_object='+this.kernel.id+'&x='+x+'&y='+y+'&width='+this.width+'&height='+this.height+'&collapsed='+this.collapsed });
    }
}

// class method
// Blocking retrieval of an existing visiblekernel
VisibleKernel.retrieve = function (container_id, contained_id) {
    var vkernel = new VisibleKernel(container_id, contained_id);
    var request = new Ajax.Request('/rest/vkernel/xml/'+container_id+'/'+contained_id,{ asynchronous: false});
    vkernel.populate(request.transport.responseXML);
    return vkernel;
}

// Creates a new visiblekernel, and associated kernel
VisibleKernel.create = function (container_id,x,y,width,height,collapsed) {
    var vkernel = new VisibleKernel();
    var request = new Ajax.Request('/rest/vkernel/add/',{ asynchronous: false, parameters: 'container_object='+container_id+'&x='+x+'&y='+y+'&width='+width+'&height='+height+'&collapsed='+collapsed });
    vkernel.populate(request.transport.responseXML);
    return vkernel;
}


ajaxEngine.registerRequest('updateContainedObject', '/containedobject/do_update');

var KernelDraggable = Class.create();
KernelDraggable.prototype = (new Rico.Draggable()).extend( {

   initialize: function( htmlElement, vkernel ) {
      this.type        = 'Custom';
      this.htmlElement = $(htmlElement);
      this.vkernel        = vkernel;
   },

   startDrag: function() {
   },

   endDrag: function() {
       this.vkernel.sync();
   },

   duringDrag: function() {
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
      this.type        = 'Custom';
      this.htmlElement = $(htmlElement);
      this.vkernel        = vkernel;
   },

   startDrag: function() {
   },

   endDrag: function() {
       this.vkernel.sync();
   },

   duringDrag: function() {
       var w = Number(chopPx(this.htmlElement.style.left)) + this.htmlElement.clientWidth;
       var h = Number(chopPx(this.htmlElement.style.top)) + this.htmlElement.clientHeight;
       this.vkernel.setWidth(w);
       this.vkernel.setHeight(h);
       this.vkernel.layout();
   },

   cancelDrag: function() {
   },

   select: function() {
   }

} );

var CustomDropzone = Class.create();

CustomDropzone.prototype = (new Rico.Dropzone()).extend( {

   accept: function(draggableObjects) {
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
