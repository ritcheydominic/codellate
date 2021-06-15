const { BrowserWindow } = require('electron').remote
const path = require('path')

class AuxiliaryWindow {
    static spawn(type) {
        let auxWindow = new BrowserWindow({
            width: 500,
            height: 600,
            show: false,
            webPreferences: {
                nodeIntegration: true
            }
        })
        auxWindow.loadFile(path.join('html', type + '.html'))
        auxWindow.once('ready-to-show', () => {
            auxWindow.show()
        })
        return auxWindow
    }
}

module.exports = AuxiliaryWindow