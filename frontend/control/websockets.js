export default function webSockets() {
    let channel = location.search.split("=")[1]
    console.log('channel', channel)
    let server = runningLocally ? '192.168.0.17' : '206.189.62.180'
    let socket = new WebSocket(`ws://${server}:2001/`)

    function handleClick(direction) {
        // document.body.style.backgroundColor = 'red'
        socket.send(JSON.stringify(['direction', direction]))
    }

    socket.addEventListener('open', () => {
        console.log('websocket open')
        socket.send(JSON.stringify(['config', {channel: parseInt(channel), control: true}]))

    })
}