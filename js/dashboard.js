'use strict'

const $ = require('jquery')
const ipcRenderer = require('electron').ipcRenderer
const BrowserWindow = require('electron').remote.BrowserWindow
const remote = require('electron').remote
const { dialog } = require('electron').remote
const path = require('path')
const BackgroundService = require('../BackgroundService')
const AssignmentListItemHTMLBuilder = require('../AssignmentListItemHTMLBuilder')
const AssignmentInfoTabHTMLBuilder = require('../AssignmentInfoTabHTMLBuilder')
const AssignmentCommentsTabHTMLBuilder = require('../AssignmentCommentsTabHTMLBuilder')
const AssignmentSubmissionsTabHTMLBuilder = require('../AssignmentSubmissionsTabHTMLBuilder')
const AssignmentPaneHTMLBuilder = require('../AssignmentPaneHTMLBuilder')
const AuxiliaryWindow = require('../AuxiliaryWindow')
const fs = require('fs')

var courseId
var userRole
var assignments
var submissions
var comments
var currentActionTarget
var selectedAssignmentIndex
var selectedAssignmentPaneTabIndex
var currentActionPath

let addAssignmentButton = document.getElementById('add-assignment-btn')
let modifyAssignmentButton = document.getElementById('modify-assignment-btn')
let removeAssignmentButton = document.getElementById('remove-assignment-btn')
let navbarActionButtons = document.getElementById('navbar-action-btns')

let assignmentList = document.getElementById('assignment-list')

ipcRenderer.on('will-render', (event, arg) => {
    // Save course ID and user role info and modify HTML elements based on user role
    courseId = arg.courseId
    if (arg.userRole == 1) {
        userRole = 'STUDENT'
        displayElementsForStudent()
    } else if (arg.userRole == 2) {
        userRole = 'INSTRUCTOR'
        displayElementsForInstructor()
    }

    queryAssignments()
})

function displayElementsForStudent() {
    addAssignmentButton.hidden = true
    modifyAssignmentButton.hidden = true
    removeAssignmentButton.hidden = true
}

function displayElementsForInstructor() {}

ipcRenderer.on('did-query-assignments', (event, assignments) => {
    this.assignments = assignments
    if (userRole == 'STUDENT') {
        queryStudentSubmissions()
    } else if (userRole == 'INSTRUCTOR') {
        queryAllSubmissions()
    }
})

ipcRenderer.on('did-query-student-submissions', (event, submissions) => {
    this.submissions = submissions
    queryComments()
    // displayAssignmentElements(assignments, submissions, null)
})

ipcRenderer.on('did-query-all-submissions', (event, submissions) => {
    this.submissions = submissions
    queryComments()
    // displayAssignmentElements(assignments, submissions, null)
})

ipcRenderer.on('did-query-comments', (event, comments) => {
    this.comments = comments
    displayAssignmentElements(assignments, submissions, comments)
})

ipcRenderer.on('did-database-action-fail', (event, error) => {
    const renderDetails = {
        footerText: 'Codellate is experiencing some issues right now. Try again in a few minutes.',
        footerTextState: 'ERROR'
    }

    ipcRenderer.send('segue-to-signin-page', renderDetails)
})

function queryAssignments() {
    let databaseService = BackgroundService.spawn('database')
    databaseService.webContents.on('did-finish-load', () => {
        databaseService.webContents.send('query-assignments', courseId, BrowserWindow.getFocusedWindow().id)
    })
}

function queryStudentSubmissions() {
    let databaseService = BackgroundService.spawn('database')
    databaseService.webContents.on('did-finish-load', () => {
        databaseService.webContents.send('query-student-submissions', courseId, remote.getGlobal('userEmailAddress'), BrowserWindow.getFocusedWindow().id)
    })
}

function queryAllSubmissions() {
    let databaseService = BackgroundService.spawn('database')
    databaseService.webContents.on('did-finish-load', () => {
        databaseService.webContents.send('query-all-submissions', courseId, BrowserWindow.getFocusedWindow().id)
    })
}

