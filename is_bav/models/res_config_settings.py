# -*- coding: utf-8 -*-
from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    usefixpos = fields.Boolean(string="Utilisation de la position fixe ",config_parameter='is_bav.usefixpos')
