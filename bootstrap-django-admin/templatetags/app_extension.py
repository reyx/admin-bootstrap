from django.conf import settings
from django.template import Library

register = Library()

def get_app_property(app_name, property):
    """Take the string value of the app"""
    try:
        return settings.APP_PARAMETERS[app_name][property]
    except NotImplementedError:
        return ""
    except Exception:
        return ""

register.filter('get_app_property', get_app_property)
