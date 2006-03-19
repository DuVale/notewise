// ViewKernel is the class for the current view.  It is not directly resizable
// or draggable. (though it is usually contained within a browser window that
// is).

var ViewKernel = Class.create();
ViewKernel.prototype = new NonMovingKernel();
ViewKernel.prototype.extend( {
    initialize: function(id, htmlElement) {
        NonMovingKernel.prototype.initialize.call(this,id,htmlElement);
        window.onresize = this.layoutResize.bindAsEventListener(this);
        this.layoutNamefield();
    },

    fetchElements: function () {
        this.body = this.htmlElement;
        this.namefield = $('viewname');
    },

    registerHandlers: function() {
        NonMovingKernel.prototype.registerHandlers.call(this);
        Event.observe(this.namefield,'blur', this.updateName.bind(this));
    },

    updateName: function() {
        this.kernel().name(this.namefield.value);
        this.kernel().update();
    },

    layoutResize: function() {
        NonMovingKernel.prototype.layoutResize.call(this);
        this.layoutNamefield();
    },

    layoutNamefield: function() {
        this.namefield.style.width = (this.namefield.parentNode.clientWidth - 130) + 'px';
    }
});

JSDBI.on_start_update = function () {
    Element.show($('saving_indicator'));
}

JSDBI.on_end_update = function () {
    new Effect.Fade($('saving_indicator'),{duration: 0.5});
}
