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
		
		let spriteMap = new THREE.TextureLoader().load( 'images/arrow.png' );

		let spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );

		this.sprite = new THREE.Sprite( spriteMaterial );
		this.sprite.scale.set(30, 30, 1)
		this.sprite.position.set(position.x, position.y, - 19);
		
		if(angle !== undefined){
			this.sprite.material.rotation = toRad(angle);
		}
		
	}
	
	
}
var psiArr = null;
var psiPhase = null;
var psiAmp = null;
class Simulation {
  constructor(N) {
		this.oddSolutionsNumber = 0;
		this.evenSolutionsNumber = 0;
		this.N = N;
		this.dt = 0.0001;
		this.n = 1;
		this.m = 1;
		this.energies = new Array(100);
		this.U = 0.005;
		this.L = 1;
		this.hbar = 1;
		this.dx = 1;
		this.width = document.getElementById("canvas_holder").clientWidth;
		this.ratio = this.N / this.width;
		this.re = [];
		this.im = [];
		this.levels = screen.width > 961 ? 50 : 50;
		this.reArray = new Array(this.levels);
		this.imArray = new Array(this.levels);
		this.pArray = new Array(this.levels);
		this.re2 = [];
		this.im2 = [];
		this.p = [];
		this.x = [];
		this.V = [];
		this.a = 100;
		this.del_x = 1e-9;
		this.current = 0;
		this.currentMaxLevel = 0;
		this.tau = 0;
		this.time = 0;
		this.run = 1;
		this.hbar = 1.054e-34;
		this.m0 = 9.11e-31;
		this.ecoul = 1.6e-19;
		this.old = "";
		this.eigM = null;
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
			this.pArray[ii] = new Array(this.N);
			this.enabled[ii] = 0;
			this.amp[ii] = Math.sqrt(2);
			this.phases[ii]  = 0; 
		}
		this.enabled[0] = 1;
    }
	
	updatePotential(){
		let eV2J = 1.6e-19;
		let aa = this.a ;
		//aa = aa > minA ? aa : minA;
		for(let ii =0; ii<this.N;ii++){
			this.V[ii] = this.U  *eV2J;
		}
		
		for(let ii = parseInt(3*this.N / 10) - parseInt(aa / 2); ii < parseInt(3*this.N / 10) + parseInt(aa / 2); ii++){
			this.V[ii] = 0;
		}
		
		
		for(let ii = parseInt(7*this.N / 10) - parseInt(aa / 2); ii < parseInt(7*this.N / 10) + parseInt(aa / 2); ii++){
			this.V[ii] = 0;
		}
	}
	
	getSolutions(){
		let del_x = 1e-9;
		
		// Convert to nm for plotting
		let DX = del_x *1e9;
		let XX = new Array(this.N);

		for(let ii =0; ii<this.N;ii++){
			XX[ii] = (ii+1)*DX;
		}

		let mid = DX *this.N/2;
		
		let eV2J = 1.6e-19;
		let J2eV = 1./eV2J;
		let hbar_eV = this.hbar *J2eV;
		// Energies are J
		let chi0 = this.hbar*this.hbar/(2*this.m0*del_x*del_x);

		let maxA = 3.0 / 2.0 * this.N / 5.0;
		let minA = this.N / 10.0;
		
		this.updatePotential();
		
		// fill the V array in a/2 distance from two well centers
		
		
		

		/*for(let ii =0; ii<parseInt(this.N/5);ii++){
			this.V[ii] = this.U  *eV2J;
		}

		for(let ii =parseInt(this.N/5); ii<parseInt(2*this.N/5);ii++){
			this.V[ii] = 0;
		}

		for(let ii =parseInt(2*this.N/5); ii<parseInt(3*this.N/5);ii++){
			this.V[ii] =this.U *eV2J;
		}
		
		for(let ii =parseInt(3*this.N/5); ii<parseInt(4*this.N/5);ii++){
			this.V[ii] = 0;
		}
		
		for(let ii =parseInt(4*this.N/5); ii<parseInt(5*this.N/5);ii++){
			this.V[ii] = this.U  *eV2J;
		}*/
		
		
		let H = [];
		for(let ii =0; ii<this.N;ii++){
			H[ii] = new Array(this.N).fill(0);
		}

		H[0][0] = 2 *chi0+this.V[0];
		H[0][1] = -1*chi0;
		
		for(let ii =1; ii<this.N-1;ii++){
			H[ii][ii-1]= -1*chi0;
			H[ii][ii] = 2*chi0+ this.V[ii];
			H[ii][ii+1] = -1*chi0;
		}
		
		H[this.N-1][this.N-2] = -1*chi0;
		H[this.N-1][this.N-1] = 2*chi0+this.V[this.N-1];
		//H[0][this.N-1] = -1*chi0;
		//H[this.N-1][0] = -1*chi0
		var AA = new Matrix(H); 
		//console.log(H);
		var Eig2 = AA.eig();
		var DD = Eig2.getD();
		var VV = Eig2.getV();
		console.log("V: " + this.U  *eV2J);
		
		let l = Eig2.d;
		for(let ii =0; ii<this.N;ii++){

			l[ii] = (J2eV*l[ii]);
						console.log(l[ii]*eV2J);
			if(l[ii]*eV2J < this.U  *eV2J){
				this.currentMaxLevel = ii;
				this.energies[ii] = l[ii]*eV2J;
			}
		}
		console.log(this.energies[this.currentMaxLevel]);
		console.log(l[this.currentMaxLevel+1]*eV2J);
		//console.log(Eig2.V);

		let toAnnounce = '';
		for(let ii =0; ii<this.N;ii++){
			for(let jj =0; jj<this.N;jj++){
				toAnnounce += Eig2.V[ii][jj].toFixed(4) + ' ';
				Eig2.V[ii][jj] = Eig2.V[ii][jj].toFixed(4);
			}
			toAnnounce += '[xx]';
		//toAnnounce += '\n';
		}
		this.eigM = Eig2;
		document.getElementById("availableEnergies").innerHTML = "Liczba dostępnych stanów: " + (this.currentMaxLevel);
		/*console.log(toAnnounce);
		toAnnounce = '';
		for(let ii =0; ii<this.N;ii++)
			toAnnounce += this.V[ii] + '\n';
			console.log(toAnnounce);
		*/
	}
	
	printMatrix(){
		console.log(this.eigM);
	}
	
	
	
	
    update(){
		
		for(let i=0;i<this.levels; i++){
				if(i <  this.currentMaxLevel){
					for(let j=0;j<this.N;j++){

						this.reArray[i][j] = this.amp[i]*this.eigM.V[j][i]*Math.cos(this.time * this.eigM.d[i]/ this.hbar + toRad(this.phases[i]));
						this.imArray[i][j] = this.amp[i]*this.eigM.V[j][i]*Math.sin(this.time * this.eigM.d[i]/ this.hbar + toRad(this.phases[i]));
						this.pArray[i][j] = this.amp[i]*this.amp[i]*(this.reArray[i][j]*this.reArray[i][j] + this.imArray[i][j]*this.imArray[i][j]);
						
						
					}
				}else{
					for(let j=0;j<this.N;j++){
						this.reArray[i][j] = 0;
						this.imArray[i][j] = 0;
						this.pArray[i][j] = 0;
					}
				}
				
			
			
		}
		
		let norm = 0;
		for (let ii = 0; ii < this.N ; ii++){
			this.im[ii] = 0;
			this.re[ii] = 0;
			for(let jj = 0; jj< this.levels && this.currentMaxLevel; jj++){
				if(this.enabled[jj] == 1){

					this.im[ii] += this.imArray[jj][ii];
					this.re[ii] += this.reArray[jj][ii];
				}
			}
			
		}
		
		for (let ii = 0; ii < this.N ; ii++){
			this.p[ii] = (this.im[ii]) * (this.im[ii]) + (this.re[ii]) * (this.re[ii]);
			norm += this.p[ii];
		}
		
		
		for (let ii = 0; ii < this.N ; ii++){
			this.p[ii] /= (norm);
			
		}
		norm = 0;
		for (let ii = 0; ii < this.N ; ii++){
			norm += this.p[ii];
			
		}
		
		
		if (this.run == 1)
			this.time += 1e-30*this.timeAdd;
			
    }
	
    setup() {

		
		this.getSolutions();
		this.update();
	

	
    }
	
}

