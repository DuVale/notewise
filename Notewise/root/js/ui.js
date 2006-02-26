function expandMenu(button, paneId) {
    var pane = document.getElementById(paneId);
    var sandbox_container = document.getElementById('sandbox_container');
    var sandbox = document.getElementById('sandbox');
    
    var opts = {
        duration: 50,
        onComplete: function () {
            sandbox_container.style.height = "100%";
            sandbox.style.height = "100%"; 
        }
    }
    
//    if(pane.__expand == null) {
//        pane.__expand = new fx.Height(pane, opts);
//    }

//    pane.__expand.toggle();
    if(Element.hasClassName(pane,'open')) {
        Element.removeClassName(pane, 'open');
        Element.addClassName(pane, 'closed');
        Element.removeClassName(button, 'open');
        Element.addClassName(button, 'closed');
        pane.style.borderBottom = "0";
    } else {
        Element.removeClassName(pane, 'closed');
        Element.addClassName(pane, 'open');
        Element.removeClassName(button, 'closed');
        Element.addClassName(button, 'open');
        pane.style.borderBottom = "1px solid #bebebe";
    }
    
    sandbox.style.height = "100%";
}
