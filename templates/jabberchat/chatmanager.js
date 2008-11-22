/* Programmer: David Mattli */

function ChatManager_receiveMessage(chatmngr, msg) {
  var to = msg.getAttribute('to');
  var from = msg.getAttribute('from');
  var type = msg.getAttribute('type');
  var elems = msg.getElementsByTagName('body');
  var chatName = null;
  var otherName = null;

  if (to == $('.userjid')[0].value || to == $('.userjid')[0].value + RESOURCE) {
    chatmngr.processIncomingMessage(msg);
  } else{
    chatmngr.processOutgoingMessage(msg);
  }

  return true;
}

function ChatManager_processOutgoingMessage(msg) {
  var to = msg.getAttribute('to');
  var from = msg.getAttribute('from');
  var type = msg.getAttribute('type');
  var elems = msg.getElementsByTagName('body');
  var chatName = to.split('/')[0];

  if(this.openChats[chatName]) {
    var entry = chatName + ': ' + Strophe.getText(elems[0]);
    this.openChats[chatName].addLine(entry);
    this.openChats[chatName].clearTextInput();
  }

  return true;
}

function ChatManager_processIncomingMessage(msg) {
  var to = msg.getAttribute('to');
  var from = msg.getAttribute('from');
  var type = msg.getAttribute('type');
  var elems = msg.getElementsByTagName('body');
  var chatName = from.split('/')[0];

  if (this.openChats[chatName] != null) {
    var entry = chatName + ": " + Strophe.getText(elems[0]);
    this.openChats[chatName].addLine(entry);
    this.openChats[chatName].clearTextInput();
  } else {
    var newChatW = new ChatWindow(otherName, chatName,
				  function(mesgText) {
				    chatmngr.sendMesgFunc(chatName, mesgText);
				 });

    this.openChats[chatName] = newChatW;
    newChatW.addLine(chatName + ": " + Strophe.getText(elems[0]));
    newChatW.clearTextInput();
   // this.hook.appendChild(newChatW);
   $('#messages')[0].appendChild(newChatW.divHook);
  }
  return true;
}

function ChatManager_registerMessage(to, text) {
  to = to.split('/')[0];
  this.openChats[to].addLine(text);
  this.openChats[to].clearTextInput();
  return true;
}

function ChatManager_openChat(chatmngr, clientName, chatName) {
  var manager = chatmngr;
  var newChatW = new ChatWindow(clientName, chatName,
				function(mesgText) {
				  manager.sendMesgFunc(chatName, mesgText);
				});

  if (chatmngr.openChats[chatName] == null) {
    chatmngr.openChats[chatName] = newChatW;
    $('#messages')[0].appendChild(newChatW.divHook);
  }
    return true;
}

function ChatManager(mesgWindowHook, clientName, sendMesgFunc) {
  this.openChats = new Array();
  this.mesgWindowHook = mesgWindowHook;
  this.sendMesgFunc = sendMesgFunc;
  this.clientName = clientName;
  var chatMngr = this; // lexical var to close over
  this.receiveMessage = function (mesg) {
    chatMngr._receiveMessage(chatMngr, mesg);
  };
  this.openChat = function (mesg) {
    chatMngr._openChat(chatMngr, clientName, mesg);
  };
}

ChatManager.prototype._receiveMessage = ChatManager_receiveMessage;
ChatManager.prototype._openChat = ChatManager_openChat;
ChatManager.prototype.registerMessage = ChatManager_registerMessage;
ChatManager.prototype.processOutgoingMessage = ChatManager_processOutgoingMessage;
ChatManager.prototype.processIncomingMessage = ChatManager_processIncomingMessage;