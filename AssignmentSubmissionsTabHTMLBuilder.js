const moment = require('moment')

class AssignmentSubmissionsTabHTMLBuilder {
    static build(assignments, submissions) {
        var submissionsTabs = []
        for (let assignment of assignments) {
            var tableRows = []
            for (let submission of submissions) {
                if (submission.assignment_id == assignment.id) {
                    tableRows.push(this.buildTableRow(submission.student_email_address, submission.date_submitted, assignment.date_due, assignment.id, submission.id))
                }
            }

            let tableBody = this.buildTableBody(tableRows)
            let tableHeader = this.buildTableHeader()
            let table = this.buildTable(tableHeader, tableBody)
            submissionsTabs.push(this.buildSubmissionsTabElement(table))
        }
        return submissionsTabs
    }

    static buildSubmissionsTabElement(...elements) {
        let submissionsTabDiv = document.createElement('div')
        submissionsTabDiv.setAttribute('class', 'tab-pane fade')
        submissionsTabDiv.setAttribute('id', 'assignment-submissions-tab')
        submissionsTabDiv.setAttribute('role', 'tabpanel')
        for (let element of elements) {
            if (element != null) {
                submissionsTabDiv.append(element)
            }
        }
        return submissionsTabDiv
    }

    static buildTable(...elements) {
        let table = document.createElement('table')
        table.setAttribute('class', 'table table-bordered table-striped')
        for (let element of elements) {
            table.append(element)
        }
        return table
    }

    static buildTableBody(tableRows) {
        let tableBody = document.createElement('tbody')
        for (let row of tableRows) {
            tableBody.append(row)
        }
        return tableBody
    }

    static buildTableHeader() {
        let tableHeader = document.createElement('thead')
        let tableRow = document.createElement('tr')

        let studentEmailAddressHeader = document.createElement('th')
        studentEmailAddressHeader.textContent = 'Student Email Address'

        let dateSubmittedHeader = document.createElement('th')
        dateSubmittedHeader.textContent = 'Submitted on'

        let downloadHeader = document.createElement('th')
        downloadHeader.textContent = 'Download'

        tableRow.append(studentEmailAddressHeader)
        tableRow.append(dateSubmittedHeader)
        tableRow.append(downloadHeader)
        tableHeader.append(tableRow)
        return tableHeader
    }

    static buildTableRow(studentEmailAddress, dateSubmitted, dateDue, assignmentId, submissionId) {
        let tableRow = document.createElement('tr')

        let studentEmailAddressColumn = document.createElement('td')
        studentEmailAddressColumn.textContent = studentEmailAddress
        tableRow.append(studentEmailAddressColumn)

        let dateSubmittedColumn = document.createElement('td')
        dateSubmittedColumn.textContent = moment(dateSubmitted).format('MMMM D, YYYY')
        if (moment(dateSubmitted).isAfter(dateDue)) {
            dateSubmittedColumn.setAttribute('class', 'text-danger')
        }
        tableRow.append(dateSubmittedColumn)

        let downloadColumn = document.createElement('td')
        let downloadButton = document.createElement('button')
        downloadButton.setAttribute('type', 'button')
        downloadButton.setAttribute('class', 'btn btn-primary btn-sm download-submission-btn')
        downloadButton.setAttribute('assignmentId', assignmentId.toString())
        downloadButton.setAttribute('submissionId', submissionId.toString())
        downloadButton.textContent = 'Download'
        downloadColumn.append(downloadButton)
        tableRow.append(downloadColumn)
        return tableRow
    }
}

module.exports = AssignmentSubmissionsTabHTMLBuilder