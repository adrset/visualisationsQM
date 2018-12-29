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
			var stopper = 0;

			var iter = 0;
		    var rysuje = 0;
		    var K = 0.157;
		    var width = document.getElementById("canvas").clientWidth;
		    var currentPreset = 0;
		    var mouseDr = {};

		    var mouseDown = 0;
		    let N = 1600;
		    let h = 1;
		    let mass = 1;
		    let deltax = 1;
			var upf = 10;
		    var updatesPerFrame = 30;
		    var mouse = new THREE.Vector2();
		    var mouseOld = new THREE.Vector2();
	        var ratio = N / width;  
		    let dx = deltax * 1e9;
		    let sigma = 50 ;
		    let nc = 200;
		    var pTotal = 0;
		    let PI = 3.14159;
			var rysujeText = ["DENSITY","IMAGINARIS", "REALIS"];
		    

		   
		    let height = 700;
		    var x1 = 790/ratio;
		    var x2 = 800/ratio;
		    var multiplier = 12000;
		    var y = 0.1;
		    var time = 0;
		    let dt = 0.49;
		    var ra = (0.5 * h / mass) * (dt / Math.pow(deltax, 2));
		    var positions = new Float32Array(N * 3); // 3 vertices per point
		    var positions2 = new Float32Array(N * 3); // 3 vertices per point
		    var V = [];
		    var imag = [];
		    var real = [];
		    var sum = [];
		    var pos = [];
		    var vColor = 0x00000;

		    setup();


		   
		    window.addEventListener('resize', onWindowResize, false);
		    var scene = new THREE.Scene();

		    var camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, -1, 1000);

		    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		    renderer.setSize(width, height);
		    var theDiv = document.getElementById("canvas");
	        renderer.domElement.addEventListener("mousedown", onMouseDown, true);
	        renderer.domElement.addEventListener("mouseup", onMouseUp, true);

		    theDiv.style.width = width + 'px';
		    theDiv.style.height = height + 'px';

		    $("#mode").removeClass("hidden");
			document.querySelector(".sim_mode").innerHTML = rysujeText[rysuje]; 
			
			$("#mode").click(function(){
				rysuje = (rysuje + 1)%3; 	
			
				document.querySelector(".sim_mode").innerHTML = rysujeText[rysuje]; 

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
		    stats.dom.style.top = document.getElementById("nav").clientHeight + 'px';
		    theDiv.appendChild(renderer.domElement);
		    theDiv.appendChild( stats.dom );
		    raycaster = new THREE.Raycaster();
		    raycaster.linePrecision = 20;

		    document.addEventListener('mousemove', onDocumentMouseMove, false);

		    var geometry = new THREE.BufferGeometry();
			var once = 1;
		    var geometry2 = new THREE.BufferGeometry();

		    geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
		    geometry2.addAttribute('position', new THREE.BufferAttribute(positions2, 3));

		    // draw range
		    var drawCount = N; // draw the first 2 points, only
		    geometry.setDrawRange(0, drawCount);
		    geometry2.setDrawRange(0, drawCount);

		    // material
		    var material = new THREE.LineBasicMaterial({ color: vColor, linewidth: 2 });
		    // material
		    var material2 = new THREE.LineBasicMaterial({ color: 0xaa00fd, linewidth: 2 });

		    // line
		    var line = new THREE.Line(geometry, material);
		    var line2 = new THREE.Line(geometry2, material2);
		    scene.add(line);
		    scene.add(line2);
			
		    var whichClicked = 0;

		    addListeners();

		    var animate = function() {

		        var t0 = performance.now();
		        //console.log(stopper);
		        if (stopper != 1) {
			    stats.begin();
		            for (var i = 0; i < updatesPerFrame - 1; i++) {
		                leapFrog();

		            }
					document.getElementById("time_elapsed").innerHTML= 'Czas: ' + parseInt(time) + 'ps'; 
					document.getElementById("sim_alpha_val").innerHTML= ra
		            requestAnimationFrame(animate);

		            updatePositions();

		            line.geometry.attributes.position.needsUpdate = true;
		            line2.geometry.attributes.position.needsUpdate = true;
		            renderer.render(scene, camera);
		            render();
		            var t1 = performance.now();
		            //console.log(1/((t1-t0)));
		            time += dt;
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

		        var intersects = raycaster.intersectObjects([line], true);
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

		        var positions = line.geometry.attributes.position.array;
		        var positions2 = line2.geometry.attributes.position.array;

		        var index = 3,
		            index2 = 3;
		        // set values on the borders
		        {
		            positions[0] = -width / 2;
		            positions[1] = 0;
		           // positions[2] = 0;
		            positions2[0] = -width / 2;
		            positions2[1] = 0;
		          //  positions2[2] = 0;

		            positions[3 * N - 3] = -width / 2 + (N - 1) / ratio;
		            positions[3 * N - 2] = 0;
		            positions[3 * N - 1] = 0;
		            positions2[3 * N - 3] = -width / 2 + (N - 1) / ratio;
		            positions2[3 * N - 2] = 0;
		            positions2[3 * N - 1] = 0;
		        }
		        line.material.color.setHex(vColor);
		        leapFrog();

		        for (var i = 0; i < N ; i++) {

		            positions[index++] = -width / 2 + i / ratio;
		            positions[index++] = multiplier * V[i];
		            positions[index++] = 0;

		            positions2[index2++] = -width / 2 + i / ratio;
		            if (rysuje == 0) {
		                positions2[index2++] = multiplier * (imag[i] * imag[i] + real[i] * real[i]);
		                line2.material.color.setHex(0xff0505);
		            } else if (rysuje == 1) {
		                positions2[index2++] = multiplier / 4 * (imag[i]);
		                line2.material.color.setHex(0xf4e107);
		            } else if (rysuje == 2) {
		                line2.material.color.setHex(0x45e506);
		                positions2[index2++] = multiplier / 4* (real[i]);
		            }
		            positions2[index2++] = 0;

		        }


		    }

		    function onWindowResize(){
			

			}

		    function leapFrog() {
		        // imag[0] = -imag[2];
		        // imag[N - 1] = -imag[N - 3];
		        for (var i = 1; i < N-1	; i++) {
					
					real[i] += -ra * (imag[i + 1] - 2 * imag[i] + imag[i - 1]) + (dt / h) * V[i] * imag[i];
					
		        }
		        
		        for (var i = 1; i < N-1; i++) {
					
					imag[i] += ra * (real[i + 1] - 2 * real[i] + real[i - 1]) - (dt / h) * V[i] * real[i];
					
		            
		        }

		    }

		    function onDocumentMouseMove(event) {
		        //event.preventDefault();
		        // TODO: use mouse cords only inside canvas!
		        const rect = theDiv.getBoundingClientRect();
		        if (event.clientX > rect.x && event.clientX < rect.x + rect.width) {

		            if (event.clientY > rect.y && event.clientY < rect.y + rect.height) {

				mouseDr.x = mouse.x - mouseOld.x;
				mouseDr.y = mouse.y - mouseOld.y;
				//console.log(mouseDr);
				mouseOld.x = mouse.x;
				mouseOld.y = mouse.y;

		                mouse.x = ((event.clientX - rect.x) / width) * 2 - 1;
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
		            real[i] = Math.exp(-1.0 * Math.pow((((i - nc)/ratio) / (sigma * Math.sqrt(2))), 2)) * Math.cos(K * ((i - nc)/ratio));
		            imag[i] = Math.exp(-1.0 * Math.pow((((i - nc)/ratio) / (sigma * Math.sqrt(2))), 2)) * Math.sin(K * ((i - nc)/ratio));
		            //pos[i] = dx * i;
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

		    }

		    function resetPotential() {
				for (var i = 0; i < N; i++) {
					V[i] = 0;
				}
				
				
				if(currentPreset == 0){

					for (var i = parseInt(x1*ratio); i < parseInt(x2*ratio); i++) {
						V[i] = y * 0.2;
					}
				}else if(currentPreset == 1){
			
					for (var i = parseInt(x2*ratio); i < N; i++) {
						V[i] = y * 0.2;
					}
					
				}else if(currentPreset == 2){
					
					for (var i = 0; i < N; i++) {
						V[i] = y * 0.2;
					}
					for (var i = parseInt(x1*ratio); i < parseInt(x2*ratio); i++) {
						V[i] = 0;
					}
					
				}else if(currentPreset == 3){
					
					for (var i = 0; i < N; i++) {
						V[i] = y * 0.2;
					}
					for (var i = parseInt(x1*ratio); i < parseInt(x2*ratio); i++) {
						V[i] = 0;
					}
					
					V[N/2 - 1] = y * 0.2;
					V[N/2 ] = y * 0.2;
					V[N/2 + 1] = y * 0.2;
					
				}
					
					

		    }

		    function addListeners() {

		        slider.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            K = (target.value);
					clearData(myChart);
		            console.log(target.value);
		            setup();
		        });
				
		        sliderx1.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            if (target.value < x2)
		                x1 = (target.value);
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
		                x2 = (target.value);
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
		            dt = (target.value);
					ra = (0.5 * h / mass) * (dt / Math.pow(deltax, 2));
					clearData(myChart);
					setK(1);
		            setup();
		        });

		        sliderUpf.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            updatesPerFrame = (target.value);
					
					clearData(myChart);
		            setup();
		        });
		     

		    }
			
			function setK(kk){
				K = kk
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
		
