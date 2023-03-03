/* main.js
	name: Ian Ubaldo
	netid: iubaldo2
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


var merryGoRound;
var eyePos;


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

	
	truncCone = new TruncatedCone(gl, program, 6, 0, 0.5);
	merryGoRound = new MerryGoRound(gl, program);
	
	gl.enable( gl.DEPTH_TEST );	// Note:  This line had an error in the exercise template.
	
	// Initialization is done.  Now initiate first rendering
	render( );
}

function render( ) {
	
	// Clear out the color buffers and the depth buffers.
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	eyePos = vec3( 7, 3, -7 );
	var uViewXform = mat4( ); // Identity matrix unless changed otherwise.
	var uViewXform = lookAt( eyePos, vec3( 0, 0, 0 ), vec3( 0, 1, 0 ) );
	var uViewXformLoc = gl.getUniformLocation( program, "uViewXform" );
	gl.uniformMatrix4fv( uViewXformLoc, false, flatten( uViewXform ) );
	
	var uProjection = mat4( ); // Identity matrix unless changed otherwise.
	var uProjection = perspective( 60, aspectRatio, 0.1, 50.0 );
	var uProjectionLoc = gl.getUniformLocation( program, "uProjection" );
	gl.uniformMatrix4fv( uProjectionLoc, false, flatten( uProjection ) );
	
	var uModelXform = mat4( ); // Identity matrix unless changed otherwise.
	var uModelXformLoc = gl.getUniformLocation( program, "uModelXform" );
	gl.uniformMatrix4fv( uModelXformLoc, false, flatten( uModelXform ) );
	

	// Connect the axes vertex data to the shader variables - First positions
	bindDataToBuffer(vbufferID_axes, "vPosition", 3);
	
	// Then the axes colors
	bindDataToBuffer(cbufferID_axes, "vColor", 3);

	// Draw the axes, using the transformations set above.
	gl.drawArrays( gl.LINES, 0, nAxesPoints );
	
	gl.uniformMatrix4fv(uModelXformLoc, false, flatten(uModelXform));  // And push it to the GPU
	


	var time = 0;
	var rotAngle = 0;
	var loop = function() {
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

		uViewXform = lookAt( eyePos, vec3( 0, 0, 0 ), vec3( 0, 1, 0 ) );
		uViewXformLoc = gl.getUniformLocation( program, "uViewXform" );
		gl.uniformMatrix4fv( uViewXformLoc, false, flatten( uViewXform ) );

		uModelXform = rotate(rotAngle, vec3(0, 1, 0));
		gl.uniformMatrix4fv(uModelXformLoc, false, flatten(uModelXform));

		// truncCone.render();
		merryGoRound.render(uModelXform, time);

		rotAngle += 1;
		rotAngle = rotAngle % 360;
		time += 1;
		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);
}


function bindDataToBuffer(bindData, bindVar, size) {
	gl.bindBuffer( gl.ARRAY_BUFFER, bindData );
		var vLoc = gl.getAttribLocation( program, bindVar );
		gl.vertexAttribPointer( vLoc, size, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vLoc );
	
	// Unbind the buffer, for safety sake.
	gl.bindBuffer( gl.ARRAY_BUFFER, null );
}