const emails = document.getElementById('emails');
const emailDtl = document.getElementById('details');

let listOfEmails = [];
/*let unreadEmails = [];
let readEmails = [];
let favEmails = []; */

const getListApi = 'https://flipkart-email-mock.now.sh/';

emails.addEventListener('click', selectItem);

let getCall = fetch(getListApi);

async function getListFn() {
  try {
    let response = await getCall;
    let res = await response.json();
    listOfEmails = res.list;
    //unreadEmails=listOfEmails;
    //setStorageItems('unread', unreadEmails);
    if(!getStorageItems('unread')){
      setStorageItems('unread', listOfEmails.map(em=>{return em.id}));  
      setStorageItems('fav', []);
    }
    renderList(listOfEmails);
  } 
  catch(err) {
    console.log(err);
  }
}

function init() {
  getListFn();
}
init();


renderList = (list) => {
  emails.innerHTML=null;
  if (!list || !list.length){
    showDetails(false);
    return;
  }
  for(email of list){
    let li = document.createElement('li');
    // Add class
    li.className = `flex-row list-group-item ${getStorageItems('unread').includes(email.id) ? '' : 'read-bgcolor'}`;
    li.id = email.id;

    let firstDiv = document.createElement('div');
    firstDiv.className = 'col-icon';
    firstDiv.appendChild(document.createTextNode(email.from.name.charAt(0).toUpperCase()));
    li.appendChild(firstDiv);

    let secondDiv = document.createElement('div');
    secondDiv.className = 'col-9 ml-5';
    
    let i1Div = document.createElement('div');
    i1Div.appendChild(document.createTextNode(`From: ${email.from.email}`));

    
    let i2Div = document.createElement('div');
    i2Div.appendChild(document.createTextNode(`Subject: ${email.subject}`));
    
    
    let pEl = document.createElement('p');
    pEl.appendChild(document.createTextNode(email.short_description));
    
    let isFav = getStorageItems('fav').includes(email.id);

    let i3Div = document.createElement('div');
    i3Div.innerHTML = `<span id="date">${new Date(email.date).toDateString()}</span>`
                        +`<span class='right ${isFav?"shown":"hidden"}'>Favorite</span>`

    secondDiv.appendChild(i1Div)
    secondDiv.appendChild(i2Div)
    secondDiv.appendChild(pEl)
    secondDiv.appendChild(i3Div)


    li.appendChild(firstDiv);
    li.appendChild(secondDiv);
    emails.appendChild(li);
    
  }
}


let getEmailCall = (id) => fetch(getListApi+'?id='+id);

async function getEmailFn(id) {

  try {
    let response = await getEmailCall(id);
    let email = await response.json();
    renderEmail(email);
    
    let unreadEmails = getStorageItems('unread')
    let index = unreadEmails.indexOf(id);
    if (index > -1) {
      unreadEmails.splice(index, 1);
    }
    
    setStorageItems('unread', unreadEmails);
  } 
  catch(err) {
    console.log(err);
  }
}

function selectItem(event) {
  let target = event.target;

  while (target != this) {
    if (target.tagName == 'LI') {
      getEmailFn(target.id)
      target.className += " read-bgcolor";
      return;
    }
    target = target.parentNode;
  }
}


renderEmail = (email) => {
  showDetails(true);
  let selectedEmail = listOfEmails.filter(item=>{return item.id===email.id})[0]
  let innerDiv = document.createElement('div');
  innerDiv.className = 'col-12 card';
  innerDiv.innerHTML = `<div class="col-icon v-align-top">${selectedEmail.from.email.charAt(0).toUpperCase()}</div>`
                      +`<div class="col-9 ml-5">`
                      +`<h2>${selectedEmail.subject}`
                      +`<button class="accent-bgcolor right v-align-middle text-white" id="markAsFav">Mark as Fav</button>`
                      +`</h2>`
                      +`<div>${new Date(selectedEmail.date).toDateString()}</div>`
                      +`<div>${email.body}</div>`
                      +`</div>`;

  emailDtl.innerHTML=innerDiv.innerHTML;

  let markAsFav = document.getElementById('markAsFav');
  markAsFav.addEventListener('click', markAsFavFn);

  function markAsFavFn() {
    let li = document.getElementById(email.id);
    li.getElementsByClassName('right hidden')[0].className='right shown';
    
    let favEmailIds = getStorageItems('fav');
    if(favEmailIds.includes(email.id)){
      return
    }
    favEmailIds.push(email.id);
    setStorageItems('fav', favEmailIds);
  }

}

showDetails = (show) => {
  if(show){
    emails.className = "collapsed";
    emailDtl.className = 'show-details card right v-align-top';
  }
  else{
    emails.className = "expanded";
    emailDtl.className = 'hidden';
  }
  
}


const unreadBtn = document.getElementById('unreadBtn');
const readBtn = document.getElementById('readBtn');
const favBtn = document.getElementById('favBtn');

unreadBtn.addEventListener('click', showUnread);
readBtn.addEventListener('click', showRead);
favBtn.addEventListener('click', showFav);


function showUnread() {
  showDetails(false);
  document.getElementsByClassName('filter-btn')[0].className=''
  document.getElementById('unreadBtn').className='filter-btn'

  let unReadEmailIds = getStorageItems('unread');
  let unReadEmails = listOfEmails.filter( function( el ) {
    return unReadEmailIds.indexOf( el.id ) > -1;
  } );
  renderList(unReadEmails);
}

function showRead() {
  showDetails(false);
  document.getElementsByClassName('filter-btn')[0].className=''
  document.getElementById('readBtn').className='filter-btn'

  let unReadEmailIds = getStorageItems('unread');
  let readEmails = listOfEmails.filter( function( el ) {
    return unReadEmailIds.indexOf( el.id ) < 0;
  } );
  console.log(readEmails)
  renderList(readEmails);
}

function showFav() {
  showDetails(false);
  document.getElementsByClassName('filter-btn')[0].className=''
  document.getElementById('favBtn').className='filter-btn'

  let favEmailIds = getStorageItems('fav');
  let favEmails = listOfEmails.filter( function( el ) {
    return favEmailIds.indexOf( el.id ) > -1;
  } );
  renderList(favEmails);
;}


function getStorageItems(item) {
  return JSON.parse(localStorage.getItem(item));
}

function setStorageItems(item, data) {
  localStorage.setItem(item, JSON.stringify(data));
}


