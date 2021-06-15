const moment = require('moment')

class AssignmentInfoTabHTMLBuilder {
    static build(assignments, submissions, userRole) {
        var infoTabs = []
        assignments.forEach(element => {
            let titleLabel = this.buildTitleLabel(element.name)
            let datePostedLabel = this.buildDatePostedLabel(element.date_posted)
            let dateDueLabel = this.buildDateDueLabel(element.date_due)
            var completionStatusLabel
            if (userRole == 'STUDENT') {
                completionStatusLabel = this.buildCompletionStatusLabel(element.id, element.date_due, submissions)
            } else {
                completionStatusLabel = null
            }
            let descriptionSection = this.buildDescriptionSection(element.description)
            let downloadMaterialsButton = this.buildDownloadMaterialsButton(element.id)
            var addSubmissionButton
            if (userRole == 'STUDENT') {
                addSubmissionButton = this.buildAddSubmissionButton(element.id, submissions)
            } else {
                addSubmissionButton = null
            }
            infoTabs.push(this.buildInfoTabElement(titleLabel, datePostedLabel, dateDueLabel, completionStatusLabel, descriptionSection, downloadMaterialsButton, addSubmissionButton))
        })
        return infoTabs
    }

    static buildInfoTabElement(...elements) {
        let infoTabDiv = document.createElement('div')
        infoTabDiv.setAttribute('class', 'tab-pane fade show active')
        infoTabDiv.setAttribute('id', 'assignment-info-tab')
        infoTabDiv.setAttribute('role', 'tabpanel')
        for (let element of elements) {
            if (element != null) {
                infoTabDiv.append(element)
            }
        }
        return infoTabDiv
    }

    static buildTitleLabel(name) {
        let titleLabel = document.createElement('h3')
        titleLabel.setAttribute('class', 'mt-2')
        titleLabel.textContent = name
        return titleLabel
    }

    static buildDatePostedLabel(datePosted) {
        let datePostedLabel = document.createElement('p')
        datePostedLabel.innerHTML = '<b>Assigned on: </b>' + moment(datePosted).format('MMMM D, YYYY')
        return datePostedLabel
    }
    
    static buildDateDueLabel(dateDue) {
        let dateDueLabel = document.createElement('p')
        dateDueLabel.innerHTML = '<b>Due on: </b>' + moment(dateDue).format('MMMM D, YYYY')
        return dateDueLabel
    }

    static buildCompletionStatusLabel(id, dateDue, submissions) {
        let completionStatusLabel = document.createElement('p')

        let dateNow = Date.now()
        if (moment(dateDue).isBefore(dateNow)) {
            completionStatusLabel.innerHTML = '<b>Status: </b><a class="text-danger">Overdue</a>'
        } else if (moment(dateDue).isAfter(dateNow)) {
            completionStatusLabel.innerHTML = '<b>Status: </b>Not Complete'
        }

        for (let submission of submissions) {
            if (submission.assignment_id == id) {
                completionStatusLabel.innerHTML = '<b>Status: </b><a class="text-success">Complete</a>'
                break
            }
        }

        return completionStatusLabel
    }

    static buildDescriptionSection(description) {
        let descriptionSection = document.createElement('p')
        descriptionSection.setAttribute('class', 'text-break')
        descriptionSection.textContent = description
        return descriptionSection
    }

    static buildDownloadMaterialsButton(id) {
        let downloadMaterialsButton = document.createElement('button')
        downloadMaterialsButton.setAttribute('type', 'button')
        downloadMaterialsButton.setAttribute('class', 'btn btn-primary download-assignment-materials-btn')
        downloadMaterialsButton.setAttribute('assignmentid', id.toString())
        downloadMaterialsButton.textContent = 'Download materials'
        return downloadMaterialsButton
    }

    static buildAddSubmissionButton(id, submissions) {
        for (let submission of submissions) {
            if (submission.assignment_id == id) {
                return null
            }
        }

        let addSubmissionButton = document.createElement('button')
        addSubmissionButton.setAttribute('type', 'button')
        addSubmissionButton.setAttribute('class', 'btn btn-success add-submission-btn')
        addSubmissionButton.setAttribute('assignmentid', id.toString())
        addSubmissionButton.textContent = 'Add submission'
        return addSubmissionButton
    }
}

module.exports = AssignmentInfoTabHTMLBuilder