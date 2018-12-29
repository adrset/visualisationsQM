class Simulation {
    constructor() {
        this.N = 100;
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
	
	calculateNorm()
	{
		var ret = 1.;
		ret *= this.dx;
		for (var ii = 0; ii < 
		
		this.N + 1; ii++)
			ret += (this.re[ii] * this.re[ii] + this.im[ii] * this.im[ii]);
		return ret*this.dx;
	}
	
	calculateAvPos()
	{ // calculate average position
		var ret = 1.;
		for (var ii = 0; ii < this.N + 1; ii++)
			ret += (ii * this.dx * (this.re[ii] * this.re[ii] + this.im[ii] * this.im[ii]));
		return ret*this.dx;
	}
	
	
	calculateAvEnergy()
	{ // calculate average energy
		var ret = 1.;
		ret *= this.dx;
		for (var ii = 0; ii < this.N + 1; ii++)
			ret += (this.re[ii] * this.hr[ii] + this.im[ii] * this.hi[ii]);
		return ret * this.dx;
	}
		
	calculateHamiltonian(part, k) {
        return -0.5 * (part[k + 1] + part[k - 1] - 2.0 * part[k]) / (this.dx * this.dx) + this.kappa * (k * this.dx - 0.5) * part[k] * Math.sin(this.omega * this.tau) ;
    }
	
    calculateStationary(n, k) {
        return Math.sqrt(2) * Math.sin(n * Math.PI * k * this.dx);
    }

    update(){
	for(var i =0; i<this.speed;i++)
		this.leapFrog();
	this.time+=0.01;

    }
	
	 leapFrog(){
		for (var ii = 0; ii < this.N + 1; ii++)
			this.re[ii] = this.re[ii] + this.hi[ii] * this.dt / 2.;
		for (var jj = 1; jj < this.N; jj++)
			this.hr[jj] = this.calculateHamiltonian(this.re, jj, this.tau);
		for (var ii = 0; ii < this.N + 1; ii++)
			this.im[ii] = this.im[ii] - this.hr[ii] * this.dt;
		for (var jj = 1; jj < this.N; jj++)
			this.hi[jj] = this.calculateHamiltonian(this.im, jj, this.tau);
		for (var ii = 0; ii < this.N + 1; ii++)
			this.re[ii] = this.re[ii] + this.hi[ii] * this.dt / 2.;
		for (var ii = 0; ii < this.N + 1; ii++)
		{
			this.p[ii] = this.re[ii] * this.re[ii] + this.im[ii] * this.im[ii];
		}
		this.tau += this.dt;
		
    }

	
    setup() {
        
       this.tau = 0;

      		for (var ii = 0; ii < this.N+1; ii++)
		{
            		this.re[ii] = this.calculateStationary(this.n, ii);
            		this.x[ii] = ii;
            		this.im[ii] = 0;
					this.p[ii] = this.re[ii] * this.re[ii] + this.im[ii] * this.im[ii];
					this.V[ii] = 10;
        	}
	
	
	for (var ii = 0; ii < this.N+1; ii++)
	{
		if(ii == 0 || ii == this.N){
			this.hr[ii] = 0;
			this.hi[ii] = 0;
		}else{
			this.hr[ii] = this.calculateHamiltonian(this.re, ii, this.tau);
			this.hi[ii] = this.calculateHamiltonian(this.im, ii, this.tau);
		}
		
	}
	
	
    }
	
}

class RenderIt{
	constructor() {
	this.t = 0;
        this.N = 101;
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
		if(this.iter%20 == 0){
			addData(myChart, "", {x: this.iter/10, y:50*this.sim.calculateAvEnergy()});
			addData(myChart2, "", {x: this.iter/10, y:50*this.sim.calculateAvPos()});
			addData(myChart3, "", {x: this.iter/10, y:this.sim.calculateNorm()});
			//myChartaddData();
		}
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
var ctx = document.getElementById("myChart").getContext('2d');
var ctx2 = document.getElementById("myChart2").getContext('2d');
var ctx3 = document.getElementById("myChart3").getContext('2d');
var myChart = new Chart(ctx, {
    type: 'scatter',
	fontColor : "#ffa45e",
   data: {
      datasets: [{
         label: "Average energy",
		 data: [],
		 fillColor: "rgba(0, 138, 212,0.5)",
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
                    display: true,
					color: "#000000"
                },
                ticks: {
                  fontColor: "#000000",
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
                },
            }],
        }
    }    
});

var myChart2 = new Chart(ctx2, {
    type: 'scatter',
	fontColor : "#ffa45e",
   data: {
      datasets: [{
         label: "Average position",
		 data: [],
		 fillColor: "rgba(0, 138, 212,0.5)",
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
                    display: true,
					color: "#000000"
                },
                ticks: {
                  fontColor: "#000000",
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
                },
            }],
        }
    }    
});

var myChart3 = new Chart(ctx3, {
    type: 'scatter',
	fontColor : "#ffa45e",
   data: {
      datasets: [{
         label: "Norm",
		 data: [],
		 fillColor: "rgba(0, 138, 212,0.5)",
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
                    display: true,
					color: "#000000"
                },
                ticks: {
                  fontColor: "#000000",
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
var resetn = document.getElementById("reset_n");
resetn.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            abc.sim.n= (target.value);
		            abc.sim.setup();
					clearData(myChart);
					clearData(myChart2);
					clearData(myChart3);
					abc.iter = 0;
					var div = document.getElementById("sim_n_val");
					div.innerHTML = "$$n={" + e.target.value + "}$$";
					MathJax.Hub.Queue(["Typeset",MathJax.Hub,"sim_n_val"]);
					

});
var resetw = document.getElementById("reset_w");
resetw.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            abc.sim.omega= (target.value)/ 2.0 * Math.PI * Math.PI;
		            abc.sim.setup();
					clearData(myChart);
					clearData(myChart2);
					clearData(myChart3);
					abc.iter = 0;
					var div = document.getElementById("sim_w_val");
					div.innerHTML = "$$\\frac{" + e.target.value + "}{2}\\cdot \\pi^2$$";
					MathJax.Hub.Queue(["Typeset",MathJax.Hub,"sim_w_val"]);

});
var resetk = document.getElementById("reset_k");
resetk.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            abc.sim.kappa= (target.value);
		            abc.sim.setup();
					clearData(myChart);
					clearData(myChart2);
					clearData(myChart3);
					abc.iter = 0;
					var div = document.getElementById("sim_k_val");
					div.innerHTML = "$$\\kappa="+e.target.value+"$$";
					MathJax.Hub.Queue(["Typeset",MathJax.Hub,"sim_k_val"]);

});

var speed = document.getElementById("reset_speed");
speed.addEventListener("input", function(e) {
		            var target = (e.target) ? e.target : e.srcElement;
		            abc.sim.speed= (target.value);


});
if (WEBGL.isWebGLAvailable()) {
	animate();
			
}else {
	var warning = WEBGL.getWebGLErrorMessage();
	document.getElementById('canvas').appendChild(warning);
}



//Render.init();
//	Render.destroy();