/**
 * @author Jialei Li, K.R. Subrmanian, Zachary Wartell
 * 
 * 
 */


/*****
 * 
 * GLOBALS
 * 
 *****/

// 'draw_mode' are names of the different user interaction modes.
var draw_mode = {DrawLines: 0, DrawTriangles: 1, DrawQuadrilaterals: 2, Delete: 3, ClearScreen: 4, None: 5};

// 'curr_draw_mode' tracks the active user interaction mode
var curr_draw_mode = draw_mode.DrawLines;

// GL array buffers for points, lines, triangles, and quadrilaterals
var vBuffer_Pnt, vBuffer_Line, vBuffer_Tri, vBuffer_Quad;

// Array's storing 2D vertex coordinates of points, lines, triangles, etc.
// Each array element is an array of size 2 storing the x,y coordinate.
var points = [], line_verts = [], tri_verts = [], quad_verts = [], selectedObjects = [];

var num_pts_line = 0;	//count number of points clicked for new line
var num_pts_tri = 0;	//count number of points clicked for new triangle
var num_pts_quad = 0;	//count number of points clicked for new quadrilateral

var lineSelected = false;		//Holds whether or not a line is selected
var triSelected = false;		//Holds whether or not a triangle is currently selected
var quadSelected = false;		//Holds whether or not a quadrilateral is currently selected
var selectedOrigin = -1;		//Holds the spot in an array of the first vertex of the selected object

var deleting = false;		//Holds whether or not an object is being deleted

//Holds the R-G-B values for each of the three objects: lines, triangles, and quadrilaterals
var lineR = 0.0;
var lineG = 100.0;
var lineB = 0.0;
var triR = 0.0;
var triG = 100.0;
var triB = 100.0;
var quadR = 100.0;
var quadG = 0.0;
var quadB = 0.0;

//Holds the last click's position to determine movement of the mouse
var prevX = -5.0;
var preY = -5.0;
selectedObjectsCount = -1;		//Holds the starting position in the selectedObjects array for the next selected object

/*****
 * 
 * MAIN
 * 
 *****/
