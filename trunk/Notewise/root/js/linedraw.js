var LineDraw = {};
LineDraw.Line = Class.create();

LineDraw.Line.prototype = {
    
    // Accepts the two endpoints of the line, and the parent element that this line should be added to (and be relative to).  Positioning will be done absolutely based on the parent.
    initialize: function(parent, x1, y1, x2, y2){
         this.x1 = x1;
         this.y1 = y1;
         this.x2 = x2;
         this.y2 = y2;
         this.img = document.createElement('img');
         this.img.style.position = 'absolute';
         this.parent = parent;
         parent.appendChild(this.img);
         this.update();
    },

    setP1: function (x1,y1){
        this.x1 = x1;
        this.y1 = y1;
        this.update();
    },

    setP2: function (x2,y2){
        this.x2 = x2;
        this.y2 = y2;
        this.update();
    },

    setX1: function (x){
        this.x1 = x;
        this.update();
    },

    setY1: function (y){
        this.y1 = y;
        this.update();
    },

    setX2: function (x){
        this.x2 = x;
        this.update();
    },

    setY2: function (y){
        this.y2 = y;
        this.update();
    },

    // removes the image from the html document
    destroy: function() {
        if(this.img != undefined){
            this.img.parentNode.removeChild(this.img);
            this.img=undefined;
        }
    },

    splitCoord: function(coord) {
        var regex=/([\d\.]+)\s*([a-z\%]+)/i;
        var results = regex.exec(coord);
        if(results !== null){
            return {value: Number(results[1]), units: results[2]};
        } else {
            return null;
        }
    },

    // direction should be 'x' or 'y'
    percentToPx: function(percentage, direction){
        var parentDimension;
        if(direction == 'x'){
            parentDimension = this.parent.clientWidth;
        } else {
            parentDimension = this.parent.clientHeight;
        }
        return parentDimension*percentage/100;
    },

    toPx: function(coord, direction){
        var splitCoord = this.splitCoord(coord);
        if(splitCoord !== null){
            if(splitCoord.units == '%'){
                return this.percentToPx(splitCoord.value,direction);
            } else {
                return splitCoord.value;
            }
        } else {
            return null;
        }
    }, 

    update: function(){
        var x1Px = this.toPx(this.x1,'x');
        var x2Px = this.toPx(this.x2,'x');
        var y1Px = this.toPx(this.y1,'y');
        var y2Px = this.toPx(this.y2,'y');
        
        if(x1Px === null || x2Px === null || y1Px === null || y2Px === null){
            return;
        }

//        window.status = "x1Px: "+x1Px+" x2Px: "+x2Px+" y1Px: "+y1Px+" y2Px: "+y2Px;

        var wPx = Math.abs(x1Px - x2Px);
        var hPx = Math.abs(y1Px - y2Px);

        var x1Coord = this.splitCoord(this.x1);
        var x2Coord = this.splitCoord(this.x2);
        var y1Coord = this.splitCoord(this.y1);
        var y2Coord = this.splitCoord(this.y2);

        var w = Math.abs(x1Coord.value - x2Coord.value)+x1Coord.units;
        var h = Math.abs(y1Coord.value - y2Coord.value)+y1Coord.units;
        var x = Math.min(x1Coord.value, x2Coord.value)+x1Coord.units;
        var y = Math.min(y1Coord.value, y2Coord.value)+y1Coord.units;

        var direction;
//        window.status = x1Coord.value + ' ' +
//                        x2Coord.value + ' ' +
//                        y1Coord.value + ' ' +
//                        y2Coord.value + ' ';
        if( (x2Coord.value > x1Coord.value && y2Coord.value < y1Coord.value)
            || (x2Coord.value < x1Coord.value && y2Coord.value > y1Coord.value) ){
            direction = 'l';
        } else {
            direction = 'r';
        }
        var imageName;
        if(wPx>hPx){
            if(hPx<5){
                h='1px';
                y = ((y1Coord.value+y2Coord.value)/2) + x1Coord.units;
                imageName='l5x1.png';
            } else if(hPx<7){ imageName=direction+'12x6.png';
            } else if(hPx<9){ imageName=direction+'14x7.png';
            } else if(hPx<11){ imageName=direction+'18x9.png';
            } else if(hPx<14){ imageName=direction+'22x11.png';
            } else if(hPx<18){ imageName=direction+'28x14.png';
            } else if(hPx<23){ imageName=direction+'36x18.png';
            } else if(hPx<29){ imageName=direction+'46x23.png';
            } else if(hPx<37){ imageName=direction+'58x29.png';
            } else if(hPx<48){ imageName=direction+'74x37.png';
            } else if(hPx<62){ imageName=direction+'96x48.png';
            } else if(hPx<80){ imageName=direction+'124x62.png';
            } else if(hPx<104){ imageName=direction+'160x80.png';
            } else if(hPx<135){ imageName=direction+'208x104.png';
            } else if(hPx<175){ imageName=direction+'270x135.png';
            } else if(hPx<227){ imageName=direction+'350x175.png';
            } else if(hPx<295){ imageName=direction+'454x227.png';
            } else if(hPx<383){ imageName=direction+'590x295.png';
            } else if(hPx<497){ imageName=direction+'766x383.png';
            } else if(hPx<646){ imageName=direction+'994x497.png';
            } else { imageName=direction+'1292x646.png';
            }
        } else {
            if(wPx<5){
                w='1px';
                x = ((x1Coord.value+x2Coord.value)/2) + x1Coord.units;
                imageName='l1x5.png';
            } else if(wPx<7){ imageName=direction+'6x12.png';
            } else if(wPx<9){ imageName=direction+'7x14.png';
            } else if(wPx<11){ imageName=direction+'9x18.png';
            } else if(wPx<14){ imageName=direction+'11x22.png';
            } else if(wPx<18){ imageName=direction+'14x28.png';
            } else if(wPx<23){ imageName=direction+'18x36.png';
            } else if(wPx<29){ imageName=direction+'23x46.png';
            } else if(wPx<37){ imageName=direction+'29x58.png';
            } else if(wPx<48){ imageName=direction+'37x74.png';
            } else if(wPx<62){ imageName=direction+'48x96.png';
            } else if(wPx<80){ imageName=direction+'62x124.png';
            } else if(wPx<104){ imageName=direction+'80x160.png';
            } else if(wPx<135){ imageName=direction+'104x208.png';
            } else if(wPx<175){ imageName=direction+'135x270.png';
            } else if(wPx<227){ imageName=direction+'175x350.png';
            } else if(wPx<295){ imageName=direction+'227x454.png';
            } else if(wPx<383){ imageName=direction+'295x590.png';
            } else if(wPx<497){ imageName=direction+'383x766.png';
            } else if(wPx<646){ imageName=direction+'497x994.png';
            } else { imageName=direction+'646x1292.png';
            }
        }
        this.img.src = "/images/"+imageName;
        this.img.style.left=x;
        this.img.style.top=y;
        this.img.style.width=w;
        this.img.style.height=h;
     }
}

// precache images

var image_cache=[];

function precache(imageName){
    var i = image_cache.length;
    image_cache[i] = new Image();
    image_cache[i].src="/images/"+imageName;
}

dims = [
    [12,6],
    [14,7],
    [18,9],
    [22,11],
    [28,14],
    [36,18],
    [46,23],
    [58,29],
    [74,37],
    [96,48],
    [124,62],
    [160,80],
    [208,104],
    [270,135],
    [350,175],
    [454,227],
    [590,295],
    [766,383],
    [994,497],
    [1292,646]
];

for(var i=0; i<dims.length; i++){
    directions = ['r','l'];
    for(var j=0; j<2; j++){
        var direction = directions[j];
        precache(direction+dims[i][0]+'x'+dims[i][1]+'.png');
        precache(direction+dims[i][1]+'x'+dims[i][0]+'.png');
    }
}
