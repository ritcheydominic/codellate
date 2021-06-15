const s3 = require('s3')
const path = require('path')
const ipcRenderer = require('electron').ipcRenderer
const BrowserWindow = require('electron').remote.BrowserWindow

const s3Details = {
    s3Options: {
        accessKeyId: 'AKIAUP5KGGH4FUSTM55I',
        secretAccessKey: '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',
        region: 'us-east-2'
    }
}

var senderWindow
var s3Client

var courseId
var assignmentId
var submissionId

function setUpService(senderWindowId) {
    console.log('[SVC-OBJ-STORAGE] Object storage service started')
    senderWindow = BrowserWindow.fromId(senderWindowId)
    s3Client = s3.createClient(s3Details)
}

function killService() {
    console.log('[SVC-OBJ-STORAGE] Killing object storage service...')
    window.close()
}

function didObjectStorageActionFail(error) {
    console.log('[SVC-OBJ-STORAGE] Object storage action failed')
    console.log('[SVC-OBJ-STORAGE] ----- START OBJ STORAGE ACTION ERROR -----')
    console.log(error.message)
    console.log('[SVC-OBJ-STORAGE] -----  END OBJ STORAGE ACTION ERROR  -----')

    senderWindow.webContents.send('did-object-storage-action-fail', error)
    killService()
}

function didDownloadSubmission() {
    console.log('[SVC-OBJ-STORAGE] Download succeeded')
    senderWindow.webContents.send('did-download-submission', assignmentId, submissionId)
    killService()
}

ipcRenderer.on('download-submission', function(event, courseId, assignmentId, submissionId, toPath, senderWindowId) {
    setUpService(senderWindowId)
    this.courseId = courseId
    this.assignmentId = assignmentId
    this.submissionId = submissionId

    let downloaderOptions = {
        localDir: toPath.toString(),
        s3Params: {
            Bucket: 'codellate-test-1-course-' + courseId,
            Prefix: 'assignment-' + assignmentId + '/submission-' + submissionId
        }
    }

    console.log('[SVC-OBJ-STORAGE] Starting download...')
    let downloader = s3Client.downloadDir(downloaderOptions)
    downloader.on('error', didObjectStorageActionFail)
    downloader.on('end', didDownloadSubmission)
})

function didDownloadAssignmentMaterials() {
    console.log('[SVC-OBJ-STORAGE] Download succeeded')
    senderWindow.webContents.send('did-download-assignment-materials', assignmentId)
    killService()
}

ipcRenderer.on('download-assignment-materials', function(event, courseId, assignmentId, toPath, senderWindowId) {
    console.log('[SVC-OBJ-STORAGE] Download assignment materials request started')
    setUpService(senderWindowId)
    this.courseId = courseId
    this.assignmentId = assignmentId

    let downloaderOptions = {
        localDir: toPath.toString(),
        s3Params: {
            Bucket: 'codellate-test-1-course-' + courseId,
            Prefix: 'assignment-' + assignmentId + '/materials'
        }
    }

    console.log('[SVC-OBJ-STORAGE] Starting download...')
    let downloader = s3Client.downloadDir(downloaderOptions)
    downloader.on('error', didObjectStorageActionFail)
    downloader.on('end', didDownloadAssignmentMaterials)
})

function didUploadSubmission() {
    console.log('[SVC-OBJ-STORAGE] Upload succeeded')
    senderWindow.webContents.send('did-upload-submission', assignmentId, submissionId)
    killService()
}

ipcRenderer.on('upload-submission', function(event, courseId, assignmentId, submissionId, fromPath, senderWindowId) {
    console.log('[SVC-OBJ-STORAGE] Upload submission request started')
    setUpService(senderWindowId)
    this.courseId = courseId
    this.assignmentId = assignmentId
    this.submissionId = submissionId

    let uploaderOptions = {
        localDir: fromPath.toString(),
        s3Params: {
            Bucket: 'codellate-test-1-course-' + courseId,
            Prefix: 'assignment-' + assignmentId + '/submission-' + submissionId
        }
    }

    console.log('[SVC-OBJ-STORAGE] Starting upload...')
    let uploader = s3Client.uploadDir(uploaderOptions)
    uploader.on('error', didObjectStorageActionFail)
    uploader.on('end', didUploadSubmission)
})

function didDeleteAssignment() {
    console.log('[SVC-OBJ-STORAGE] Deletion succeeded')
    senderWindow.webContents.send('did-delete-assignment', assignmentId)
    killService()
}

ipcRenderer.on('delete-assignment', function(event, courseId, assignmentId, senderWindowId) {
    console.log('[SVC-OBJ-STORAGE] Delete assignment request started')
    setUpService(senderWindowId)
    this.courseId = courseId
    this.assignmentId = assignmentId

    let deleterOptions = {
        s3Params: {
            Bucket: 'codellate-test-1-course-' + courseId,
            Prefix: 'assignment-' + assignmentId
        }
    }

    console.log('[SVC-OBJ-STORAGE] Starting deletion...')
    let deleter = s3Client.deleteDir(deleterOptions)
    deleter.on('error', didObjectStorageActionFail)
    deleter.on('end', didDeleteAssignment)
})

function didUploadAssignmentMaterials() {
    console.log('[SVC-OBJ-STORAGE] Upload succeeded')
    senderWindow.webContents.send('did-upload-assignment-materials', assignmentId)
    killService()
}

ipcRenderer.on('upload-assignment-materials', function(event, courseId, assignmentId, fromPath, senderWindowId) {
    console.log('[SVC-OBJ-STORAGE] Upload assignment materials request started')
    setUpService(senderWindowId)
    this.courseId = courseId
    this.assignmentId = assignmentId

    let uploaderOptions = {
        localDir: fromPath.toString(),
        s3Params: {
            Bucket: 'codellate-test-1-course-' + courseId,
            Prefix: 'assignment-' + assignmentId + '/materials'
        }
    }

    console.log('[SVC-OBJ-STORAGE] Starting upload...')
    let uploader = s3Client.uploadDir(uploaderOptions)
    uploader.on('error', didObjectStorageActionFail)
    uploader.on('end', didUploadAssignmentMaterials)
})

ipcRenderer.on('reupload-assignment-materials', function(event, courseId, assignmentId, fromPath, senderWindowId) {
    // Dual action holding
})

