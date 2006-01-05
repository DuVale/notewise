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

    // line should be of the form [{x:0,y:0},{x:10,y:10}]
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
Relationship.prototype = {};
JSDBI.inherit(Relationship,new JSDBI());

Relationship.fields(['id',
                     'nav',
                     'part1',
                     'part2',
                     'type']);
Relationship.url('rest/relationship');
Relationship.elementTag('relationship');

Relationship.prototype.extend( {
    initialize: function (id,part1,part2,type,nav){
        this.__id=id;
        this.__part1=part1.contained_object();
        this.__part2=part2.contained_object();
        this.part1ContainedObject=part1;
        this.part2ContainedObject=part2;
        this.__type=type;
        this.__nav=nav;
        this.intersect1={x:0, y:0};
        this.intersect2={x:0, y:0};
        this.showArrow = [true, true];
        this.htmlElement = document.createElement('div');
        this.htmlElement.className='relationship notselected';
        this.htmlElement.id=this.idString();
        this.htmlElement.relationship=this;
        this.part1ContainedObject.htmlElement.parentNode.appendChild(this.htmlElement);
        this.line = new LineDraw.Line(this.part1ContainedObject.htmlElement.parentNode,
                                      (this.part1ContainedObject.x()+this.part1ContainedObject.currentWidth()/2)+'%',
                                      (this.part1ContainedObject.y()+this.part1ContainedObject.currentHeight()/2)+'%',
                                      (this.part2ContainedObject.x()+this.part2ContainedObject.currentWidth()/2)+'%',
                                      (this.part2ContainedObject.y()+this.part2ContainedObject.currentHeight()/2)+'%');
        this.createLabel();
        this.createButtons();
        this.createArrows();
        this.registerListeners();
    },

    idString: function() {
        return 'relationship'+this.part1ContainedObject+'/'+this.part2ContainedObject;
    },

    createLabel: function() {
        // this div holds the label and associated buttons, so they can be easily moved as a single unit
        this.labelDiv = document.createElement('div');
        this.labelDiv.className='labelDiv';
        this.htmlElement.appendChild(this.labelDiv);

        this.label = document.createElement('input');
        this.label.value = this.type();
        this.label.className = 'relationshipLabel';
        this.labelDiv.appendChild(this.label);
    },

    createButtons: function() {
        this.removeButton = document.createElement('input');
        this.removeButton.type='button';
        this.removeButton.className='removebutton';
        this.removeButton.value = 'X';
        this.labelDiv.appendChild(this.removeButton);

        this.hideButton = document.createElement('input');
        this.hideButton.type='button';
        this.hideButton.className='hidebutton';
        this.hideButton.value = 'H';
        this.labelDiv.appendChild(this.hideButton);
    },

    createArrows: function() {
        this.arrowCanvasElements = [];
        this.arrowCanvases = [];
        this.arrowDivs = [];
        for(var i=0; i < 2; i++){
            this.arrowDivs[i] = document.createElement('div');
            this.arrowDivs[i].className='arrowdiv';
            this.htmlElement.appendChild(this.arrowDivs[i]);

            this.arrowCanvasElements[i] = document.createElement('div');
            this.arrowCanvasElements[i].id='canvas'+i+'/'+this.idString();
            this.arrowCanvasElements[i].className='arrowcanvas';
            this.arrowDivs[i].appendChild(this.arrowCanvasElements[i]);
            this.arrowCanvases[i] = new jsGraphics('canvas'+i+'/'+this.idString());
        }
        this.updateArrows();
    },

    layoutResize: function() {
        this.updateArrows();
        this.updatePosition1();
        this.updatePosition2();
//        this.line.update();
    },

    updatePosition1: function(x,y){
        if(x == null || y == null){
            x = this.part1ContainedObject.x();
            y = this.part1ContainedObject.y();
        } else {
            x = Number(chopPx(arguments[1]));
            y = Number(chopPx(arguments[2]));
        }
        x = (x + this.part1ContainedObject.currentWidth(this.part1ContainedObject.oldParentNode)/2)+'%';
        y = (y + this.part1ContainedObject.currentHeight(this.part1ContainedObject.oldParentNode)/2)+'%';
        this.line.setP1(x,y);
    },

    updatePosition2: function(x,y){
        if(x == null || y == null){
            x = this.part2ContainedObject.x();
            y = this.part2ContainedObject.y();
        } else {
            x = Number(chopPx(arguments[1]));
            y = Number(chopPx(arguments[2]));
        }
        x = (x + this.part2ContainedObject.currentWidth(this.part2ContainedObject.oldParentNode)/2)+'%';
        y = (y + this.part2ContainedObject.currentHeight(this.part2ContainedObject.oldParentNode)/2)+'%';
        this.line.setP2(x,y);
    },

    updateArrows: function() {
        this.moveArrows();
        this.arrowCanvases[0].clear();
        this.arrowCanvases[0].setColor("#000000");
        this.arrowCanvases[1].clear();
        this.arrowCanvases[1].setColor("#000000");

        var vkernel1Pos = Utils.toViewportPosition(this.part1ContainedObject.htmlElement);
        var vkernel2Pos = Utils.toViewportPosition(this.part2ContainedObject.htmlElement);

        var angle = Math.atan2(vkernel2Pos.y+this.part2ContainedObject.htmlElement.clientHeight/2
                               - (vkernel1Pos.y+this.part1ContainedObject.htmlElement.clientHeight/2),
                               vkernel1Pos.x + this.part1ContainedObject.htmlElement.clientWidth/2
                               - (vkernel2Pos.x+this.part2ContainedObject.htmlElement.clientWidth/2));

        if(this.nav() == 'fromleft'
           || this.nav() == 'bi'){
            this.drawArrow(this.arrowCanvases[0],17,17,angle);
            this.arrowCanvases[0].paint();
        }
        if(this.nav() == 'fromright'
           || this.nav() == 'bi'){
            this.drawArrow(this.arrowCanvases[1],17,17,angle+Math.PI);
            this.arrowCanvases[1].paint();
        }
        this.justUpdatedArrows=true;
        this.needUpdateArrows=false;
    },

    moveLabelDiv: function(x,y) {
        this.labelDiv.style.left=(x)+'%';
        this.labelDiv.style.top=(y)+'%';
    },

    moveArrows: function() {
        // figure out the intersection between each box and the line between them
        var rect1 = new Rectangle(this.part1ContainedObject.x(),
                                  this.part1ContainedObject.y(),
                                  this.part1ContainedObject.currentWidth(),
                                  this.part1ContainedObject.currentHeight());
        var rect2 = new Rectangle(this.part2ContainedObject.x(),
                                  this.part2ContainedObject.y(),
                                  this.part2ContainedObject.currentWidth(),
                                  this.part2ContainedObject.currentHeight());

        line = [{x: this.part1ContainedObject.x()+this.part1ContainedObject.currentWidth()/2,
                 y: this.part1ContainedObject.y()+this.part1ContainedObject.currentHeight()/2},
                {x: this.part2ContainedObject.x()+this.part2ContainedObject.currentWidth()/2,
                 y: this.part2ContainedObject.y()+this.part2ContainedObject.currentHeight()/2}];

        this.intersect1 = rect1.getLineIntersect(line);
        this.intersect2 = rect2.getLineIntersect(line);

        if(this.intersect1){
            this.arrowDivs[0].style.left=(this.intersect1.x)+'%';
            this.arrowDivs[0].style.top=(this.intersect1.y)+'%';
        }
        if(this.intersect2){
            this.arrowDivs[1].style.left=(this.intersect2.x)+'%';
            this.arrowDivs[1].style.top=(this.intersect2.y)+'%';
        }
        if(this.intersect1 && this.intersect2){
            var x=Math.min(this.intersect1.x,this.intersect2.x)+Math.abs(this.intersect2.x-this.intersect1.x)/2;
            var y=Math.min(this.intersect1.y,this.intersect2.y)+Math.abs(this.intersect2.y-this.intersect1.y)/2;
            this.moveLabelDiv(x,y);
        }
    },

    // draws an arrow with the point of the arow at the x and y coordinates specified, with the angle specified.  A zero angle means the arrow is pointing to the right
    drawArrow: function(canvas, x, y, theta) {
        var coords = [[-15,0,-15], [-7,0,7]];
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
        this.part1ContainedObject.addStartChangeListener(this.startChange.bind(this));
        this.part2ContainedObject.addStartChangeListener(this.startChange.bind(this));
        this.part1ContainedObject.addEndChangeListener(this.endChange.bind(this));
        this.part2ContainedObject.addEndChangeListener(this.endChange.bind(this));

        Utils.registerEventListener(this.label,
                                    'mousedown',
                                    Utils.terminateEvent.bindAsEventListener(this));

        Utils.registerEventListener(this.label,
                                    'click',
                                    this.selectAndTerminate.bindAsEventListener(this));
        Utils.registerEventListener(this.label,
                                    'blur',
                                    this.recordLabel.bindAsEventListener(this));

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

        this.part1ContainedObject.addMoveListener(this.updatePosition1.bind(this));
        this.part1ContainedObject.addSizeListener(this.updatePosition1.bind(this));
        this.part2ContainedObject.addMoveListener(this.updatePosition2.bind(this));
        this.part2ContainedObject.addSizeListener(this.updatePosition2.bind(this));
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
        if(this.nav() == 'fromleft'){
            this.nav('non');
        } else if(this.nav() == 'non'){
            this.nav('fromleft');
        } else if(this.nav() == 'fromright'){
            this.nav('bi');
        } else if(this.nav() == 'bi'){
            this.nav('fromright');
        }
        this.updateArrows();
        this.update();
    },

    arrow2click: function(e){
        if(this.nav() == 'fromright'){
            this.nav('non');
        } else if(this.nav() == 'non'){
            this.nav('fromright');
        } else if(this.nav() == 'fromleft'){
            this.nav('bi');
        } else if(this.nav() == 'bi'){
            this.nav('fromleft');
        }
        this.updateArrows();
        this.update();
    },

    recordLabel: function(e){
        this.type(this.label.value);
        this.update();
    },

    startChange: function(vkernel) {
        //hide arrows and label
        this.labelDiv.style.display='none';
        this.arrowCanvasElements[0].style.display='none';
        this.arrowCanvasElements[1].style.display='none';
    },

    endChange: function(vkernel) {
        this.updatePosition1();
        this.updatePosition2();

        this.labelDiv.style.display='inline';
        this.updateArrows();
        this.arrowCanvasElements[0].style.display='block';
        this.arrowCanvasElements[1].style.display='block';
    },

    selectAndTerminate: function(e) {
        dndMgr.updateSelection(this,false);
        this.label.focus();
        Utils.terminateEvent(e);
    },

    // Select this relationship
    select: function () {
        if( !this.isSelected() ){
          Element.removeClassName(this.htmlElement, 'notselected');
          Element.addClassName(this.htmlElement, 'selected');
        }
    },

    // Mark this relationship as not selected
    deselect: function () {
        if( this.isSelected()){
            Element.removeClassName(this.htmlElement, 'selected');
            Element.addClassName(this.htmlElement, 'notselected');
        }
    },

    // Returns whether or not this relationship is currently selected
    isSelected: function () {
        return Element.hasClassName(this.htmlElement, 'selected');
    }
});
