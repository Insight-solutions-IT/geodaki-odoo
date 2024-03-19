# -*- coding: utf-8 -*-
{
    'name': 'Access Manager Ninja',

    'summary': """Access Manager Ninja is an advanced management application that secure your data by granting specific rights 
     and permissions to user profiles. With centralized control, you can easily manage access to fields, models, menus, 
     records, buttons, tabs and other crucial components, saving valuable time and effort. All in one Access Management App, 
     easier than record rules setup, centralized access rules, user wise access rules, show only what is needed for users, 
     Access rules setup, Easy access rights setup, Hide Any Menu, Any Field, Any Report, Any Button, Easy To Configure, Hide fields, 
     Hide Buttons, Hide Tabs, Hide views, Hide Contacts, Hide Menus, Hide submenus, Hide sub-menus, Hide reports, Hide actions, 
     Hide server actions, Hide import, Hide delete, Hide archive, Hide Apps, Hide object buttons, Hide action buttons, Hide smart buttons, 
     Readonly Any Field, read only user, readonly user, Hide create, Hide duplicate, Control every fields, Control every views, 
     Control every buttons, Control every actions, Multi Company supported, Restrict/Read-Only User, Restrict/Read-Only Apps, 
     Restrict/Read-Only Fields, Restrict/Read-Only Export, Restrict/Read-Only  Archive, Restrict/Read-Only Actions, 
     Restrict/Read-Only Views, Restrict/Read-Only Reports, Restrict/Read-Only Delete items, Manage Access rights from one place, 
     Hide Tabs and buttons, Multi Company supported, Access group management, Users mass updating, Access organizational structure, 
     Odoo user rights, Access rights, User security roles, readonly whole system, set password expiry  """,

    'description': """All in one Access Management App, 
      easier than record rules setup ,
      centralized access rules,
      user wise access rules, 
      show only what is needed for users, 
      Access rules setup, 
      Easy access rights setup, 
      Hide Any Menu, 
      Any Field,
      Any Report, 
      Any Button,
      Easy To Configure,
      Hide fields, 
      Hide Buttons, 
      Hide Tabs, 
      Hide views, 
      Hide Contacts, Hide Menus, 
      Hide submenus, 
      Hide sub-menus,
      Hide reports, 
      Hide actions, 
      Hide server actions, 
      Hide import, 
      Hide delete, 
      Hide archive, 
      Hide Apps, 
      Hide object buttons, 
      Hide action buttons, 
      Hide smart buttons, 
      Readonly Any Field, 
      read only user, 
      readonly user, 
      Hide create, 
      Hide duplicate, 
      Control every fields, 
      Control every views, 
      Control every buttons, 
      Control every actions. 
      Multi Company supported, 
      Restrict/Read-Only User, 
      Restrict/Read-Only Apps, 
      Restrict/Read-Only Fields, 
      Restrict/Read-Only Export, 
      Restrict/Read-Only  Archive, 
      Restrict/Read-Only Actions, 
      Restrict/Read-Only Views, 
      Restrict/Read-Only Reports, 
      Restrict/Read-Only Delete items, 
      Manage Access rights from one place, 
      Hide Tabs and buttons, 
      Multi Company supported, 
      Access group management, 
      Users mass updating, 
      Access organizational structure, 
      Odoo user rights,
      Access rights, 
      User security roles,
      readonly whole system, 
      set password expiry """,

    'author': 'Ksolves India Ltd.',
    'maintainer': 'Ksolves India Ltd.',
    'live_test_url': 'https://amninja.kappso.in/web/demo_login',
    'support': 'sales@ksolves.com',
    'version': '16.1.0.1',
    'website': 'https://store.ksolves.com/',
    'images': ['static/description/Access Manager Ninja Banner.png'],
    'depends': ['base', 'auth_signup', 'web', 'base_setup'],
    'external_dependencies': {
        'python': ['openpyxl', 'werkzeug', 'lxml'],
    },
    'data': [
        'security/ir.model.access.csv',
        'data/ir_cron.xml',
        "data/ir_module_category.xml",
        "data/user_profiles_cron.xml",
        'data/password_expire_mail.xml',
        'views/res_users_view.xml',
        "views/user_profiles.xml",
        "views/res_groups.xml",
        'views/user_management_view.xml',
        'views/reset_password.xml',
        'views/general_settings_view.xml',
    ],
    'post_init_hook': 'ks_post_install_report_action_hook',
    'demo': [],
    'currency': 'EUR',
    'price': '177.29',
    'assets': {
        'web.assets_backend': [
            'ks_access_manager_ninja/static/src/js/hide_action_buttons.js',
        ],
        'web.assets_frontend': [
            'ks_access_manager_ninja/static/src/js/eye_slash.js',

        ],
    },

    'application': True,
    'installable': True,
    'license': 'OPL-1',
}
