import './style.css'
import * as THREE from 'three';
import { animate } from 'animejs';
import { GLTFLoader, OrbitControls, type GLTF } from 'three/examples/jsm/Addons.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { HTMLMesh } from 'three/addons/interactive/HTMLMesh.js';


const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
const scene: THREE.Scene = new THREE.Scene();
const camera: THREE.Camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const orbit: OrbitControls = new OrbitControls(camera, renderer.domElement);

let keyModel: GLTF;

async function init() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.querySelector('#app')?.appendChild(renderer.domElement);

  const environment = new RoomEnvironment();
  const pmremGenerator = new THREE.PMREMGenerator( renderer );

  scene.background = new THREE.Color( 0xbbbbbb );
  scene.environment = pmremGenerator.fromScene( environment, 0.04 ).texture;

  const light = new THREE.AmbientLight(new THREE.Color(0xffffff), 1);
  scene.add(light);
  


  const loader = new GLTFLoader()
  keyModel = await loader.loadAsync('models/keys.glb');
  scene.add( keyModel.scene );
  // keyModel.scene.traverse(obj => {
  //   if(obj.name.includes('Key') && obj.type === 'Mesh') {
  //     const mesh = obj as THREE.Mesh;
  //     (mesh.material as THREE.MeshStandardMaterial).color = new THREE.Color(0xff0000);
  //   }
  // })


  const element = document.querySelector('#html-mesh') as HTMLDivElement;
  const mesh = new HTMLMesh( element );
  mesh.scale.multiplyScalar(100);
  element.hidden = true;
  scene.add( mesh );


  window.addEventListener('keydown', e => {
    const obj = keyModel.scene.getObjectByName(e.code) as THREE.Mesh | undefined;
    if(!obj) return;
    
    animate(obj.position, {
      y: [0, -1],
      duration: 100,
      ease: 'outExpo',
      loop: 1,
      alternate: true,
    })
  });

  camera.position.set(0, 10, 10);
  renderer.setAnimationLoop(update);
}

function update() {
  orbit.update();
  renderer.render(scene, camera)
}

init();