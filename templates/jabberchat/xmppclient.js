/*
 * Programmer: David Mattli
 */

/*
 * CSS classes: userjid, userpass, connect, chatwindow, chatrecpt, chatmesg, chatsend, status, roster
 */


/*
 * XmppClient alone has the following hooks:
 * class = connect: button
 * class = userjid: username to connect as
 * class = userpass: password to connect as
 * class = chatwindow: div generated html goes under
 */

var BOSH_SERVICE = 'http://localhost/http-bind/';
var RESOURCE = '/workbooklol';
var stropheConnection = null;
var CM = null;

function xmppInit() {
  stropheConnection = new Strophe.Connection(BOSH_SERVICE);
  CM = new ChatManager(document.getElementById('messages'));
  $('.connect').click(function () {
			var button = $('.connect').get(0);
			if (button.value == 'connect') {
			  button.value = 'disconnect';
			  var fulljid = $('.userjid')[0].value + RESOURCE;
			  stropheConnection.connect(fulljid,
					     $('.userpass').get(0).value,
					     onConnect);
			} else {
			  button.value = 'connect';
			  connection.disconnect();
			 }
			}
		     );
}

function onMessage(msg) {
  var to = msg.getAttribute('to');
  var from = msg.getAttribute('from');
  var type = msg.getAttribute('type');
  var elems = msg.getElementsByTagName('body');

  if (type == "chat" && elems.length > 0) {
    var body = elems[0];
    var body_text = from + ': ' + Strophe.getText(body);
    CM.addMessage(msg);
  }
    // we must return true to keep the handler alive.
    // returning false would remove it after it finishes.
  return true;
}

function requestRoster() {
  var query = $iq({from: $('.userjid')[0].value + RESOURCE, type: 'get', id: stropheConnection.getUniqueId()});
  query.c('query', {xmlns: 'jabber:iq:roster'} );
  stropheConnection.send(query.tree());

  return true;
}

function sendMessage(recipient, messageText) {
  var from = $('.userjid')[0].value + RESOURCE;
  var message = $msg({to: recipient, from: from, type: 'chat'}).c("body").t(messageText);
  stropheConnection.send(message.tree());
  CM.addMessage(message.tree());
  return true;
}


function receiveRoster(msg) {
  if(msg.hasChildNodes()) {
    var query = msg.childNodes[0];
    var table = document.createElement('table');
    table.setAttribute('id','rosterTable');
    $('.roster').append(table);
    if (query.hasChildNodes()) {
      for (var i=0; i<query.childNodes.length; ++i) {
	var row = document.createElement('tr');
	var col = document.createElement('td');
	row.appendChild(col);
	row.setAttribute('class', 'rosterEntry');
	var textNode = document.createTextNode(query.childNodes[i].getAttribute('jid'));
	col.appendChild(textNode);
	col.onclick = openMessage;
	$('#rosterTable')[0].appendChild(row);

      }
      $('.roster > *')[0].setAttribute('class', 'rosterList');
    }
  }

  return true;
}

function openMessage() {
  var clickedUser = this.firstChild.nodeValue;
  var message = document.createElement('div');
  var chatTable = document.createElement('table');
  var form = document.createElement('form');
  var input = document.createElement('input');
  var sendButton = document.createElement('input');
  var currentChat = $('#messageTable');

/*  if(currentChat.length == 0) {
    var head = document.getElementById('messagesHead');
    head.firstChild.nodeValue = 'Chatting with: ' + clickedUser;
    $('#messages').remove('table');
  }
*/
  CM.openChat(clickedUser);
  return true;
}


function onConnect(status) {
   if (status == Strophe.Status.CONNECTING) {
//	log('Strophe is connecting.');
    } else if (status == Strophe.Status.CONNFAIL) {
//	log('Strophe failed to connect.');
	$('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.DISCONNECTING) {
//	log('Strophe is disconnecting.');
    } else if (status == Strophe.Status.DISCONNECTED) {
//	log('Strophe is disconnected.');
           $('#login').css("display", "block");
	$('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.CONNECTED) {
      $('#status')[0].firstChild.nodeValue = 'Connected';
      $('#login').css("display", "none");
      stropheConnection.addHandler(onMessage, null, 'message', null, null,  null);
      stropheConnection.addHandler(receiveRoster, 'jabber:iq:roster' , null, null, null, null);
      requestRoster();
      stropheConnection.send($pres().tree());


    }
}

function ChatManager_addMessage(msg) {
  var to = msg.getAttribute('to');
  var from = msg.getAttribute('from');
  var type = msg.getAttribute('type');
  var elems = msg.getElementsByTagName('body');
  var chatName = null;

  if (to == $('.userjid')[0].value || to == $('.userjid')[0].value + RESOURCE) {
    chatName = from;  // Message from someone
  } else{
    chatName = to; // Message to someone
  }
  chatName = chatName.split('/')[0]; // strip the resource...

  if (this.openChats[chatName] != null) {
    var entry = chatName + ": " + Strophe.getText(elems[0]);
    this.openChats[chatName].addMessage(entry);
  } else {
    var newChatW = new ChatWindow(chatName);
    this.openChats[chatName] = newChatW;
    newChatW.addMessage(chatName + ": " + Strophe.getText(elems[0]));
   // this.hook.appendChild(newChatW);
   $('#messages')[0].appendChild(newChatW.divHook);
  }
  return true;
}

function ChatManager_openChat(chatName) {
  chatName = chatName.split('/')[0];
  var newChatW = new ChatWindow(chatName);
  if (this.openChats[chatName] == null) {
    this.openChats[chatName] = newChatW;
    $('#messages')[0].appendChild(newChatW.divHook);
  }
    return true;
}

function ChatManager(hook) {
  this.openChats = new Array();
  this.hook = hook;
}

ChatManager.prototype.addMessage = ChatManager_addMessage;
ChatManager.prototype.openChat = ChatManager_openChat;


function ChatWindow_addMessage(text) {
  this.mesgHook.value = this.mesgHook.value + '\n' + text;
  this.mesgHook.scrollTop = this.mesgHook.scrollHeight; // keep textarea at bottom
}

function ChatWindow(name) {
  var div = document.createElement('div');
  var head = document.createElement('label');
  var form = document.createElement('form');
  var mesgs = document.createElement('textarea');
  var text = document.createElement('input');
  var button = document.createElement('input');

  div.setAttribute('id', name);
  div.appendChild(head);
  div.appendChild(form);
  form.appendChild(mesgs);
  form.appendChild(text);
  form.appendChild(button);
  form.setAttribute('onSubmit', "return false");
  button.setAttribute('type', 'button');
  text.setAttribute('type', 'text');
  mesgs.setAttribute('class', 'msgBody');
  head.appendChild(document.createTextNode('Chat with: ' + name));
  mesgs.readOnly = true;
  button.value = 'Send';
  button.onclick = function() {
		     if (text.value != '') {
		       sendMessage(name, text.value);
		       text.value = '';
		       mesgs.scrollTop = mesgs.scrollHeight; // keep textarea at bottom
		       }
  };
  this.divHook = div;
  this.mesgHook = mesgs;
}

ChatWindow.prototype.addMessage = ChatWindow_addMessage;