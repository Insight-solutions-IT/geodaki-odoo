# -*- coding: utf-8 -*-
# from odoo import http


# class IsTools(http.Controller):
#     @http.route('/is_tools/is_tools', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/is_tools/is_tools/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('is_tools.listing', {
#             'root': '/is_tools/is_tools',
#             'objects': http.request.env['is_tools.is_tools'].search([]),
#         })

#     @http.route('/is_tools/is_tools/objects/<model("is_tools.is_tools"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('is_tools.object', {
#             'object': obj
#         })
