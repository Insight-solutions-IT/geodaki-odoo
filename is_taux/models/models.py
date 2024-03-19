# -*- coding: utf-8 -*-

from odoo import models, fields, api


class is_taux(models.Model):
    _name = 'is_taux.taux'
    _description = 'Taux de réalisation'
    route=fields.Integer( index=True) #Many2one("is_decoupage.routes")
    datej=fields.Date("Date", index=True)
    circuit=fields.Many2one('is_decoupage.circuits', index=True)
    vehicule=fields.Many2one("fleet.vehicle", index=True)
    idrel=fields.Integer("Id de relation", index=True)
    heure=fields.Integer("Heure", index=True)
    li=fields.Float("Longueur", index=True)
    methode=fields.Many2one("is_decoupage.circuits.methodes", index=True)
    dh=fields.Datetime("Temps de calcule", index=True)
    pl=fields.Integer("Est planifier ?", index=True)
