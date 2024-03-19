# -*- coding: utf-8 -*-
{
    'name': "is_temp_reel",

    'summary': """
Suivit des véhicules en temps réel.
        """,

    'description': """
        Suivit des véhicules en temps réel.
    """,

    'author': "insight solutions",
    'website': "https://www.insightsolutions.ma",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/16.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'GeoDaki',
    'version': '2.0',

    # any module necessary for this one to work correctly
    'depends': ['base','fleet_monitoring','fleet','is_tools'],
    #'depends': ['base','fleet_monitoring','fleet','is_decoupage','is_tools'],

    # always loaded
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'views/views.xml',
        'views/templates.xml',
        'views/res_config_settings_views.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
    'application': True,
    'assets': {
        'web.assets_backend': [
            'is_temp_reel/static/src/**/*',
        ],
    },
}
