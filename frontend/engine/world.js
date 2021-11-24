import { AmbientLight, BoxBufferGeometry, Color, GridHelper, Mesh, MeshPhongMaterial, PerspectiveCamera, Scene, WebGLRenderer, Vector3, Vector2, PointLight, Object3D, Matrix3, PlaneBufferGeometry, DirectionalLight } from "../lib/three/build/three.module.js"
import {OrbitControls} from "../lib/three/OrbitControls.js"
import Stats from "../lib/stats.module.js"


import * as TWEEN from '../lib/tween.js'
import Cube from "./Cube.js"



export default class World {
    constructor() {
        window.world = this

        this.renderer = new WebGLRenderer({antialias: true, canvas: document.querySelector("#canvas")})

        this.scene = this._setupScene()
        this.camera = this._setupCamera()


        this.tileColor = new Color("lightskyblue")

        this.rotationState = {
            rotating: false,
            counter: 0
        }

        this.SOUNDS = {
            rotate: new Audio('sounds/SFX_UIGeneric4.wav'),
            welcome: new Audio('sounds/SFX_UIGeneric1.wav'),
            changeColor: new Audio('sounds/SFX_UIGeneric3.wav'),
            pop: new Audio('sounds/SFX_UIGeneric13.wav'),
        }


        this.stats = new Stats
        document.body.appendChild(this.stats.domElement)

        this.cube = new Cube(this)
        this.scene.add(this.cube)
    }

    rollCube(direction, duration) {
        this.cube.roll(direction, duration)
    }

    addTile(x, z) {
        let tileClone = this._createTile(this.tileColor)
        
        tileClone.position.x = x 
        tileClone.position.z = z

        this.scene.add(tileClone)
    }

    setColor(cube, tile) {
        this.tileColor = new Color(tile)
        this.cube.setColor(cube)

        this.playSound("changeColor")
    }



    zoom(_in) {
        new TWEEN.Tween({zoom: { a: 0 } }).to({a: 5}, 500).onUpdate(() => {
            this.camera.controls.zoomInOut(_in ? 0.99 : 1.01)
        }).start()

        this.playSound("pop")
    }

    rotate() {
        if (this.rotationState.rotating) return
        this.rotationState.rotating = true
        
        new TWEEN.Tween(scene.rotation)
                .to({x:0, y: this.scene.rotation.y - Math.PI/2}, 500)
                .onComplete(() => this.rotationState.rotating = false)
                .start()
                
        this.rotationState.counter < 3 ? this.rotationState.counter++ : this.rotationState.counter = 0

        this.playSound("pop")
    }

    playSound(sound) {
        try {
            this.SOUNDS[sound].currentTime = 0 
            this.SOUNDS[sound].play()
        } catch (e) {
            console.log("Unable to play sound; interact with the DOM to enable sound.")
        }
    }

    _createTile(color) {
        let geometry = new BoxBufferGeometry(1,.01,1)
        let material = new MeshPhongMaterial({color: new Color(color)})
        return new Mesh(geometry, material)
    }


    _setupScene() {
        let scene = new Scene
        scene.background = new Color('white')
        window.scene = scene

        let ambientLight = new AmbientLight(new Color('#FFFFFF'), .5)
        scene.add(ambientLight)

        let directionalLight = new DirectionalLight(new Color('white'), 1)
        directionalLight.position.x = -1
        directionalLight.position.y = 2
        directionalLight.position.z = 3
        scene.add(directionalLight)

        let grid = new GridHelper(101, 101, new Color('black'))
        scene.add(grid)

        return scene
    }

    _setupCamera() {
        let aspect = window.innerWidth / window.innerHeight

        let camera = new PerspectiveCamera(45, aspect, 1, 500)
        window.camera = camera

        camera.position.z = -10
        camera.position.y = 15

        let controls = new OrbitControls(camera, this.renderer.domElement)
        camera.controls = controls
        window.controls = controls

        controls.screenSpacePanning = false
        controls.enableDamping = true
        controls.dampingFactor = 0.2;
        controls.enableRotate = false

        return camera
    }



    _render() {
        this.renderer.render(this.scene, this.camera)
        this.camera.controls.update()
    
        this.stats.update()
        TWEEN.update()
    
        this.__resizeRendererToViewportSize()
    
        requestAnimationFrame(this._render.bind(this))
    }

    __resizeRendererToViewportSize() {
        let pixelRatio = window.devicePixelRatio
        let width = this.renderer.domElement.clientWidth * pixelRatio | 0
        let height = this.renderer.domElement.clientHeight * pixelRatio | 0
        let resize = this.renderer.domElement.width !== width || this.renderer.domElement.height !== height
        if (resize) {
            this.renderer.setSize(width, height, false)
            this.camera.aspect = this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight
            this.camera.updateProjectionMatrix()
        }
    }

    startRender() {
        requestAnimationFrame(this._render.bind(this))
    }


}