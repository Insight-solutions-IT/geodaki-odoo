# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models


class BavServiceType(models.Model):
    _name = 'is_bav.service.type'
    _description = 'Bav Service Type'
    _order = 'name'

    name = fields.Char(required=True, translate=True)
    category = fields.Selection([
        ('Curatif', 'Entretien Curatif'),
        ('Preventif', 'Entretien Préventif')
        ], 'Category', required=True, help='Choisir le type d''entretien')
