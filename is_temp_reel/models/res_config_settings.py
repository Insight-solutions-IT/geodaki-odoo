# -*- coding: utf-8 -*-

from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    update_intervale = fields.Integer(string='intervale de mise à jours des positions', default=10, config_parameter='is_temp_reel.update_map_seconds')

    def get_interval(self):
        value = self.env['ir.config_parameter'].sudo().get_param('is_temp_reel.update_map_seconds')
        return int(value)
