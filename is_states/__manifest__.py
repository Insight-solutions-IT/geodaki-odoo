{
        'name': 'Etats',
        'description': '',
        'author': 'Insight Solutions',
        'depends': ['base'],
        'application': True,
        'version': '2.0',
        'license': 'AGPL-3',
        # 'support': 'yvandotet@yahoo.fr',
        # 'website': 'https://github.com/YvanDotet/query_deluxe/',
        'installable': True,


        'assets': {

         'web.assets_backend': [
        'is_states/static/src/js/tree_button.js',
        'is_states/static/src/xml/tree_button.xml',
        'is_states/static/src/js/queryExecution.js',
        'is_states/static/src/xml/queryExecution.xml',
        

   ],

},

        'data': [
            'security/security.xml',
            'security/ir.model.access.csv',

            'views/query_deluxe_views.xml',

            'wizard/pdforientation.xml',

            'report/print_pdf.xml',

            'datas/data.xml',
            'wizard/displayquery.xml',
            ],

        'images': ['static/description/banner.gif']
}