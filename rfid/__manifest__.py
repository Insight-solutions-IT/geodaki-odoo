# -*- coding: utf-8 -*-
{
    'name': "rfid",

    'summary': """
        Short (1 phrase/line) summary of the module's purpose, used as
        subtitle on modules listing or apps.openerp.com""",

    'description': """
        Long description of module's purpose
    """,
    'application': True,
    'author': "Oualid",
    'website': "https://www.yourcompany.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/16.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Uncategorized',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base', 'fleet_monitoring', 'is_decoupage' ],

    # always loaded
    'data': [
        'security/ir.model.access.csv',
        'views/views.xml',
        'views/templates.xml',
    ],
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'rfid/static/src/types/*.js',
            'rfid/static/src/types/*.xml',
            'rfid/static/src/types/*.css',
            'rfid/static/src/circuits/**',
            'rfid/static/src/zones/**'

        ],
    },
}