function queryComments() {
    let databaseService = BackgroundService.spawn('database')
    databaseService.webContents.on('did-finish-load', () => {
        databaseService.webContents.send('query-comments', courseId, BrowserWindow.getFocusedWindow().id)
    })
}

function displayAssignmentElements(assignments, submissions, comments) {
    appendAssignmentPanes(assignments, submissions, comments)
    appendAssignmentListItems(assignments)
}

function appendAssignmentPanes(assignments, submissions, comments) {
    var assignmentInfoTabs
    var assignmentCommentsTabs
    var assignmentSubmissionsTabs
    if (userRole == 'STUDENT') {
        assignmentInfoTabs = AssignmentInfoTabHTMLBuilder.build(assignments, submissions, userRole)
        assignmentCommentsTabs = AssignmentCommentsTabHTMLBuilder.build(assignments, comments, userRole)
        assignmentSubmissionsTabs = null
    } else if (userRole == 'INSTRUCTOR') {
        assignmentInfoTabs = AssignmentInfoTabHTMLBuilder.build(assignments, null, userRole)
        assignmentCommentsTabs = AssignmentCommentsTabHTMLBuilder.build(assignments, comments, userRole)
        assignmentSubmissionsTabs = AssignmentSubmissionsTabHTMLBuilder.build(assignments, submissions)
    }

    let assignmentPanes = AssignmentPaneHTMLBuilder.build(assignmentInfoTabs, assignmentCommentsTabs, assignmentSubmissionsTabs, assignments, userRole)
    for (let pane of assignmentPanes) {
        document.getElementById('assignment-pane').append(pane)
    }
}

function appendAssignmentListItems(assignments) {
    let assignmentListItems = AssignmentListItemHTMLBuilder.build(assignments)
    assignmentListItems.forEach(element => {
        assignmentList.append(element)
    })
}

