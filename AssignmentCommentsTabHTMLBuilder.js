const moment = require('moment')

class AssignmentCommentsTabHTMLBuilder {
    static build(assignments, comments) {
        var commentsTabs = []
        for (let assignment of assignments) {
            var listItems = []
            for (let comment of comments) {
                if (comment.assignment_id == assignment.id) {
                    let commentListItem = this.buildCommentListItem(comment)
                    console.log(JSON.stringify(commentListItem))
                    listItems.push(commentListItem)
                }
            }
            let commentListGroup = this.buildCommentListGroup(listItems)
            console.log(JSON.stringify(commentListGroup))
            let postCommentInputGroup = this.buildPostCommentInputGroup(assignment.id)
            commentsTabs.push(this.buildCommentTabElement(commentListGroup, postCommentInputGroup))
        }
        return commentsTabs
    }

    static buildCommentTabElement(...elements) {
        let commentsTabDiv = document.createElement('div')
        commentsTabDiv.setAttribute('class', 'tab-pane fade')
        commentsTabDiv.setAttribute('id', 'assignment-comments-tab')
        commentsTabDiv.setAttribute('role', 'tabpanel')
        for (let element of elements) {
            commentsTabDiv.append(element)
        }
        return commentsTabDiv
    }

    static buildCommentListGroup(listItems) {
        let listGroup = document.createElement('div')
        listGroup.setAttribute('class', 'list-group')

        for (let listItem of listItems) {
            listGroup.append(listItem)
        }

        return listGroup
    }

    static buildCommentListItem(comment) {
        let listItem = document.createElement('li')
        listItem.setAttribute('class', 'list-group-item')

        let headerDiv = document.createElement('div')
        headerDiv.setAttribute('class', 'd-flex w-100 justify-content-between')
        let writerLabel = this.buildWriterLabel(comment)
        headerDiv.append(writerLabel)
        let datePostedLabel = this.buildDatePostedLabel(comment)
        headerDiv.append(datePostedLabel)
        listItem.append(headerDiv)

        let textSection = this.buildCommentTextSection(comment)
        listItem.append(textSection)

        return listItem
    }

    static buildCommentTextSection(comment) {
        let commentTextSection = document.createElement('p')
        commentTextSection.setAttribute('class', 'mb-1')
        commentTextSection.textContent = comment.comment
        return commentTextSection
    }

    static buildWriterLabel(comment) {
        let writerLabel = document.createElement('h4')
        writerLabel.setAttribute('class', 'mb-1')
        writerLabel.textContent = comment.poster_email_address + ' wrote'
        return writerLabel
    }

    static buildDatePostedLabel(comment) {
        let label = document.createElement('small')
        label.textContent = moment(comment.date_posted).fromNow()
        return label
    }

    static buildPostCommentInputGroup(assignmentId) {
        let inputGroupDiv = document.createElement('div')
        inputGroupDiv.setAttribute('class', 'input-group')

        let commentTextBox = this.buildPostCommentTextBox()
        inputGroupDiv.append(commentTextBox)

        let appendDiv = document.createElement('div')
        appendDiv.setAttribute('class', 'input-group-append')
        let postCommentButton = this.buildPostCommentButton(assignmentId)
        appendDiv.append(postCommentButton)
        inputGroupDiv.append(appendDiv)

        return inputGroupDiv
    }

    static buildPostCommentTextBox() {
        let textArea = document.createElement('textarea')
        textArea.setAttribute('class', 'form-control')
        textArea.setAttribute('id', 'comment-text-box')
        return textArea
    }

    static buildPostCommentButton(assignmentId) {
        let postCommentButton = document.createElement('button')
        postCommentButton.setAttribute('type', 'button')
        postCommentButton.setAttribute('class', 'btn btn-primary post-comment-btn')
        postCommentButton.setAttribute('assignmentId', assignmentId.toString())
        postCommentButton.textContent = 'Post'
        return postCommentButton
    }
}

module.exports = AssignmentCommentsTabHTMLBuilder