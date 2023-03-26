# App.ly: Job Application and Interview Tracker
One-stop shop to track job applications and interviews.

## Demo link:
Try [App.ly](https://applyapp.herokuapp.com/) now!

## Table of Contents:

- [About The App](#about-the-app)
- [Screenshots](#screenshots)
- [Technologies](#technologies)
- [Setup](#setup)
- [Approach](#approach)
- [Status](#status)
- [Credits](#credits)

## About The App

App.ly is an application that allows users to track their job applications and interviews, all in one place, with a clean and minimal user interface, and without the extra bloatware included with other existing trackers. It was developed by Kyler Robison as part of a group database design project for TCSS 445 Database Systems Design, instructed by Dr. Eyhab Al-Masri at the University of Washington Tacoma. As a group, choosing to build a job application tracker was a no-brainer, as it was something that we would all use and certainly something that we'd probably all need. Keeping track of dozens of applications is no easy task, App.ly attempts to add simplicity to the process.

## Screenshots

`![Writing](https://unsplash.com/photos/VBPzRgd7gfc)`

Picture by [Kelly Sikkema](https://unsplash.com/@kellysikkema)

## Technologies

Frontend:

<img src="https://github.com/devicons/devicon/blob/master/icons/javascript/javascript-original.svg" alt="JavaScript Logo" width="50" height="50"/><img src="https://github.com/devicons/devicon/blob/master/icons/html5/html5-original.svg" alt="HTML5 Logo" width="50" height="50"/><img src="https://github.com/devicons/devicon/blob/master/icons/css3/css3-original.svg" alt="CSS3 Logo" width="50" height="50"/>

`JavaScript` `HTML5` `CSS3`

<br>

Backend:

<img src="https://github.com/devicons/devicon/blob/master/icons/python/python-original.svg" alt="Python Logo" width="50" height="50"/><img src="https://github.com/devicons/devicon/blob/master/icons/flask/flask-original.svg" alt="Flask Logo" width="50" height="50"/><img src="https://github.com/devicons/devicon/blob/master/icons/mysql/mysql-original.svg" alt="MySQL Logo" width="50" height="50"/>

`Python` `Flask` `MySQL`

<br>

Hosted with:

<img src="https://github.com/devicons/devicon/blob/master/icons/heroku/heroku-original.svg" alt="Heroku Logo" width="50" height="50"/>

`Heroku`

<br>

It is what I like to call, the JMPF (JS-MySQL-Python-Flask) stack, pronounced gympf.

## Setup
1. download or clone the repository
1. install the following Python packages in your environment:
   - Flask==2.2.3
   - mysql-connector-python==8.0.32
1. test flask local server with `flask run`

## Approach

### Project Structure

I opted to store the client and server in one repository. Given the steps for heroku deployment, I felt that it would be easier to have everything in one place. If I could do it again, I would separate them, (shocker) because it became very cumbersome to re-start the server to get the html templates to re render, among other reasons.

Because of that decision, the project has two major components, they live in the directories `client` and `server`. `client` of course contains the pages and any resources, sylesheets, and scripts that make them what they are. `server` contains the code that that makes it all happen, `app.py` houses all the endpoints that return static content as well as the endpoints that make up the RESTful API for handling the web service features associated with the application. 

### Tech Decisions

#### Frontend

I had wanted to use React.js for the frontend originally. For two reasons I opted not to use it though. Firstly, the timeframe. Given that my knowledge of React was on the introductory side, I determined that the deadline would interfere with my ability to learn the patterns and use the framework properly. Secondly, using any framework for a simpler app at the time seemed overkill, in hindsight, having reactive state and all the other things that react brings would have likely made the codebase much simpler and more reliable. 

Bootswatch CSS was used for some of the elements, specifically the login/signup forms, the tables, and the buttons, but the rest was all vanilla CSS.

Building this client made me appreciate the reasons for why frontend frameworks and state management libraries were created. In my future projects, I think I will appreciate having them more than somebody who hasn't ever built a webapp the vanilla JavaScript way.

#### Backend

The choices here were relatively simple. I like python, I like its ability to get things done quickly, and its recent push to become much faster thanks to [Faster CPython](https://devblogs.microsoft.com/python/python-311-faster-cpython-team/). I also had taken a liking to the simplicity of building a server with Flask a few months back after playing with the Java jax-rs framework.

The choice to use MySQL was also quite simple, the market was full of DBMS choices, but it would have been foolish to not choose the most widely used one that is open-source to boot.


## Status
App.ly is still in progress. After a brief hiatus, devlopment will continue.

Current backlog:
  - Security improvements: password encryption, provisions to avoid SQL injection
  - Limit display length of application and interview tables by using pages that can be clicked through
  - Add sort and filter to both applications and interviews tables
  - Improvements to application details: enlarge job description textbox, add application notes, add a field for posting link
  - Create a system to separate applications into seasons, so that previous year applications can be saved and used for user statistics
  - Create a stats page to display information like response rate, interview rate, etc.
  - Warning/confirm dialogues for delete actions
  - Implement delete account function for General Data Protection Regulation (GDPR) compliance
  - Implement a way to associate the specific resume and/or cover letter used for application

## Credits
List of contriubutors:
- [Kyler Robison](https://github.com/krobison10/)