function main() {
    
    //math2d_test();
    
    /**
     **      Initialize WebGL Components
     **/
    
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    if (!initShadersFromID(gl, "vertex-shader", "fragment-shader")) {
        console.log('Failed to intialize shaders.');
        return;
    }

    //create GL buffer object for points
    vBuffer_Pnt = gl.createBuffer();
    if (!vBuffer_Pnt) {
        console.log('Failed to create the buffer object');
        return -1;
    }

	//create GL buffer object for lines
    vBuffer_Line = gl.createBuffer();
    if (!vBuffer_Line) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    var skeleton=true;
    if(skeleton)
    {
        document.getElementById("App_Title").innerHTML += "-Skeleton";
    }

    //create GL buffer object for triangles
	vBuffer_Tri = gl.createBuffer();
	if(!vBuffer_Line)
	{
		console.log('Failed to create the buffer object');
		return -1;
	}
	
	//create GL buffer object for quadrilaterals
	vBuffer_Quad = gl.createBuffer();
	if(!vBuffer_Quad)
	{
		console.log('Failed to create the buffer object');
		return -1;
	}

    // Specify the color for clearing <canvas>
    gl.clearColor(0, 0, 0, 1);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // get GL shader variable locations
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }

    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    /**
     **      Set Event Handlers
     **
     **  Student Note: the WebGL book uses an older syntax. The newer syntax, explicitly calling addEventListener, is preferred.
     **  See https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
     **/
    //Sets event handler for the Line button
    document.getElementById("LineButton").addEventListener(
            "click",
            function () {
                curr_draw_mode = draw_mode.DrawLines;
            });
	
	//Sets event handler for the Triangle button
    document.getElementById("TriangleButton").addEventListener(
            "click",
            function () {
                curr_draw_mode = draw_mode.DrawTriangles;
            });    
    
	//Sets event handler for the Clear Screen button
    document.getElementById("ClearScreenButton").addEventListener(
            "click",
            function () {
                curr_draw_mode = draw_mode.ClearScreen;
                // clear the vertex arrays
                while (points.length > 0)
                    points.pop();
                while (line_verts.length > 0)
                    line_verts.pop();
                while (tri_verts.length > 0)
                    tri_verts.pop();
				while (quad_verts.length > 0)
					quad_verts.pop();

                gl.clear(gl.COLOR_BUFFER_BIT);
                
                curr_draw_mode = draw_mode.DrawLines;
            });
            
    //Sets event handler for the Quad button
	document.getElementById("QuadButton").addEventListener(
			"click",
			function()
			{
				curr_draw_mode = draw_mode.DrawQuadrilaterals;
			}); 

	//Sets event handler for the Delete button
	document.getElementById("DeleteButton").addEventListener(
			"click",
			function()
			{
				if(selectedOrigin != -1)	//Activates is an object is selected
				{
					deleting = true;
					if(lineSelected)		//Activates if a line is being deleted
					{
						if(line_verts.length <= 2)	//Resets line_verts if it holds one line
							line_verts.length = 0;
						else
						{
							for(var i = selectedOrigin; i < line_verts.length - 2; i++)	//Adjusts array while removing the selected line
							{
								line_verts[i] = line_verts[i+2];
							}
							line_verts.length -= 2;
						}						
					}
					else if(triSelected)	//Activates if a triangle is being deleted
					{
						if(tri_verts.length <= 3)	//Resets tri_verts if it holds one triangle
							tri_verts.length = 0;
						else
						{
							for(var i = selectedOrigin; i < tri_verts.length - 3; i++)	//Adjusts array while removing the selected triangle
							{
								tri_verts[i] = tri_verts[i+3];
							}
							tri_verts.length -= 3;
						}				
					}
					else if(quadSelected)	//Activates if a quadrilateral is being deleted
					{
						if(quad_verts.length <= 3)	//Resets quad_verts if it holds one quadrilateral
							quad_verts.length = 0;
						else
						{
							for(var i = selectedOrigin; i < quad_verts.length - 4; i++)	//Adjusts array while removing the selected quadrilateral
							{
								quad_verts[i] = quad_verts[i+4];
							}
							quad_verts.length -= 4;
						}		
					}
				}
				drawObjects(gl,a_Position, u_FragColor);
				triSelected = false;		//Resets booleans and array counter (selectedOrigin)
				lineSelected = false;
				selectedOrigin = -1;
			});

    //Sets event handlers for the red color slider
    document.getElementById("RedRange").addEventListener(
            "input",
            function () {
				if(triSelected)
				{
					triR = document.getElementById("RedRange").value;
				}
				if(lineSelected)
				{
					lineR = document.getElementById("RedRange").value;
				}
				if(quadSelected)
				{
					quadR = document.getElementById("RedRange").value;
				}
					
				drawObjects(gl,a_Position, u_FragColor);
            });
			
	//Sets event handlers for the green color slider		
    document.getElementById("GreenRange").addEventListener(
            "input",
            function () {
				if(triSelected)
				{
					triG = document.getElementById("GreenRange").value;
				}
				if(lineSelected)
				{
					lineG = document.getElementById("GreenRange").value;
				}
				if(quadSelected)
				{
					quadG = document.getElementById("GreenRange").value;
				}
				drawObjects(gl,a_Position, u_FragColor);
            });
			
	//Sets event handlers for the blue color slider		
    document.getElementById("BlueRange").addEventListener(
            "input",
            function () {
				if(triSelected)
				{
					triB = document.getElementById("BlueRange").value;
				}
				if(lineSelected)
				{
					lineB = document.getElementById("BlueRange").value;
				}
				if(quadSelected)
				{
					quadB = document.getElementById("BlueRange").value;
				}
				drawObjects(gl,a_Position, u_FragColor);
            });                        
            
    //Initializes Sliders 
	document.getElementById("RedRange").value = 0.0;
	document.getElementById("GreenRange").value = 0.0;
	document.getElementById("BlueRange").value = 0.0;
            
    // Register function (event handler) to be called on a mouse press
    canvas.addEventListener(
            "mousedown",
            function (ev) {
                handleMouseDown(ev, gl, canvas, a_Position, u_FragColor);
                });
}

