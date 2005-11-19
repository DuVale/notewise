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
        var element = childElement;
        while(element != document){
            if(element == parentElement){
                return true;
            }
            element = element.parentNode;
        }
        return false;
    }

};
