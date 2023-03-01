/* coneClassExercise.js
//	
//	Written by John Bell for CS 425, Fall 2020
//  Last revised Spring 2023 by John Bell
    
    This file creates and uses instances of the Cone class
	It also draws a set of axes manually for reference.
	( TODO someday - Create an Axes class and instantiate an Axes object. )
    
*/

// Globals are evil, but necessary when callback functions are used

// Object-independent variables
var gl;				// WebGL graphics environment
var program;		// The shader program
var aspectRatio;	// Aspect ratio of viewport

// Axes-related  variables
var nAxesPoints = 0;	// Number of points in the vertex arrays for the axes
var vbufferID_axes;		// ID of buffer holding axes positions
var cbufferID_axes;		// ID of buffer holding axes colors

// Cone-related variables - Only cone objects when using the cone class
var theCone;			// Multicolor Cone object
var theSolidCone;		// Solid color Cone object
var nConeSectors = 15;	// Number of sectors in first cone
var nConeSectors2 = 11;	// Number of sectors in second cone

var truncCone;


var time = 0;

// Initialization function runs whenever the page is loaded

window.onload = function init( ) {
	
	// Set up the canvas, viewport, and clear color

	var canvas = document.getElementById( "gl-canvas" );
	gl=WebGLUtils.setupWebGL( canvas );
	if( !gl ) {
		alert( "No WebGL" );
	}
	
	gl.viewport( 0, 0, canvas.width, canvas.height );
	aspectRatio = canvas.width / canvas.height ;
	gl.clearColor( 1.0, 1.0, 0.5, 1.0 );
	
	// Load the shaders, create a GLSL program, and use it.
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );
	
	// Program is set up.  Remainder draws axes and cones

	// Establish arrays to hold vertex data for the axes.
	var axesPoints = [ ];	// Vertex location data for axes
	var axesColors = [ ];	// Vertex color data for axes
	
	// Generate Points and Colors
	
	// First the points and colors for the axes.
	
	// Two points with colors for a red axis in the X direction
	axesPoints.push( vec3( 0, 0, 0 ) );
	axesColors.push( vec3( 1, 0, 0 ) );
	axesPoints.push( vec3( 1, 0, 0 ) );
	axesColors.push( vec3( 1, 0, 0 ) );
	
	// Two points with colors for a green axis in the Y direction
	axesPoints.push( vec3( 0, 0, 0 ) );
	axesColors.push( vec3( 0, 1, 0 ) );
	axesPoints.push( vec3( 0, 1, 0 ) );
	axesColors.push( vec3( 0, 1, 0 ) );
	
	// Two points with colors for a blue axis in the Z direction
	axesPoints.push( vec3( 0, 0, 0 ) );
	axesColors.push( vec3( 0, 0, 1 ) );
	axesPoints.push( vec3( 0, 0, 1 ) );
	axesColors.push( vec3( 0, 0, 1 ) );
	nAxesPoints = 6;
	
	// Okay.  All axes data calculated.  Time to put it in GPU buffers
	
	// Push Axis Vertex Location Data to GPU
	// Hold off on connecting the data to the shader variables
	
	vbufferID_axes = gl.createBuffer( );	// Note:  All bufferIDs are globals
	gl.bindBuffer( gl.ARRAY_BUFFER, vbufferID_axes );
	gl.bufferData( gl.ARRAY_BUFFER, flatten( axesPoints ), gl.STATIC_DRAW );
	
	// Push Axis Vertex Color Data to GPU
	// Hold off on connecting the data to the shader variables
	
	cbufferID_axes = gl.createBuffer( );
	gl.bindBuffer( gl.ARRAY_BUFFER, cbufferID_axes );
	gl.bufferData( gl.ARRAY_BUFFER, flatten( axesColors ), gl.STATIC_DRAW );
	
	// Unbind the buffer, for safety sake.
	
	gl.bindBuffer( gl.ARRAY_BUFFER, null );

	// Next the cone.  The buffer IDs are instance variables within the Cone class
	// TODO 3 - Pass parameters to create a cone, using "0" ( an invalid color ) 
	//         for the color parameter
	
	// theCone = new Cone( . . . ); // Uncomment and complete this line
	theCone = new Cone(gl, program, 8, 0);
	
	// TODO 5 - Create a solid color cone passing [ r, g, b ] for the color parameter, 
	// where r, g, and b are valid color parameters.
	
	theSolidCone = new Cone(gl, program, 8, [0.5, 0.5, 0.2]);

	truncCone = new TruncatedCone(gl, program, 6, 0, 0.5);
	
	gl.enable( gl.DEPTH_TEST );	// Note:  This line had an error in the exercise template.
	
	// Initialization is done.  Now initiate first rendering
	render( );
}

