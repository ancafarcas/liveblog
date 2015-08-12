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



class PostsResource(Resource):
    """A class defining and configuring the /posts API endpoint."""

    item_url = 'regex("[\w,.:-]+")'


    schema = {
        'headline': {'type': 'string'},
        'post_status': {'type': 'string'}
#         'published_date': {'type': 'datetime'} 
    }

    datasource = {
        'source': 'archive',
        'elastic_filter': {'term': {'particular_type': 'post'}},
        'default_sort': [('_updated', -1)]
    }

    item_methods = ['GET']
    resource_methods = ['GET']
