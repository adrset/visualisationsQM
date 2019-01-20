function pown(x,y){
	let xx = x;
	
	for(let ii=0;ii<y-1;ii++){
		xx = xx * x;
	}
	
	return xx;
	
}

function toRad(alfa){
		return alfa * Math.PI / 180;
}
class TwoSideArrow{
	constructor( position, angle){
		
		let spriteMap = new THREE.TextureLoader().load( 'arrow.png' );

		let spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );

		this.sprite = new THREE.Sprite( spriteMaterial );
		this.sprite.scale.set(30, 30, 1)
		this.sprite.position.set(position.x, position.y, - 19);
		
		if(angle !== undefined){
			this.sprite.material.rotation = toRad(angle);
		}
		
	}
	
	
}

class Simulation {
    constructor(N) {
		this.evenSolutions = new Array(100);
		this.oddSolutions = new Array(100);
		this.evenSolutionsKappa = new Array(100);
		this.oddSolutionsKappa = new Array(100);
		this.evenSolutionsK = new Array(100);
		this.oddSolutionsK = new Array(100);
		this.oddSolutionsNumber = 0;
		this.evenSolutionsNumber = 0;
		this.N = N;
		this.dt = 0.0001;
		this.n = 1;
		this.m = 1;
		this.U = 1;
		this.L = 1;
		this.hbar = 1;
		this.dx = 1;
		this.width = document.getElementById("canvas_holder").clientWidth;
		this.ratio = this.N / this.width;
		this.re = [];
		this.im = [];
		this.levels = screen.width > 961 ? 10 : 10;
		this.reArray = new Array(this.levels);
		this.imArray = new Array(this.levels);
		this.pArray = new Array(this.levels);
		this.re2 = [];
		this.im2 = [];
		this.p = [];
		this.x = [];
		this.V = [];
		this.a = 5;
		this.aChanged = this.a;
		this.current = 0;
		this.tau = 0;
		this.time = 0;
		this.run = 1;
		this.old = "";
		this.potentialStart = 0;
		this.potentialEnd = 0;
		this.potentialHeight = 10;
		this.timeAdd = 0.001;
		this.phases = new Array(this.levels);
		this.amp = new Array(this.levels);
		this.enabled = new Array(this.levels);

		for(let ii = 0; ii < this.levels; ii++){
			this.reArray[ii] = new Array(this.N);
			this.imArray[ii] = new Array(this.N);
			this.enabled[ii] = 0;
			this.amp[ii] = Math.sqrt(2);
			this.phases[ii]  = 0; 
		}
		this.enabled[0] = 1;
    }
	
	calcNP2(){

		// liczba rozwiazan nieparzystych - mniumum 1
		// liczba rozwiazan parzystych - minimum 0
		
		// liczba rozwiazan np - stosunek R do Pi/2 (czyli ile sie miesci tangensow)
		// liczba rozwiazan p - stosunek R + Pi/2 do Pi/2 (czyli ile sie miesci tangensow)

		//patzyste
		let R = this.a*this.a*this.U;
		let solutions = 1+ parseInt((R )/ (Math.PI));
		
		console.log("Computing possible states for odd waves ( " + solutions + " ).");
				
		this.oddSolutionsNumber = solutions;
		
		for(let i=0 ; i < solutions; i++){
			
			// we know that we can expect the value between certain range
			// we will use command and conquer to find the optimal value
			let k = i*Math.PI + Math.PI/4; // srodek 
			for(let step = 0; step<100; step++){
				
				
				let tan = Math.tan(k);
				let val =k*tan;  // ksi^2 + eta^2 = k^2 + k^2tan^2(k) = k^2(1+tan^2(k))
				let val2 = Math.sqrt(R*R - k*k); //ups R^2 - k*k - w kole
				if(val< val2){ // go right
					k+=(Math.PI/4)*pown(0.5,step+1);
				
				}
				else {// go left
					k-=(Math.PI/4)*pown(0.5,step+1);
				}
				
				if(Math.abs(val2-val) < 0.00001){
					//console.log("not reached 100");
					step = 100;
				}
				if(step == 99){
				console.log(Math.abs(val2-val));
			}
			}
			
			let ksi = k;
			let eta = k*Math.tan(k); // eta
			this.oddSolutions[i] = {"ksi": ksi, "eta" : eta}
			this.oddSolutionsKappa[i] = eta / this.a;
			this.oddSolutionsK[i] = ksi / this.a;
			//console.log("ksi: " +ksi +  ", eta:"+ eta);
			
		}

		return solutions;
		
	}
	
