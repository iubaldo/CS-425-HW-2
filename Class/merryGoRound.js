/* merryGoRound.js
	name: Ian Ubaldo
	netid: iubaldo2
*/


class MerryGoRound{ 
	transformArr = [];
	horseArr = [];
	nSectors = 8;

	constructor( gl, program ) {
		
		// Save gl, program, and nSectors as instance variables for use by render( )
		this.gl = gl;
		this.program = program;
		
		this.transformArr = [];

		this.topCone = new TruncatedCone(gl, program, 6, 0, 0.5);
		var topConeTransform = mat4();
		topConeTransform = scalem(5, 1, 5);
		this.transformArr.push(topConeTransform)

		this.bottomCone = new TruncatedCone(gl, program, 6, 0, 0.5);
		var bottomConeTransform = mat4();
		bottomConeTransform = scalem(5, -1, 5);
		this.transformArr.push(bottomConeTransform)

		var dTheta = 2 * Math.PI / this.nSectors;
		for (var i = 0; i < this.nSectors; i++) {
			this.horseArr.push(new TruncatedCone(gl, program, 6, 0, 0.5));

			var theta = i * dTheta;
			var horseTransform = mat4();

			// horseTransform = mult(horseTransform, scalem(1, 2, 1));				
			horseTransform = mult(horseTransform, translate(4 * Math.cos(theta), 0, 4 * Math.sin(theta)));
			horseTransform = mult(horseTransform, rotate(-90, Math.cos(theta), 0, Math.sin(theta)));

			this.transformArr.push(horseTransform);
		}
		
		return;
	} // Cone constructor
	
	render(baseTransform, time) {
		var uModelXformLoc = gl.getUniformLocation( program, "uModelXform" );
		var uModelXform;

    uModelXform = mult(this.transformArr[0], baseTransform);
		uModelXform = mult(uModelXform, translate(0, 3, 0));	
		gl.uniformMatrix4fv(uModelXformLoc, false, flatten(uModelXform));
		this.topCone.render();

		uModelXform = mult(this.transformArr[1], baseTransform);
		uModelXform = mult(uModelXform, translate(0, 2, 0));
		gl.uniformMatrix4fv(uModelXformLoc, false, flatten(uModelXform));
		this.bottomCone.render();

		for (var i = 0; i < this.nSectors; i++) {
			uModelXform = this.transformArr[2 + i];
			uModelXform = mult(uModelXform, translate(Math.cos(time * 0.05), 0, Math.sin(time * 0.05)));
			uModelXform = mult(baseTransform, uModelXform);
			gl.uniformMatrix4fv(uModelXformLoc, false, flatten(uModelXform));
			this.horseArr[i].render();
		}
		
	} // Cone.render( )
} // class Cone