# -*- coding: utf-8 -*-

from odoo import models, fields, api
from odoo.exceptions import ValidationError

#================================================== LES CAPTEURS DE NIVEAUX=========================================

class EPCCapNiv(models.Model):
    _name = "is_bav.capniv"
    _description = "Les Capteurs de niveaux"

    idbac = fields.Many2one("is_bav.bacs", "EPC")
    identifiant = fields.Char("Identifiant")
    lastp1 = fields.Char("Puissance" , readonly=True)
    lasttime = fields.Datetime("Dernière date de mise à jour", readonly=True)


    @api.constrains('identifiant')
    def identifiant_unique_champ(self):
        for record in self:
            if self.search_count([('identifiant', '=', record.identifiant)]) > 1:
                raise ValidationError("L''identifiant doit être unique !")




