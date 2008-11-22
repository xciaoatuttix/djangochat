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



function XmppClient_init() {
  var client = this; // Allows the callback to close over reference to this
  this.clientName = $('.userjid')[0].value + this.resourceName;
  this.stropheConnection = new Strophe.Connection(this.boshUrl);
  this.chatManager = new ChatManager(document.getElementById(this.messageHook),
				     this.clientName,
				     this.sendMessage);

  $('.connect').click(function () {
			var button = $('.connect').get(0);
			if (button.value == 'connect') {
			  button.value = 'disconnect';
			  var fulljid = $('.userjid')[0].value + client.resourceName;
			  client.stropheConnection.connect(fulljid,
					     $('.userpass').get(0).value,
					     client.onConnect);
			} else {
			  button.value = 'connect';
			  client.stropheConnection.disconnect();
			 }
			}
		     );
}

function XmppClient_onConnect(client, status) {
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
      client.stropheConnection.addHandler(client.onMessage, null, 'message', null, null,  null);
      client.stropheConnection.addHandler(client.receiveRoster, 'jabber:iq:roster' , null, null, null, null);
      client.requestRoster();
      client.stropheConnection.send($pres().tree());


    }
}


function XmppClient_openMessage(caller, client) {
  var clickedUser = caller.firstChild.nodeValue;
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

  client.chatManager.openChat(clickedUser);
  return true;
}


function XmppClient_onMessage(client, msg) {
  var to = msg.getAttribute('to');
  var from = msg.getAttribute('from');
  var type = msg.getAttribute('type');
  var elems = msg.getElementsByTagName('body');

  if (type == "chat" && elems.length > 0) {
    var body = elems[0];
    var body_text = from + ': ' + Strophe.getText(body);
    client.chatManager.receiveMessage(msg);
  }
    // we must return true to keep the handler alive.
    // returning false would remove it after it finishes.
  return true;
}

function XmppClient_sendMessage(client, recipient, messageText) {
  var from = $('.userjid')[0].value + client.resourceName;
  var message = $msg({to: recipient, from: from, type: 'chat'}).c("body").t(messageText);
  client.chatManager.receiveMessage(message.tree()); // So message shows up in client
  client.stropheConnection.send(message.tree());
  return true;
}


function XmppClient_requestRoster(client) {
  var query = $iq({from: $('.userjid')[0].value + client.resourceName, type: 'get', id: client.stropheConnection.getUniqueId()});
  query.c('query', {xmlns: 'jabber:iq:roster'} );
  client.stropheConnection.send(query.tree());

  return true;
}

function XmppClient_receiveRoster(client, msg) {
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
	col.onclick = client.openMessage;
	$('#rosterTable')[0].appendChild(row);

      }
      $('.roster > *')[0].setAttribute('class', 'rosterList');
    }
  }

  return true;
}

function XmppClient(boshUrl, resourceName) {
  this.boshUrl = boshUrl;
  this.resourceName = resourceName;
  this.stropheConnection = null;
  this.chatManager = null;
  this.messageHook = 'messages';
  this.clientName = null;
  var client = this; // We close over this

  this.onConnect = function(status) {
    client._onConnect(client, status);
  };

  this.openMessage = function() {
    client._openMessage(this, client);
  };

  this.onMessage = function(mesg) {
    client._onMessage(client, mesg);
  };

  this.sendMessage = function(recipient, message) {
    client._sendMessage(client, recipient, message);
  };

  this.requestRoster = function() {
    client._requestRoster(client);
  };

  this.receiveRoster = function(msg) {
    client._receiveRoster(client, msg);
  };

}

XmppClient.prototype.init = XmppClient_init;
XmppClient.prototype._onConnect = XmppClient_onConnect;
XmppClient.prototype._openMessage = XmppClient_openMessage;
XmppClient.prototype._onMessage = XmppClient_onMessage;
XmppClient.prototype._sendMessage = XmppClient_sendMessage;
XmppClient.prototype._requestRoster = XmppClient_requestRoster;
XmppClient.prototype._receiveRoster = XmppClient_receiveRoster;