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
        // XXX could possibly remove this next line
        this.kernel = kernel;
        if(this.htmlElement){
            this.namefield = document.getElementById('namefield'+this.idString());
            this.registerHandlers();
        }
    },

    idString: function() {
        return this.id().join('/');
    },

    // creates the actual html for this kernel
    realize: function(parent) {
        this.htmlElement = document.createElement('div');
        this.htmlElement.id="vkernel"+this.idString();
        this.htmlElement.className="vkernel";
        this.htmlElement.innerHTML+=
           "<div class=\"leftgrippie\"></div>"
           +"<input value=\"here\" type=\"text\" id=\"namefield"+this.idString()+"\" class=\"namefield\"/>"
           +"<div class=\"rightgrippie\"/></div>"
           +"<div class=\"body\">"
           +"</div>"
           +"<div class=\"corner\" id='vkcorner"+this.idString()+"'>"
           +"</div>";
//        this.namefield.value = this.kernel.name;
        this.x(this.x());
        this.y(this.y());
        parent.appendChild(this.htmlElement);
        this.namefield = document.getElementById('namefield'+this.idString());
        this.namefield.value = '';
        this.registerHandlers();
        this.layout();
    },

    onMouseDownTextFieldListener: function(e) {
        dndMgr._terminateEvent(e);
    },

    resizeHandler: function(){
    },

    registerHandlers: function() {
        dndMgr.registerDraggable( new KernelDraggable('vkernel'+this.idString(), this) );
        dndMgr.registerDraggable( new KernelCornerDraggable('vkcorner'+this.idString(), this) );
        this.registerEventListener(this.namefield,'mousedown', this.onMouseDownTextFieldListener.bindAsEventListener(this));
        this.registerEventListener(this.namefield,'blur', this.updateName.bindAsEventListener(this));
        this.registerEventListener(this.namefield,'keyup', this.layout.bind(this));
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

    x: function(x) {
        if(x && this.htmlElement){
            this.htmlElement.style.left = x+"px";
        }
        return VisibleKernel.superclass.prototype.x.call(this, x);
    },

    y: function(y) {
        if(y && this.htmlElement){
            this.htmlElement.style.top = y+"px";
        }
        return VisibleKernel.superclass.prototype.y.call(this, y);
    },

    // performs internal visual layout of the html elements for this kernel
    layout: function(){
        var body = (this.htmlElement.getElementsByClassName('body'))[0];
        window.status="height: "+this.height();
        body.style.height = (this.height() - 34)+'px';

        var corner = (this.htmlElement.getElementsByClassName('corner'))[0];
        corner.style.left = (this.width() - corner.clientWidth)+'px';
        corner.style.top = (this.height() - corner.clientHeight)+'px';

        // XXX move this out to another method to improve resize performance
        this.namefield.style.width = this.getNameFieldWidth()+'px';

        // scroll the text field all the way to the left again - apparently
        // setting the value of a text input field again causes it to properly
        // scroll all the way to the left
        this.namefield.value = this.namefield.value;
    },

    // returns the desired width of the name field.  Usually the width of the text in the field, but bounded by the minimum width
    getNameFieldWidth: function(){
        // TODO make 20 into a constant - min namefield width
        // XXX this gets called before the key press actually affects the value
        // of the field
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

    width: function(width) {
        if(width && this.htmlElement){
            this.htmlElement.style.width = width+"px";
        }
        return VisibleKernel.superclass.prototype.width.call(this, width);
    },

    height: function(height) {
        if(height && this.htmlElement){
            this.htmlElement.style.height = height+"px";
        }
        return VisibleKernel.superclass.prototype.height.call(this, height);
    },

    updateName: function (e) {
        var targ;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug
            targ = targ.parentNode;

        this.kernel.name(targ.value);
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

});

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
       this.vkernel.update();
   },

   duringDrag: function() {
       this.vkernel.x(Number(chopPx(this.htmlElement.style.left)));
       this.vkernel.y(Number(chopPx(this.htmlElement.style.top)));
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
