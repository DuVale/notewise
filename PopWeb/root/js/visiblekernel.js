var VisibleKernel = Class.create();

VisibleKernel.prototype = {

    initialize: function(container_id,contained_id,htmlElement,kernel) {
        this.container_id = container_id;
        this.contained_id = contained_id;
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
           +"<div class=\"corner\">"
           +"</div>";
        this.namefield = document.getElementById('namefield'+this.id);
        this.namefield.value = this.name;
        this.setX(this.x);
        this.setY(this.y);
        this.registerHandlers();
    },

    onMouseDownTextFieldListener: function(e) {
        dndMgr._terminateEvent(e);
    },

    registerHandlers: function() {
        dndMgr.registerDraggable( new KernelDraggable('vkernel'+this.id, this) );
        if ( typeof document.implementation != "undefined" &&
             document.implementation.hasFeature("HTML",   "1.0") &&
             document.implementation.hasFeature("Events", "2.0") &&
             document.implementation.hasFeature("CSS",    "2.0") ) {
            this.namefield.addEventListener("mousedown", this.onMouseDownTextFieldListener.bindAsEventListener(this), false);
            this.namefield.addEventListener("blur", this.updateName.bindAsEventListener(this), false);
        }
    else {
        this.namefield.attachEvent("onmousedown", this.onMouseDownTextFieldListener.bindAsEventListener(this));
        this.namefield.attachEvent("onblur", this.updateName.bindAsEventListener(this));
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

    setZoomlevel: function(zoomlevel) {
        this.zoomlevel=zoomlevel;
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
        this.zoomlevel = vkernelElement.getAttribute("zoomlevel");
        this.collapsed = vkernelElement.getAttribute("collapsed");

        // create the associated kernel if necessary
        var kernelXML = (xml.getElementsByTagName("kernel"))[0];
        if(!this.kernel){
            this.kernel = new Kernel();

            // pass on the population opportunity to the kernel
            this.kernel.populate(kernelXML);
        }
    },

    sync: function(xml){
       var x = this.htmlElement.style.left;
       var y = this.htmlElement.style.top;
       new Ajax.Request('/rest/vkernel/update/',{ asynchronous: true, parameters: 'container_object='+this.container_id+'&contained_object='+this.kernel.id+'&x='+x+'&y='+y+'&zoomlevel='+this.zoomlevel+'&collapsed='+this.collapsed });
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
VisibleKernel.create = function (container_id, x,y,zoomlevel,collapsed) {
    var vkernel = new VisibleKernel();
    var request = new Ajax.Request('/rest/vkernel/add/',{ asynchronous: false, parameters: 'container_object='+container_id+'&x='+x+'&y='+y+'&zoomlevel='+zoomlevel+'&collapsed='+collapsed });
    vkernel.populate(request.transport.responseXML);
    return vkernel;
}

var KernelDraggable = Class.create();

ajaxEngine.registerRequest('updateContainedObject', '/containedobject/do_update');

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
