/* Programmer: David Mattli */


function ChatManager_receiveMessage(chatmngr, msg) {
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
    this.openChats[chatName].addLine(entry);
  } else {
    var newChatW = new ChatWindow(chatName, chatmngr.sendMesgFunc);
    this.openChats[chatName] = newChatW;
    newChatW.addLine(chatName + ": " + Strophe.getText(elems[0]));
   // this.hook.appendChild(newChatW);
   $('#messages')[0].appendChild(newChatW.divHook);
  }
  return true;
}

function ChatManager_openChat(chatmngr, chatName) {
  chatName = chatName.split('/')[0];
  var newChatW = new ChatWindow(chatName, chatmngr.sendMesgFunc);
  if (chatmngr.openChats[chatName] == null) {
    chatmngr.openChats[chatName] = newChatW;
    $('#messages')[0].appendChild(newChatW.divHook);
  }
    return true;
}

function ChatManager(mesgWindowHook, sendMesgFunc) {
  this.openChats = new Array();
  this.mesgWindowHook = mesgWindowHook;
  this.sendMesgFunc = sendMesgFunc;
  var chatMngr = this; // lexical var to close over
  this.receiveMessage = function (mesg) {
    chatMngr._receiveMessage(chatMngr, mesg);
  };
  this.openChat = function (mesg) {
    chatMngr._openChat(chatMngr, mesg);
  };
}

ChatManager.prototype._receiveMessage = ChatManager_receiveMessage;
ChatManager.prototype._openChat = ChatManager_openChat;
