// HelloCanvas1.js 2015 zwartell

// based on HelloCanvas.js (c) 2012 matsuda
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas, true);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  else
     console.log('Successfully got the rendering context for WebGL');

  // Set clear color
  gl.clearColor(1.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var i;
  var colors = [];
  colors = [ [ 1.0, 0.0, 0.0, 1.0], 
             [ 0.0, 1.0, 0.0, 1.0],
             [ 0.0, 0.0, 1.0, 1.0],
             [ 0.0, 0.0, 0.0, 1.0]];
             
   
//  var enableAlert = true;
  var enableAlert = false;
  
  for (i=0;i<colors.length;i++)
  {
    gl.clearColor(colors[i][0],colors[i][1],colors[i][2],colors[i][3]);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);  

    if (enableAlert)
      {
      alert();  
      }
    
    
    /* crud way to pause for 1/10 second */
    var millis = 1000;
    var date = new Date().getTime();
    var curDate = null;
    do { 
      curDate = new Date().getTime();
    }
    while(curDate-date < millis);        
  }
  
}
