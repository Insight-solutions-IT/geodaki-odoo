# -*- coding: utf-8 -*-
from odoo import http


# class IsRfid(http.Controller):
    # @http.route('/is_bav/is_bav', auth='public')
    # def index(self, **kw):
    #     return "Hello, world"

    # @http.route('/is_bav/is_bav/bacs', auth='public')
    # def list(self, **kw):
    #     return http.request.render('is_bav.listing', {
    #         'root': '/is_bav/is_bav',
    #         'objects': http.request.env['is_bav.bac'].search([]),
    #     })

    # @http.route('/is_bav/is_bav/objects/<model("is_bav.is_bav"):obj>', auth='public')
    # def object(self, obj, **kw):
    #     return http.request.render('is_bav.object', {
    #         'object': obj
    #     })




    # @http.route('/is_bav/circuits/<int:circuit_id>', type='json', auth='public', method='GET')
    # def getSpecificCircuit(self, circuit_id):
    #     return http.request.env['is_bav.circuit'].search_read([('id', '=', circuit_id)])