class RenderIt{
	constructor(N) {
		this.needsRescale = 0;
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
		this.positionsDe = new Float32Array(this.N * 3);
		this.renderer = null;
		this.scene = null;
		this.gridHelper = null;
		this.camera = null;
		this.hover = 0;
		this.animate = null;
		this.line = null;
		this.lineRe = null;
		this.lineIm = null;
		this.offset = 10;
		this.lineDe = null;
		this.move = 0;
		this.needsUpdate = 0;
		this.n = 0;
		this.currentHover = -1;
		this.currentHover2 = -1;
		this.lineE = null;
		this.lineTabE =  new Float32Array(2 * 3);
		this.lineWell = null;
		this.lineWellU1 = null;
		this.lineWellL1 = null;
		this.lineWellD1 = null; 
		this.lineWellR1 = null;
		this.lineWellL2 = null;
		this.lineWellD2 = null; 
		this.lineWellR2 = null;
		this.lineWellU2 = null;
		this.lineWellU3 = null;
		this.lineWellU1Tab = new Float32Array(2 * 3);
		this.lineWellL1Tab = new Float32Array(2 * 3);
		this.lineWellD1Tab = new Float32Array(2 * 3);
		this.lineWellR1Tab = new Float32Array(2 * 3);
		this.lineWellL2Tab = new Float32Array(2 * 3);
		this.lineWellD2Tab = new Float32Array(2 * 3);
		this.lineWellR2Tab = new Float32Array(2 * 3);
		this.lineWellU2Tab = new Float32Array(2 * 3);
		this.lineWellU3Tab = new Float32Array(2 * 3);
		this.overview = 0;
		
		this.drawEnergies = 1;
		this.scaleProb = 200000;
		this.scaleWave = 500000;
		this.alreadyChecked = 0;
		this.sim = new Simulation(this.N);
		this.ratio = this.N / this.width;
		this.drawing = [1,0,0];
		this.numberOfDisplayedStates = 0;//87;
		this.mouseDr = new THREE.Vector2();
		this.mouse = new THREE.Vector2();
		this.theDiv = null;
		this.desktop = 0;
		this.gridSize = 2000;
		this.linesETabs = new Array(this.sim.levels);
		this.linesE = new Array(this.sim.levels);
		for(let i=0;i<this.numberOfDisplayedStates; i++){
			this.circles[i] = new Float32Array(this.N * this.segmentCount);
		}
		
	

    }
	
	
	lineWellReset(){
		
		this.lineWellU1.geometry.boundingSphere = null;
		this.lineWellU1.geometry.boundingBox = null;
		this.lineWellU2.geometry.boundingSphere = null;
		this.lineWellU2.geometry.boundingBox = null;
		this.lineWellU3.geometry.boundingSphere = null;
		this.lineWellU3.geometry.boundingBox = null;
		this.lineWellD1.geometry.boundingSphere = null;
		this.lineWellD1.geometry.boundingBox = null;
		this.lineWellL1.geometry.boundingSphere = null;
		this.lineWellL1.geometry.boundingBox = null;
		this.lineWellR1.geometry.boundingSphere = null;
		this.lineWellR1.geometry.boundingBox = null;
		this.lineWellL2.geometry.boundingSphere = null;
		this.lineWellL2.geometry.boundingBox = null;
		this.lineWellR2.geometry.boundingSphere = null;
		this.lineWellR2.geometry.boundingBox = null;
		for(let i=0;i<abc.sim.levels; i++){

			this.linesE[i].geometry.boundingSphere = null;
			this.linesE[i].geometry.boundingBox = null;
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
	
	rescale(){
		let maxP = Math.abs(Math.max.apply(Math,this.sim.p));
		let maxR = Math.abs(Math.max.apply(Math,this.sim.re));
		let maxI = Math.abs(Math.max.apply(Math,this.sim.im));
		
		let minP = Math.abs(Math.min.apply(Math,this.sim.p));
		let minR = Math.abs(Math.min.apply(Math,this.sim.re));
		let minI = Math.abs(Math.min.apply(Math,this.sim.im));
		//console.log(" min1: " + minR + " min2: " + minI + " max1: " + maxR + " max2: " + maxI);
		let mP = maxP;
		let mR = maxR > minR ? maxR : minR;
		let mI = maxI > minI ? maxI : minI;
		//console.log(" maxR: " + mR + " maxI: " + mI);
		let maxHeight = this.height-this.move;
		let waveMax = mR > mI ? mR : mI;
		//console.log(" maxWave: " + waveMax);
		let scaleProb =  (0.5 * maxHeight / mP);
		this.scaleWave = (0.4*maxHeight/waveMax);
		this.scaleProb = scaleProb;
		
			
		
		this.resizeGrid();
		
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
		let geometry = new THREE.BufferGeometry();

		geometry.addAttribute('position', new THREE.BufferAttribute(this.positions, 3));
		geometry.setDrawRange(0, this.N);
		let material = new THREE.LineBasicMaterial({ color: 0x0, linewidth: 2 });

		this.line = new THREE.Line( geometry, material );
		
		let geometryRe = new THREE.BufferGeometry();

		geometryRe.addAttribute('position', new THREE.BufferAttribute(this.positionsRe, 3));
		geometryRe.setDrawRange(0, this.N);
		let materialRe = new THREE.LineBasicMaterial({ color: 0x0ff, linewidth: 2 });

		this.lineRe = new THREE.Line( geometryRe, materialRe );
		
		let geometryIm = new THREE.BufferGeometry();

		geometryIm.addAttribute('position', new THREE.BufferAttribute(this.positionsIm, 3));
		geometryIm.setDrawRange(0, this.N);
		let materialIm = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });

		this.lineIm = new THREE.Line( geometryIm, materialIm );
		
		let geometryDe = new THREE.BufferGeometry();

		geometryDe.addAttribute('position', new THREE.BufferAttribute(this.positionsDe, 3));
		geometryDe.setDrawRange(0, this.N);
		let materialDe = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });

		this.lineDe = new THREE.Line( geometryDe, materialDe );

		for(let i=0;i<this.sim.levels; i++){
			let materialE = new THREE.LineBasicMaterial({ color: 0xff0f, linewidth: 2 });
			this.linesETabs[i] = new Float32Array(6);
			let geometriesE = new THREE.BufferGeometry();
			geometriesE.addAttribute('position', new THREE.BufferAttribute(this.linesETabs[i], 3));
			this.linesE[i] = new THREE.Line( geometriesE, materialE );
			this.scene.add(this.linesE[i]);
		}


		this.gridHelper = new THREE.GridHelper( this.gridSize, 12, new THREE.Color(0xd4d4d6), new THREE.Color(0xd4d4d6) );
		this.gridHelper.rotation.x = Math.PI / 2;
		this.gridHelper.position.z = -20;
		this.gridHelper2 = new THREE.GridHelper( this.gridSize, 12, new THREE.Color(0xd4d4d6), new THREE.Color(0xd4d4d6) );
		this.gridHelper2.rotation.x = Math.PI / 2;
		this.gridHelper2.position.z = -20;
		this.scene.add( this.gridHelper2 );
		this.scene.add( this.gridHelper );

		// Old potential line
		//this.scene.add(this.line);
		this.scene.add(this.lineRe);
		this.scene.add(this.lineIm);
		this.scene.add(this.lineDe);
		
		this.rescale();
		this.addWellLines();
		this.addArrows();	
		this.updateSliders();

	}
	
	addWellLines(){
		
		let materialWell = new THREE.LineBasicMaterial({ color: 0x0, linewidth: 2 });
		let materialE = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 2 });
		
		// 3 top lines
		
		let geometryU1 = new THREE.BufferGeometry();
		geometryU1.addAttribute('position', new THREE.BufferAttribute(this.lineWellU1Tab, 3));
		this.lineWellU1 = new THREE.Line( geometryU1, materialWell );
		
		let geometryU2 = new THREE.BufferGeometry();
		geometryU2.addAttribute('position', new THREE.BufferAttribute(this.lineWellU2Tab, 3));
		this.lineWellU2 = new THREE.Line( geometryU2, materialWell );
		
		let geometryU3 = new THREE.BufferGeometry();
		geometryU3.addAttribute('position', new THREE.BufferAttribute(this.lineWellU3Tab, 3));
		this.lineWellU3 = new THREE.Line( geometryU3, materialWell );
		
		// 2 bottom lines
		let geometryD1 = new THREE.BufferGeometry();
		geometryD1.addAttribute('position', new THREE.BufferAttribute(this.lineWellD1Tab, 3));
		this.lineWellD1 = new THREE.Line( geometryD1, materialWell );
		
		let geometryD2 = new THREE.BufferGeometry();
		geometryD2.addAttribute('position', new THREE.BufferAttribute(this.lineWellD2Tab, 3));
		this.lineWellD2 = new THREE.Line( geometryD2, materialWell );
		
		// 2 left lines
		let geometryL1 = new THREE.BufferGeometry();
		geometryL1.addAttribute('position', new THREE.BufferAttribute(this.lineWellL1Tab, 3));
		this.lineWellL1 = new THREE.Line( geometryL1, materialWell );
		
		let geometryL2 = new THREE.BufferGeometry();
		geometryL2.addAttribute('position', new THREE.BufferAttribute(this.lineWellL2Tab, 3));
		this.lineWellL2 = new THREE.Line( geometryL2, materialWell );
		
		// 2 right lines
		let geometryR1 = new THREE.BufferGeometry();
		geometryR1.addAttribute('position', new THREE.BufferAttribute(this.lineWellR1Tab, 3));
		this.lineWellR1 = new THREE.Line( geometryR1, materialWell );
		
		let geometryR2 = new THREE.BufferGeometry();
		geometryR2.addAttribute('position', new THREE.BufferAttribute(this.lineWellR2Tab, 3));
		this.lineWellR2 = new THREE.Line( geometryR2, materialWell );
		
		let geometryE = new THREE.BufferGeometry();
		geometryE.addAttribute('position', new THREE.BufferAttribute(this.lineTabE, 3));
		this.lineE = new THREE.Line( geometryE, materialE );		
		this.scene.add(this.lineE);
		this.scene.add(this.lineWellR2);
		this.scene.add(this.lineWellR1);	
		this.scene.add(this.lineWellL2);
		this.scene.add(this.lineWellL1);
		this.scene.add(this.lineWellU3);
		this.scene.add(this.lineWellU2);
		this.scene.add(this.lineWellU1);
		this.scene.add(this.lineWellD2);
		this.scene.add(this.lineWellD1);			
	}
	
	intersectWithWell(){
		$('html,body').css('cursor', 'default')
		this.raycaster.setFromCamera(this.mouse, this.camera);
				
		let intersects = this.raycaster.intersectObjects([this.lineWellU1, this.lineWellU2, this.lineWellU3], true);
		let mouse = new THREE.Vector2();
		
		mouse.x = (this.mouse.x +1) / 2;
		mouse.y = (this.mouse.y +1) / 2;
		//this.sim.U +=  ;
		//console.log(mouse.y * this.height);
		if (intersects.length > 0 || this.clicked == 1 ) {
			$('html,body').css('cursor', 'pointer');
			
			if(this.mouseDown ){
				 // height = 3e23 * this.U  *eV2J
				//console.log(3e23 * this.sim.U  *this.sim.ecoul);
				//console.log(mouse.y * this.height);
				//console.log(this.clicked);
				let value = mouse.y * (this.height-2*this.offset) / (3e23*this.sim.ecoul);
				this.sim.U = value > -10 ? value : 0;
				this.sim.updatePotential();
				this.clicked = 1;
				this.needsUpdate = 1;
			}else {
				
				this.clicked = 0;
			}
		}
		
		
		intersects = this.raycaster.intersectObjects([this.lineWellR1, this.lineWellL1], true);
	
		if (intersects.length > 0 || this.clicked == 2) {
			$('html,body').css('cursor', 'pointer');
			let mouse = new THREE.Vector2();
			mouse.x = (this.mouse.x +1) / 2;
			mouse.y = (this.mouse.y +1) / 2;
			//console.log(Math.abs(mouse.x*this.width  * (this.ratio) - parseInt(3*this.sim.N / 10)));
			if(this.mouseDown ){
				let val = Math.abs(mouse.x*this.width  * (this.ratio) - parseInt(3*this.sim.N / 10)) * 2;
				this.sim.a = val > 5 ? val : 5;
				this.sim.a = this.sim.a < 100 ? this.sim.a : 100;
				this.needsUpdate = 1;
				this.clicked = 2;
			}else {
				this.clicked = 0;
				
			}

		}
		
		intersects = this.raycaster.intersectObjects([this.lineWellR2, this.lineWellL2], true);
	
		if (intersects.length > 0 || this.clicked == 3) {
			$('html,body').css('cursor', 'pointer');
			let mouse = new THREE.Vector2();
			mouse.x = (this.mouse.x +1) / 2;
			mouse.y = (this.mouse.y +1) / 2;
			if(this.mouseDown ){
				let val = Math.abs(mouse.x*this.width  * (this.ratio) - parseInt(7*this.sim.N / 10)) * 2;
				this.sim.a = val > 5 ? val : 5;
				this.sim.a = this.sim.a < 100 ? this.sim.a : 100;
				this.needsUpdate = 1;
				this.clicked = 3;
			}else {
				this.clicked = 0;
				
			}
		}
		
		
		intersects = this.raycaster.intersectObjects(this.linesE, true);
		if (intersects.length > 0) {
			let index = this.linesE.indexOf(intersects[ 0 ].object);
			$('html,body').css('cursor', 'pointer');
			this.currentHover2 = index;
			if(this.mouseDown == 1 && this.alreadyChecked == 0){
				this.alreadyChecked = 1;
				
				
				this.linesE[index].material.color = new THREE.Color( 0xf4c542 );         
				this.linesE[index].material.needsUpdate = true;
				this.sim.enabled[index] = this.sim.enabled[index] == 1 ? 0 : 1;
				psiArr[index].checked = this.sim.enabled[index] == 1 ? 1 : 0;
			}
		} else {
			this.currentHover2 = -1;
		}
	
		if(this.clicked == 0 && this.needsUpdate == 1){
			this.sim.getSolutions();
			this.needsUpdate = 0;
			this.rescale();
			this.updateElements();
		}
			
	}
	updateSliders(){
		let levels = abc.sim.currentMaxLevel < 50 ? abc.sim.currentMaxLevel : 50;
		let newNode = document.createElement('table');
		document.getElementById("psi_n_levels").innerHTML = "";
		newNode.innerHTML += "<table style='psi_levels'><tr><th>Poziom</th><th>Faza</th> <th>Amplituda</th></tr>"
		
		for(let i=0; i < levels; i++){

			let txt = (i + 1);
			if((i + 1)<50){
				txt = ' ' + (i + 1);
			}//
			newNode.innerHTML += '<tr><td><label class="control control-checkbox"><input id="n' + (i + 1) + '" type="checkbox" checked="checked" /><div id="nhover' + (i + 1) + '" class="control_indicator"></div></label>. </td><td><input type="range" min="0" max="360" value="0" step="1" id="slider_phase' + (i+1) + '" class="sim_slider_inline sim_slider" /></td><td><input type="range" min="0" max="1.414" value="1.414" step="0.00001" id="slider_amp' + (i+1) + '" class="sim_slider_inline sim_slider" /></td> </tr>';
	
		}
		newNode.innerHTML += "</table>"
		document.getElementById("psi_n_levels").appendChild( newNode );
		psiArr = new Array(levels);
		psiPhase = new Array(levels);
		psiAmp = new Array(levels);
		for(let i=0; i < levels; i++){
			
			psiArr[i] =  document.getElementById('n' + (i+1));
			psiAmp[i] =  document.getElementById('slider_amp' + (i+1));
			
			psiPhase[i] =  document.getElementById('slider_phase' + (i+1));
			if(this.sim.enabled[i] == 1)
				psiArr[i].checked = true;
			else
				psiArr[i].checked = false;
			
			psiArr[i].addEventListener( "change", 
			function(ii){
				abc.sim.time = 0;
				abc.rescale();
				if (this.checked) {
					abc.sim.enabled[i] = 1;
					abc.needsRescale = 1;

				}else{
					abc.sim.enabled[i] = 0;
					abc.needsRescale = 1;
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
		
	}
	
	addArrows(){
		
		//console.log((this.lineWellU1Tab[0] + this.lineWellU1Tab[3])/2);
		
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
		this.arrow1.sprite.position.x = (this.lineWellU3Tab[0] + this.lineWellU3Tab[3])/2;
		this.arrow1.sprite.position.y = -this.height/2 + this.offset+ 3e23*this.sim.V[0];
		
		
		this.arrow2.sprite.position.x = this.lineWellR2Tab[3];
		this.arrow2.sprite.position.y = (-this.height + this.offset+ 3e23*this.sim.V[0] )/2;
	}
	
	updateWellLines(){
		this.lineWellU1Tab[0] = -this.width/2; // 
		this.lineWellU1Tab[1] = -this.height/2 + this.offset + 3e23*this.sim.V[0];
		this.lineWellU1Tab[2] = 0;
		let i = (parseInt(3*this.N / 10) - parseInt(this.sim.a / 2));
		
		
		this.lineWellU1Tab[3] =(-this.width/2+i/(this.ratio));
		//console.log(parseInt(3*this.N / 10) - parseInt(this.sim.a / 2));
		this.lineWellU1Tab[4] = -this.height/2 + this.offset+ 3e23*this.sim.V[0];
		this.lineWellU1Tab[5] = 0;
		
		this.lineWellL1Tab[0] = (-this.width/2+i/(this.ratio));
		this.lineWellL1Tab[1] = -this.height/2 + this.offset+ 3e23*this.sim.V[0];
		this.lineWellL1Tab[2] = 0;
		
		this.lineWellL1Tab[3] =(-this.width/2+i/(this.ratio));
		//console.log(parseInt(3*this.N / 10) - parseInt(this.sim.a / 2));
		this.lineWellL1Tab[4] = -this.height/2+ this.offset;
		this.lineWellL1Tab[5] = 0;
		
		this.lineWellD1Tab[0] = (-this.width/2+i/(this.ratio));
		this.lineWellD1Tab[1] = -this.height/2+ this.offset;
		this.lineWellD1Tab[2] = 0;
		
		i = (parseInt(3*this.N / 10) + parseInt(this.sim.a / 2));
		this.lineWellD1Tab[3] =(-this.width/2+i/(this.ratio));
		//console.log(parseInt(3*this.N / 10) - parseInt(this.sim.a / 2));
		this.lineWellD1Tab[4] = -this.height/2+ this.offset;
		this.lineWellD1Tab[5] = 0;
		
		
		this.lineWellR1Tab[0] = (-this.width/2+i/(this.ratio));
		this.lineWellR1Tab[1] = -this.height/2+ this.offset;
		this.lineWellR1Tab[2] = 0;
		
		this.lineWellR1Tab[3] =(-this.width/2+i/(this.ratio));
		//console.log(parseInt(3*this.N / 10) - parseInt(this.sim.a / 2));
		this.lineWellR1Tab[4] = -this.height/2+3e23*this.sim.V[0]+ this.offset;
		this.lineWellR1Tab[5] = 0;
		
		
		
		
		i = (parseInt(3*this.N / 10) + parseInt(this.sim.a / 2));
		this.lineWellU2Tab[0] = (-this.width/2+i/(this.ratio));
		this.lineWellU2Tab[1] = -this.height/2+ 3e23*this.sim.V[0]+ this.offset;
		this.lineWellU2Tab[2] = 0;
		
		i = (parseInt(7*this.N / 10) - parseInt(this.sim.a / 2));
		this.lineWellU2Tab[3] =(-this.width/2+i/(this.ratio));
		//console.log(parseInt(3*this.N / 10) - parseInt(this.sim.a / 2));
		this.lineWellU2Tab[4] = -this.height/2+3e23*this.sim.V[0]+ this.offset;
		this.lineWellU2Tab[5] = 0;
		
		
		this.lineWellL2Tab[0] = (-this.width/2+i/(this.ratio));
		this.lineWellL2Tab[1] = -this.height/2+ this.offset;
		this.lineWellL2Tab[2] = 0;
		
		this.lineWellL2Tab[3] =(-this.width/2+i/(this.ratio));
		//console.log(parseInt(3*this.N / 10) - parseInt(this.sim.a / 2));
		this.lineWellL2Tab[4] = -this.height/2 + 3e23*this.sim.V[0]+ this.offset;
		this.lineWellL2Tab[5] = 0;
		
		
		i = (parseInt(7*this.N / 10) - parseInt(this.sim.a / 2));
		this.lineWellD2Tab[0] = (-this.width/2+i/(this.ratio));
		this.lineWellD2Tab[1] = -this.height/2+ this.offset;
		this.lineWellD2Tab[2] = 0;
		
		i = (parseInt(7*this.N / 10) + parseInt(this.sim.a / 2));
		this.lineWellD2Tab[3] =(-this.width/2+i/(this.ratio));
		//console.log(parseInt(3*this.N / 10) - parseInt(this.sim.a / 2));
		this.lineWellD2Tab[4] = -this.height/2+ this.offset;
		this.lineWellD2Tab[5] = 0;
		
		this.lineWellR2Tab[0] = (-this.width/2+i/(this.ratio));
		this.lineWellR2Tab[1] = -this.height/2 + this.offset;
		this.lineWellR2Tab[2] = 0;
		
		this.lineWellR2Tab[3] =(-this.width/2+i/(this.ratio));
		//console.log(parseInt(3*this.N / 10) - parseInt(this.sim.a / 2));
		this.lineWellR2Tab[4] = -this.height/2 + 3e23*this.sim.V[0] + this.offset;
		this.lineWellR2Tab[5] = 0;
		
		
		i = (parseInt(7*this.N / 10) + parseInt(this.sim.a / 2));
		this.lineWellU3Tab[0] = (-this.width/2+i/(this.ratio));
		this.lineWellU3Tab[1] = -this.height/2 + 3e23*this.sim.V[0]+ this.offset;
		this.lineWellU3Tab[2] = 0;
		
		i = parseInt(10*this.N / 10);
		this.lineWellU3Tab[3] =(-this.width/2+i/(this.ratio));
		//console.log(parseInt(3*this.N / 10) - parseInt(this.sim.a / 2));
		this.lineWellU3Tab[4] = -this.height/2 + 3e23*this.sim.V[0]+ this.offset;
		this.lineWellU3Tab[5] = 0;
		
				
		
		
		
		this.updateArrows();
	}
	
	
	updateElements(){
			this.lineWellReset();
			this.sim.getSolutions();
			this.updateSliders();
		
	}

	
	updatePositions(){
		//console.log(this.sim.V);
		this.sim.update();
		if(this.needsRescale){
			this.needsRescale = 0;
			this.rescale();
		}
		
		if(this.currentHover < 0 && this.currentHover2 < 0){
	//for(let j =0; j< this.sim.currentMaxLevel){
			for(let i=0;i<3 *( this.N); i+=3){
				this.positions[ i ] = (-this.width/2+i/(this.ratio*3))
				//console.log(this.scaleWave*this.sim.re[i/3]);
				this.positions[ i+1 ] = 3e23*this.sim.V[i/3]+ this.offset;
				this.positions[ i+2 ] = 0;
				
				this.positionsRe[ i ] = (-this.width/2+i/(this.ratio*3))
				//console.log(this.scaleWave*this.sim.re[i/3]);
				this.positionsRe[ i+1 ] = this.scaleWave*this.sim.re[i/3];
				this.positionsRe[ i+2 ] = 0;
				

				this.positionsIm[ i ] = (-this.width/2+i/(this.ratio*3))
				//console.log(this.scaleWave*this.sim.re[i/3]);
				this.positionsIm[ i+1 ] = this.scaleWave*this.sim.im[i/3]+ this.offset;
				this.positionsIm[ i+2 ] = 0;
				
				this.positionsDe[ i ] = (-this.width/2+i/(this.ratio*3))
				//console.log(this.scaleWave*this.sim.re[i/3]);
				this.positionsDe[ i+1 ] = -this.height/2 + this.offset + 1e3*1e3* 0.006*this.sim.p[i/3];
				this.positionsDe[ i+2 ] = 0;

				
			}
			
			for(let i=0;i<this.sim.levels; i++){
				if(this.sim.enabled[i]){
					this.linesE[i].material.color = new THREE.Color( 0xff844b );    
				}else{
					this.linesE[i].material.color = new THREE.Color( 0xaf0f );    
				
				}
				this.linesE[i].material.needsUpdate = true;
				let ene =  3e23*this.sim.energies[i];
				if(this.drawEnergies == 0 || i > this.sim.currentMaxLevel){
					ene = -100000;
				}
				this.linesETabs[i][0] = -this.width/2;
				this.linesETabs[i][1] =this.offset-this.height/2 + ene;
				this.linesETabs[i][2] = 0;
				
				this.linesETabs[i][3] = +this.width/2;
				this.linesETabs[i][4] =this.offset-this.height/2 + ene;
				this.linesETabs[i][5] = 0;
			
			}
	}else{
		
		let hover  = this.currentHover > -1 ? this.currentHover : this.currentHover2;
		let vec = this.rescaleTmp(hover);

			for(let i=0;i<3 *( this.N+1); i+=3){
				this.positionsRe[ i ] = (-this.width/2+i/(this.ratio*3))
				//console.log(this.scaleWave*this.sim.re[i/3]);
				this.positionsRe[ i+1 ] = vec.y*this.sim.reArray[hover][i/3];
				this.positionsRe[ i+2 ] = 0;

				this.positionsDe[ i ] = (-this.width/2+i/(this.ratio*3))
				this.positionsDe[ i+1 ] =  this.offset -this.height/2 + this.move+ vec.x*this.sim.pArray[hover][i/3];
				this.positionsDe[ i+2 ] = 0;
			
				this.positionsIm[ i ] = (-this.width/2+i/(this.ratio*3))
				this.positionsIm[ i+1 ] =  (vec.y*this.sim.imArray[hover][i/3]);
				this.positionsIm[ i+2 ] = 0;
				
		
			}
			this.linesE[hover].material.color = new THREE.Color( 0xf4c542 );         
			this.linesE[hover].material.needsUpdate = true;
			this.linesETabs[hover][1] =this.offset-this.height/2 +  3e23*this.sim.energies[hover];
			this.linesETabs[hover][4] =this.offset-this.height/2 +  3e23*this.sim.energies[hover];

			
		}
		this.updateWellLines();
			
			
			
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
//	}
	
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
var abc = new RenderIt(300);
abc.init();

var running = document.getElementById("running");
running.checked = true;
var clearer = document.getElementById("clearer");
var rescale = document.getElementById("rescale");
var chRe = document.getElementById("chRe");
var chMod = document.getElementById("chMod");
var energies = document.getElementById("energies");
var chGrid = document.getElementById("chGrid");
var sldierTime = document.getElementById("slider_time");
var sliderA = document.getElementById("slider_a");
var sliderU = document.getElementById("slider_U");

chMod.checked = false;
chRe.checked = true;
running.addEventListener( "change", 

	function(){
		if (this.checked) {
			abc.sim.run = 1;
		}else{
			abc.sim.run = 0;
		}
});

clearer.addEventListener( "click", 
	function(){
		
		for(let ii = 0; ii< abc.sim.levels; ii++){
			if(ii == 0){
				psiArr[ii].checked = true;
				abc.sim.enabled[ii] = 1;
				
			}else{
				psiArr[ii].checked = false;
				abc.sim.enabled[ii] = 0;
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

sliderA.addEventListener("change", function(e) {
	var target = (e.target) ? e.target : e.srcElement;
	abc.sim.a = parseFloat(target.value);
	abc.updateElements();
	//abc.rescale();
	//abc.resizeGrid();
	abc.sim.time = 0;
	
});

sliderU.addEventListener("change", function(e) {
	var target = (e.target) ? e.target : e.srcElement;
	abc.sim.U = parseFloat(target.value);
	abc.updateElements();
	abc.sim.time = 0;
	
});

rescale.addEventListener( "click", function(){
	abc.rescale();
		
		
});

function setAmp(index, value){
	abc.sim.amp[index] = value;
	psiAmp[index].value = value;
	
}

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

abc.renderer.domElement.addEventListener('touchstart', function(e){
	e.preventDefault()
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
abc.renderer.domElement.addEventListener('mousedown', function(event){
	event.preventDefault();
	abc.mouseDown = 1;

}, false);
abc.renderer.domElement.addEventListener('mouseup', function(event){
	event.preventDefault();
	abc.mouseDown = 0;
	abc.alreadyChecked = 0;
	//abc.clicked = 0;
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
		
			
			
			abc.intersectWithWell();
			if(abc.drawing[0] == 1){
				abc.lineDe.visible = true;
				
			}else{
				abc.lineDe.visible = false;

			}	
			
			if(abc.drawing[1] == 1){
				abc.lineRe.visible = true;
				abc.lineIm.visible = true;
			}else{
				abc.lineRe.visible = false;
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
				//abc.line.geometry.attributes.position.needsUpdate = true;
			abc.lineRe.geometry.attributes.position.needsUpdate = true;
			abc.lineIm.geometry.attributes.position.needsUpdate = true;
			abc.lineDe.geometry.attributes.position.needsUpdate = true;
			abc.lineWellD1.geometry.attributes.position.needsUpdate = true;
			abc.lineWellD2.geometry.attributes.position.needsUpdate = true;
			abc.lineWellL1.geometry.attributes.position.needsUpdate = true;
			abc.lineWellL2.geometry.attributes.position.needsUpdate = true;
			abc.lineWellR1.geometry.attributes.position.needsUpdate = true;
			abc.lineWellR2.geometry.attributes.position.needsUpdate = true;
			abc.lineWellU1.geometry.attributes.position.needsUpdate = true;
			abc.lineWellU2.geometry.attributes.position.needsUpdate = true;
			abc.lineWellU3.geometry.attributes.position.needsUpdate = true;
			for(let i=0;i<abc.sim.levels; i++){
				abc.linesE[i].geometry.attributes.position.needsUpdate = true;
				abc.linesE[i].material.needsUpdate = true;
				
			}
			abc.lineWellU1.geometry.attributes.position.needsUpdate = true;
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