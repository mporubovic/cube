import { Vector3, Object3D, Color, Mesh, BoxBufferGeometry, MeshPhongMaterial } from '../lib/three/build/three.module.js'
import * as TWEEN from '../lib/tween.js'

export default class Cube extends Mesh {
    constructor(world) {
        let geometry = new BoxBufferGeometry(1,1,1)
        let material = new MeshPhongMaterial({color: new Color('blue')})
        super(geometry, material)
        
        this.position.y = .5
        window.cube = this

        this.world = world

        this.rollState = {
            lock: false,
            pivot: new Vector3(0,0,0),
            lastDirection: null,
            prevAngle: 0,
            increment: 0,
        }


        this.DIRECTIONS = {
            FORWARD: {
                ROTATION_AXIS: new Vector3(1,0,0),
                PIVOT: new Vector3(0,0,1),
            },
            LEFT: {
                ROTATION_AXIS: new Vector3(0,0,-1),
                PIVOT: new Vector3(1,0,0),
            },
            BACKWARD: {
                ROTATION_AXIS: new Vector3(-1,0,0),
                PIVOT: new Vector3(0,0,-1),
            },
            RIGHT: {
                ROTATION_AXIS: new Vector3(0,0,1),
                PIVOT: new Vector3(-1,0,0),
            },
        }

        this.ORDERED_DIRECTIONS = ["FORWARD", "RIGHT", "BACKWARD", "LEFT"]
    }

    roll(dir, time) {
        if (this.rollState.lock) return
        this.rollState.lock = true

        let idx = this.ORDERED_DIRECTIONS.findIndex(d => d === dir) 
        idx -= this.world.rotationState.counter
        if (idx < 0) idx += 4
        let direction = this.ORDERED_DIRECTIONS[idx]
        

        this.rollState.increment = this.DIRECTIONS[direction].PIVOT

        if ((this.rollState.lastDirection === 'FORWARD' && direction === 'BACKWARD') 
                || (this.rollState.lastDirection === 'BACKWARD' && direction === 'FORWARD')
                || (this.rollState.lastDirection === 'LEFT' && direction === 'RIGHT')
                || (this.rollState.lastDirection === 'RIGHT' && direction === 'LEFT')
            ) 
        {
            // do nothing since pivot is the same when returning to the same spot
        }
    
        else {
            let position = this.position
    
            this.rollState.pivot = position.clone().add(this.rollState.increment.clone().multiplyScalar(.5))
        
            if (this.rollState.increment.x === 0) this.rollState.pivot.x = 0
            if (this.rollState.increment.y === 0) this.rollState.pivot.y = 0
            if (this.rollState.increment.z === 0) this.rollState.pivot.z = 0
        }
    
        this.world.playSound("rotate")
        
        new TWEEN.Tween({angle: 0}).to({angle: Math.PI/2}, time).onUpdate((data) => {
            let axis = this.DIRECTIONS[direction].ROTATION_AXIS
            let angle = data.angle - this.rollState.prevAngle
    
            this.position.sub(this.rollState.pivot)
            this.position.applyAxisAngle(axis, angle)
            this.position.add(this.rollState.pivot)
        
            this.rotateOnAxis(axis, angle)
            
            this.rollState.prevAngle = data.angle
        })
        .onComplete(() => {
            this.rollState.prevAngle = 0
            this.rollState.lastDirection = direction
            this.rotation.x = 0
            this.rotation.y = 0
            this.rotation.z = 0
    
            this.rollState.lock = false

            this.world.addTile(this.position.x, this.position.z)
    

    
        })
        .start()
    }

    setColor(color) {
        this.material.color = new Color(color)
    }
}