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
	
	if(pane.__expand == null) {
		pane.__expand = new fx.Height(pane, opts);
	}

	pane.__expand.toggle();
	if(pane.hidden) {
	    button.className = "twistbutton closed";
	    pane.style.borderBottom = "0";
	} else {
            // TODO switch this for the regex version in visiblekernel.js
	    button.className = "twistbutton";
        pane.style.borderBottom = "1px solid #bebebe;";
    }
    
	sandbox.style.height = "100%"
}

function resizeMenu_drag(paneId, event) {
    var pane = document.getElementById(paneId);
    alert("," + document.screen.y);
}
