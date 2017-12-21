// DrawTriangle.js (c) 2012 matsuda
function main() { 
  var red = 0.0;
  var green = 0.0;
  var blue = 100.0;
  var x = 0;
  var y = 225;
 
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw a red rectangle
  ctx.fillStyle = 'rgba(255, 0, 0, 1.0)'; // Set color to blue
  ctx.fillRect(120, 10, 150, 150);        // Fill a rectangle with the color
  //Draw a blue rectangle
  ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
  ctx.fillRect(195, 85, 150, 150);
  //Double loop below
  for(var i = 0; i < 4; i++)
  {
	if(i != 0)
		y += 25;
	red += 50;
	for(var j = 0; j < 4; j++)
	{
		if(j == 0)
			x = 0;
		else
			x += 25;
		green += 25;
		blue -= 5;
		ctx.fillStyle = 'rgba(' + red.toString() +', ' + green.toString() + ', ' + blue.toString() +', 0.5)';
  		ctx.fillRect(x, y, 25, 25);
	}
  }
}
