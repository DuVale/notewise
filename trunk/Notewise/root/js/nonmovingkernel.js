// NonMovingKernel is an abstract class for kernels that don't get dragged
// around, like thumbnails and views. They are not directly resizable or
// draggable (though they may be contained within a container that is).

var NonMovingKernel = Class.create();
NonMovingKernel.prototype = new KernelObject();
NonMovingKernel.prototype.extend( {
    initialize: function(id, htmlElement) {
        this.__kernel_id = id;
        KernelObject.prototype.initialize.call(this,htmlElement);
    },

    // dummy method - this is used by resizeChildren.
    collapsed: function() {
        return false;
    },

    kernel: function() {
        if(!this.__kernel && this.__kernel_id){
            this.__kernel = Kernel.retrieve(this.__kernel_id.toString());
        }

        return this.__kernel;
    },

    kernel_id: function() {
        return this.__kernel_id;
    },

    fetchElements: function () {
        KernelObject.prototype.fetchElements.call(this);
    }
});
