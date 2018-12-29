class Simulation {
    constructor() {
        this.N = 1000;
        this.dt = 0.0001;
        this.kappa = 10.0;
		this.n = 3;
		this.omega = 5.0 / 2.0 * Math.PI * Math.PI;
		this.dx = 1 / 100;
		this.width = document.getElementById("canvas").clientWidth;
		this.ratio = this.N / this.width;
		this.wellHeights = [0];
		this.re = [];
        this.im = [];
        this.hr = [];
        this.hi = [];
        this.p = [];
        this.x = [];
		this.V = [];
		this.tau = 0;
		this.speed = 10;
		this.time = 0;
    }
		
    update(){

		this.calculateWave();
		

    }
	
	calculateWave(){
		for (var ii = 0; ii < this.N; ii++){
			this.re[ii] = ii/10;
			this.x[ii] = ii;
			this.im[ii] = 0;
			this.p[ii] = this.re[ii] * this.re[ii] + this.im[ii] * this.im[ii];
			
        }
		
    }

	
    setup() {
        for (var ii = 0; ii < this.N; ii++){
			this.V[ii] = 0;
        }
		
		for (var ii = this.N * 0.2; ii < this.N * 0.8; ii++){
			this.V[ii] = 1;
        }
      	this.calculateWave();

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
	this.positionsIm = new Float32Array(this.N * 3);
	this.positionsWell = new Float32Array(this.N * 3);
	this.renderer = null;
	this.scene = null;
	this.camera = null;
	this.animate = null;
	this.line = null;
	this.lineRe = null;
	this.lineWell = null;
	this.lineIm = null;
	this.sim = new Simulation();
 	this.ratio = this.N / this.width;
	this.iter = 0;

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
		var material = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });

		this.line = new THREE.Line( geometry, material );

		var geometry2 = new THREE.BufferGeometry();
		var material2 = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
		geometry2.addAttribute('position', new THREE.BufferAttribute(this.positionsRe, 3));
		geometry2.setDrawRange(0, this.N);
		this.lineRe = new THREE.Line( geometry2, material2 );

		var geometry3 = new THREE.BufferGeometry();
		var material3 = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
		geometry3.addAttribute('position', new THREE.BufferAttribute(this.positionsWell, 3));
		geometry3.setDrawRange(0, this.N);
		this.lineWell = new THREE.Line( geometry3, material3 );
		var geometry4 = new THREE.BufferGeometry();
		var material4 = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
		geometry4.addAttribute('position', new THREE.BufferAttribute(this.positionsIm, 3));
		geometry4.setDrawRange(0, this.N);
		this.lineIm = new THREE.Line( geometry4, material4 );


		this.scene.add(this.line);
		this.scene.add(this.lineRe);
		this.scene.add(this.lineIm);
		this.scene.add(this.lineWell);



	}
	
	updatePositions(){
		
		this.sim.update();
		for(var i=0;i<3 *( this.N+1); i+=3){
			this.positions[ i ] = (-0.9*this.width/2+i*0.9/(this.ratio*3))
			this.positions[ i+1 ] =-this.height/3 + 50*this.sim.re[i/3];
			this.positions[ i+2 ] = 0;

			this.positionsRe[ i ] = (-0.9*this.width/2+i*0.9/(this.ratio*3))
			this.positionsRe[ i+1 ] =  80*this.sim.p[i/3];
			this.positionsRe[ i+2 ] = 0;
			
			this.positionsIm[ i ] = (-0.9*this.width/2+i*0.9/(this.ratio*3))
			this.positionsIm[ i+1 ] =  -this.height/3 +  50*this.sim.im[i/3];
			this.positionsIm[ i+2 ] = 0;


			this.positionsWell[ i ] = (-0.9*this.width/2+i*0.9/(this.ratio*3))
			this.positionsWell[ i+1 ] = 50*this.sim.V[i/3];
			this.positionsWell[ i+2 ] = 0;


		}
		
		this.iter++;
				
	}
	
};


function addData(chart, label, data) {
    chart.data.datasets[0].data.push({x: data.x, y: data.y});
    chart.update();
}

function clearData(chart) {
    chart.data.datasets[0].data = [];
    chart.update();
}
var abc = new RenderIt();
abc.init();

this.animate = function() {
			requestAnimationFrame(animate);
			abc.updatePositions();
			abc.line.geometry.attributes.position.needsUpdate = true;
			abc.lineRe.geometry.attributes.position.needsUpdate = true;
			abc.lineIm.geometry.attributes.position.needsUpdate = true;
			abc.lineWell.geometry.attributes.position.needsUpdate = true;

			abc.renderer.render(abc.scene, abc.camera);
		           
}

if (WEBGL.isWebGLAvailable()) {
	animate();
			
}else {
	var warning = WEBGL.getWebGLErrorMessage();
	document.getElementById('canvas').appendChild(warning);
}



//Render.init();
//	Render.destroy();