# -*- coding: utf-8 -*-
# from odoo import http


# class IsTaux(http.Controller):
#     @http.route('/is_taux/is_taux', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/is_taux/is_taux/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('is_taux.listing', {
#             'root': '/is_taux/is_taux',
#             'objects': http.request.env['is_taux.is_taux'].search([]),
#         })

#     @http.route('/is_taux/is_taux/objects/<model("is_taux.is_taux"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('is_taux.object', {
#             'object': obj
#         })
