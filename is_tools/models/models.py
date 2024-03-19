# -*- coding: utf-8 -*-

from odoo import models, fields, api

class IsHistoriqueDh(models.Model):
    _name = 'is_tools.dh'
    _description = ' DH'

   
    datej = fields.Date(string='Date')
    deviceid = fields.Many2one('fleet.vehicle', string='Device ID')
    activite = fields.Char(string='Activite')
    contact = fields.Char(string='Contact')
    arret = fields.Char(string='Arret')
    roulage = fields.Char(string='Roulage')

    _sql_constraints = [
        ('dh_idx', 'unique (datej, deviceid)', 'Unique constraint on date and device'),
    ]


class IsHistoriqueVd(models.Model):
    _name = 'is_tools.vd'
    _description = ' VD'

    datej = fields.Date(string='Date')
    dist = fields.Float(string='Distance')
    vit = fields.Float(string='Vitesse')
    deviceid = fields.Many2one('fleet.vehicle', string='Device ID')
    vitmin = fields.Float(string='Vitesse Min')
    vitmax = fields.Float(string='Vitesse Max')
    km = fields.Float(string='Kilométrage')
    gaz = fields.Float(string='Consommation de Gaz')

   

# class is_tools(models.Model):
#     _name = 'is_tools.is_tools'
#     _description = 'is_tools.is_tools'

#     name = fields.Char()
#     value = fields.Integer()
#     value2 = fields.Float(compute="_value_pc", store=True)
#     description = fields.Text()
#
#     @api.depends('value')
#     def _value_pc(self):
#         for record in self:
#             record.value2 = float(record.value) / 100
