# -*- coding: utf-8 -*-
# from odoo import http


# class IsAnomalies(http.Controller):
#     @http.route('/is_anomalies/is_anomalies', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/is_anomalies/is_anomalies/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('is_anomalies.listing', {
#             'root': '/is_anomalies/is_anomalies',
#             'objects': http.request.env['is_anomalies.is_anomalies'].search([]),
#         })

#     @http.route('/is_anomalies/is_anomalies/objects/<model("is_anomalies.is_anomalies"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('is_anomalies.object', {
#             'object': obj
#         })
