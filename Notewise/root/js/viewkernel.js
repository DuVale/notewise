// ViewKernel is the class for the current view.  It is not directly resizable
// or draggable. (though it is usually contained within a browser window that
// is).

var ViewKernel = Class.create();
ViewKernel.prototype = new NonMovingKernel();
ViewKernel.prototype.extend( {
    initialize: function(id, htmlElement) {
        NonMovingKernel.prototype.initialize.call(this,id,htmlElement);
        window.onresize = this.layoutResize.bindAsEventListener(this);
    },

    fetchElements: function () {
        NonMovingKernel.prototype.fetchElements.call(this);
        this.body = this.htmlElement;
    }
});
