var BOSH_SERVICE = 'http://localhost/http-bind/';
var connection = null;

function log(msg)
{
    $('#log').append('<div></div>').append(document.createTextNode(msg));
}

function onConnect(status)
{
    if (status == Strophe.Status.CONNECTING) {
	log('Strophe is connecting.');
    } else if (status == Strophe.Status.CONNFAIL) {
	log('Strophe failed to connect.');
	$('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.DISCONNECTING) {
	log('Strophe is disconnecting.');
    } else if (status == Strophe.Status.DISCONNECTED) {
	log('Strophe is disconnected.');
	$('#connect').get(0).value = 'connect';
	$('#entry').css("display", "block");
    } else if (status == Strophe.Status.CONNECTED) {
	log('Strophe is connected.');
      $('#entry').css("display", "block");

	connection.addHandler(onMessage, null, 'message', null, null,  null);
	connection.send($pres().tree());
    }
}

function onMessage(msg) {
  var to = msg.getAttribute('to');
  var from = msg.getAttribute('from');
  var type = msg.getAttribute('type');
  var elems = msg.getElementsByTagName('body');

  if (type == "chat" && elems.length > 0) {
    var body = elems[0];
   // body = from + ": " + body;


//	var reply = $msg({to: from, from: to, type: 'chat'}).cnode(body);
//	connection.send(reply.tree());
    var body_text = from + ': ' + Strophe.getText(body);
    $('#messages').append('<div></div>').append(document.createTextNode(body_text));
  }

    // we must return true to keep the handler alive.
    // returning false would remove it after it finishes.
  return true;
}

function sendMessage() {
  var jid = $('#outjid').val();
  var text = $('#outtext').val();
  var from_user = $('#jid').val();
  var msg_line = from_user + ": " + text;
  var message = $msg({to: jid, from: from_user, type: 'chat'}).c("body").t(text);

  $('#messages').append('<div></div>').append(document.createTextNode(msg_line));

  connection.send(message.tree());

  // Keep the handler alive...
  return true;
}

$(document).ready(function () {
    connection = new Strophe.Connection(BOSH_SERVICE);

    // Uncomment the following lines to spy on the wire traffic.
    //connection.rawInput = function (data) { log('RECV: ' + data); };
    //connection.rawOutput = function (data) { log('SEND: ' + data); };

    // Uncomment the following line to see all the debug output.
    //Strophe.log = function (level, msg) { log('LOG: ' + msg); };


      $('#connect').click(function () {
			   var button = $('#connect').get(0);
			   if (button.value == 'connect') {
			     button.value = 'disconnect';

			     connection.connect($('#jid').get(0).value,
						$('#pass').get(0).value,
						onConnect);
			   } else {
			     button.value = 'connect';
			     connection.disconnect();
			   }
			  });
		    $('#send').click(sendMessage);
});
