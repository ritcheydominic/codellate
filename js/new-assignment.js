const ipcRenderer = require('electron').ipcRenderer
const { BrowserWindow } = require('electron').remote
const path = require('path')
const BackgroundService = require('../BackgroundService')
const { dialog } = require('electron').remote

const nameField = document.getElementById('assignment-name-input')
const descriptionField = document.getElementById('assignment-description-input')
const dateDueField = document.getElementById('assignment-date-due-input')

const uploadMaterialsButton = document.getElementById('upload-materials-btn')
const addAssignmentButton = document.getElementById('add-assignment-btn')

var assignmentId
var courseId
var senderWindow

uploadMaterialsButton.addEventListener('click', (event) => {
    event.preventDefault()
    uploadMaterialsButton.disabled = true
    uploadMaterialsButton.innerHTML = '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Uploading materials...'
    
    let dialogOptions = {
        properties: ['openDirectory']
    }
    
    let fromPath = dialog.showOpenDialogSync(dialogOptions)
    assignmentId = Math.floor((Math.random() * 999999999) + 1)

    let objectStorageService = BackgroundService.spawn('object-storage')
    objectStorageService.webContents.on('did-finish-load', () => {
        objectStorageService.webContents.send('upload-assignment-materials', courseId, assignmentId, fromPath, BrowserWindow.getFocusedWindow().id)
    })
})

addAssignmentButton.addEventListener('click', (event) => {
    event.preventDefault()
    let databaseService = BackgroundService.spawn('database')
    console.log(dateDueField.value)
    databaseService.webContents.on('did-finish-load', () => {
        databaseService.webContents.send('add-assignment-to-database', courseId, assignmentId, nameField.value, descriptionField.value, dateDueField.value, BrowserWindow.getFocusedWindow().id)
    })
})

ipcRenderer.on('did-upload-assignment-materials', (event, result) => {
    uploadMaterialsButton.innerHTML = 'Materials uploaded'
    addAssignmentButton.disabled = false
})

ipcRenderer.on('did-add-assignment-to-database', (event, result) => {
    senderWindow.webContents.send('did-finish-modifying-assignment', 'SUCCESS')
    window.close()
})

ipcRenderer.on('will-render', (event, courseId, senderWindowId) => {
    this.courseId = courseId
    senderWindow = BrowserWindow.fromId(senderWindowId)
})