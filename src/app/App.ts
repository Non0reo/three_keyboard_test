import * as THREE from 'three';
import { animate } from 'animejs';
import { GLTFLoader, DRACOLoader, Line2, LineGeometry, LineMaterial, OrbitControls, type GLTF } from 'three/examples/jsm/Addons.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { Vec2, Vec3 } from '../types/vec'
import { ComputerScreen } from './ComputerScreen';


export class App {
	textInput: HTMLInputElement = document.querySelector('#computer-screen-textinput') as HTMLInputElement;

	renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
	scene: THREE.Scene = new THREE.Scene();
	camera: THREE.Camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	orbit: OrbitControls;

	mousePos: Vec2 | null = null;

	keyModel?: GLTF;
	modelScene: THREE.Object3D = new THREE.Object3D();
	mouseModel: THREE.Object3D = new THREE.Object3D();
	mouseCableCurve: THREE.CubicBezierCurve3 = new THREE.CubicBezierCurve3();
	mouseCableGeometry: LineGeometry = new LineGeometry();
	mouseCableMaterial: LineMaterial = new LineMaterial();

	computerScreen: ComputerScreen = new ComputerScreen();
	canvasTexture?: THREE.CanvasTexture;

	constructor() {
		this.renderer.setSize(window.innerWidth, window.innerHeight)
		document.querySelector('#app')?.appendChild(this.renderer.domElement);

		this.initScene();
		this.initEvents();

		this.camera.position.set(-1, 1, 2.5);
		this.orbit = new OrbitControls(this.camera, this.renderer.domElement)
		this.renderer.setAnimationLoop(this.update.bind(this));
	}

	update() {
		this.orbit.update();

		if(this.canvasTexture) this.canvasTexture.needsUpdate = true;

		this.renderer.render(this.scene, this.camera)
	}

	async initScene() {
		//environment
		const environment = new RoomEnvironment();
		const pmremGenerator = new THREE.PMREMGenerator( this.renderer );

		this.scene.background = new THREE.Color( 0x111111 );
		this.scene.environment = pmremGenerator.fromScene( environment, 0.04 ).texture;

		//light
		const light = new THREE.AmbientLight(new THREE.Color(0xffffff), 1);
		this.scene.add(light);

		//model
		const loader = new GLTFLoader();
		const dracoLoader = new DRACOLoader();
		dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
		loader.setDRACOLoader(dracoLoader);

		this.keyModel = await loader.loadAsync('models/seance2.glb');
		this.modelScene = this.keyModel.scene;
		this.scene.add( this.modelScene );
		console.log(this.modelScene)

		//keycaps
		const keysGroup = this.modelScene.getObjectByName('Keys') as THREE.Object3D;
		keysGroup.children.forEach(key => {
			key.userData = {basePos: JSON.parse(JSON.stringify(key.position)) as Vec3}
		})

		this.mouseModel = this.modelScene.getObjectByName('Mouse') as THREE.Object3D;
		this.mouseModel.userData = {basePos: JSON.parse(JSON.stringify(this.mouseModel.position)) as Vec3};
		console.log(this.mouseModel)
		console.log(this.modelScene.getObjectByName('MouseTip'))

		//mouse cable
		this.mouseCableCurve = new THREE.CubicBezierCurve3(
			this.mouseModel.position,
			new THREE.Vector3(0.7, 0, 0),
			new THREE.Vector3(1.5, 0, 0),
			this.modelScene.getObjectByName('ComputerCableTip')?.position,
		);

		const points = this.mouseCableCurve.getPoints( 50 ).map(point => [point.x, point.y, point.z]).flat();
		this.mouseCableGeometry.setPositions(points);
		this.mouseCableMaterial = new LineMaterial( {
			color: 0x776151,
			linewidth: 2, // in world units with size attenuation, pixels otherwise
			dashed: false,
		} );

		const curveObject = new Line2( this.mouseCableGeometry, this.mouseCableMaterial );
		this.scene.add(curveObject);


		//computer Screen
		this.canvasTexture = new THREE.CanvasTexture(this.computerScreen.application.canvas);
		const screenMesh = this.modelScene.getObjectByName('Screen') as THREE.Mesh;
		if (!screenMesh) throw new Error('No Screen Mesh');

		screenMesh.material = new THREE.MeshBasicMaterial({ map: this.canvasTexture })
	}

	initEvents() {
		window.addEventListener('keydown', (e: KeyboardEvent) => {
			if (e.code.match(/F\d/g)) e.preventDefault();
			const obj = this.modelScene.getObjectByName(e.code) as THREE.Mesh | undefined;
			if(!obj) return;
			
			animate(obj.position, {
				y: [obj.userData.basePos.y, -0.05],
				duration: 100,
				ease: 'outExpo',
				loop: 1,
				alternate: true,
			});
		});

		window.addEventListener('mousemove', (e: MouseEvent) => {
			if (this.mousePos === null) {
				this.mousePos = { x: e.x, y: e.y };
				return;
			}

			const basePos = this.mouseModel.userData.basePos as Vec3;
			const normalizedMousePos: THREE.Vector2 = new THREE.Vector2(
				this.mousePos.x / window.innerWidth,
				this.mousePos.y / window.innerHeight
			);

			const centerMouseVector = normalizedMousePos.sub(new THREE.Vector2(0.5, 0.5)).multiplyScalar(0.5);
			const displacedPos = new THREE.Vector2(basePos.x, basePos.z).add(centerMouseVector)

			this.mouseModel.position.x = displacedPos.x
			this.mouseModel.position.z = displacedPos.y;

			this.updateCurve();


			this.mousePos = { x: e.x, y: e.y }
		});

		window.addEventListener('DOMContentLoaded', () => this.textInput.focus())
		this.textInput.addEventListener('input', (e: InputEvent) => this.computerScreen.onInputChange(e) );
		this.textInput.addEventListener('change', (e: Event) => this.computerScreen.onInputEnter(e) );

	}
	
	
	updateCurve() {
		const mouseTip = this.modelScene.getObjectByName('MouseTip')
		if (!mouseTip) return;
	
		this.mouseCableCurve.v0 = mouseTip.getWorldPosition(new THREE.Vector3());
	
		const points = this.mouseCableCurve.getPoints( 50 ).map(point => [point.x, point.y, point.z]).flat();
		this.mouseCableGeometry.setPositions(points);
	}
}