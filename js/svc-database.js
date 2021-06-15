const mysql = require('mysql')
const ipcRenderer = require('electron').ipcRenderer
const BrowserWindow = require('electron').remote.BrowserWindow
const remote = require('electron').remote
const moment = require('moment')

let globalDatabaseDetails = {
    host: '8.12.16.113',
    user: 'codellate',
    password: 'H@p7D4TUnqe*iF9zj5Rr*ZVrPji',
    database: 'codellate_test_1_global',
    timezone: moment().format('Z')
}

var senderWindow
var globalDatabase
// var institutionDatabase
var courseDatabase
var arg

function setUpService(senderWindowId) {
    console.log('[SVC-DATABASE] Database service started')
    senderWindow = BrowserWindow.fromId(senderWindowId)
    globalDatabase = mysql.createConnection(globalDatabaseDetails)
    if (arg && arg.courseId) {
        courseDatabase = mysql.createConnection({
            host: '8.12.16.113',
            user: 'codellate',
            password: 'H@p7D4TUnqe*iF9zj5Rr*ZVrPji',
            database: 'codellate_test_1_course_' + arg.courseId,
            timezone: moment().format('Z')
        })
    }
}

function killService() {
    console.log('[SVC-DATABASE] Killing database service...')
    window.close()
}

function didDatabaseConnectionFail(error) {
    console.log('[SVC-DATABASE] Database connection failed')
    console.log('[SVC-DATABASE] ----- START DATABASE CONNECTION ERROR -----')
    console.log(error)
    console.log('[SVC-DATABASE] -----  END DATABASE CONNECTION ERROR  -----')

    senderWindow.webContents.send('did-database-action-fail', error)
    killService()
}

function didDatabaseQueryFail(error) {
    console.log('[SVC-DATABASE] Database query failed')
    console.log('[SVC-DATABASE] ----- START DATABASE QUERY ERROR -----')
    console.log(error)
    console.log('[SVC-DATABASE] -----  END DATABASE QUERY ERROR  -----')

    senderWindow.webContents.send('did-database-action-fail', error)
    killService()
}

function queryIsUserEnrolledInCourse(error) {
    if (error) {
        didDatabaseConnectionFail(error)
    } else {
        console.log('[SVC-DATABASE] Global database connection succeeded')
        console.log('[SVC-DATABASE] Executing \"Is user enrolled in a course as a student?\" query...')
        globalDatabase.query('SELECT course_id FROM enrollments_as_student where email_address = \'' + remote.getGlobal('userEmailAddress') + '\'', didQueryIsUserEnrolledInCourseAsStudent)
    }
}

function didQueryIsUserEnrolledInCourseAsStudent(error, result, fields) {
    if (error) {
        didDatabaseQueryFail(error)
    } else {
        if (result[0] === undefined) {
            console.log('[SVC-DATABASE] \"Is user enrolled in a course as a student?\" query returned no results')
            console.log('[SVC-DATABASE] Executing \"Is user enrolled in a course as an instructor?\" query...')
            globalDatabase.query('SELECT course_id FROM enrollments_as_instructor where email_address = \'' + remote.getGlobal('userEmailAddress') + '\'', didQueryIsUserEnrolledInCourseAsInstructor)
        } else {
            console.log('[SVC-DATABASE] \"Is user enrolled in a course as a student?\" query returned a result')
            senderWindow.webContents.send('did-query-is-user-enrolled-in-course', 'YES', result[0].course_id, 1)
            killService()
        }
    }
}

function didQueryIsUserEnrolledInCourseAsInstructor(error, result, fields) {
    if (error) {
        didDatabaseQueryFail(error)
    } else {
        if (result[0] === undefined) {
            console.log('[SVC-DATABASE] \"Is user enrolled in a course as an instructor?\" query returned no results')
            senderWindow.webContents.send('did-query-is-user-enrolled-in-course', 'NO', null, null)
        } else {
            console.log('[SVC-DATABASE] \"Is user enrolled in a course as an instructor?\" returned a result')
            senderWindow.webContents.send('did-query-is-user-enrolled-in-course', 'YES', result[0].course_id, 2)
        }
        killService()
    }
}

ipcRenderer.on('query-is-user-enrolled-in-course', function(event, senderWindowId) {
    console.log('[SVC-DATABASE] \"Is user enrolled in a course?\" query started')
    setUpService(senderWindowId)

    console.log('[SVC-DATABASE] Connecting to database...')
    globalDatabase.connect(queryIsUserEnrolledInCourse)
})

