'use strict'

showLoader();

let userApplications;
let activeApplication;

let userInterviews;
let activeInterview;


// #region -------------------- APPLICATIONS --------------------

const editCreateAppForm = document.getElementById("edit-create-app");
const editCreateIntForm = document.getElementById("edit-create-int");

const appInfo = document.getElementById('app-info');
const viewMode = appInfo.querySelector('.view-mode');
const editMode = appInfo.querySelector('.edit-mode');

// -------------------- APPLICATION EDIT --------------------
const editBtn = appInfo.querySelector('.edit-btn');
/**
 * Edit button in application info, close interview edit window, switch to edit mode, populate fields
 */
editBtn.addEventListener('click', () => {
    closeIntEdit();
    viewMode.style.display = 'none';
    editMode.style.display = 'block';

    //populate fields of form
    if(activeApplication) {
        document.getElementById("company-input").value = activeApplication.company_name;
        document.getElementById("status-select").value = capitalize(activeApplication.status);
        document.getElementById("submit-date-input").value = formatDateForInput(activeApplication.submit_date);
        document.getElementById("job-title-input").value = activeApplication.title;
        document.getElementById("posting-link-input").value = null;
        document.getElementById("job-description-input").value = activeApplication.description;
        document.getElementById("posting-date-input").value = formatDateForInput(activeApplication.post_date);
        document.getElementById("field-input").value = activeApplication.field;
        document.getElementById("position-input").value = activeApplication.position;
        document.getElementById("wage-input").value = activeApplication.wage;
        document.getElementById("job-start-input").value = formatDateForInput(activeApplication.start_date);
        document.getElementById("company-industry-input").value = activeApplication.industry;
        document.getElementById("company-website-input").value = activeApplication.website;
        document.getElementById("company-phone-input").value = activeApplication.phone;
        formatPhoneNumberInput(document.getElementById("company-phone-input"));
    }
});


// -------------------- CANCEL EDIT/CREATE --------------------
const cancelBtn = appInfo.querySelector('.cancel-btn');
/**
 * Cancel button in application info edit mode, switch back to view mode. If no current application, close 
 * whole app info too, clear inputs for form.
 */
cancelBtn.addEventListener('click', () => {
    editMode.style.display = 'none';
    viewMode.style.display = 'block';

    // If no current application, close the whole card
    if(!activeApplication) appInfo.style = "display: none";

    clearInputs();
});


// -------------------- SAVE EDIT/CREATE --------------------
const saveBtn = document.getElementById("save-edit-btn");
/**
 * Essentially the submit button in edit mode for new interview or updates.
 */
saveBtn.addEventListener("click", () => {
    //Return if required fields empty/invalid

    if(!editCreateAppForm.reportValidity()) return;
    //Fill json with form info
    const data = {
        user_id: parseInt(userId),
        company_name: document.getElementById("company-input").value,
        description: document.getElementById("job-description-input").value,
        field: document.getElementById("field-input").value,
        industry: document.getElementById("company-industry-input").value,
        phone: document.getElementById("company-phone-input").value,
        position: document.getElementById("position-input").value,
        post_date: document.getElementById("posting-date-input").value,
        start_date: document.getElementById("job-start-input").value,
        status: document.getElementById("status-select").value,
        submit_date: document.getElementById("submit-date-input").value,
        title: document.getElementById("job-title-input").value,
        wage: document.getElementById("wage-input").value,
        website: document.getElementById("company-website-input").value
    }

    console.log(data);

    //Active indicates existing application, provide application id, call update api
    if(activeApplication) {
        data.application_id = activeApplication.id;
        submitPOST('/api/update_application', data); 
    } 
    //Not active indicates new, call create api with no id (will be created)
    else {
        submitPOST('/api/create_application', data);
    }


    //Switch back to view mode
    editMode.style.display = 'none';
    viewMode.style.display = 'block';

    //If creating new, close app window for now. FUTURE: populate with new application data immediately
    if(!activeApplication) {
        appInfo.style.display = "none";
    }

    //Clear inputs to edit/create form
    clearInputs();
});


// -------------------- CREATE NEW --------------------
const newBtn = document.getElementById("btn-new");
/**
 * Button to create new application
 */
newBtn.addEventListener("click", () => {
    //Do nothing if in edit mode
    if(appInfo.style.display === "block" && editMode.style.display === "block") return;
    
    //Clear interview edit if exists
    closeIntEdit();
    //Clear the active application if exists
    activeApplication = null;

    //Deselect active row in app table if there
    const tbody = document.getElementById("app-table-body");
    Array.from(tbody.children).forEach(row => row.classList.remove("table-active"));

    //Make sure app info is open, scroll to it
    appInfo.style.display = "block";
    appInfo.scrollIntoView({ behavior: "smooth" });

    //Enable edit mode
    viewMode.style.display = 'none';
    editMode.style.display = 'block';
});


