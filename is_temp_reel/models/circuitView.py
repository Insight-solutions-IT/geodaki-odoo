# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
from psycopg2 import sql

from odoo import tools
from odoo import api, fields, models


class FleetCircuit(models.Model):
    _name = "fleet_vehicle.circuit_view"
    _description = "Fleet Analysis Report"
    _auto = False
    # _order = 'date_start desc'

   
    name = fields.Char(string="Num Park")
    secteur = fields.Char(string="Num Bac")
    # nature = fields.Char(string="Adresse")
    # centlat = fields.Float(string="Latitude")
    # centlon = fields.Float(string="Longitude")
    # longueur = fields.Float(string="Longitude")
    geom = fields.Char(string="New Latitude")
    color = fields.Char(string="couleur")
   

   
    
    def get_icon2(self):
    # Search for all records and retrieve all fields
        records_data = self.env['is_bacs.icon_view'].search_read([], [])

        return records_data


    def getCircuits(self,name): 
        query = """
          SELECT distinct r.id as id,
        c.name,
    "Secteur" as secteur,
    --c.nature,
	f.name as frequence,
	fleet_vehicle_fonction.name as fonction,
	is_decoupage_circuits_methodes.name as methode,
    c.color,
    st_astext(r.geom) AS geom
   FROM public.is_decoupage_circuits c
   JOIN public.is_decoupage_circuits_methodes ON is_decoupage_circuits_methodes.id = c.methode_id
   JOIN public.fleet_vehicle_fonction ON fleet_vehicle_fonction.id = c.fonction_id
   JOIN  public.is_bav_frequences f on c.frequence_id=f.id
     JOIN public.is_decoupage_circuit_route_rel cd ON c.id = cd.circuit_id
     JOIN public.is_decoupage_routes r ON cd.route_id = r.id
	 where c.name=%s
    
        """
        self.env.cr.execute(query, (name,))
        result = self.env.cr.dictfetchall()
        
        return result
       
    

    # self.env['is_bacs.icon_view'].search_read([],[])
   

    def init(self):

        

        # Define your new SQL query
        new_query = """
        SELECT distinct r.id as id,
        c.name,
    "Secteur" as secteur,
    --c.nature,
    c.color,
    st_astext(r.geom) AS geom
   FROM public.is_decoupage_circuits c
     JOIN public.is_decoupage_circuit_route_rel cd ON c.id = cd.circuit_id
     JOIN public.is_decoupage_routes r ON cd.route_id = r.id
        """

        # Drop the existing view if it exists
        tools.drop_view_if_exists(self.env.cr, self._table)

        # Create or replace the view with the new query
        self.env.cr.execute(
            sql.SQL("CREATE or REPLACE VIEW {} as ({})").format(
                sql.Identifier(self._table),
                sql.SQL(new_query)
            )
        )
