document.addEventListener("DOMContentLoaded", function () {

  document.querySelector("#compose-form").onsubmit = function () {
    const recipients = document.querySelector("#compose-recipients").value;
    const subject = document.querySelector("#compose-subject").value;
    const body = document.querySelector("#compose-body").value;

    fetch("/emails", {
      method: "POST",
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
      });
    return false;
  };

  // Use buttons to toggle between views
  document.querySelector("#inbox").addEventListener("click", () => load_mailbox("inbox"));
  document.querySelector("#sent").addEventListener("click", () => load_mailbox("sent"));
  document.querySelector("#archived").addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);
  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  document.querySelector("#body").style.display = "none";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";

  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector("#body").style.display = "block";

  if (mailbox == "inbox") {
     let users = [];
    fetch("/emails/inbox")
      .then((response) => response.json())
      .then((emails) => {
        console.log(emails);
        emails.forEach((results) => {
          users.push(
            `<li> <h1>${results.subject}</h1> <p> From: ${results.sender}</p> <p>  ${results.timestamp}</p>  <button onclick="viewemail(${results.id})">View</button> </li>`
          );
          });
           if (users.length === 0) {
             document.querySelector("#body").style.display = "none";
           } else {
             document.getElementById("body").innerHTML = users.join("");
           }


        });
      
  } else if (mailbox == "sent") {
    let sent = [];
    fetch("/emails/sent")
      .then((response) => response.json())
      .then((emails) => {
        // Print emails
        console.log(emails);
          emails.forEach((results) => {
            sent.push(
              `<li> <h1>${results.subject}</h1> <p> To: ${results.recipients}</p> <p>  ${results.timestamp}</p>  <button onclick="viewemail(${results.id})">View</button> </li>`
            );
          });
          if (sent.length === 0) {
            document.querySelector("#body").style.display = "none";
          } else {
            document.getElementById("body").innerHTML = sent.join("");
          }
      });
  } else if (mailbox == "archive") {
    let archived = [];
    fetch("/emails/archive")
      .then((response) => response.json())
      .then((emails) => {
        console.log(emails);
        emails.forEach((results) => {
          archived.push(
            `<li> <h1>${results.subject}</h1> <p> To: ${results.recipients}</p> <p>  ${results.timestamp}</p>  <button onclick="unarchive(${results.id})">View</button> </li>`
          );
        });
        if (archived.length === 0) {
          document.querySelector("#body").style.display = "none";
        } else {
          document.getElementById("body").innerHTML = archived.join("");
        }
        
      });
  }
  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function viewemail(id){
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      const element = document.querySelector("#body");
      element.innerHTML = `<ul><li>From: ${email.sender}</li> <li>To: ${email.recipients}</li>
      <li>Subject: ${email.subject}</li> <li>Timestamp: ${email.timestamp}</li>  <li>Reply: <button onclick="reply(${email.id})">Reply</button> </li> <li>Archive: <button onclick="check(${email.id})">Archive</button> </li></ul>`;
      element.addEventListener("click", function () {
        console.log("This element has been clicked!");
      });
    });
}

function unarchive(id){
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      const element = document.querySelector("#body");
      element.innerHTML = `<ul><li>From: ${email.sender}</li> <li>To: ${email.recipients}</li>
      <li>Subject: ${email.subject}</li> <li>Timestamp: ${email.timestamp}</li>  <li>Unarchive: <button onclick="check(${email.id})">Unarchive</button> </li></ul>`;
      element.addEventListener("click", function () {
        console.log("This element has been clicked!");
      });
    
    });
}

function check(id){
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      if (email.archived == true){
        fetch(`/emails/${id}`, {
          method: "PUT",
          body: JSON.stringify({
            archived: false,
          }),
        });
      }
      else {
         fetch(`/emails/${id}`, {
           method: "PUT",
           body: JSON.stringify({
             archived: true,
           }),
         });
      }

    });
}

function reply(id){
document.querySelector("#emails-view").style.display = "none";
document.querySelector("#compose-view").style.display = "block";
document.querySelector("#body").style.display = "none";
 fetch(`/emails/${id}`)
   .then((response) => response.json())
   .then((email) => {
     document.querySelector("#compose-recipients").value = `${email.sender}`;
     if (email.subject.startsWith('Re: ')){
       document.querySelector("#compose-subject").value = `${email.subject}`
     }
     else{
        document.querySelector("#compose-subject").value = `Re: ${email.subject}`;
     }
     document.querySelector("#compose-body").value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;

   });
}