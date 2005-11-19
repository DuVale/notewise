var Rectangle = Class.create();
Rectangle.prototype = {
    initialize: function(x,y,w,h){
        this.x=x;
        this.y=y;
        this.w=w;
        this.h=h;
    },

    getCenter: function (){
        return {x: this.x+this.w/2,
                y: this.y+this.h/2};
    },

    // line should be of the form Array({x:0,y:0},{x:10,y:10})
    // returns intersect point of the form {x: 2, y:4}
    getLineIntersect: function(line) {
        // deal with perfectly vertical lines
        if(line[0].x == line[1].x){
            var side = this.y;
            var lineMinY = Math.min(line[0].y,line[1].y);
            var lineMaxY = Math.max(line[0].y,line[1].y);
            if(lineMinY < side
               && lineMaxY >= side){
                return {x: line[0].x, y: side};
            }
            side = this.y+this.h;
            if(lineMinY <= side
               && lineMaxY >= side){
                return {x: line[0].x, y: side};
            }
            return undefined; // no intersection
        }

        // figure out equation for line y=ax+b
        var a = (line[1].y - line[0].y)/(line[1].x - line[0].x);
        var b = line[0].y - a*line[0].x;

        var lineMinX = Math.min(line[0].x,line[1].x);
        var lineMaxX = Math.max(line[0].x,line[1].x);
        var lineMinY = Math.min(line[0].y,line[1].y);
        var lineMaxY = Math.max(line[0].y,line[1].y);

        // look at vertical sides first
        var side = this.x;
        var y = a*side+b;
        if(lineMinX <= side
           && lineMaxX >= side
           && y >= this.y && y <= (this.y + this.h)){
            // line intersects left side
            var intersect = {x: side, y: y};
            return intersect;
        }

        side = this.x+this.w;
        y = a*(side)+b;
        if(lineMinX <= side
           && lineMaxX >= side
           && y >= this.y && y <= (this.y + this.h)){
            // line intersects right side
            var intersect = {x: side, y: y};
            return intersect;
        }

        // look at the horizontal sides
        side=this.y;
        var x=(side-b)/a;
        if(lineMinY <= side
           && lineMaxY >= side
           && x >= this.x && x <= (this.x + this.w)){
            // line intersects top
            var intersect = {x: x, y: this.y};
            return intersect;
        }
        side=this.y+this.h;
        var x=(side-b)/a;
        if(lineMinY <= side
           && lineMaxY >= side
           && x >= this.x && x <= (this.x + this.w)){
            // line intersects bottom
            var intersect = {x: x, y: side};
            return intersect;
        }
        return undefined;
    }
};


var Relationship = Class.create();
Relationship.extend(JSDBI);
Relationship.superclass = JSDBI;

