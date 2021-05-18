document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  const h3 = document.querySelector('#inbox-name')
  h3.textContent = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`
  
  // GET the relevant mails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

      const tbody = document.createElement('tbody')
      tbody.id = 'emails-tablebody'
      tbody.innerHTML = "<tr id='emails-table-header'><th>Sender</th><th>Recipients</th><th>Subject</th><th>Timestamp</th></tr>"
                        
      // for each email, create table row and append it to emails-view
      emails.forEach(element => {

        // fields
        const id = element.id
        const sender = element.sender
        const recipients = element.recipients
        const subject = element.subject
        const timestamp = element.timestamp
        const read = element.read
        var fieldsArray = [sender, recipients, subject, timestamp]

        // create table row element with link to email
        const tr = document.createElement('tr')
        tr.addEventListener('click', function(){
          get_email(id);
        })

        // iterate through elements to populate table
        fieldsArray.forEach(element => {
          const td = document.createElement('td')
          td.innerHTML = element
          if (read){
            td.style.fontWeight = 400
          } else{
            td.style.fontWeight = 600
          }
          tr.appendChild(td)
        })

        tbody.appendChild(tr);
      });

      // replace the old tbody with the new one
      const table = document.querySelector('#emails-table')
      var old_tbody = document.querySelector('#emails-tablebody')
      old_tbody.remove()
      table.appendChild(tbody)
  })
}

function send_email(event){

  event.preventDefault();

  // get field values
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  
  // send POST request
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(status)
  .then(response => response.json())
  .then(result => {
    console.log(result)
    load_mailbox('sent')
  })
  .catch((error) => {
    console.log(error);
  });
}

async function status(res){

  // check status of response
  if(res.status != 201){
    let response = await res.json()
    throw Error(response.error)
  }
  return res
}

function get_email(email_id){
  console.log(email_id)

  // render email view 

  // update email to read
  fetch(`/emails/${email_id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true
    })
  })
}