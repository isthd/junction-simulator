// vendor/three-bundle.js の元。作り直すとき：
//   npm i three@0.170.0 esbuild
//   npx esbuild three-bundle.entry.js --bundle --minify --format=iife --global-name=THREE3 --target=es2019 --outfile=three-bundle.js
// （できたファイルの先頭にライセンスのコメントを付ける）
export {
  WebGLRenderer, Scene, PerspectiveCamera, Color, Fog, HemisphereLight, DirectionalLight, AmbientLight,
  Mesh, InstancedMesh, BufferGeometry, BufferAttribute, Float32BufferAttribute, PlaneGeometry, BoxGeometry, CylinderGeometry,
  MeshLambertMaterial, MeshStandardMaterial, LineBasicMaterial, LineSegments, Group, Object3D, Vector3, Matrix4, Euler, Quaternion,
  DoubleSide, PCFSoftShadowMap, SRGBColorSpace, MathUtils, DynamicDrawUsage,
} from 'three';
export { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
