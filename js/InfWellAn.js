class Simulation {
    constructor(N) {
		this.N = N;
		this.dt = 0.0001;
		this.n = 1;
		this.m = 1;
		this.L = 1;
		this.hbar = 1;
		this.dx = 1 / this.N ;
		this.width = document.getElementById("canvas_holder").clientWidth;
		this.ratio = this.N / this.width;
		this.re = [];
		this.im = [];
		
		this.levels = screen.width > 961 ? 15 : 15;
		console.log(this.levels);
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
		this.timeAdd = 0.001;
		this.phases = new Array(this.levels);
		this.amp = new Array(this.levels);
		this.enabled = new Array(this.levels);

		for(let ii = 0; ii < this.levels; ii++){
			this.reArray[ii] = new Array(this.N);
			this.imArray[ii] = new Array(this.N);
			this.pArray[ii] = new Array(this.N);
			this.enabled[ii] = 0;
			this.amp[ii] = Math.sqrt(2);
			this.phases[ii]  = 0; 
		}
		this.enabled[0] = 1;
    }
	
	toRad(alfa){
		return alfa * Math.PI / 180;
	}
	
    calculateStationary(n, k) {

		return this.amp[n-1] * Math.sin(n * Math.PI * k * this.dx);
	
    }
	
	calculateStationaryEnergy(n){
		
		return n*n * Math.PI * Math.PI * this.hbar * this.hbar/ (2* this.m * this.L * this.L);
		
	}

    update(){
		
		let toAnnounce = "&Psi; =";
		for(let jj = 0; jj< this.levels; jj++){
			
			if(this.enabled[jj] == 1){
				toAnnounce += "	c<sub>" + (jj+1) + "</sub>&Psi;<sub>" + (jj+1) + "</sub> + ";

			}
			for (let ii = 0; ii < this.N + 1; ii++){
						this.reArray[jj][ii] = this.calculateStationary(jj + 1, (ii ))*(Math.cos(this.time*(jj + 1)*(jj + 1) + this.toRad(this.phases[jj])));
						this.x[ii] = ii;
						this.imArray[jj][ii] = this.calculateStationary(jj + 1, (ii))*(Math.sin(this.time*(jj + 1)*(jj + 1) + this.toRad(this.phases[jj])));
						this.V[ii] = 10;
						this.pArray[jj][ii] = this.imArray[jj][ii]*this.imArray[jj][ii] + this.reArray[jj][ii]*this.reArray[jj][ii];
			}
			
		}
		if(this.run == 1){
			this.time+=parseFloat(this.timeAdd);
			
		}
		toAnnounce = toAnnounce.substring(0, toAnnounce.length - 2);
		//toAnnounce+= '}$$';
		if(toAnnounce != this.old){
			let xdd = document.getElementById("psi_form");
			xdd.innerHTML= toAnnounce; 
			this.old= toAnnounce; 
			//MathJax.Hub.Queue(["Typeset",MathJax.Hub,xdd]);
			
		}
		
		let norm = 0;
		for (let ii = 0; ii < this.N + 1; ii++){
			this.im[ii] = 0;
			this.re[ii] = 0;
			for(let jj = 0; jj< this.levels; jj++){
				if(this.enabled[jj] == 1){
					this.im[ii] += this.imArray[jj][ii];
					this.re[ii] += this.reArray[jj][ii];
					
				}
			}
			
		}
		
		for (let ii = 0; ii < this.N + 1; ii++){
			this.p[ii] = (this.im[ii]) * (this.im[ii]) + (this.re[ii]) * (this.re[ii]);
			norm += this.p[ii];
		}
		
		for (let ii = 0; ii < this.N + 1; ii++){
			this.p[ii] /= (norm);
			
		}
		norm = 0;
		for (let ii = 0; ii < this.N + 1; ii++){
			norm += this.p[ii];
			
		}
    }
	
    setup() {
        
		this.update();

			
		

		var arrTmp = [0];
		var arr = arrTmp.concat(this.wellPositions);
		arr.push(this.N);

		for(let jj = 0; jj< arr.length; jj+=2){
				for (let ii = arr[jj]; ii < arr[jj+1]; ii++)
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
		this.currentHover = -1;
		this.currentHover2 = -1;
		this.mouseDown = 0;
		this.raycaster = null;
		this.t = 0;
		this.N = N;
		this.gridEnabled = 1;
		this.gridDraw = [1,0];
		this.width = document.getElementById("canvas_holder").clientWidth;
		this.height = document.getElementById("canvas_holder").clientHeight;
		console.log(screen.width);
		this.mouseOld = new THREE.Vector2();
		this.positions = new Float32Array(this.N * 3);
		this.positionsRe = new Float32Array(this.N * 3);
		this.positionsIm = new Float32Array(this.N * 3);
		this.positionsWell = new Float32Array(12);
		this.renderer = null;
		this.scene = null;
		this.gridHelper = null;
		this.camera = null;
		this.hover = 0;
		this.animate = null;
		this.line = null;
		this.offset = 10;
		this.lineRe = null;
		this.move = 0;
		this.lineWell = null;
		this.scaleProb = 200000;
		this.scaleWave = 50;
		this.alreadyChecked = 0;
		this.lineIm = null;
		this.sim = new Simulation(this.N);
		this.ratio = this.N / this.width;
		this.drawing = [1,0,0];
		this.numberOfDisplayedStates = 0;//87;
		this.circles = new Array(this.numberOfDisplayedStates);
		this.segmentCount = 32;
		this.radius = 15;
		this.circleCL = new Array(this.numberOfDisplayedStates);
		this.circleC = new Array(this.numberOfDisplayedStates);
		this.mouseDr = new THREE.Vector2();
		this.mouse = new THREE.Vector2();
		this.theDiv = null;
		this.desktop = 0;
		this.doRescale = 0;
		this.lineETab = new Float32Array(2 * 3);
		this.drawEnergies = 1;
		this.lineE = null;
		this.linesE = new Array(this.sim.levels);
		this.lineETab = new Float32Array(2 * 3);
		this.linesETabs = new Array(this.sim.levels);
		if(screen.width > 961){
			this.desktop = 1;
		}
		
		for(let i=0;i<this.sim.levels; i++){
			this.linesETabs[i] = new Float32Array(6);
		}
		
		for(let i=0;i<this.numberOfDisplayedStates; i++){
			this.circles[i] = new Float32Array(this.N * this.segmentCount);
		}

    }
	
	resizeGrid(){
		if(this.gridDraw[0] == 1){
			this.scene.remove( this.gridHelper );
			this.gridHelper = new THREE.GridHelper( this.width, parseInt(this.scaleProb/ 25000), new THREE.Color(0xd4d4d6), new THREE.Color(0xd4d4d6));
			this.gridHelper.rotation.x = Math.PI / 2;
			this.gridHelper.position.z = -20;
			this.scene.add( this.gridHelper );
		}else{
			this.scene.remove( this.gridHelper2 );
			this.gridHelper2 = new THREE.GridHelper( this.width, parseInt(this.scaleWave/ 25000), new THREE.Color(0xd4d4d6), new THREE.Color(0xd4d4d6));
			this.gridHelper2.rotation.x = Math.PI / 2;
			this.gridHelper2.position.z = -20;
			this.scene.add( this.gridHelper2 );
			
		}
		
	}
	
	
	getAscpect(){
		
		return document.getElementById("canvas_holder").clientWidth / this.height;
	}
	
	onWindowResize(){
		this.camera.aspect =  this.getAscpect();
		this.camera.updateProjectionMatrix();
		
		this.resizeGrid();
		
		this.renderer.setSize( document.getElementById("canvas_holder").clientWidth, this.height );
		
	}
	
	init(){
		this.numberOfDisplayedStates = this.sim.levels;
		
		this.sim.setup();
		
		this.scene = new THREE.Scene();

		this.camera = new THREE.OrthographicCamera(this.width / -2, this.width / 2, this.height / 2, this.height / -2, 0, 1000);

		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

		this.renderer.setSize(this.width, this.height);
		this.theDiv = document.getElementById("canvas_holder");
		

		window.addEventListener('resize', function(){
			this.abc.onWindowResize(this.abc);
			
		}, false);
		
		this.raycaster =  new THREE.Raycaster();
		this.raycaster.linePrecision = 2;

		this.theDiv.appendChild(this.renderer.domElement);
		var geometry = new THREE.BufferGeometry();

		geometry.addAttribute('position', new THREE.BufferAttribute(this.positions, 3));
		geometry.setDrawRange(0, this.N);
		var material = new THREE.LineBasicMaterial({ color: 0xff000, linewidth: 2 });
		let materialE = new THREE.LineBasicMaterial({ color: 0xff0f, linewidth: 2 });
	
		this.line = new THREE.Line( geometry, material );

		var geometry2 = new THREE.BufferGeometry();
		var material2 = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
		geometry2.addAttribute('position', new THREE.BufferAttribute(this.positionsRe, 3));
		geometry2.setDrawRange(0, this.N);
		this.lineRe = new THREE.Line( geometry2, material2 );

		var geometry3 = new THREE.BufferGeometry();
		var material3 = new THREE.LineBasicMaterial({ color: 0x0, linewidth: 2 });
		geometry3.addAttribute('position', new THREE.BufferAttribute(this.positionsWell, 3));
		geometry3.setDrawRange(0, this.N);
		this.lineWell = new THREE.Line( geometry3, material3 );
		var geometry4 = new THREE.BufferGeometry();
		var material4 = new THREE.LineBasicMaterial({ color: 0x0f0fff, linewidth: 2 });
		geometry4.addAttribute('position', new THREE.BufferAttribute(this.positionsIm, 3));
		geometry4.setDrawRange(0, this.N);
		this.lineIm = new THREE.Line( geometry4, material4 );

		var geometryX= new THREE.BoxGeometry( 1300, 500, 1 );
		var materialX = new THREE.MeshBasicMaterial( {color: 0xD3D3D3} );
		var cube = new THREE.Mesh( geometryX, materialX );
		cube.position.set(0, 0, -10);
		//this.scene.add( cube );
		
		let size = this.width;
		let divisions = 6;

		this.gridHelper = new THREE.GridHelper( size, divisions, new THREE.Color(0xd4d4d6), new THREE.Color(0xd4d4d6));
		this.gridHelper.rotation.x = Math.PI / 2;
		this.gridHelper.position.z = -20;
		this.gridHelper2 = new THREE.GridHelper( size, divisions,  new THREE.Color(0xd4d4d6), new THREE.Color(0xd4d4d6) );
		this.gridHelper2.rotation.x = Math.PI / 2;
		this.gridHelper2.position.z = -20;
		this.scene.add( this.gridHelper2 );
		this.scene.add( this.gridHelper );
		
		for(let i=0;i<this.sim.levels; i++){
			let materialE = new THREE.LineBasicMaterial({ color: 0xff0f, linewidth: 2 });
			this.linesETabs[i] = new Float32Array(6);
			let geometriesE = new THREE.BufferGeometry();
			geometriesE.addAttribute('position', new THREE.BufferAttribute(this.linesETabs[i], 3));
			this.linesE[i] = new THREE.Line( geometriesE, materialE );
			this.scene.add(this.linesE[i]);
		}
		
		let geometryE = new THREE.BufferGeometry();
		geometryE.addAttribute('position', new THREE.BufferAttribute(this.lineETab, 3));
		this.lineE = new THREE.Line( geometryE, materialE );

		
		this.scene.add(this.line);
		this.scene.add(this.lineRe);
		this.scene.add(this.lineIm);
		this.scene.add(this.lineWell);

		this.rescale();

	}
	
	removeEnergyCircles(){
		for(let i = 0; i < this.numberOfDisplayedStates; i++){
			this.scene.remove(this.circleC[i]);
			this.scene.remove(this.circleCL[i]);
		}
		
	}
	
	checkIntersections(){
		this.raycaster.setFromCamera(this.mouse, this.camera);

		var intersects = this.raycaster.intersectObjects(this.linesE, true);
		if (intersects.length > 0) {
			let index = this.linesE.indexOf(intersects[ 0 ].object);
			$('html,body').css('cursor', 'pointer');
			this.currentHover2 = index;
			if(this.mouseDown == 1 && this.alreadyChecked == 0){
				this.alreadyChecked = 1;
				
				
				this.sim.enabled[index] = this.sim.enabled[index] == 1 ? 0 : 1;
				psiArr[index].checked = this.sim.enabled[index] == 1 ? 1 : 0;
			}
		} else {
			this.currentHover2 = -1;
			$('html,body').css('cursor', 'default');
		
			
		}
		
	}

	addEnergyCircles(){
		var geometryC =  new Array(this.numberOfDisplayedStates);		
		
		var geometryCL =  new Array(this.numberOfDisplayedStates);

		for(let i = 0; i < this.numberOfDisplayedStates; i++){
			geometryC[i] = new THREE.CircleGeometry(this.radius, 32);

			let materialCL = new Array(this.numberOfDisplayedStates);
			let materialC = null;
			if(this.sim.enabled[i]){
				materialC = new THREE.LineBasicMaterial({ color: 0xff00ff, side: THREE.DoubleSide});
			}else{
				materialC = new THREE.LineBasicMaterial({ color: 0x3b383d, side: THREE.DoubleSide});
			}
			/*for (let j = 0; j <= (this.segmentCount)*3; j+=3) {
				let theta = (j / this.segmentCount) * Math.PI * 2;
				geometryC[i].vertices.push(new THREE.Vector3(Math.cos(theta) * this.radius, Math.sin(theta) * this.radius, 0));
						          
			}*/
			
			let maxInLine = parseInt(this.width / (2*this.radius));
			this.move = (parseInt((i)/maxInLine)+1)*(4*this.radius);
			this.circleC[i] = new THREE.Mesh(geometryC[i], materialC);
			let spare = this.width - this.radius * 2 * maxInLine;
			let padding = spare /(2*this.numberOfDisplayedStates);
			geometryCL[i] = new THREE.Geometry();
			
			geometryCL[i].vertices.push(new THREE.Vector3(0,0,0),new THREE.Vector3(0,this.radius,0));            
			
			this.circleCL[i] = new THREE.Line(geometryCL[i], materialC);
			
			
			this.circleC[i].position.set(spare/2   + this.radius-this.width/2 + ((i)%maxInLine)*2*this.radius, -this.height/2 + this.radius + ((parseInt(this.numberOfDisplayedStates/maxInLine)) - parseInt((i)/maxInLine))*2*this.radius, -10);
			this.circleCL[i].position.set(spare/2  + this.radius-this.width/2 + ((i)%maxInLine)*2*this.radius, -this.height/2+ this.radius + ((parseInt(this.numberOfDisplayedStates/maxInLine)) - parseInt((i)/maxInLine))*2*this.radius, -10);
			

			this.scene.add( this.circleC[i] );
			//this.scene.add( this.circleCL[i] );
			
		}
		
	}
	
	
	updatePositions(){
		
		
		this
		
		this.sim.update();
		if(this.doRescale == 1){
			this.rescale();
			this.doRescale = 0;
		}
		if(this.currentHover <0 && this.currentHover2 < 0){
			for(let i=0;i<3 *( this.N+1); i+=3){
				this.positions[ i ] = 0.9*(-this.width/2+i/(this.ratio*3))
				this.positions[ i+1 ] = this.scaleWave*this.sim.re[i/3];
				this.positions[ i+2 ] = 0;

				this.positionsRe[ i ] = 0.9*(-this.width/2+i/(this.ratio*3))
				this.positionsRe[ i+1 ] = this.offset-this.height/2 + this.move+ this.scaleProb*this.sim.p[i/3];
				this.positionsRe[ i+2 ] = 0;
			
				this.positionsIm[ i ] = 0.9*(-this.width/2+i/(this.ratio*3))
				this.positionsIm[ i+1 ] =  this.scaleWave*this.sim.im[i/3];
				this.positionsIm[ i+2 ] = 0;
				
				

			}
			
			for(let i=0;i<this.sim.levels; i++){
				if(this.sim.enabled[i]){
					this.linesE[i].material.color = new THREE.Color( 0xff0000 );    
				}else{
					this.linesE[i].material.color = new THREE.Color( 0xaf0f );    
				
				}
				this.linesE[i].material.needsUpdate = true;
				let ene = this.sim.calculateStationaryEnergy(i);
				if(this.drawEnergies == 0){
					ene = -100000;
				}
				this.linesETabs[i][0] = -this.width/2;
				this.linesETabs[i][1] =-this.height/2 + ene;
				this.linesETabs[i][2] = 0;
				
				this.linesETabs[i][3] = +this.width/2;
				this.linesETabs[i][4] =-this.height/2 + ene;
				this.linesETabs[i][5] = 0;
			
			}
			
		}else{
			
			
			let hover = this.currentHover > -1 ? this.currentHover : this.currentHover2;
			for(let i=0;i<3 *( this.N+1); i+=3){

				let vec = this.rescaleTmp(hover);
				this.positions[ i ] = 0.9*(-this.width/2+i/(this.ratio*3))
				this.positions[ i+1 ] = vec.y*this.sim.reArray[hover][i/3];
				this.positions[ i+2 ] = 0;

				this.positionsRe[ i ] = 0.9*(-this.width/2+i/(this.ratio*3))
				this.positionsRe[ i+1 ] = this.offset-this.height/2 + this.move+ vec.x*this.sim.pArray[hover][i/3];
				this.positionsRe[ i+2 ] = 0;
			
				this.positionsIm[ i ] = 0.9*(-this.width/2+i/(this.ratio*3))
				this.positionsIm[ i+1 ] =  vec.y*this.sim.imArray[hover][i/3];
				this.positionsIm[ i+2 ] = 0;


			}
			this.linesE[hover].material.color = new THREE.Color( 0xf4c542 );         
			this.linesE[hover].material.needsUpdate = true;
			this.linesETabs[hover][1] =-this.height/2 + this.sim.calculateStationaryEnergy(hover);
			this.linesETabs[hover][4] =-this.height/2 + this.sim.calculateStationaryEnergy(hover);


		}

		this.positionsWell[0] = 0.9*(-this.width/2);
		this.positionsWell[1] = this.height / 2 + 10; 
		this.positionsWell[2] = 0;
		
		this.positionsWell[3] = 0.9*(-this.width/2);
		this.positionsWell[4] = - this.height / 2 - 10; 
		this.positionsWell[5] = 0;
		
		this.positionsWell[6] = 0.9*(this.width/2);
		this.positionsWell[7] = -this.height / 2 - 10; 
		this.positionsWell[8] = 0;
		
		this.positionsWell[9] = 0.9*(this.width/2);
		this.positionsWell[10] =  this.height / 2 + 10; 
		this.positionsWell[11] = 0;
		
				
	}

	rescaleTmp(index){
		let maxP = Math.max.apply(Math,this.sim.pArray[index]);
		let maxR = Math.max.apply(Math,this.sim.reArray[index]);
		let maxI = Math.max.apply(Math,this.sim.imArray[index]);
		
		let maxHeight = this.height-this.move;
		
		let scaleWave1 = Math.abs(0.4 * maxHeight / maxR);
		let scaleWave2 =  Math.abs(0.4 * maxHeight / maxI);
		
		let scaleProb =  Math.abs(0.5 * maxHeight / maxP);
		var vec = new THREE.Vector2();
		vec.x = scaleProb;
		if(scaleWave1 < scaleWave2)
			vec.y = scaleWave1;
		else
			vec.y = scaleWave2;
		
		return vec;
		
	}
	
	rescale(){
		let maxP = Math.max.apply(Math,this.sim.p);
		let maxR = Math.max.apply(Math,this.sim.re);
		let maxI = Math.max.apply(Math,this.sim.im);
		
		let maxHeight = this.height-this.move;
		
		let scaleWave1 = Math.abs(0.4 * maxHeight / maxR);
		let scaleWave2 =  Math.abs(0.4 * maxHeight / maxI);
		
		let scaleProb =  Math.abs(0.5 * maxHeight / maxP);
		
		this.scaleProb = scaleProb;
		if(scaleWave1 < scaleWave2)
			this.scaleWave = scaleWave1;
		else
			this.scaleWave = scaleWave2;
		
		this.resizeGrid();
		
	}
	
};


 $("#mode").removeClass("hidden");
 document.querySelector(".sim_mode").innerHTML = "Opcje"; 
			
var clicker = $("#mode");
			clicker.click(function(){
				var theGuy = $("#sim_mode_expand");
				
			
				if( theGuy.hasClass("hidden_mobile")){
					theGuy.removeClass("hidden_mobile");
					var value = theGuy.height();

				}else {
					var value = theGuy.height();
					theGuy.addClass("hidden_mobile");
					
				}
				
			});
var abc = new RenderIt(1000);
abc.init();
let newNode = document.createElement('table');
newNode.innerHTML += "<table class='psi_levels'><tr><th>Poziom</th><th>Faza</th> <th>Amplituda</th></tr>"
for(let i=0; i < abc.sim.levels; i++){

	let txt = (i + 1);
	if((i + 1)<15){
		txt = ' ' + (i + 1);
	}
	newNode.innerHTML += '<tr><td><label class="control control-checkbox"><input type="checkbox" id="n' + (i + 1) + '" checked="checked" /><div id="nhover' + (i + 1) + '" class="control_indicator"></div></label>' + txt + ' </td><td><input type="range" min="0" max="360" value="0" step="1" id="slider_phase' + (i+1) + '" class="sim_slider_inline sim_slider" /></td><td><input type="range" min="0" max="1.414" value="1.414" step="0.00001" id="slider_amp' + (i+1) + '" class="sim_slider_inline sim_slider" /></td> </tr>';
	
	
}
newNode.innerHTML += "</table>"
document.getElementById("psi_n_levels").appendChild( newNode );
var psiArr = new Array(abc.sim.levels);
var psiPhase = new Array(abc.sim.levels);
var psiAmp = new Array(abc.sim.levels);
for(let i=0; i < abc.sim.levels; i++){
	
	psiArr[i] =  document.getElementById('n' + (i+1));
	psiAmp[i] =  document.getElementById('slider_amp' + (i+1));
	
	psiPhase[i] =  document.getElementById('slider_phase' + (i+1));
	if(i != 0)
		psiArr[i].checked = false;
	else
		psiArr[i].checked = true;
	
	psiArr[i].addEventListener( "change", 
	function(){
		abc.sim.time = 0;
		abc.doRescale = 1;
		if (this.checked) {
			abc.sim.enabled[i] = 1;
			//abc.circleC[i].material.color.setHex( 0xff00ff );

		}else{
			abc.sim.enabled[i] = 0;
			//abc.circleC[i].material.color.setHex( 0x3b383d );
		}
		
	});

	$("#nhover" + (i+1)).on("mouseover",function(){
		
		abc.currentHover = i;
	});

	$("#nhover" + (i+1)).on("mouseout",function(){
	
		abc.currentHover = -1;
	});
	
	psiPhase[i].addEventListener("input", function(e) {
		var target = (e.target) ? e.target : e.srcElement;
		abc.sim.phases[i] = (target.value);
		abc.sim.time = 0;
	});
	
	psiAmp[i].addEventListener("input", function(e) {
		if(psiArr[i].checked == true)
			abc.rescale();
		
		var target = (e.target) ? e.target : e.srcElement;
		abc.sim.amp[i] = (target.value);
		abc.sim.time = 0;
	});
}

var running = document.getElementById("running");
var triangle = document.getElementById("triangle");
var clearer = document.getElementById("clearer");
var rescale = document.getElementById("rescale");
var chRe = document.getElementById("chRe");
var chMod = document.getElementById("chMod");
var energies = document.getElementById("energies");
//var chDe = document.getElementById("chDe");
var chGrid = document.getElementById("chGrid");
var sldierTime = document.getElementById("slider_time");

running.addEventListener( "change", 
	function(){
		if (this.checked) {
			abc.sim.run = 1;
		}else{
			abc.sim.run = 0;
		}
});

triangle.addEventListener( "click", 
	function(){
		
		for(let ii = 0; ii< abc.sim.levels; ii++){
			if(ii % 2 == 0){
				if(ii < 20){
					psiArr[ii].checked = true;
					abc.sim.enabled[ii] = 1;
					
				}

			}else{
				psiArr[ii].checked = false;
				abc.sim.enabled[ii] = 0;
				
			}
		}
		abc.sim.time = 0;
		running.checked = false;
		abc.sim.run = 0;
		setAmp(0, 8 * Math.sqrt(3) / (Math.PI * Math.PI));
		setAmp(2, -8 / ( 3 * Math.sqrt(3) * Math.PI * Math.PI));
		setAmp(4, 8 *  Math.sqrt(3)/ ( 25 * Math.PI * Math.PI));
		setAmp(6, -8 *  Math.sqrt(3)/ ( 49 * Math.PI * Math.PI));
		setAmp(8, 8 / ( 27 * Math.sqrt(3) * Math.PI * Math.PI));
		setAmp(10, -8 * Math.sqrt(3) / (121*Math.PI * Math.PI));
		setAmp(12, 8 * Math.sqrt(3) / ( 169 * Math.PI * Math.PI));
		setAmp(14, -8 / ( 75 *  Math.sqrt(3) * Math.PI * Math.PI));
		setAmp(16, 8 *  Math.sqrt(3)/ ( 289 * Math.PI * Math.PI));
		setAmp(18, -8 * Math.sqrt(3) / ( 361 * Math.PI * Math.PI));
	

});

clearer.addEventListener( "click", 
	function(){
		
		for(let ii = 0; ii< abc.sim.levels; ii++){
			if(ii == 0){
				psiArr[ii].checked = true;
				abc.sim.enabled[ii] = 1;
				//abc.circleC[ii].material.color.setHex( 0xff00ff );
			}else{
				psiArr[ii].checked = false;
				abc.sim.enabled[ii] = 0;
				//abc.circleC[ii].material.color.setHex( 0x3b383d );
			}
		}
		abc.sim.time = 0;
		running.checked = true;
		abc.sim.run = 1;

		for(let ii = 0; ii< abc.sim.levels; ii++){
			setAmp(ii, 1.414);
		}
});

sldierTime.addEventListener("input", function(e) {
		var target = (e.target) ? e.target : e.srcElement;
		abc.sim.timeAdd = (target.value);
		abc.sim.time = 0;
		
	});

rescale.addEventListener( "click", function(){
	abc.rescale();
		
		
});

function setAmp(index, value){
	abc.sim.amp[index] = value;
	psiAmp[index].value = value;
	
}

chMod.addEventListener( "change", 
function(){
	if (this.checked) {
	
		abc.drawing[1] = 1;
		
		abc.gridDraw = [1,0];
	}else{
		abc.drawing[1] = 0;
		abc.gridDraw = [0,1];
	}
});

chGrid.addEventListener( "change", 
function(){
	if (this.checked) {
		abc.gridEnabled = 1;
	}else{
		abc.gridEnabled = 0;
	}
});
energies.checked = true;
energies.addEventListener( "change", 
function(){
	if (this.checked) {
		abc.drawEnergies = 1;
	}else{
		abc.drawEnergies = 0;
	}
});


chRe.addEventListener( "change", 
function(){
	if (this.checked) {
		abc.drawing[0] = 1;
		//chDe.checked = false;
				abc.gridDraw = [0,1];
	}else{
		abc.drawing[0] = 0;
		//chDe.checked = true;
		abc.gridDraw = [1,0];
	}
});

//chDe.checked = true;
running.checked = true;
chRe.checked = true;
chMod.checked = false;
abc.renderer.domElement.addEventListener('mousedown', function(event){
	event.preventDefault();

	abc.mouseDown = 1;
	
}, false);
abc.renderer.domElement.addEventListener('mouseup', function(event){
	event.preventDefault();
	abc.mouseDown = 0;
	abc.alreadyChecked = 0;
}, false);

abc.renderer.domElement.addEventListener('touchend', function(event){

	abc.mouseDown = 0;
	abc.alreadyChecked = 0;
}, false);
abc.renderer.domElement.addEventListener('mousemove', function(event) {
	
		
			const rect = abc.theDiv.getBoundingClientRect();
			if (event.clientX > rect.x && event.clientX < rect.x + rect.width) {

				if (event.clientY > rect.y && event.clientY < rect.y + rect.height) {

					abc.mouseDr.x = abc.mouse.x - abc.mouseOld.x;
					abc.mouseDr.y = abc.mouse.y - abc.mouseOld.y;
					
					abc.mouseOld.x = abc.mouse.x;
					abc.mouseOld.y = abc.mouse.y;

					abc.mouse.x = ((event.clientX - rect.x) / document.getElementById("canvas_holder").clientWidth) * 2 - 1;
					abc.mouse.y = -((event.clientY - rect.y) / abc.height) * 2 + 1;
				   
				}
			}

		}
, false);
		

		
abc.renderer.domElement.addEventListener('touchstart', function(e){
      abc.mouseDown = 1;
		
		const rect = abc.theDiv.getBoundingClientRect();
			if (e.changedTouches[0].pageX > rect.x && e.changedTouches[0].pageX < rect.x + rect.width) {

				if (e.changedTouches[0].pageY > rect.y && e.changedTouches[0].pageY < rect.y + rect.height) {

					abc.mouseDr.x = abc.mouse.x - abc.mouseOld.x;
					abc.mouseDr.y = abc.mouse.y - abc.mouseOld.y;
					
					abc.mouseOld.x = abc.mouse.x;
					abc.mouseOld.y = abc.mouse.y;

					abc.mouse.x = ((e.changedTouches[0].pageX - rect.x) / document.getElementById("canvas_holder").clientWidth) * 2 - 1;
					abc.mouse.y = -((e.changedTouches[0].pageY - rect.y) / abc.height) * 2 + 1;
				     //alert(abc.mouse.y) // alert pageX coordinate of touch point
				}
			}	
		
}, false);

chGrid.checked = true;
this.animate = function() {
			requestAnimationFrame(animate);
			abc.updatePositions();
			abc.line.geometry.attributes.position.needsUpdate = true;
			abc.lineRe.geometry.attributes.position.needsUpdate = true;
			abc.lineIm.geometry.attributes.position.needsUpdate = true;
			abc.lineWell.geometry.attributes.position.needsUpdate = true;
			abc.lineE.geometry.attributes.position.needsUpdate = true;
			for(let i=0;i<abc.sim.levels; i++){
				abc.linesE[i].geometry.attributes.position.needsUpdate = true;
				
			}
			abc.checkIntersections();
			if(abc.drawing[0] == 1){
				abc.lineRe.visible = true;
				
			}else{
				abc.lineRe.visible = false;

			}	
			
			if(abc.drawing[1] == 1){
				abc.line.visible = true;
				abc.lineIm.visible = true;
			}else{
				abc.line.visible = false;
				abc.lineIm.visible = false;
			}	

			if(abc.gridEnabled == 1){
				if(abc.gridDraw[0] == 1){
					
					abc.gridHelper.visible = true;
					abc.gridHelper2.visible = false;
				}else{
					abc.gridHelper.visible = false;
					abc.gridHelper2.visible = true;

				}
				
			}else{
				abc.gridHelper.visible = false;
				abc.gridHelper2.visible = false;
			}
			
			abc.renderer.render(abc.scene, abc.camera);
}

if (WEBGL.isWebGLAvailable()) {
	animate();
			
}else {
	var warning = WEBGL.getWebGLErrorMessage();
	document.getElementById('canvas_holder').appendChild(warning);
}

//Render.init();
//	Render.destroy();