function queryIsCourseJoinCodeValid(error) {
    if (error) {
        didDatabaseConnectionFail(error)
    } else {
        console.log('[SVC-DATABASE] Global database connection succeeded')
        console.log('[SVC-DATABASE] Executing \"Is given course join code valid?\" query...')
        globalDatabase.query('SELECT course_id, role FROM course_join_codes where course_join_code = ' + arg.courseJoinCode, didQueryIsCourseJoinCodeValid)
    }
}

function didQueryIsCourseJoinCodeValid(error, result, fields) {
    if (error) {
        didDatabaseQueryFail(error)
    } else {
        if (result[0] === undefined) {
            console.log('[SVC-DATABASE] \"Is given course join code valid?\" query returned no results')
            senderWindow.webContents.send('did-query-is-course-join-code-valid', 'NO', null, null)
        } else {
            console.log('[SVC-DATABASE] \"Is given course join code valid?\" returned a result')
            senderWindow.webContents.send('did-query-is-course-join-code-valid', 'YES', result[0].course_id, result[0].role)
        }
        killService()
    }
}

ipcRenderer.on('query-is-course-join-code-valid', function(event, courseJoinCode, senderWindowId) {
    console.log('[SVC-DATABASE] \"Is given course join code valid?\" query started')
    setUpService(senderWindowId)

    arg = {
        courseJoinCode: courseJoinCode
    }

    console.log('[SVC-DATABASE] Connecting to database...')
    globalDatabase.connect(queryIsCourseJoinCodeValid)
})

function attemptAddCourseEnrollment(error) {
    if (error) {
        didDatabaseConnectionFail(error)
    } else {
        console.log('[SVC-DATABASE] Global database connection succeeded')
        console.log('[SVC-DATABASE] Attempting to add course enrollment...')
        if (arg.role == 1) {
            globalDatabase.query('INSERT INTO enrollments_as_student (email_address, course_id) VALUES (\'' + remote.getGlobal('userEmailAddress') + '\', ' + arg.courseId + ')', didAttemptAddCourseEnrollment)
        } else if (arg.role == 2) {
            globalDatabase.query('INSERT INTO enrollments_as_instructor (email_address, course_id) VALUES (\'' + remote.getGlobal('userEmailAddress') + '\', ' + arg.courseId + ')', didAttemptAddCourseEnrollment)
        }
    }
}

function didAttemptAddCourseEnrollment(error, result, fields) {
    if (error) {
        didDatabaseQueryFail(error)
    } else {
        senderWindow.webContents.send('did-attempt-add-course-enrollment', 'SUCCESS', arg.courseId, arg.role)
        killService()
    }
}

ipcRenderer.on('attempt-add-course-enrollment', function(event, courseId, role, senderWindowId) {
    console.log('[SVC-DATABASE] Add course enrollment attempt started')
    setUpService(senderWindowId)

    arg = {
        courseId: courseId,
        role: role
    }

    console.log('[SVC-DATABASE] Connecting to database...')
    globalDatabase.connect(attemptAddCourseEnrollment)
})

function queryAssignments(error) {
    if (error) {
        didDatabaseConnectionFail(error)
    } else {
        console.log('[SVC-DATABASE] Course database connection succeeded')
        console.log('[SVC-DATABASE] Executing \"What assignments?\" query...')
        courseDatabase.query('SELECT * FROM assignments ORDER BY date_due', didQueryAssignments)
    }
}

function didQueryAssignments(error, result, fields) {
    if (error) {
        didDatabaseQueryFail(error)
    } else {
        if (result[0] === undefined) {
            senderWindow.webContents.send('did-query-assignments', null)
        } else {
            senderWindow.webContents.send('did-query-assignments', result)
        }
        killService()
    }
}

ipcRenderer.on('query-assignments', function(event, courseId, senderWindowId) {
    console.log('[SVC-DATABASE] \"What assignments exist?\" query started')
    arg = {
        courseId: courseId
    }
    setUpService(senderWindowId)

    console.log('[SVC-DATABASE] Connecting to database...')
    courseDatabase.connect(queryAssignments)
})

