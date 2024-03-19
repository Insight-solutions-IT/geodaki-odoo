# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
from psycopg2 import sql

from odoo import tools
from odoo import api, fields, models


class FleetBac(models.Model):
    _name = "is_bacs.icon_view"
    _description = "Fleet Analysis Report"
    _auto = False
    # _order = 'date_start desc'

    idbac = fields.Integer(string='ID BAC')
    lastupdateRFID = fields.Datetime(string='Last Update RFID')
    freqlavage = fields.Many2one("is_bav.frequences", "Icon")
    freqcollecte = fields.Many2one("is_bav.frequences", "Icon")
    lastdeviceid = fields.Char(string='Last Device ID')
    numero = fields.Char(string='Numero')
    adresse = fields.Text(string='Adresse')
    lastlatitude = fields.Float(string='Last Latitude')
    lastlongitude = fields.Float(string='Last Longitude')
    datems = fields.Datetime(string='Date MS')
    fixpos = fields.Boolean(string='Fix Pos')
    active = fields.Boolean(string='Active')
    latitude = fields.Float(string='Latitude')
    longitude = fields.Float(string='Longitude')

    idtypeb = fields.Integer(string='ID Type B')
    capacite = fields.Float(string='Capacite')
    img_red = fields.Char(string='Image Red')
    img_green = fields.Char(string='Image Green')
    img_bleu = fields.Char(string='Image Blue')
    img_gris = fields.Char(string='Image Gray')
    img_mauve = fields.Char(string='Image Mauve')
    name = fields.Char(string='Name')
    # device = fields.Char(string='Name')


   
    
    def get_icon2(self):
    # Search for all records and retrieve all fields
        records_data = self.env['is_bacs.icon_view'].search_read([("active","=",True)], [])

        return records_data



    def get_icon3(self,bac):
    # Search for all records and retrieve all fields
        records_data = self.env['is_bacs.icon_view'].search_read([('id','=',bac)], [])

        return records_data
    # self.env['is_bacs.icon_view'].search_read([],[])
   

    def init(self):

        # Define your new SQL query
        new_query = """
     SELECT    
    b.id,
    b.id AS idbac,
    b."lastupdateRFID",
    b.freqlavage,
    b.freqcollecte,
    b.lastdeviceid,
    b.numero,
    b.adresse,
    b.lastlatitude,
    b.lastlongitude,
    b.datems,
    b.fixpos,
    b.active,
    b.latitude,
    b.longitude,
    tb.id AS idtypeb,
    tb.capacite,
    tb.img_red,
	tb.img_green,
    tb.img_bleu,
    tb.img_gris,
	tb.img_mauve,
    tb.name
    
   
   FROM  is_bav_bacs b 
     JOIN public.is_bav_types tb ON is_bav_type_id = tb.id
     
        """

        
        
#         """
#      SELECT    
#     b.id,
#     b.id AS idbac,
#     b."lastupdateRFID",
#     b.freqlavage,
#     b.freqcollecte,
#     b.lastdeviceid,
#     b.numero,
#     b.adresse,
#     b.lastlatitude,
#     b.lastlongitude,
#     b.datems,
#     b.fixpos,
#     b.active,
#     b.latitude,
#     b.longitude,
#     tb.id AS idtypeb,
#     tb.capacite,
#     tb.img_red,
# 	tb.img_green,
#     tb.img_bleu,
#     tb.img_gris,
# 	tb.img_mauve,
#     tb.name,
    
   
# 	v.device
#    FROM fleet_vehicle v join is_bav_bacs b on v.id = b.lastdeviceid
#      JOIN public.is_bav_types tb ON is_bav_type_id = tb.id
     
#         """

        # Drop the existing view if it exists
        tools.drop_view_if_exists(self.env.cr, self._table)

        # Create or replace the view with the new query
        self.env.cr.execute(
            sql.SQL("CREATE or REPLACE VIEW {} as ({})").format(
                sql.Identifier(self._table),
                sql.SQL(new_query)
            )
        )
