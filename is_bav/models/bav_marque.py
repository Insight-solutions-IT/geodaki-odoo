# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models


class BAVMarque(models.Model):
    _name = 'is_bav.marque'
    _order = 'sequence asc'
    _description = 'Les Marques'

    name = fields.Char(required=True, translate=True)
    image_128 = fields.Image("Logo", max_width=128, max_height=128)
    sequence = fields.Integer()

    _sql_constraints = [('is_bav_Marque_name_unique', 'unique(name)', 'Marque name already exists')]

