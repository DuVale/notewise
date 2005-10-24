var Kernel = Class.create();

ajaxEngine.registerRequest('updateKernel', '/kernel/do_update');

Kernel.prototype = {

    initialize: function(id) {
        this.id = id;
    },

    setName: function (name) {
        var request = new Ajax.Request('/rest/kernel/update/',{
                            asynchronous: true,
                            parameters: 'id='+this.id+'&name='+name
                      });
    },

    populate: function(xml){
        if(xml.constructor == '[XMLDocument]'){
            var kernelElements = xml.getElementsByTagName('kernel');
            xml = kernelElements[0];
        }
        this.id = xml.getAttribute("id");
        this.name = xml.getAttribute("name");
        this.created = xml.getAttribute("created");
        this.lastModified = xml.getAttribute("lastModified");
        this.source = xml.getAttribute("source");
        this.uri = xml.getAttribute("uri");
    }
}

// class method
// Blocking retrieval of an existing kernel
Kernel.retrieve = function (id) {
    var kernel = new Kernel(id);
    kernel.type="kernel";
    var request = new Ajax.Request('/rest/kernel/xml/'+id,{ asynchronous: false});
    kernel.populate(request.transport.responseXML);
    return kernel;
}

// not sure why you'd want to do this, but this creates just a kernel, without
// an associated visible kernel.  You probably want VisibleKernel.create
// instead.
Kernel.create = function () {
    var kernel = new Kernel();
    var request = new Ajax.Request('/rest/kernel/add/',{ asynchronous: false });
    kernel.populate(request.transport.responseXML);
    return kernel;
}
