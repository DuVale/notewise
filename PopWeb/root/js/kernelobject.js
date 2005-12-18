var KernelObject = Class.create();
KernelObject.prototype = {
    initialize: function(htmlElement){
        this.htmlElement = htmlElement;

        if(this.htmlElement){
            this.setup();
        }
    },

    registerHandlers: function() {
        // set up the dnd
        dndMgr.registerDropZone( new CustomDropzone(this.body,this) );

        // setup the click handlers
        Utils.registerEventListener(this.body,'dblclick', this.addNewKernel.bindAsEventListener(this));

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
                                   Utils.terminateEvent.bindAsEventListener(this));
    },

    updateName: function (e) {
        var targ;
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug
            targ = targ.parentNode;

        // Update the link text
        // XXX this only works for visible kernels
        this.namelink.innerHTML = targ.value;

        this.kernel().name(targ.value);
        this.kernel().update();

    },

    // causes the namefield to relayout
    layoutNamefield: function() {
        var width = this.getNameFieldWidth();
        this.namefield.style.width = width+'px';
        this.namelink.style.width = width+'px';

        // scroll the text field all the way to the left again - apparently
        // setting the value of a text input field again causes it to properly
        // scroll all the way to the left
        this.namefield.value = this.namefield.value;
        return width;
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
            KernelObject.textSizingBox.style.left = '-2000px';
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

    addNewKernel: function (e){
        // get the mouse event coordinates
        var posx = 0;
        var posy = 0;
        if (!e) var e = window.event;
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        }
        else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft;
            posy = e.clientY + document.body.scrollTop;
        }

        var parentPos = Utils.toViewportPosition(this.body);

        var x = (posx-parentPos.x)*100/this.body.clientWidth;
        var y = (posy-parentPos.y)*100/this.body.clientHeight;
        var dummyDiv = document.createElement('div');
        dummyDiv.className='dummyDiv';
        dummyDiv.style.left=x+'%';
        dummyDiv.style.top=y+'%';
        dummyDiv.style.width='30%';
        dummyDiv.style.height='34px'; //XXX jon hates me - magic numbers are bad
        this.body.appendChild(dummyDiv);

        window.setTimeout(this.createVKernel.bind(this),5,x,y,dummyDiv);
        Utils.terminateEvent(e);
    },

    createVKernel: function(x,y,dummyDiv){
        var vkernel = VisibleKernel.insert({container_object: this.kernel(),
                                            x: x,
                                            y: y,
                                            width: 30,
                                            height: 30,
                                            collapsed: 1});
        this.body.removeChild(dummyDiv);
        vkernel.realize(this.body);
        dndMgr.updateSelection(vkernel,false);
        vkernel.namefield.focus();
    },
};
