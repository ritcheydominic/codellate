'use strict'

const ipcRenderer = require('electron').ipcRenderer
const { BrowserWindow } = require('electron').remote
const path = require('path')
const BackgroundService = require('../BackgroundService')

const courseJoinCodeField = document.getElementById('course-join-code-input')
const joinCourseButton = document.getElementById('join-course-btn')

document.getElementById('join-course-form').addEventListener('submit', (event) => {
    event.preventDefault()

    displayElementsDuringJoinCourseAttempt()

    queryIsCourseJoinCodeValid()
})

document.getElementById('sign-out-btn').addEventListener('click', (event) => {
    ipcRenderer.send('sign-out', null)
})

function queryIsCourseJoinCodeValid() {
    let databaseService = BackgroundService.spawn('database')
    databaseService.webContents.on('did-finish-load', () => {
        databaseService.webContents.send('query-is-course-join-code-valid', courseJoinCodeField.value, BrowserWindow.getFocusedWindow().id)
    })
}

ipcRenderer.on('did-database-action-fail', (event, error) => {
    displayElementsAfterJoinCourseAttempt()

    setFooterText('Codellate is experiencing some issues right now. Try again in a few minutes.', 'ERROR')
})

function setFooterText(footerMessage, state) {
    let footerMessageDiv = document.getElementById('footer-msg-div')

    if (footerMessageDiv.hasChildNodes()) {
        footerMessageDiv.innerHTML = ''
    }

    let footerLabel = document.createElement('label')
    if (state == 'ERROR') {
        footerLabel.setAttribute('class', 'h6 mb-2 font-weight-normal text-danger')
    } else {
        footerLabel.setAttribute('class', 'h6 mb-2 font-weight-normal')
    }
    footerLabel.textContent = footerMessage

    footerMessageDiv.append(footerLabel)
}

function displayElementsDuringJoinCourseAttempt() {
    courseJoinCodeField.disable = true
    joinCourseButton.disabled = true
    joinCourseButton.innerHTML = '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Joining course...'
}

function displayElementsAfterJoinCourseAttempt() {
    courseJoinCodeField.disabled = false
    joinCourseButton.disabled = false
    joinCourseButton.innerHTML = 'Join course'
}

ipcRenderer.on('did-query-is-course-join-code-valid', (event, result, courseId, role) => {
    if (result == 'YES') {
        let databaseService = BackgroundService.spawn('database')
        databaseService.webContents.on('did-finish-load', () => {
            databaseService.webContents.send('attempt-add-course-enrollment', courseId, role, BrowserWindow.getFocusedWindow().id)
        })
    } else {
        displayElementsAfterJoinCourseAttempt()
        setFooterText('That course join code didn\'t work.', 'ERROR')
    }
})

ipcRenderer.on('did-attempt-add-course-enrollment', (event, result, courseId, role) => {
    let segueDetails = {
        courseId: courseId,
        userRole: role
    }
    ipcRenderer.send('segue-to-dashboard-page', segueDetails)
})