// -------------------- CLOSE CURRENT APPLICATION --------------------
const closeBtn = appInfo.querySelector('.close-btn');
/**
 * Close current application from app info view mode
 */
closeBtn.addEventListener('click', () => {
    //If editing interview, active app will be cleared which it relies on, so close it too
    closeIntEdit();
    closeAppWindow();
});

/**
 * Close app window, set active to null, don't display div, and clear active row from table
 */
function closeAppWindow() {

    //In case of edit mode, reset and clear inputs to be safe
    editMode.style.display = 'none';
    viewMode.style.display = 'block';
    clearInputs();


    activeApplication = null;
    appInfo.style.display = "none";

    const tbody = document.getElementById("app-table-body");
    Array.from(tbody.children).forEach(row => row.classList.remove("table-active"));
}


// -------------------- DELETE CURRENT APPLICATION --------------------
const deleteButton = appInfo.querySelector('.delete-btn');
/**
 * Button to delete the current application in view mode
 */
deleteButton.addEventListener('click', () => {
    if(!activeApplication) throw Error("Tried to delete application: none active, but app window was open in view mode");
    
    //Close interview edit so that an interview can get added for the application to be deleted
    closeIntEdit();

    submitPOST("/api/delete_application", {application_id: activeApplication.id});
});

/**
 * Fetches, processes, and fills applications table with all applications
 */
async function fetchApplications() {
    try {
        const response = await fetch(`/api/applications?user_id=${userId}`);
        const data = await response.json();

        userApplications = data;
        convertNulls(userApplications);
        fillAppTable();
        userInterviews && hideLoader();
    } catch (error) {
        console.error("Failed to fetch applications");
    }
}

/**
 * Given a json object representing the application, return a DOM element representing the table row. 
 */
function json_to_app_row(application) {

    //Use table-active class when the time comes to highlight current
    const row = document.createElement("tr");

    
    row.id = "appid-" + application.id;

    row.innerHTML = `
        <th scope="row">${application.company_name || ""}</th>
        <td>${capitalize(application.status) || ""}</td>
        <td>${application.title || ""}</td>
        <td>${formatDate(application.submit_date) || ""}</td>
    `

    //First td cell
    const td1 = document.createElement("td");

    const td1_button = document.createElement("button");
    td1_button.type = "button";
    td1_button.classList.add('btn');
    td1_button.classList.add('btn-outline-primary');

    td1_button.innerHTML = "View/Edit";
    /**
     * View button on an application row
     */
    td1_button.addEventListener("click", () => {
        if(editMode.style.display !== "none") return; //Do nothing in edit mode

        //Close interview edit window, because active application will change
        closeIntEdit();

        //Remove display of old active row
        const tbody = document.getElementById("app-table-body");
        Array.from(tbody.children).forEach(row => row.classList.remove("table-active"));

        //Display new active row
        document.getElementById(row.id).classList.add("table-active");

        //Update active app and scroll to the app info
        updateAppInfo(application.id);
        appInfo.scrollIntoView({ behavior: "smooth" });
    });
    td1.appendChild(td1_button);

    row.appendChild(td1);

    return row;
}

/**
 * Fills the applications table using all the freshly retrieved data
 */
function fillAppTable() {
    //Locate and clear table element
    const tbody = document.getElementById("app-table-body");
    tbody.innerHTML = '';

    //loop through applications and add
    for(let application of userApplications) {
        tbody.appendChild(json_to_app_row(application));
    }
}

/**
 * Takes steps for when the view button is clicked and app window display needs changed
 */
function updateAppInfo(newId) {
    //If active application and already this one, do nothing
    if(activeApplication && activeApplication.id === newId) return;

    //Make sure app info is open
    appInfo.style = "display: block";

    //Search for and set active application using the new id
    activeApplication = Object.values(userApplications).find(app => app.id === newId);
    //console.log("Active application is now " + activeApplication.id);

    //Locate and populate container with display html
    const container = document.getElementById("app-info-view-content")
    const template = `
    <p>Company: ${activeApplication.company_name || ""}</p>
    <p>Status: ${capitalize(activeApplication.status) || ""}</p>
    <p>Submit date: ${formatDate(activeApplication.submit_date) || ""}</p>
    <br>
    <p>Job title: ${activeApplication.title || ""}</p>
    <p>Job description: ${activeApplication.description || ""}</p>
    <p>Posting date: ${formatDate(activeApplication.post_date || "")}</p>
    <p>Field: ${activeApplication.field || ""}</p>
    <p>Position: ${activeApplication.position || ""}</p>
    <p>Wage: ${activeApplication.wage || ""}</p>
    <p>Job start: ${formatDate(activeApplication.start_date) || ""}</p>
    <br>
    <p>Company industry: ${activeApplication.industry || ""}</p>
    <p>Company website: <a href="${activeApplication.website || ""}">${activeApplication.website || ""}</a></p>
    <p>Company phone: ${formatPhoneNumber(activeApplication.phone) || ""}</p>
    <br>
    `;

    container.innerHTML = template;
}

