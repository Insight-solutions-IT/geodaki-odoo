# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models


class BavState(models.Model):
    _name = 'is_bav.state'
    _order = 'sequence asc'
    _description = 'Statut des EPC'

    name = fields.Char(required=True, translate=True)
    sequence = fields.Integer()

    _sql_constraints = [('bav_state_name_unique', 'unique(name)', 'Ce Statut doit être unique')]
