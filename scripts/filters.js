Filters = {};

Filters.tmpCanvas = document.createElement('canvas');
Filters.tmpCtx = Filters.tmpCanvas.getContext('2d');

Filters.createImageData = function(w,h) {
  return this.tmpCtx.createImageData(w,h);
};

Filters.getPixels = function(img, width, height){
    var c = this.getCanvas(width, height);
    var ctx = c.getContext('2d');
    ctx.drawImage(img,0,0,c.width,c.height);
    return ctx.getImageData(0,0,c.width,c.height);
};
Filters.getCanvas = function(w,h){
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
}

Filters.filterImage = function(filter, image, width, height, var_args){
    var args = [this.getPixels(image, width, height)];
    for(var i=4; i<arguments.length; i++){
        args.push(arguments[i]);
    }
    return filter.apply(null, args);
}

Filters.grayscale = function(pixels, args){
    var d = pixels.data;
    for(var i=0; i<d.length; i+=4){
        var r = d[i];
        var g = d[i+1];
        var b = d[i+2];
        //CIE luminance for the RGB
        var v = 0.2126*r + 0.7152*g + 0.0722*b;
        d[i] = d[i+1] = d[i+2] = v;
    }
    return pixels;
}

Filters.threshold = function(pixels, threshold){
    var d = pixels.data;
    for (var i=0; i<d.length; i+=4){
        var r = d[i];
        var g = d[i+1];
        var b = d[i+2];
        var v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold) ? 255 : 0;
        d[i] = d[i+1] = d[i+2] = v;
    }
    return pixels;
}

Filters.stereoscope = function(pixels, args){
    var data = pixels.data;
	var data2 = args.data;
    var xmax = pixels.width;
	var ymax = pixels.height;
    for(var y = 0; y < ymax; y++) {
		 for(var x = 0; x < xmax; x++) {
			var i = (y * 4) * xmax + x * 4;
			// seperate colors, and multiply the two layers together
			data[i] = data[i] * 255 / 0xFF;
			data[i+1] = 255 * data2[i+1] / 0xFF;
			data[i+2] = 255 * data2[i+2] / 0xFF;
		 }
	}    
    return pixels;
}

Filters.convoluteFloat32 = function(pixels, weights, opaque) {
          var side = Math.round(Math.sqrt(weights.length));
          var halfSide = Math.floor(side/2);

          var src = pixels.data;
          var sw = pixels.width;
          var sh = pixels.height;

          var w = sw;
          var h = sh;
          var output = {
            width: w, height: h, data: new Float32Array(w*h*4)
          };
          var dst = output.data;

          var alphaFac = opaque ? 1 : 0;

          for (var y=0; y<h; y++) {
            for (var x=0; x<w; x++) {
              var sy = y;
              var sx = x;
              var dstOff = (y*w+x)*4;
              var r=0, g=0, b=0, a=0;
              for (var cy=0; cy<side; cy++) {
                for (var cx=0; cx<side; cx++) {
                  var scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
                  var scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
                  var srcOff = (scy*sw+scx)*4;
                  var wt = weights[cy*side+cx];
                  r += src[srcOff] * wt;
                  g += src[srcOff+1] * wt;
                  b += src[srcOff+2] * wt;
                  a += src[srcOff+3] * wt;
                }
              }
              dst[dstOff] = r;
              dst[dstOff+1] = g;
              dst[dstOff+2] = b;
              dst[dstOff+3] = a + alphaFac*(255-a);
            }
          }
          return output;
        };

var control = document.getElementById('control');
var img = new Image();
var count = 0;
img.addEventListener('load', function() {

    function runFilter(id, filter, width, height, arg1, arg2, arg3){
        var c = document.getElementById(id);
        var idata = Filters.filterImage(filter, img, width, height, arg1, arg2, arg3);
        c.width = idata.width;
        c.height = idata.height;
        var ctx = c.getContext('2d');
        ctx.putImageData(idata, 0, 0);
    }

    grayscale = function(){
        runFilter('canvas', Filters.grayscale, window.innerWidth, window.innerHeight);
    }
    
    threshold = function(){
        runFilter('canvas', Filters.threshold, window.innerWidth, window.innerHeight, 100);
    }
    
    stereoscope = function(img1, img2){        
        var i = Filters.getPixels(img2, window.innerWidth, window.innerHeight);
        runFilter('canvas', Filters.stereoscope, window.innerWidth, window.innerHeight, i);
    }
    
    sobel = function() {
        runFilter('canvas', function(px){
            px = Filters.grayscale(px);
          var vertical = Filters.convoluteFloat32(px,
            [-1,-2,-1,
              0, 0, 0,
              1, 2, 1]);
          var horizontal = Filters.convoluteFloat32(px,
            [-1,0,1,
             -2,0,2,
             -1,0,1]);
          var id = Filters.createImageData(vertical.width, vertical.height);
          for (var i=0; i<id.data.length; i+=4) {
            var v = Math.abs(vertical.data[i]);
            id.data[i] = v;
            var h = Math.abs(horizontal.data[i]);
            id.data[i+1] = h
            id.data[i+2] = (v+h)/4;
            id.data[i+3] = 255;
          }
          return id;
        }, window.innerWidth, window.innerHeight);
    }
    
    applySteroescope = function(){   
        var img2 = new Image();
        img2.addEventListener('load', function() {
            stereoscope(img, img2);
        }, false);
        img2.src = '../media/cave2.jpg';
    }
    
    sobel();
    
    control.addEventListener('click', function(){
        if(count == 0){
            grayscale();
            count++;
        } else if(count == 1){
            threshold();
            count++;
        } else if(count == 2){
            applySteroescope();
            count ++;
        } else if(count == 3){
            sobel();
            count = 0;
        }
    });
    
}, false);
img.src = '../media/cave.jpg';