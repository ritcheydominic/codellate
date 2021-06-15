class AssignmentPaneHTMLBuilder {
    static build(assignmentInfoTabs, assignmentCommentsTabs, assignmentSubmissionsTabs, assignments, userRole) {
        var panes = []
        var i
        for (i = 0; i < assignments.length; i++) {
            let pane = document.createElement('div')
            pane.setAttribute('class', 'tab-pane fade')
            pane.setAttribute('role', 'tabpanel')
            pane.setAttribute('id', 'assignment-' + assignments[i].id.toString())
            pane.setAttribute('assignmentId', assignments[i].id.toString())

            let paneNav = document.createElement('nav')
            if (userRole == 'STUDENT') {
                paneNav.innerHTML = `<div class="nav nav-tabs" id="assignment-pane-nav" role="tablist">
                <a class="nav-item nav-link active" id="assignment-info-nav" data-toggle="tab" href="#assignment-info-tab" role="tab">Info</a>
                <a class="nav-item nav-link" id="assignment-comments-nav" data-toggle="tab" href="#assignment-comments-tab" role="tab">Comments</a>
              </div>`
            } else if (userRole == 'INSTRUCTOR') {
                paneNav.innerHTML = `<div class="nav nav-tabs" id="assignment-pane-nav" role="tablist">
                <a class="nav-item nav-link active" id="assignment-info-nav" data-toggle="tab" href="#assignment-info-tab" role="tab">Info</a>
                <a class="nav-item nav-link" id="assignment-comments-nav" data-toggle="tab" href="#assignment-comments-tab" role="tab">Comments</a>
                <a class="nav-item nav-link" id="assignment-submissions-nav" data-toggle="tab" href="#assignment-submissions-tab" role="tab">Submissions</a>
              </div>`
            }
            pane.append(paneNav)

            let assignmentPaneTabs = document.createElement('div')
            assignmentPaneTabs.setAttribute('class', 'tab-content')
            assignmentPaneTabs.setAttribute('id', 'assignment-pane-tabs')

            assignmentPaneTabs.append(assignmentInfoTabs[i])
            assignmentPaneTabs.append(assignmentCommentsTabs[i])
            if (userRole == 'INSTRUCTOR') {
                assignmentPaneTabs.append(assignmentSubmissionsTabs[i])
            }

            console.log('AMOST DONE')

            pane.append(assignmentPaneTabs)
            panes.push(pane)
        }
        return panes
    }
}

module.exports = AssignmentPaneHTMLBuilder