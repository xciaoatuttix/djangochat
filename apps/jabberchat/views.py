from django.http import HttpResponse
from django.template import Context, loader
from django.core.urlresolvers import reverse

def login(request):
    template = loader.get_template('jabberchat/xmppchat.html')
    c = Context()
    return HttpResponse(template.render(c))

def static(request, js_name):
    template = loader.get_template('jabberchat/' + js_name)
    c = Context()
    return HttpResponse(template.render(c));
