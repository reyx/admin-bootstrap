#!/usr/bin/env python
import os
from setuptools import setup, find_packages

f = open(os.path.join(os.path.dirname(__file__), 'README.rst'))
readme = f.read()
f.close()

setup(
    name='bootstrap-django-admin',
    version='0.0.1',
    description='Twitter Bootstrap Skin for Django Admin.',
    long_description=readme,
    author='ReyX',
    author_email='reyx@reyx.com.br',
    url='https://github.com/reyx/bootstrap-django-admin',
    license='BSD',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    classifiers=[
        'Development Status :: 5 - Production/Stable',
        'Environment :: Web Environment',
        'Framework :: Django',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
    ],
    keywords='django,admin,bootstrap,theme',
)
