import { Injectable } from '@angular/core';
import { PerspectiveCamera,WebGLRenderer,DirectionalLight, Clock } from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

@Injectable({
  providedIn: 'root'
})
export class WindTurebinService {
  renderer: any = new WebGLRenderer({ antialias: true, alpha: true });
  size: any = {
    w: window.innerWidth,
    h: window.innerHeight,
  };
  fanModelData:any = {
    renderer: this.renderer,
    rendererSize: this.size,
    rendererDom: this.renderer.domElement,
    scene: null,
    camera: null,
    mixers: new Map(),
    compose: null,
    controls: null,
    mesh: null,
    turbineAnimation: null,
    CSSRender: new CSS2DRenderer(),
  };
  isInner: boolean = false; //true 机舱模型, false 风机模型
  matrixTurbine: any = null;
  equipment: any = null;
  wholeGroup: any = new THREE.Group();
  clock: any = new Clock();

  constructor() { }

  /**
   * 初始化init，加载相机、场景、灯光、控制器等
   * @param isInner 是否为机舱
   */
  init(isInner: boolean) {
    this.loadCamera(isInner);
    this.loadScene();
    this.loadControl();
    this.loadLight();
    if (isInner) {
      // this.loadCabinModel();
      // this.loadRenderer('three3D_2');
    } else {
      this.loadTurbine();
      this.loadRenderer('three3D_1');
    }
  }

  loadCamera(isInner: boolean) {
    const { w, h } = this.fanModelData.rendererSize;
    const camera:any = new PerspectiveCamera(40, w / h, 0.1, 500);
    camera.position.set(-2, 2, 2);
    camera.name = 'camera';
    this.fanModelData.camera = camera;
    if (!isInner) {
      this.action();
      this.animate();
    } else {
      camera.position.set(-0.8, 0, 0.2);
    }
  }

  /**
   * 聚焦功能
   */
  action() {
    let position = {};
    if (this.isInner) {
      position = { x: -0.8, y: 0, z: 0 };
    } else {
      position = { x: -2, y: 2, z: 2 };
    }
    const tweena = this.cameraMove(position, 4000);
    tweena.start();
  }

  /**
   *
   * @param position 移动的坐标位置
   * @param time 相机移动的时间
   * @returns
   */
  cameraMove(position: {}, time: number) {
    const p1 = { x: -20, y: 20, z: 2 };
    const tween1 = new TWEEN.Tween(p1).to(position, time).easing(TWEEN.Easing.Quadratic.InOut);
    tween1.onUpdate(() => {
      this.fanModelData.camera.position.set(p1.x, p1.y, p1.z);
      this.fanModelData.camera.lookAt(0, 0, 0);
    });
    return tween1;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    TWEEN.update();
  }

  /**
   * 加载场景
   */
  loadScene() {
    this.fanModelData.scene = new THREE.Scene();
  }

  loadControl() {
    const { camera, CSSRender } = this.fanModelData;
    // 通过OrbitControls.js可以对Threejs 的三维场景进行缩放，平移，旋转操作，其本质上改变的幷不是场景，而是相机的参数。
    let controls = new OrbitControls(camera, CSSRender.domElement);
    // controls.minDistance = 0.2;
    // controls.maxDistance = 3.0;
    // controls.maxPolarAngle = Math.PI / 2.5;
    this.fanModelData.controls = controls;
    this.fanModelData.controls.enablePan = false;
  }

