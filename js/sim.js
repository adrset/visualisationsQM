	$(document).ready(function(){
		setTimeout(function(){
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
			var stopper = 0;

			var iter = 0;
		    var rysuje = 0;
		    var K = 0.157;
		    var width = document.getElementById("canvas_holder").clientWidth;
		    var currentPreset = 0;
		    var mouseDr = {};

		    var mouseDown = 0;
		    let N = 1600;
		    let h = 1.054e-34;
		    let mass = 9.1e-31;
		    let deltax = .1e-9;
			var upf = 10;
		    var updatesPerFrame = 30;
		    var mouse = new THREE.Vector2();
		    var mouseOld = new THREE.Vector2();
	        var ratio = N / width;  
		    let dx = deltax * 1e9;
		    let sigma = 40;
		    let nc = 400;
		    var pTotal = 0;
		    let PI = 3.14159;
			var rysujeText = ["DENSITY","IMAGINARIS", "REALIS"];
			
			var drawing = [1,0,0,0];
		    
			chIm.checked = false;
			chRe.checked = false;
			
		    var PML_width = 100;
		    let height = 700;
		    var x1 = 790/ratio;
		    var x2 = 800/ratio;
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
				
				console.log(theGuy);
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
				clearData(myChart);
				setup();

			});
			var ctx = document.getElementById("myChart").getContext('2d');
			var myChart = new Chart(ctx, {
				type: 'scatter',
				
				fontColor : "#ffa45e",
			   data: {
				  datasets: [{
					 label: "Norm",
					 data: [],
					 fillColor: "rgba(255, 138, 212,0.5)",
					 pointBackgroundColor : "rgba(255, 0, 0,1)"
				  }]
			   },  
			   options: {
					scaleFontColor: 'red',
					responsive: true,
					tooltips: {
						mode: 'single',
					},
					scales: {
						xAxes: [{ 
							gridLines: {
								display: false,
								color: "#000000"
							},
							ticks: {
							  fontColor: "#000000",
							  beginAtZero: true,
							  steps: 5,
							},
						}],
						yAxes: [{
							display: true,
							gridLines: {
								display: true,
								color: "#000000"
							},
							ticks: {
							  fontColor: "#000000",
							  beginAtZero: true,
							  steps: 10,
							  stepValue: 0.2,
							  max: 2
							},
						}],
					}
				}    
			});
				
		    var stats = new Stats();
		    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
                    
		    stats.dom.style.position = 'absolute';
			stats.dom.style.zIndex = '2';
		    stats.dom.style.top = 0 + 'px';
		    //stats.dom.classList.add("movable");
			renderer.domElement.style.position = 'absolute';
			renderer.domElement.style.top = 0 + 'px';
		    theDiv.appendChild(renderer.domElement);
		    theDiv.appendChild( stats.dom );
		    raycaster = new THREE.Raycaster();
		    raycaster.linePrecision = 20;
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
		    var materialI = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
  
		    // line
		    var lineV = new THREE.Line(geometryV, materialV);
		    var lineD = new THREE.Line(geometryD, materialD);
			var lineR = new THREE.Line(geometryR, materialR);
		    var lineI = new THREE.Line(geometryI, materialI);
		    scene.add(lineV);
		    scene.add(lineD);
			scene.add(lineR);
		    scene.add(lineI);		
		    var whichClicked = 0;

		    addListeners();

		    var animate = function() {

		        var t0 = performance.now();
		        //console.log(stopper);
		        if (stopper != 1) {
			    stats.begin();
		            for (var i = 0; i < updatesPerFrame - 1; i++) {
						time += dt;
		                leapFrog();
						
		            }
					
					
					document.getElementById("time_elapsed").innerHTML= 'Czas: ' + parseInt(time*1e15) + 'fs'; 
					document.getElementById("sim_alpha_val").innerHTML= ra
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
		            renderer.render(scene, camera);
		            render();
		            var t1 = performance.now();
		            //console.log(1/((t1-t0)));
					stats.end();
		        }

		    };

		    if (WEBGL.isWebGLAvailable()) {
			setTimeout(animate(), 1000);



		        
		    } else {
		        var warning = WEBGL.getWebGLErrorMessage();
		        document.getElementById('canvas').appendChild(warning);
		    }

		    function render() {

		        raycaster.setFromCamera(mouse, camera);
				
		        var intersects = raycaster.intersectObjects([lineV], true);
		        if (intersects.length > 0) {
		            $('html,body').css('cursor', 'pointer');
			    changePotential(1);
		           
		        } else {
		            $('html,body').css('cursor', 'default');
 			    changePotential(0);
		            
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

				if(mouseDown == 1){

					if(a == 1){
						vColor = 0xffaa25;
						if((mouseMoved.x * width > x1 + 5 && mouseMoved.x * width < x2 -5 && whichClicked == 0) || whichClicked == 1){
							
							y = mouse.y *0.35/2.4;
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
						
						y = mouse.y *0.35;
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

			}
			
			function addData(chart, label, data) {
				chart.data.datasets[0].data.push({x: data.x, y: data.y});
				chart.update();
			}

			function clearData(chart) {
				chart.data.datasets[0].data = [];
				chart.update();
			}

		    function updatePositions() {
				if(iter++%20 == 0){
					addData(myChart, "", {x: iter/10, y:calculateNorm()});
					
				}
				
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
						positionsD[index2++] = multiplier / 4 * (imag[i] * imag[i] + real[i] * real[i]);
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
				
				 for (let i = N-(PML_width+1); i < N-(PML_width+1); i++) {
					
					let delta_i = imag[i + 1] - 2 * imag[i] + imag[i - 1];
					let delta_r = real[i + 1] - 2 * real[i] + real[i - 1];
					 
					imag[i] += ra * (delta_r * gammaR(i) - delta_i * gammaI(i)) - (dt / h) * V[i] * real[i];		            
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
				return 0.005 * ((x - PML_width)*dx)^2;
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


		    function setup() {
		        resetPotential();
				iter = 0;
		        time = 0;
				pTotal = 0;
		        for (var i = 0; i < N ; i++) {
		            real[i] = Math.exp(-1.0 * Math.pow((((i - nc)/ratio) / (sigma/ratio )), 2)) * Math.cos(2*Math.PI/ lambda * ((i - nc)/ratio));
		            imag[i] = Math.exp(-1.0 * Math.pow((((i - nc)/ratio) / (sigma/ratio )), 2)) * Math.sin(2*Math.PI/ lambda * ((i - nc)/ratio));
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
				if(1){
						
						console.log(Math.max(...real));
					}
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
			
					for (var i = parseInt(x2*ratio); i < N; i++) {
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
					
				}
					
					

		    }

		    function addListeners() {

		        slider.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            lambda = 1/(target.value);
					clearData(myChart);
		            console.log(target.value);
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
					clearData(myChart);
		            setup();
		        });
				
		        slidery.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            y = (target.value);
					clearData(myChart);
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
					clearData(myChart);
		            setup();
		        });
		     
		        sliderNc.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            nc = (target.value);
					clearData(myChart);
		            setup();
		        });
				
				$("#sim_options_preset_select").change(function(e) {
		           var val = $(this).find(":selected").val();
				   clearData(myChart);
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
					   x1 = 0;
					   x2 = 800/ratio;
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
				   }else{
					   
				   }
		        });

		        sliderSigma.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            sigma = (target.value);
					clearData(myChart);
		            setup();
		        });
				
				
		        sliderDt.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            dt = parseFloat(target.value)*1e-17;
					ra = (0.5 * h / mass) * (dt / Math.pow(deltax, 2));
					clearData(myChart);
		            setup();
		        });

		        sliderUpf.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            updatesPerFrame = (target.value);	
					clearData(myChart);
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
			
			
		
			

	}, 200);

});
		
