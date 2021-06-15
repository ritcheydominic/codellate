const { BrowserWindow } = require('electron').remote
const path = require('path')

class BackgroundService {
    static spawn(type) {
        let serviceWindow = new BrowserWindow({
            width: 400,
            height: 400,
            show: false,
            webPreferences: {
                nodeIntegration: true
            }
        })
        console.log('OK 3')
        serviceWindow.loadFile(path.join('html', 'svc-' + type + '.html'))
        return serviceWindow
    }
}

module.exports = BackgroundService