const id = window.location.pathname.split('/').slice(-1)[0]
const query = {
  id
}
const socket = io(window.location.host, query);
socket.on('connect', function() {
  console.log('client.socket connected socketId=' + query.id)
  showPId(query.id)
})

function showPId(id) {
  document.getElementById('participantId').innerText = id
}

