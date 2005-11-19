NewRelationship = Class.create();

NewRelationship.prototype = {
    initialize: function () {
        this.inDrag = false;
    },

    initializeEventHandlers: function () {
        if ( typeof document.implementation != "undefined" &&
            document.implementation.hasFeature("HTML",   "1.0") &&
            document.implementation.hasFeature("Events", "2.0") &&
            document.implementation.hasFeature("CSS",    "2.0") ) {
            document.addEventListener("mouseup",   this._mouseUpHandler.bindAsEventListener(this),  false);
            document.addEventListener("mousemove", this._mouseMoveHandler.bindAsEventListener(this), false);
        }
        else {
            document.attachEvent( "onmouseup",   this._mouseUpHandler.bindAsEventListener(this) );
            document.attachEvent( "onmousemove", this._mouseMoveHandler.bindAsEventListener(this) );
        }
    },

    startDrag: function(e,visible_kernel) {
        this.inDrag=true;
        this.startVisibleKernel=visible_kernel;
        // get the start point
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
        // the visible kernel coords are probably off - they need the parent's screen position not the relative coords
        var startX = visible_kernel.htmlElement.offsetLeft + visible_kernel.htmlElement.clientWidth/2;
        var startY = visible_kernel.htmlElement.offsetTop;
        var parent = this.startVisibleKernel.htmlElement.parentNode;
        var parentPos = RicoUtil.toViewportPosition(parent);
        var parentX = document.getElementById('background').offsetLeft;
        var parentY = document.getElementById('background').offsetTop;
        this.line = new LineDraw.Line(visible_kernel.htmlElement.parentNode,
                                      startX,
                                      startY,
                                      posx-parentPos.x,
                                      posy-parentPos.y
                                     );
        this.line.img.style.zIndex = 100;
    },

    _mouseUpHandler: function (e) {
        if(this.inDrag){
            this.inDrag = false;
            // get the start point
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

            var siblings = this.startVisibleKernel.htmlElement.parentNode.childNodes;
            for(var i=0; i<siblings.length; i++){
                var element = siblings[i];
                if(element.id && element.id.indexOf('vkernel') != -1){
                    var pos = RicoUtil.toViewportPosition(element);
                    var top = pos.y;
                    var left = pos.x;
                    var bottom = pos.y + element.offsetHeight;
                    var right = pos.x + element.offsetWidth;
                    if(posx > left && posx < right
                       && posy > top && posy < bottom){
                        alert("dropped inside "+element.id);
                    }
                }
            }

            this.line.destroy();
        }
    },

    _mouseMoveHandler: function (e) {
        if(!this.inDrag){
            return;
        }
        // get the start point
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
        var parent = this.startVisibleKernel.htmlElement.parentNode;
        var parentPos = RicoUtil.toViewportPosition(parent);
        var x = posx-parentPos.x;
        var y = posy-parentPos.y;
        x = Math.max(0,x);
        x = Math.min(x,parent.clientWidth);
        y = Math.max(0,y);
        y = Math.min(y,parent.clientHeight);
        this.line.setP2(x,y);
    }
}

newRelationship = new NewRelationship();
newRelationship.initializeEventHandlers();
