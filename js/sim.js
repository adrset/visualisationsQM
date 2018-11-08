			var rysuje = 0;
			var K = 0.12;
			let width = 800;
			let height = 500;
			let N = 800;
			let h = 1.054e-34;
			let mass = 9.1e-31;
			let deltax = 0.1e-9;
			let dt = 2e-17;
			let dx = deltax * 1e9;
			let sigma = 25;
			let nc = 340;
			var pTotal = 0;
			let PI = 3.14159;
			var x1 = 390;
			var x2 = 400;
			var multiplier = 4000;
			var y = 10;
			var time = 0;
			
			var ra = (0.5 * h / mass) * (dt / Math.pow(deltax, 2));
			var positions = new Float32Array( N * 3 ); // 3 vertices per point
			var positions2 = new Float32Array( N * 3 ); // 3 vertices per point
			var V = [];
			var imag = [];
			var real = [];
			var sum = [];
			var pos = [];
			
			setup();
			document.getElementById("sim_display_ra").innerHTML="ra " + ra.toFixed(3); 

			var scene = new THREE.Scene();

			var camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 0, 1000 );

			var renderer = new THREE.WebGLRenderer({  antialias: true});
			renderer.setSize( width, height );
			var theDiv = document.getElementById("canvas");
			
			theDiv.appendChild( renderer.domElement );
			
			var geometry = new THREE.BufferGeometry();

			var geometry2 = new THREE.BufferGeometry();
			
			geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
			geometry2.addAttribute( 'position', new THREE.BufferAttribute( positions2, 3 ) );

			// draw range
			var drawCount = N; // draw the first 2 points, only
			geometry.setDrawRange( 0, drawCount );
			geometry2.setDrawRange( 0, drawCount );

			// material
			var material = new THREE.LineBasicMaterial( { color:  0xffffff, linewidth: 2 } );
			// material
			var material2 = new THREE.LineBasicMaterial( { color: 0xaa00fd, linewidth: 2 } );

			// line
			var line = new THREE.Line( geometry,  material );
			var line2 = new THREE.Line( geometry2,  material2 );
			scene.add( line );
			scene.add( line2 );

			camera.position.set( 0, 0, 0 );
			camera.lookAt( 0, 0, 0 );
			
			addListeners();

			var animate = function () {
				var t0 = performance.now();
				
				requestAnimationFrame( animate );
   				
				updatePositions();
				line.geometry.attributes.position.needsUpdate = true; 
				line2.geometry.attributes.position.needsUpdate = true; 
				renderer.render( scene, camera );
				var t1 = performance.now();
				console.log(1/((t1-t0)));
				time += dt;
				
				document.getElementById("sim_display_time").innerHTML="Time elapsed: " + (time * 1e15).toFixed(0) + "fs"; 
				
			};

			if (WEBGL.isWebGLAvailable()) {
			  animate();
			} else {
			    var warning = WEBGL.getWebGLErrorMessage();
			    document.getElementById('container').appendChild(warning);
			}

			function updatePositions() {

				var positions = line.geometry.attributes.position.array;
				var positions2 = line2.geometry.attributes.position.array;

				var index = 3, index2 = 3;
				// set values on the borders
				{
					positions[0] = -width/2;
					positions[1] = multiplier*V[0];
					positions[2] = 0;	
					positions2[0] = -width/2;
					positions2[1] = multiplier*(Math.pow(imag[0],2) + Math.pow(real[0],2));
					positions2[2] = 0;
					
					positions[3*N-3] = - width / 2 + N-1;
					positions[3*N-2] = multiplier*V[N-1];
					positions[3*N-1] = 0;
					positions2[3*N-3] = - width / 2 + N-1;
					positions2[3*N-2] = multiplier*imag[N-1];
					positions2[3*N-1] = 0;
				}
				
				for (var i = 1; i < N-1; i++) {
					real[i] +=  - ra * (imag[i - 1] - 2 * imag[i] + imag[i + 1]) + (dt/h) * V[i] * imag[i];
				}

				for(var i =1; i< N - 1; i++){
					imag[i] += ra * (real[i - 1] - 2 * real[i] + real[i + 1]) - (dt/h) * V[i] * real[i];
				}
				
				for(var i =1; i< N - 1; i++){
				
					positions[ index ++ ] = - width / 2 + i;
					positions[ index ++ ] = 4e+19*V[i];
					positions[ index ++ ] = 0;
						
					positions2[ index2 ++ ] = - width / 2 + i;
					if(rysuje == 0){
						positions2[ index2 ++ ] = multiplier*(imag[i]*imag[i] + real[i]*real[i]);
						line2.material.color.setHex( 0xff0505 );
					}else if(rysuje == 1){
						positions2[ index2 ++ ] = multiplier*(imag[i]);
						line2.material.color.setHex( 0xf4e107 );
					}else if(rysuje == 2){
						line2.material.color.setHex( 0x45e506 );
						positions2[ index2 ++ ] = multiplier*(real[i]);
					}
					positions2[ index2 ++ ] = 0;	
					
				}

			}
			
			function setup(){
			
				resetPotential();
				time = 0;
				for(var i = 1; i < N-1; i++){
					real[i] = Math.exp(-1.0 * Math.pow(((i - nc) / (sigma*Math.sqrt(2))), 2)) * Math.cos(K* (i - nc) ) ;
					imag[i] = Math.exp(-1.0 * Math.pow(((i - nc) / (sigma*Math.sqrt(2))), 2)) * Math.sin(K*(i - nc) );
					//pos[i] = dx * i;
					pTotal = pTotal + Math.pow(imag[i],2) + Math.pow(real[i],2);
				}
				
				// set values on the end to 0
				imag[0] = 0; // set 0 at boundaries
				real[0] = 0; // set 0 at boundaries
				real[N-1] = 0;
				imag[N-1] = 0;
				
				var norm = Math.sqrt(pTotal);
				pTotal = 0.0;
				
				for(var i = 0; i< N; i++){
					real[i] /= norm;
					imag[i] /= norm;
					pTotal += Math.pow(imag[i],2) + Math.pow(real[i],2);
				}
			
			}

			function resetPotential(){
				// define the Barier		
				for(var i = 0; i < N; i++){
					V[i] = 0;
				}
					
				for(var i = x1; i < x2; i++){
					V[i] = y*1e-19;
				}
			
			}
			
			function addListeners(){
				var slider = document.getElementById("slider");
				slider.addEventListener("input", function(e){
					var target = (e.target) ? e.target : e.srcElement;
					K = (target.value);
					console.log(target.value);
					setup();
				});
				
				var sliderx1 = document.getElementById("slider_x1");
				sliderx1.addEventListener("input", function(e){
					var target = (e.target) ? e.target : e.srcElement;
					if(target.value<x2)
						x1 = (target.value);
					else {
						x1 = x2-5;
						target.value = x2-5;
					}
					setup();
				});
				
				var slidery = document.getElementById("slider_y");
				slidery.addEventListener("input", function(e){
					var target = (e.target) ? e.target : e.srcElement;
					y = (target.value);
					setup();
				});
				
				var sliderx2 = document.getElementById("slider_x2");
				sliderx2.addEventListener("input", function(e){
					var target = (e.target) ? e.target : e.srcElement;
					if(target.value> x1)
						x2 = (target.value);
					else {
						x2 = x1+5;
						target.value = x1+5;
					}
					setup();
				});
				
				var sliderRys = document.getElementById("slider_rys");
				sliderRys.addEventListener("input", function(e){
					var target = (e.target) ? e.target : e.srcElement;
					rysuje = (target.value);
				});
				
				var sliderNc = document.getElementById("slider_nc");
				sliderNc.addEventListener("input", function(e){
					var target = (e.target) ? e.target : e.srcElement;
					nc = (target.value);
					setup();
				});
				
				var sliderSigma = document.getElementById("slider_sigma");
				sliderSigma.addEventListener("input", function(e){
					var target = (e.target) ? e.target : e.srcElement;
					sigma = (target.value);
					setup();
				});
				
				var reset = document.getElementById("reset");
				reset.addEventListener("click", function resetSim(e){
					vCustom = 0;
					setup();
				});
			
			
			}