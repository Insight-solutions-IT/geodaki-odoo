# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models


class BAVCategory(models.Model):
    _name = 'is_bav.categories'
    _description = 'Catégories BAV'
    _order = 'sequence asc, id asc'

    _sql_constraints = [
        ('is_bav_categories_name_uniq', 'UNIQUE (name)', 'Category name must be unique')
    ]

    name = fields.Char(required=True)
    color = fields.Integer("Couleur")
    sequence = fields.Integer()
