# Requirements of OSS Cloud application

Levi9 needs an application for tracking employees contributions to various open-source projects (OSS). Application needs to support two types of users: administrators and regular users who don't need to be authenticated.

## Pages

* View list of OSS contributors with their stats (all users) and actions (for administrators only)
* Add new contributor (all users), can be a dialog on previous page
* View list of contributions (administrators)

## Page for listing contributors

This page should list all registered contributors that have at least one visible contribution.

For regular users:
* Show the list of contributors: GitHub username as link to profile, name 
* Search, sort, paging
* For each contributor show number of contributions
* For each contributor there should be an action to display list of (visible) contributions with paging
* Action to submit new contributor (name and GitHub username)

For adminstrators this page should additionally show
* number of pending contributions, a link that leads to the page with contributions pre-filled with filter for user and type=pending

## Page for listing contributions

This page is for administrators only.
This page should list all contributions registered in our application (via periodic check).
Administrator should be able to filter by user, contribution state.
Administrator should be able to change the state of single contribution.

## Periodic checking

Application should periodically check for new contributions for all registered contributors. Period should be configurable.

## Misc 

Contribution === Pull request

Contribution can have following states: pending review, visible, invisible (for our regular users), deleted?