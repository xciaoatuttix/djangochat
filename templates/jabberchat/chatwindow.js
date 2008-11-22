/*
 * Programmer: David Mattli
 */


function ChatWindow_addLine(text) {
  this.mesgHook.value = this.mesgHook.value + '\n' + text;
  this.mesgHook.scrollTop = this.mesgHook.scrollHeight; // keep textarea at bottom
}

function ChatWindow(clientName, toName, sendMesgFunc) {
  var div = document.createElement('div');
  var head = document.createElement('label');
  var form = document.createElement('form');
  var mesgs = document.createElement('textarea');
  var text = document.createElement('input');
  var button = document.createElement('input');
  var chatWindow = this;
  this.clearTextInput = function() {
    text.value = '';
  };
  div.setAttribute('id', toName);
  div.appendChild(head);
  div.appendChild(form);
  form.appendChild(mesgs);
  form.appendChild(text);
  form.appendChild(button);
  form.setAttribute('onSubmit', "return false");
  button.setAttribute('type', 'button');
  text.setAttribute('type', 'text');
  text.setAttribute('class', 'msgInput');
  mesgs.setAttribute('class', 'msgBody');
  head.appendChild(document.createTextNode('Chat with: ' + toName));
  mesgs.readOnly = true;
  button.value = 'Send';
  button.onclick = function() {
    sendMesgFunc(text.value);
  };

  this.divHook = div;
  this.mesgHook = mesgs;
}

ChatWindow.prototype.addLine = ChatWindow_addLine;