/*****
 * 
 * FUNCTIONS
 * 
 *****/

/*
 * Handle mouse button press event.
 * 
 * @param {MouseEvent} ev - event that triggered event handler
 * @param {Object} gl - gl context
 * @param {HTMLCanvasElement} canvas - canvas 
 * @param {Number} a_Position - GLSL (attribute) vertex location
 * @param {Number} u_FragColor - GLSL (uniform) color
 * @returns {undefined}
 */
function handleMouseDown(ev, gl, canvas, a_Position, u_FragColor) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
    var button = ev.button;	//Holds the value of what mouse button is pressed
	var minLineDist = 0.05; //The maximimum distance value a right-click must be from a line for it to be selected
	var minPt1 = -1.0;	//First drawn point
	var minPt2 = -1.0;	//Second drawn point
	var minPt3 = -1.0;	//Third drawn point
	var minPt4 = -1.0;	//Fourth drawn point
	var inTri, inQuad;	//Hold whether a right click is inside a triangle, inside a quad, or inside neither
	var point;
    // Student Note: 'ev' is a MouseEvent (see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent)
    
    // convert from canvas mouse coordinates to GL normalized device coordinates
    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
	
	point = [x,y];
	console.clear();

	if(button == 0)		//Activates if the left mouse button is pressed
	{
		lineSelected = false;	//resets selection values
		triSelected = false;
		quadSelected = false;
		if (curr_draw_mode !== draw_mode.None) {
			// add clicked point to 'points'
			points.push([x, y]);
		}

		// perform active drawing operation
		switch (curr_draw_mode) {
			case draw_mode.DrawLines:
				// in line drawing mode, so draw lines
				if (num_pts_line < 1) {			
					// gathering points of new line segment, so collect points
					line_verts.push([x, y]);
					num_pts_line++;
				}
				else {						
					// got final point of new line, so update the primitive arrays
					line_verts.push([x, y]);
					num_pts_line = 0;
					points.length = 0;
				}
				break;
			case draw_mode.DrawTriangles:
					//in triangle drawing mode, so draw triangles
					if(num_pts_tri < 2)
					{
						//Collect points of new triangle
						tri_verts.push([x, y]);
						num_pts_tri++;
					}
					else
					{
						//Got final point of new triangle; update primitive arrays
						tri_verts.push([x,y]);
						num_pts_tri = 0;
						points.length = 0;
					}
					break;	
			case draw_mode.DrawQuadrilaterals:
					// in quadrilateral drawing mode, so draw quadrilaterals
					if(num_pts_quad < 3)
					{
						//Collect points of new Quadrilateral
						quad_verts.push([x, y]);
						num_pts_quad++;
					}
					else
					{
						//Got final point of new quadrilateral; update primitive arrays
						quad_verts.push([x,y]);
						num_pts_quad = 0;
						points.length = 0;
					}
					break;		
		}
		
		drawObjects(gl,a_Position, u_FragColor);
	}
	else //Detected a right mouse click; selecting objects rather than drawing
	{
		if(prevX == x && prevY == y)		//Mouse has not moved
		{
			if(selectedObjectsCount >= selectedObjects.length)	//Resets counter if it is out of range 
			{
				selectedObjectsCount = 0;
			}
			
			if(selectedObjects[selectedObjectsCount] == "Line")	//Activates if the next object to be selected is a line
			{
				//Set the necessary booleans
				inTri = false;
				inQuad = false;
				lineSelected = true;
				triSelected = false;
				quadSelected = false;
				minPt1 = selectedObjects[selectedObjectsCount + 1];	//Push the vertices of the object
				minPt2 = selectedObjects[selectedObjectsCount + 2];
				selectedObjectsCount += 3;		//Updates the counter to point to the next object
			}
			else if(selectedObjects[selectedObjectsCount] == "Tri")	//Activates if the next object to be selected is a triangle
			{
				//Set the necessary booleans
				inTri = true;
				inQuad = false;
				triSelected = true;
				lineSelected = false;
				quadSelected = false;
				minPt1 = selectedObjects[selectedObjectsCount + 1];	//Push the vertices of the object
				minPt2 = selectedObjects[selectedObjectsCount + 2];
				minPt3 = selectedObjects[selectedObjectsCount + 3];
				selectedObjectsCount += 4;	//Updates the counter to point to the next object
			}
			else	//Activates if the next object to be selected is a quadrilateral
			{
				//Set the necessary booleans
				inTri = false;
				inQuad = true;
				quadSelected = true;
				lineSelected = false;
				triSelected = false;
				minPt1 = selectedObjects[selectedObjectsCount + 1];	//Push the vertices of the object
				minPt2 = selectedObjects[selectedObjectsCount + 2];
				minPt3 = selectedObjects[selectedObjectsCount + 3];
				minPt4 = selectedObjects[selectedObjectsCount + 4];
				selectedObjectsCount += 5;	//Updates the counter to point to the next object
			}
		}
		else	//Mouse moved since last click
		{
			if(selectedObjects.length != 0)	//Resets the selectedObjects array
				selectedObjects.length = 0;
			selectedObjectsCount = -1;
			if(line_verts.length >= 2)		//Activates if the line_verts array has enough points to form a line
			{
				for(var i = 0; i < line_verts.length; i+=2)
				{
					console.log("NEW ROUND");
					var a = new Vec2(line_verts[i]);
					var p1 = new Vec2(line_verts[i+1]);
					var p2 = new Vec2(point);
					console.log("a: " + a.array[0] + ", " + a.array[1]);
					console.log("b: " + p1.array[0] + ", " + p1.array[1]);
					console.log("p: " + p2.array[0] + ", " + p2.array[1]);
					//Finds distance between point and the current line
					var temp = pointLineDist(a, p1, p2);
					//console.log(temp);
					//console.log(minLineDist);
					if(Math.abs(temp) <= Math.abs(minLineDist))	//Activates if the new distance is less than the current minimum distance
					{
						var b = p1.sub(a);
						var p = p2.sub(a);
						var num = b.dot(p);
						var denom = b.mag() * b.mag();
						var projArray = [b.x * (num/denom), b.y * (num/denom)];
						var projection = new Vec2(projArray);
						console.log("projection: " + projection.mag());
						console.log("line segment: " + b.sub(a).mag());
						console.log("p magnitude: " + p.sub(a).mag());
						if(projection.mag() <= b.sub(a).mag())	//Two cases: projection is on the segment, or projection is off the segment
						{
							console.log("projection successful");
							//Set necessary booleans
							inTri = false;
							inQuad = false;
							lineSelected = true;
							triSelected = false;
							quadSelected = false;
							minLineDist = temp;
							minPt1 = line_verts[i];		//Holds the points of the closest line
							minPt2 = line_verts[i+1];
							selectedObjects.push("Line");	//Puts the line's vertices on the list of selected objects
							selectedObjects.push(minPt1);
							selectedObjects.push(minPt2);
							selectedObjectsCount = 0;
							selectedOrigin = i;
						}
						else
						{
							console.log("outside line?")
							lineSelected = false;
							triSelected = false;
							quadSelected = false;
							points.length = 0;
							drawObjects(gl,a_Position, u_FragColor);
						}
					}
				}
			}
			if(tri_verts.length >= 3)	//Activates if there are enough triangle vertices to form a triangle
			{
				for(var i = 0; i < tri_verts.length; i+=3)
				{
					//Determines if the click is inside of a triangle
					var tempArray = barycentric(new Vec2(tri_verts[i]), new Vec2(tri_verts[i+1]), new Vec2(tri_verts[i+2]), new Vec2([x,y]));
					if((tempArray[0] >= 0 && tempArray[0] <= 1) && (tempArray[1] >= 0 && tempArray[1] <= 1) && (tempArray[2] >= 0 && tempArray[2] <= 1))
					{
						//Sets necessary booleans
						inTri = true;
						triSelected = true;
						lineSelected = false;
						quadSelected = false;
						minPt1 = tri_verts[i];	//Hold the vertices of the triangle containing the click
						minPt2 = tri_verts[i+1];
						minPt3 = tri_verts[i+2];
						selectedObjects.push("Tri");
						selectedObjects.push(minPt1);	//Puts the triangle's vertices on the list of selected objects
						selectedObjects.push(minPt2);
						selectedObjects.push(minPt3);
						selectedObjectsCount = 0;
						selectedOrigin = i;
					}
				}
			}
			if(quad_verts.length >= 4)	//Activates if there are enough triangle vertices to form a triangle
			{
				for(var i = 0; i < quad_verts.length; i+=4)
				{
					//Determines if the click is inside either of the two triangles in the quadrilateral
					var tempArray = barycentric(new Vec2(quad_verts[i]), new Vec2(quad_verts[i+1]), new Vec2(quad_verts[i+2]), new Vec2([x,y]));
					var tempArray2 = barycentric(new Vec2(quad_verts[i+1]), new Vec2(quad_verts[i+2]), new Vec2(quad_verts[i+3]), new Vec2([x,y]));
					if(((tempArray[0] >= 0 && tempArray[0] <= 1) && (tempArray[1] >= 0 && tempArray[1] <= 1) && (tempArray[2] >= 0 && tempArray[2] <= 1)) 
						|| ((tempArray2[0] >= 0 && tempArray2[0] <= 1) && (tempArray2[1] >= 0 && tempArray2[1] <= 1) && (tempArray2[2] >= 0 && tempArray2[2] <= 1)))
					{
						//Sets the necessary booleans
						inQuad = true;
						inTri = false;
						quadSelected = true;
						triSelected = false;
						lineSelected = false;
						minPt1 = quad_verts[i];		//Holds the vertices of the rectangle containing the click
						minPt2 = quad_verts[i+1];
						minPt3 = quad_verts[i+2];
						minPt4 = quad_verts[i+3];
						selectedObjects.push("Quad");	//Puts the rectangle's vertices on the list of selected objects
						selectedObjects.push(minPt1);
						selectedObjects.push(minPt2);
						selectedObjects.push(minPt3);
						selectedObjects.push(minPt4);
						selectedObjectsCount = 0;
						selectedOrigin = i;
					}
				}
			}
		}
			
		if(minPt1 != -1.0 && minPt2 != -1.0)	//Activates if minPt1 and minPt2 have had their values changed since the beginning of the program
		{
			if(inTri)	//Fills the points array with the triangle being selected
			{
				points.length = 0;
				points.push(minPt1);
				points.push(minPt2);
				points.push(minPt3);
			}
			else if(inQuad)	//Fills the points array with the quadrilateral being selected
			{
				points.length = 0;
				points.push(minPt1);
				points.push(minPt2);
				points.push(minPt3);
				points.push(minPt4);
			}
			else	//Fills the points array with the line being selected
			{
				points.length = 0;
				points.push(minPt1);
				points.push(minPt2);
			}
						
			drawObjects(gl,a_Position, u_FragColor);	//Renders the points
			points.length = 0;	//Resets points
		}
		prevX = x;	//Holds the position of the mouse when it clicked
		prevY = y;
	}
}

