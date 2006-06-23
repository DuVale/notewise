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
        this.observe(this.namefield,'blur', this.updateName.bind(this));
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
    },

    realize: function() {
        var children = this.kernel().children();
        for(var i=0;i<children.length; i++){
            var child = children[i];
            objectCache[child.idString()] = child;
            child.realize($('viewkernel'));
        }

        var notes = this.kernel().notes();
        for(var i=0;i<notes.length; i++){
            var note = notes[i];
            objectCache[note.idString()] = note;
            note.realize($('viewkernel'));
        }

        var rels = this.kernel().visible_relationships();
        for(var i=0;i<rels.length; i++){
            var rel = rels[i];
            rel.realize(this.kernel().id());
        }

        var kernel_id = this.kernel_id();
        window.setTimeout(function () {new Ajax.Updater('parents_content',
                         '/kernel/parentshtml/' + kernel_id,
                         {
                             evalScripts: 1,
                             method: 'get',
                             asynchronous: true
                         });},100);

    },

    destroy: function() {
        printfire("deleteing view "+this.kernel_id());
        this.unregisterHandlers();
        this.kernel().destroy();
        window.history.back();
    }
});

JSDBI.on_start_update = function () {
    Element.show($('saving_indicator'));
}

JSDBI.on_end_update = function () {
    new Effect.Fade($('saving_indicator'),{duration: 0.5});
}
