# Rough Flow of End to end (code to prod)

After the initial project is deployed to prod. We need to follow the one of the below flow to deploy to prod.

List of development work can be found at [issues](), [ideas]()

Maintaining the task in [project](https://github.com/users/rajexcited/projects/3) with priorities.
The task can be group of issues and /or ideas.
The task may solely UI related or combined of UI and backend API.

when task is completed, we are ready for prod deployment.

During task progression, we can deploy to dev or deploy to demo to verify depending on requirement.

Deploying to dev is for now only supported through local. When I find how to auto destroy after 30 min or through api, will create workflow.

For each issue/idea/task, create a feature branch to code. when feature branch is ready, merge to taskdevelopment branch and deploy to dev to verify.

when task development and testing is completed, the development branch code

milestone can be used for minor, patch or major releases.

## From experiments

From experiments, I learn followings,

- project task can be converted to new issue in any repo. but not the discussion.
- project task cannot have multiple issues.
- project can be shared among repos
- the converted issue can be transferred to any of my repo through project task.
- the issue can be converted to discussion
- from 1 discussion, we can create multiple issues in the same repo.
- each issue can have its own feature branch.
- when PR is merge, the issue might be closed automatically.

- discussion is mostly used for open ended user conversions and feedback.
- discussion doesnot need to be actionable.

the flow can be

discussion -> task & issues

## Milestones & Labels

Best practices for milestone
Best practices for labels

### Project Automation

https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/best-practices-for-projects#use-automation

### Chatgpt suggestions

Link to the ongoing chat on various concerns and approaches
https://chatgpt.com/share/678d85ba-6238-800e-8032-c270240c32bd

I got clarifications on usage point of view and theoritical way using tool.

---

### Draft 1:

The CHATGPT wisdom for draft 1 is located `docs\chatgpt-suggestion-draft1.md`

I will start with ChapGPT suggestions including examples and templtes.

- for new features, create idea discussion
- for bugs, create issues
- create milestones of current and future 5 releases
- determine aproximate deadline for current release, and if possible set into project
- create workflows to automate as per suggestions
- if feature is related to both frontend and backend, create a parent issue stating high level details. if there is an idea in discussion, create or transfer into issue, so that I can link with other repo and shared project as well. shared project ilnk to get the overall progression. And create related small issues into respective repos and link to the parent one.

when to trigger the prod deployment, dev deployment and demo deployment?

prod deployment when milestone is complete. for now will trigger with commit message from master branch "deploy prod"

milestone branch naming convention?

> example, milestone-v1

when PR of milestone branch has all checks PASSED, I can merge it to master and deploy to prod.
I can deploy to gh-pages from milestone branches to verify if needed. from master branch, it is always deployed.

#### Tests

test deployment gets triggered non-master milestone branch, if test execution issue is created or opened. destroy job gets triggered when test execution plan is closed regardless of status.

I can manage test case issues with proper labeling. so I can create test Execution plan accordingly.

for test case creation and execition plan, I can use github issues and automate workflow upon issue updates.

add checks to PR to master branch : The milestone test execution plan is closed in PASS status.  
The test deployment is short lived for 30 min to 1 hour
