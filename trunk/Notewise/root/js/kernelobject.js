// KernelObject is the super class for all kernel objects, such as ViewKernel
// and VisibleKernel.  It contains all the shared logic between these classes.

var KernelObject = Class.create();

KernelObject.prototype = {
    initialize: function(htmlElement){
        this.htmlElement = htmlElement;

        if(this.htmlElement){
            this.setup();
        }
    },

    // setup all the event listeners
    registerHandlers: function() {
        // set up the dnd
        dndMgr.registerDropZone( new CustomDropzone(this.body,this) );

        // setup the click handlers
        Event.observe(this.body,'dblclick', this.addNewElement.bindAsEventListener(this));
        Event.observe(this.body,
                                   'mousedown',
                                   Utils.clearSelectionAndTerminate.bindAsEventListener(this));
        
        // setup the namefield actions
        Event.observe(this.namefield,'blur', this.updateName.bind(this));
        Event.observe(this.namefield,'keyup', this.layoutNamefield.bind(this));
//        Event.observe(this.namefield,'keypress', this.loseFocusOnEnter.bindAsEventListener(this));

        // drag in namefield should select text, not drag object
        Event.observe(this.namefield,
                                   'mousedown',
                                   Utils.terminateEvent.bindAsEventListener(this));
        Event.observe(this.namefield,
                                   'mouseup',
                                   Utils.terminateEvent.bindAsEventListener(this));
        // double click in namefield should select text, not create kernel
        Event.observe(this.namefield,
                                   'dblclick',
                                   Utils.terminateEvent.bindAsEventListener(this));
    },

    // Updates the kernel name on the server.  Called from an event handler when the name is changed.
    updateName: function () {
        // This is a hack to avoid persisting a newly created kernel, since
        // we're probably just going to be deleting it anyway
        if(this.newlyCreated){
            return;
        }

        this.kernel().name(this.namefield.value);

        this.updateNamelinkText();

        this.kernel().update(this.updateNamelinkUrl.bind(this));
    },

    updateNamelink: function () {
        this.updateNamelinkText();
        this.updateNamelinkUrl();
    },

    updateNamelinkText: function () {
        if(this.namelink != undefined){
            // Update the link text
            this.namelink.innerHTML = this.kernel().name();
        }
    },

    updateNamelinkUrl: function () {
        if(this.namelink != undefined){
            // Update the link url
            this.namelink.href = this.kernel().object_url();
        }
    },

    // causes the namefield to relayout
    layoutNamefield: function() {
        var width = this.getNameFieldWidth();
        this.namefield.style.width = width+'px';
        if(this.namelink != undefined){
            this.namelink.style.width = width+'px';
        }

        // scroll the text field all the way to the left again - apparently
        // setting the value of a text input field again causes it to properly
        // scroll all the way to the left
        this.namefield.value = this.namefield.value;
        return width;
    },

    loseFocusOnEnter: function(e) {
        if(e.keyCode == Event.KEY_RETURN) {
            Utils.clearSelectionAndTerminate(e);
        }
    },

    resizeChildren: function() {
        // resize children
        if(this.body != undefined
           && ! this.collapsed()){
            var children = this.body.childNodes;
            for(var i=0; i<children.length; i++){
                var child = children[i];
                // XXX Icky - DRY
                if(child.className != undefined
                   && Element.hasClassName(child,'vkernel')
                   && child.kernel != undefined){
                    child.kernel.layoutResize();
                }
                if(child.className != undefined
                   && Element.hasClassName(child,'relationship')
                   && child.relationship != undefined){
                    child.relationship.layoutResize();
                }
                if(child.className != undefined
                   && Element.hasClassName(child,'note')
                   && child.note != undefined){
                    child.note.layoutResize();
                }
            }
        }
    },

    // returns the desired width of the name field.  Usually the width of the
    // text in the field, but bounded by the minimum width
    getNameFieldWidth: function(){
        // TODO make 20 into a constant - min namefield width
        return Math.max(Utils.getInputTextWidth(this.namefield),20);
    },

    setup: function () {
        this.fetchElements();
        this.registerHandlers();
    },

    // retrieves references to all the relevant html elements and stores them
    // as properties in this object
    fetchElements: function() {
        this.body = Utils.getElementsByClassName(this.htmlElement, 'body')[0];
        if(this.htmlElement){
            this.namefield = Utils.getElementsByClassName(this.htmlElement, 'namefield')[0];
        };
    },

    addNewElement: function (e) {
        if (!e) var e = window.event
        if(e.shiftKey || e.ctrlKey || e.altKey) {
            this.addNewNote(e);
        } else {
            this.addNewKernel(e);
        }
    },
    
    addNewNote: function (e) {
        // get the event coords
        var posx = 0;
        var posy = 0;
        
        if (!e) var e = e.window.event;
        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft;
            posy = e.clientY + document.body.scrollTop; 
        }
        
        var parentPos = Utils.toViewportPosition(this.body);
        
        var x = (posx - parentPos.x) * 100 / this.body.clientWidth;
        var y = (posy - parentPos.y) * 100 / this.body.clientHeight;
        var dummyDiv = document.createElement('div');
        dummyDiv.className = 'dummyDiv';
        dummyDiv.style.left = x + '%';
        dummyDiv.style.top = y + '%';
        dummyDiv.style.width = '30%';
        dummyDiv.style.height = '34px'; // XXX I still hate this :P
        this.body.appendChild(dummyDiv);
        
        // give the brower some time to paint the dummy div
        window.setTimeout(this.createNote.bindWithParams(this, x, y, dummyDiv), 5);
        Utils.terminateEvent(e);
    },

    // Adds a new kernel to the kernel body for the mouse event given (currently called from a double click)
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

        // Give the browser a little bit of time to refresh, so the dummyDiv paints
        window.setTimeout(this.createVKernel.bindWithParams(this,x,y,dummyDiv),5);
        Utils.terminateEvent(e);
    },

    // actually create the new kernel, at coordinates x,y, and remove the dummyDiv.
    createVKernel: function(x,y,dummyDiv){
        // create the vkernel object on the server, and a matching js object
        var vkernel = VisibleKernel.insert({container_object: this.kernel(),
                                            x: x,
                                            y: y,
                                            width: 30,
                                            height: 30,
                                            collapsed: 1});
        // XXX make sure that this is the right order - whatever order doesn't cause a blink is fine
        if(dummyDiv != undefined){
            this.body.removeChild(dummyDiv);
        }
        vkernel.realize(this.body);
        dndMgr.updateSelection(vkernel,false);
        vkernel.namefield.focus();
        vkernel.newlyCreated = true;
        objectCache[vkernel.idString()]=vkernel;
    },
    
    createNote: function (x, y, dummyDiv) {
        var note = Note.insert({container_object: this.kernel(),
                                x: x,
                                y: y,
                                width: 30,
                                height: 30,
                                content: ""});
        this.body.removeChild(dummyDiv);
        note.realize(this.body);
        dndMgr.updateSelection(note, false);
        note.body.focus();
        objectCache[note.idString()]=note;
    }
};
