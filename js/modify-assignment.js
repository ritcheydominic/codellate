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

ipcRenderer.on('will-render', (event, arg, senderWindowId) => {
    this.courseId = courseId
    senderWindow = BrowserWindow.fromId(senderWindowId)
})