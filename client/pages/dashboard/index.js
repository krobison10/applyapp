'use strict'

const appInfo = document.getElementById('app-info');
const viewMode = appInfo.querySelector('.view-mode');
const editMode = appInfo.querySelector('.edit-mode');
const editBtn = appInfo.querySelector('.edit-btn');
const closeBtn = appInfo.querySelector('.close-btn');
const cancelBtn = appInfo.querySelector('.cancel-btn');

// Show the edit mode and hide the view mode
editBtn.addEventListener('click', () => {
    viewMode.style.display = 'none';
    editMode.style.display = 'block';
});



// Show the view mode and hide the edit mode without saving any changes
cancelBtn.addEventListener('click', () => {
    editMode.style.display = 'none';
    viewMode.style.display = 'block';
});

// Save the changes made in the edit mode and switch back to the view mode
const form = editMode.querySelector('form');
form.addEventListener('submit', (event) => {
    event.preventDefault();
    // Save the changes made in the form
    // ...
    // Switch back to the view mode
    editMode.style.display = 'none';
    viewMode.style.display = 'block';
});


// Hide app info section
const app_info_section = document.getElementById("app-info");
app_info_section.style = "display: none";

closeBtn.addEventListener('click', () =>{
    activeApplication = undefined;
    app_info_section.style = "display: none";

    const tbody = document.getElementById("app-table-body");
    Array.from(tbody.children).forEach(row => row.classList.remove("table-active"))
});

console.log("Logged in user with id: " + userId);
let userApplications;
let activeApplication;

let userInterviews;

async function fetchApplications() {
    try {
        const response = await fetch(`/api/applications?user_id=${userId}`);
        const data = await response.json();

        userApplications = data;
        fillAppTable();
    } catch (error) {
        console.error("Failed to fetch applications");
    }
}


function json_to_app_row(application) {

    //Use table-active class when the time comes to highlight current
    const row = document.createElement("tr");

    
    row.id = "appid-" + application.id;

    row.innerHTML = `
        <th scope="row">${application.company_name}</th>
        <td>${capitalize(application.status)}</td>
        <td>${application.title}</td>
        <td>${formatDate(application.submit_date)}</td>
    `
    // <td><button type="button" class="btn btn-outline-danger">Delete</button></td>

    const td1 = document.createElement("td");

    const td1_button = document.createElement("button");
    td1_button.type = "button";
    td1_button.classList.add('btn');
    td1_button.classList.add('btn-outline-primary');

    td1_button.innerHTML = "View";
    td1_button.addEventListener("click", () => {
        const tbody = document.getElementById("app-table-body");
        Array.from(tbody.children).forEach(row => row.classList.remove("table-active"));
        document.getElementById(row.id).classList.add("table-active");
        updateActiveApplication(application.id);
    });
    td1.appendChild(td1_button);

    row.appendChild(td1);

    return row;
}


function fillAppTable() {
    const tbody = document.getElementById("app-table-body");
    tbody.innerHTML = '';

    for(let application of userApplications) {
        tbody.appendChild(json_to_app_row(application));
    }
}

async function fetchInterviews() {
    try {
        const response = await fetch(`/api/interviews?user_id=${userId}`);
        const data = await response.json();

        userInterviews = data;
        fillIntTable();
    } catch (error) {
        console.error("Failed to fetch interviews");
    }
}

function json_to_int_row(interview) {

    //Use table-active class when the time comes to highlight current
    const row = document.createElement("tr");

    row.id = "intid-" + interview.id;

    row.innerHTML = `
        <th scope="row">${interview.company}</th>
        <td>${interview.title}</td>
        <td>${formatDateTime(interview.date)}</td>
        <td>${capitalize(interview.modality)}</td>
        <td>${interview.location}</td>
        <td><button type="button" class="btn btn-outline-danger">Delete</button></td>
    `

    return row;
}

function fillIntTable() {
    const tbody = document.getElementById("int-table-body");
    tbody.innerHTML = '';

    for(let interview of userInterviews) {
        tbody.appendChild(json_to_int_row(interview));
    }
}


function updateActiveApplication(newId) {
    if(activeApplication && activeApplication.id === newId) return;

    if(!activeApplication) app_info_section.style = "display: block";

    activeApplication = Object.values(userApplications).find(app => app.id === newId);
    console.log("Active application is now " + activeApplication.id);

    const container = document.getElementById("app-info-view-content")

    const template = `
    <p>Company: ${activeApplication.company_name}</p>
    <p>Status: ${capitalize(activeApplication.status)}</p>
    <p>Submit date: ${formatDate(activeApplication.submit_date)}</p>
    <br>
    <p>Job title: ${activeApplication.title}</p>
    <p>Posting link: </p>
    <p>Job description: ${activeApplication.description}</p>
    <p>Posting date: ${formatDate(activeApplication.post_date)}</p>
    <p>Field: ${activeApplication.field}</p>
    <p>Position: ${activeApplication.position}</p>
    <p>Wage: ${activeApplication.wage ? activeApplication.wage : ""}</p>
    <p>Job start: ${formatDate(activeApplication.start_date)}</p>
    <br>
    <p>Company industry: ${activeApplication.industry}</p>
    <p>Company website: <a href="${activeApplication.website}">${activeApplication.website}</a></p>
    <p>Company phone: ${formatPhoneNumber(activeApplication.phone)}</p>
    <br>
    `;

    container.innerHTML = template;
}


//Start 

fetchApplications();
fetchInterviews();


// -------------------- Helper Functions --------------------

function capitalize(string) {
    if (typeof string !== 'string') return ''
    return string.charAt(0).toUpperCase() + string.slice(1)
}

function formatDate(string) {
    if(!string) return "";
    const date = new Date(string);
    return date.toLocaleDateString("en-US");
}

function formatDateTime(dateTimeString) {
    if(!dateTimeString) return "";
    const options = { 
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    const dateTime = new Date(dateTimeString);
    return dateTime.toLocaleString("en-US", options);
}

function formatPhoneNumber(phoneNumberString) {
    var cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return null;
}