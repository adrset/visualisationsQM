class Simulation {
    constructor() {
        this.N = 100;
        this.dt = 0.0001;
        this.kappa = 1.0;
        this.n = 1;
        this.omega = 3;
        this.setup();
    }
	
    setup() {
        this.dx = 1 / this.N;
        this.re = [];
        this.im = [];
        this.hr = [];
        this.hi = [];
        this.p = [];
        this.x = [];
		this.tau = 0;

        for (var ii = 0; ii < this.N + 1; ii++)
	{
            this.re[ii] = Simulation.calculateStationary(this.n, ii);
            this.x[ii] = ii;
            this.im[ii] = 0;
        }

	for (var ii = 1; ii < this.N; ii++)
	{
		this.hr[ii] = Simulation.calculateHamiltonian(this.re, ii, this.tau);
		this.hi[ii] = Simulation.calculateHamiltonian(this.im, ii, this.tau);
	}
	this.hr[0] = 0.0;
	this.hr[this.N] = 0.0;
	this.hi[0] = 0.0;
	this.hi[this.N] = 0.0;

    }
	
    leapFrog(){
	
		for (var ii = 0; ii < this.N + 1; ii++)
			this.re[ii] = this.re[ii] + this.hi[ii] * this.dt / 2.;

		for (var jj = 1; jj < this.N; jj++)
			this.hr[jj] = Simulation.calculateHamiltonian(this.re, jj, this.tau);

		for (var ii = 0; ii < this.N + 1; ii++)
			this.im[ii] = this.im[ii] - this.hr[ii] * this.dt;

		for (var jj = 1; jj < this.N; jj++)
			this.hi[jj] = Simulation.calculateHamiltonian(this.im, jj, this.tau);

		for (var ii = 0; ii < this.N + 1; ii++)
			this.re[ii] = this.re[ii] + this.hi[ii] * this.dt / 2.;

		for (var ii = 0; ii < this.N + 1; ii++)
		{
			this.p[ii] = this.re[ii] * this.re[ii] + this.im[ii] * this.im[ii];
		}

    }

    static calculateHamiltonian(part, k, tau) {
        return -0.5 * (part[k + 1] + part[k - 1] - 2.0 * part[k]) / (this.dx * this.dx) + this.kappa * (this.k * this.dx - 0.5) * part[k] * Math.sin(this.omega * tau);
    }

    static calculateStationary(n, k) {
        return Math.sqrt(2) * Math.sin(n * Math.PI * k * this.dx);
    }

}

var sim = new Simulation();
sim.leapFrog();

class RenderIt{
	constructor() {
        this.N = 100;
        this.width = document.getElementById("canvas").clientWidth;
        this.height = 700;
        this.positions = new Float32Array(this.N * 3);
        this.renderer = null;
        this.scene = null;
		this.camera = null;
		this.animate = null;
    }
	
	init(){
		console.log("HELLOFromClass");
 		this.scene = new THREE.Scene();

		this.camera = new THREE.OrthographicCamera(this.width / -2, this.width / 2, this.height / 2, this.height / -2, 0, 1000);

		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.renderer.setSize(this.width, this.height);
		var theDiv = document.getElementById("canvas");

		theDiv.style.width = this.width + 'px';
		theDiv.style.height = this.height + 'px';

		theDiv.appendChild(this.renderer.domElement);
		
		var material = new THREE.LineBasicMaterial({ color: 0x00000, linewidth: 2 });
		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( -10, 0, 0 ),
			new THREE.Vector3( 0, 10, 0 ),
			new THREE.Vector3( 10, 0, 0 )
		);

		var line = new THREE.Line( geometry, material );

		this.scene.add(line);
		
		this.animate = function() {
			console.log(this);
			requestAnimationFrame(animate);
			abc.renderer.render(this.scene, this.camera);
		           
		}
		
	}
	
	

	
	
};

var Render = {
	N : 100,
	width : document.getElementById("canvas").clientWidth,
	height : 700,
	positions : new Float32Array(this.N * 3),
	renderer : null,
	scene : null,
	camera : null,


	init: function(){
		console.log("HELLO2");
 		this.scene = new THREE.Scene();

		this.camera = new THREE.OrthographicCamera(this.width / -2, this.width / 2, this.height / 2, this.height / -2, 0, 1000);

		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.renderer.setSize(this.width, this.height);
		var theDiv = document.getElementById("canvas");

		theDiv.style.width = this.width + 'px';
		theDiv.style.height = this.height + 'px';

		theDiv.appendChild(this.renderer.domElement);
		/*var geometry = new THREE.BufferGeometry();
		geometry.addAttribute('position', new THREE.BufferAttribute(this.positions, 3));
		geometry.setDrawRange(0, 100);
		var material = new THREE.LineBasicMaterial({ color: 0x00000, linewidth: 2 });
		var line = new THREE.Line(geometry, material);*/
		var material = new THREE.LineBasicMaterial({ color: 0x00000, linewidth: 2 });
		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( -10, 0, 0 ),
			new THREE.Vector3( 0, 10, 0 ),
			new THREE.Vector3( 10, 0, 0 )
		);

		var line = new THREE.Line( geometry, material );

		this.scene.add(line);
		
		
		var animate = function(line, renderer, scene, camera) {
		   // console.log(line);
			requestAnimationFrame(animate);

		    //Render.updatePositions();

		    //line.geometry.attributes.position.needsUpdate = true;
		    console.log(renderer);//.render(scene, camera);
		           
		};


		if (WEBGL.isWebGLAvailable()) {
		    animate(line, this.renderer, this.scene, this.camera);
			
		} else {
		    var warning = WEBGL.getWebGLErrorMessage();
		    document.getElementById('canvas').appendChild(warning);
		}
	},
	updatePositions: function(){
		for(var i = 0; i < 300; i+3){
			this.positions[i] = i;
			this.positions[i+1] = i;
			this.positions[i+2] = 0;
			
		}
	}


	


}

var abc = new RenderIt();
abc.init();

var animate = function() {
			console.log(abc);
			requestAnimationFrame(animate);
			abc.renderer.render(abc.scene, abc.camera);
		           
}

if (WEBGL.isWebGLAvailable()) {
	abc.animate();
			
}else {
	var warning = WEBGL.getWebGLErrorMessage();
	document.getElementById('canvas').appendChild(warning);
}

//Render.init();
//	Render.destroy();