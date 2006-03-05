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
        this.body = this.htmlElement;
        this.namefield = $('viewname');
    }
});

JSDBI.on_start_update = function () {
    Element.show($('saving_indicator'));
}

JSDBI.on_end_update = function () {
    new Effect.Fade($('saving_indicator'),{duration: 0.5});
}
