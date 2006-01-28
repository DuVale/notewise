// TODO this has code from rico - need to make sure we comply with license
var Utils;

Utils = {
    registerEventListener: function(element,event,eventListener){
        if ( typeof document.implementation != "undefined" &&
             document.implementation.hasFeature("HTML",   "1.0") &&
             document.implementation.hasFeature("Events", "2.0") &&
             document.implementation.hasFeature("CSS",    "2.0") ) {
            element.addEventListener(event, eventListener, false);
        } else {
            element.attachEvent("on"+event, eventListener);
        }
    },

    // Kills the event so it doesn't propogate up the component hierarchy
    terminateEvent: function(e) {
        dndMgr._terminateEvent(e);
    },

    // Clear the selection (resetting focus to the search box) and terminate the event
    clearSelectionAndTerminate: function(e){
        Utils.terminateEvent(e);
        Utils.preventDefault(e);
        dndMgr.clearSelection();
        dndMgr.giveSearchBoxFocus();
    },

    // prevents the default browser action for this event from occuring
    preventDefault: function(e) {
        if ( e.preventDefault != undefined )
           e.preventDefault();
        else
           e.returnValue = false;
    },


    getElementsByClassName: function(parentElement,className) {
      var children = parentElement.childNodes;
      var elements = new Array();
      
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if(child.className !== undefined){
            var classNames = child.className.split(' ');
            for (var j = 0; j < classNames.length; j++) {
              if (classNames[j] == className) {
                elements.push(child);
                break;
              }
            }
        }
      }
      
      return elements;
    },

    // Tests to see if this element has the given element as a parent
    hasAncestor: function(childElement, parentElement) {
        if(childElement == null || parentElement == null){
            return false;
        }
        var element = childElement;
        while(element != document){
            if(element == parentElement){
                return true;
            }
            element = element.parentNode;
        }
        return false;
    },

    getElementsComputedStyle: function ( htmlElement, cssProperty, mozillaEquivalentCSS) {
       if ( arguments.length == 2 )
          mozillaEquivalentCSS = cssProperty;

       var el = $(htmlElement);
       if ( el.currentStyle )
          return el.currentStyle[cssProperty];
       else
          return document.defaultView.getComputedStyle(el, null).getPropertyValue(mozillaEquivalentCSS);
    },

    toViewportPosition: function(element) {
       return this._toAbsolute(element,true);
    },

    toDocumentPosition: function(element) {
       var elementPosition = this._toAbsolute(element,false);
       var parentPosition = this._toAbsolute(element.offsetParent);
       return {x: elementPosition.x-parentPosition.x,
               y: elementPosition.y-parentPosition.y};
    },

    /**
     *  Compute the elements position in terms of the window viewport
     *  so that it can be compared to the position of the mouse (dnd)
     *  This is additions of all the offsetTop,offsetLeft values up the
     *  offsetParent hierarchy, ...taking into account any scrollTop,
     *  scrollLeft values along the way...
     *
     * IE has a bug reporting a correct offsetLeft of elements within a
     * a relatively positioned parent!!!
     **/
    _toAbsolute: function(element,accountForDocScroll) {

       if ( navigator.userAgent.toLowerCase().indexOf("msie") == -1 )
          return this._toAbsoluteMozilla(element,accountForDocScroll);

       var x = 0;
       var y = 0;
       var parent = element;
       while ( parent ) {

          var borderXOffset = 0;
          var borderYOffset = 0;
          if ( parent != element ) {
             var borderXOffset = parseInt(this.getElementsComputedStyle(parent, "borderLeftWidth" ));
             var borderYOffset = parseInt(this.getElementsComputedStyle(parent, "borderTopWidth" ));
             borderXOffset = isNaN(borderXOffset) ? 0 : borderXOffset;
             borderYOffset = isNaN(borderYOffset) ? 0 : borderYOffset;
          }

          x += parent.offsetLeft - parent.scrollLeft + borderXOffset;
          y += parent.offsetTop - parent.scrollTop + borderYOffset;
          parent = parent.offsetParent;
       }

       if ( accountForDocScroll ) {
          x -= this.docScrollLeft();
          y -= this.docScrollTop();
       }

       return { x:x, y:y };
    },

    /**
     *  Mozilla did not report all of the parents up the hierarchy via the
     *  offsetParent property that IE did.  So for the calculation of the
     *  offsets we use the offsetParent property, but for the calculation of
     *  the scrollTop/scrollLeft adjustments we navigate up via the parentNode
     *  property instead so as to get the scroll offsets...
     *
     **/
    _toAbsoluteMozilla: function(element,accountForDocScroll) {
       var x = 0;
       var y = 0;
       var parent = element;
       while ( parent ) {
          x += parent.offsetLeft;
          y += parent.offsetTop;
          parent = parent.offsetParent;
       }

       parent = element;
       while ( parent &&
               parent != document.body &&
               parent != document.documentElement ) {
          if ( parent.scrollLeft  )
             x -= parent.scrollLeft;
          if ( parent.scrollTop )
             y -= parent.scrollTop;
          parent = parent.parentNode;
       }

       if ( accountForDocScroll ) {
          x -= this.docScrollLeft();
          y -= this.docScrollTop();
       }

       return { x:x, y:y };
    },

    docScrollLeft: function() {
       if ( window.pageXOffset )
          return window.pageXOffset;
       else if ( document.documentElement && document.documentElement.scrollLeft )
          return document.documentElement.scrollLeft;
       else if ( document.body )
          return document.body.scrollLeft;
       else
          return 0;
    },

    docScrollTop: function() {
       if ( window.pageYOffset )
          return window.pageYOffset;
       else if ( document.documentElement && document.documentElement.scrollTop )
          return document.documentElement.scrollTop;
       else if ( document.body )
          return document.body.scrollTop;
       else
          return 0;
    },

    // fetches the current value for a property, even if there wasn't one explicitly set.
    // styleProp should be of the form "font-size" not "fontSize"
    getStyle: function(el,styleProp) {
	if (el.currentStyle){
		var y = el.currentStyle[styleProp];
	}else if (window.getComputedStyle){
		var y = document.defaultView.getComputedStyle(el,null).getPropertyValue(styleProp);
        }

        if (y === undefined){
            // must be internet explorer
            var words = styleProp.split('-');
            styleProp=words[0];
            for(var i=1; i < words.length; i++){
                styleProp = styleProp + words[i].substr(0,1).toUpperCase() + words[i].substr(1);
            }
            return this.getStyle(el,styleProp);
        } else {
            return y;
        }
    },

    cumulativeOffsetWithBorders: function(element) {
        var valueT = 0, valueL = 0;
        do {
            valueT += element.offsetTop  || 0;
            valueT += Utils.chopPx(Utils.getStyle(element,'border-top-width'))  || 0;
            valueL += element.offsetLeft || 0;
            valueL += Utils.chopPx(Utils.getStyle(element,'border-left-width'))  || 0;
            element = element.offsetParent;
        } while (element);
        return [valueL, valueT];
    },

    // chops any 'px' or '%' from the end of the string and returns a number
    chopPx: function (str) {
        return Number(str.replace(/[a-z%]+/i, ''));
    },

    // TODO refactor everything to use this
    getEventPosition: function(e){
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
        return {x: posx, y: posy};
    }
};
