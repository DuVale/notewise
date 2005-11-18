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
        this.htmlElement.style.width='1000px';
        this.htmlElement.style.height='1000px';
        this.htmlElement.id=this.idString();
        this.vkernel1.htmlElement.parentNode.appendChild(this.htmlElement);
        this.line = new LineDraw.Line(this.htmlElement,
                                      this.vkernel1.x()+this.vkernel1.width()/2,
                                      this.vkernel1.y()+this.vkernel1.height()/2,
                                      this.vkernel2.x()+this.vkernel2.width()/2,
                                      this.vkernel2.y()+this.vkernel2.height()/2);
        this.registerListeners();
        this.createLabel();
        this.createArrows();

        // indicates whether a request is pending to update the arrows
        this.needUpdateArrows = false;
        
        // indicates whether we've just updated the arrows, and it would be too soon to update them again
        this.justUpdatedArrows = false;
    },

    idString: function() {
        return 'relationship'+this.vkernel1.idString()+'/'+this.vkernel2.idString();
    },

    createLabel: function() {
        this.label = document.createElement('input');
        this.label.style.position='absolute';
        this.label.style.width='100px';
        this.label.style.height='20px';
        this.label.style.background='white';
        this.label.style.border='1px solid black';
        this.label.style.textAlign='center';
        this.vkernel1.registerEventListener(this.label,
                                   'mousedown',
                                   vkernel1.terminateEvent.bindAsEventListener(this));
        this.htmlElement.appendChild(this.label);
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
        this.updateArrows();
    },

    updatePosition2: function(){
        this.line.setP2(this.vkernel2.x()+this.vkernel2.width()/2,
                        this.vkernel2.y()+this.vkernel2.height()/2);
        this.updateArrows();
    },

    updateArrows: function() {
        this.moveArrows();
        if(this.needUpdateArrows){
            // we've already got an update request pending, so don't do anything
            return;
        } else {
            if(this.justUpdatedArrows){
                // we just updated the arrows, so queue the request
                this.needUpdateArrows = true;
            } else {
                // we haven't updated the arrows, so we can do it right away
                this.doUpdateArrows();
                // TODO make a constant from this magic number (time between updates of arrows)
                window.setTimeout(this.resetJustUpdatedArrows.bind(this),300);
            }
        }
    },

    resetJustUpdatedArrows: function() {
        if(this.needUpdateArrows){
            this.doUpdateArrows();
        }
        this.justUpdatedArrows = false;
    },

    moveLabel: function(x,y) {
        this.label.style.left=(x-this.label.clientWidth/2)+'px';
        this.label.style.top=(y-this.label.clientHeight/2)+'px';
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

        var intersect1 = rect1.getLineIntersect(line);
        var intersect2 = rect2.getLineIntersect(line);

        if(intersect1){
            this.arrowCanvasElements[0].style.left=(intersect1.x-17)+'px';
            this.arrowCanvasElements[0].style.top=(intersect1.y-17)+'px';
        }
        if(intersect2){
            this.arrowCanvasElements[1].style.left=(intersect2.x-17)+'px';
            this.arrowCanvasElements[1].style.top=(intersect2.y-17)+'px';
        }
        if(intersect1 && intersect2){
            var x=Math.min(intersect1.x,intersect2.x)+Math.abs(intersect2.x-intersect1.x)/2;
            var y=Math.min(intersect1.y,intersect2.y)+Math.abs(intersect2.y-intersect1.y)/2;
            this.moveLabel(x,y);
        }
    },

    doUpdateArrows: function() {
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
        this.vkernel1.addMoveListener(this.updatePosition1.bind(this));
        this.vkernel1.addSizeListener(this.updatePosition1.bind(this));
        this.vkernel2.addMoveListener(this.updatePosition2.bind(this));
        this.vkernel2.addSizeListener(this.updatePosition2.bind(this));
    },

//    getIntersectionPointBetween(rectA, rectB){
//        // line representing segment arrow is to be drawn on - from middle of object to middle of object
//        
//        Point2D aCenter = new Point2D.Double(a.getCenterX(), a.getCenterY());
//        Point2D bCenter = new Point2D.Double(b.getCenterX(), b.getCenterY());
//        Line2D arrowLine = new Line2D.Double(aCenter.getX(),
//                                             aCenter.getY(),
//                                             bCenter.getX(),
//                                             bCenter.getY());
//      
//        
//        Point2D intersectPoint = getRectLineIntersect(a.getBounds(),arrowLine);
//        if (intersectPoint == null){
//            // this generally happens when the center of b is contained within the bounds of a
//            if(DEBUG) System.out.println("intersect point was null - "+a.getBounds()+" "+arrowLine.getP1()+" to "+arrowLine.getP2());
//            
//            // this is slightly a hack, but give it the center of a. Doesn't
//            // really meet the contract for this method, but owrks in the
//            // overall scheme of things.
//            intersectPoint = aCenter;
//        } else {
//            if(DEBUG) System.out.println("intersect point was not null - "+intersectPoint);
//        }
//        return intersectPoint;
//    }

});
