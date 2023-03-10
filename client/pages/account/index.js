showLoader();

const viewPage = document.querySelector(".view-mode");
const editPage = document.querySelector(".edit-mode");

let user;

async function fetchUser() {
    try {
        const response = await fetch(`/api/user?user_id=${userId}`);
        user = await response.json();

        convertNulls(user);
        populateInfo();
        hideLoader();

    } catch (error) {
        console.error("Failed to fetch applications");
    }
}

/**
 * Converts the NULL strings of SQL in the input object into actual null values.
 */
function convertNulls(entity) {
    for(let key in entity) {
        if(entity[key] == "NULL" || entity[key] === "null") {
            entity[key] = null;
        }
    }
}

/**
 * Fills the view page for account info
 */
function populateInfo() {
    document.getElementById("first-name-value").innerText = user.f_name;
    document.getElementById("last-name-value").innerText = user.l_name;
    document.getElementById("password-value").innerText = "••••••••";
    document.getElementById("email-value").innerText = user.email;
    document.getElementById("phone-value").innerText = formatPhoneNumberFull(user.phone);

}

function populateForm() {
    document.getElementById("fname-input").value = user.f_name;
    document.getElementById("lname-input").value = user.l_name;
    document.getElementById("email-input").value = user.email;
    document.getElementById("password-input").value = user.user_password;
    document.getElementById("phone-input").value = user.phone;
    formatPhoneNumber(document.getElementById("phone-input"));
}

/**
 * Event handler for click of edit button 
 */
document.getElementById("btn-edit-user").addEventListener('click', () => {
    populateForm();
    
    viewPage.style.display = "none";
    editPage.style.display = "block";
});

/**
 * Event handler for click of delete account button
 */
document.getElementById("btn-delete-user-account").addEventListener('click', () => {
    alert("Accounts are unable to be deleted at this time.")
});

/**
 * Event handler for click of cancel edit button
 */
document.getElementById("cancel-user-edit-btn").addEventListener('click', () => {
    editPage.style.display = "none";
    viewPage.style.display = "block";

});

function formatPhoneNumber(input) {
    // Strip all non-numeric characters
    let phoneNumber = input.value.replace(/\D/g, '');
  
    // Format the phone number
    if (phoneNumber.length === 10) {
      phoneNumber = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      input.value = phoneNumber;
    }
}

function formatPhoneNumberFull(phoneNumberString) {
    var cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return null;
}
fetchUser();



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