function queryStudentSubmissions(error) {
    if (error) {
        didDatabaseConnectionFail(error)
    } else {
        console.log('[SVC-DATABASE] Course database connection succeeded')
        console.log('[SVC-DATABASE] Executing \"What submissions has this student made?\" query...')
        courseDatabase.query('SELECT * FROM submissions WHERE student_email_address = \'' + arg.studentEmailAddress + '\'', didQueryStudentSubmissions)
    }
}

function didQueryStudentSubmissions(error, result, fields) {
    if (error) {
        didDatabaseQueryFail(error)
    } else {
        if (result[0] === undefined) {
            senderWindow.webContents.send('did-query-student-submissions', null)
        } else {
            senderWindow.webContents.send('did-query-student-submissions', result)
        }
        killService()
    }
}

ipcRenderer.on('query-student-submissions', function(event, courseId, studentEmailAddress, senderWindowId) {
    console.log('[SVC-DATABASE] \"What submissions has this student made?\" query started')
    arg = {
        courseId: courseId,
        studentEmailAddress: studentEmailAddress
    }
    setUpService(senderWindowId)

    console.log('[SVC-DATABASE] Connecting to database...')
    courseDatabase.connect(queryStudentSubmissions)
})

function queryAllSubmissions(error) {
    if (error) {
        didDatabaseConnectionFail(error)
    } else {
        console.log('[SVC-DATABASE] Course database connection succeeded')
        console.log('[SVC-DATABASE] Executing \"What submissions have all students made?\" query...')
        courseDatabase.query('SELECT * FROM submissions', didQueryAllSubmissions)
    }
}

function didQueryAllSubmissions(error, result, fields) {
    if (error) {
        didDatabaseQueryFail(error)
    } else {
        if (result[0] === undefined) {
            senderWindow.webContents.send('did-query-all-submissions', null)
        } else {
            senderWindow.webContents.send('did-query-all-submissions', result)
        }
        killService()
    }
}

ipcRenderer.on('query-all-submissions', function(event, courseId, senderWindowId) {
    console.log('[SVC-DATABASE] \"What submissions have all students made?\" query started')
    arg = {
        courseId: courseId
    }
    setUpService(senderWindowId)

    console.log('[SVC-DATABASE] Connecting to database...')
    courseDatabase.connect(queryAllSubmissions)
})

function queryComments(error) {
    if (error) {
        didDatabaseConnectionFail(error)
    } else {
        console.log('[SVC-DATABASE] Course database connection succeeded')
        console.log('[SVC-DATABASE] Executing \"What comments exist?\" query...')
        courseDatabase.query('SELECT * FROM assignment_comments ORDER BY date_posted', didQueryComments)
    }
}

function didQueryComments(error, result, fields) {
    if (error) {
        didDatabaseQueryFail(error)
    } else {
        if (result[0] === undefined) {
            senderWindow.webContents.send('did-query-comments', null)
        } else {
            senderWindow.webContents.send('did-query-comments', result)
        }
        killService()
    }
}

ipcRenderer.on('query-comments', function(event, courseId, senderWindowId) {
    console.log('[SVC-DATABASE] \"What comments exist?\" query started')
    arg = {
        courseId: courseId,
    }
    setUpService(senderWindowId)

    console.log('[SVC-DATABASE] Connecting to database...')
    courseDatabase.connect(queryComments)
})

function addComment(error) {
    if (error) {
        didDatabaseConnectionFail(error)
    } else {
        console.log('[SVC-DATABASE] Course database connection succeeded')
        console.log('[SVC-DATABASE] Adding comment...')
        let query = 'INSERT INTO assignment_comments (id, assignment_id, poster_email_address, date_posted, comment) VALUES (' + arg.commentId + ', ' + arg.assignmentId + ', \'' + arg.userEmailAddress + '\', \'' + moment(moment.now()).format('YYYY-MM-DD HH:mm:ss') + '\', \'' + arg.commentText + '\')'
        console.log(query)
        courseDatabase.query(query, didAddComment)
    }
}

function didAddComment(error, result, fields) {
    if (error) {
        didDatabaseQueryFail(error)
    } else {
        senderWindow.webContents.send('did-add-comment', 'SUCCESS')
        killService()
    }
}

ipcRenderer.on('add-comment', function(event, courseId, assignmentId, posterEmailAddress, commentText, senderWindowId) {
    console.log('[SVC-DATABASE] \"Add comment\" request started')
    arg = {
        courseId: courseId,
        assignmentId: assignmentId,
        userEmailAddress: posterEmailAddress,
        commentText: commentText,
        commentId: Math.floor((Math.random() * 999999999) + 1)
    }
    setUpService(senderWindowId)

    console.log('[SVC-DATABASE] Connecting to database...')
    courseDatabase.connect(addComment)
})

