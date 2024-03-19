# -*- coding: utf-8 -*-
{
    'name': 'BAV Google Map',
    'summary': '''
        Affichage des BAV sur une carte Google maps
    ''',
    'description': '''
        Affichage des BAV sur une carte Google maps
    ''',
    'license': 'AGPL-3',
    'author': 'INSIGHT SOLUTIONS',
    'website': 'insight solutions ',
    'support': 'elbayad@gmail.com',
    'category': 'GEODAKI',
    'version': '2.0',
    'depends': [
        'base_geolocalize',
        'is_bav',
        'web_view_google_map2',
    ],
    'data': ['data/cron_bacs_geolocalize.xml',
             'views/BacsMap.xml'],
    'assets': {
        'web.assets_backend': [
            'is_bav_google_map/static/src/views/google_map/*',
        ]
    },
    'demo': [],
    'installable': True,
    'application': False,
    'auto_install': False,
}
