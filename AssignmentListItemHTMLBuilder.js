class AssignmentListItemHTMLBuilder {
    static build(assignments) {
        var listItems = []
        assignments.forEach(element => {
            listItems.push(this.createListItemElement(element))
        })
        return listItems
    }

    static createListItemElement(assignment) {
        let listItem = document.createElement('a')
        listItem.setAttribute('class', 'list-group-item list-group-item-action')
        listItem.setAttribute('href', '#assignment-' + assignment.id)
        listItem.setAttribute('role', 'tab')
        listItem.setAttribute('data-toggle', 'list')
        listItem.setAttribute('assignmentid', assignment.id)
        listItem.textContent = assignment.name
        return listItem
    }
}

module.exports = AssignmentListItemHTMLBuilder