function addSubmission(error) {
    if (error) {
        didDatabaseConnectionFail(error)
    } else {
        console.log('[SVC-DATABASE] Course database connection succeeded')
        console.log('[SVC-DATABASE] Adding submission...')
        let query = 'INSERT INTO submissions (id, assignment_id, student_email_address, date_submitted) VALUES (' + arg.submissionId + ', ' + arg.assignmentId + ', \'' + arg.userEmailAddress + '\', \'' + moment(moment.now()).format('YYYY-MM-DD HH:mm:ss') + '\')'
        console.log(query)
        courseDatabase.query(query, didAddSubmission)
    }
}

function didAddSubmission(error, result, fields) {
    if (error) {
        didDatabaseQueryFail(error)
    } else {
        senderWindow.webContents.send('did-add-submission-to-database', arg.assignmentId, arg.submissionId)
        killService()
    }
}

ipcRenderer.on('add-submission-to-database', function(event, courseId, assignmentId, studentEmailAddress, senderWindowId) {
    console.log('[SVC-DATABASE] \"Add submission\" request started')
    arg = {
        courseId: courseId,
        assignmentId: assignmentId,
        userEmailAddress: studentEmailAddress,
        submissionId: Math.floor((Math.random() * 999999999) + 1)
    }
    setUpService(senderWindowId)

    console.log('[SVC-DATABASE] Connecting to database...')
    courseDatabase.connect(addSubmission)
})

function removeAssignment(error) {
    if (error) {
        didDatabaseConnectionFail(error)
    } else {
        console.log('[SVC-DATABASE] Course database connection succeeded')
        console.log('[SVC-DATABASE] Removing assignment...')
        courseDatabase.query('DELETE FROM assignments WHERE id = ' + arg.assignmentId, (error, result, fields) => {
            if (error) {
                didDatabaseQueryFail(error)
            } else {
                courseDatabase.query('DELETE FROM submissions WHERE assignment_id = ' + arg.assignmentId, (error, result, fields) => {
                    if (error) {
                        didDatabaseQueryFail(error)
                    } else {
                        courseDatabase.query('DELETE FROM assignment_comments WHERE assignment_id = ' + arg.assignmentId, didRemoveAssignment)
                    }
                })
            }
        })
    }
}

function didRemoveAssignment(error, result, fields) {
    if (error) {
        didDatabaseQueryFail(error)
    } else {
        senderWindow.webContents.send('did-remove-assignment-from-database', arg.assignmentId)
        killService()
    }
}

ipcRenderer.on('remove-assignment-from-database', function(event, courseId, assignmentId, senderWindowId) {
    console.log('[SVC-DATABASE] \"Remove assignment\" request started')
    arg = {
        courseId: courseId,
        assignmentId: assignmentId
    }
    setUpService(senderWindowId)

    console.log('[SVC-DATABASE] Connecting to database...')
    courseDatabase.connect(removeAssignment)
})

function addAssignment(error) {
    if (error) {
        didDatabaseConnectionFail(error)
    } else {
        console.log('[SVC-DATABASE] Course database connection succeeded')
        console.log('[SVC-DATABASE] Adding assignment...')
        courseDatabase.query('INSERT INTO assignments (id, name, description, date_posted, date_due) VALUES (' + arg.assignmentId + ', \'' + arg.name + '\', \'' + arg.description + '\', \'' + moment(moment.now()).format('YYYY-MM-DD HH:mm:ss') + '\', \'' + arg.dateDue + '\')', didAddAssignment)
    }
}

function didAddAssignment(error) {
    if (error) {
        didDatabaseQueryFail(error)
    } else {
        senderWindow.webContents.send('did-add-assignment-to-database', 'SUCCESS')
        killService()
    }
}

ipcRenderer.on('add-assignment-to-database', function(event, courseId, assignmentId, name, description, dateDue, senderWindowId) {
    console.log('[SVC-DATABASE] \"Add assignment\" request started')
    arg = {
        courseId: courseId,
        assignmentId: assignmentId,
        name: name,
        description: description,
        dateDue: dateDue
    }
    setUpService(senderWindowId)

    console.log('[SVC-DATABASE] Connecting to database...')
    courseDatabase.connect(addAssignment)
})