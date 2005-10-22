var Kernel = Class.create();

ajaxEngine.registerRequest('updateKernel', '/kernel/do_update');

Kernel.prototype = {

    initialize: function(id,htmlElement) {
        this.id = id;
        this.htmlElement = htmlElement;
        if(this.htmlElement){
            this.namefield = document.getElementById('namefield'+this.id);
            this.registerHandlers();
        }
    },

    // creates the actual html for this kernel
    realize: function(parent) {
        this.htmlElement = document.createElement('div');
        parent.appendChild(this.htmlElement);
        this.htmlElement.id="kernel"+this.id;
        this.htmlElement.className="kernel";
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

    updateName: function (e) {
        window.status = "got blur";
        var targ;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug
            targ = targ.parentNode;
        ajaxEngine.sendRequest( 'updateKernel',
                                'id='+this.id,
                                'name='+targ.value );
    },

    registerHandlers: function() {
        dndMgr.registerDraggable( new KernelDraggable('kernel'+this.id, this) );
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
        this.htmlElement.style.left = x+"px";
    },

    setY: function(y) {
        this.htmlElement.style.top = y+"px";
    },

    populate: function(transport){
        var kernelElements = transport.responseXML.getElementsByTagName("kernel");

        for ( var i = 0 ; i < kernelElements.length ; i++ ) {
            var kernelElement = kernelElements[i];
            var id = kernelElement.getAttribute("id");
            alert("id: "+id+" this.id: "+this.id);
            if(id != this.id){
                continue;
            }
            this.name = kernelElement.getAttribute("name");
            this.created = kernelElement.getAttribute("created");
            this.lastModified = kernelElement.getAttribute("lastModified");
            this.source = kernelElement.getAttribute("source");
            this.uri = kernelElement.getAttribute("uri");
        }
    },

    new_populate: function(transport){
        var kernelElements = transport.responseXML.getElementsByTagName("kernel");

        var kernelElement = kernelElements[0];
        this.id = kernelElement.getAttribute("id");
        this.name = kernelElement.getAttribute("name");
        this.created = kernelElement.getAttribute("created");
        this.lastModified = kernelElement.getAttribute("lastModified");
        this.source = kernelElement.getAttribute("source");
        this.uri = kernelElement.getAttribute("uri");
    }
}

// class method
// Blocking retrieval of an existing kernel
Kernel.retrieve = function (id) {
    var kernel = new Kernel(id);
    kernel.type="kernel";
    var request = new Ajax.Request('/rest/kernel/xml/'+id,{ onSuccess: kernel.populate.bind(kernel), asynchronous: false});
    kernel.populate(request.transport);
    return kernel;
}

Kernel.create = function () {
    var kernel = new Kernel();
    var request = new Ajax.Request('/rest/kernel/add/',{ onSuccess: kernel.populate.bind(kernel), asynchronous: false, parameters: 'created=2005-01-01' });
    document.getElementById('debugfield').value=(request.transport.responseText);
    kernel.new_populate(request.transport);
    return kernel;
}