// TODO 
//Relationship.fields(['container_object',
//                      'contained_object',
//                      'collapsed',
//                      'height',
//                      'width',
//                      'x',
//                      'y']);
//Relationship.primaryKeys(['container_object', 'contained_object']);
//Relationship.url('/rest/vkernel');
//Relationship.elementTag('visiblekernel');
Relationship.prototype = (new JSDBI()).extend( {
    initialize: function (vkernel1,vkernel2){
        this.vkernel1=vkernel1;
        this.vkernel2=vkernel2;
        this.htmlElement = document.createElement('div');
        this.htmlElement.className='relationship';
        this.htmlElement.id=this.idString();
        this.vkernel1.htmlElement.parentNode.appendChild(this.htmlElement);
        this.line = new LineDraw.Line(this.htmlElement,
                                      this.vkernel1.x()+this.vkernel1.width()/2,
                                      this.vkernel1.y()+this.vkernel1.height()/2,
                                      this.vkernel2.x()+this.vkernel2.width()/2,
                                      this.vkernel2.y()+this.vkernel2.height()/2);
        this.createLabel();
        this.createButtons();
        this.createArrows();
        this.registerListeners();
        this.intersect1={x:0, y:0};
        this.intersect2={x:0, y:0};
//        this.line.img.style.border='1px solid red';
    },

    idString: function() {
        return 'relationship'+this.vkernel1.idString()+'/'+this.vkernel2.idString();
    },

    createLabel: function() {
        // this div holds the label and associated buttons, so they can be easily moved as a single unit
        this.labelDiv = document.createElement('div');
        this.labelDiv.className='labelDiv selected';
        this.labelDiv.style.position='absolute';
        this.labelDiv.style.border='1px solid purple';
        this.htmlElement.appendChild(this.labelDiv);

        this.label = document.createElement('input');
        this.label.value = 'asdfasdfasdfas';
        this.label.style.position='absolute';
        this.label.style.width='100px';
        this.label.style.height='20px';
        this.label.style.background='white';
        this.label.style.border='0px solid black';
        this.label.style.textAlign='center';
        this.labelDiv.appendChild(this.label);
        this.label.style.top='-10px';
        this.label.style.left='-50px';
    },

    createButtons: function() {
        // TODO most of this crap should go in the stylesheet
        this.removeButton = document.createElement('input');
        this.removeButton.type='button';
        this.removeButton.className='removebutton';
        this.removeButton.value = 'X';
        this.removeButton.style.position='absolute';
        this.removeButton.style.width='20px';
        this.removeButton.style.height='20px';
        this.removeButton.style.padding='0px';
        this.removeButton.style.background='blue';
        this.removeButton.style.color='white';
        this.labelDiv.appendChild(this.removeButton);
        this.removeButton.style.left='55px';
        this.removeButton.style.top='-12px';

        this.hideButton = document.createElement('input');
        this.hideButton.type='button';
        this.hideButton.className='hidebutton';
        this.hideButton.value = 'H';
        this.hideButton.style.position='absolute';
        this.hideButton.style.width='20px';
        this.hideButton.style.height='20px';
        this.hideButton.style.padding='0px';
        this.hideButton.style.background='blue';
        this.hideButton.style.color='white';
        this.labelDiv.appendChild(this.hideButton);
        this.hideButton.style.left='-75px';
        this.hideButton.style.top='-12px';
    },

    createArrows: function() {
        this.arrowCanvasElements = new Array();
        this.arrowCanvases = new Array();
        for(var i=0; i < 2; i++){
            this.arrowCanvasElements[i] = document.createElement('div'); this.arrowCanvasElements[i].id='canvas'+i+'/'+this.idString();
            this.htmlElement.appendChild(this.arrowCanvasElements[i]);
//            this.arrowCanvasElements[i].style.border = '1px solid green';
            this.arrowCanvasElements[i].style.width = '34px';
            this.arrowCanvasElements[i].style.height = '34px';
            this.arrowCanvasElements[i].style.position = 'absolute';
            this.arrowCanvases[i] = new jsGraphics('canvas'+i+'/'+this.idString());
        }
        this.updateArrows();
   },

    updatePosition1: function(){
        this.line.setP1(this.vkernel1.x()+this.vkernel1.width()/2,
                        this.vkernel1.y()+this.vkernel1.height()/2);
    },

    updatePosition2: function(){
        this.line.setP2(this.vkernel2.x()+this.vkernel2.width()/2,
                        this.vkernel2.y()+this.vkernel2.height()/2);
    },

    updateArrows: function() {
        this.moveArrows();
        this.arrowCanvases[0].clear();
        this.arrowCanvases[0].setColor("#000000");
        this.arrowCanvases[1].clear();
        this.arrowCanvases[1].setColor("#000000");

        var angle = Math.atan2(this.vkernel2.y()+this.vkernel2.height()/2 - (this.vkernel1.y()+this.vkernel1.height()/2),
                               this.vkernel1.x()+this.vkernel1.width()/2- (this.vkernel2.x()+this.vkernel2.width()/2));

        this.drawArrow(this.arrowCanvases[0],17,17,angle);
        this.arrowCanvases[0].paint();
        this.drawArrow(this.arrowCanvases[1],17,17,angle+Math.PI);
        this.arrowCanvases[1].paint();
        this.justUpdatedArrows=true;
        this.needUpdateArrows=false;
    },

    moveLabelDiv: function(x,y) {
        this.labelDiv.style.left=(x)+'px';
        this.labelDiv.style.top=(y)+'px';
    },

    moveArrows: function() {
        // figure out the intersection between each box and the line between them
        var rect1 = new Rectangle(this.vkernel1.x(),
                                  this.vkernel1.y(),
                                  this.vkernel1.width(),
                                  this.vkernel1.height());
        var rect2 = new Rectangle(this.vkernel2.x(),
                                  this.vkernel2.y(),
                                  this.vkernel2.width(),
                                  this.vkernel2.height());

        line = new Array({x: this.vkernel1.x()+this.vkernel1.width()/2,
                          y: this.vkernel1.y()+this.vkernel1.height()/2},
                         {x: this.vkernel2.x()+this.vkernel2.width()/2,
                          y: this.vkernel2.y()+this.vkernel2.height()/2});

        this.intersect1 = rect1.getLineIntersect(line);
        this.intersect2 = rect2.getLineIntersect(line);

        if(this.intersect1){
            this.arrowCanvasElements[0].style.left=(this.intersect1.x-17)+'px';
            this.arrowCanvasElements[0].style.top=(this.intersect1.y-17)+'px';
        }
        if(this.intersect2){
            this.arrowCanvasElements[1].style.left=(this.intersect2.x-17)+'px';
            this.arrowCanvasElements[1].style.top=(this.intersect2.y-17)+'px';
        }
        if(this.intersect1 && this.intersect2){
            var x=Math.min(this.intersect1.x,this.intersect2.x)+Math.abs(this.intersect2.x-this.intersect1.x)/2;
            var y=Math.min(this.intersect1.y,this.intersect2.y)+Math.abs(this.intersect2.y-this.intersect1.y)/2;
            this.moveLabelDiv(x,y);
        }
    },

    // draws an arrow with the point of the arow at the x and y coordinates specified, with the angle specified.  A zero angle means the arrow is pointing to the right
    drawArrow: function(canvas, x, y, theta) {
        var coords = new Array(new Array(-15,0,-15), new Array(-7,0,7));
        this.rotate(coords,theta);
        this.translate(coords,x,y);
        canvas.fillPolygon(coords[0], coords[1]);
    },

    translate: function(coords,x,y){
        for(var i=0; i<coords[0].length; i++){
            coords[0][i] += x;
            coords[1][i] += y;
        }
        return coords;
    },

    rotate: function(coords,theta){
        for(var i=0; i<coords[0].length; i++){
            var cos = Math.cos(theta);
            var sin = Math.sin(theta);
            var x = coords[0][i];
            var y = coords[1][i];
            coords[0][i]=cos*x + sin*y;
            coords[1][i]=-sin*x + cos*y;
        }
        return coords;
    },

    registerListeners: function() {
        this.vkernel1.addStartChangeListener(this.startChange.bind(this));
        this.vkernel2.addStartChangeListener(this.startChange.bind(this));
        this.vkernel1.addEndChangeListener(this.endChange.bind(this));
        this.vkernel2.addEndChangeListener(this.endChange.bind(this));

        Utils.registerEventListener(this.label,
                                    'mousedown',
                                    Utils.terminateEvent.bindAsEventListener(this));

        Utils.registerEventListener(this.label,
                                    'click',
                                    this.selectAndTerminate.bindAsEventListener(this));

        Utils.registerEventListener(this.removeButton,
                                    'mousedown',
                                    Utils.terminateEvent.bindAsEventListener(this));
        Utils.registerEventListener(this.removeButton,
                                    'dblclick',
                                    Utils.terminateEvent.bindAsEventListener(this));
        Utils.registerEventListener(this.removeButton,
                                    'click',
                                    this.removeButtonClick.bindAsEventListener(this));

        Utils.registerEventListener(this.hideButton,
                                    'mousedown',
                                    Utils.terminateEvent.bindAsEventListener(this));
        Utils.registerEventListener(this.hideButton,
                                    'dblclick',
                                    Utils.terminateEvent.bindAsEventListener(this));
        Utils.registerEventListener(this.hideButton,
                                    'click',
                                    this.hideButtonClick.bindAsEventListener(this));

        Utils.registerEventListener(this.arrowCanvasElements[0],
                                    'mousedown',
                                    Utils.terminateEvent.bindAsEventListener(this));
        Utils.registerEventListener(this.arrowCanvasElements[0],
                                    'dblclick',
                                    Utils.terminateEvent.bindAsEventListener(this));
        Utils.registerEventListener(this.arrowCanvasElements[0],
                                    'click',
                                    this.arrow1click.bindAsEventListener(this));

        Utils.registerEventListener(this.arrowCanvasElements[1],
                                    'mousedown',
                                    Utils.terminateEvent.bindAsEventListener(this));
        Utils.registerEventListener(this.arrowCanvasElements[1],
                                    'dblclick',
                                    Utils.terminateEvent.bindAsEventListener(this));
        Utils.registerEventListener(this.arrowCanvasElements[1],
                                    'click',
                                    this.arrow2click.bindAsEventListener(this));

        this.vkernel1.addMoveListener(this.updatePosition1.bind(this));
        this.vkernel1.addSizeListener(this.updatePosition1.bind(this));
        this.vkernel2.addMoveListener(this.updatePosition2.bind(this));
        this.vkernel2.addSizeListener(this.updatePosition2.bind(this));
    },

    hideButtonClick: function(e){
        // TODO
        alert("got click on hide button");
    },

    removeButtonClick: function(e){
        // TODO
        alert("got click on remove button");
    },

    arrow1click: function(e){
        // TODO
        alert("got click on arrow 1");
    },

    arrow2click: function(e){
        // TODO
        alert("got click on arrow 2");
    },

    startChange: function(vkernel) {
        window.status = "got start drag";
        //hide arrows and label
        this.labelDiv.style.display='none';
        this.arrowCanvasElements[0].style.display='none';
        this.arrowCanvasElements[1].style.display='none';
    },

    endChange: function(vkernel) {
        window.status = "got end drag";

        this.line.setP1(this.vkernel1.x()+this.vkernel1.width()/2,
                        this.vkernel1.y()+this.vkernel1.height()/2);
        this.line.setP2(this.vkernel2.x()+this.vkernel2.width()/2,
                        this.vkernel2.y()+this.vkernel2.height()/2);

        this.labelDiv.style.display='inline';
        this.updateArrows();
        this.arrowCanvasElements[0].style.display='block';
        this.arrowCanvasElements[1].style.display='block';
    },

    selectAndTerminate: function(e) {
        SelectionManager.clearSelection();
        this.select();
        this.label.focus();
        Utils.terminateEvent(e);
    },

    // Select this relationship
    select: function () {
        if( !this.isSelected() ){
            this.htmlElement.className += ' selected';
        }
    },

    // Mark this relationship as not selected
    deselect: function () {
        if( this.isSelected()){
            this.htmlElement.className = this.htmlElement.className.replace(/ selected|selected /, '');
        }
    },

    // Returns whether or not this relationship is currently selected
    isSelected: function () {
        return this.htmlElement.className.indexOf('selected') != -1;
    },
});
