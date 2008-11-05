from django.conf.urls.defaults import *
import httplib2
from urllib import urlencode


# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Example:
    # (r'^djangochat/', include('djangochat.foo.urls')),

    # Uncomment the admin/doc line below and add 'django.contrib.admindocs' 
    # to INSTALLED_APPS to enable admin documentation:
    # (r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    (r'^admin/(.*)', admin.site.root),
    (r'^chat/(?P<js_name>.+(js|css))', 'djangochat.apps.jabberchat.views.static'),
    (r'^chat/', 'djangochat.apps.jabberchat.views.login'),                   
)
