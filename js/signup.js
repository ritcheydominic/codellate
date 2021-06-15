const { BrowserWindow } = require('electron').remote
const ipcRenderer = require('electron').ipcRenderer
const BackgroundService = require('../BackgroundService')

const emailField = document.getElementById('email-input')
const passwordField = document.getElementById('password-input')
const confirmPasswordField = document.getElementById('confirm-password-input')
const signUpButton = document.getElementById('sign-up-btn')

document.getElementById('back-btn').addEventListener('click', (event) => {
    ipcRenderer.send('segue-to-signin-page', null)
})

document.getElementById('signup-form').addEventListener('submit', (event) => {
    event.preventDefault()

    displayElementsDuringSignupAttempt()

    if (passwordField.value != confirmPasswordField.value) {
        setFooterText('The passwords you entered don\'t match.', 'ERROR')
        displayElementsAfterSignupAttempt()
        return
    }

    let authService = BackgroundService.spawn('auth')
    authService.webContents.on('did-finish-load', () => {
        authService.webContents.send('attempt-signup', emailField.value, passwordField.value, BrowserWindow.getFocusedWindow().id)
    })
})

ipcRenderer.on('did-attempt-signup', (event, result, data) => {
    if (result == 'SUCCESS') {
        const renderDetails = {
            footerText: 'You must verify your account before continuing. Check your email for further information.',
            footerTextState: 'INFO'
        }

        ipcRenderer.send('segue-to-signin-page', renderDetails)
    } else {
        displayElementsAfterSignupAttempt()
        setFooterText('Codellate is experiencing some issues right now. Try again in a few minutes.', 'ERROR')
    }
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

function displayElementsDuringSignupAttempt() {
    emailField.disabled = true
    passwordField.disabled = true
    confirmPasswordField.disable = true
    signUpButton.disabled = true
    signUpButton.innerHTML = '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Signing up...'
}

function displayElementsAfterSignupAttempt() {
    emailField.disabled = false
    passwordField.disabled = false
    confirmPasswordField.disabled = false
    signUpButton.disabled = false
    signUpButton.innerHTML = 'Sign up'
}