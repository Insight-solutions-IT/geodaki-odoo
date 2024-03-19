# -*- coding: utf-8 -*-
# from odoo import http


# class IsHistorique(http.Controller):
#     @http.route('/is_historique/is_historique', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/is_historique/is_historique/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('is_historique.listing', {
#             'root': '/is_historique/is_historique',
#             'objects': http.request.env['is_historique.is_historique'].search([]),
#         })

#     @http.route('/is_historique/is_historique/objects/<model("is_historique.is_historique"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('is_historique.object', {
#             'object': obj
#         })