  /**
   * 加载灯光
   */
  loadLight() {
    const arr = [
      [0, 1, 0],
      [0, -1, 0],
      [1, 0, 0],
      // [-1, 0, 0],
      [0, 0, 1],
      [0, 0, -1],
      [-0.5, -0.5, 0],
      [-0.5, 0.5, 0],
    ];
    arr.forEach((data) => {
      let [x, y, z] = data;
      const scene = this.fanModelData.scene;
      // var spotLight = new AmbientLight(0xffffff);
      var spotLight = new DirectionalLight(0xffffff);
      spotLight.position.set(x, y, z);
      spotLight.castShadow = true;
      spotLight.shadow.camera.near = 2;
      spotLight.shadow.camera.far = 200;
      spotLight.shadow.camera.left = -50;
      spotLight.shadow.camera.right = 50;
      spotLight.shadow.camera.top = 50;
      spotLight.shadow.camera.bottom = -50;
      // 距离和强度
      // spotLight.distance = 0;
      spotLight.intensity = 0.5;

      // 设置阴影的分辨率
      spotLight.shadow.mapSize.width = 1024;
      spotLight.shadow.mapSize.height = 1024;
      scene.add(spotLight);
    });
  }

  loadTurbine() {
    const loader = new GLTFLoader();
    loader.load('assets/model/风机3.glb', (object) => {
      console.log(object);
      this.matrixTurbine = object;
      let mesh = object.scene;

      mesh.traverse(function (child: any) {
        if (child.isMesh) {
          // child.frustumCulled = false;
          // //模型阴影
          // child.castShadow = true;
          // //模型自发光
          // child.material.emissive = child.material.color;
          child.material.emissiveMap = child.material.map;
        }
      });
      this.fanModelData.mesh = mesh;
      this.equipment = mesh;
      this.fanModelData.turbineAnimation = object.animations;
      let scale = 0.00025 * 1;
      mesh.scale.set(scale, scale, scale);
      mesh.rotateX(Math.PI / 2);
      mesh.rotateY(-Math.PI / 2);
      this.wholeGroup.add(mesh);
      mesh.position.set(0, 0, 0);
      setTimeout(() => {
        this.changeAnimation(mesh, 'animation_0');
      }, 100);
    });

    this.fanModelData.scene.add(this.wholeGroup);
    // $('#three3D_1')[0].addEventListener(
    //   'mousedown',
    //   this.onPointerClick.bind(this),
    //   true
    // );
  }

  /**
   * 添加和改变风机旋转动画
   * @param turbine
   * @param animationName
   */
  changeAnimation(turbine: any, animationName: any) {
    const animations = this.matrixTurbine?.animations;
    //AnimationMixer是场景中特定对象的动画播放器。当场景中的多个对象独立动画时，可以为每个对象使用一个AnimationMixer
    const mixer = new THREE.AnimationMixer(turbine);
    const clip = THREE.AnimationClip.findByName(
      //根据名称搜索动画剪辑(AnimationClip), 接收一个动画剪辑数组或者一个包含名为"animation"的数组的网格（或几何体）作为第一个参数。
      animations,
      animationName
    );
    const key = 'AA';
    if (clip) {
      const action = mixer.clipAction(clip);
      action.play();
      this.fanModelData.mixers.set(key, mixer);
    } else {
      this.fanModelData.mixers.delete(key);
    }
  }

  loadRenderer(id:string) {
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(this.size.w, this.size.h);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    const { size } = this;
    const { CSSRender } = this.fanModelData;
    CSSRender.setSize(size.w, size.h);
    CSSRender.domElement.style.position = 'absolute';
    CSSRender.domElement.style.top = '0px';
    document.getElementById(id)?.appendChild(CSSRender.domElement);
    document.getElementById(id)?.appendChild(this.renderer.domElement);
    this.render();
  }

  render() {
    const { scene, camera, compose, CSSRender } = this.fanModelData;
    if (scene && camera) {
      this.renderer.render(scene, camera);
      CSSRender.render(scene, camera);
    }
    var delta = new Clock().getDelta();
    compose && compose.render(delta);
    requestAnimationFrame(this.render.bind(this));
    const mixerUpdateDelta = this.clock.getDelta();
    this.fanModelData.mixers.forEach(
      (mixer: { update: (arg0: any) => void }) => {
        mixer.update(mixerUpdateDelta);
      }
    );
    TWEEN.update();
  }
}
