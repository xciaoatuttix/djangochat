/*
 * Programmer: David Mattli
 */
/*
 * CSS classes: userjid, userpass, connect, chatwindow, chatrecpt, chatmesg, chatsend, status, roster
 */

var BOSH_SERVICE = 'http://localhost/http-bind/';
var RESOURCE = '/workbooklol';
var stropheConnection = null;
var currentChatTarget = null;

function requestRoster(strophe_connection) {
  var query = $iq({from: 'user1@localhost/workbooklol', type: 'get', id: stropheConnection.getUniqueId()});
  query.c('query', {xmlns: 'jabber:iq:roster'} );
  stropheConnection.send(query.tree());

  return true;
}

function receiveRoster(msg) {
  if(msg.hasChildNodes()) {
    var query = msg.childNodes[0];
    $('.roster').append('<ul></ul>');
    if (query.hasChildNodes()) {
      for (var i=0; i<query.childNodes.length; ++i) {
	var listElt = document.createElement('li');
	var textNode = document.createTextNode(query.childNodes[i].getAttribute('jid'));
	listElt.onclick = setChatTarget;
	listElt.appendChild(textNode);
	$('.roster > *')[0].appendChild(listElt);

      }
    }
  }
  return true;
}


function sendMessage() {
  var jid = currentChatTarget;
  var text = $('.chatmesg').val();
  var from_user = $('.userjid').val();
  var msg_line = from_user + ": " + text;
  var message = $msg({to: jid, from: from_user, type: 'chat'}).c("body").t(text);

  $('#messages').append('<div></div>').append(document.createTextNode(msg_line));

  stropheConnection.send(message.tree());

  // Keep the handler alive...
  return true;
}

function onMessage(msg) {
  var to = msg.getAttribute('to');
  var from = msg.getAttribute('from');
  var type = msg.getAttribute('type');
  var elems = msg.getElementsByTagName('body');

  if (type == "chat" && elems.length > 0) {
    var body = elems[0]; var body_text = from + ': ' + Strophe.getText(body);
    var mesg =  $('.chatwindow').append('<div></div>');
    mesg.append(document.createTextNode(body_text));
  }
};

function onConnect(status) {
  if (status == Strophe.Status.CONNECTING) {
    $('.status')[0].value = 'Connecting...';
  } else if (status == Strophe.Status.CONNFAIL) {
    $('.status')[0].value = 'Connection Failed';
  } else if (status == Strophe.Status.DISCONNECTING) {
    $('.status')[0].value = 'Disconnecting...';
  } else if (status == Strophe.Status.DISCONNECTED) {
  $('.status')[0].value = 'Connecting...';
    $('#connect').get(0).value = 'connect';
  } else if (status == Strophe.Status.CONNECTED) {
    $('.status')[0].value = 'Connected';

    stropheConnection.addHandler(onMessage, null, 'message', null, null,  null);
    stropheConnection.addHandler(receiveRoster, 'jabber:iq:roster' , null, null, null, null);
    requestRoster();
    stropheConnection.send($pres().tree());
  }
};

function setChatTarget() {
  currentChatTarget = this.firstChild.nodeValue;
  if(currentChatTarget != null) {
        $('#entry').css("display", "block");
	$('.chatwindow')[0].firstChild.nodeValue = 'Chatting with ' + currentChatTarget + ':';

  }
}

$(document).ready(function () {
		    stropheConnection = new Strophe.Connection(BOSH_SERVICE);

		    $('#connect').click(function () {
					  var button = $('.connect').get(0);
					  if (button.value == 'connect') {
					    button.value = 'disconnect';
					    var fulljid = $('.userjid')[0].value + RESOURCE;
					    stropheConnection.connect(fulljid,
					    $('#pass').get(0).value,
					    onConnect);
					  } else {
					    button.value = 'connect';
					    stropheConnection.disconnect();
					  }
					});
					  $('.chatsend').click(sendMessage);
		  });


/* ignore the below */
function init() {
  this.stropheConnection = new Strophe.Connection(this.boshService);
  $('.connect').click(function () {
			var button = $('.connect').get(0);
			if (button.value == 'connect') {
			  button.value = 'disconnect';
			  var fulljid = $('.userjid')[0].value + RESOURCE;
			  stropheConnection.connect(fulljid,
			  $('#pass').get(0).value,
			  onConnect);
			} else {
			  button.value = 'connect';
			  stropheConnection.disconnect();
			}
		      });
  $('.chatsend').click(this.sendMessage);

};


function XmppClient(boshService, resource) {
  this.bosh_service = boshService;
  this.resource = resource;
  this.stropheConnection = null;

};
XmppClient.prototype.init = init;
XmppClient.prototype.onConnect = onConnect;
XmppClient.prototype.sendMessage = sendMessage;
XmppClient.prototype.requestRoster = requestRoster;
