
$(function () {
	var stats = initStats();
	var scene = new THREE.Scene();
	var renderer = new THREE.WebGLRenderer();

	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	var planeGeometry = new THREE.PlaneGeometry(100, 100);
	var planeMaterial = new THREE.MeshBasicMaterial({ color: 0x707070 });
	var plane = new THREE.Mesh(planeGeometry, planeMaterial);

	plane.rotation.x = -0.5 * Math.PI;
	plane.position.x = 15
	plane.position.y = 0
	plane.position.z = 0
	plane.receiveShadow = true;

	scene.add(plane);

	var staircase = new THREE.Object3D();

	var variables = new function () {
		this.stairAngleDiferences = 0;
		this.stairHeight = 18;
		this.stepCount = 10;
		this.stepGap = 1;
		this.stairRotation = 7
		this.redraw = function () {

			variables.stairRotation = variables.stairAngleDiferences / (variables.stepCount - 1);
			var multipartSome = variables.stairHeight / variables.stepCount / 2;
			variables.stepGap = multipartSome;
			stepThickness = multipartSome;


			scene.remove(staircase);
			var selectedObject = scene.getObjectByName('tubemesh');
			scene.remove(selectedObject);
			staircase = drawStairs();
			scene.add(staircase);
		}
	}

	variables.stairRotation = variables.stairAngleDiferences / (variables.stepCount - 1);
	variables.stepGap = variables.stairHeight / variables.stepCount / 2;
	stepThickness = variables.stepGap;

	staircase = drawStairs();
	scene.add(staircase);

	var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.x = -50;
	camera.position.y = 60;
	camera.position.z = 20;
	camera.lookAt(scene.position);

	var spotLight = new THREE.SpotLight(0xffffff);
	spotLight.position.set(-100, 100, 10);
	spotLight.target.position.set(0, 0, 0)
	spotLight.castShadow = true;
	spotLight.shadowMapWidth
	scene.add(spotLight);


	var ambientLight = new THREE.AmbientLight(0x0c0c0c, 2);
	scene.add(ambientLight);


	$("#WebGL-output").append(renderer.domElement);
	var cameraControls = new THREE.TrackballControls(camera, renderer.domElement);

	var gui = new dat.GUI();

	gui.add(variables, 'stepCount', 2, 30).step(1).name('Laiptų skaičius').onChange(variables.redraw);
	gui.add(variables, 'stairHeight', 5, 40).step(1).name('Laiptų aukštis').onChange(variables.redraw);
	gui.add(variables, 'stairAngleDiferences', -360, 360).step(1).name('Kampas').onChange(variables.redraw);
	render();

	function render() {
		stats.update();

		renderer.render(scene, camera);
		requestAnimationFrame(render);
		cameraControls.update();

	}

	function initStats() {

		var stats = new Stats();

		stats.setMode(0); // 0: fps, 1: ms

		stats.domElement.style.position = 'absolute';
		stats.domElement.style.left = '0px';
		stats.domElement.style.top = '0px';

		$("#Stats-output").append(stats.domElement);
		return stats;
	}


	function createStep() {
		var extrudeSettings = {
			depth: (1 - 0.25) / 2,
			bevelThickness: 0.25,
			bevelSize: 0.5,
			bevelSegments: 25,
			bevelEnabled: true,
			curveSegments: 20,
			steps: 4
		};

		var step = new THREE.ExtrudeGeometry(drawStep(8, 2), extrudeSettings);
		var stepMaterial = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
		var stepMesh = new THREE.Mesh(step, stepMaterial);


		stepMesh.rotation.z = Math.PI / 2;

		return stepMesh;
	}

	function drawStep(width, height) {
		var shape = new THREE.Shape();

		shape.moveTo(0, -height / 2);
		shape.lineTo(-width * 3 / 8, -height / 2);

		shape.lineTo(-width / 3, width / 6);

		shape.bezierCurveTo(0, height / 2, width / 2, 0, width / 2, -height / 2);

		shape.lineTo(width / 4, -height / 2);

		return shape;

	}

	function createMultiMaterialObject( geometry, materials ) {

		var group = new THREE.Group();

		for ( var i = 0, l = materials.length; i < l; i ++ ) {

			group.add( new THREE.Mesh( geometry, materials[ i ] ) );

		}

		return group;

	}

	function drawStairs() {
		var staircase = new THREE.Object3D();
		var stepSupportMaterial = new THREE.MeshLambertMaterial({ color: 0x778899, side: THREE.DoubleSide });
		var stepBottomSupportGeometry = new THREE.CylinderGeometry(0.5, 0.5, variables.stepGap, 34);
		var stepTopGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1 + 0.5, 34);
		var stepSupportReinforcementGeometry = new THREE.CubeGeometry(2 / 2 + 0.5, 0.5, 0.5 * 2);
		var nextX = 0;
		var nextY = 0;
		var pointsForRails = [];

		pointsForRails.push(new THREE.Vector3(0 - (2 / 2 + 0.5) * Math.cos(-(Math.PI / 180 * variables.stairRotation) * -1) + (8 / 2 + 0.25 * 4) * Math.sin(1 * -1 * (Math.PI / 180 * variables.stairRotation) * -1), 
		-1 * (1 + variables.stepGap) + 4 + variables.stepGap, 
		0 - (2 / 2 + 0.5) * Math.sin(-(Math.PI / 180 * variables.stairRotation) * -1) + 1 * -1 * (8 / 2 + 0.25 * 4) * Math.cos(1 * -1 * (Math.PI / 180 * variables.stairRotation) * -1)));

		for (var i = 0; i < variables.stepCount; i++) {
			var stepBase = createStep();
			stepBase.castShadow = true;

			if (i % 2 == 0) {
				stepBase.position.y = variables.stepGap + 1 / 2; 
				stepBase.rotation.x = Math.PI / 2;
			} else {
				stepBase.position.y = variables.stepGap ;
				stepBase.rotation.x = -Math.PI / 2;
			}

			var bottomSupport = new THREE.Mesh(stepBottomSupportGeometry, stepSupportMaterial);
			bottomSupport.castShadow = true;
			bottomSupport.position.y = variables.stepGap / 2;

			var topSupport = new THREE.Mesh(stepTopGeometry, stepSupportMaterial);
			topSupport.castShadow = true;
			topSupport.position.x = 2 / 2 + 0.5;
			topSupport.position.y = variables.stepGap - (0.5 / 2) + (1 + 0.5) / 2 - 0.5 / 2;

			var supportReinforcement = new THREE.Mesh(stepSupportReinforcementGeometry, stepSupportMaterial);
			supportReinforcement.castShadow = true;
			supportReinforcement.position.x = (2 / 2 + 0.5) / 2;
			supportReinforcement.position.y = variables.stepGap - 0.5 / 2;


			var points = [];
			points.push(new THREE.Vector3(0, variables.stepGap - 0.25, 1 * (-8 / 2 + 1)));
			points.push(new THREE.Vector3(0, variables.stepGap - 0.25, 1 * (-8 / 2)));
			points.push(new THREE.Vector3(0, variables.stepGap - 0.25, 1 * (-8 / 2 - 0.25 * 2)));
			points.push(new THREE.Vector3(0, variables.stepGap + 1 - 0.25, 1 * (-8 / 2 - 0.25 * 4)));
			points.push(new THREE.Vector3(0, variables.stepGap + 4, 1 * (-8 / 2 - 0.25 * 4)));

			var tubeGeometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 10, 0.25, 10, false);
			
			var mesh = createMultiMaterialObject(tubeGeometry, [stepSupportMaterial]);

			var step = new THREE.Object3D();
			step.add(stepBase);
			step.add(bottomSupport);
			step.add(topSupport);
			step.add(supportReinforcement);

			step.add(mesh);

			if (i == variables.stepCount - 1) {
				var lastplane = new THREE.Mesh(new THREE.PlaneGeometry(11, 11), new THREE.MeshBasicMaterial({ color: 0x8b5a2b }));
				lastplane.position.x = 5 + 2 / 2 + 0.5;
				lastplane.position.y = 0.01 + (1 + 0.5) / 2 + variables.stepGap - (0.5 / 2) + (1 + 0.5) / 2 - 0.5 / 2
				lastplane.rotation.x = -0.5 * Math.PI;
				lastplane.receiveShadow = false;
				step.add(lastplane)
			}


			step.position.y = i * (1 + variables.stepGap);
			step.position.x = nextX;
			step.position.z = nextY;
			step.rotation.y = (Math.PI / 180 * variables.stairRotation) * i;

			var railX = nextX + (8 / 2 + 0.25 * 4) * Math.sin(1 * -1 * (Math.PI / 180 * variables.stairRotation) * i);
			var railY = i * (1 + variables.stepGap) + 4 + variables.stepGap;
			var railZ = nextY + (1 * -1) * (8 / 2 + 0.25 * 4) * Math.cos(1 * -1 * (Math.PI / 180 * variables.stairRotation) * i);
			pointsForRails.push(new THREE.Vector3(railX, railY, railZ));

			step.name = 'step';
			staircase.add(step);



			nextX = nextX + (2 / 2 + 0.5) * Math.cos(-(Math.PI / 180 * variables.stairRotation) * i);
			nextY = nextY + (2 / 2 + 0.5) * Math.sin(-(Math.PI / 180 * variables.stairRotation) * i);
		}

		pointsForRails.push(new THREE.Vector3(nextX + (8 / 2 + 0.25 * 4) * Math.sin(1 * -1 * (Math.PI / 180 * variables.stairRotation) * variables.stepCount), 
		variables.stepCount * (1 + variables.stepGap) + 4 + variables.stepGap, 
		nextY + 1 * -1 * (8 / 2 + 0.25 * 4) * Math.cos(1 * -1 * (Math.PI / 180 * variables.stairRotation) * variables.stepCount)));

		var tubeGeometry1 = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pointsForRails), 100, 0.25, 30, false);
		var tubemesh = createMultiMaterialObject(tubeGeometry1, [new THREE.MeshLambertMaterial({ color: 0x778899, side: THREE.DoubleSide })]);
		tubemesh.name = 'tubemesh';
		scene.add(tubemesh);

		return staircase;

	}

});


