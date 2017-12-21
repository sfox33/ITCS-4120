// TranslatedTriangle.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform vec4 u_Translation;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position + u_Translation;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +		//vec4(1.0, 0.0, 0.0, 1.0);
  '}\n';

// The translation distance for x, y, and z direction
var Tx = 0.5, Ty = 0.5, Tz = 0.0;

function main() {
  var r = 1.0, g = 0.0, b = 1.0;  //Holds the red, blue, and green values that will be passed to the fragment shader
  
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Write the positions of vertices to a vertex shader
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  // Pass the translation distance to the vertex shader
  var u_Translation = gl.getUniformLocation(gl.program, 'u_Translation');
  if (!u_Translation) {
    console.log('Failed to get the storage location of u_Translation');
    return;
  }
  gl.uniform4f(u_Translation, Tx, Ty, Tz, 0.0);
  
  // Pass the translation distance to the fragment shader
  var u_Translation = gl.getUniformLocation(gl.program, 'u_Translation');
  if (!u_Translation) 
  {
	console.log('Failed to get the storage location of u_Translation');
	return;
  }
  //Get the storage location of the u_FragColor variable
  var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) 
  {
	console.log('Failed to get u_FragColor variable');
	return -1;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  for(var i = 0; i < 4; i++)	//Draws the triangles with different translation and color values
  {
	switch(i)		//Changes red, blue, green, and translation values for each triangle
	{
	    case 1:
	      Tx = -0.5;
		  Ty = 0.5;
		  Tz = 0.0;
		  r = 1.0;
		  g = 0.0;
		  b = 0.0;
		  break;
		case 2:
		  Tx = -0.5;
		  Ty = -0.5;
		  Tz = 0.0;
		  r = 0.0;
		  g = 1.0;
		  b = 1.0;
		  break;
		case 3:
		  Tx = 0.5;
		  Ty = -0.5;
		  Tz = 0.0;
		  r = 0.0;
		  g = 0.0;
		  b = 1.0;
		  break;
	}
	
	gl.uniform4f(u_Translation, Tx, Ty, Tz, 0.0);	//Assign values to the u_Translation variable
	  
	gl.uniform4f(u_FragColor, r, g, b, 1.0);	//Assign values to the u_FragColor variable
	  
	// Draw the rectangle
	gl.drawArrays(gl.TRIANGLES, 0, n);
  }
}

function initVertexBuffers(gl) {
  var vertices = new Float32Array([
    0, 0.5,   -0.5, -0.5,   0.5, -0.5,
  ]);
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Assign the buffer object to the attribute variable
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  return n;
}