	calcP2(){

		let R = this.a*this.a*this.U;
		if(R < Math.PI / 2)
			return 0;
		
		
		
		let solutions = Math.floor((R )/ (Math.PI));
		console.log("Computing possible states for even waves ( " + solutions + " ).");
		this.evenSolutionsNumber = solutions;
		for(let i=0; i < solutions; i++){
			
			// we know that we can expect the value between certain range
			// we will use command and conquer to find the optimal value
			let k = (i*Math.PI) + (Math.PI/2)+ (Math.PI/4);
			for(let step = 0; step<100; step++){
					
				let tan = Math.tan(k);
				let val = -k/tan; //eta
				let val2 = Math.sqrt(R*R - k*k);
				if(val< val2){ // go right
					k+=(Math.PI/4)*pown(0.5,step+1);
				
				}
				else {// go left
					k-=(Math.PI/4)*pown(0.5,step+1);
				}
				
				
				if(Math.abs(val2-val) < 0.00001){
					//console.log("not reached 100");
					step = 100;
				}
				
			}
			
			let ksi = k;
			let eta = -k/Math.tan(k);
			this.evenSolutions[i] = {"ksi": parseFloat(ksi), "eta" : parseFloat(eta)};
			//console.log("ksi: " +ksi +  ", eta:"+ eta);
			this.evenSolutionsKappa[i] = eta / this.a;
			this.evenSolutionsK[i] = ksi / this.a;	
			
		}

		let t1 = performance.now();
	
		return solutions;
	}
	
	toRad(alfa){
		return alfa * Math.PI / 180;
	}
	
    calculateStationary(n, k, wave) {
		//console.log(k );
		//console.log(this.oddSolutions[(n+1)/2 - 1]);
		//console.log(k); -3.20528)/Math.cos(3.83747)*Math.cos(3.83747*k
		let index = n % 2 == 0 ? (n)/2 - 1:(n+1)/2 - 1;
		let A = k % 2 == 0 ? Math.sqrt((this.evenSolutionsKappa[index])/(this.oddSolutionsKappa[index]*this.a + 1)):Math.sqrt((this.oddSolutionsKappa[index])/(this.oddSolutionsKappa[index]*this.a + 1));
		if(wave == 1){
			if(n % 2 == 1){
				
				//console.log(Math.exp(k * this.dx *3.20528));
				//console.log(k + " = " + Math.cos(this.oddSolutionsK[index]*this.a)*Math.exp((k * this.dx + this.a)*this.oddSolutionsKappa[index]));
				return Math.cos(this.oddSolutionsK[index]*this.a)*Math.exp((k * this.dx + this.a)*this.oddSolutionsKappa[index]);
			}else{
				return -Math.sin(this.evenSolutionsK[index]*this.a)*Math.exp((k * this.dx + this.a)*this.evenSolutionsKappa[index]);
			}
		}else if(wave == 2){
			if(n % 2 == 1){
				//console.log(Math.exp(k * this.dx *3.20528));
				//console.log(k + " = " + Math.cos(this.oddSolutionsK[index]*k*this.dx));
				return Math.cos(this.oddSolutionsK[index]*k*this.dx);
			}else{
				return Math.sin(this.evenSolutionsK[index]*k*this.dx);

			}
		}else if(wave == 3){
			if(n % 2 == 1){
				//console.log(k + " = " + Math.cos(this.oddSolutionsK[index]*this.a)*Math.exp((this.a - k * this.dx)*this.oddSolutionsKappa[index]));
				return Math.cos(this.oddSolutionsK[index]*this.a)*Math.exp((this.a - k * this.dx)*this.oddSolutionsKappa[index]);
			}else{
				
				return Math.sin(this.evenSolutionsK[index]*this.a)*Math.exp(( this.a - k * this.dx)*this.evenSolutionsKappa[index]);
			}
		}
	
    }

