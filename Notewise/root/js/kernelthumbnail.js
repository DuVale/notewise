// A visible kernel is a normal kernel on a view that's draggable and renameable.

var KernelThumbnail = Class.create();
KernelThumbnail.prototype = new NonMovingKernel();

KernelThumbnail.prototype.extend({

    initialize: function(id, htmlElement) {
        NonMovingKernel.prototype.initialize.call(this,id,htmlElement);
    },

    fetchElements: function () {
        KernelObject.prototype.fetchElements.call(this);
        WiseObject.prototype.fetchElements.call(this);
        this.namelink = Utils.getElementsByClassName(this.htmlElement, 'namelink')[0];
    },

    registerHandlers: function() {
        NonMovingKernel.prototype.registerHandlers.call(this);
        Event.observe(this.htmlElement,'dblclick', this.makeView.bindAsEventListener(this));
    },

    // Select this object and terminate the event
    selectAndTerminate: function(e) {
        dndMgr.clearSelection();
        dndMgr.updateSelection(this,false);
        Utils.terminateEvent(e)
    },

    // Returns whether or not this object is currently selected
    isSelected: function () {
        return Element.hasClassName(this.htmlElement,'selected');
    },

    // Rico draggable stuff

    // Select this object
    select: function () {
        if( !this.isSelected() ){
            Element.removeClassName(this.htmlElement,'notselected');
            Element.addClassName(this.htmlElement,'selected');
        }
    },

    // Mark this object as not selected
    deselect: function () {
        if( this.isSelected()){
            Element.removeClassName(this.htmlElement,'selected');
            Element.addClassName(this.htmlElement,'notselected');
        }
    }
});
