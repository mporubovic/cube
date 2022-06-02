import TWEEN from '../lib/tween.js'

let r1 = 300
let r2 = 120

// let joystick = document.querySelector('#joystick')
// let joystickBackground = document.querySelector('#joystick-background')
let joystickCircle = document.querySelector('#joystick-circle')

joystickCircle.style.left = r1-r2 +'px'
joystickCircle.style.top = r1-r2 +'px'


window.addEventListener('resize', () => {
    setCenter()
})

let center
function setCenter() {
    center = {
        x: window.innerWidth/2,
        y: window.innerHeight/2
    }
}
setCenter()


let joystickActive = false

joystickCircle.addEventListener('pointerdown', () => {
    joystickActive = true
})

let x, y = 0

window.addEventListener('pointerup', () => {
    if (!joystickActive) return
    joystickActive = false

    if (interval) clearInterval(interval)
    d = null


    let position = {
        x,
        y
    }


    new TWEEN.Tween(position).to({x:0, y:0}, 500).onUpdate(() => {
        joystickCircle.style.transform = `translate(${position.x}px, ${-position.y}px)`
    }).easing(TWEEN.Easing.Elastic.Out).start()

})

let pointerX, pointerY
let direction, angle, magnitude


window.addEventListener('pointermove', (e) => {
    if (!joystickActive) return

    pointerX = e.clientX - center.x
    pointerY = -(e.clientY - center.y) // y positive up

    let m = pointerY / pointerX
    if (m === Infinity || m === -Infinity) m = 99999

    let r = r1

    let solutionOne, solutionTwo

    {
        let x = Math.sqrt( (1 + m*m) * (r*r) ) / (1 + m*m)
        let y = m*x
        solutionOne = {x, y}
    }

    {
        let x = -solutionOne.x
        let y = m*x
        solutionTwo = {x, y}
    }

    let distanceToSolutionOne = Math.sqrt( Math.pow(pointerX - solutionOne.x, 2) + Math.pow(pointerY - solutionOne.y, 2) )
    let distanceToSolutionTwo = Math.sqrt( Math.pow(pointerX - solutionTwo.x, 2) + Math.pow(pointerY - solutionTwo.y, 2) )

    x = pointerX
    y = pointerY

    if (distanceToSolutionOne < distanceToSolutionTwo) {
        if (Math.abs(pointerX) > Math.abs(solutionOne.x)) x = solutionOne.x
        if (Math.abs(pointerY) > Math.abs(solutionOne.y)) y = solutionOne.y
    } 
    else {
        if (Math.abs(pointerX) > Math.abs(solutionTwo.x)) x = solutionTwo.x
        if (Math.abs(pointerY) > Math.abs(solutionTwo.y)) y = solutionTwo.y
    }

    joystickCircle.style.transform = `translate(${x}px, ${-y}px)`

    angle = Math.atan2(x, y) * (180/Math.PI)
    if (angle < 0) angle += 360

    if (angle <= 45 || angle > 315 ) direction = 'FORWARD'
    else if (angle > 45 && angle <= 135) direction = 'RIGHT'
    else if (angle > 135 && angle <= 225) direction = 'BACKWARD'
    else if (angle > 225 && angle <= 315) direction = 'LEFT'

    magnitude = Math.sqrt(x*x + y*y)

    setDirection(direction, magnitude)
})



function tick() {
    TWEEN.update()
    requestAnimationFrame(tick)
}
requestAnimationFrame(tick)

let channel = runningLocally ? 1 : location.search.split("=")[1]

console.log('channel', channel)
let server = runningLocally ? ip : 'cube.porubovic.sk'
let socket = new WebSocket(`wss://${server}/ws/?channel=${channel}?control=true`)

let cooldown = false

let lastDirection, lastTime
let interval, time
// let direction, duration
let t, d


function setDirection(direction, magnitude) {
    time = (1/(Math.round(magnitude)/2)) * 15000
    time = Math.min(500, time)

    d = direction
    t = time
    
    if (!lastDirection && lastTime > time*0.8 && lastTime < time*1.2 && direction === lastDirection) {
        return
    }

    lastDirection = direction
    lastTime = time
}

setInterval(() => {
    if (d && t) sendDirection(d, Math.round(t))
}, lastTime);




document.querySelector('#zoom-in')
        .addEventListener('pointerdown', () => {
            sendMessage({
                type: "command",
                command: "zoom",
                in: true,
            })
})

document.querySelector('#zoom-out')
        .addEventListener('pointerdown', () => {
            sendMessage({
                type: "command",
                command: "zoom",
                in: false,
            })
})

document.querySelector('#color-red')
        .addEventListener('pointerdown', () => {
            sendMessage({
                type: "command",
                command: "color",
                cube: "red",
                tile: "#ff5b5b"
            })
})
document.querySelector('#color-blue')
        .addEventListener('pointerdown', () => {
            sendMessage({
                type: "command",
                command: "color",
                cube: "blue",
                tile: "lightskyblue"
            })
})
document.querySelector('#color-orange')
        .addEventListener('pointerdown', () => {
            sendMessage({
                type: "command",
                command: "color",
                cube: "orange",
                tile: "#ffb939"
            })
})

document.querySelector('#rotate')
        .addEventListener('pointerdown', () => {
            sendMessage({
                type: "command",
                command: "rotate",
            })
})


function sendDirection(direction, time) {
    sendMessage({
        type: "command",
        command: "roll",
        direction,
        time
    })
}


function sendMessage (msg) {
    socket.send(JSON.stringify(msg))
}


socket.addEventListener('open', () => {
    console.log('websocket open')
    sendMessage({
        type: "config",
        channel: parseInt(channel), 
        control: true
    })

})