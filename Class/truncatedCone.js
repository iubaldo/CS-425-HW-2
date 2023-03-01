/* cone.js
	
	Written by John Bell for CS 425, Fall 2020
	Last revised Spring 2023 by John Bell
    
    This file contains code to create and draw a unit cone, centered at the origin.
	
	Many steps are incomplete and/or commented out for exercise purposes.
    
*/

// Globals are evil.  We won't use any here. :-)

class TruncatedCone{ 

	constructor( gl, program, nSectors, color, ratio ) {
		
		// Save gl, program, and nSectors as instance variables for use by render( )
		this.gl = gl;
		this.program = program;
		this.nSectors = nSectors;
		
		var positions = [ ];	// Vertex location data (top base)
    var facePositions = [ ]; // reorganize the vertices in above to draw the cone's sides
		var colors = [ ];	// Vertex color data
		
		// If the color passed in is invalid, then we will use random colors later.
		
		var validColor = false;
		
		if ( Array.isArray( color ) && color.length == 3 
			&& color[0] >= 0 && color[1] >= 0 && color[2] >=0
			&& color[0] <= 1 && color[1] <= 1 && color[2] <=1 ) {
			
			validColor = true;
																 
		}
	
		// Generate Points and Colors
		
		// TODO 3 - push vec3s into the colors array for each vertex.
		// If the passed color is valid, use it to make a vec3.  
		// Otherwise use calls to Math.random( ).
		// This object uses one vertex at the point and nSectors + 1 around the base.
		
		for( var i = 0; i < (nSectors + 2) * 4 + 1; i++ ) {
			if( validColor ) {
				// Push the passed-in valid color here, as a vec3
				colors.push(vec3(color));
			} else {
				// Push a random color here, as a vec3 				
				colors.push(Math.random(), Math.random(), Math.random());
			}
		}

    // top vertex
		positions.push(vec3(0, 1, 0));

    // top base - creates nSectors points + 1     (note: top radius = ratio * bottom radius)
    var dTheta = 2 * Math.PI / this.nSectors; // In radians
    for( i = 0; i < this.nSectors + 1; i++ ) { // Duplicate ( 1, 0, 0 ) to close loop.
			var theta = i * dTheta;
			positions.push(vec3(ratio * Math.cos(theta), 1, ratio * Math.sin(theta)));
		}	
    console.log(positions);

    // bottom vertex (bottom base center)
    positions.push(vec3(0, 0, 0));

    // bottom base
    dTheta = 2 * Math.PI / this.nSectors;
		for( i = 0; i < this.nSectors + 1; i++ ) { // Duplicate ( 1, 0, 0 ) to close loop.
			var theta = i * dTheta;
			positions.push(vec3(Math.cos(theta), 0, Math.sin(theta)));
		}	
    console.log(positions);

		// faces - need to push alternating + skip vertex
		for( i = 0; i < this.nSectors + 1; i++ ) { // Duplicate ( 1, 0, 0 ) to close loop.
			positions.push(positions[i + 1]);
      positions.push(positions[i + 1 + nSectors + 2]);
		}
    positions.push(positions[1]);
    positions.push(positions[1 + nSectors + 2]);
    positions.push(positions[2]);
    console.log(positions);

		// Push vertex position data to GPU
		// Hold off on connecting the data to the shader variables
		
		this.positionBufferID = gl.createBuffer( );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.positionBufferID );
		gl.bufferData( gl.ARRAY_BUFFER, flatten( positions ), gl.STATIC_DRAW );

    // TODO: buffer for positionFaces
    this.facePositionBufferID = gl.createBuffer( );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.facePositionBufferID );
		gl.bufferData( gl.ARRAY_BUFFER, flatten( positions ), gl.STATIC_DRAW );
		
		this.colorBufferID = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, this.colorBufferID);
		gl.bufferData( gl.ARRAY_BUFFER, flatten( colors ), gl.STATIC_DRAW);

		
		// Unbind the buffer, for safety sake.		
		gl.bindBuffer( gl.ARRAY_BUFFER, null );
		
		return;
	} // Cone constructor
	
	render() {
		
    // bind buffers
		gl.bindBuffer( gl.ARRAY_BUFFER, this.positionBufferID );
			var vPositionLoc = gl.getAttribLocation( this.program, "vPosition" );
			gl.vertexAttribPointer( vPositionLoc, 3, gl.FLOAT, false, 0, 0 );
			gl.enableVertexAttribArray( vPositionLoc );
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBufferID);
			var vColorLoc = gl.getAttribLocation(program, "vColor");
			gl.vertexAttribPointer(vColorLoc, 3, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(vColorLoc);
		
		// Unbind the array buffer, for safety sake.		
		gl.bindBuffer( gl.ARRAY_BUFFER, null );
	
		
		// top base
		gl.drawArrays(gl.TRIANGLE_FAN, 0, this.nSectors + 2);
    // bottom base
    gl.drawArrays(gl.TRIANGLE_FAN, this.nSectors + 2, this.nSectors + 2);
		
		// bind buffer for faces array
    // draw cone faces
    
    this.gl.drawArrays( gl.TRIANGLE_STRIP, (2 * (this.nSectors + 2)) + 1, (2 * (this.nSectors + 2)) + 2 );

    // Unbind the array buffer, for safety sake.		
		gl.bindBuffer( gl.ARRAY_BUFFER, null );
		
	} // Cone.render( )
} // class Cone