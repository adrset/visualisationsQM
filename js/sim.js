
		
		class TwoSideArrow{
			constructor( position, angle){
				
				let spriteMap = new THREE.TextureLoader().load( 'arrow.png' );

				let spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );

				this.sprite = new THREE.Sprite( spriteMaterial );
				this.sprite.scale.set(25, 20, 1)
				this.sprite.position.set(position.x, position.y, - 19);
				
				if(angle !== undefined){
					this.sprite.material.rotation = toRad(angle);
				}
				
			}
			
			
		}	
			var newNode = document.createElement('div');
			newNode.innerHTML = "Just a test";
			newNode.style.position = 'absolute';
			document.getElementById("canvas").appendChild(newNode);
			var KEn = 0;
			var clicked = 0;
			var sliderSigma = document.getElementById("slider_sigma");
			var sliderDt = document.getElementById("slider_dt");
			var sliderUpf = document.getElementById("slider_upf");
			var sliderNc = document.getElementById("slider_nc");
			var sliderx2 = document.getElementById("slider_x2");
			var slidery = document.getElementById("slider_y");
			var sliderx1 = document.getElementById("slider_x1");
			var slider = document.getElementById("slider");
			var chIm = document.getElementById("chIm");
			var chRe = document.getElementById("chRe");
			var chDe = document.getElementById("chDe");
			var running = document.getElementById("running");
			var stopper = 0;

			var iter = 0;
		    var rysuje = 0;
		    var K = 0.157;
		    var width = document.getElementById("canvas_holder").clientWidth;
		    var currentPreset = 0;
		    var mouseDr = {};

		    var mouseDown = 0;
		    let N = 2000;
		    let h = 1.054e-34;
		    let mass = 9.1e-31;
		    let deltax = .1e-9;
			var upf = 10;
		    var updatesPerFrame = 30;
		    var mouse = new THREE.Vector2();
		    var mouseOld = new THREE.Vector2();
	        var ratio = N / width;  
		    let dx = deltax * 1e9;
		    let sigma = 50;
		    let nc = 400;
		    var pTotal = 0;
		    let PI = 3.14159;
			var rysujeText = ["DENSITY","IMAGINARIS", "REALIS"];
			
			var drawing = [1,0,0,0];
		    var wasClicked = 0;
			chIm.checked = false;
			chRe.checked = false;
			var needsUpdate = 0;
		    var PML_width = 50;
		    let height = document.getElementById("canvas_holder").clientHeight;
		    var x1 = 790/ratio;
		    var x2 = 900/ratio;
		    var multiplier = 10000;
			var ev =  1.6e-19;
			var oneoverev = 1/ ev;
		    var y = 0.05;
		    var time = 0;
		    let dt = 2e-17;
		    var ra = 0.1;
		    var positionsV = new Float32Array(N * 3); // 3 vertices per point
		    var positionsD = new Float32Array(N * 3); // 3 vertices per point
			var positionsR = new Float32Array(N * 3); // 3 vertices per point
			var positionsI = new Float32Array(N * 3); // 3 vertices per point
		    var V = [];
		    var imag = [];
		    var real = [];
		    var sum = [];
		    var pos = [];
		    var vColor = 0x00000;
			var lambda = 50;
		    setup();


		    var arrow1 = new TwoSideArrow(new THREE.Vector2());
			var arrow2 = new TwoSideArrow(new THREE.Vector2(), 90);
			var arrow3 = new TwoSideArrow(new THREE.Vector2(), 90);
		    window.addEventListener('resize', onWindowResize, false);
		    var scene = new THREE.Scene();

		    var camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, -1, 1000);

		    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		    renderer.setSize(width, height);
		    var theDiv = document.getElementById("canvas_holder");
	        renderer.domElement.addEventListener("mousedown", onMouseDown, true);
	        renderer.domElement.addEventListener("mouseup", onMouseUp, true);


		    $("#mode").removeClass("hidden");
			document.querySelector(".sim_mode").innerHTML = "Opcje"; 
			
			var clicker = $("#mode");
			clicker.click(function(){
				var theGuy = $("#sim_mode_expand");
				
				
				if( theGuy.hasClass("hidden_mobile")){
					theGuy.removeClass("hidden_mobile");
					var value = theGuy.height();
					$("#time_elapsed").css("top", "+=" + value);
				}else {
					var value = theGuy.height();
					theGuy.addClass("hidden_mobile");
					$("#time_elapsed").css("top", "-=" + value);
				}
				
			});
			
			$("#restart").removeClass("hidden"); 
			
			$("#restart").click(function(){
				
				setup();

			});
			
				

			renderer.domElement.style.position = 'absolute';
			renderer.domElement.style.top = 0 + 'px';
		    theDiv.appendChild(renderer.domElement);
		  
		    raycaster = new THREE.Raycaster();
		    raycaster.linePrecision = 5;
			chDeSq.checked = false;
		    renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
			var once = 1;
			
			
		    var geometryD = new THREE.BufferGeometry();
		    var geometryV = new THREE.BufferGeometry();
			var geometryR = new THREE.BufferGeometry();
		    var geometryI = new THREE.BufferGeometry();
			
		    geometryV.addAttribute('position', new THREE.BufferAttribute(positionsV, 3));
		    geometryD.addAttribute('position', new THREE.BufferAttribute(positionsD, 3));
		    geometryR.addAttribute('position', new THREE.BufferAttribute(positionsR, 3));
		    geometryI.addAttribute('position', new THREE.BufferAttribute(positionsI, 3));

		    // draw range
		    var drawCount = N; // draw the first 2 points, only
		    geometryD.setDrawRange(0, drawCount);
		    geometryV.setDrawRange(0, drawCount);
		    geometryR.setDrawRange(0, drawCount);
		    geometryI.setDrawRange(0, drawCount);
			
		    // material
		    var materialD = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
		    var materialV = new THREE.LineBasicMaterial({ color: 0xff0505, linewidth: 2 });
			var materialR = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });
		    var materialI = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 2 });
		    var materialE = new THREE.LineBasicMaterial({ color: 0x0f208f, linewidth: 2 });
  
		    // line
		    var lineV = new THREE.Line(geometryV, materialV);
		    var lineD = new THREE.Line(geometryD, materialD);
			var lineR = new THREE.Line(geometryR, materialR);
		    var lineI = new THREE.Line(geometryI, materialI);
			let geometryU1 = new THREE.BufferGeometry();
			var lineWellU1Tab = new Float32Array(2 * 3);
			var lineWellLTab = new Float32Array(2 * 3);
			var lineWellRTab = new Float32Array(2 * 3);
			var lineWellD1Tab = new Float32Array(2 * 3);
			var lineWellD2Tab = new Float32Array(2 * 3);
			var lineETab = new Float32Array(2 * 3);
			geometryU1.addAttribute('position', new THREE.BufferAttribute(lineWellU1Tab, 3));
			var lineWellU1 = new THREE.Line( geometryU1, materialV );
			
			let geometryL = new THREE.BufferGeometry();
			geometryL.addAttribute('position', new THREE.BufferAttribute(lineWellLTab, 3));
			var lineWellL = new THREE.Line( geometryL, materialV );
			
			let geometryRr = new THREE.BufferGeometry();
			geometryRr.addAttribute('position', new THREE.BufferAttribute(lineWellRTab, 3));
			var lineWellR = new THREE.Line( geometryRr, materialV );
			
			let geometryD1 = new THREE.BufferGeometry();
			geometryD1.addAttribute('position', new THREE.BufferAttribute(lineWellD1Tab, 3));
			var lineWellD1 = new THREE.Line( geometryD1, materialV );

			let geometryD2 = new THREE.BufferGeometry();
			geometryD2.addAttribute('position', new THREE.BufferAttribute(lineWellD2Tab, 3));
			var lineWellD2 = new THREE.Line( geometryD2, materialV );	

			let geometryE = new THREE.BufferGeometry();
			geometryE.addAttribute('position', new THREE.BufferAttribute(lineETab, 3));
			var lineE = new THREE.Line( geometryE, materialE );					
		
		  //  scene.add(lineV);
		    scene.add(lineD);
			scene.add(lineR);
		    scene.add(lineI);		
		    scene.add(lineE);		
		    scene.add(lineWellL);		
		    scene.add(lineWellR);		
		    scene.add(lineWellU1);		
		    scene.add(lineWellD1);		
		    scene.add(lineWellD2);		
		    scene.add(arrow1.sprite);		
		    scene.add(arrow2.sprite);		
		    scene.add(arrow3.sprite);		
		    var whichClicked = 0;

		    addListeners();

		    var animate = function() {

		        var t0 = performance.now();
		        //console.log(stopper);
		       
				if (stopper != 1) {
					for (var i = 0; i < updatesPerFrame - 1; i++) {
						time += dt;
						leapFrog();
						
					}
				
				}
				
				
				document.getElementById("time_elapsed").innerHTML= 'Czas: ' + parseInt(time*1e15) + 'fs'; 
			
				requestAnimationFrame(animate);

				updatePositions();
				
				
				//! ! 
				
				if(drawing[0] == 1 || drawing[3] == 1){
					lineD.visible = true;
				}else{
					lineD.visible = false;
				}	
				
				if(drawing[1] == 1){
					lineR.visible = true;
				}else{
					lineR.visible = false;
				}	
				
				if(drawing[2] == 1){
					lineI.visible = true;
				}else{
					lineI.visible = false;
				}

				lineV.geometry.attributes.position.needsUpdate = true;
				lineD.geometry.attributes.position.needsUpdate = true;
				lineR.geometry.attributes.position.needsUpdate = true;
				lineI.geometry.attributes.position.needsUpdate = true;

				lineWellL.geometry.attributes.position.needsUpdate = true;
				lineWellR.geometry.attributes.position.needsUpdate = true;
				lineWellU1.geometry.attributes.position.needsUpdate = true;
				lineWellD1.geometry.attributes.position.needsUpdate = true;
				lineWellD2.geometry.attributes.position.needsUpdate = true;
				lineE.geometry.attributes.position.needsUpdate = true;
				renderer.render(scene, camera);
				render();
				var t1 = performance.now();
				//console.log(1/((t1-t0)));
				
			

		    };

		    if (WEBGL.isWebGLAvailable()) {
			setTimeout(animate(), 1000);



		        
		    } else {
		        var warning = WEBGL.getWebGLErrorMessage();
		        document.getElementById('canvas').appendChild(warning);
		    }

		    function render() {

		        raycaster.setFromCamera(mouse, camera);
				
		       // var intersects = raycaster.intersectObjects([lineV], true);
		        var intersects = raycaster.intersectObjects([lineWellU1], true);
				 if ((intersects.length > 0 || clicked == 1) && clicked < 2) {
					 
					 $('html,body').css('cursor', 'pointer');
					 
					 if(mouseDown == 1){
	
						  clicked = 1;
						 y = (mouse.y * height * 4 / (multiplier) )/2 ;
						 setup();
						 needsUpdate = 1;
						
					 }else {
						 
						 clicked = 0;
					 }
				 }


				intersects = raycaster.intersectObjects([lineWellL], true);
				 if ((intersects.length > 0 || clicked == 2) && clicked < 3) {
					 
					 $('html,body').css('cursor', 'pointer');
					 
					 if(mouseDown == 1){
	
						 clicked = 2;
						 let xx1 =  ((mouse.x + 1 ) / 2* width);
						 if(xx1 < x2)
							x1 = xx1 ;
						 setup();
						 needsUpdate = 1;
						 
					 }else {
						 
						 clicked = 0;
					 }
				 }
				 
				 intersects = raycaster.intersectObjects([lineWellR], true);
				 if ((intersects.length > 0 || clicked == 3)  && clicked < 4) {
					 
					 $('html,body').css('cursor', 'pointer');
					 
					 if(mouseDown == 1){
	
						 clicked = 3;
						 let xx2 =  ((mouse.x + 1 ) / 2* width);
						 
						 if(xx2 > x1)
							x2 = xx2;
						 setup();
						 needsUpdate = 1;
						
					 }else {
						 
						 clicked = 0;
					 }
				 }
				 
				 intersects = raycaster.intersectObjects([lineD], true);
				if (((intersects.length > 0 || clicked == 4)) && clicked != 1 && clicked != 2 && clicked != 3) {
					$('html,body').css('cursor', 'pointer');
					if(mouseDown == 1 ){
						needsUpdate = 1;
						nc = (mouse.x + 1)/2 * width * ratio;
						clicked = 4;
						setup();
					}else{
						clicked = 0;
						
					}
				}
				
				 intersects = raycaster.intersectObjects([lineE], true);
				if (((intersects.length > 0 || clicked == 4)) && clicked != 1 && clicked != 2 && clicked != 3 && clicked != 4) {
					$('html,body').css('cursor', 'pointer');
					if(mouseDown == 1 ){
						needsUpdate = 1;
						clicked = 5;
						 console.log((mouse.y * height )) ;
						setup();
					}else{
						clicked = 0;
						
					}
				}
				 
				 if(needsUpdate == 1 & clicked == 0){
						lineWellU1.geometry.boundingSphere = null;
						lineWellU1.geometry.boundingBox = null;
						lineWellL.geometry.boundingSphere = null;
						lineWellL.geometry.boundingBox = null;
						lineWellR.geometry.boundingSphere = null;
						lineWellR.geometry.boundingBox = null;
						lineWellD1.geometry.boundingBox = null;
						lineWellD2.geometry.boundingBox = null;
					 
				 }
				 
				 



				
			


		    }

			function onMouseDown(event) {
				//console.log("hi");

				mouseDown = 1;
			}
			function onMouseUp(event) {
				//console.log("bye");
				mouseDown = 0;

			}
			
			function calculateNorm() {
				var ret=0;
				for (var i = 0; i < N ; i++) {
					ret = ret + Math.pow(imag[i], 2) + Math.pow(real[i], 2);
		        }
				
				return ret;

			}


			function changePotential(a){
				var mouseMoved = {};
				mouseMoved.x = (mouse.x + 1)/2;
				mouseMoved.y = (mouse.y + 1)/2;

				if(mouseDown == 1 && wasClicked == 0){

					if(a == 1){
						vColor = 0xffaa25;
						if((mouseMoved.x * width > x1 + 5 && mouseMoved.x * width < x2 -5 && whichClicked == 0) || whichClicked == 1){
							
							//y = mouse.y *0.35/4.8;
							whichClicked = 1;
							$('html,body').css('cursor', 'n-resize');
							setup();
						}
						else if((mouseMoved.x * width < x1 && whichClicked == 0) || whichClicked == 2 ){
							if(mouseMoved.x * width + 1 < x2)
								x1 = mouseMoved.x * width;
							whichClicked = 2;
							$('html,body').css('cursor', 'w-resize');
							setup();

						}
						else if((mouseMoved.x * width > x2 && whichClicked == 0) || whichClicked == 3 ){
							if(mouseMoved.x * width - 1 > x1)
								x2 = mouseMoved.x * width;
							whichClicked = 3;
							$('html,body').css('cursor', 'w-resize');
							setup();
						}else{
							$('html,body').css('cursor', 'pointer');
							
							whichClicked = 0;

						}
					}else if(a==0){
					 	Color = 0xffaa25;
						if( whichClicked == 1){
						
						y = mouse.y *0.18;
						whichClicked = 1;
						$('html,body').css('cursor', 'n-resize');
						setup();
					}
					else if( whichClicked == 2 ){
						if(mouseMoved.x * width + 1 < x2)
							x1 = mouseMoved.x * width;
						whichClicked = 2;
						$('html,body').css('cursor', 'w-resize');
						setup();

					}
					else if(whichClicked == 3 ){
						if(mouseMoved.x * width - 1 > x1)
							x2 = mouseMoved.x * width;
						whichClicked = 3;
						$('html,body').css('cursor', 'w-resize');
						setup();
					}else{
						 vColor = 0x000000

					}


					}

				
				}else{
					 vColor = 0x000000
					whichClicked = 0;
					
				}
				
				lineV.geometry.boundingSphere = null;
				lineV.geometry.boundingBox = null;

			}
			
			function addData(chart, label, data) {
				chart.data.datasets[0].data.push({x: data.x, y: data.y});
				chart.update();
			}

			function updateWell(){
				let yy = y;
				if(  currentPreset == 2){
					yy = -y;
				}
				//console.log(KEn);
				lineETab[0] = -	width/2 ;
				lineETab[1] = multiplier/4 * oneoverev * KEn * ev;
				lineETab[2] = 0;
				
				lineETab[3] = +	width/2; 
				lineETab[4] = multiplier/4 * oneoverev * KEn * ev;
				lineETab[5] = 0;
				
				let prop =  parseInt( height/2 + 35 - multiplier/4 * oneoverev * KEn * ev);
				
				newNode.style.top = prop  +  'px';
				newNode.style.left = (width * 0.84)  +  'px';
				newNode.innerHTML = "<b>&lt;E&gt;<sub>Gauss</sub> = " + parseFloat(KEn).toFixed(3) + " eV</b>";
				lineWellD1Tab[0] = -	width/2 ;
				lineWellD1Tab[1] = 0;
				lineWellD1Tab[2] = 0;
				
				lineWellD1Tab[3] = -	width/2 + x1
				lineWellD1Tab[4] = 0;
				lineWellD1Tab[5] = 0;
				
				lineWellLTab[0] = -	width/2 + x1;
				lineWellLTab[1] = 0;
				lineWellLTab[2] = 0;
				
				lineWellLTab[3] = -	width/2 + x1
				lineWellLTab[4] = multiplier/4 * oneoverev * yy * ev;
				lineWellLTab[5] = 0;
				
				lineWellRTab[0] = -	width/2 + x2;
				lineWellRTab[1] = 0;
				lineWellRTab[2] = 0;
				
				lineWellRTab[3] = -	width/2 +x2;
				lineWellRTab[4] = multiplier/4 * oneoverev * yy * ev;
				lineWellRTab[5] = 0;
				
				lineWellU1Tab[0] = -	width/2 +x1;
				lineWellU1Tab[1] = multiplier/4 * oneoverev * yy * ev;
				lineWellU1Tab[2] = 0;
				
				lineWellU1Tab[3] = -width/2 +x2;
				lineWellU1Tab[4] = multiplier/4 * oneoverev * yy * ev;
				lineWellU1Tab[5] = 0;
				
				lineWellD2Tab[0] = -width/2 +x2;
				lineWellD2Tab[1] = 0;
				lineWellD2Tab[2] = 0;
				
				lineWellD2Tab[3] = + width/2;
				lineWellD2Tab[4] = 0;
				lineWellD2Tab[5] = 0;
				updateArrows();
			}
			
			function updateArrows(){
				let yy = y;
				if(  currentPreset == 2){
					yy = -y;
				}
				arrow1.sprite.position.x = ( - width/2 + x1 + (x2-	 x1)/2);
				arrow1.sprite.position.y = multiplier/4 * oneoverev * yy * ev;
				arrow2.sprite.position.x = ( - width/2 +x2);
				arrow2.sprite.position.y = multiplier/8 * oneoverev * yy * ev;
				arrow3.sprite.position.x = ( - width/2 +x1);
				arrow3.sprite.position.y = multiplier/8 * oneoverev * yy * ev;
				 
			}

		    function updatePositions() {
				
				
				if(calculateNorm()<0.9)
					setup();

		        var positionsV = lineV.geometry.attributes.position.array;
		        var positionsD = lineD.geometry.attributes.position.array;

		        var index = 3,
		            index2 = 3, index3 = 3, index4 = 3;
		        // set values on the borders
		        {
		            positionsV[0] = -width / 2;
		            positionsV[1] = 0;
		           // positions[2] = 0;
		            positionsD[0] = -width / 2;
		            positionsD[1] = 0;
					positionsR[0] = -width / 2;
		            positionsR[1] = 0;
					positionsI[0] = -width / 2;
		            positionsI[1] = 0;
		          //  positionsD[2] = 0;

		            positionsV[3 * N - 3] = -width / 2 + (N - 1) / ratio;
		            positionsV[3 * N - 2] = 0;
		            positionsV[3 * N - 1] = 0;
		            positionsD[3 * N - 3] = -width / 2 + (N - 1) / ratio;
		            positionsD[3 * N - 2] = 0;
		            positionsD[3 * N - 1] = 0;
					positionsR[3 * N - 3] = -width / 2 + (N - 1) / ratio;
		            positionsR[3 * N - 2] = 0;
		            positionsR[3 * N - 1] = 0;
					positionsI[3 * N - 3] = -width / 2 + (N - 1) / ratio;
		            positionsI[3 * N - 2] = 0;
		            positionsI[3 * N - 1] = 0;
		        }
		        lineV.material.color.setHex(vColor);
		        leapFrog();

		        for (var i = 0; i < N ; i++) {

		            positionsV[index++] = -width / 2 + i / ratio;
		            positionsV[index++] = multiplier/4 * oneoverev *  V[i];
		            positionsV[index++] = 0;

					
					// DENSITY
		            positionsD[index2++] = -width / 2 + i / ratio;
					if(drawing[0] == 1 ){
						positionsD[index2++] = multiplier / 2 * (imag[i] * imag[i] + real[i] * real[i]);
					}else if(drawing[3] == 1){
						positionsD[index2++] = multiplier / 4 * Math.sqrt(imag[i] * imag[i] + real[i] * real[i]);
					}
		            positionsD[index2++] = 0;
					
					// REALIS
		            positionsR[index3++] = -width / 2 + i / ratio;
		            positionsR[index3++] = multiplier / 4* (real[i]);
		            positionsR[index3++] = 0;
					
					// IMAGINARIS
		            positionsI[index4++] = -width / 2 + i / ratio;
		            positionsI[index4++] = multiplier / 4* (imag[i]);
		            positionsI[index4++] = 0;

		        }
				updateWell();


		    }

		    function onWindowResize(){
				camera.aspect =  document.getElementById("canvas_holder").clientWidth / height;
				camera.updateProjectionMatrix();
				renderer.setSize( document.getElementById("canvas_holder").clientWidth, height );

			}

		    function leapFrog() {
		        // imag[0] = -imag[2];
		        // imag[N - 1] = -imag[N - 3];
				
				for (let i = 1; i < PML_width+1; i++) {
					let delta_i = imag[i + 1] - 2 * imag[i] + imag[i - 1];
					let delta_r = real[i + 1] - 2 * real[i] + real[i - 1];
					real[i] += -ra * (delta_i*gammaR(i) + delta_r * gammaI(i)) + (dt / h) * V[i] * imag[i];
					
		        }
		        for (let i = PML_width+1; i < N-(PML_width+1); i++) {
					let delta_i = imag[i + 1] - 2 * imag[i] + imag[i - 1];
					real[i] += -ra * (delta_i) + (dt / h) * V[i] * imag[i];
					
		        }
				
				for (let i = N-(PML_width+1); i < N-1; i++) {
					let delta_i = imag[i + 1] - 2 * imag[i] + imag[i - 1];
					let delta_r = real[i + 1] - 2 * real[i] + real[i - 1];
					real[i] += -ra * (delta_i*gammaR(i) + delta_r * gammaI(i)) + (dt / h) * V[i] * imag[i];
					
		        }
		         for (let i = 1; i < PML_width+1; i++) {
					
					let delta_i = imag[i + 1] - 2 * imag[i] + imag[i - 1];
					let delta_r = real[i + 1] - 2 * real[i] + real[i - 1];
					 
					imag[i] += ra * (delta_r * gammaR(i) - delta_i * gammaI(i)) - (dt / h) * V[i] * real[i];		            
		        }
		        for (let i = PML_width+1; i < N-(PML_width+1); i++) {
					let delta_r = real[i + 1] - 2 * real[i] + real[i - 1];
					imag[i] += ra * (delta_r) - (dt / h) * V[i] * real[i];		         
		        }
				
				 for (let i = N-(PML_width+1); i < N-1; i++) {
					
					let delta_i = imag[i + 1] - 2 * imag[i] + imag[i - 1];
					let delta_r = real[i + 1] - 2 * real[i] + real[i - 1];
					 
					imag[i] += ra * (delta_r * gammaR(i) - delta_i * gammaI(N-i)) - (dt / h) * V[i] * real[i];		            
		        }

		    }
			
			function gammaR(x){
				let sig = getSigma(x);
				return (1+Math.sqrt(2) * sig) / ((sig * (sig+Math.sqrt(2)) + 1)^2);
			}
			
			function gammaI(x){
				let sig = getSigma(x);
				return (- sig*Math.sqrt(2) - sig*sig) / ((sig * (sig+Math.sqrt(2)) + 1)^2);
			}
			
			function getSigma(x){
				return 0.0005 * ((x - PML_width))^2;
			}

		    function onDocumentMouseMove(event) {
		        //event.preventDefault();
		        
		        const rect = theDiv.getBoundingClientRect();
		        if (event.clientX > rect.x && event.clientX < rect.x + rect.width) {

		            if (event.clientY > rect.y && event.clientY < rect.y + rect.height) {

				mouseDr.x = mouse.x - mouseOld.x;
				mouseDr.y = mouse.y - mouseOld.y;
				//console.log(mouseDr);
				mouseOld.x = mouse.x;
				mouseOld.y = mouse.y;

		                mouse.x = ((event.clientX - rect.x) / document.getElementById("canvas_holder").clientWidth) * 2 - 1;
		                mouse.y = -((event.clientY - rect.y) / height) * 2 + 1;
		               
		            }
		        }

		    }
			
			function getEnergyX(){
				let ke = 0;
				for (var i = 0; i < N ; i++) {
					ke += -2*((i-nc)/ratio)/(2*sigma^2)*Math.exp(-1.0 * Math.pow((((i - nc)/ratio) / (Math.sqrt(2)*sigma/ratio )), 2));
				}
				return -oneoverev*(((h)*(h))/(2*mass)) * ke;
			}

		    function setup() {
		        resetPotential();
				iter = 0;
		        time = 0;
				pTotal = 0;
		        for (var i = 0; i < N ; i++) {
		            real[i] = Math.exp(-1.0 * Math.pow((((i - nc)/ratio) / (Math.sqrt(2)*sigma/ratio )), 2)) * Math.cos(2*Math.PI/ lambda * ((i - nc)/ratio));
		            imag[i] = Math.exp(-1.0 * Math.pow((((i - nc)/ratio) / (Math.sqrt(2)*sigma/ratio )), 2)) * Math.sin(2*Math.PI/ lambda * ((i - nc)/ratio));
		            pos[i] = dx * i;
		            pTotal = pTotal + Math.pow(imag[i], 2) + Math.pow(real[i], 2);
		        }
				
			

		        // set values on the end to 0
		        //imag[0] = 0; // set 0 at boundaries
		        //real[0] = 0; // set 0 at boundaries
		       // real[N - 1] = 0;
		       // imag[N - 1] = 0;
			   
			    

		        var norm = Math.sqrt(pTotal);
		        pTotal = 0.0;

		        for (var i = 0; i < N; i++) {
		            real[i] /= norm;
		            imag[i] /= norm;
		            pTotal += Math.pow(imag[i], 2) + Math.pow(real[i], 2);
		        }
				
				KEn = getEnergy();
					//console.log(KEn);
		    }

		    function resetPotential() {
				for (var i = 0; i < N; i++) {
					V[i] = 0;
				}
				
				
				if(currentPreset == 0){

					for (var i = parseInt(x1*ratio); i < parseInt(x2*ratio); i++) {
						V[i] = y * ev;
					}
				}else if(currentPreset == 1){
			
					for (var i = parseInt(x1*ratio); i < N; i++) {
						V[i] = y * ev;
					}
					
				}else if(currentPreset == 2){
					
					for (var i = 0; i < N; i++) {
						V[i] = y * ev;
					}
					for (var i = parseInt(x1*ratio); i < parseInt(x2*ratio); i++) {
						V[i] = 0;
					}
					
				}else if(currentPreset == 3){
					
					for (var i = 0; i < N; i++) {
						V[i] = y * ev;
					}
					for (var i = parseInt(x1*ratio); i < parseInt(x2*ratio); i++) {
						V[i] = 0;
					}
					
					V[N/2 - 1] = y * ev;
					V[N/2 ] = y * ev;
					V[N/2 + 1] = y * ev;
					
				}else if(currentPreset == 4){
					
					for (var i = 0; i < N; i++) {
						V[i] = 0;
					}
					
				
					
				}
					
					

		    }
			function getVariance(){
				let meanX = getMeanX();
				return getMeanSquaredX() - meanX*meanX;
			}
			
			function getMeanX(){
				
				let meanX = 0;
				
				for(let i = 0;i < N; i++){
					meanX += (real[i] * real[i] + imag[i] * imag[i])*i*deltax;
				}
				
				return meanX*deltax;
				
				
			}
			
			function getMeanSquaredX(){
				let meanSquaredX = 0;
				
				for(let i = 0;i < N; i++){
					meanSquaredX += (real[i] * real[i] + imag[i] * imag[i])*(i*deltax)*(i*deltax);
				}
				
				return meanSquaredX*deltax;
				
			}
			
			function getEnergy(){
				let ke = 0;
				for(let i =1 ; i < N-1; i++){
					ke += real[i]*(real[i+1] - 2* real[i] + real[i-1]) + imag[i] * (imag[i+1] - 2* imag[i] + imag[i-1]);
					
				}
				
				ke = -oneoverev*(((h/deltax)*(h/deltax))/(2*mass)) * ke;
				
				
				return ke;
				
				
			}

		    function addListeners() {

		        slider.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            lambda = 1/(target.value);
					
		           
		            setup();
		        });
				
		        sliderx1.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            if (target.value < x2)
		                x1 = (target.value)/ratio;
		            else {
		                x1 = x2 - 5;
		                target.value = x2 - 5;
		            }
					
		            setup();
		        });
				
		        slidery.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            y = (target.value);
					
		            setup();
		        });
				
		        sliderx2.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            if (target.value > x1)
		                x2 = (target.value)/ratio;
		            else {
		                x2 = x1 + 5;
		                target.value = x1 + 5;
		            }
					
		            setup();
		        });
		     
		        sliderNc.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            nc = (target.value);
					
		            setup();
		        });
				
				$("#sim_options_preset_select").change(function(e) {
		           var val = $(this).find(":selected").val();
				   
				   if(val == "barrier_int"){
					    currentPreset = 0;

						setX1(790/ratio);
						setX2(800/ratio);
						setK(0.157);
						setNc(200);
						setY(0.1);
					    setup();
				   }else if(val == "step"){
					   currentPreset = 1;
					   nc = 300;
					   x1 = 800/ratio;
					   x2 = 3900/ratio;
					   setup();
				   }else if(val == "well"){
						setX1(730/ratio);
						setX2(870/ratio);
						setK(0);
						setNc(800);
						setY(0.1);
					    currentPreset = 2;
					    setup();
				   }else if(val == "well_2"){
						setX1(730/ratio);
						setX2(870/ratio);
						setK(0);
						setNc(800);
						setY(0.1);
					    currentPreset = 3;
					    setup();
				   }else if(val == "free"){
						setX1(-20);
						setY(0);
						setX2(width * ratio + 10);
					    currentPreset = 4;
					    setup();
				   }else{
					   
				   }
		        });

		        sliderSigma.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            sigma = (target.value);
					
		            setup();
		        });
				
				
		        sliderDt.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            dt = parseFloat(target.value)*1e-17;
					ra = (0.5 * h / mass) * (dt / Math.pow(deltax, 2));
					
		            setup();
		        });

		        sliderUpf.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            updatesPerFrame = (target.value);	
					
		        });
				
				chDe.addEventListener( "change", 
				function(){
					if (this.checked) {
						drawing[0] = 1;
						drawing[3] = 0;
						chDeSq.checked = false;
					}else{
						drawing[0] = 0;
						drawing[3] = 1;
						chDeSq.checked = true;
					}
				});
				
				chDeSq.addEventListener( "change", 
				function(){
					if (this.checked) {
						drawing[0] = 0;
						drawing[3] = 1;
						chDe.checked = false;
					}else{
						drawing[0] = 1;
						drawing[3] = 0;
						chDe.checked = true;
					}
				});
				
				chRe.addEventListener( "change", 
				function(){
					if (this.checked) {
						drawing[1] = 1;
					}else{
						drawing[1] = 0;
					}
				});
				running.checked = true;
				running.addEventListener( "change", 
				function(){
					if (this.checked) {
						stopper = 0;
					}else{
						stopper = 1;
					}
				});
				
				chIm.addEventListener( "change", 
				function(){
					if (this.checked) {
						drawing[2] = 1;
					}else{
						drawing[2] = 0;
					}
				});
		     

		    }
			
			function setK(kk){
				lambda = 1/kk
				slider.value = kk;
				
			}
			
			function setX1(kk){
				x1 = kk
				document.getElementById("slider_x1").value = kk;
				
			}
			
			function setX2(kk){
				x2 = kk
				document.getElementById("slider_x2").value = kk;
				
			}
			
			function setNc(kk){
				nc = kk
				sliderNc.value = kk;
				
			}
			
			function setY(kk){
				y = kk
				slidery.value = kk;
				
			}
			
			
		
			

	
			function toRad(alfa){
				return alfa * Math.PI / 180;
			}

		
