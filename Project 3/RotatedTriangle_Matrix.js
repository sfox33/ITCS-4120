// RotatedTriangle_Matrix.js (c) matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform mat4 u_xformMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_xformMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

// The rotation angle
var ANGLE = 45.0;

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

  // Pass the rotation matrix to the vertex shader
  var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
  if (!u_xformMatrix) {
    console.log('Failed to get the storage location of u_xformMatrix');
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

  for(var i = 0; i < 4; i++)		//Draws the triangle with different color and rotational values
  {
	switch(i)		//Changes the red, blue, green, and rotational values for each triangle
	{
		case 1:
		  ANGLE = 90.0;
		  r = 1.0;
		  g = 0.0;
		  b = 0.0;
		  break;
		case 2:
		  ANGLE = 135.0;
		  r = 0.0;
		  g = 1.0;
		  b = 1.0;
		  break;
		case 3:
		  ANGLE = 180.0;
		  r = 0.0;
		  g = 0.0;
		  b = 1.0;
		  break;
	}  
	  
	// Create a rotation matrix
    var radian = Math.PI * ANGLE / 180.0; // Convert to radians
    var cosB = Math.cos(radian), sinB = Math.sin(radian);

    // Note: WebGL is column major order
    var xformMatrix = new Float32Array([
     cosB, sinB, 0.0, 0.0,
    -sinB, cosB, 0.0, 0.0,
      0.0,  0.0, 1.0, 0.0,
      0.0,  0.0, 0.0, 1.0
    ]);  
	
	gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);
	gl.uniform4f(u_FragColor, r, g, b, 1.0);	//Assign values to the u_FragColor variable
	  
  	// Draw the rectangle
	gl.drawArrays(gl.TRIANGLES, 0, n);
  }
}

function initVertexBuffers(gl) {
  var vertices = new Float32Array([
    0, 0.5,   -0.5, -0.5,   0.5, -0.5
  ]);
  var n = 3; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  return n;
}

