# -*- coding: utf-8 -*-
{
    'name': "is_bav",

    'summary': """
        Gestion des Bornes d’Apport Volontaire""",

    'description': """
        Bornes d’Apport Volontaire
    """,
    'application':True,
    'author': "INSIGHT SOLUTIONS",
    'website': "https://www.insighthsolution.ma",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/16.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'GeoDaki',
    'version': '2.0',

    # any module necessary for this one to work correctly
    'depends': ['base','mail'],

    # always loaded
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'views/views.xml',
        'views/templates.xml',
        'views/res_config_settings_views.xml',
        'data/bav_data.xml',
    ],

    'assets': {
        'web.assets_backend': [
            'is_bav/static/src/**/*',

        ]
    },
    'license': 'LGPL-3',
}
