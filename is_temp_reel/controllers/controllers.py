# -*- coding: utf-8 -*-
# from odoo import http


# class IsTempReel(http.Controller):
#     @http.route('/is_temp_reel/is_temp_reel', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/is_temp_reel/is_temp_reel/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('is_temp_reel.listing', {
#             'root': '/is_temp_reel/is_temp_reel',
#             'objects': http.request.env['is_temp_reel.is_temp_reel'].search([]),
#         })

#     @http.route('/is_temp_reel/is_temp_reel/objects/<model("is_temp_reel.is_temp_reel"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('is_temp_reel.object', {
#             'object': obj
#         })
