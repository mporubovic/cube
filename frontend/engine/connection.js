export default class Connection {
    constructor(world) {
        this.server = runningLocally ? '127.0.0.1' : 'cube.porubovic.sk'
        console.log('Connecting to WebSocket server', this.server)

        this.socket = new WebSocket(`wss://${this.server}/ws/`)
        window.socket = this.socket

        this.channel = runningLocally ? 1 : Math.round(Math.random() * 1000000)
        console.log('Joining channel', this.channel)

        this.socket.addEventListener('message', (msg) => this._processMessage(msg))
        this.socket.addEventListener('open', () => this._openConnection())

        this.world = world
    }

    sendMessage(msg) {
        this.socket.send(JSON.stringify(msg))

    }

    _openConnection() {
        console.log("Joined channel", this.channel)

        this.sendMessage({
            type: "config",
            channel: this.channel,
            control: false
        })
    }


    _processMessage(msg) {
        let data = JSON.parse(msg.data)

        switch (data.type) {
            case "event":
                switch (data.event) {
                    case "control-disconnect":
                        console.log('Controller disconnected')
                        this.__toggleOverlay()
                        
                        break

                    case "control-already-joined":
                        console.log('Controller connected ')
                        this.__onControllerJoin()

                        break
                }
                
                break
    
            case "config":
                if (data.control) {
                    console.log('Controller connected')
                    this.__onControllerJoin()
                }
                break
        
            case "command":
                switch (data.command) {
                    case "roll":
                        this.world.rollCube(data.direction, data.time)
                        break
    
                    case "zoom":
                        this.world.zoom(data.in)
                        break
    
                    case "color":
                        this.world.setColor(data.cube, data.tile)
    
                        break
                    case "rotate":
                        this.world.rotate()
    
                        break
                
                    default:
                        break;
                }
                break
        }
    }

    __onControllerJoin() {
        this.__toggleOverlay()
        this.world.playSound("welcome")
    }

    __toggleOverlay() {
        let overlay = document.querySelector('#overlay')

        if (overlay.style.display === "none") {
            overlay.style.display = null
        }
        else {
            overlay.style.display = "none"
        }
    }
}