    update(){
		
		//this.levels = this.calcNP() + this.calcP();
		//console.log(this.calcNP() + this.calcP());
		let toAnnounce = "&Psi; =";
		let sols = this.oddSolutionsNumber + this.evenSolutionsNumber;
		
		this.a = this.aChanged;
		//console.log("Solutions: " + this.oddSolutionsNumber + " + " + this.evenSolutionsNumber );
		for(let jj = 0; jj< sols && jj < this.levels; jj++){
			// let's set the maximum width = 6a
			let maxWidth = 15;
			//console.log(maxWidth);
			let delta = (maxWidth /( this.N+1));
			//console.log(delta);
			let wellStart = maxWidth/2 - this.a;// from - maxWidth / 2 to -this.a
			let wellEnd = maxWidth/2 + this.a;// from - maxWidth / 2 to -this.a
			//console.log(wellStart);
			let wellWidth = maxWidth - 2 * this.a;
			//console.log(wellWidth);
			if(this.enabled[jj] == 1){

				//console.log(wellStart / maxWidth * this.N);
				toAnnounce += "	&Psi;<sub>" + (jj+1) + "</sub> + ";
				for (let ii = 0; ii < parseInt(wellStart / maxWidth * this.N); ii++){
							this.reArray[jj][ii] = this.calculateStationary(jj+1, -maxWidth/2 + ii*delta, 1)*(Math.cos(this.time*(jj+1)*(jj+1) + this.toRad(this.phases[jj])));
							//console.log(ii);
							this.x[ii] = ii;
							this.V[ii] = this.U;
							this.imArray[jj][ii] = this.calculateStationary(jj+1, -maxWidth/2 + ii*delta, 1)*(Math.sin(this.time*(jj+1)*(jj+1) + this.toRad(this.phases[jj])));
				}
				
				this.potentialStart = parseInt(wellStart / maxWidth * this.N);
				//console.log(this.calculateStationary(jj+1, -maxWidth/2 + parseInt(wellStart / maxWidth * this.N)*delta, 1) + " vs " + this.calculateStationary(jj+1, -maxWidth/2 + parseInt(wellStart / maxWidth * this.N)*delta, 2));
				
				for (let ii = parseInt(wellStart / maxWidth * this.N); ii < parseInt(wellEnd / maxWidth * this.N); ii++){
							this.reArray[jj][ii] = this.calculateStationary(jj+1, -maxWidth/2 + ii*delta, 2)*(Math.cos(this.time*(jj+1)*(jj+1) + this.toRad(this.phases[jj])));
							this.x[ii] = ii;
							//console.log(ii);
							//console.log(-maxWidth/2 + ii*delta);
							this.V[ii] = 0;
							this.imArray[jj][ii] = this.calculateStationary(jj+1, -maxWidth/2 + ii*delta, 2)*(Math.sin(this.time*(jj+1)*(jj+1) + this.toRad(this.phases[jj])));
				}
				//console.log(parseInt(wellWidth / maxWidth * this.N));

				this.potentialEnd = parseInt(wellEnd / maxWidth * this.N);
				for (let ii =  parseInt(wellEnd / maxWidth * this.N); ii < this.N+1; ii++){
							this.reArray[jj][ii] = this.calculateStationary(jj+1, -maxWidth/2 + ii*delta, 3)*(Math.cos(this.time*(jj+1)*(jj+1) + this.toRad(this.phases[jj])));
							this.x[ii] = ii;
							this.V[ii] = this.U;
							//console.log(ii);
							//console.log(-maxWidth/2 + ii*delta);
							this.imArray[jj][ii] = this.calculateStationary(jj+1, -maxWidth/2 + ii*delta, 3)*(Math.sin(this.time*(jj+1)*(jj+1) + this.toRad(this.phases[jj])));
				}

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
			for(let jj = 0; jj< this.levels && jj< sols; jj++){
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
        this.calcNP2();
		this.calcP2();
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
		this.mouseDown = 0;
		this.clicked = 0;
		this.raycaster = null;
		this.t = 0;
		this.N = N;
		this.gridEnabled = 1;
		this.gridDraw = [1,0];
		this.width = document.getElementById("canvas_holder").clientWidth;
		this.height = document.getElementById("canvas_holder").clientHeight;
		this.mouseOld = new THREE.Vector2();
		this.positions = new Float32Array(this.N * 3);
		this.positionsRe = new Float32Array(this.N * 3);
		this.positionsIm = new Float32Array(this.N * 3);
		this.positionsWell = new Float32Array(this.N * 3);
		this.renderer = null;
		this.scene = null;
		this.gridHelper = null;
		this.camera = null;
		this.hover = 0;
		this.animate = null;
		this.line = null;
		this.lineRe = null;
		this.lineV = null;
		this.needsUpdate = 0;
		this.move = 0;
		this.lineWell = null;
		this.lineWellU1 = null;
		this.lineWellL = null;
		this.lineWellD = null; 
		this.lineWellR = null;
		this.lineWellU2 = null;
		this.lineWellU1Tab = new Float32Array(2 * 3);
		this.lineWellLTab = new Float32Array(2 * 3);
		this.lineWellDTab = new Float32Array(2 * 3);
		this.lineWellRTab = new Float32Array(2 * 3);
		this.lineWellU2Tab = new Float32Array(2 * 3);
		this.overview = 0;
		
		this.scaleProb = 200000;
		this.scaleWave = 500000;
		this.alreadyChecked == 0;
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
		this.gridSize = 2000;
		for(let i=0;i<this.numberOfDisplayedStates; i++){
			this.circles[i] = new Float32Array(this.N * this.segmentCount);
		}

    }
	
	resizeGrid(){
		if(this.gridDraw[0] == 1){
			this.scene.remove( this.gridHelper );
			this.gridHelper = new THREE.GridHelper( this.gridSize, parseInt(this.scaleProb/ 15000), new THREE.Color(0xd4d4d6), new THREE.Color(0xd4d4d6) );
			this.gridHelper.rotation.x = Math.PI / 2;
			this.gridHelper.position.z = -20;
			this.scene.add( this.gridHelper );
		}else{
			this.scene.remove( this.gridHelper2 );
			this.gridHelper2 = new THREE.GridHelper( this.gridSize, parseInt(this.scaleProb/ 15000), new THREE.Color(0xd4d4d6), new THREE.Color(0xd4d4d6) );
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
		
		if(screen.width > 961){
			this.desktop = 1;
		}
		
		this.sim.setup();
		this.numberOfDisplayedStates = this.sim.levels;
		this.scene = new THREE.Scene();

		this.camera = new THREE.OrthographicCamera(this.width / -2, this.width / 2, this.height / 2, this.height / -2, 0, 1000);

		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

		this.renderer.setSize(this.width, this.height);
		this.theDiv = document.getElementById("canvas_holder");
		

		window.addEventListener('resize', function(){
			this.abc.onWindowResize(this.abc);
			
		}, false);
		
		this.raycaster =  new THREE.Raycaster();
		this.raycaster.linePrecision = 6;

		this.theDiv.appendChild(this.renderer.domElement);
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
		var material3 = new THREE.LineBasicMaterial({ color: 0x0, linewidth: 2 });
		geometry3.addAttribute('position', new THREE.BufferAttribute(this.positionsWell, 3));
		geometry3.setDrawRange(0, this.N);
		this.lineWell = new THREE.Line( geometry3, material3 );
		var geometry4 = new THREE.BufferGeometry();
		var material4 = new THREE.LineBasicMaterial({ color: 0x0f0fff, linewidth: 2 });
		geometry4.addAttribute('position', new THREE.BufferAttribute(this.positionsIm, 3));
		
		// separate potential lines
		
		this.lineWellU1 = null;
		this.lineWellL = null;
		this.lineWellR = null;
		this.lineWellU2 = null;
		var materialWell = new THREE.LineBasicMaterial({ color: 0x0, linewidth: 2 });
		
		
		let geometryU1 = new THREE.BufferGeometry();
		geometryU1.addAttribute('position', new THREE.BufferAttribute(this.lineWellU1Tab, 3));
		this.lineWellU1 = new THREE.Line( geometryU1, materialWell );
		
		let geometryL = new THREE.BufferGeometry();
		geometryL.addAttribute('position', new THREE.BufferAttribute(this.lineWellLTab, 3));
		this.lineWellL = new THREE.Line( geometryL, materialWell );
		
		let geometryD = new THREE.BufferGeometry();
		geometryD.addAttribute('position', new THREE.BufferAttribute(this.lineWellDTab, 3));
		this.lineWellD = new THREE.Line( geometryD, materialWell );
		
		let geometryR = new THREE.BufferGeometry();
		geometryR.addAttribute('position', new THREE.BufferAttribute(this.lineWellRTab, 3));
		this.lineWellR = new THREE.Line( geometryR, materialWell );
		
		let geometryU2 = new THREE.BufferGeometry();
		geometryU2.addAttribute('position', new THREE.BufferAttribute(this.lineWellU2Tab, 3));
		this.lineWellU2 = new THREE.Line( geometryU2, materialWell );
		
		this.scene.add(this.lineWellU1);
		this.scene.add(this.lineWellL);
		this.scene.add(this.lineWellD);
		this.scene.add(this.lineWellR);
		this.scene.add(this.lineWellU2);
		this.addArrows();
		//
		
		geometry4.setDrawRange(0, this.N);
		this.lineIm = new THREE.Line( geometry4, material4 );

		var geometryX= new THREE.BoxGeometry( 1300, 500, 1 );
		var materialX = new THREE.MeshBasicMaterial( {color: 0xD3D3D3} );
		var cube = new THREE.Mesh( geometryX, materialX );
		cube.position.set(0, 0, -10);
		//this.scene.add( cube );
		
		let size = 1000;
		let divisions = 6;

		this.gridHelper = new THREE.GridHelper( this.gridSize, 12, new THREE.Color(0xd4d4d6), new THREE.Color(0xd4d4d6) );
		this.gridHelper.rotation.x = Math.PI / 2;
		this.gridHelper.position.z = -20;
		this.gridHelper2 = new THREE.GridHelper( this.gridSize, 12, new THREE.Color(0xd4d4d6), new THREE.Color(0xd4d4d6) );
		this.gridHelper2.rotation.x = Math.PI / 2;
		this.gridHelper2.position.z = -20;
		this.scene.add( this.gridHelper2 );
		this.scene.add( this.gridHelper );

		
		//this.addEnergyCircles();

		this.scene.add(this.line);
		this.scene.add(this.lineRe);
		this.scene.add(this.lineIm);
		//this.scene.add(this.lineWell);

		this.rescale();
		this.updateSliders();
	}
	
	removeEnergyCircles(){
		for(let i = 0; i < this.numberOfDisplayedStates; i++){
			this.scene.remove(this.circleC[i]);
			this.scene.remove(this.circleCL[i]);
		}
		
	}
	
	updateSliders(){
		let levels = abc.sim.currentMaxLevel < 10 ? abc.sim.currentMaxLevel : 10;
		let newNode = document.createElement('table');
		document.getElementById("psi_n_levels").innerHTML = "";
		newNode.innerHTML += "<table style='psi_levels'><tr><th>Poziom</th><th>Faza</th> <th>Amplituda</th></tr>"
		let sols = this.sim.oddSolutionsNumber + this.sim.evenSolutionsNumber < 15 ? this.sim.oddSolutionsNumber + this.sim.evenSolutionsNumber : 15;
		for(let i=0; i < sols; i++){

			let txt = (i + 1);
			if((i + 1)<10){
				txt = ' ' + (i + 1);
			}
			newNode.innerHTML += '<tr><td><input id="n' + (i + 1) + '" type="checkbox" name="density" value="density" checked />' + txt + ' </td><td><input type="range" min="0" max="360" value="0" step="1" id="slider_phase' + (i+1) + '" class="sim_slider_inline sim_slider" /></td><td><input type="range" min="0" max="1.414" value="1.414" step="0.00001" id="slider_amp' + (i+1) + '" class="sim_slider_inline sim_slider" /></td> </tr>';
	
		}
		newNode.innerHTML += "</table>"
		document.getElementById("psi_n_levels").appendChild( newNode );
		var psiArr = new Array(sols);
		var psiPhase = new Array(sols);
		var psiAmp = new Array(sols);
		for(let i=0; i < sols; i++){
			
			psiArr[i] =  document.getElementById('n' + (i+1));
			psiAmp[i] =  document.getElementById('slider_amp' + (i+1));
			
			psiPhase[i] =  document.getElementById('slider_phase' + (i+1));
			if(i != 0)
				psiArr[i].checked = false;
			else
				psiArr[i].checked = true;
			
			psiArr[i].addEventListener( "change", 
			function(ii){
				abc.sim.time = 0;
				abc.rescale();
				if (this.checked) {
					abc.sim.enabled[i] = 1;
					

				}else{
					abc.sim.enabled[i] = 0;
					
				}
				
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
		
	}
	
	checkIntersections(){
	
		
		this.raycaster.setFromCamera(this.mouse, this.camera);
		var intersects = this.raycaster.intersectObjects([this.lineWellU1, this.lineWellU2], true);
		if (intersects.length > 0 || this.clicked == 1) {
			//V = 2000/this.scaleProb*(this.mouse.y + -this.height/2 - this.move)
			//console.log(2000/this.scaleProb*(this.mouse.y +this.height/2 - this.move));
			if(this.mouseDown){
				this.clicked = 1;
				//let val = (((this.mouse.y + 1)/2 - this.move / this.height) / (intersects[0].point.y + this.height / 2)/this.sim.U / (this.height - this.move));
				//console.log(val);
			
				
				//if(this.drawing[0] == 1)
				//this.mouse.y + 1)/2 * this.height =  -this.height/2 + this.scaleProb*this.U/2000;
				this.needsUpdate = 1;
				
			// 
				this.sim.U = ((this.mouse.y + 1)/2 * this.height )*200/this.scaleProb;
			}else{
				this.clicked = 0;
				
				
			}
			
			//this.sim.U = (intersects[0].point.y + this.height / 2 - this.move) * 2000/ this.scaleProb;
			//console.log( ((this.mouse.y + 1) / 2 - this.move / this.height ) * (this.height  - this.move));
			$('html,body').css('cursor', 'pointer');
		}else{
			$('html,body').css('cursor', 'default');
		}
				
		this.raycaster.setFromCamera(this.mouse, this.camera);
		intersects = this.raycaster.intersectObjects([this.lineWellL, this.lineWellR], true);
		if (intersects.length > 0 || this.clicked == 2) {
			if(this.mouseDown){
				this.clicked = 2;
				let maxWidth = 15;
				//console.log(maxWidth);
				let delta = (maxWidth /( this.sim.N+1));
				//console.log(delta);
				let wellStart = maxWidth/2 - this.sim.a;// from - maxWidth / 2 to -this.a
				let wellEnd = maxWidth/2 + this.sim.a;// from - maxWidth / 2 to -this.a
				//console.log(wellStart);
				let wellWidth = maxWidth - 2 * this.sim.a;
				//console.log((this.mouse.x + 1)/2 * this.width);
				//console.log((this.sim.potentialStart + (this.sim.potentialEnd - this.sim.potentialStart) / 2) *  this.ratio);
				let a  = (this.mouse.x + 1)/2 * this.width - ((this.sim.potentialStart + (this.sim.potentialEnd - this.sim.potentialStart) / 2) /  this.ratio) ;
				this.sim.aChanged =  a/80 > 1 ? a/80 : 1;
				//console.log(a / this.sim.a);
				this.needsUpdate = 1;
				this.lineWellReset();
				this.updateSliders();
				this.sim.calcNP2();
				this.sim.calcP2();
				//this.sim.potentialStart = a;
			}else{
				this.clicked = 0;

			}
			//console.log( ((this.mouse.y + 1) / 2 - this.move / this.height ) * (this.height  - this.move));
			$('html,body').css('cursor', 'pointer');
		} 
		
		if( this.clicked == 0 && this.needsUpdate == 1){
			this.lineWellReset();
			this.updateSliders();
			this.sim.calcNP2();
			this.sim.calcP2();
			this.needsUpdate = 0;
		}
		
		
		
	}
	
	lineWellReset(){
		
		this.lineWellU1.geometry.boundingSphere = null;
		this.lineWellU1.geometry.boundingBox = null;
		this.lineWellU2.geometry.boundingSphere = null;
		this.lineWellU2.geometry.boundingBox = null;
		
		this.lineWellL.geometry.boundingSphere = null;
		this.lineWellL.geometry.boundingBox = null;
		this.lineWellR.geometry.boundingSphere = null;
		this.lineWellR.geometry.boundingBox = null;
		
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
		//this.repairCircles();
	}
	/*  As the number of available states vary thorought different dimensions of the quantum well,
	we need to check how many circles we actually want to draw! :)                               */
	repairCircles(){
		let val =  this.sim.oddSolutionsNumber + this.sim.evenSolutionsNumber;
		for(let i = 0; i < val && i < this.sim.levels; i++){
			console.log(i);
			this.circleC[i].visible = true;
			
		}
		
		for(let i =this.sim.oddSolutionsNumber + this.sim.evenSolutionsNumber; i < this.sim.levels; i++){
			this.circleC[i].visible = false;
			
		}
		
	}
	
	
	updatePositions(){
				
		this.sim.update();

		for(let i=0;i<3 *( this.N+1); i+=3){
			this.positions[ i ] = (-this.width/2+i/(this.ratio*3))
			//console.log(this.scaleWave*this.sim.re[i/3]);
			this.positions[ i+1 ] = this.scaleWave*this.sim.re[i/3];
			this.positions[ i+2 ] = 0;

			this.positionsRe[ i ] = (-this.width/2+i/(this.ratio*3))
			this.positionsRe[ i+1 ] = -this.height/2 + this.move+ this.scaleProb*this.sim.p[i/3];
			this.positionsRe[ i+2 ] = 0;
			
			this.positionsIm[ i ] = (-this.width/2+i/(this.ratio*3))
			this.positionsIm[ i+1 ] =  (this.scaleWave*this.sim.im[i/3]);
			this.positionsIm[ i+2 ] = 0;
			
			this.positionsWell[ i ] = (-this.width/2+i/(this.ratio*3))
			if(this.drawing[0] == 1)
				this.positionsWell[ i+1 ] =  -this.height/2 + this.move+ this.scaleProb*this.sim.V[i/3]/200;
			else
				this.positionsWell[ i+1 ] =  -this.height/2 + this.move+ this.scaleWave*this.sim.V[i/3]/200;
			
			this.positionsWell[ i+2 ] = 0;


		}
		this.updateInteractiveLines();
		
				
	}
	
	addArrows(){
		
		console.log((this.lineWellU1Tab[0] + this.lineWellU1Tab[3])/2);
		
		this.arrow1 = new TwoSideArrow(new THREE.Vector2((this.lineWellU1Tab[0] + this.lineWellU1Tab[3])/2, 100));
		this.scene.add( this.arrow1.sprite );
		
		this.arrow2 = new TwoSideArrow(new THREE.Vector2((this.lineWellU1Tab[0] + this.lineWellU1Tab[3])/2, 100), 90);
		this.scene.add( this.arrow2.sprite );


		//this.arrow2 = new TwoSideArrow(new THREE.Vector2(10, 100));
		//this.scene.add( this.arrow2.sprite );	

		//this.arrow3 = new TwoSideArrow(new THREE.Vector2(100, 10));
		//this.scene.add( this.arrow3.sprite );			
	}
	
	updateArrows(){
		this.arrow1.sprite.position.x = (this.lineWellU2Tab[0] + this.lineWellU2Tab[3])/2;
		this.arrow1.sprite.position.y = -this.height/2 + this.move+ this.scaleProb*this.sim.U/200;
		
		
		this.arrow2.sprite.position.x = this.lineWellRTab[3];
		this.arrow2.sprite.position.y = (-this.height/2 + this.move + -this.height/2 + this.move+ this.scaleProb*this.sim.U/200 )/2;
	}
	
	updateInteractiveLines(){
		let ratio = 2 / this.width;
		this.lineWellU1Tab[0] = -this.width/2;
		this.lineWellU1Tab[1] = -this.height/2 + this.move+ this.scaleProb*this.sim.U/200;
		this.lineWellU1Tab[2] = 0;
		
		this.lineWellU1Tab[3] = -this.width/2 + this.sim.potentialStart/this.ratio;
		this.lineWellU1Tab[4] = -this.height/2 + this.move+ this.scaleProb*this.sim.U/200;
		this.lineWellU1Tab[5] = 0;
		
		this.lineWellLTab[0] = -this.width/2 + this.sim.potentialStart/this.ratio;
		this.lineWellLTab[1] = -this.height/2 + this.move+ this.scaleProb*this.sim.U/200;
		this.lineWellLTab[2] = 0;
		
		this.lineWellLTab[3] = -this.width/2 + this.sim.potentialStart/this.ratio;
		this.lineWellLTab[4] =  -this.height/2 + this.move;
		this.lineWellLTab[5] = 0;
		
		this.lineWellDTab[0] = -this.width/2 + this.sim.potentialStart/this.ratio;
		this.lineWellDTab[1] = -this.height/2 + this.move;
		this.lineWellDTab[2] = 0;
		
		this.lineWellDTab[3] =  -this.width/2 + this.sim.potentialEnd/this.ratio;
		this.lineWellDTab[4] =  -this.height/2 + this.move;
		this.lineWellDTab[5] = 0;
		
		this.lineWellRTab[0] = -this.width/2 + this.sim.potentialEnd/this.ratio;
		this.lineWellRTab[1] = -this.height/2 + this.move;
		this.lineWellRTab[2] = 0;
		//console.log(this.sim.potentialEnd);
		this.lineWellRTab[3] = -this.width/2 + this.sim.potentialEnd/this.ratio;
		this.lineWellRTab[4] = -this.height/2 + this.move+ this.scaleProb*this.sim.U/200 ;
		this.lineWellRTab[5] = 0;
		
		this.lineWellU2Tab[0] = -this.width/2 + this.sim.potentialEnd/this.ratio;
		this.lineWellU2Tab[1] = -this.height/2 + this.move+ this.scaleProb*this.sim.U/200;
		this.lineWellU2Tab[2] = 0;
		
		this.lineWellU2Tab[3] = this.width/2;
		this.lineWellU2Tab[4] = -this.height/2 + this.move+ this.scaleProb*this.sim.U/200;
		this.lineWellU2Tab[5] = 0;
		this.updateArrows();
	}
	
	rescale(){
		let maxP = Math.abs(Math.max.apply(Math,this.sim.p));
		let maxR = Math.abs(Math.max.apply(Math,this.sim.re));
		let maxI = Math.abs(Math.max.apply(Math,this.sim.im));
		
		let minP = Math.abs(Math.min.apply(Math,this.sim.p));
		let minR = Math.abs(Math.min.apply(Math,this.sim.re));
		let minI = Math.abs(Math.min.apply(Math,this.sim.im));
		console.log(" min1: " + minR + " min2: " + minI + " max1: " + maxR + " max2: " + maxI);
		let mP = maxP;
		let mR = maxR > minR ? maxR : minR;
		let mI = maxI > minI ? maxI : minI;
		console.log(" maxR: " + mR + " maxI: " + mI);
		let maxHeight = this.height-this.move;
		let waveMax = mR > mI ? mR : mI;
		console.log(" maxWave: " + waveMax);
		let scaleProb =  (0.5 * maxHeight / mP);
		this.scaleWave = (0.4*maxHeight/waveMax);
		this.scaleProb = scaleProb;
		
			
		
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

var running = document.getElementById("running");
var triangle = document.getElementById("triangle");
var clearer = document.getElementById("clearer");
var rescale = document.getElementById("rescale");
var chRe = document.getElementById("chRe");
//var chDe = document.getElementById("chDe");
var chGrid = document.getElementById("chGrid");
var sldierTime = document.getElementById("slider_time");
var sliderA = document.getElementById("slider_a");
var sliderU = document.getElementById("slider_U");

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
					abc.circleC[ii].material.color.setHex( 0xff00ff );
				}

			}else{
				psiArr[ii].checked = false;
				abc.sim.enabled[ii] = 0;
				abc.circleC[ii].material.color.setHex( 0x3b383d );
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
		setAmp(18, -8 * Math.sqrt(3) / ( 361  * Math.PI * Math.PI));
});

clearer.addEventListener( "click", 
	function(){
		
		for(let ii = 0; ii< abc.sim.levels; ii++){
			if(ii == 0){
				psiArr[ii].checked = true;
				abc.sim.enabled[ii] = 1;
				abc.circleC[ii].material.color.setHex( 0xff00ff );
			}else{
				psiArr[ii].checked = false;
				abc.sim.enabled[ii] = 0;
				abc.circleC[ii].material.color.setHex( 0x3b383d );
			}
		}
		abc.sim.time = 0;
		running.checked = true;
		abc.sim.run = 1;

		for(let ii = 0; ii< abc.sim.levels; ii++){
			setAmp(ii, 1.414);
		}
});
running.checked = true;
sldierTime.addEventListener("input", function(e) {
	var target = (e.target) ? e.target : e.srcElement;
	abc.sim.timeAdd = (target.value);
	
	
});

sliderA.addEventListener("input", function(e) {
	var target = (e.target) ? e.target : e.srcElement;
	abc.sim.a = parseFloat(target.value);
	abc.sim.calcNP2();
	abc.sim.calcP2();
	abc.repairCircles();
	//abc.rescale();
	//abc.resizeGrid();
	abc.sim.time = 0;
	
});

sliderU.addEventListener("input", function(e) {
	var target = (e.target) ? e.target : e.srcElement;
	abc.sim.U = parseFloat(target.value);
	abc.sim.calcNP2();
	abc.sim.calcP2();
	abc.repairCircles();
	//abc.rescale();
	//abc.resizeGrid();
	abc.sim.time = 0;
	
});

rescale.addEventListener( "click", function(){
	abc.rescale();
		
		
});

function setAmp(index, value){
	abc.sim.amp[index] = value;
	psiAmp[index].value = value;
	
}
/*
chDe.addEventListener( "change", 
function(){
	if (this.checked) {
		abc.drawing[0] = 1;
		abc.drawing[1] = 0;
		chRe.checked = false;
		abc.gridDraw = [1,0];
	}else{
		abc.drawing[0] = 0;
		abc.drawing[1] = 1;
		chRe.checked = true;
		abc.gridDraw = [0,1];
	}
});*/

chGrid.addEventListener( "change", 
function(){
	if (this.checked) {
		abc.gridEnabled = 1;
	}else{
		abc.gridEnabled = 0;
	}
});

chRe.addEventListener( "change", 
function(){
	if (this.checked) {
		abc.drawing[1] = 1;
		abc.drawing[0] = 0;
		//chDe.checked = false;
		abc.gridDraw = [0,1];
	}else{
		abc.drawing[1] = 0;
		abc.drawing[0] = 1;
		//chDe.checked = true;
		abc.gridDraw = [1,0];
	}
});
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
abc.renderer.domElement.addEventListener('touchend', function(event){

	abc.mouseDown = 0;
	abc.alreadyChecked = 0;
}, false);
//chDe.checked = true;
chRe.checked = false;
abc.renderer.domElement.addEventListener('mousedown', function(event){
	event.preventDefault();
	abc.mouseDown = 1;
}, false);
abc.renderer.domElement.addEventListener('mouseup', function(event){
	event.preventDefault();
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

chGrid.checked = true;
this.animate = function() {
			requestAnimationFrame(animate);
			abc.updatePositions();
			abc.line.geometry.attributes.position.needsUpdate = true;
			abc.lineRe.geometry.attributes.position.needsUpdate = true;
			abc.lineIm.geometry.attributes.position.needsUpdate = true;
			abc.lineWell.geometry.attributes.position.needsUpdate = true;
			
			
			abc.lineWellU1.geometry.attributes.position.needsUpdate = true;
			abc.lineWellL.geometry.attributes.position.needsUpdate = true;
			abc.lineWellD.geometry.attributes.position.needsUpdate = true;
			abc.lineWellR.geometry.attributes.position.needsUpdate = true;
			abc.lineWellU2.geometry.attributes.position.needsUpdate = true;
			
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


 jQuery( window ).on( "swipeleft", function( event ) 
  {
    alert("Hi");
  } );

//Render.init();
//	Render.destroy();