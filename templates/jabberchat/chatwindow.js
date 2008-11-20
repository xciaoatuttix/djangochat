/*
 * Programmer: David Mattli
 */


function ChatWindow_addLine(text) {
  this.mesgHook.value = this.mesgHook.value + '\n' + text;
  this.mesgHook.scrollTop = this.mesgHook.scrollHeight; // keep textarea at bottom
}

function ChatWindow(name, sendMesgFunc) {
  var div = document.createElement('div');
  var head = document.createElement('label');
  var form = document.createElement('form');
  var mesgs = document.createElement('textarea');
  var text = document.createElement('input');
  var button = document.createElement('input');
  var chatWindow = this;

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
  button.onclick = function () {
    chatWindow.addLine(name + ': ' + text.value);
    sendMesgFunc(name, text.value);
    text.value = '';
  };
  this.divHook = div;
  this.mesgHook = mesgs;
}

ChatWindow.prototype.addLine = ChatWindow_addLine;
