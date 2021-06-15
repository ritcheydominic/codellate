'use strict'

const path = require('path')
const { app, ipcMain, BrowserWindow } = require('electron')

var mainWindow
var auxWindows = []

// Prepare to display UI
function main() {
    // Create main window displaying signin page
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 650,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    })
    setMainWindowPage('signin')
}

function setMainWindowPage(page, arg) {
    mainWindow.loadFile(path.join('html', page + '.html'))
    if (arg) {
        mainWindow.webContents.on('did-finish-load', () => {
            mainWindow.webContents.send('will-render', arg)
        })
    }
    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })
}

function signOut() {
    mainWindow.webContents.send('will-sign-out', null)

    auxWindows.forEach(element => {
        element.webContents.send('will-sign-out', null)
    })

    setMainWindowPage('signin', null)
}

//
// App event handlers
//

// Prepare to display UI once backend is ready
app.on('ready', main)

// Quit client once all windows are closed
app.on('window-all-closed', function () {
    signOut()

    app.quit()
})

//
// Renderer process event handlers
//

ipcMain.on('sign-out', (event, arg) => {
    signOut()
})

ipcMain.on('set-user-email-address', (event, arg) => {
    global.userEmailAddress = arg
})

//
// UI event handlers
//

ipcMain.on('segue-to-forgot-password-page', (event, arg) => {
    setMainWindowPage('forgot-password', arg)
})

ipcMain.on('segue-to-signup-page', (event, arg) => {
    setMainWindowPage('signup', arg)
})

ipcMain.on('segue-to-signin-page', (event, arg) => {
    setMainWindowPage('signin', arg)
})

ipcMain.on('segue-to-dashboard-page', (event, arg) => {
    console.log('[MAIN] Dashboard segue requested (course ID ' + arg.courseId + ', user role ' + arg.userRole + ')')

    setMainWindowPage('dashboard', arg)
})

ipcMain.on('segue-to-join-first-course-page', (event, arg) => {
    setMainWindowPage('join-first-course', arg)
})