/**
 * Clears all the input fields from app info edit mode
 */
function clearInputs() {
    const editDiv = document.querySelector('.edit-mode');
    const inputs = editDiv.querySelectorAll('.form-control');

    Object.values(inputs).forEach(inputElement => inputElement.value = "");
}

// #endregion


// #region -------------------- INTERVIEWS --------------------

const intInfo = document.getElementById("int-info")

// -------------------- ADD INTERVIEW FROM APP INFO --------------------
const addIntButton = appInfo.querySelector('.add-int-btn');
/**
 * Add interview button in app info view mode.
 */
addIntButton.addEventListener('click', () => {
    //Close and reopen interview edit
    closeIntEdit();
    openIntEdit();
});


// -------------------- SAVE INTERVIEW --------------------
const saveIntButton = document.getElementById('save-int-btn');
/**
 * Save changes for an interview in the interview edit window
 */
saveIntButton.addEventListener('click', () => {
    //Return if required fields empty
    if(!editCreateIntForm.reportValidity()) return;

    //Creating new
    if(!activeInterview) { 
        if(!activeApplication) throw Error("No active application");
        const data = {
            application_id: activeApplication.id,
            interview_date: document.getElementById("int-time-input").value,
            modality: document.getElementById("int-modality-select").value,
            meeting_location: document.getElementById("int-location-input").value
        }

        submitPOST('/api/create_interview', data);
    }
    //Updating
    else {
        const data = {
            id: activeInterview.id,
            interview_date: document.getElementById("int-time-input").value,
            modality: document.getElementById("int-modality-select").value,
            meeting_location: document.getElementById("int-location-input").value
        }

        submitPOST('/api/update_interview', data);
    }

    //Close out after done
    closeIntEdit();
});


// -------------------- CANCEL INTERVIEW EDIT --------------------
const cancelIntButton = document.getElementById('cancel-int-btn');
/**
 * Cancel button in interview edit window.
 */
cancelIntButton.addEventListener('click', () => {
    closeIntEdit();
});

/**
 * Opens the interview edit window
 */
function openIntEdit() {
    intInfo.style.display = "block";

    //Edit mode, use active interview info to populate static info
    if(activeInterview) {
        document.getElementById("int-company-value").innerText = activeInterview.company;
        document.getElementById("int-job-title-value").innerText = activeInterview.title;
    } 
    //Create mode, use info from current application
    else if(activeApplication) {
        document.getElementById("int-company-value").innerText = activeApplication.company_name;
        document.getElementById("int-job-title-value").innerText = activeApplication.title;
    }
    
    intInfo.scrollIntoView({ behavior: "smooth" });
}

/**
 * Closes the interview edit window
 */
function closeIntEdit() {
    //Wipe variables and close window
    activeInterview = null;
    intInfo.style.display = "none";

    //Clear fields of the window
    document.getElementById("int-company-value").innerText = "";
    document.getElementById("int-job-title-value").innerText = "";

    document.getElementById("int-time-input").value = null;
    document.getElementById("int-modality-select").value = null;
    document.getElementById("int-location-input").value = null;

    //Turn off active row in interviews table
    const tbody = document.getElementById("int-table-body");
    Array.from(tbody.children).forEach(row => row.classList.remove("table-active"));
}

/**
 * Fetches interviews for the users from the database
 */
async function fetchInterviews() {
    try {
        const response = await fetch(`/api/interviews?user_id=${userId}`);
        const data = await response.json();

        userInterviews = data;

        convertNulls(userInterviews);
        fillIntTable();
        userApplications && hideLoader();
    } catch (error) {
        console.error("Failed to fetch interviews");
    }
}

/**
 * Converts interview object to a DOM element to be added to the interviews table.
 */
