# -*- coding: utf-8 -*-
{
    'name' : 'is_acces_video',
    'version' : '1.0',
    'summary': 'is_acces_video',
    'sequence': -1,
    'description': """is_acces_video""",
    'category': 'is_acces_video',
    'depends' : ['base', 'web', 'point_of_sale'],
    'data': [
        'security/ir.model.access.csv',
        'views/StreamView.xml',
        
        'views/odoo_services.xml',
    ],
    'demo': [
    ],
    'installable': True,
    'application': True,
    'assets': {
        'web.assets_backend': [
            'is_acces_video/static/src/components/*/*.js',
            'is_acces_video/static/src/components/*/*.xml',
            'is_acces_video/static/src/components/*/*.scss',
        ],

    },
}