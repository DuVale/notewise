// A visible kernel is a normal kernel on a view that's draggable and renameable.

var VisibleKernel = Class.create();
VisibleKernel.extend(JSDBI);

// multiple inheritance from both JSDBI and Draggable
VisibleKernel.prototype = {};
JSDBI.inherit(VisibleKernel,new JSDBI());
JSDBI.inherit(VisibleKernel,new WiseObject());
JSDBI.inherit(VisibleKernel,new KernelObject());

// Setup the JSDBI data access
VisibleKernel.fields(['container_object',
                      'contained_object',
                      'collapsed',
                      'height',
                      'width',
                      'x',
                      'y']);
VisibleKernel.primaryKeys(['container_object', 'contained_object']);
VisibleKernel.url('rest/vkernel');
VisibleKernel.elementTag('visiblekernel');
VisibleKernel.has_a('contained_object','Kernel');
VisibleKernel.has_a('container_object','Kernel');

VisibleKernel.prototype.extend({
    initialize: function(container_object,contained_object,htmlElement,x,y,width,height,collapsed) {
        this.type        = 'Kernel';
        this.container_object(container_object);
        this.contained_object(contained_object);
        this.__x=x;
        this.__y=y;
        this.__width=width;
        this.__height=height;
        this.__collapsed=collapsed;
        this.superclass=VisibleKernel.superclass;

        JSDBI.prototype.initialize.call(this);
        WiseObject.prototype.initialize.call(this);
        KernelObject.prototype.initialize.call(this, htmlElement);
    },

    setup: function () {
        KernelObject.prototype.setup.call(this);

        // Setup autocomplete on the namefield.  TODO figure out how to factor this up to kernelobject
        this.autocompleter = new Ajax.Autocompleter(this.namefield, this.searchresults, JSDBI.base_url()+'ac',
                                                    {frequency: .1,
                                                     min_chars: 2,
                                                     on_select: this.on_autocomplete_select.bind(this),
                                                     on_blur: this.onNamefieldBlur.bind(this),
                                                     before_complete: this.on_autocomplete_load.bind(this),
                                                     on_complete: this.on_autocomplete_complete.bind(this),
                                                     on_inactive_select: this.on_inactive_select.bind(this)});
    },

    on_inactive_select: function (autocompleter) {
        var url = base_url+"rest/kernel/find_or_create/"+encodeURIComponent(this.namefield.value);
        var new_kernel = new Kernel();
        var request = new Ajax.Request(url,
                                       { method: 'get',
                                         asynchronous: false } );
        new_kernel.__populate(request.transport.responseXML);
        this.swap_kernels(new_kernel);
        dndMgr.clearSelection();
        dndMgr.giveSearchBoxFocus();
    },

    on_autocomplete_load: function (autocompleter,request) {
        match = request.responseText.match(/>new '(.*?)'</);
        if(match && match[1] == this.namefield.value){
            // show the results
            return 1;
        } else {
            // don't show the results - they're too old
            return 0;
        }
    },

    on_autocomplete_select: function (selected_element) {
        var id=selected_element.getElementsByTagName('a')[0].getAttribute('href');
        var results = id.match(/\/(\d+)/);
        if(results){
            id = results[1];
        }
        if(Number(id) == 0){
            this.newlyCreated = false;
            this.kernel().name(this.namefield.value);
            this.updateNamelinkText();
            this.kernel().update(this.updateNamelinkUrl.bind(this));
        } else {
            this.swap_kernels(Kernel.retrieve(id));
            this.newlyCreated = false;
        }
        
        dndMgr.clearSelection();
        dndMgr.giveSearchBoxFocus();
    },

    on_autocomplete_complete: function (autocompleter) {
        if(autocompleter.entry_count == 1){
            // if there were no actual search results, then "new..." should be
            // the default selection
            autocompleter.index = 0;
        } else {
            // The first actual search result should be selected
            autocompleter.index = 1;
        }
    },

    swap_kernels: function (kernel) {
        var old_contained_object = this.contained_object();
        var old_id_string = this.idString();
        this.contained_object(kernel);
        this.namefield.value = kernel.name();
        this.layout();
        this.updateNamelink();
        this.update();
        objectCache[this.idString()]=this;
        window.setTimeout(this.after_swap_kernels.bindWithParams(this,old_contained_object,old_id_string),500);
    },

    // This contains all the things that can happen asynchronously after we
    // swap out the kernel, in an attempt to make the swap feel more snappy
    after_swap_kernels: function(old_contained_object,old_id_string){
        this.hydrateChildren();
        this.hydrateRelationships();
        delete objectCache[old_id_string];
        if(this.newlyCreated){
            this.contained_object().destroy();
        }
    },

    // returns the id in the form '1/2' where the first number is the
    // container_id and the second number is the contained_id
    idString: function() {
        var id = this.id().join('/');
        return id;
    },

    // creates the actual html for this kernel
    // XXX this is a bunch of garbage - need to unify this html with the stuff in root/Kernel/kernel.tt.  Maybe think about shipping the html as part of the xml?  Or maybe a seperate ajax call?
    realize: function(parent) {
        this.htmlElement = document.createElement('div');
        this.htmlElement.id="vkernel"+this.idString();
        this.htmlElement.className="vkernel collapsed nothighlighted";
        var expandButtonLabel = this.collapsed() ? '+' : '-';
        var name;
        if(this.kernel().name() === undefined){
            name = '';
        } else {
            name = this.kernel().name();
        }
        var innerHTML =
           "<div class=\"expandbutton\"></div>"
           +"<a title='Remove kernel' class=\"removebutton\"></a>"
           +"<a title='Rename kernel' class=\"editbutton\"></a>"
           +"<div class='relationshiphalo'>"
               +"<div class='newrelationshiparrow'></div>"
               +"<div class='halo-top-left'></div>"
               +"<div class='halo-top'></div>"
               +"<div class='halo-top-right'></div>"
               +"<div class='halo-left'></div>"
               +"<div class='halo-right'></div>"
               +"<div class='halo-bottom-left'></div>"
               +"<div class='halo-bottom'></div>"
               +"<div class='halo-bottom-right'></div>"
           +"</div>"
           +"<div class='leftbackground'></div>"
           +"<div class='mid-leftbackground'></div>"
           +"<div class='mid-rightbackground'></div>"
           +"<div class='rightbackground'></div>"
           +"<input value=\"\" type=\"text\" class=\"namefield\" autocomplete=\"off\" name=\"s\" value=\""+name+"\"/>"
           +"<a class=\"namelink\" href=\""+this.kernel().object_url()+"\">"
           +name+"</a>"
           +"<div class=\"body\"></div>"
           +"<div class=\"corner\"></div>";
        
        this.htmlElement.innerHTML = innerHTML;
        WiseObject.prototype.realize.call(this,parent);
    },

    // create html elements for the child objects
    hydrateChildren: function() {
        var url = JSDBI.base_url()+'kernel/innerhtml/'+this.kernel_id();
        new Ajax.Request(url, {onSuccess: this.insertChildren.bind(this), evalScripts: true});
    },

    insertChildren: function(t) {

        this.body.innerHTML = t.responseText;
        this.updateContains();

        var match    = new RegExp(Ajax.Updater.ScriptFragment, 'img');
        var scripts  = t.responseText.match(match);
        if(scripts){
            match = new RegExp(Ajax.Updater.ScriptFragment, 'im');

            setTimeout((function() {
                for (var i = 0; i < scripts.length; i++)
                    eval(scripts[i].match(match)[1]);
            }).bind(this), 10);
        }
    },

    kernel: function() {
        return this.contained_object();
    },

    kernel_id: function() {
        return this.__getField('contained_object');
    },

    // retrieves references to all the relevant html elements and stores them
    // as properties in this object
    fetchElements: function () {
        KernelObject.prototype.fetchElements.call(this);
        WiseObject.prototype.fetchElements.call(this);
        this.namelink = Utils.getElementsByClassName(this.htmlElement, 'namelink')[0];
        this.searchresults = document.getElementById('visiblekernelsearchresults');
        if(!this.searchresults){
            this.searchresults = document.createElement('div');
            this.searchresults.id = 'visiblekernelsearchresults';
            this.searchresults.className = 'searchresults';
            Element.hide(this.searchresults);
            var body=document.getElementsByTagName('body')[0];
            body.appendChild(this.searchresults);
        }
        this.expandbutton = Utils.getElementsByClassName(this.htmlElement, 'expandbutton')[0];
        this.editbutton = Utils.getElementsByClassName(this.htmlElement, 'editbutton')[0];
        this.leftbackground = Utils.getElementsByClassName(this.htmlElement, 'leftbackground')[0];
        this.midleftbackground = Utils.getElementsByClassName(this.htmlElement, 'mid-leftbackground')[0];
        this.midrightbackground = Utils.getElementsByClassName(this.htmlElement, 'mid-rightbackground')[0];
        this.rightbackground = Utils.getElementsByClassName(this.htmlElement, 'rightbackground')[0];
    },

    onNamefieldBlur: function(selected_element) {
        this.on_autocomplete_select(selected_element);
    },

    // setup all the event listeners
    registerHandlers: function() {
        KernelObject.prototype.registerHandlers.call(this);

        WiseObject.prototype.registerHandlers.call(this);

        // TODO check to see if all these terminate event listeners are necessary

        // setup the click handlers
        Event.observe(this.htmlElement,'dblclick', this.makeView.bindAsEventListener(this));
        Event.observe(this.namelink,'click', Utils.terminateEvent.bindAsEventListener(this));
        Event.observe(this.namelink,'mousedown', Utils.terminateEvent.bindAsEventListener(this));
        
        // setup the collapsed button
        Event.observe(this.expandbutton,
                                   'click',
                                   this.toggleCollapsed.bind(this));

        // setup the edit button
        Event.observe(this.editbutton,
                                   'click',
                                   this.edit.bindWithParams(this,true));

        // TODO DRY - consolidate these into a big list of element/event pairs
        // Setup action terminators
        // dragging on any of the buttons shouldn't drag the object
        Event.observe(this.expandbutton,
                                   'mousedown',
                                   Utils.terminateEvent.bindAsEventListener(this));

        // doubleclicking on any of the buttons shouldn't do anything
        Event.observe(this.expandbutton,
                                   'dblclick',
                                   Utils.terminateEvent.bindAsEventListener(this));

        Event.observe(this.editbutton,
                      'mouseover',function(){Element.addClassName(this.editbutton,'hover')}.bind(this));
        Event.observe(this.editbutton,
                      'mouseout',function(){Element.removeClassName(this.editbutton,'hover')}.bind(this));
    },

    // Select this object and terminate the event
    selectAndTerminate: function(e) {
        WiseObject.prototype.selectAndTerminate.call(this);
        this.namefield.focus();
    },

    // make this kernel into the current view (ie, switch the url to this kernel)
    makeView: function(e){
        window.location = this.kernel().object_url();
        Utils.terminateEvent(e);
    },

    // performs internal visual layout of the html elements for this kernel
    layout: function(){
        WiseObject.prototype.layout.call(this);
        this.layoutNamefield();
    },

    // causes the internal elements to resize if necessary
    layoutResize: function() {
        WiseObject.prototype.layoutResize.call(this);
        this.midleftbackground.style.width = (this.htmlElement.clientWidth -
                                             this.leftbackground.clientWidth -
                                             this.rightbackground.clientWidth -
                                             this.midrightbackground.clientWidth) + 'px';
        this.resizeChildren();
    },

    // Size the namefield appropriate
    layoutNamefield: function() {
        var width = KernelObject.prototype.layoutNamefield.call(this);
        this.setFixedSize(this.collapsed());
    },

    // Toggles whether the kernel is fixed width or not, and updates the width if it is.
    // Accepts:
    //   fixed - a boolean indicating whether the kernel should be fixed width
    setFixedSize: function(fixed){
        width = (this.getNameFieldWidth()+50);
        if(fixed){
            this.htmlElement.style.width = width+'px';
            this.htmlElement.style.height = '';
        } else {
            this.htmlElement.style.width = this.width() + '%';
            this.htmlElement.style.height = this.height() + '%';
        }

        this.layoutResize();
    },

    // Toggles whether the kernel is collapsed or not
    toggleCollapsed: function() {
        if(this.expandbutton.value == '-'){
            this.expandbutton.value = '+';
        } else {
            this.expandbutton.value = '-';
        }
        if(this.collapsed()){
            this.collapsed(false);
        } else {
            this.collapsed(true);
        }
        this.update();
    },

    // Just sets the internal collapsed value but don't change the display
    setCollapsed: function(collapsed) {
        return VisibleKernel.superclass.collapsed.call(this, collapsed);
    },

    // Set whether the kernel is collapsed
    collapsed: function(collapsed) {
        var results;
        if(collapsed == undefined) {
            // skip it
            results = VisibleKernel.superclass.collapsed.call(this);
            return results;
        } else if(collapsed){
            results = VisibleKernel.superclass.collapsed.call(this, 1);
            if(this.htmlElement){
                Element.removeClassName(this.htmlElement,'expanded');
                Element.addClassName(this.htmlElement,'collapsed');
                this.setFixedSize(true);
                dndMgr.moveToFront(this.htmlElement);
            }
            this.notifyEndChangeListeners();
        } else {
            results = VisibleKernel.superclass.collapsed.call(this, 0);
            if(this.htmlElement){
                Element.addClassName(this.htmlElement,'expanded');
                Element.removeClassName(this.htmlElement,'collapsed');
                this.setFixedSize(false);
                dndMgr.moveToFront(this.htmlElement);

                var vkernels = Utils.getElementsByClassName(this.body,'vkernel');
                var notes = Utils.getElementsByClassName(this.body,'note');
                if(this.kernel().has_children() &&
                   vkernels.length == 0 && notes.length == 0){        
                    this.hydrateChildren();
                }
            }
            this.notifyEndChangeListeners();
        }
        this.layoutResize();
        return results;
    },

    getMinHeight: function() {
        return 100;
    },

    getMinWidth: function() {
        var nameFieldWidth =  this.getNameFieldWidth()+50;
        return Math.max(nameFieldWidth,100);
    },

    edit: function(edit) {
        if(edit){
            Element.addClassName(this.htmlElement,'edit');
            Element.removeClassName(this.htmlElement,'noedit');
            this.namefield.focus();
        } else {
            Element.removeClassName(this.htmlElement,'edit');
            Element.addClassName(this.htmlElement,'noedit');
        }
    },

    deselect: function () {
        WiseObject.prototype.deselect.call(this);
        this.edit(false);
    }
});

var CustomDropzone = Class.create();

CustomDropzone.prototype = (new Dropzone()).extend( {

   initialize: function( htmlElement, vkernel ) {
        this.type        = 'Kernel';
        this.htmlElement = htmlElement;
        this.vkernel        = vkernel;
   },

   accept: function(draggableObjects) {
       for(var i=0;i<draggableObjects.length;i++){
           if(draggableObjects[i].type != 'Kernel' && draggableObjects[i].type != 'Note'){
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