function json_to_int_row(interview) {
    //Use table-active class when the time comes to highlight current
    const row = document.createElement("tr");

    row.id = "intid-" + interview.id;

    row.innerHTML = `
        <th scope="row">${interview.company || ""}</th>
        <td>${interview.title || ""}</td>
        <td>${formatDateTime(interview.date) || ""}</td>
        <td>${capitalize(interview.modality) || ""}</td>
        <td>${interview.location || ""}</td>
    `

    const td1 = document.createElement("td");
    const editBtn = document.createElement("button");

    editBtn.type = "button";
    editBtn.classList.add('btn');
    editBtn.classList.add('btn-outline-primary');
    editBtn.innerHTML = "Edit";

    /**
     * Interview row edit button event handler
     */
    editBtn.addEventListener("click", () => {
        //If editing interview, want to remove the active application and close that window
        closeAppWindow();

        //Reset active row in interview tavle
        const tbody = document.getElementById("int-table-body");
        Array.from(tbody.children).forEach(row => row.classList.remove("table-active"));
        document.getElementById(row.id).classList.add("table-active");

        //Search for new active interview object using id of this row
        activeInterview = Object.values(userInterviews).find(int => int.id === interview.id);

        //Fill form inputs with existing values for current interview
        document.getElementById("int-time-input").value = formatDatetimeForInput(activeInterview.date);
        document.getElementById("int-modality-select").value = capitalize(activeInterview.modality);
        document.getElementById("int-location-input").value = activeInterview.location;

        //Actions to open the window
        openIntEdit();
    });
    td1.appendChild(editBtn);


    const td2 = document.createElement("td");
    const deleteBtn = document.createElement("button");

    deleteBtn.type = "button";
    deleteBtn.classList.add('btn');
    deleteBtn.classList.add('btn-outline-danger');
    deleteBtn.innerHTML = "Delete";

    /**
     * Interview row delete button event handler
     */
    deleteBtn.addEventListener("click", () => {
        //Get interview id for api
        const data = {
            id: interview.id
        }
        //If the active interview is the one to be deleted, close the edit window
        if(activeInterview && activeInterview.id === interview.id) {
            closeIntEdit();
        }
        submitPOST("/api/delete_interview", data);
    });
    td2.appendChild(deleteBtn);

    
    row.appendChild(td1);
    row.appendChild(td2);

    return row;
}

/**
 * Fills the table for interviews using the freshly retrieved data
 */
function fillIntTable() {
    const tbody = document.getElementById("int-table-body");
    tbody.innerHTML = '';

    for(let interview of userInterviews) {
        tbody.appendChild(json_to_int_row(interview));
    }
}


// #endregion



//Start 
fetchApplications();
fetchInterviews();

// #region -------------------- Helper Functions --------------------

/**
 * Converts the NULL strings of SQL in the input object into actual null values.
 */
function convertNulls(object) {
    for(let entity of object) {
        for(let key in entity) {
            if(entity[key] == "NULL" || entity[key] === "null") {
                entity[key] = null;
            }
        }
    }
}

/**
 * Submits a post request.
 * @param {String} url the api.
 * @param {Object} data the JSON data.
 * @returns the request response.
 */
async function submitPOST(url, data) {
    showLoader();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    resetAll();

    userApplications = null;
    userInterviews = null;

    fetchApplications();
    fetchInterviews();
}  

function resetAll() {
    closeAppWindow();
    closeIntEdit();
}

/**
 * Returns the string with the first letter capitalized
 */
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 *  Formats sql date to be displayed in date picker
 */
function formatDate(string) {
    if (!string) return "";
    const date = new Date(string);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${month}/${day}/${year}`;
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return "";
    const dateTime = new Date(dateTimeString);
    const options = { 
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      timeZone: "UTC",
    };
    const year = dateTime.getUTCFullYear();
    const month = dateTime.getUTCMonth();
    const day = dateTime.getUTCDate();
    const hours = dateTime.getUTCHours();
    const minutes = dateTime.getUTCMinutes();
    const formattedDateTime = new Date(Date.UTC(year, month, day, hours, minutes))
        .toLocaleString("en-US", options);
    return formattedDateTime;
}

function formatDateForInput(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatDatetimeForInput(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

function formatPhoneNumber(phoneNumberString) {
    var cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return null;
}

function formatPhoneNumberInput(input) {
    // Strip all non-numeric characters
    let phoneNumber = input.value.replace(/\D/g, '');
  
    // Format the phone number
    if (phoneNumber.length === 10) {
      phoneNumber = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      input.value = phoneNumber;
    }
}


// #endregion


// #region Loading Wheel

function showLoader() {
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    const loader = document.createElement("div");
    loader.classList.add("loader");
    overlay.appendChild(loader);
    document.body.appendChild(overlay);
}

function hideLoader() {
    const overlay = document.querySelector(".overlay");
    overlay.parentNode.removeChild(overlay);
}
// #endregion