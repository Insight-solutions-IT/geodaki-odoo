# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
import datetime
from psycopg2 import sql

from odoo import tools
from odoo import api, fields, models


class FleetCircuit(models.Model):
    _name = "fleet_vehicle.planing_view"
    _description = "Fleet Analysis Report"
    _auto = False
    # _order = 'date_start desc'

    

    name = fields.Char(string="Num Park")
    vehname = fields.Char(string="Num Bac")
    hfin = fields.Datetime(string='End Time')
    datej = fields.Date(string='Date')
    hdeb = fields.Datetime(string='Start Time')
   
    circuitid = fields.Integer(string="New Latitude")
    driver = fields.Many2one('hr.employee',string="conducteur")
    driver2 = fields.Many2one('hr.employee',string="conducteur")

   
    def getplaning(self,name,date): 
        #fonctions = self.env["is_rfid.fonctions"].search([("name", "in", fonction_names)])
        
        # python_date = datetime.utcfromtimestamp(date / 1000.0)


        circuits = self.env['fleet_vehicle.planing_view'].search_read([('name',"=",name),('hdeb',"<=",date),('hfin',">=",date)],[])
        # circuits = self.env['is_rfid.circuit'].search_read([('fonction', 'in' ,['Collecte des Bacs'])],[])
        return circuits
    def getplaningVehicle(self,name,date): 
        #fonctions = self.env["is_rfid.fonctions"].search([("name", "in", fonction_names)])
        
        # python_date = datetime.utcfromtimestamp(date / 1000.0)


        circuits = self.env['fleet_vehicle.planing_view'].search_read([('vehname',"=",name),('hdeb',"<=",date),('hfin',">=",date)],[])
        # circuits = self.env['is_rfid.circuit'].search_read([('fonction', 'in' ,['Collecte des Bacs'])],[])
        return circuits
    


    def getplaning2(self,name,date): 
        #fonctions = self.env["is_rfid.fonctions"].search([("name", "in", fonction_names)])
        
        # python_date = datetime.utcfromtimestamp(date / 1000.0)
        rfid_tag = self.env['hr.employee'].search([('id', '=', name)])

        circuits = self.env['fleet_vehicle.planing_view'].search_read([('driver','in', rfid_tag.ids),('hdeb',"<=",date),('hfin',">=",date)],[])
        # circuits = self.env['is_rfid.circuit'].search_read([('fonction', 'in' ,['Collecte des Bacs'])],[])
        return circuits
    

    def getplaning3(self,name,date): 
        #fonctions = self.env["is_rfid.fonctions"].search([("name", "in", fonction_names)])
        
        # python_date = datetime.utcfromtimestamp(date / 1000.0)
        rfid_tag = self.env['hr.employee'].search([('id', '=', name)])

        circuits = self.env['fleet_vehicle.planing_view'].search_read([('driver2','in', rfid_tag.ids),('hdeb',"<=",date),('hfin',">=",date)],[])
        # circuits = self.env['is_rfid.circuit'].search_read([('fonction', 'in' ,['Collecte des Bacs'])],[])
        return circuits
    

    # self.env['is_bacs.icon_view'].search_read([],[])
   

    def init(self):

        

        # Define your new SQL query
        new_query = """
       SELECT DISTINCT  p.id AS id,
    p.circuitid,
    p.datej,
    p.hdeb,
    p.hfin,
    v.device AS vehname,
    c.name,
    p.driver,
    p.driver2
   FROM is_decoupage_circuits c
     JOIN is_planning_is_planning p ON c.id = p.circuitid
     JOIN fleet_vehicle v ON p.deviceid = v.id
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


