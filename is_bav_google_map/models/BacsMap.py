# -*- coding: utf-8 -*-
from odoo import api, fields, models


class ResPartner(models.Model):
    _inherit = 'is_bav.bacs'

    marker_color = fields.Integer(string='Marker Color', default=1)

    @api.model
    def action_cron_geolocalize(self):
        self.search(
            [
                '&',
                ('numpark', '!=', False),
                '|',
                ('latitude', '=', False),
                ('longitude', '=', False),
            ],
            limit=500,
        ).geo_localize()
        return True
