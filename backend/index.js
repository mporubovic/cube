const WebSocketServer = require('ws').Server
const server = new WebSocketServer({port: 2001})

server.on('connection', (client, request) => {
    
    client.on('message', (_data) => {
        let data = JSON.parse(_data)

        if (data.type === "config") {
            client.channel = data.channel
            client.control = data.control
            
            let controlsOnChannel = 0
            server.clients.forEach(c => {
                if (c.channel === client.channel && c.control) {
                    controlsOnChannel++
                } 
            })

            if (controlsOnChannel > 0) { // if a controller is already joined, notify the cube client
                client.send(
                    JSON.stringify(
                        {
                            type: "event",
                            event: "control-already-joined"
                        }
                    )
                )
            }
        }

        server.clients.forEach(c => {
            if (c.channel === client.channel && c !== client) c.send(_data) 
        })
    })

    client.on('close', () => { // when a controller disconnects, notify the cube client
        if (client.control) {
            server.clients.forEach(c => {
                if (c.channel === client.channel && c !== client) {
                    c.send(
                        JSON.stringify(
                            {
                                type: "event",
                                event: "control-disconnect"
                            }
                        )
                    )
                } 
            })
        }
    })

})