const AmazonCognitoIdentity = require('amazon-cognito-identity-js')
const AWS = require('aws-sdk')
const ipcRenderer = require('electron').ipcRenderer
const BrowserWindow = require('electron').remote.BrowserWindow
global.fetch = require('node-fetch')

const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool

let cognitoUserPoolDetails = {
    UserPoolId: 'us-east-2_lYlicjuXO',
    ClientId: '6o5gjp1jf9hku0t7nbmhptqjde'
}

let cognitoUserPoolRegion = 'us-east-2'

var senderWindow
var cognitoUserPool
var emailAddress

function setUpService(senderWindowId) {
    console.log('[SVC-AUTH] Auth service started')
    senderWindow = BrowserWindow.fromId(senderWindowId)
    cognitoUserPool = new AmazonCognitoIdentity.CognitoUserPool(cognitoUserPoolDetails)
}

function killService() {
    console.log('[SVC-AUTH] Killing auth service...')
    window.close()
}

function didSigninFail(error) {
    console.log('[SVC-AUTH] Signin attempt failed')
    console.log('[SVC-AUTH] ----- START SIGNIN ERROR -----')
    console.log(error.message)
    console.log('[SVC-AUTH] -----  END SIGNIN ERROR  -----')
    
    senderWindow.webContents.send('did-attempt-signin', 'FAILURE', error)
    killService()
}

function didSigninSucceed(data) {
    console.log('[SVC-AUTH] Signin attempt succeeded')

    ipcRenderer.send('set-user-email-address', emailAddress)
    senderWindow.webContents.send('did-attempt-signin', 'SUCCESS', data)
    killService()
}

function didAttemptSignup(error, data) {
    if (error) {
        console.log('[SVC-AUTH] Signup attempt failed')
        console.log('[SVC-AUTH] ----- START SIGNUP ERROR -----')
        console.log(error.message)
        console.log('[SVC-AUTH] -----  END SIGNUP ERROR  -----')

        senderWindow.webContents.send('did-attempt-signup', 'FAILURE', error)
    } else {
        console.log('[SVC-AUTH] Signup attempt succeeded')

        senderWindow.webContents.send('did-attempt-signup', 'SUCCESS', data)
    }
    killService()
}

ipcRenderer.on('attempt-signin', function(event, email, password, senderWindowId) {
    console.log('[SVC-AUTH] Signin attempt started')
    setUpService(senderWindowId)
    emailAddress = email

    let authDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: email,
        Password: password
    }) 
    let userDetails = {
        Username: email,
        Pool: cognitoUserPool
    }
    let callbackFunctionDetails = {
        onSuccess: didSigninSucceed,
        onFailure: didSigninFail
    }

    let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userDetails)
    cognitoUser.authenticateUser(authDetails, callbackFunctionDetails)
    console.log('[SVC-AUTH] Waiting for signin attempt response...')
})

ipcRenderer.on('attempt-signup', function(event, email, password, senderWindowId) {
    console.log('[SVC-AUTH] Signup attempt started')
    setUpService(senderWindowId)

    var userAttributeList = [];
    userAttributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name: 'email', Value: email}))

    cognitoUserPool.signUp(email, password, userAttributeList, null, didAttemptSignup)
    console.log('[SVC-AUTH] Waiting for signup attempt response...')
})