var $jq = jQuery.noConflict()
$jq(document).ready(function() {
    $jq(document).on('click', '.post-comment-btn', (event) => {
        event.preventDefault()

        let assignmentId = event.target.getAttribute('assignmentid')
        currentActionTarget = event.target
        event.target.disabled = true
        let commentText = document.getElementById('comment-text-box').value

        let databaseService = BackgroundService.spawn('database')
        databaseService.webContents.on('did-finish-load', () => {
            databaseService.webContents.send('add-comment', courseId, assignmentId, remote.getGlobal('userEmailAddress'), commentText, BrowserWindow.getFocusedWindow().id)
        })
    })

    $jq(document).on('click', '.download-assignment-materials-btn', (event) => {
        event.preventDefault()
        let assignmentId = event.target.getAttribute('assignmentid')
        currentActionTarget = event.target
        event.target.disabled = true
        event.target.innerHTML = '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Downloading materials...'
    
        let dialogOptions = {
            properties: ['openDirectory']
        }
    
        let toPath = dialog.showOpenDialogSync(dialogOptions)
        
        let objectStorageService = BackgroundService.spawn('object-storage')
        objectStorageService.webContents.on('did-finish-load', () => {
            objectStorageService.webContents.send('download-assignment-materials', courseId, assignmentId, toPath, BrowserWindow.getFocusedWindow().id)
        })
    })

    $jq(document).on('click', '.download-submission-btn', (event) => {
        event.preventDefault()
        let assignmentId = event.target.getAttribute('assignmentid')
        let submissionId = event.target.getAttribute('submissionid')
        currentActionTarget = event.target
        event.target.disabled = true
        event.target.innerHTML = '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Downloading...'
    
        let dialogOptions = {
            properties: ['openDirectory']
        }
    
        let toPath = dialog.showOpenDialogSync(dialogOptions)
    
        let objectStorageService = BackgroundService.spawn('object-storage')
        objectStorageService.webContents.on('did-finish-load', () => {
            objectStorageService.webContents.send('download-submission', courseId, assignmentId, submissionId, toPath, BrowserWindow.getFocusedWindow().id)
        })
    })

    $jq(document).on('click', '#assignment-list a', (event) => {
        selectedAssignmentIndex = $jq(event.target).index()
        
        if (userRole == 'INSTRUCTOR') {
            removeAssignmentButton.disabled = false
            modifyAssignmentButton.disabled = false
        }
    })

    $jq(document).on('click', '.add-submission-btn', (event) => {
        event.preventDefault()
        let assignmentId = event.target.getAttribute('assignmentid')
        currentActionTarget = event.target
        event.target.disabled = true
        event.target.innerHTML = '<span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>Adding submission...'
    
        let dialogOptions = {
            properties: ['openDirectory']
        }
    
        currentActionPath = dialog.showOpenDialogSync(dialogOptions)
    
        let databaseService = BackgroundService.spawn('database')
        databaseService.webContents.on('did-finish-load', () => {
            databaseService.webContents.send('add-submission-to-database', courseId, assignmentId, remote.getGlobal('userEmailAddress'), BrowserWindow.getFocusedWindow().id)
        })
    })

    $jq(document).on('click', '#remove-assignment-btn', (event) => {
        event.preventDefault()
        currentActionTarget = event.target
    
        let databaseService = BackgroundService.spawn('database')
        databaseService.webContents.on('did-finish-load', () => {
            databaseService.webContents.send('remove-assignment-from-database', courseId, assignments[selectedAssignmentIndex].id, BrowserWindow.getFocusedWindow().id)
        })
    })

    $jq(document).on('click', '#add-assignment-btn', (event) => {
        event.preventDefault()
        let newAssignmentWindow = AuxiliaryWindow.spawn('new-assignment')
        newAssignmentWindow.webContents.on('did-finish-load', () => {
            newAssignmentWindow.webContents.send('will-render', courseId, BrowserWindow.getFocusedWindow().id)
        })
    })

    $jq(document).on('click', '#modify-assignment-btn', (event) => {
        event.preventDefault()
        let modifyAssignmentWindow = AuxiliaryWindow.spawn('modify-assignment')
        let arg = {
            id: assignments[selectedAssignmentIndex].id,
            name: assignments[selectedAssignmentIndex].name,
            description: assignments[selectedAssignmentIndex].description,
            dueDate: assignments[selectedAssignmentIndex].date_due
        }
        modifyAssignmentWindow.webContents.on('did-finish-load', () => {
            modifyAssignmentWindow.webContents.send('will-render', courseId, arg, BrowserWindow.getFocusedWindow().id)
        })
    })
})

ipcRenderer.on('did-add-comment', (event, result) => {
    location.reload()
})

ipcRenderer.on('did-download-assignment-materials', (event, assignmentId) => {
    currentActionTarget.disabled = false
    currentActionTarget.innerHTML = 'Download materials'
})

ipcRenderer.on('did-download-submission', (event, assignmentId, submissionId) => {
    currentActionTarget.disabled = false
    currentActionTarget.innerHTML = 'Download'
})

ipcRenderer.on('did-add-submission-to-database', (event, assignmentId, submissionId) => {
    let objectStorageService = BackgroundService.spawn('object-storage')
    objectStorageService.webContents.on('did-finish-load', () => {
        objectStorageService.webContents.send('upload-submission', courseId, assignmentId, submissionId, currentActionPath, BrowserWindow.getFocusedWindow().id)
    })
})

ipcRenderer.on('did-upload-submission', (event, assignmentId, submissionId) => {
    location.reload()
})

ipcRenderer.on('did-remove-assignment-from-database', (event, assignmentId) => {
    // let objectStorageService = BackgroundService.spawn('object-storage')
    // objectStorageService.webContents.on('did-finish-load', () => {
    //     objectStorageService.webContents.send('delete-assignment', courseId, assignments[selectedAssignmentIndex].id, BrowserWindow.getFocusedWindow().id)
    // })

    location.reload()
})

ipcRenderer.on('did-delete-assignment', (event, assignmentId) => {
    location.reload()
})

ipcRenderer.on('did-finish-modifying-assignment', (event, result) => {
    console.log('Reloading page to refresh modified assignments...')
    location.reload()
})