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
        window.status = x1Coord.value + ' ' +
                        x2Coord.value + ' ' +
                        y1Coord.value + ' ' +
                        y2Coord.value + ' ';
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
            } else if(hPx<6){ imageName=direction+'10x5.png';
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
            } else if(wPx<6){ imageName=direction+'5x10.png';
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
        this.img.src = LineDraw.Line.images[imageName];
        this.img.style.left=x;
        this.img.style.top=y;
        this.img.style.width=w;
        this.img.style.height=h;
//        window.status="x: "+x+" y: "+y+" w: "+w+" h: "+h;
     }
}

LineDraw.Line.images = {};
LineDraw.Line.images['l6x12.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAMAQMAAAB7mV5tAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABpJREFUCJljYGFgYeAAQgEgVABCByBsYGgAAAsoAfkqXxZJAAAAAElFTkSuQmCC';

LineDraw.Line.images['l12x6.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAQMAAADNIO3CAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABZJREFUCJljYDBgYDjAwMzAwMMAYQIAD8MB8EwHTNQAAAAASUVORK5CYII=';

LineDraw.Line.images['r6x12.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAMAQMAAAB7mV5tAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABpJREFUCJljaGBoYHAAQgUgFABCDiBkYWABACRIAfklii46AAAAAElFTkSuQmCC';

LineDraw.Line.images['r12x6.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAGAQMAAADNIO3CAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABhJREFUCJljOMDAYMDAwMPAwMzAwADiAAATPgHwY+xVxgAAAABJRU5ErkJggg==';

LineDraw.Line.images['l7x14.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAOAQMAAADZk5RYAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABxJREFUCJljYGJgYmABQg4gFABCBSB0AMIGhgYAC5QB/Tsis8YAAAAASUVORK5CYII=';

LineDraw.Line.images['l14x7.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAHAQMAAAACie5aAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABZJREFUCJljYOBhYDBgYDjAwMwAZwIAEKoB/N5GrPwAAAAASUVORK5CYII=';

LineDraw.Line.images['r7x14.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAOAQMAAADZk5RYAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABxJREFUCJljaGBoYHAAQgUgFABCDiBkAUImBiYALDQB/WFWa3AAAAAASUVORK5CYII=';

LineDraw.Line.images['r14x7.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAHAQMAAAACie5aAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABhJREFUCJljOMDAYMDAwMPAwMzAwADlAAAZGgH8/wQpOwAAAABJRU5ErkJggg==';

LineDraw.Line.images['l9x18.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAASAQMAAACzTmYLAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACJJREFUCJljYGhgACJGBhBiAiMWMOIAIwEwUgAjBzACKwcARUMC/zTOvJYAAAAASUVORK5CYII=';

LineDraw.Line.images['l18x9.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAJAQMAAAAFEe5MAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABhJREFUCJljYGA4wMDAzMDAwAPEBgzYuAAwVwK/zFwmHwAAAABJRU5ErkJggg==';

LineDraw.Line.images['r9x18.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAASAQMAAACzTmYLAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACJJREFUCJljaGBgACIHMFIAIwEw4gAjFjBiAiNGMAKpbgAAXbsC/xpnvt0AAAAASUVORK5CYII=';

LineDraw.Line.images['r18x9.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAJAQMAAAAFEe5MAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABdJREFUCJljOMDAwGAAxDxAzAzEDJgCADMnAr+ssqZ3AAAAAElFTkSuQmCC';

LineDraw.Line.images['l11x22.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAWAQMAAAAsKvQgAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACJJREFUCJljYFBgACEHMGoAIUYGEGICIxYw4gAjATDCUA4AcS8Dv7zArm8AAAAASUVORK5CYII=';

LineDraw.Line.images['l22x11.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAALAQMAAABBMu89AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABhJREFUCJljYGDgYWBgMADiAwwMzAz4uAA5OwL7rnguAwAAAABJRU5ErkJggg==';

LineDraw.Line.images['r11x22.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAWAQMAAAAsKvQgAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACJJREFUCJljaGBgACIHMFIAIwEw4gAjFjBiAiNGMGJA1wAAho8Dv9KGCEUAAAAASUVORK5CYII=';

LineDraw.Line.images['r22x11.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAALAQMAAABBMu89AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABdJREFUCJljOMDAwGAAxDxAzAzEDLgFAEobAvs0/dk4AAAAAElFTkSuQmCC';

LineDraw.Line.images['l14x28.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAcAQMAAABrmBwCAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACJJREFUCJljYGBhACEOMBIAIwUwcgCjBhBiZAAhJjAiQjkAgP0D92YWcqoAAAAASUVORK5CYII=';

LineDraw.Line.images['l28x14.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAOAQMAAAAG3e5HAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABlJREFUCJljYGBgMABihgNAzAxi8DCQLgQAg+AD7glFWpoAAAAASUVORK5CYII=';

LineDraw.Line.images['r14x28.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAcAQMAAABrmBwCAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACJJREFUCJljaGBgACIHMFIAIwEw4gAjFjBiAiNGMGIgrAEAzGkD9wafImMAAAAASUVORK5CYII=';

LineDraw.Line.images['r28x14.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAOAQMAAAAG3e5HAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABdJREFUCJljOMAABAYgggdEMIMIBlIFAY+nA+40RJ7zAAAAAElFTkSuQmCC';

LineDraw.Line.images['l18x36.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAkAQMAAAC+I/ikAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACNJREFUCJljYGBwYIDgBghmZIBgJihmgWIOKBaAYgUopq52AHltBX1MqqlLAAAAAElFTkSuQmCC';

LineDraw.Line.images['l36x18.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAASAQMAAAAJ7e5rAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABlJREFUCJljYAACAxDBcABEMIOZPAy0EAYAAYUE7a1E3eYAAAAASUVORK5CYII=';

LineDraw.Line.images['r18x36.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAkAQMAAAC+I/ikAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACNJREFUCJljaGBgYABhByhWgGIBKOaAYhYoZoJiRihmoK4BAJ6NBX2E15dzAAAAAElFTkSuQmCC';

LineDraw.Line.images['r36x18.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAASAQMAAAAJ7e5rAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABhJREFUCJljOMAAAgZgkgdMMoNJBupLAAATPQTteqBfzQAAAABJRU5ErkJggg==';

LineDraw.Line.images['l23x46.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAuAQMAAAD5kRCGAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACNJREFUCJljYGBgYoBgFijmgGIBKFaAYgcoboBgRgYIHhjtAMQJBflAYBXPAAAAAElFTkSuQmCC';

LineDraw.Line.images['l46x23.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAXAQMAAABOAu8RAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABlJREFUCJljYAABHjDJYAChDoBJZoZBIQUAw1sF+Dh1lnAAAAAASUVORK5CYII=';

LineDraw.Line.images['r23x46.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAuAQMAAAD5kRCGAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACNJREFUCJljaGBgYABhByhWgGIBKOaAYhYoZoJiRihmGBgDAIfYBfkiGjKHAAAAAElFTkSuQmCC';

LineDraw.Line.images['r46x23.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAXAQMAAABOAu8RAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABhJREFUCJljOMAABgYQigdCMUMohkEgCQD+awX4MF9ZawAAAABJRU5ErkJggg==';

LineDraw.Line.images['l29x58.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAA6AQMAAAB29MDCAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACZJREFUGJVjYGBg4GCAEQJwQgFOOMCJBhjByAAjmOAEC5wYZsYBACJJB+saZAbEAAAAAElFTkSuQmCC';

LineDraw.Line.images['l58x29.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAAdAQMAAADB3O3lAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABlJREFUGJVjYICAA1CaGUoz8MAYBgzDXgkA5soHumC33qwAAAAASUVORK5CYII=';

LineDraw.Line.images['r29x58.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAA6AQMAAAB29MDCAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACRJREFUGJVjaGAAAjDhACcU4IQAnOCAEyxwgglOMMIJhuFmIADXsQfr4DvxxQAAAABJRU5ErkJggg==';

LineDraw.Line.images['r58x29.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAAdAQMAAADB3O3lAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABhJREFUGJVjOMAABQYwBg+MwQxjMAxzRQD88Ae6GM/oQQAAAABJRU5ErkJggg==';

LineDraw.Line.images['l37x74.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAABKAQMAAAAG8g/PAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAChJREFUGJVjYAACDgYEKYBEKiCRDkhkA4JkZECQTEgkCxI5ajxtjAcAEWAJ6XFMLv4AAAAASUVORK5CYII=';

LineDraw.Line.images['l74x37.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEoAAAAlAQMAAADfvO29AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABtJREFUGJVjYICBA3AWM5zFwINgGjCMKqWbUgCqrQm45b2m2wAAAABJRU5ErkJggg==';

LineDraw.Line.images['r37x74.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAABKAQMAAAAG8g/PAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACdJREFUGJVjaGAAAQjpgEQqIJECSCQHEsmCRDIhkYxIJMOoBbSyAAAhrwnpog/zzwAAAABJRU5ErkJggg==';

LineDraw.Line.images['r74x37.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEoAAAAlAQMAAADfvO29AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABpJREFUGJVjOMAABwYIJg+CyYxgMowqppNiAM17CbjON72KAAAAAElFTkSuQmCC';

LineDraw.Line.images['l48x96.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAABgAQMAAABhQmMzAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAClJREFUKJFjYAABRgZkigmFYkGhOFAoARRKAYVyQKEakKlR60atI9I6AAwWC/WyDzEiAAAAAElFTkSuQmCC';

LineDraw.Line.images['l96x48.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAwAQMAAADU2O2MAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAB1JREFUKJFjYEAAZiQ2Aw8yxwCZc2BUy6gWcrUAANzZC/WhUYVdAAAAAElFTkSuQmCC';

LineDraw.Line.images['r48x96.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAABgAQMAAABhQmMzAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACpJREFUKJFjaGAAAyjlgEIpoFACKBQHCsWCQjGhUIwoFMymUQtHLSTCQgBbewv10TjYIQAAAABJRU5ErkJggg==';

LineDraw.Line.images['r96x48.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAwAQMAAADU2O2MAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAB1JREFUKJFjOMCABAyQOTzIHGZkDsOoplFN5GkCAExrC/WhYVhIAAAAAElFTkSuQmCC';

LineDraw.Line.images['l62x124.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAAB8AQMAAAALn5FgAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAC5JREFUOI1jYIAAFgZ0BgcGQwCDoYDBcMBgNKAzGBnQGUwYjFHnjDpn1DlD3DkA8Z8P62XVt58AAAAASUVORK5CYII=';

LineDraw.Line.images['l124x62.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHwAAAA+AQMAAADTQO2aAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACJJREFUOI1jYEAFBmh8hgNofGZ0BTzoAqNGjBoxasSwMAIAZaIP4gKgD7EAAAAASUVORK5CYII=';

LineDraw.Line.images['r62x124.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAAB8AQMAAAALn5FgAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAC5JREFUOI1jaGCAAjjDAYOhgMEQwGBwYDBYMBhMGAxGDAbCHaMOGnXQqIOGsIMAe1cP6xnmGxkAAAAASUVORK5CYII=';

LineDraw.Line.images['r124x62.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHwAAAA+AQMAAADTQO2aAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACBJREFUOI1jOMCABgzQBXjQBZjRBRhGDRk1ZNSQ4WcIAAeoD+IWkwVZAAAAAElFTkSuQmCC';

LineDraw.Line.images['l80x160.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAACgAQMAAAChTXn3AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAERJREFUOI3tzrENACAMxMCAKCgZgVEyWkanQkIvD0Dxrq50xK0FsSMHciIXciMTWUTv6qN3hd7Vx4eJLKJ39dG7wm93DzBsE+2JNs9gAAAAAElFTkSuQmCC';

LineDraw.Line.images['l160x80.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAABQAQMAAACkk+x3AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACdJREFUOI1jYMAEzFjEGHiwCRpgEzwwauSokaNGjho5auSokaQaCQB5+xPt5mFgTAAAAABJRU5ErkJggg==';

LineDraw.Line.images['r80x160.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAACgAQMAAAChTXn3AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAEhJREFUOI3tzqENACAQBEEgCCQlfClfGqXjyCW/EnmrRm477SVMZCA3ciEnciA7Ui+FiQykh+ulh4EehkthIgPp4XrpYeDf4QvbzBPtf19PUgAAAABJRU5ErkJggg==';

LineDraw.Line.images['r160x80.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAABQAQMAAACkk+x3AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACdJREFUOI1jOMCABRhgE+TBJsiMTZBh1NBRQ0cNHTV01NBRQ0kzFABXgxPtk2hqbQAAAABJRU5ErkJggg==';

LineDraw.Line.images['l104x208.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGgAAADQAQMAAADRS7b6AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAE9JREFUSIntz6EVwDAMA1E3L6CwI2QUj+bRQwskTXDHPryqX095raAd9AZ9QSeog8aLPSn2pNiT6qDxYk+KPSn2pDpovNiTYk+KPakOGq8LNBAZ5ynWUkMAAAAASUVORK5CYII=';

LineDraw.Line.images['l208x104.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANAAAABoAQMAAAC68+wvAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAADBJREFUSIljYMAFmHHKMPDgljLALXVg1KpRq0atGrVq1KpRq0atGrVq1KpRqwbKKgDhsRnnf/Dp5gAAAABJRU5ErkJggg==';

LineDraw.Line.images['r104x208.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGgAAADQAQMAAADRS7b6AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAFBJREFUSIntz7ERABAUBFGMQKiEX8ovTelSzNw24DZ74ZZVzm4lKEATNEAd1EAV9CzdSlCAPCjkQSEPKiUoQB4U8qCQB5USFCAPCnlQ6LfBDYwqGefwUKlEAAAAAElFTkSuQmCC';

LineDraw.Line.images['r208x104.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANAAAABoAQMAAAC68+wvAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAADBJREFUSIljOMCAExjgluLBLcWMW4ph1LJRy0YtG7Vs1LJRy0YtG7Vs1LJRywbGMgBXpBnnPx9UnwAAAABJRU5ErkJggg==';

LineDraw.Line.images['l135x270.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIcAAAEOAQMAAACZ4ZbtAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAF1JREFUWIXt0LENwCAAA0FAKSgzAqMwGqOnh+jjPu/y5OpL2dZ2eJErkB7IHcgIZAayvqUel1PMg2IeFPOgmAfFPCjmQTEPinlQzINiHhTzoJgHxTwo5kExD8qP8zzLvSHdoAGpmgAAAABJRU5ErkJggg==';

LineDraw.Line.images['l270x135.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQ4AAACHAQMAAADdtyVCAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAADxJREFUWIXtzrEJADAMA0GB2wyT/auMlhFUG071Iy5pO7XI7cmrxfQTFBQUFBQUFBQUFBQUFBQUFJQdlA9PlSHcwrvweQAAAABJRU5ErkJggg==';

LineDraw.Line.images['r135x270.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIcAAAEOAQMAAACZ4ZbtAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAGBJREFUWIXt0KERwCAAxVDKVSAZgVEYjdHroXf5DpPIJ1NW2TtlBjIC6YG0QN5AaiBPID87TpmBjEAcBOIgEAeBOAjEQSAOAnEQiINAHATiIBAHgTgIxEEgDgJxEMjlQR9MiSHdOWjO0AAAAABJRU5ErkJggg==';

LineDraw.Line.images['r270x135.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQ4AAACHAQMAAADdtyVCAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAElJREFUWIXtzjENwEAMwMBIXQum/KeHVgRWHsDd7MFzZvXtybsnz57M2RMzxUwxU8wUM8VMMVPMFDPFTDFTzBQzxUwxU8yUm5kf2V8h3GjWlkkAAAAASUVORK5CYII=';

LineDraw.Line.images['l175x350.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAK8AAAFeAQMAAADJ5d0+AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAKVJREFUWIXt0KERw1AAw9C0F1DYETqKR9PoHcA/QNyC74x8XafeR33iW/FH8VfxT3EUY/h1Hj/w7u4wvLu7KMbw7u6iGMO7u4tiDO/uLooxvLu7KMbw7u6iGMO7u4tiDO/uLooxvLu7KMbw7u6iGMO7u4tiDO/uLooxvLu7KMbw7u6iGMO7u4tiDO/uLooxvLu7KMbw7u6iGMO7u4tiDO/uLoox/AcgqCvTyiSe1gAAAABJRU5ErkJggg==';

LineDraw.Line.images['l350x175.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAV4AAACvAQMAAACPXCRRAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAGFJREFUWIXtziEOgFAQxNBNsByG+6t/NGQrWYFr9WTyZr53L7bzbMZnsb02x5HVWWwjq8gUWUWmyCoyRVaRKbKKTJFVZIqsIlNkFZkiq8gUWUWmyCoyRVaRKbKKTJHVb+QXxREr0uWWipYAAAAASUVORK5CYII=';

LineDraw.Line.images['r175x350.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAK8AAAFeAQMAAADJ5d0+AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAKZJREFUWIXt0KEVw0AAw9C0ryCwI2gUj9bRs4APiBVY8ENdv6t24ChG8Vfxrfij+K34pfh09sBRjOINL0Uxije8FMUo3vBSFKN4w0tRjOINL0Uxije8FMUo3vBSFKN4w0tRjOINL0Uxije8FMUo3vBSFKN4w0tRjOINL0Uxije8FMUo3vBSFKN4w0tRjOINL0Uxije8FMUo3vBSFKN4w0tRjOL/H/4AYKgr06j48roAAAAASUVORK5CYII=';

LineDraw.Line.images['r350x175.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAV4AAACvAQMAAACPXCRRAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAFlJREFUWIXtzqERwDAAxLDclXaY7o8yWrHgcwsb+Nwz+Jb4XeJnic9d4qbRtJpG02oaTatpNK2m0bSaRtNqGk2raTStptG0mkbTahpNq2k0rabRtJpG09qmf6YWK9K6TRRxAAAAAElFTkSuQmCC';

LineDraw.Line.images['l227x454.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOMAAAHGAQMAAAC8Vq4+AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAQlJREFUaIHt0bFxQwEQAlHJo8ChS6AUSqN0d/B1w6aQviHa1+thesIvaqDp9f14fdYfoB+gv0D/gAqogabX5b2rgBpoel3euwqogabX5b2rgBpoel3euwqogabX5b2rgBpoel3euwqogabX5b2rgBpoel3euwqogabX5b2rgBpoel3euwqogabX5b2rgBpoel3euwqogabX5b2rgBpoel3euwqogabX5b2rgBpoel3euwqogabX5b2rgBpoel3euwqogabX5b2rgBpoel3euwqogabX5b2rgBpoel3euwqogabX5b2rgBpoel3euwqogabX5b2rgBpoel3euwqogabX5b2rgBpoev0HDDQ5icVUDfwAAAAASUVORK5CYII=';

LineDraw.Line.images['l454x227.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcYAAADjAQMAAAAluiZbAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAJRJREFUaIHtz7EJwEAAw8CHtBkm+1ceLSMI1L7UG3PnyF47PJ9ezg4ffRkTignNDmNCMaGY0OwwJhQTignNDmNCMaGY0OwwJhQTignNDmNCMaGY0OwwJhQTignNDmNCMaGY0OwwJhQTignNDmNCMaGY0OwwJhQTignNDmNCMaGY0OwwJhQTignNDmNCMaGY0OzwEuYPLFs4xfTp+vIAAAAASUVORK5CYII=';

LineDraw.Line.images['r227x454.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOMAAAHGAQMAAAC8Vq4+AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAALtJREFUaIHt0bERwgAAw8DAUVAygkfJaIzOBsE6Nymk9ksd3+Oqaz0HzaCfQd+DvgZ9DvoY9M/Caz0HzaAO7tXBQB0MNIM6uFcHA3Uw0Azq4F4dDNTBQDOog3t1MFAHA82gDu7VwUAdDDSDOrhXBwN1MNAM6uBeHQzUwUAzqIN7dTBQBwPNoA7u1cFAHQw0gzq4VwcDdTDQDOrgXh0M1MFAM6iDe3UwUAcDzaAO7tXBQB0MNIM6uNe7Dv4B7/c5iXvAmqoAAAAASUVORK5CYII=';

LineDraw.Line.images['r454x227.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcYAAADjAQMAAAAluiZbAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAJBJREFUaIHtz6EJwEAAxdCD2g7T/dUfrSME4g7yfETOjvXp8tXlo8szXTaKGkWNsumyUdQoapRNl42iRlGjbLpsFDWKGmXTZaOoUdQomy4bRY2iRtl02ShqFDXKpstGUaOoUTZdNooaRY2y6bJR1ChqlE2XjaJGUaNsumwUNYoaZdNlo6hR1CibLhtFjaLbRn9WeTjFdRaQZAAAAABJRU5ErkJggg==';

LineDraw.Line.images['l295x590.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAScAAAJOAQMAAADPh1MNAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAP1JREFUeJzt0rENgwAQBEGwHBC6BEqhNEp3Cz/Sh3vx6KI9jsE+EzRU30V1LarforoX1bOo3j11jq5mqrxM3YvqWVTvniovU+VFqrxMlRep8jJVXqTKy1R5kSovU+VFqrxMlRep8jJVXqTKy1R5kSovU+VFqrxMlRep8jJVXqTKy1R5kSovU+VFqrxMlRep8jJVXqTKy1R5kSovU+VFqrxMlRep8jJVXqTKy1R5kSovU+VFqrxMlRep8jJVXqTKy1R5kSovU+VFqrxMlRep8jJVXqTKy1R5kSovU+VFqrxMlRep8jJVXqTKy1R5kSovU+VFqrxMlRep8jJVXqT+qpFJtWnbAXIAAAAASUVORK5CYII=';

LineDraw.Line.images['l590x295.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAk4AAAEnAQMAAABlhF65AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAL9JREFUeJzt0DENwEAMwMBIvxZM+U+FVgo3ZHr5AHjwzJZnrTTvXupbK521Uqtcq1irWKtYq1irWKtYq1irWKtYq1irWKtYq1irWKtYq1irWKtYq1irWKtYq1irWKtYq1irWKtYq1irWKtYq1irWKtYq1irWKtYq1irWKtYq1irWKtYq1irWKtYq1irWKtYq1irWKtYq1irWKtYq1irWKtYq1irWKtYq1irWKtYq1irWKtYq1irWKtYq1ir2O2rfpPcSbTD1oQuAAAAAElFTkSuQmCC';

LineDraw.Line.images['r295x590.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAScAAAJOAQMAAADPh1MNAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAPtJREFUeJzt0qENhFAUAEG4IJBXAqVQGqXj0H+TJ2f1yN2ebaU1dQ+qa1D9B9U5qI5B9RtU+6BaXGdN3YPqGlQGa8pgURmsKYNFZbCmDBaVwZoyWFQGa8pgURmsKYNFZbCmDBaVwZoyWFQGa8pgURmsKYNFZbCmDBaVwZoyWFQGa8pgURmsKYNFZbCmDBaVwZoyWFQGa8pgURmsKYNFZbCmDBaVwZoyWFQGa8pgURmsKYNFZbCmDBaVwZoyWFQGa8pgURmsKYNFZbCmDBaVwZoyWFQGa8pgURmsKYNFZbCmDBaVwZoyWFQGa8pgURmsKYNFZbCmDBaVwT71Akc3SbXjXtUuAAAAAElFTkSuQmCC';

LineDraw.Line.images['r590x295.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAk4AAAEnAQMAAABlhF65AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAL5JREFUeJzt0DENwEAAxLCXuhZM+U8PrRgs3RgDyJBzz8y3S7271LNLnbtLNQs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLNAs0CzQLLGf9El1JtH6A4H0AAAAASUVORK5CYII=';

LineDraw.Line.images['l383x766.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAX8AAAL+AQMAAAB/jobEAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAdFJREFUeJzt06FxQwEQxFA7YxDoElLKlbalpwV9ICbhe3NoX69n/Ty8fw4+OvjVwVcHfzo4HcwG76cPHoPmQGoOpNmgOZCaA+l0MBs0B1JzIJ0OZoPmQGoOpNPBbNAcSM2BdDqYDZoDqTmQTgezQXMgNQfS6WA2aA6k5kA6HcwGzYHUHEing9mgOZCaA+l0MBs0B1JzIJ0OZoPmQGoOpNPBbNAcSM2BdDqYDZoDqTmQTgezQXMgNQfS6WA2aA6k5kA6HcwGzYHUHEing9mgOZCaA+l0MBs0B1JzIJ0OZoPmQGoOpNPBbNAcSM2BdDqYDZoDqTmQTgezQXMgNQfS6WA2aA6k5kA6HcwGzYHUHEing9mgOZCaA+l0MBs0B1JzIJ0OZoPmQGoOpNPBbNAcSM2BdDqYDZoDqTmQTgezQXMgNQfS6WA2aA6k5kA6HcwGzYHUHEing9mgOZCaA+l0MBs0B1JzIJ0OZoPmQGoOpNPBbNAcSM2BdDqYDZoDqTmQTgezQXMgNQfS6WA2aA6k5kA6HcwGzYHUHEing9mgOZCaA+l0MBs0B1JzIJ0OZoPmQGoOpNPBbNAcSM2BdDqYDZoDqTmQTgezQXMgNQfS6WA2+AfJd1+fHz00qgAAAABJRU5ErkJggg==';

LineDraw.Line.images['l766x383.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAv4AAAF/AQMAAAALr18aAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAbFJREFUeJzt0SERwAAUw9B/Nzox848qbRKCwhIBr6B3bq/s32cPTPYf2e8CrAuwyX4XYJP9LsAm+12ATfa7AJvsdwE22e8CbLLfBdhkvwuwyX4XYJP9LsAm+12ATfa7AJvsdwE22e8CbLLfBdhkvwuwyX4XYJP9LsAm+12ATfa7AJvsdwE22e8CbLLfBdhkvwuwyX4XYJP9LsAm+12ATfa7AJvsdwE22e8CbLLfBdhkvwuwyX4XYJP9LsAm+12ATfa7AJvsdwE22e8CbLLfBdhkvwuwyX4XYJP9LsAm+12ATfa7AJvsdwE22e8CbLLfBdhkvwuwyX4XYJP9LsAm+12ATfa7AJvsdwE22e8CbLLfBdhkvwuwyX4XYJP9LsAm+12ATfa7AJvsdwE22e8CbLLfBdhkvwuwyX4XYJP9LsAm+12ATfa7AJvsdwE22e8CbLLfBdhkvwuwyX4XYJP9LsAm+12ATfa7AJvsdwE22e8CbLLfBdhkvwuwyX4XYJP9LsAm+12ATfa7AJvsdwE22e8CbLLfBdhkvwuwyX4XYJP9LsAm+12ATfa7AJvsdwE22f8BU81fnsPU6VMAAAAASUVORK5CYII=';

LineDraw.Line.images['r383x766.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAX8AAAL+AQMAAAB/jobEAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAdFJREFUeJzt06F1QwEUw9CkpyCwI7xRPFpG7wr6QEzml1mv7+vhHoPp4HTwp4OPDn518KODtw6e//sxmA5OBwVBVhBo08HpoCDICgJtOjgdFARZQaBNB6eDgiArCLTp4HRQEGQFgTYdnA4Kgqwg0KaD00FBkBUE2nRwOigIsoJAmw5OBwVBVhBo08HpoCDICgJtOjgdFARZQaBNB6eDgiArCLTp4HRQEGQFgTYdnA4Kgqwg0KaD00FBkBUE2nRwOigIsoJAmw5OBwVBVhBo08HpoCDICgJtOjgdFARZQaBNB6eDgiArCLTp4HRQEGQFgTYdnA4Kgqwg0KaD00FBkBUE2nRwOigIsoJAmw5OBwVBVhBo08HpoCDICgJtOjgdFARZQaBNB6eDgiArCLTp4HRQEGQFgTYdnA4Kgqwg0KaD00FBkBUE2nRwOigIsoJAmw5OBwVBVhBo08HpoCDICgJtOjgdFARZQaBNB6eDgiArCLTp4HRQEGQFgTYdnA4Kgqwg0KaD00FBkBUE2nRwOigIsoJAmw5OBwVBVhBo08HpoCDICgJtOjgdFARZQaBNB6eDgiArCLTp4HRQEGQFgTYdnA4Kgqwg0KaD00FBkD0P4h+xQV+fJpyBmgAAAABJRU5ErkJggg==';

LineDraw.Line.images['r766x383.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAv4AAAF/AQMAAAALr18aAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAaRJREFUeJzt0TERwAAQhMCfSRsx8V8hLRKo6A4DW3Bc3FcDbw08NXDUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41MAmeNTAJnjUwCZ41EA/4Qd9yl+eyI18hwAAAABJRU5ErkJggg==';

LineDraw.Line.images['l497x994.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfEAAAPiAQMAAABVIXYiAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAlpJREFUeJzt06FxQwEUA0E7YxDoElLKK02lp4gPlpz4jtC9Xo+2Z/ypfz+8f+p/sP9g/4v9F/s/7A/7WV/+1pe/9Yf9rC9/68vf+sN+1pe/9eVv/WE/68vf+vK3/rCf9eVvfflbf9jP+vK3vvytP+xnfflbX/7WH/azvvytL3/rD/tZX/7Wl7/1h/2sL3/ry9/6w37Wl7/15W/9YT/ry9/68rf+sJ/15W99+Vt/2M/68re+/K0/7Gd9+Vtf/tYf9rO+/K0vf+sP+1lf/taXv/WH/awvf+vL3/rDftaXv/Xlb/1hP+vL3/ryt/6wn/Xlb335W3/Yz/ryt778rT/sZ335W1/+1h/2s778rS9/6w/7WV/+1pe/9Yf9rC9/68vf+sN+1pe/9eVv/WE/68vf+vK3/rCf9eVvfflbf9jP+vK3vvytP+xnfflbX/7WH/azvvytL3/rD/tZX/7Wl7/1h/2sL3/ry9/6w37Wl7/15W/9YT/ry9/68rf+sJ/15W99+Vt/2M/68re+/K0/7Gd9+Vtf/tYf9rO+/K0vf+sP+1lf/taXv/WH/awvf+vL3/rDftaXv/Xlb/1hP+vL3/ryt/6wn/Xlb335W3/Yz/ryt778rT/sZ335W1/+1h/2s778rS9/6w/7WV/+1pe/9Yf9rC9/68vf+sN+1pe/9eVv/WE/68vf+vK3/rCf9eVvfflbf9jP+vK3vvytP+xnfflbX/7WH/azvvytL3/rD/tZX/7Wl7/1h/2sL3/ry9/6w37Wl7/15W/9YT/ry9/68rf+sJ/15W99+Vt/2M/6f3lOfIV9X0DJAAAAAElFTkSuQmCC';

LineDraw.Line.images['l994x497.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA+IAAAHxAQMAAADTCZQUAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAhZJREFUeJzt0TENwAAQxLCXuhZM+U+BVhheLgQ85A6WxB+J30v1j+pJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJfNtVSXzbVUl821VJ/AeEnHxF2fQMSQAAAABJRU5ErkJggg==';

LineDraw.Line.images['r497x994.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfEAAAPiAQMAAABVIXYiAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAmhJREFUeJzt1KF1QwEQA0E7L8AwJVwpKs2lp4gPhqz4QO3r+3q2p37YH/Z/2H+w/8X+B/s39o8P/NQP+8O+AFhfALAf9od9AbC+AGA/7A/7AmB9AcB+2B/2BcD6AoD9sD/sC4D1BQD7YX/YFwDrCwD2w/6wLwDWFwDsh/1hXwCsLwDYD/vDvgBYXwCwH/aHfQGwvgBgP+wP+wJgfQHAftgf9gXA+gKA/bA/7AuA9QUA+2F/2BcA6wsA9sP+sC8A1hcA7If9YV8ArC8A2A/7w74AWF8AsB/2h30BsL4AYD/sD/sCYH0BwH7YH/YFwPoCgP2wP+wLgPUFAPthf9gXAOsLAPbD/rAvANYXAOyH/WFfAKwvANgP+8O+AFhfALAf9od9AbC+AGA/7A/7AmB9AcB+2B/2BcD6AoD9sD/sC4D1BQD7YX/YFwDrCwD2w/6wLwDWFwDsh/1hXwCsLwDYD/vDvgBYXwCwH/aHfQGwvgBgP+wP+wJgfQHAftgf9gXA+gKA/bA/7AuA9QUA+2F/2BcA6wsA9sP+sC8A1hcA7If9YV8ArC8A2A/7w74AWF8AsB/2h30BsL4AYD/sD/sCYH0BwH7YH/YFwPoCgP2wP+wLgPUFAPthf9gXAOsLAPbD/rAvANYXAOyH/WFfAKwvANgP+8O+AFhfALAf9od9AbC+AGA/7A/7AmB9AcB+2B/2BcD6AoD9sD/sC4D1BQD7YX/YFwDrCwD2w/6wLwDWFwDsh/1hXwCsLwDYD/vDvgBYXwCwH/aHfQGwvgBgP+wP+wJgfQHAftgf9gXA+gKA/bA/7AuA9QXgqf8H7LB8haOU114AAAAASUVORK5CYII=';

LineDraw.Line.images['r994x497.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA+IAAAHxAQMAAADTCZQUAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAhNJREFUeJzt0TENwAAQxLCXuhZM+U+BVhheLgQ85DrZR/WX6g/VL6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88K6pvPCuqbzwrqm88qx/6p3xF+Y1QxAAAAABJRU5ErkJggg==';

LineDraw.Line.images['l646x1292.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoYAAAUMAQMAAACXyMEKAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAABAdJREFUeJzt1LFtQwEQw1DHcJEyI3gUjXajZwl+QAL4BmDJ1wv2oYMPFH8Hin8Dxe9AMQPF6y/+0MEHiu+BontkuEdGBorXX3SPDPfIcI+MDBSvv+geGe6R4R4ZGShef9E9Mtwjwz0yMlC8/qJ7ZLhHhntkZKB4/UX3yHCPDPfIyEDx+ovukeEeGe6RkYHi9RfdI8M9MtwjIwPF6y+6R4Z7ZLhHRgaK1190jwz3yHCPjAwUr7/oHhnukeEeGRkoXn/RPTLcI8M9MjJQvP6ie2S4R4Z7ZGSgeP1F98hwjwz3yMhA8fqL7pHhHhnukZGB4vUX3SPDPTLcIyMDxesvukeGe2S4R0YGitdfdI8M98hwj4wMFK+/6B4Z7pHhHhkZKF5/0T0y3CPDPTIyULz+ontkuEeGe2RkoHj9RffIcI8M98jIQPH6i+6R4R4Z7pGRgeL1F90jwz0y3CMjA8XrL7pHhntkuEdGBorXX3SPDPfIcI+MDBSvv+geGe6R4R4ZGShef9E9Mtwjwz0yMlC8/qJ7ZLhHhntkZKB4/UX3yHCPDPfIyEDx+ovukeEeGe6RkYHi9RfdI8M9MtwjIwPF6y+6R4Z7ZLhHRgaK1190jwz3yHCPjAwUr7/oHhnukeEeGRkoXn/RPTLcI8M9MjJQvP6ie2S4R4Z7ZGSgeP1F98hwjwz3yMhA8fqL7pHhHhnukZGB4vUX3SPDPTLcIyMDxesvukeGe2S4R0YGitdfdI8M98hwj4wMFK+/6B4Z7pHhHhkZKF5/0T0y3CPDPTIyULz+ontkuEeGe2RkoHj9RffIcI8M98jIQPH6i+6R4R4Z7pGRgeL1F90jwz0y3CMjA8XrL7pHhntkuEdGBorXX3SPDPfIcI+MDBSvv+geGe6R4R4ZGShef9E9Mtwjwz0yMlC8/qJ7ZLhHhntkZKB4/UX3yHCPDPfIyEDx+ovukeEeGe6RkYHi9RfdI8M9MtwjIwPF6y+6R4Z7ZLhHRgaK1190jwz3yHCPjAwUr7/oHhnukeEeGRkoXn/RPTLcI8M9MjJQvP6ie2S4R4Z7ZGSgeP1F98hwjwz3yMhA8fqL7pHhHhnukZGB4vUX3SPDPTLcIyMDxesvukeGe2S4R0YGitdfdI8M98hwj4wMFK+/6B4Z7pHhHhkZKF5/0T0y3CPDPTIyULz+ontkuEeGe2RkoHj9RffIcI8M98jIQPH6i+6R4R4Z7pGRgeL1F90jwz0y3CMjA8XrL7pHhntkuEdGBorXX3SPDPfIcI+MDBSvv+geGe6R4R4ZGShef9E9Mtwjwz0yMlC8/qJ7ZLhHhntkZKB4/UX3yHCPDPfIyEDx+ovukeEeGe6RkYHi9RfdI8M9MtwjIwPF6y/+A5u5oVli2lgrAAAAAElFTkSuQmCC';

LineDraw.Line.images['l1292x646.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABQwAAAKGAQMAAAA1WERxAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAwRJREFUeJzt0rENgEAMwMCXaBmG/StGY4Q0J4XCN4ELn/N3z3bA7N0OGF3bAbN7O2DWikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQikArCq0ItKLQisAHJsKhUIfkjL8AAAAASUVORK5CYII=';

LineDraw.Line.images['r646x1292.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoYAAAUMAQMAAACXyMEKAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAA/FJREFUeJzt1DFtQwEUxdC0ytCxEB6UCy3QQ8J/sGQD8Hhenxcdf5zgeILjv+D4Jzi+BcdfwfFHcHyAM/44wfEEx4BkCkimgISa4HiCY0AyBSRTQEJNcDzBMSCZApIpIKEmOJ7gGJBMAckUkFATHE9wDEimgGQKSKgJjic4BiRTQDIFJNQExxMcA5IpIJkCEmqC4wmOAckUkEwBCTXB8QTHgGQKSKaAhJrgeIJjQDIFJFNAQk1wPMExIJkCkikgoSY4nuAYkEwByRSQUBMcT3AMSKaAZApIqAmOJzgGJFNAMgUk1ATHExwDkikgmQISaoLjCY4ByRSQTAEJNcHxBMeAZApIpoCEmuB4gmNAMgUkU0BCTXA8wTEgmQKSKSChJjie4BiQTAHJFJBQExxPcAxIpoBkCkioCY4nOAYkU0AyBSTUBMcTHAOSKSCZAhJqguMJjgHJFJBMAQk1wfEEx4BkCkimgISa4HiCY0AyBSRTQEJNcDzBMSCZApIpIKEmOJ7gGJBMAckUkFATHE9wDEimgGQKSKgJjic4BiRTQDIFJNQExxMcA5IpIJkCEmqC4wmOAckUkEwBCTXB8QTHgGQKSKaAhJrgeIJjQDIFJFNAQk1wPMExIJkCkikgoSY4nuAYkEwByRSQUBMcT3AMSKaAZApIqAmOJzgGJFNAMgUk1ATHExwDkikgmQISaoLjCY4ByRSQTAEJNcHxBMeAZApIpoCEmuB4gmNAMgUkU0BCTXA8wTEgmQKSKSChJjie4BiQTAHJFJBQExxPcAxIpoBkCkioCY4nOAYkU0AyBSTUBMcTHAOSKSCZAhJqguMJjgHJFJBMAQk1wfEEx4BkCkimgISa4HiCY0AyBSRTQEJNcDzBMSCZApIpIKEmOJ7gGJBMAckUkFATHE9wDEimgGQKSKgJjic4BiRTQDIFJNQExxMcA5IpIJkCEmqC4wmOAckUkEwBCTXB8QTHgGQKSKaAhJrgeIJjQDIFJFNAQk1wPMExIJkCkikgoSY4nuAYkEwByRSQUBMcT3AMSKaAZApIqAmOJzgGJFNAMgUk1ATHExwDkikgmQISaoLjCY4ByRSQTAEJNcHxBMeAZApIpoCEmuB4gmNAMgUkU0BCTXA8wTEgmQKSKSChJjie4BiQTAHJFJBQExxPcAxIpoBkCkioCY4nOAYkU0AyBSTUBMcTHAOSKSCZAhJqguMJjgHJFJBMAQk1wfEEx4BkCkimgISa4HiCY0AyBSRTQEJNcDzBMSCZApIpIKEmOJ7gGJBMAckUkFATHE9wDEimgGQKSKgJjic4BiRTQDIFJNQExxMcA5IpIJkCEmqC4wmOAcn0AJBfBYKhWfYvms8AAAAASUVORK5CYII=';

LineDraw.Line.images['r1292x646.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABQwAAAKGAQMAAAA1WERxAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAwRJREFUeJzt0rENgDAQwEAkWobJ/lVGY4RQWHqKuwlc+NrX763pgLNnOuDsng74YE8HnJmxYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTJixYMaEGQtmTKwXylChUHpcTpsAAAAASUVORK5CYII=';

LineDraw.Line.images['l839x1678.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA0cAAAaOAQMAAACjq9QbAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAABeBJREFUeJzt1TFtQwEUxdCk6pCxEALlQbvQy+JLtmwCZ/Tr9VA/T0EPSr9C6SOU/oTSVyidUJpPej8FPSi1J4bUnhjSVyidUJpPak8MqT0xpPbEkE4ozSe1J4bUnhhSe2JIJ5Tmk9oTQ2pPDKk9MaQTSvNJ7YkhtSeG1J4Y0gml+aT2xJDaE0NqTwzphNJ8UntiSO2JIbUnhnRCaT6pPTGk9sSQ2hNDOqE0n9SeGFJ7YkjtiSGdUJpPak8MqT0xpPbEkE4ozSe1J4bUnhhSe2JIJ5Tmk9oTQ2pPDKk9MaQTSvNJ7YkhtSeG1J4Y0gml+aT2xJDaE0NqTwzphNJ8UntiSO2JIbUnhnRCaT6pPTGk9sSQ2hNDOqE0n9SeGFJ7YkjtiSGdUJpPak8MqT0xpPbEkE4ozSe1J4bUnhhSe2JIJ5Tmk9oTQ2pPDKk9MaQTSvNJ7YkhtSeG1J4Y0gml+aT2xJDaE0NqTwzphNJ8UntiSO2JIbUnhnRCaT6pPTGk9sSQ2hNDOqE0n9SeGFJ7YkjtiSGdUJpPak8MqT0xpPbEkE4ozSe1J4bUnhhSe2JIJ5Tmk9oTQ2pPDKk9MaQTSvNJ7YkhtSeG1J4Y0gml+aT2xJDaE0NqTwzphNJ8UntiSO2JIbUnhnRCaT6pPTGk9sSQ2hNDOqE0n9SeGFJ7YkjtiSGdUJpPak8MqT0xpPbEkE4ozSe1J4bUnhhSe2JIJ5Tmk9oTQ2pPDKk9MaQTSvNJ7YkhtSeG1J4Y0gml+aT2xJDaE0NqTwzphNJ8UntiSO2JIbUnhnRCaT6pPTGk9sSQ2hNDOqE0n9SeGFJ7YkjtiSGdUJpPak8MqT0xpPbEkE4ozSe1J4bUnhhSe2JIJ5Tmk9oTQ2pPDKk9MaQTSvNJ7YkhtSeG1J4Y0gml+aT2xJDaE0NqTwzphNJ8UntiSO2JIbUnhnRCaT6pPTGk9sSQ2hNDOqE0n9SeGFJ7YkjtiSGdUJpPak8MqT0xpPbEkE4ozSe1J4bUnhhSe2JIJ5Tmk9oTQ2pPDKk9MaQTSvNJ7YkhtSeG1J4Y0gml+aT2xJDaE0NqTwzphNJ8UntiSO2JIbUnhnRCaT6pPTGk9sSQ2hNDOqE0n9SeGFJ7YkjtiSGdUJpPak8MqT0xpPbEkE4ozSe1J4bUnhhSe2JIJ5Tmk9oTQ2pPDKk9MaQTSvNJ7YkhtSeG1J4Y0gml+aT2xJDaE0NqTwzphNJ8UntiSO2JIbUnhnRCaT6pPTGk9sSQ2hNDOqE0n9SeGFJ7YkjtiSGdUJpPak8MqT0xpPbEkE4ozSe1J4bUnhhSe2JIJ5Tmk9oTQ2pPDKk9MaQTSvNJ7YkhtSeG1J4Y0gml+aT2xJDaE0NqTwzphNJ8UntiSO2JIbUnhnRCaT6pPTGk9sSQ2hNDOqE0n9SeGFJ7YkjtiSGdUJpPak8MqT0xpPbEkE4ozSe1J4bUnhhSe2JIJ5Tmk9oTQ2pPDKk9MaQTSvNJ7YkhtSeG1J4Y0gml+aT2xJDaE0NqTwzphNJ8UntiSO2JIbUnhnRCaT6pPTGk9sSQ2hNDOqE0n9SeGFJ7YkjtiSGdUJpPak8MqT0xpPbEkE4ozSe1J4bUnhhSe2JIJ5Tmk9oTQ2pPDKk9MaQTSvNJ7YkhtSeG1J4Y0gml+aT2xJDaE0NqTwzphNJ8UntiSO2JIbUnhnRCaT6pPTGk9sSQ2hNDOqE0n9SeGFJ7YkjtiSGdUJpPak8MqT0xpPbEkE4ozSe1J4bUnhhSe2JIJ5Tmk9oTQ2pPDKk9MaQTSvNJ7YkhtSeG1J4Y0gml+aT2xJDaE0NqTwzphNJ8UntiSO2JIbUnhnRCaT6pPTGk9sSQ2hNDOqE0n9SeGFJ7YkjtiSGdUJpPak8MqT0xpPbEkE4ozSe1J4bUnhhSe2JIJ5Tmk9oTQ2pPDKk9MaQTSvNJ7YkhtSeG1J4Y0gml+aT2xJDaE0NqTwzphNJ8UntiSO2JIbUnhnRCaT6pPTGk9sSQ2hNDOqE0n/QPpcLRLdgTooMAAAAASUVORK5CYII=';

LineDraw.Line.images['l1678x839.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABo4AAANHAQMAAAAyiT3pAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAABBRJREFUeJzt08EJgEAQwEDBr8XY/+tKs4mFZSRTQT65rr95tgPmvdsB8852wLh7O2BeKwnOdsC4VhK0EqCVBK0EaCVBKwFaSdBKgFYStBKglQStBGglQSsBWknQSoBWErQSoJUErQRoJUErAVpJ0EqAVhK0EqCVBK0EaCVBKwFaSdBKgFYStBKglQStBGglQSsBWknQSoBWErQSoJUErQRoJUErAVpJ0EqAVhK0EqCVBK0EaCVBKwFaSdBKgFYStBKglQStBGglQSsBWknQSoBWErQSoJUErQRoJUErAVpJ0EqAVhK0EqCVBK0EaCVBKwFaSdBKgFYStBKglQStBGglQSsBWknQSoBWErQSoJUErQRoJUErAVpJ0EqAVhK0EqCVBK0EaCVBKwFaSdBKgFYStBKglQStBGglQSsBWknQSoBWErQSoJUErQRoJUErAVpJ0EqAVhK0EqCVBK0EaCVBKwFaSdBKgFYStBKglQStBGglQSsBWknQSoBWErQSoJUErQRoJUErAVpJ0EqAVhK0EqCVBK0EaCVBKwFaSdBKgFYStBKglQStBGglQSsBWknQSoBWErQSoJUErQRoJUErAVpJ0EqAVhK0EqCVBK0EaCVBKwFaSdBKgFYStBKglQStBGglQSsBWknQSoBWErQSoJUErQRoJUErAVpJ0EqAVhK0EqCVBK0EaCVBKwFaSdBKgFYStBKglQStBGglQSsBWknQSoBWErQSoJUErQRoJUErAVpJ0EqAVhK0EqCVBK0EaCVBKwFaSdBKgFYStBKglQStBGglQSsBWknQSoBWErQSoJUErQRoJUErAVpJ0EqAVhK0EqCVBK0EaCVBKwFaSdBKgFYStBKglQStBGglQSsBWknQSoBWErQSoJUErQRoJUErAVpJ0EqAVhK0EqCVBK0EaCVBKwFaSdBKgFYStBKglQStBGglQSsBWknQSoBWErQSoJUErQRoJUErAVpJ0EqAVhK0EqCVBK0EaCVBKwFaSdBKgFYStBKglQStBGglQSsBWknQSoBWErQSoJUErQRoJUErAVpJ0EqAVhK0EqCVBK0EaCVBKwFaSdBKgFYStBKglQStBGglQSsBWknQSoBWErQSoJUErQRoJUErAVpJ0EqAVhK0EqCVBK0EaCVBKwFaSdBKgFYStBKglQStBGglQSsBWknQSoBWErQSoJUErQRoJUErAVpJ0EqAVhK0EqCVBK0EaCVBKwFaSdBKgFYStBKglQStBGglQSsBWknQSoBWErQSoJUErQRoJUErAVpJ0EqAVhK0EqCVBK0EaCVBKwFaSdBKgFYStBKglQStBGglQSsBWknQSoBWErQSoJUErQRoJUErAVpJ0EqAVhK0EqCVBK0EaCVBKwFaSdBKgA9nB9Es/wxq6QAAAABJRU5ErkJggg==';

LineDraw.Line.images['r839x1678.png']='data:image/png;base64,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';

LineDraw.Line.images['r1678x839.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABo4AAANHAQMAAAAyiT3pAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAABBJJREFUeJzt07ENgDAQwEAkWoZh/yqjsUTQ6yLfBG58res473TAfs90wH73dMAP1nTAfs0kaCZCMwmaidBMgmYiNJOgmQjNJGgmQjMJmonQTIJmIjSToJkIzSRoJkIzCZqJ0EyCZiI0k6CZCM0kaCZCMwmaidBMgmYiNJOgmQjNJGgmQjMJmonQTIJmIjSToJkIzSRoJkIzCZqJ0EyCZiI0k6CZCM0kaCZCMwmaidBMgmYiNJOgmQjNJGgmQjMJmonQTIJmIjSToJkIzSRoJkIzCZqJ0EyCZiI0k6CZCM0kaCZCMwmaidBMgmYiNJOgmQjNJGgmQjMJmonQTIJmIjSToJkIzSRoJkIzCZqJ0EyCZiI0k6CZCM0kaCZCMwmaidBMgmYiNJOgmQjNJGgmQjMJmonQTIJmIjSToJkIzSRoJkIzCZqJ0EyCZiI0k6CZCM0kaCZCMwmaidBMgmYiNJOgmQjNJGgmQjMJmonQTIJmIjSToJkIzSRoJkIzCZqJ0EyCZiI0k6CZCM0kaCZCMwmaidBMgmYiNJOgmQjNJGgmQjMJmonQTIJmIjSToJkIzSRoJkIzCZqJ0EyCZiI0k6CZCM0kaCZCMwmaidBMgmYiNJOgmQjNJGgmQjMJmonQTIJmIjSToJkIzSRoJkIzCZqJ0EyCZiI0k6CZCM0kaCZCMwmaidBMgmYiNJOgmQjNJGgmQjMJmonQTIJmIjSToJkIzSRoJkIzCZqJ0EyCZiI0k6CZCM0kaCZCMwmaidBMgmYiNJOgmQjNJGgmQjMJmonQTIJmIjSToJkIzSRoJkIzCZqJ0EyCZiI0k6CZCM0kaCZCMwmaidBMgmYiNJOgmQjNJGgmQjMJmonQTIJmIjSToJkIzSRoJkIzCZqJ0EyCZiI0k6CZCM0kaCZCMwmaidBMgmYiNJOgmQjNJGgmQjMJmonQTIJmIjSToJkIzSRoJkIzCZqJ0EyCZiI0k6CZCM0kaCZCMwmaidBMgmYiNJOgmQjNJGgmQjMJmonQTIJmIjSToJkIzSRoJkIzCZqJ0EyCZiI0k6CZCM0kaCZCMwmaidBMgmYiNJOgmQjNJGgmQjMJmonQTIJmIjSToJkIzSRoJkIzCZqJ0EyCZiI0k6CZCM0kaCZCMwmaidBMgmYiNJOgmQjNJGgmQjMJmonQTIJmIjSToJkIzSRoJkIzCZqJ0EyCZiI0k6CZCM0kaCZCMwmaidBMgmYiNJOgmQjNJGgmQjMJmonQTIJmIjSToJkIzSRoJkIzCZqJ0EyCZiI0k6CZCM0kaCZCMwmaidBMgmYiNJOgmQjNJGgmQjMJmonQTIJmIjSToJkIzSRoJkIzCZqJ0EyCZiI0k6CZCM0kaCZCMwmaidBMgmYiNJOgmQgnzvQB3DTRLD/qaHUAAAAASUVORK5CYII=';

LineDraw.Line.images['l1x5.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAFAQMAAAC+ShTcAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAAxJREFUCJljaGCAQgAMigKBJxHSGwAAAABJRU5ErkJggg==';

LineDraw.Line.images['l5x1.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAABAQMAAAAsMPawAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAApJREFUCJlj+AEAAPoA+eu71x4AAAAASUVORK5CYII=';

