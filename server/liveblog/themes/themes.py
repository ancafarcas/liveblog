# -*- coding: utf-8; -*-
#
# This file is part of Superdesk.
#
# Copyright 2013, 2014 Sourcefabric z.u. and contributors.
#
# For the full copyright and license information, please see the
# AUTHORS and LICENSE files distributed with this source code, or
# at https://www.sourcefabric.org/superdesk/license
from superdesk.resource import Resource
from superdesk.services import BaseService
from superdesk import get_resource_service
import os
import glob
import json
import superdesk
from eve.utils import config
from bson.objectid import ObjectId


class ThemesResource(Resource):

    schema = {
        'name': {
            'type': 'string',
            'unique': True
        },
        'label': {
            'type': 'string'
        },
        'extends': {
            'type': 'string'
        },
        'version': {
            'type': 'string'
        },
        'styles': {
            'type': 'list',
            'schema': {
                'type': 'string'
            }
        },
        'scripts': {
            'type': 'list',
            'schema': {
                'type': 'string'
            }
        },
        'options': {
            'type': 'list',
            'schema': {
                'type': 'dict'
            }
        }
    }
    datasource = {
        'source': 'themes',
        'default_sort': [('_updated', -1)]
    }
    ITEM_METHODS = ['GET', 'POST', 'DELETE']
    privileges = {'GET': 'global_preferences', 'POST': 'global_preferences',
                  'PATCH': 'global_preferences', 'DELETE': 'global_preferences'}


class ThemesService(BaseService):

    def get_local_themes_packages(self):
            embed_folder = os.path.join(os.path.dirname(os.path.realpath(__file__)),
                                        '../', 'embed', 'embed_assets', 'themes')
            for file in glob.glob(embed_folder + '/**/theme.json'):
                yield json.loads(open(file).read())

    def update_registered_theme_with_local_files(self):
        created = []
        updated = []
        for theme in self.get_local_themes_packages():
            previous_theme = self.find_one(req=None, name=theme.get('name'))
            if previous_theme:
                self.replace(previous_theme['_id'], theme, previous_theme)
                updated.append(theme)
            else:
                self.create([theme])
                created.append(theme)
        return (created, updated)

    def remove_theme(self, doc):
        doc_id = doc['_id']
        get_resource_service('themes').delete(lookup={doc_id})
        blogs_service = get_resource_service('blogs')
        blogs = blogs_service.get(req=None, lookup=dict(blog_status='open'))
        doc_id = str(doc[config.ID_FIELD])
        for blog in blogs:
            theme = blogs_service.get_theme_snapshot(blog['blog_preferences']['theme'])
            global_prefs = get_resource_service('global_preferences').get_global_prefs()
            default_theme = global_prefs.get('theme')
            print('the theme for the blog %s is: %s' % (blog['title'], theme['name']))
            if not theme['name'] != doc['name']:
                blogs_service.system_update(ObjectId(blog['_id']), {'theme': default_theme}, blog)


class ThemesCommand(superdesk.Command):

    def run(self):
        theme_service = get_resource_service('themes')
        created, updated = theme_service.update_registered_theme_with_local_files()
        print('%d themes registered' % (len(created) + len(updated)))
        if created:
            print('added:')
            for theme in created:
                print('\t+ %s %s (%s)' % (theme.get('label', theme['name']), theme['version'], theme['name']))
        if updated:
            print('updated:')
            for theme in updated:
                print('\t* %s %s (%s)' % (theme.get('label', theme['name']), theme['version'], theme['name']))


superdesk.command('register_local_themes', ThemesCommand())


class ThemesRemoveCommand(superdesk.Command):

    def run(self):
        self.remove_theme_locally()

    def remove_theme_locally(self):
        items = ThemesService.get_local_themes_packages(self)
        for item in items:
            it = superdesk.get_resource_service('themes').find_one(req=None, name=item['name'])
            superdesk.get_resource_service('themes').remove_theme(it)


superdesk.command('remove_theme', ThemesRemoveCommand())
