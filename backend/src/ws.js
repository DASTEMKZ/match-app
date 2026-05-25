const clients = new Set()

export function wsHandler(connection) {
  clients.add(connection.socket)
  connection.socket.on('close', () => clients.delete(connection.socket))
}

export function broadcast(event, data) {
  const msg = JSON.stringify({ event, data })
  for (const client of clients) {
    if (client.readyState === 1) client.send(msg)
  }
}
