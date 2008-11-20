
var BOSH_URL = 'http://localhost/http-bind/';
var RESOURCE = '/workbook';

var client = new XmppClient(BOSH_URL, RESOURCE);

$(document).ready(function() {
		    client.init();
		    $('.rosterEntry').click(function() {
					      alert('oh hai!');
					    });
		  });