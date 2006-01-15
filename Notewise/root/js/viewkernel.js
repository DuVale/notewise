// ViewKernel is the class for the current view.  It is not directly resizable
// or draggable. (though it is usually contained within a browser window that
// is).

var ViewKernel = Class.create();
ViewKernel.prototype = new KernelObject();
ViewKernel.prototype.extend( {
    initialize: function(id, htmlElement) {
        this.__kernel_id = id;
        KernelObject.prototype.initialize.call(this,htmlElement);
        window.onresize = this.layoutResize.bindAsEventListener(this);
    },

    layoutResize: function() {
        this.resizeChildren();
    },

    // setup all the event listeners
    registerHandlers: function() {
        KernelObject.prototype.registerHandlers.call(this);

        // setup the namefield actions
        Utils.registerEventListener(this.namefield,'blur', this.updateName.bind(this));
    },

    // dummy method - this is used by resizeChildren.
    collapsed: function() {
        return false;
    },

    kernel: function() {
        if(!this.__kernel){
            this.__kernel = Kernel.retrieve(this.__kernel_id);
        }

        return this.__kernel;
    },

    kernel_id: function() {
        return this.__kernel_id;
    },

    fetchElements: function () {
        this.body = this.htmlElement;
        KernelObject.prototype.fetchElements.call(this);
    }
});