/*
 * Draw all objects
 * @param {Object} gl - WebGL context
 * @param {Number} a_Position - position attribute variable
 * @param {Number} u_FragColor - color uniform variable
 * @returns {undefined}
 */
function drawObjects(gl, a_Position, u_FragColor) {

    //Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    //draw lines
    if (line_verts.length) {	
        //enable the line vertex
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer_Line);
        //set vertex data into buffer (inefficient)
        gl.bufferData(gl.ARRAY_BUFFER, flatten(line_verts), gl.STATIC_DRAW);
        //share location with shader
        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.uniform4f(u_FragColor, lineR/100.0, lineG/100.0, lineB/100.0, 1.0);
        // draw the lines
        gl.drawArrays(gl.LINES, 0, line_verts.length );
    }

   //draw triangles
   if(tri_verts.length)
   {
	   //enable the line vertex
	   gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer_Tri);
	   //set vertex data into buffer (inefficient)
	   gl.bufferData(gl.ARRAY_BUFFER, flatten(tri_verts), gl.STATIC_DRAW);
	   // share location with shader
	   gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
	   gl.enableVertexAttribArray(a_Position);
	   
	   gl.uniform4f(u_FragColor, triR/100.0, triG/100.0, triB/100.0, 1.0);
	   gl.drawArrays(gl.TRIANGLES, 0, tri_verts.length);	// draw the lines
   }
   
   //draw quads
   if(quad_verts.length)
    {
	    for(var i = 0; i < quad_verts.length; i +=4)	//Cycles through the points in the quad_verts array
	    {
			if((quad_verts.length - i - 1) > 4)	//Activates if the current quadrilateral is not the last quadrilateral in the list
			{
				//enable the line vertex
				gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer_Quad);
				//set vertex data into buffer (inefficient)
				gl.bufferData(gl.ARRAY_BUFFER, flatten(quad_verts.slice(i,i+4)), gl.STATIC_DRAW);
				// share location with shader
				gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(a_Position);
			   
				gl.uniform4f(u_FragColor, 1.0, 0.0, 0.0, 1.0);
				gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);		// draw the lines
			}
			else	//Activates if the current quadrilateral is the last quadrilateral in the list
			{
				//enable the line vertex
				gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer_Quad);
				//set vertex data into buffer (inefficient)
				gl.bufferData(gl.ARRAY_BUFFER, flatten(quad_verts.slice(i,quad_verts.length)), gl.STATIC_DRAW);
				// share location with shader
				gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray(a_Position);
			   
				gl.uniform4f(u_FragColor, quadR/100.0, quadG/100.0, quadB/100.0, 1.0);
				gl.drawArrays(gl.TRIANGLE_STRIP, 0, quad_verts.slice(i,quad_verts.length).length);		// draw the lines
			}	
	    }
    }
    
	if(deleting)	//Gets rid of selected vertices so that theyare no longer drawn
	{
		points.length = 0;
		deleting = false;
	}
	if(lineSelected || triSelected ||quadSelected)		//Activates if an object is currently selected
	{
		gl.uniform4f(u_FragColor, 0.0, 0.0, 1.0, 1.0);	//Sets the vertices' color to blue
		if(lineSelected)	//Updates the sliders to represent the lines' color
		{
			document.getElementById("RedRange").value = lineR;
			document.getElementById("GreenRange").value = lineG;
			document.getElementById("BlueRange").value = lineB;
		}
		if(triSelected)//Updates the sliders to represent the triangles' color
		{
			document.getElementById("RedRange").value = triR;
			document.getElementById("GreenRange").value = triG;
			document.getElementById("BlueRange").value = triB;
		}
		if(quadSelected)//Updates the sliders to represent the quagrilaterals' color
		{
			document.getElementById("RedRange").value = quadR;
			document.getElementById("GreenRange").value = quadG;
			document.getElementById("BlueRange").value = quadB;
		}
	}
	else	//Activates is an object is not currently selected
	{
		gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);	//Sets all points to the color white
	}
	
    // draw primitive creation vertices 
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer_Pnt);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.POINTS, 0, points.length); 
}

/**
 * Converts 1D or 2D array of Number's 'v' into a 1D Float32Array.
 * @param {Number[] | Number[][]} v
 * @returns {Float32Array}
 */
function flatten(v)
{
    var n = v.length;
    var elemsAreArrays = false;

    if (Array.isArray(v[0])) {
        elemsAreArrays = true;
        n *= v[0].length;
    }

    var floats = new Float32Array(n);

    if (elemsAreArrays) {
        var idx = 0;
        for (var i = 0; i < v.length; ++i) {
            for (var j = 0; j < v[i].length; ++j) {
                floats[idx++] = v[i][j];
            }
        }
    }
    else {
        for (var i = 0; i < v.length; ++i) {
            floats[i] = v[i];
        }
    }

    return floats;
}
