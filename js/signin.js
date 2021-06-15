'use strict'

const ipcRenderer = require('electron').ipcRenderer
const BrowserWindow = require('electron').remote.BrowserWindow
const path = require('path')
const BackgroundService = require('../BackgroundService')

const emailField = document.getElementById('email-input')
const passwordField = document.getElementById('password-input')
const signInButton = document.getElementById('sign-in-btn')

var emailAddress

document.getElementById('signin-form').addEventListener('submit', (event) => {
    event.preventDefault()

    displayElementsDuringSigninAttempt()

    // const authBackgroundService = BackgroundService.spawn('auth')

    let authServicePath = `file://${path.join(__dirname, '../html/svc-auth.html')}`
    let authService = new BrowserWindow({
        width: 400,
        height: 400,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    emailAddress = emailField.value

    authService.loadURL(authServicePath)
    authService.webContents.on('did-finish-load', () => {
        authService.webContents.send('attempt-signin', emailAddress, passwordField.value, BrowserWindow.getFocusedWindow().id)
    })
})

ipcRenderer.on('did-attempt-signin', (event, result, data) => {
    if (result == 'SUCCESS') {
        queryIsUserEnrolledInCourse()
    } else {
        displayElementsAfterSigninAttempt()

        if (data.message == 'User is not confirmed.') {
            setFooterText('You must verify your account before continuing. Check your email for further information.', 'INFO')
        } else {
            setFooterText('Those account credentials didn\'t work.', 'ERROR')
        }
    }
})

ipcRenderer.on('did-query-is-user-enrolled-in-course', (event, result, courseId, role) => {
    if (result == 'YES') {
        let segueDetails = {
            courseId: courseId,
            userRole: role
        }
        ipcRenderer.send('segue-to-dashboard-page', segueDetails)
    } else {
        ipcRenderer.send('segue-to-join-first-course-page', null)
    }
})

ipcRenderer.on('did-database-action-fail', (event, error) => {
    displayElementsAfterSigninAttempt()

    setFooterText('Codellate is experiencing some issues right now. Try again in a few minutes.', 'ERROR')
})

document.getElementById('forgot-password-btn').addEventListener('click', (event) => {
    ipcRenderer.send('segue-to-forgot-password-page', null)
})

document.getElementById('sign-up-btn').addEventListener('click', (event) => {
    ipcRenderer.send('segue-to-signup-page', null)
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

function queryIsUserEnrolledInCourse() {
    let databaseService = BackgroundService.spawn('database')
    databaseService.webContents.on('did-finish-load', () => {
        databaseService.webContents.send('query-is-user-enrolled-in-course', BrowserWindow.getFocusedWindow().id)
    })
}

function displayElementsDuringSigninAttempt() {
    emailField.disabled = true
    passwordField.disabled = true
    signInButton.disabled = true
    signInButton.innerHTML = '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Signing in...'
}

function displayElementsAfterSigninAttempt() {
    emailField.disabled = false
    passwordField.disabled = false
    signInButton.disabled = false
    signInButton.innerHTML = 'Sign in'
}

ipcRenderer.on('will-render', (event, arg) => {
    if (arg.footerText) {
        setFooterText(arg.footerText, arg.footerTextState)
    }
})