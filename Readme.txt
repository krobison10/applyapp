Welcome to our application
This program was written for TCSS 445 class at Univesity of Washington Tacoma
Group members: Kyler Robison, Satinder Singh, Andrew Nguyen, Julia Kulev

This program stores information about job application for multiple users. 

The primary function for creating this database is to keep track of companies
at which the user has already applied. With APP.ly users can quickly access all
the jobs they’ve applied for along with various information regarding each application.
This database holds information about the date at which the application was 
submitted for the user, the job board at which the position was initially advertised,
company name, application status, job type, job name, salary, links to the employer’s website,
employer contact information, username/password for their account, and any files
associated with the application. Users can sort the database based on date submitted,
the company name, or by the application status. Some of the fields are subfields of
other fields, such as company details being a subset of company name
and job description being a subset of position name.


PROJECT STRUCTURE

The project has two main directories, server and client. The backend lives in server and uses the python flask framework, the main script is named app.py which contains all the endpoints and sql. Helpers.py contains a few more functions. The client directory houses the pages, stylesheets, and javascript. These can all be found in the pages directory with subdirectories for each page. All the files outside of client and server are for the heroku deployment.
