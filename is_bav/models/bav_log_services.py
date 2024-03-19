# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import api, fields, models, _

class BavLogServices(models.Model):
    _name = 'is_bav.log.services'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _rec_name = 'service_type_id'
    _description = 'Services pour EPC'

    active = fields.Boolean(default=True)
    bacs_id = fields.Many2one('is_bav.bacs', 'EPC', required=True)

    amount = fields.Float('Cost')
    description = fields.Char('Description')
    date = fields.Date(help='Date when the cost has been executed', default=fields.Date.context_today)
    notes = fields.Text()
    service_type_id = fields.Many2one(
        'is_bav.service.type', 'Service Type', required=True, raise_if_not_found=False)
    state = fields.Selection([
        ('nouveau', 'Nouveau'),
        ('encours', 'En cours'),
        ('fait', 'Fait'),
        ('annuler', 'Annulé'),
    ], default='nouveau', string='Statut', group_expand='_expand_states')

    # @api.depends('vehicle_id')
    # def _compute_purchaser_id(self):
    #     for service in self:
    #         service.purchaser_id = service.vehicle_id.driver_id

    def _expand_states(self, states, domain, order):
        return [key for key, dummy in type(self).state.selection]
