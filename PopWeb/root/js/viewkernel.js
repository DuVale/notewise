var ViewKernel = Class.create();
ViewKernel.prototype = new KernelObject();
ViewKernel.prototype.extend( {
    initialize: function(id, htmlElement) {
        this.__kernel_id = id;
        KernelObject.prototype.initialize.call(this,htmlElement);
    },

    kernel: function() {
        if(!this.__kernel){
            this.__kernel = Kernel.retrieve(this.__kernel_id);
        }

        return this.__kernel;
    }
});