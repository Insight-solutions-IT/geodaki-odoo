# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, models


class BAVEquipement(models.Model):
    _name = 'is_bav.equipement'
    _description = 'BAV Equipée par'

    name = fields.Char('Nom Equipement', required=True, translate=True)
    color = fields.Integer('Color')

    _sql_constraints = [('is_bav_equipement_name_uniq', 'unique (name)', "Equipement already exists !")]
