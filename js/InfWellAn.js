class Simulation {
    constructor(N) {
		this.N = N;
		this.dt = 0.0001;
		this.n = 1;
		this.m = 1;
		this.L = 1;
		this.hbar = 1;
		this.dx = 1 / this.N ;
		this.width = document.getElementById("canvas").clientWidth;
		this.ratio = this.N / this.width;
		this.re = [];
		this.im = [];
		this.levels = 10;
		this.reArray = new Array(this.levels);
		this.imArray = new Array(this.levels);
		this.pArray = new Array(this.levels);
		this.re2 = [];
		this.im2 = [];
		this.p = [];
		this.x = [];
		this.V = [];
		this.tau = 0;
		this.time = 0;
		this.run = 1;
		this.old = "";
		this.phases = new Array(this.levels);
		this.enabled = new Array(this.levels);

		for(var ii = 0; ii < this.levels; ii++){
			this.reArray[ii] = new Array(this.N);
			this.imArray[ii] = new Array(this.N);
			this.enabled[ii] = 0;
			this.phases[ii]  = 0; 
		}
		this.enabled[0] = 1;
    }
	
	toRad(alfa){
		return alfa * Math.PI / 180;
	}
	
    calculateStationary(n, k) {
        return Math.sqrt(2) * Math.sin(n * Math.PI * k * this.dx);
    }
	
	calculateStationaryEnergy(n){
		
		return n*n * Math.PI * Math.PI / (2* this.m * this.L * this.L);
		
	}

    update(){
		
		let toAnnounce = "$${\\psi =";
		for(var jj = 0; jj< this.levels; jj++){
			if(this.enabled[jj] == 1){
				toAnnounce += "\\psi_" + (jj+1) + " + ";
				for (var ii = 0; ii < this.N + 1; ii++){
							this.reArray[jj][ii] = this.calculateStationary(jj + 1, (ii ))*(Math.cos(this.time*(jj + 1)*(jj + 1) + this.toRad(this.phases[jj])));
							this.x[ii] = ii;
							this.imArray[jj][ii] = this.calculateStationary(jj + 1, (ii))*(Math.sin(this.time*(jj + 1)*(jj + 1) + this.toRad(this.phases[jj])));
							this.V[ii] = 10;
				}
			}
		}
		if(this.run == 1){
			this.time+=0.001;
		}
		toAnnounce = toAnnounce.substring(0, toAnnounce.length - 2) + "}$$";
		//toAnnounce+= '}$$';
		if(toAnnounce != this.old){
			let xdd = document.getElementById("psi_form");
			xdd.innerHTML= toAnnounce; 
			this.old= toAnnounce; 
			MathJax.Hub.Queue(["Typeset",MathJax.Hub,xdd]);
			
		}
		
		let norm = 0;
		for (var ii = 0; ii < this.N + 1; ii++){
			this.im[ii] = 0;
			this.re[ii] = 0;
			for(var jj = 0; jj< this.levels; jj++){
				if(this.enabled[jj] == 1){
					this.im[ii] += this.imArray[jj][ii];
					this.re[ii] += this.reArray[jj][ii];
				}
			}
			
		}
		
		for (var ii = 0; ii < this.N + 1; ii++){
			this.p[ii] = (this.im[ii]) * (this.im[ii]) + (this.re[ii]) * (this.re[ii]);
			norm += this.p[ii];
		}
		
		for (var ii = 0; ii < this.N + 1; ii++){
			this.p[ii] /= Math.sqrt(norm);
			
		}
    }
	
    setup() {
        
		this.update();

			
		

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
	constructor(N) {
	this.t = 0;
	this.N = N;
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
	this.sim = new Simulation(this.N);
 	this.ratio = this.N / this.width;
	this.drawing = [1,0,0];

    }
	
	onWindowResize(){
		this.camera.aspect =  document.getElementById("canvas").clientWidth / this.height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( document.getElementById("canvas").clientWidth, this.height );
		console.log(document.getElementById("canvas").clientWidth );
	}
	
	init(){
		this.sim.setup();
		this.scene = new THREE.Scene();

		this.camera = new THREE.OrthographicCamera(this.width / -2, this.width / 2, this.height / 2, this.height / -2, 0, 1000);

		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.renderer.setSize(this.width, this.height);
		var theDiv = document.getElementById("canvas");
		
		window.addEventListener('resize', function(){
			this.abc.onWindowResize(this.abc);
			
		}, false);
		


		theDiv.appendChild(this.renderer.domElement);
		var geometry = new THREE.BufferGeometry();

		geometry.addAttribute('position', new THREE.BufferAttribute(this.positions, 3));
		geometry.setDrawRange(0, this.N);
		var material = new THREE.LineBasicMaterial({ color: 0xff000, linewidth: 2 });

		this.line = new THREE.Line( geometry, material );

		var geometry2 = new THREE.BufferGeometry();
		var material2 = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
		geometry2.addAttribute('position', new THREE.BufferAttribute(this.positionsRe, 3));
		geometry2.setDrawRange(0, this.N);
		this.lineRe = new THREE.Line( geometry2, material2 );

		var geometry3 = new THREE.BufferGeometry();
		var material3 = new THREE.LineBasicMaterial({ color: 0x00fff0, linewidth: 2 });
		geometry3.addAttribute('position', new THREE.BufferAttribute(this.positionsWell, 3));
		geometry3.setDrawRange(0, this.N);
		this.lineWell = new THREE.Line( geometry3, material3 );
		var geometry4 = new THREE.BufferGeometry();
		var material4 = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
		geometry4.addAttribute('position', new THREE.BufferAttribute(this.positionsIm, 3));
		geometry4.setDrawRange(0, this.N);
		this.lineIm = new THREE.Line( geometry4, material4 );

		var geometryX= new THREE.BoxGeometry( 1300, 500, 1 );
		var materialX = new THREE.MeshBasicMaterial( {color: 0xD3D3D3} );
		var cube = new THREE.Mesh( geometryX, materialX );
		cube.position.set(0, 0, -10);
		//this.scene.add( cube );
		var gbl = new THREE.Geometry();
		gbl.vertices.push(
			new THREE.Vector3( -0.8*this.width/2, -2000, 0 ),
			new THREE.Vector3( -0.8*this.width/2, 2000, 0 ),
			new THREE.Vector3( 0.8*this.width/2, 2000, 0 ),
			new THREE.Vector3( 0.8*this.width/2, -2000, 0 )
		);
		
		var materialgbl = new THREE.LineBasicMaterial({ color: 0x0, linewidth: 2 });
		
		var boundingLine = new THREE.Line( gbl, materialgbl );
		this.scene.add(boundingLine);
		this.scene.add(this.line);
		this.scene.add(this.lineRe);
		this.scene.add(this.lineIm);
		this.scene.add(this.lineWell);



	}
	
	updatePositions(){
				
		this.sim.update();
		for(var i=0;i<3 *( this.N+1); i+=3){
			this.positions[ i ] = (-0.8*this.width/2+i*0.8/(this.ratio*3))
			this.positions[ i+1 ] = 50*this.sim.re[i/3];
			this.positions[ i+2 ] = 0;

			this.positionsRe[ i ] = (-0.8*this.width/2+i*0.8/(this.ratio*3))
			this.positionsRe[ i+1 ] =  500*this.sim.p[i/3];
			this.positionsRe[ i+2 ] = 0;
			
			this.positionsIm[ i ] = (-0.8*this.width/2+i*0.8/(this.ratio*3))
			this.positionsIm[ i+1 ] =  50*this.sim.im[i/3];
			this.positionsIm[ i+2 ] = 0;


			this.positionsWell[ i ] = (-0.8*this.width/2+i*0.8/(this.ratio*3))
			this.positionsWell[ i+1 ] = 50*this.sim.V[i/3];
			this.positionsWell[ i+2 ] = 0;


		}
				
	}
	
};

var psiN1 = document.getElementById("n1");
var psiN2 = document.getElementById("n2");
var psiN3 = document.getElementById("n3");
var psiN4 = document.getElementById("n4");
var psiN5 = document.getElementById("n5");
var psiN6 = document.getElementById("n6");
var psiN7 = document.getElementById("n7");
var psiN8 = document.getElementById("n8");
var psiN9 = document.getElementById("n9");

var psiPhase1 = document.getElementById("slider_phase1");
var psiPhase2 = document.getElementById("slider_phase2");
var psiPhase3 = document.getElementById("slider_phase3");
var psiPhase4 = document.getElementById("slider_phase4");
var psiPhase5 = document.getElementById("slider_phase5");
var psiPhase6 = document.getElementById("slider_phase6");
var psiPhase7 = document.getElementById("slider_phase7");
var psiPhase8 = document.getElementById("slider_phase8");
var psiPhase9 = document.getElementById("slider_phase9");

var stopped = document.getElementById("stopped");
var chIm = document.getElementById("chIm");
var chRe = document.getElementById("chRe");
var chDe = document.getElementById("chDe");

psiN1.checked = true;
psiN2.checked = false;
psiN3.checked = false;
psiN4.checked = false;
psiN5.checked = false;
psiN6.checked = false;
psiN7.checked = false;
psiN8.checked = false;
psiN9.checked = false;
stopped.checked = true;

 $("#mode").removeClass("hidden");
 document.querySelector(".sim_mode").innerHTML = "Opcje"; 
			
var clicker = $("#mode");
clicker.click(function(){
	var theGuy = $("#sim_mode_expand");
	
	console.log(value);
	if( theGuy.hasClass('hidden')){
		theGuy.removeClass('hidden');
		//var value = theGuy.height();
		//$("#psi_form").css("top", "+=" + value);
	}else {
		//var value = theGuy.height();
		theGuy.addClass('hidden');
		//$("#psi_form").css("top", "-=" + value);
	}
	
});
var abc = new RenderIt(1000);
abc.init();

// Misc !!!
psiN1.addEventListener( "change", 
	function(){
		if (this.checked) {
			abc.sim.enabled[0] = 1;
		}else{
			abc.sim.enabled[0] = 0;
		}
});

psiN2.addEventListener( "change", 
	function(){
		if (this.checked) {
			abc.sim.enabled[1] = 1;
		}else{
			abc.sim.enabled[1] = 0;
		}
});

psiN3.addEventListener( "change", 
	function(){
		if (this.checked) {
			abc.sim.enabled[2] = 1;
		}else{
			abc.sim.enabled[2] = 0;
		}
});

psiN4.addEventListener( "change", 
	function(){
		if (this.checked) {
			abc.sim.enabled[3] = 1;
		}else{
			abc.sim.enabled[3] = 0;
		}
});

psiN5.addEventListener( "change", 
	function(){
		if (this.checked) {
			abc.sim.enabled[4] = 1;
		}else{
			abc.sim.enabled[4] = 0;
		}
});

psiN6.addEventListener( "change", 
	function(){
		if (this.checked) {
			abc.sim.enabled[5] = 1;
		}else{
			abc.sim.enabled[5] = 0;
		}
});

psiN7.addEventListener( "change", 
	function(){
		if (this.checked) {
			abc.sim.enabled[6] = 1;
		}else{
			abc.sim.enabled[6] = 0;
		}
});

psiN8.addEventListener( "change", 
	function(){
		if (this.checked) {
			abc.sim.enabled[7] = 1;
		}else{
			abc.sim.enabled[7] = 0;
		}
});

psiN9.addEventListener( "change", 
	function(){
		if (this.checked) {
			abc.sim.enabled[8] = 1;
		}else{
			abc.sim.enabled[8] = 0;
		}
});

stopped.addEventListener( "change", 
	function(){
		if (this.checked) {
			abc.sim.run = 1;
		}else{
			abc.sim.run = 0;
		}
});

chDe.addEventListener( "change", 
function(){
	if (this.checked) {
		abc.drawing[0] = 1;
	}else{
		abc.drawing[0] = 0;
	}
});

chRe.addEventListener( "change", 
function(){
	if (this.checked) {
		abc.drawing[1] = 1;
	}else{
		abc.drawing[1] = 0;
	}
});

chIm.addEventListener( "change", 
function(){
	if (this.checked) {
		abc.drawing[2] = 1;
	}else{
		abc.drawing[2] = 0;
	}
});

psiPhase1.addEventListener("input", function(e) {
	var target = (e.target) ? e.target : e.srcElement;
	abc.sim.phases[0] = (target.value);
});

psiPhase2.addEventListener("input", function(e) {
	var target = (e.target) ? e.target : e.srcElement;
	abc.sim.phases[1] = (target.value);
});

psiPhase3.addEventListener("input", function(e) {
	var target = (e.target) ? e.target : e.srcElement;
	abc.sim.phases[2] = (target.value);
});

psiPhase4.addEventListener("input", function(e) {
	var target = (e.target) ? e.target : e.srcElement;
	abc.sim.phases[3] = (target.value);
});

psiPhase5.addEventListener("input", function(e) {
	var target = (e.target) ? e.target : e.srcElement;
	abc.sim.phases[4] = (target.value);
});

psiPhase6.addEventListener("input", function(e) {
	var target = (e.target) ? e.target : e.srcElement;
	abc.sim.phases[5] = (target.value);
});

psiPhase7.addEventListener("input", function(e) {
	var target = (e.target) ? e.target : e.srcElement;
	abc.sim.phases[6] = (target.value);
});

psiPhase8.addEventListener("input", function(e) {
	var target = (e.target) ? e.target : e.srcElement;
	abc.sim.phases[7] = (target.value);
});

psiPhase9.addEventListener("input", function(e) {
	var target = (e.target) ? e.target : e.srcElement;
	abc.sim.phases[8] = (target.value);
});



// End


this.animate = function() {
			requestAnimationFrame(animate);
			abc.updatePositions();
			abc.line.geometry.attributes.position.needsUpdate = true;
			abc.lineRe.geometry.attributes.position.needsUpdate = true;
			abc.lineIm.geometry.attributes.position.needsUpdate = true;
			abc.lineWell.geometry.attributes.position.needsUpdate = true;
			
			if(abc.drawing[0] == 1){
				abc.lineRe.visible = true;
			}else{
				abc.lineRe.visible = false;
			}	
			
			if(abc.drawing[1] == 1){
				abc.line.visible = true;
			}else{
				abc.line.visible = false;
			}	
			
			if(abc.drawing[2] == 1){
				abc.lineIm.visible = true;
			}else{
				abc.lineIm.visible = false;
			}
			
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