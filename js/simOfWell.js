class Simulation {
    constructor() {
        this.N = 1000;
        this.dt = 0.0001;
        this.kappa = 1.0;
        this.n = 1;
        this.omega = 5.0 / 0.5 * Math.PI * Math.PI;
	this.dx = 1 / 100;
 	this.width = document.getElementById("canvas").clientWidth;
	this.ratio = this.N / this.width;
	this.wellPositions = [ 450, 550];
	this.wellHeights = [0];
 	this.re = [];
        this.im = [];
        this.hr = [];
        this.hi = [];
        this.p = [];
        this.x = [];
	this.V = [];
	this.tau = 0;
    }
	
    calculateStationary(n, k) {
        return Math.sqrt(2) * Math.sin(n * Math.PI * k * this.dx);
    }
	
    setup() {
        
       
	for(var jj = 0; jj< this.wellPositions.length; jj+=2){
      		for (var ii = this.wellPositions[jj]; ii < this.wellPositions[jj+1]; ii++)
		{
            		this.re[ii] = this.calculateStationary(this.n, ii-this.wellPositions[jj]);
            		this.x[ii] = ii;
            		this.im[ii] = 0;
	    		this.p[ii] = this.re[ii] * this.re[ii] + this.im[ii] * this.im[ii];
			this.V[ii] = this.wellHeights[jj/2];
        	}
	}

	var arrTmp = [0];
	var arr = arrTmp.concat(this.wellPositions);
	arr.push(this.N);
	//console.log(arr);
	for(var jj = 0; jj< arr.length; jj+=2){
      		for (var ii = arr[jj]; ii < arr[jj+1]; ii++)
		{
            		this.re[ii] = 0;
            		this.x[ii] = ii;
            		this.im[ii] = 0;
	    		this.p[ii] = 0;
			this.V[ii] = 1;

        	}
	}


	
    }
	
}

class RenderIt{
	constructor() {
	this.t = 0;
        this.N = 1000;
        this.width = document.getElementById("canvas").clientWidth;
        this.height = 700;
        this.positions = new Float32Array(this.N * 3);
	this.positionsRe = new Float32Array(this.N * 3);
	this.positionsWell = new Float32Array(this.N * 3);
        this.renderer = null;
        this.scene = null;
	this.camera = null;
	this.animate = null;
	this.line = null;
	this.lineRe = null;
	this.lineWell = null;
	this.sim = new Simulation();
 	this.ratio = this.N / this.width;

    }
	
	init(){
		this.sim.setup();
		this.scene = new THREE.Scene();

		this.camera = new THREE.OrthographicCamera(this.width / -2, this.width / 2, this.height / 2, this.height / -2, 0, 1000);

		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.renderer.setSize(this.width, this.height);
		var theDiv = document.getElementById("canvas");

		theDiv.style.width = this.width + 'px';
		theDiv.style.height = this.height + 'px';

		theDiv.appendChild(this.renderer.domElement);
		var geometry = new THREE.BufferGeometry();

		geometry.addAttribute('position', new THREE.BufferAttribute(this.positions, 3));
		geometry.setDrawRange(0, this.N);
		var material = new THREE.LineBasicMaterial({ color: 0x00000, linewidth: 2 });

		this.line = new THREE.Line( geometry, material );

		var geometry2 = new THREE.BufferGeometry();
		var material2 = new THREE.LineBasicMaterial({ color: 0xff000, linewidth: 2 });
		geometry2.addAttribute('position', new THREE.BufferAttribute(this.positionsRe, 3));
		geometry2.setDrawRange(0, this.N);
		this.lineRe = new THREE.Line( geometry2, material2 );

		var geometry3 = new THREE.BufferGeometry();
		var material3 = new THREE.LineBasicMaterial({ color: 0xaf0f2, linewidth: 2 });
		geometry3.addAttribute('position', new THREE.BufferAttribute(this.positionsWell, 3));
		geometry3.setDrawRange(0, this.N);
		this.lineWell = new THREE.Line( geometry3, material3 );
	

		this.scene.add(this.line);
		this.scene.add(this.lineRe);
		this.scene.add(this.lineWell);



	}
	
	updatePositions(){
				
		
		for(var i=0;i<3 *( this.N+1); i+=3){
			this.positions[ i ] = (-0.9*this.width/2+i*0.9/(this.ratio*3))
			this.positions[ i+1 ] = 80*this.sim.p[i/3];
			this.positions[ i+2 ] = 0;

			this.positionsRe[ i ] = (-0.9*this.width/2+i*0.9/(this.ratio*3))
			this.positionsRe[ i+1 ] = -this.height/3 + 50*this.sim.re[i/3];
			this.positionsRe[ i+2 ] = 0;

			this.positionsWell[ i ] = (-0.9*this.width/2+i*0.9/(this.ratio*3))
			this.positionsWell[ i+1 ] = 50*this.sim.V[i/3];
			this.positionsWell[ i+2 ] = 0;


		}
				
	}
	
};

var abc = new RenderIt();
abc.init();

this.animate = function() {
			requestAnimationFrame(animate);
			abc.updatePositions();
			abc.line.geometry.attributes.position.needsUpdate = true;
			abc.lineRe.geometry.attributes.position.needsUpdate = true;
			abc.lineWell.geometry.attributes.position.needsUpdate = true;

			abc.renderer.render(abc.scene, abc.camera);
		           
}
var reset = document.getElementById("reset");
reset .addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            abc.sim.n= (target.value);
		            abc.sim.setup();

});
if (WEBGL.isWebGLAvailable()) {
	animate();
			
}else {
	var warning = WEBGL.getWebGLErrorMessage();
	document.getElementById('canvas').appendChild(warning);
}

//Render.init();
//	Render.destroy();