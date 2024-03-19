# -*- coding: utf-8 -*-

from odoo import models, fields, api
from odoo.exceptions import ValidationError

#================================================== LES TAGS =========================================

class EPCTags(models.Model):
    _name = "is_bav.tags"
    _description = "Les tags"

    idbac = fields.Many2one("is_bav.bacs", "EPC" )
    ntag = fields.Char("N tag")
    lastp1 = fields.Char("Puissance", readonly=True)
    lasttime = fields.Datetime("Dernière date de mise à jour", readonly=True)
    lng = fields.Float("Longitude", readonly=True)
    lat = fields.Float("Latitude", readonly=True)
    lastdevice = fields.Integer("Identifiant du camion", readonly=True)


    @api.constrains('ntag')
    def ntag_unique_champ(self):
        for record in self:
            if self.search_count([('ntag', '=', record.ntag)]) > 1:
                raise ValidationError("Le Tag doit être unique !")




