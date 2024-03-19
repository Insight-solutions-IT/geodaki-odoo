# -*- coding: utf-8 -*-
# from odoo import http


# class IsPlanning(http.Controller):
#     @http.route('/is_planning/is_planning', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/is_planning/is_planning/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('is_planning.listing', {
#             'root': '/is_planning/is_planning',
#             'objects': http.request.env['is_planning.is_planning'].search([]),
#         })

#     @http.route('/is_planning/is_planning/objects/<model("is_planning.is_planning"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('is_planning.object', {
#             'object': obj
#         })
