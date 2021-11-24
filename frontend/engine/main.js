import Connection from "./connection.js"
import World from "./world.js"

const world = new World
const connection = new Connection(world)

world.startRender()

new QRCode('qrcode', {
    text: `http://${runningLocally ? '10.14.148.88' :  connection.server}/control/index.html?channel=`+connection.channel,
    width: 200,
    height: 200
})

let soundButton = document.querySelector('#sound-button')
soundButton.addEventListener('click', () => soundButton.parentElement.removeChild(soundButton))