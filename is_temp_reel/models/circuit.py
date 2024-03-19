# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
from psycopg2 import sql

from odoo import tools
from odoo import api, fields, models


class FleetCir(models.Model):
    _inherit = "is_decoupage.circuits"
    

    def getCircuits(self):
        return self.env['is_decoupage.circuits'].search_read([],['id','name','frequence_id',"fonction_id","color","Secteur","frequence_id","methode_id", "group"])

    # def getCircuits(self): 
    #     #fonctions = self.env["is_rfid.fonctions"].search([("name", "in", fonction_names)])
        
    #     circuits = self.env['is_rfid.circuit'].search_read([],[])
    #     # circuits = self.env['is_rfid.circuit'].search_read([('fonction', 'in' ,['Collecte des Bacs'])],[])
    #     return circuits

