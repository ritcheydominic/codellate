const { ipcRenderer } = require('electron')

document.getElementById('back-btn').addEventListener('click', (event) => {
    ipcRenderer.send('segue-to-signin-page', null)
})