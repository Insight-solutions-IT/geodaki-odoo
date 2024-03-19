# -*- coding: utf-8 -*-
{
    'name': "is_decoupage",

    'summary': """
        Découpage, Géofences, Circuits et Planning""",

    'description': """
        Gestion du Zonning
    """,
    'application':True,
    'author': "Insight solutions",
    'website': "https://insightsolutions.ma",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/16.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'GeoDaki',
    'version': '2',

    # any module necessary for this one to work correctly
    'depends': ['base',
                'web_view_google_map_drawing'],

    # always loaded
    'data': [
        'security/ir.model.access.csv',
        'views/views.xml',
        'views/provinces.xml',
        'views/circuits.xml',
        'views/google_maps_view.xml',
        'views/templates.xml',
        'views/menu.xml',

    ],
    'assets': {
        'web.assets_backend': [
            'is_decoupage/static/src/**/*',

        ]
    },

}