function render( ) {
	
	// Clear out the color buffers and the depth buffers.
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
	// Create mat4 transformation matrices as needed to transform things.
	// May include model transformation, camera movement, and camera projection
	// Initially let them all be identity matrices
	
	// Create uViewXform using lookAt( eye, at, up );
	// Push it to the GPU as a uniform variable.
	var uViewXform = mat4( ); // Identity matrix unless changed otherwise.
	// TODO 1 - Uncomment the following and adjust parameters for a "nice" view.
	var uViewXform = lookAt( vec3( 1, 2, -3 ), vec3( 0, 0, 0 ), vec3( 0, 1, 0 ) );
	var uViewXformLoc = gl.getUniformLocation( program, "uViewXform" );
	gl.uniformMatrix4fv( uViewXformLoc, false, flatten( uViewXform ) );
	
	// Create another mat4 using perspective( ) and send it to the GPU
	
	var uProjection = mat4( ); // Identity matrix unless changed otherwise.
	// TODO 2 - uncomment and adjust the following for a good 3D perspective
	var uProjection = perspective( 60, aspectRatio, 0.1, 10.0 );
	var uProjectionLoc = gl.getUniformLocation( program, "uProjection" );
	gl.uniformMatrix4fv( uProjectionLoc, false, flatten( uProjection ) );
	
	// Set the model transformation matrix as a mat4 Identity matrix and send it to the GPU
	// This will be changed in render( ), but set something there for now as a placeholder
	
	var uModelXform = mat4( ); // Identity matrix unless changed otherwise.
	var uModelXformLoc = gl.getUniformLocation( program, "uModelXform" );
	gl.uniformMatrix4fv( uModelXformLoc, false, flatten( uModelXform ) );
	
	// Okay.  All transformaation matrices sent to uniform variables.
	// Time to attach vertex shader variables to the buffers created in init( )
	
	// Connect the axes vertex data to the shader variables - First positions
	gl.bindBuffer( gl.ARRAY_BUFFER, vbufferID_axes );
		var vPositionLoc = gl.getAttribLocation( program, "vPosition" );
		gl.vertexAttribPointer( vPositionLoc, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vPositionLoc );
	
	// Then the axes colors
	gl.bindBuffer( gl.ARRAY_BUFFER, cbufferID_axes );
		var vColorLoc = gl.getAttribLocation( program, "vColor" );
		gl.vertexAttribPointer( vColorLoc, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vColorLoc );
	
	// Unbind the buffer, for safety sake.
	gl.bindBuffer( gl.ARRAY_BUFFER, null );

	// Draw the axes, using the transformations set above.
	gl.drawArrays( gl.LINES, 0, nAxesPoints );	// Or gl.TRIANGLES, or . . .
	
	// Now to draw the first cone, using a different set of buffers and Indices
	
	// Reset the transformation to scale down the cone so the axes are visible.
	// ( Note that the cone is centered on the origin, standing on the Y = 0 plane. )
	
	uModelXform = rotate(270, vec3(1, 0, 0));
	gl.uniformMatrix4fv(uModelXformLoc, false, flatten(uModelXform));  // And push it to the GPU
	
	// And finally to draw the cone
	
	truncCone.render();
	
	// uModelXform = mult( translate(1, 0, 2), scalem(1, 1, 1) );
	// gl.uniformMatrix4fv(uModelXformLoc, false, flatten(uModelXform));

	// Schedule a redraw if appropriate
	//if( ??? ) 
	//	requestAnimFrame( render );
	
}