var KernelObject = Class.create();
KernelObject.prototype = {
    initialize: function(htmlElement){
        this.htmlElement = htmlElement;

        if(this.htmlElement){
            this.setup();
        }
    },

    registerHandlers: function() {
        // setup the namefield actions
        Utils.registerEventListener(this.namefield,'blur', this.updateName.bindAsEventListener(this));
        Utils.registerEventListener(this.namefield,'keyup', this.layoutNamefield.bind(this));

        // drag in namefield should select text, not drag object
        Utils.registerEventListener(this.namefield,
                                   'mousedown',
                                   Utils.terminateEvent.bindAsEventListener(this));
        // double click in namefield should select text, not create kernel
        Utils.registerEventListener(this.namefield,
                                   'dblclick',
                                   this.clearSelectionAndTerminate.bindAsEventListener(this));
    },

    updateName: function (e) {
        var targ;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug
            targ = targ.parentNode;

        this.kernel().name(targ.value);
        this.kernel().update();
    },

    // causes the namefield to relayout
    layoutNamefield: function() {
        this.namefield.style.width = this.getNameFieldWidth()+'px';

        // scroll the text field all the way to the left again - apparently
        // setting the value of a text input field again causes it to properly
        // scroll all the way to the left
        this.namefield.value = this.namefield.value;
    },

    // returns the desired width of the name field.  Usually the width of the text in the field, but bounded by the minimum width
    getNameFieldWidth: function(){
        // TODO make 20 into a constant - min namefield width
        return Math.max(this.getTextWidth(this.namefield.value,this.getStyle(this.namefield,'font-size'))*1.15+10,20);
    },

    getTextWidth: function(text,size){
        if(KernelObject.textSizingBox === undefined){
            KernelObject.textSizingBox = document.createElement('span');
            KernelObject.textSizingBox.innerHTML = 'a';
            // put it way off the left side of the page so it's not visible
            var body = document.getElementsByTagName('body')[0];
            body.appendChild(KernelObject.textSizingBox);
            KernelObject.textSizingBox.style.position = 'absolute';
            KernelObject.textSizingBox.style.left = '-500px';
        }
        KernelObject.textSizingBox.style.fontSize = size;
        KernelObject.textSizingBox.firstChild.data = text;
        return KernelObject.textSizingBox.offsetWidth;
    },

    setup: function () {
        this.fetchElements();
        this.registerHandlers();
    },

    fetchElements: function() {
        if(this.htmlElement){
            this.namefield = Utils.getElementsByClassName(this.htmlElement, 'namefield')[0];
        };
    },

    getStyle: function(el,styleProp) {
	if (el.currentStyle){
		var y = el.currentStyle[styleProp];
	}else if (window.getComputedStyle){
		var y = document.defaultView.getComputedStyle(el,null).getPropertyValue(styleProp);
        }
	return y;
    },

    clearSelectionAndTerminate: function(e){
        dndMgr.clearSelection();
        Utils.terminateEvent(e);
        this.preventDefault(e);
    },

    // prevents the default browser action for this event from occuring
    preventDefault: function(e) {
        if ( e.preventDefault != undefined )
           e.preventDefault();
        else
           e.returnValue = false;
    },
};
