// KernelObject is the super class for all kernel objects, such as ViewKernel
// and VisibleKernelController.  It contains all the shared logic between these classes.

var KernelObject = Class.create();

KernelObject.prototype = {
    initialize: function(htmlElement){
        this.htmlElement = htmlElement;
        this.headerDivs = new Array();

        if(this.htmlElement){
            this.setup();
        }
    },

    // setup all the event listeners
    registerHandlers: function() {
        // set up the dnd
        this.dropzone = new KernelDropzone(this.body,this);
        dndMgr.registerDropZone( this.dropzone );

        // setup the click handlers
        this.observe(this.body,'dblclick', this.gotDoubleClick.bindAsEventListener(this));
        this.observe(this.body,'mousedown', this.startSelectionBox.bindAsEventListener(this));
        this.observe(this.body,'click', this.gotClick.bindAsEventListener(this));
        this.observe(this.body,
                      'mousedown',
                      function() { dndMgr.clearSelection(); dndMgr.giveSearchBoxFocus(); } );
        
        // setup the namefield actions
        this.observe(this.namefield,'keyup', this.layoutNamefield.bind(this));
//        Event.observe(this.namefield,'keypress', this.loseFocusOnEnter.bindAsEventListener(this));

        // drag in namefield should select text, not drag object
        this.observe(this.namefield,
                                   'mousedown',
                                   Utils.terminateEvent.bindAsEventListener(this));
        this.observe(this.namefield,
                                   'mouseup',
                                   Utils.terminateEvent.bindAsEventListener(this));
        // double click in namefield should select text, not create kernel
        this.observe(this.namefield,
                                   'dblclick',
                                   Utils.terminateEvent.bindAsEventListener(this));

        if(this.namelink){
            var id = this.kernel_id();
            this.observe(this.namelink,'click', this.makeView.bindAsEventListener(this));
            this.observe(this.namelink,'dblclick', this.makeView.bindAsEventListener(this));
        }
    },

    observe: function(element, name, observer, useCapture) {
        if (!this.observers) this.observers = [];
        this.observers.push([element, name, observer, useCapture]);
        Event.observe(element, name, observer, useCapture);
    },

    unregisterHandlers: function() {
        dndMgr.deregisterDropZone(this.dropzone);
        if (this.observers) {
            for (var i = 0; i < this.observers.length; i++) {
                Event.stopObserving.apply(this, this.observers[i]);
            }
        }
    },

    // make this kernel into the current view (ie, switch the url to this kernel)
    makeView: function(e){
        var id = this.kernel_id() + "";
        printfire("makeView("+id+")");
        dhtmlHistory.add(''+id,{}); // TODO add in username or kernel title here
        Utils.terminateEvent(e);
        Utils.preventDefault(e);
        this.do_make_view(id);
    },

    do_make_view: function(id) {
        printfire("do_make_view("+id+")");
        var date = new Date();
        time = date.getTime();
        // wipe existing view
        if(view){
            view.unregisterHandlers();
        }
        $('viewname').value = 'Loading...';
        $('parents_content').innerHTML = 'Loading...';
        $('viewkernel').innerHTML = '';
        window.setTimeout(this.finishMakeView.bindWithParams(this, id), 10);
    },

    finishMakeView: function(id){
        var date = new Date();
        // setup new view
        viewKernelId=id;
        view = new ViewKernel(viewKernelId,$('viewkernel'));
        view.realize();
        $('viewname').value = view.kernel().name();
        document.title = view.kernel().name() + " - Notewise.com";

        date = new Date();
        printfire("switching took: "+(date.getTime() - time));
        $('mysearchfield').focus();
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
        // add this object as a property of the htmlElement, so we can get back
        // to it if all we have is the element
        this.htmlElement.kernel = this;

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

    gotClick: function (e) {
        if (!e) var e = window.event
        if(this.blockObjectCreation){
            Utils.terminateEvent(e);
            return;
        }
        if(e.shiftKey || e.ctrlKey || e.altKey) {
            this.addNewNote(e);
            // block note creation, so we don't create two notes on a double click
            this.blockObjectCreation = true;
            window.setTimeout(this.clearObjectCreationBlock.bind(this), 1000);
        }
    },

    clearObjectCreationBlock: function() {
        this.blockObjectCreation = false;
    },

    gotDoubleClick: function (e) {
        if (!e) var e = window.event;
        if(this.blockObjectCreation){
            Utils.terminateEvent(e);
            return;
        }
        if(e.shiftKey || e.ctrlKey || e.altKey) {
            // don't do anything, since this was a double click
            Utils.terminateEvent(e);
        } else {
            this.addNewKernel(e);
        }
        Utils.terminateEvent(e);
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

        Utils.terminateEvent(e);
        
        var parentPos = Utils.toViewportPosition(this.body);
        
        var x = (posx - parentPos.x) * 100 / this.body.clientWidth;
        var y = (posy - parentPos.y) * 100 / this.body.clientHeight;

        var note = new Note;
        note.container_object(this.kernel());
        note.x(x);
        note.y(y);
        note.width(15);
        note.height(15);
        note.content('');
        note.insert({asynchronous:true, onSuccess: function(){objectCache[this.idString()]=this;}.bind(note)});

        note.realize(this.body);
        dndMgr.updateSelection(note, false);
        note.body.focus();

        this.updateContains();
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

        Utils.terminateEvent(e);

        var parentPos = Utils.toViewportPosition(this.body);

        var x = (posx-parentPos.x)*100/this.body.clientWidth;
        var y = (posy-parentPos.y)*100/this.body.clientHeight;

        // create the vkernel object on the server, and a matching js object
        var vkernel = new VisibleKernelController;
        var model = vkernel.model();
        model.container_object(this.kernel());
        model.x(x);
        model.y(y);
        model.width(30);
        model.height(30);
        model.collapsed(1);
        model.insert({asynchronous:true, onSuccess: function(){
            objectCache[model.idString()] = vkernel;
        }});

        // create a temporary kernel so realize() doesn't bomb
        // XXX this probably creates a nasty race condition, as if the user
        // makes an update that hits the kernel object, it'll be wiped out when
        // the object gets populated when the insert callback calls populate
        model.contained_object(new Kernel());
        model.contained_object().name('');

        vkernel.realize(this.body);
        dndMgr.updateSelection(vkernel,false);
        vkernel.edit(true);
        vkernel.namefield.focus();
        vkernel.newlyCreated(true);
        this.updateContains();

    },

    // marks the html with a css class based on whether it contains any child objects
    updateContains: function() {
        var vkernels = Utils.getElementsByClassName(this.body,'vkernel');
        var notes = Utils.getElementsByClassName(this.body,'note');
        if(this.kernel().has_children() > 0){
            this.changeClass('contains');
        } else {
            this.changeClass('notcontains');
        }
    },

    changeClass: function(newClass){
        var oldClass;
        if(newClass == 'collapsed'){
            oldClass = 'expanded';
        } else if(newClass == 'expanded'){
            oldClass = 'collapsed';
        } else if(newClass.search(/^not/) == -1){
            oldClass = 'not'+newClass;
        } else {
            oldClass = newClass.replace(/^not/,'');
        }

        this.htmlElement.className =
            this.htmlElement.className.replace(new RegExp('-'+oldClass,'g'),'-'+newClass);
        for(var i=0; i<this.headerDivs.length; i++){
            this.headerDivs[i].className =
                this.headerDivs[i].className.replace(new RegExp('-'+oldClass,'g'),'-'+newClass);
        }
    },

    startSelectionBox: function(e){
        this.duringSelectionBoxInstance = this.duringSelectionBox.bindAsEventListener(this);
        Event.observe(document,
                      'mousemove',
                      this.duringSelectionBoxInstance);

        this.endSelectionBoxInstance = this.endSelectionBox.bindAsEventListener(this);
        Event.observe(document,
                      'mouseup',
                      this.endSelectionBoxInstance);

        var bodyPos = Utils.toViewportPosition(this.body);

        this.selectboxstartx = Utils.mousex(e) - bodyPos.x + 8;
        this.selectboxstarty = Utils.mousey(e) - bodyPos.y;

        if(this.selectbox &&
           this.selectbox.parentNode == this.body){
                this.body.removeChild(this.selectbox);
        }

        var box = document.createElement('div');
        box.id = 'selectbox';
        this.selectbox = box;

        this.body.appendChild(box);
        return;
    },

    duringSelectionBox: function(e) {
        var bodyPos = Utils.toViewportPosition(this.body);
        var newx = Utils.mousex(e) - bodyPos.x + 8;
        var newy = Utils.mousey(e) - bodyPos.y;
        var x = Math.min(newx,this.selectboxstartx);
        var y = Math.min(newy,this.selectboxstarty);
        var w = Math.abs(newx - this.selectboxstartx);
        var h = Math.abs(newy - this.selectboxstarty);
        var box = this.selectbox;
        box.style.width = w + 'px';
        box.style.height = h + 'px';
        box.style.left = x + 'px';
        box.style.top = y + 'px';
    }, 

    endSelectionBox: function(e) {
        var bodyPos = Utils.toViewportPosition(this.body);
        var endx = Utils.mousex(e) - bodyPos.x + 8;
        var endy = Utils.mousey(e) - bodyPos.y;
        var startx = this.selectboxstartx;
        var starty = this.selectboxstarty;
        var boxleft = Math.min(endx,startx);
        var boxright = Math.max(endx,startx);
        var boxtop = Math.min(endy,starty);
        var boxbottom = Math.max(endy,starty);

        if(this.selectbox.parentNode == this.body){
            this.body.removeChild(this.selectbox);
        }

        Event.stopObserving(document,
                            'mousemove',
                            this.duringSelectionBoxInstance);

        Event.stopObserving(document,
                            'mouseup',
                            this.endSelectionBoxInstance);

        var children = this.body.childNodes;
        for(var i=0; i<children.length; i++){
            var element = children[i];
            if(element.id &&
                (Element.hasClassName(element,'vkernel')||
                 Element.hasClassName(element,'note'))
               ){
                var pos = Utils.toViewportPosition(element);
                var left = pos.x - bodyPos.x + 8;
                var top = pos.y - bodyPos.y;
                var right = left + element.offsetWidth;
                var bottom = top + element.offsetHeight;
                if(left > boxleft && right < boxright
                   && top > boxtop && bottom < boxbottom){
                        dndMgr.updateSelection(element.draggable,true);
                }
            }
        }
    }
};

var KernelDropzone = Class.create();

KernelDropzone.prototype = (new Dropzone()).extend( {

   initialize: function( htmlElement, vkernel ) {
        this.type        = 'Kernel';
        this.htmlElement = htmlElement;
        this.vkernel        = vkernel;
   },

   accept: function(draggableObjects) {
       for(var i=0;i<draggableObjects.length;i++){
           if(draggableObjects[i].type != 'vkernel' && draggableObjects[i].type != 'note'){
               continue;
           }
           draggableObjects[i].reparent(this.vkernel);
       }
   },

   // XXX showHover and hideHover are all broken, because rico dnd doesn't understand layers
   showHover: function() {
//        Element.addClassName(this.htmlElement,'activated');
   },

   hideHover: function() {
//        Element.removeClassName(this.htmlElement,'activated');
   },

   activate: function() {
   },

   deactivate: function() {
   }
});
