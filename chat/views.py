from django.http import HttpResponse
from django.template import Context, loader
from django.core.urlresolvers import reverse

def login_view(request):
    template = loader.get_template('chat/login.html')
    c = Context()
    return HttpResponse(t.render(c))

