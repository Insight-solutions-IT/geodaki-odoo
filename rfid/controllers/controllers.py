# -*- coding: utf-8 -*-
# from odoo import http


# class Rfid(http.Controller):
#     @http.route('/rfid/rfid', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/rfid/rfid/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('rfid.listing', {
#             'root': '/rfid/rfid',
#             'objects': http.request.env['rfid.rfid'].search([]),
#         })

#     @http.route('/rfid/rfid/objects/<model("rfid.rfid"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('rfid.object', {
#             'object': obj
#         })
