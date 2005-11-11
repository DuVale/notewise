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

    destroy: function() {
        if(this.img != undefined){
            this.img.parentNode.removeChild(this.img);
            this.img=undefined;
        }
    },

    update: function(){
        var w = Math.abs(this.x1-this.x2);
        var h = Math.abs(this.y2-this.y1);
        var x = Math.min(this.x1,this.x2);
        var y = Math.min(this.y1,this.y2);
        var length = Math.sqrt(w*w+h*h);
        var ratio = w/h;
        var direction;
        if( (this.x2 > this.x1 && this.y2 < this.y1)
            || (this.x2 < this.x1 && this.y2 > this.y1) ){
            direction = 'l';
        } else {
            direction = 'r';
        }
        var imageDir = 'generate-images';
        var imageName;
    
        if(length < 100){
        
            if(ratio < 0.02){
                // this is a special case, since this image is only one pixel
                // wide, and thus can't be stretched at all horizontally.  So we just
                // pretend they wanted a vertical line, and average the x's
                w=1;
                x = (this.x1+this.x2)/2;
                imageName='l1x5.png';
            } else if(ratio < 0.09){
                imageName=direction+'6x99.png';
            } else if(ratio < 0.18){
                imageName=direction+'12x99.png';
            } else if(ratio < 0.41){
                imageName=direction+'24x97.png';
            } else if(ratio < 0.79){
                imageName=direction+'50x86.png';
            } else if(ratio < 1.38){
                imageName=direction+'70x70.png';
            } else if(ratio < 2.90){
                imageName=direction+'86x49.png';
            } else if(ratio < 6.15){
                imageName=direction+'97x24.png';
            } else if(ratio < 12.38){
                imageName=direction+'99x12.png';
            } else if(ratio < 24.75){
                imageName=direction+'99x6.png';
            } else if(ratio < 66.00){
                imageName=direction+'99x3.png';
            }    else {
                // this is a special case, since this image is only one pixel
                // high, and thus can't be stretched at all vertially.  So we just
                // pretend they wanted a horizontal line, and average the y's
                h=1;
                y = (this.y1+this.y2)/2;
                imageName='l5x1.png';
            }
        }
    
        else if(length < 400){
        
            if(ratio < 0.02){
                // this is a special case, since this image is only one pixel
                // wide, and thus can't be stretched at all horizontally.  So we just
                // pretend they wanted a vertical line, and average the x's
                w=1;
                x = (this.x1+this.x2)/2;
                imageName='l1x5.png';
            } else if(ratio < 0.09){
                imageName=direction+'24x399.png';
            } else if(ratio < 0.18){
                imageName=direction+'48x397.png';
            } else if(ratio < 0.41){
                imageName=direction+'96x388.png';
            } else if(ratio < 0.79){
                imageName=direction+'200x346.png';
            } else if(ratio < 1.38){
                imageName=direction+'282x282.png';
            } else if(ratio < 2.90){
                imageName=direction+'346x199.png';
            } else if(ratio < 6.15){
                imageName=direction+'388x96.png';
            } else if(ratio < 12.38){
                imageName=direction+'397x48.png';
            } else if(ratio < 24.75){
                imageName=direction+'399x24.png';
            } else if(ratio < 66.00){
                imageName=direction+'399x13.png';
            }    else {
                // this is a special case, since this image is only one pixel
                // high, and thus can't be stretched at all vertially.  So we just
                // pretend they wanted a horizontal line, and average the y's
                h=1;
                y = (this.y1+this.y2)/2;
                imageName='l5x1.png';
            }
        }
    
        else {
        
            if(ratio < 0.02){
                // this is a special case, since this image is only one pixel
                // wide, and thus can't be stretched at all horizontally.  So we just
                // pretend they wanted a vertical line, and average the x's
                w=1;
                x = (this.x1+this.x2)/2;
                imageName='l1x5.png';
            } else if(ratio < 0.09){
                imageName=direction+'48x798.png';
            } else if(ratio < 0.18){
                imageName=direction+'97x794.png';
            } else if(ratio < 0.41){
                imageName=direction+'193x776.png';
            } else if(ratio < 0.79){
                imageName=direction+'400x692.png';
            } else if(ratio < 1.38){
                imageName=direction+'565x565.png';
            } else if(ratio < 2.90){
                imageName=direction+'692x399.png';
            } else if(ratio < 6.15){
                imageName=direction+'776x193.png';
            } else if(ratio < 12.38){
                imageName=direction+'794x97.png';
            } else if(ratio < 24.75){
                imageName=direction+'798x48.png';
            } else if(ratio < 66.00){
                imageName=direction+'799x27.png';
            }    else {
                // this is a special case, since this image is only one pixel
                // high, and thus can't be stretched at all vertially.  So we just
                // pretend they wanted a horizontal line, and average the y's
                h=1;
                y = (this.y1+this.y2)/2;
                imageName='l5x1.png';
            }
        }
    
        this.img.src = LineDraw.Line.images[imageName];
        this.img.style.left=x+"px";
        this.img.style.top=y+"px";
        this.img.style.width=w+"px";
        this.img.style.height=h+"px";
//        window.status = imageName + ' height: '+this.img.style.height + ' width: '+this.img.style.width;
     }

}

LineDraw.Line.images = {};
LineDraw.Line.images['r6x99.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAABjAQMAAACCO+PiAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABpJREFUCJljaGDAhA5EQgWioACRkINIyIIJAVxuDmm2vpE7AAAAAElFTkSuQmCC';

LineDraw.Line.images['l6x99.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAABjAQMAAACCO+PiAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABpJREFUCJljYGHAhBxEQgGioAKR0IFI2IAJAdBUDnnY6eKbAAAAAElFTkSuQmCC';

LineDraw.Line.images['r12x99.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAABjAQMAAACVGXMrAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACdJREFUGJVjaGBgQEYOuJECbiSAG3HgRiw4EBNuxIgbMTTgRlTwFQAiQA8kp+DeWAAAAABJRU5ErkJggg==';

LineDraw.Line.images['l12x99.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAABjAQMAAACVGXMrAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACdJREFUGJVjYBBgQEEKuJEDbtSAEzEy4ERMOBALbsSBGwngRtTwEwBwmQ8mUGOZtAAAAABJRU5ErkJggg==';

LineDraw.Line.images['r24x97.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAABhAQMAAAD2lPOyAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAADBJREFUGJVjaGBgYIBhBzSsgIYF0DAHGmZBw0xYMCMahltOLUcQ4xCSHUGL0IA7AABkGwu+QIeauwAAAABJRU5ErkJggg==';

LineDraw.Line.images['l24x97.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAABhAQMAAAD2lPOyAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAADBJREFUGJVjYGBgZEBgJjTMgoY50LAAGlZAww5YcAMqRraeGk4gxhkkOoEWIYFkPQBu9gvGspsK8wAAAABJRU5ErkJggg==';

LineDraw.Line.images['r50x86.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAABWAQMAAAC3lFe+AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAEJJREFUKJFjaGCAAAc0WgGNFkCjOaA0CxrNhEYzotEMpFrIgUYTayHcokFnIa6gJGQhzqAccAsV0GhiLSQ6scAtBABFoguDZOGPjQAAAABJRU5ErkJggg==';

LineDraw.Line.images['l50x86.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAABWAQMAAAC3lFe+AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAEVJREFUKJFjYAADBwjF0IBKMzKg0kxoNAuU5kCjBdBoBTSaROtY0GhirXNAoweHdbgCkZB1Cmj04LCO2CSCbh2xSQTNOgCvEguDl5TqbwAAAABJRU5ErkJggg==';

LineDraw.Line.images['r70x70.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAABGAQMAAABL4HDHAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAChJREFUKJFjaGCAAQc4SwHOEoCzOOAsFjiLCc5ihLMYRg0cNZA+BgIAzpAI9c0nJ/YAAAAASUVORK5CYII=';

LineDraw.Line.images['l70x70.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAABGAQMAAABL4HDHAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAClJREFUKJFjYIACFhiDgQPOEoCzFOAsBzirAcZghAsxwVmjxo0aR2vjALOJCPUiMR8NAAAAAElFTkSuQmCC';

LineDraw.Line.images['r86x49.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAAAxAQMAAAB6acxWAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAADVJREFUKJFjaGBAgAQktgQSmw2JzYjEZjiAxDZAYvMgsZmRNdDcNiZkzSPdNhYkNko00MY2AP3LCvMvnS04AAAAAElFTkSuQmCC';

LineDraw.Line.images['l86x49.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAAAxAQMAAAB6acxWAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAADlJREFUKJFjYIADFgSTQQKJnYBgMjYg2ExISniQ2AZI7AMIJjOSMG1tYkQSZhuZNjEg2YQc8LS1CQAsKwrzhjOZlQAAAABJRU5ErkJggg==';

LineDraw.Line.images['r97x24.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGEAAAAYAQMAAADQ5QHpAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAADBJREFUGJVjeMCADORQeIzkS35A4fKj8BjIl/yBwmNvQOFWkCB5AIVrg8JjJl+yAQBYNAx1tt1gOwAAAABJRU5ErkJggg==';

LineDraw.Line.images['l97x24.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGEAAAAYAQMAAADQ5QHpAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAADdJREFUGJVjYEAA5gYkDoMNMof5ADlS7ChSFShSDURK/UDm8CNzGD6QI8WIIiWHIvWAHCkGFCkACZAMdUuS8XcAAAAASUVORK5CYII=';

LineDraw.Line.images['r99x12.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAAAMAQMAAABMV5FZAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAADBJREFUCJlj+MGADNj/oHCZ/6FwGf+jcBn+N6Bw69G4B1C49g9QuPIfULj8+N3xAABAbAzVxlM5HwAAAABJRU5ErkJggg==';

LineDraw.Line.images['l99x12.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAAAMAQMAAABMV5FZAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAADRJREFUCJljYEAA5gdIHPY/SBz+H0gc+Q9IHHtkPfUHkDkNSJz/SBzG/8h2/sNlJwOynQwALfAM1TEXt1IAAAAASUVORK5CYII=';

LineDraw.Line.images['r99x6.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAAAGAQMAAADtzLI/AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACJJREFUCJlj+H+AARnY//+Dwmf+/78BRaD+/w8UPjuGggcAIzoM1UudImgAAAAASUVORK5CYII=';

LineDraw.Line.images['l99x6.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAAAGAQMAAADtzLI/AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAACZJREFUCJljYECA+gdwJvv//w1w4f8/YExmJGH7/38QWv8fQDIHABSuDNUDP4uHAAAAAElFTkSuQmCC';

LineDraw.Line.images['r99x3.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAAADAQMAAAC9ASOMAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABtJREFUCJlj+P//fwMDMqj/DwIHUMTs//9/AAATlwzVIohAMAAAAABJRU5ErkJggg==';

LineDraw.Line.images['l99x3.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAAADAQMAAAC9ASOMAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAABxJREFUCJljYIAB+///H4Do+v8gcADEBNINcHkACRcM1ey2ka4AAAAASUVORK5CYII=';

LineDraw.Line.images['r24x399.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAGPAQMAAAB8rYL0AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAEVJREFUOI3V1DERACAMBMGHoaBEQqS8tEhHQiiuCMU6uDmlpIoBATmADViQCRiAMoJXBgSgSyhULF1CwWIxICBdYvnqKhcVNS+XxqOb2AAAAABJRU5ErkJggg==';

LineDraw.Line.images['l24x399.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAGPAQMAAAB8rYL0AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAENJREFUOI3d0jENACAMRcEPYWBEQqVUWqUjoSS8oTCcg5PUlOuAAZmABTCIA+LeSYOXqlRpQlVxQDB+alKpikEcELkNxMMvn4Z1t0oAAAAASUVORK5CYII=';

LineDraw.Line.images['r48x397.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAGNAQMAAABt72DbAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAF9JREFUSInt1LENwCAMRFGCUqRkBI/i0Rg9EqJ28U9CRuDmDfB1Lr2Mi3CIaTTIB3k1KuTRCMtFuIZBVlcV49KqYlxcdeIQg9CqZ012t6qTQyZ7H3Hmyd5HnHmyGR/xD4IVMPCqwu4ZAAAAAElFTkSuQmCC';

LineDraw.Line.images['l48x397.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAGNAQMAAABt72DbAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAF1JREFUSInt1MENACAIQ1E0Hjw6gqMwGqMbJ9C0RkOQyxvgp4jMS7IkgxSOCtJAOoeCGMVGvqNNybS3m5JplcMw0KaP5oo2DTVXZ01jzdUogrzgR3NVDsP4c3X9ggcp2zBxpviLYwAAAABJRU5ErkJggg==';

LineDraw.Line.images['r96x388.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAGEAQMAAADz9LdbAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAHFJREFUWIXt1rENgDAMRNEDUaRkBI+S0Rg9SgdGSfGrKLrrXv1lyXr02hgVIABugAJwAZwAB8AkwxgVIAB2C+RaGSvXcqAM19LatRxILNAHAeBa8jn1+ZfICIDdajmQWCDXyggAn5P8S/zgWnKgvkmTBiHlL+ybPzRzAAAAAElFTkSuQmCC';

LineDraw.Line.images['l96x388.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAGEAQMAAADz9LdbAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAGxJREFUWIXt1rEJwDAMRFEluEiZETyKR9PoLkNUSUcINnx1v34cyOy5w1JxCtGEuIS4hehCDCG8HkkReD7geYXXAyumZP/xYLWPFTwSD1b7WMGDVYyVrbwe8GAVY2WrLsQQwuvBB4FVDHiyIhNX0i/sRlOKxgAAAABJRU5ErkJggg==';

LineDraw.Line.images['r200x346.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAFaAQMAAABhT4AhAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAMZJREFUaIHt1rENAzEMQ1EluCJlRtAoGu1GzwRkQRg5QqDb1/3CVN2F3gjSgnwF+UC5BHkL8hKkbigjSAuiJHWOTZJiGUFakMSu07HPfhb/in34s8AygjSUxKYyUFqQ52MbzCCWgdKCJHY5zGAOPCotyLbYBjOIxXkGE5vKupsDS0N5fgYTm8q6mwPLQGlBEpvKQGlBtt0cOfCoJHY5zGAOPCqJXQ4zmAOPSmKXwwzmwKOS2OUwgznwqLQg22IbzCAW5xkksX+cRiq7QaAibQAAAABJRU5ErkJggg==';

LineDraw.Line.images['l200x346.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAFaAQMAAABhT4AhAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAKJJREFUaIHtlrERw0AMw+hcCpceIaP8aBrdE7B4nc9Px1CLDoVAydzmgD4N8m2QvUEOS34NMhqk5kmyai80WLUXiuq/U33tm7hLdc0TVD9U9fr4dVSPBql5guoA1evjx6RDtaLjx6RDtaLjx6RDtaLjx6RDtaLjx6RDtbLj50k5sD5+qH7RzvBkWFLzBNUPVb0+fkw6VGfHj0mHakXH7zWT7gRwISq7CFvsiQAAAABJRU5ErkJggg==';

LineDraw.Line.images['r282x282.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARoAAAEaAQMAAAD0fQr5AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAKVJREFUaIHt0DERA0EAw8BL5ouUgWAohnbQf8xAAKR6K517QCUoBP0J+hH0EPQl6EPQuQSVoBDkKEetEhSCHOWoVYJCkKMctUpQCHKUo1YJCkGOctQqQSHIUY5aJSgEOcpRqwSFIEc5apWgEOQoR60SFIIc5ahVgkKQoxy1SlAIcpSjVgkKQY5y1CpBIchRjlolKAQ5ylGrBIUgRzlqlaAQ5ChHrb69GSOeV+r5FgAAAABJRU5ErkJggg==';

LineDraw.Line.images['l282x282.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARoAAAEaAQMAAAD0fQr5AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAGhJREFUaIHt0LENgDAAA0GDUlAyAqNktIyeEeIaneuXi0vOm0WTVTRXc3Q30Wiip4neJvqaaDbRKhpMmDBhwoQJEyZMmDBhwoQJEyZMwYQJEyZMmDBhCiZMmDBhwoQJUzBhwoQJ08+ZNncHI554IUFTAAAAAElFTkSuQmCC';

LineDraw.Line.images['r346x199.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVoAAADHAQMAAABiEAkcAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAMFJREFUaIHtlrENQjEQxf4HhCgoKCkzAiNklBslo2U06le6iESQXbu7k/WOcQCKyG8i34l8EvmYRP4Q+UnkC5HPQewiMjrLjchXIi88y4PI7PEGsTuR1z0eO8sgchHZHgT2IJlE3rIHReQXkRf2YBK5EdkeBPYgmUS2B4E9CJxtSRH5/zNtDwJ7kHQi24Ngyx442wJ7kHQi24PAHgT2IHG2Bc62wB4kRWR7ENiDZBK5EdnZFmw52+xBYA+SRuSf6cEX1KErltIyCgwAAAAASUVORK5CYII=';

LineDraw.Line.images['l346x199.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVoAAADHAQMAAABiEAkcAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAMhJREFUaIHtlrENwjAUBR1AiIKCkjIjMEJG+aN4NI+WkldyhQuju/oURfrW6bX2Owdwtw7kO3Dbm8g7kQdwr+TDTyK/iFzAnXeSB5E/RB7ARSe5ERk9uSJyB+68J4dOcgDXCgRWILACX9BJLuQv5lVgAHcjH7YCgRUIBnCtQGAFgiJyB67zLFgwzFYgsAJBB64VCBasgPMssAJBB64VCKxAUMD99wo4zwLnWbATeQDXCgRWICjgWoHAeRYsOM+sQFDAtQLBghU4AVpNK5Z438urAAAAAElFTkSuQmCC';

LineDraw.Line.images['r388x96.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAYQAAABgAQMAAAAn0ZewAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAGdJREFUWIXt1qENgEAUBNFPECfpABohVxMSSWmUQgnIk7RwIy4hP7N+8uzGE3QrLiYRkXHIi5MFFyEi0otcODlxUURExiE3TnZczCIinau4SHRwRDIgGy5+e3BEMiANF4kOjkgG5PgA5BgwwQasHpMAAAAASUVORK5CYII=';

LineDraw.Line.images['l388x96.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAYQAAABgAQMAAAAn0ZewAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAGxJREFUWIXt1qENgDAYBeG/QVR2A1iEMBMSyWiMwghIJBs0uaSCNvf85bMvAm6nQT5pcUhINCVeGhQaxCMhUdlCg3TTYpaQaEpsNJguWqwSEpVlTIxxWSQ6Jgom/nhZJDomEibGuCwSHROBiQ+JtzDBQjho8gAAAABJRU5ErkJggg==';

LineDraw.Line.images['r397x48.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAY0AAAAwAQMAAADXSrSNAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAFlJREFUSIlj+MFAMmAnR88f0vUw00vPP9L1MJKj5z/pehjI0tNAup56euk5QLoee3L0PCBdjzw5ej6QroefXnpGM/do5gaB0cw9mrlBYFBnbnpl1MGcuX8AADFNMcgwTSYcAAAAAElFTkSuQmCC';

LineDraw.Line.images['l397x48.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAY0AAAAwAQMAAADXSrSNAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAGNJREFUSIljYCAV/CBZx39SNTCSruMf7XUwk67jD6k62EnXQXJ88JOu4wPtdciTruMBqTrsSddxgFQd9aTraKC9jv+k6yBVAz0yLT2y4GimJR6MZlpa6hjNtDTUQY9MS0ZbCQD97zHIfqeILAAAAABJRU5ErkJggg==';

LineDraw.Line.images['r399x24.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAY8AAAAYAQMAAAA4QOPrAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAEZJREFUOI1j+N/AQDKo/3+AdE32/z+Qron//w/SNbH//0O6Jub//0nXxPB/NPgggPn/P9I1MdIz+B6Qrkl+NPigYLAH3z8AZi8xzggKzIkAAAAASUVORK5CYII=';

LineDraw.Line.images['l399x24.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAY8AAAAYAQMAAAA4QOPrAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAFNJREFUOI1jYCARMP8jUQP7/z+kaZD//4M0Dfb/H5Cmof7/AZLUM/7/30CSBub/JIbSaCARAUgOJH7SA+kDaRpIDSQG0gPpP2kWDIdAYiAxkIAAAM2dMc4jmqLGAAAAAElFTkSuQmCC';

LineDraw.Line.images['r399x13.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAY8AAAANAQMAAABrW3DDAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAElJREFUKJFj+P+/gYFkUP////8DpGuzB2p7QLo2eaC2H6RrYwdq+0O6Nmagtn+ka2MEavtPujYGkLYG0rVREAMfSNfGT+cY+AcAKZoxzlmC+sAAAAAASUVORK5CYII=';

LineDraw.Line.images['l399x13.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAY8AAAANAQMAAABrW3DDAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAFFJREFUKJGV0LERQBEAg2FOoTTCG8VojGYUIygV70RskKT+LsUfgreE4/AM4Nd5Id86r+RL54186JwaXdbxcf08URslzY6f33Hq3Oz4SnaHcxfdMDHOMIjA9wAAAABJRU5ErkJggg==';

LineDraw.Line.images['r48x798.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAMeAQMAAABhghUfAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAF5JREFUWIXt1bENgDAUA9GAKCgZwaNkNEZHoqX7Iboi5+ZNcHK727sqnSEMF8PJcDDsDBtDubxBOkMYFgnXYi32b8KwSLGGa7iTCIPhGq7hjhAGi7VYiy0RBq/WcD88YJVhe5ITKCIAAAAASUVORK5CYII=';

LineDraw.Line.images['l48x798.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAMeAQMAAABhghUfAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAFdJREFUWIXt08ENwCAMwMBQ8eDZEToKo2V0xAyRsKjsjye4iF2L0h5mndlg9jL7mE1miazIT7ay1evB6VWvsi0skclWtrItLJHJ9ods9apXvd7jVba3sF0sBGF79HD5pgAAAABJRU5ErkJggg==';

LineDraw.Line.images['r97x794.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGEAAAMaAQMAAACsxbp/AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAKpJREFUaIHt17ENw1AMA1HbSOHSI2gUjpbR0yZFGkM8Ad9k9wa4gtt7+95dCVbBumCdo3rBOmDtsG5n1SPBKliJ06nV4xxOVbAKFh3nbKqJ06nE2azE6VTitEqwClbidIqO82EPVLBqVImzV4nTKsGqUSXOXiVOqwSrRpU4nUqczdKoClbidCpxNkujKliJ06nE2SyNqmCtHuezHujycf5KsApW4nQqcf7TBzS9YyaEbOcwAAAAAElFTkSuQmCC';

LineDraw.Line.images['l97x794.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGEAAAMaAQMAAACsxbp/AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAKNJREFUaIHt2rENAlEQA9EPIiCkBEpxaS6dlALWs9KdN3sFTGBpz/k7nwE9DqsnrBes96o+sL6wBMubapqzappJaVVm1TSTapqz0qrMqmkm1TRnpVWZVdNMqmkmJVhmdfU077U8m2ZSZtU0k2qaSQmWWTXNpK6e5r2Wp1nRad5reTbNpATLrJpmUk0zKcEyq6aZVB8QkhIsb6ppzqppJiVYntAPVVljJn7VrFgAAAAASUVORK5CYII=';

LineDraw.Line.images['r193x776.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMEAAAMIAQMAAABLgxM+AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAQdJREFUeJzt0zFuQlEUxFBAKSizhFnKLO0uPdLtA9ITMr+w21P7Nrf/OpFCEkh+IXlC8gPJA5I7JEcznEghCSQO5EDbQFJIAokDOdA2kBSSQEIN5Fqu9UYKSSBxIAfaBpJCEkgcyIG2gaSQBBIHcqDX4lqH4lqutQ0khSSQOJADbQNJIQkkDuRA20BSSPJ1cS3X2gaSQhJIHMiBtoGkkAQSB3KgbSApJIHEga49kGt9XAKJa117LQc6lEDiQA60DSSFJJA4kANtA0m/LoHEtVxrG0gKSSBxIAfaBpJCEkgcyIG2gaSQBBIHcq3X4lqH4loOtA0khSSQOJADbQNJIQkkDuRA25zIHy84YRiRLZnLAAAAAElFTkSuQmCC';

LineDraw.Line.images['l193x776.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMEAAAMIAQMAAABLgxM+AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAQ5JREFUeJzt07EJAgEUBFEVA0NL+KVsaVu6/ALuApE5kNn0seHcbgfrEXwj98PLb+UByROSFyRvSAaSQFJGzMd8dgNJICkj5mM+u4EkkJQR8zGscxlIAkkZMSzz2Q0kgaSMmI/57AaSQFJGzMd8dgNJLpcyYliGtRtIAkkZMR/z2Q0kgaSMmI/57AaSQFJG/i0fwzKscykj/xaW+ZjProyYj/nsBpJAUkbMx3x2c7kEkjJiWIa1G0gCSRkxH/PZDSSBpIyYj/nsBpJAUkaofAzLsM4lkJQR8zGf3UASSMqI+ZjPbiAJJGXEfMznXAaSQFJGDMuwdgNJICkj5mM+u4EkkJQR8zGf3UASSPpL+QBCGmEYnTuN2AAAAABJRU5ErkJggg==';

LineDraw.Line.images['r400x692.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAK0AQMAAAAXpPkyAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAf5JREFUeJzt1rFtBTAMA9GfIEXKjMBRNJpHzwx0cSBkqn/dQeDnfOwbhAghfwj59ckPQr4R8uWTz0HIIEQIYbpsyvYdhAxChJCm7N5Fl03Zvti10JTtOwgZhMgnj6ccuxZWpSyENGWA5KY8CBFCYlOOXQtN2T4hpCkDZNVauCBCyKa10JTtG4QIIU3Zvdy1cEEGIfJJ7FpoyvYdhIxPhJDHU45dC03ZvqYMkNyUByFCSGzKsWuhKdsnhDRlgKxaCxdECNm0FpqyfYMQIaQpu5e7Fi7IIEQ+iV0LTdm+g5DxiRDyeMqxa6Ep29eUAZKb8iBECIlNOXYtNGX7hJCmDJBVa+GCCCGb1kJTtm8QIp/EvthNKeeuhQsyCJFPmrJ7Tdk+IeTxlGPXQlO2rykDJDflQYgQEpty7FpoyvYJIZte7KaUc9fCBRFCmjJAmrJ9sWthU8q5a+GCDELkk6bsXlO2Twh5POXYtdCU7YtNOfbFrkp5ECKENGWANGWCbFoLm1LOXQsXRAhpygBpyvbFroVNKeeuhQsyCJFPmrJ7Tdk+IeTxlGPXQlO2Lzbl2Be7KuVBiBDSlAHSlAmyaS1sSjl3LVwQIaQpA6Qp2xe7FjalnLsWLsggRD55POXYF7sqZSGkKQOkKRMkNuXYtbAq5UGIENKUAdKUCbJpLeSm/A/gBFW0QaOmcAAAAABJRU5ErkJggg==';

LineDraw.Line.images['l400x692.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAK0AQMAAAAXpPkyAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAgNJREFUeJzt1rFtBUEMA9Fvw4FDl7ClqDSW7hq4wA0IHZW/bCDw83Hvyxafb4T8IOQXIX8+OQgZhMgWF1U2ZPcuqmzI5jVk9xqyeyLIy0OO3QkN2byGDJDYkAchIkhsyLE7oSG7J4Jseq+bQj4IGYSIIA0ZIA3ZvNidsCnk2J1wQQYhskVDdq8huyeCvDzk2J3QkM2LDTn2vW4KeRAigjRkgDTk58mmnbAp5IOQQYgI0pAB0pDNi90Jm0KO3QkXZBAiWzRk9xqyeyLIy0OO3QkN2bzYkGPf66aQByEiSEMGSEN+nmzaCZtCPggZhIggDRkgDdm82J2wKeTYnXBBBiGyxctDjn2vm0IWQRoyQBry8yQ25NidsCnkQYgI0pAB0pCfJ5t2wqaQD0IGISJIQ3Yv9r1ekEGIbBG7ExqyewchgxDZ4uUhx+6ETSGLIA0ZIA35eRIbcuxO2BTyIEQEacgA2fReL4gIsmknNGT3BiEiSEN2L3YnXJBBiGwRuxMasnsHIYMQ2eLlIcfuhE0hiyANGSAN+XkSG3LsTtgU8iBEBGnIANn0Xi+ICLJpJzRk9wYhIkhDdi92J1yQQYhsEbsTGrJ7ByGDENni5SHH7oRNIYsgDRkgsSEPQkSQ2JBjd0JDdk8EacgA2bQTLogIsmknNGT3BiEiSEN2L3YnXJBBiGzxD30iVbRgubn+AAAAAElFTkSuQmCC';

LineDraw.Line.images['r565x565.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjUAAAI1AQMAAAAU25nbAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAWJJREFUeJzt0jFVRAEUxcAPh4ISCStlpa10HOQ2r5wRkCrP57nxPuq8jjp/R53fo87PUef7qPN11Hk+R533Ued11DFQM9BgoGagwUDNQIOBmoEGAzUDDQZqBhoM1Aw0GKgZaDBQM9BgoGagwUDNQIOBmoEGAzUDDQZqBhoM1Aw0GKgZaDBQM9BgoGagwUDNQIOBmoEGAzUDDQZqBhoM1Aw0GKgZaDBQM9BgoGagwUDNQIOBmoEGAzUDDQZqBhoM1Aw0GKgZaDBQM9BgoGagwUDNQIOBmoEGAzUDDQZqBhoM1Aw0GKgZaDBQM9BgoGagwUDNQIOBmoEGAzUDDQZqBhoM1Aw0GKgZaDBQM9BgoGagwUDNQIOBmoEGAzUDDQZqBhoM1Aw0GKgZaDBQM9BgoGagwUDNQIOBmoEGAzUDDQZqBhoM1Aw0GKgZaDBQM9BgoGagwUDNQIOBmoEGAzUDDWcD/QOTHEazUIchtAAAAABJRU5ErkJggg==';

LineDraw.Line.images['l565x565.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjUAAAI1AQMAAAAU25nbAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAVJJREFUeJzt0jEVwlAABMEPjyIlEpCCtEiPg62unBGw1Z4zcW0y5zvq/Ead/6hzbzKvTea8R53PqGOfdm8y9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJ9mn2SfZp9kn2afZJDyxZRrPBxlk+AAAAAElFTkSuQmCC';

LineDraw.Line.images['r692x399.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArQAAAGPAQMAAACXpdFqAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAjFJREFUeJztmLGtVTEUBN8HhAgICAldAiW4FJfi0k5pBN4WJlhppoBJrs6Orj/3w3Ag71/I+xPyfkHez0Def5D3N+T9Bnm/LiQ+kPcP5KU+3HfIi13Ggrx1k3Yh8Ya8bZOGXcaFvAfy1l0G5K2L/S/IWzdpB/Ia+zCQd0Heukm7kHhD3rbY+/8SqMv4AXnrJs3YP+ouw9iHgbwL8tbFHvLWTZqxDwfyGvswkNfYP+ouw9iHC3kP5DX2YSCvsX/UTZqxDwN5jf3Dx8pg7MOBvMY+DORtuwxjH4x9GMi7IG/dpF1IvCFv26QZ+1B3GZC3Lvb+v4QDeX2sDAN5F+Stm7QLiTfkNfbhQt4Def1/CQN5jf3D2Ie6SRvIuyCvsQ8b8rbF3sfKYOzDQF5j/6i7DGMfBvIuyFsXe8hbN2nGPhzIa+zDQF5j//D/JdTF/kLeA3mNfRjI23YZxj4Y+zCQd0Heukm7kHhD3rZJM/ah7jIgr7EPxj74WBkG8i7IWzdpFxJvyNs2acY+1F0G5K2LvY+V4UBeYx8G8i7IWzdpFxJvyNsWe/9fgo+VYSCvsX/UXYaxDwN5F+Stiz3krZs0Yx8O5DX2YSCvsX/UXYaxDxfyHshr7MNAXmP/qJs0Yx8G8hr7h4+VwdiHA3mNfRjI23YZxj4Y+zCQd0Heukm7kHhD3rZJM/ah7jIgb13s/X8JB/L6WBkG8i7IWzdpFxJvyGvsw4W8B/L6/xIG8hr7R1/s/wMBC1ab4NB1dQAAAABJRU5ErkJggg==';

LineDraw.Line.images['l692x399.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArQAAAGPAQMAAACXpdFqAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAh5JREFUeJztmLGNGEEMxO79D8OBgw8/3BJcwpWiUrY0lWZAUwMDAWQBTA4j4vZ5EL4Z7VOM9uMy3t+M9vkDef9B3ma0n4z2+YK8P5C3IO9ltNRn+wt5qVW8jHbbMaNWcSBvM9ptqzDxg4kPzWg/GO26Y1aQ9zLabcfMxA/bVnEgbzNa/1dCMVpqFb8Y7bpj1ozWxIeCvJfRmvjwMtptifd/ZTDxoRitiQ/LVmHiQ0Hey2i3Jd4nycHEh2a0Jj4UozXxYdkqTHw4kLcZrYkPxWhNfFh2zEx8KEZr4oNPkoOJD81oTXwoRrttFSZ+8H8lFOS9jHbbMTPxw7ZVHMjbjHbbKkz84P9KaEZr4kNB3stotx0zEz9sW8WBvM1ofZIMxWhNfDDxw7ZjVpD3MloTH15Guy3xPkkOJj4UozXxYdkqTHw4kLcZ7bbE+yQ5mPjQjNbEh2K0Jj74vzKY+NCM1sSHYrTbVmHiBxMfCvJeRrvtmJn4wcSHZrTbVmHiBxMfmtH6JBkK8l5Gu+2Ymfhh2yoO5G1G6/9KKEbrk2Qw8cO2Y1aQ9zJaEx9eRrst8f6vDCY+FKM18WHZKkx8KMh7Ge22xPskOZj40IzWxIditCY+LFuFiQ8H8jajNfGhGK2JD8uOmYkPxWhNfPBJcjDxoRmtiQ/FaLetwsQP/q+EgryX0W47ZiZ+2LaKA3mb0W5bhYkf/F8JzWhNfCjIexntf8CGVpu6BtD8AAAAAElFTkSuQmCC';

LineDraw.Line.images['r776x193.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAwgAAADBAQMAAABRxAW1AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAANBJREFUeJzt2qERwgAURMEwCCQdQCMMdSEQKY1SUgISSQtrfkTmvQZu1t+yLdPdxhdO2/hECCqEFYIKYYWgQlghqBDWfXxh+Y4vXMcXQlghrBBUCCsEFcIKQYWwdkCs4xOv8YXLOj4RggphhaBCWCGoEFYIKoT1Hl84f8YnHuMLIawQVAgrBBXCCkGFsEJQOyCe4ws9L6wQVAgrBBXCCkGFsEJQx0B0WqBCWCGoEFYIKoQVggphhaB2QPzGF3peWCGoEFYIKoQVggphhaCOgfgD/GFgoNGaN+wAAAAASUVORK5CYII=';

LineDraw.Line.images['l776x193.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAwgAAADBAQMAAABRxAW1AAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAN1JREFUeJzt2qERwgAUBNGfQUSmA2iEoS4EIqVRSkpAIinh1pwgs9vAzfM3U25tD8yzPbDu7QUJOQkgCTkJIAk5CSAJOQmgb3tgaw/Mpz0gASQhJwEkIScBJCEnASQhVycsdcK1PbAc7QUJOQkgCTkJIAk5CSAJOQmgR3vg8m4v3NsDEkASchJAEnISQBJyEkAScn3Cqz3gQwIkIScBJCEnASQhJwEkIXcCwra3F/7/XiABJAEkIScBJCEnASQhJwFUJ9zaAz4kQBJyEkASchJAEnISQBJyJyDM0R74Ad0OYKAv2w+0AAAAAElFTkSuQmCC';

LineDraw.Line.images['r794x97.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAxoAAABhAQMAAABrg0WOAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAKFJREFUaIHt1rEVgzAUxVDnUFAyAqMwWjyaR2GElBQcyAy/USE/LXBbtasBrVGqyk0oS5Sq8hDKJ0pVeQmlqZROKN8oVWUQyhGlqpyEskepKj9C2aJUFdOOmxTTjmf6Z1ZUO25SOqGopp9RBqGopp9RTkJRTT+jmHY80z+zYtpxk2LacZOi2nGT0glFNf2MMggl019NteOMYtpxk2LacZMy/nVDY15Awj0oAAAAAElFTkSuQmCC';

LineDraw.Line.images['l794x97.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAxoAAABhAQMAAABrg0WOAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAJZJREFUaIHt17ENgDAAA8EgipSMwCiMBqNlFEagpEDACm5iWdF7gWv9pXRfbQbjxlC3OIwLQ93qME4MdZvDaGMYu8M4MNR9DqM/MYoxOYwXQ93sMB4MddVhDHLbSYMsg9ueZXDbswzSIMsgDaIM0iDLIA30cduzDG57lkEaZBmkQZZBGmQZpIE8bnuWwW3PMkiDLKM4jB9kimNeeFcWSAAAAABJRU5ErkJggg==';

LineDraw.Line.images['r798x48.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAx4AAAAwAQMAAACluj6mAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAG5JREFUWIXt1TERgEAUA9HPUFAiASlIA2lIOQmUFDcEDZdiCyZrINWblM4COnQRM7saMbPpJmZWPcTMok7MzHqJmUkiZkqBMx4GJz6Hi0+n+DQKHKPAcQoco8Bx+hscaKYRM/FpFJ9OOTYjCk7/AFtWY5onrGqyAAAAAElFTkSuQmCC';

LineDraw.Line.images['l798x48.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAx4AAAAwAQMAAACluj6mAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAHFJREFUWIXt0zERgDAABMEwFCkjASlIA2mRggRKCoYPEr65JvNn4KotBa+++KLpoRebbnqx66IXhzq9kE74sEjwoaz66EUV7iIs7EWnF5HnFXlmc8gLC6+wMAsLs7DwmoNF41lEnlnkec0hLyzccBZ/A1ulY5r4MxYPAAAAAElFTkSuQmCC';

LineDraw.Line.images['r799x27.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAx8AAAAbAQMAAAAnE6BtAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAFlJREFUSIlj+P+fgR7g/////+hhDyPQoh/0sIgdaNEHeljED7ToAT0skgda1EAPi+r/jyY68sBooiMbDMtE94ceFjEPy0R3gB4W2Y8mOjLBaKIjGwzDRPcPAO+rY5z/9xUFAAAAAElFTkSuQmCC';

LineDraw.Line.images['l799x27.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAx8AAAAbAQMAAAAnE6BtAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAGNJREFUSInt0rERgCAQBVEYA0JLsBRLg9IoxRIMDRiObwUXLdFtAy/ZlOiyTVgwg4lbAgpcAjoJnAIeEjgEvCSQBQwSiI38YiM/fKO6Y6NGAvhGZcdGHwnERn6xkR++0U/AgFpsP2Oct3xSAgAAAABJRU5ErkJggg==';

LineDraw.Line.images['l1x5.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAFAQMAAAC+ShTcAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAAxJREFUCJljaGCAQgAMigKBJxHSGwAAAABJRU5ErkJggg==';

LineDraw.Line.images['l5x1.png']='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAABAQMAAAAsMPawAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAApJREFUCJlj+AEAAPoA+eu71x4AAAAASUVORK5CYII=';


