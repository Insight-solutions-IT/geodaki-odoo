# -*- coding: utf-8 -*-

from datetime import datetime, timedelta
import requests
import json
import re
from xml.dom import ValidationErr
from odoo import models, fields, api

class planningParDefault(models.Model):
    _name = 'is_planning.planning_val'
    _description = 'is_planning.planning_val'
    
    circuitid=fields.Many2one('is_decoupage.circuits' , 'Circuit name', required=True)
    zone=fields.Many2one('is_decoupage' , 'zone')

    #  1
    deviceid_l=fields.Many2one('fleet.vehicle', 'Device ')
    hdeb_l=fields.Char(string='Heure debut')

    @api.constrains('hdeb_l')
    def _check_format_heurea(self):
        if self.hdeb_l:
            try:
                # Attempt to convert the formatted string to a time object
                

                datetime.strptime(self.hdeb_l, "%H:%M:%S").time()
            except ValueError:
                raise ValidationErr("Le format de l'heure doit être HH:MM:SS")
            
            
    hfin_l=fields.Char(string='Heure fin')

    @api.constrains('hfin_l')
    def _check_format_heureaa(self):
        if self.hfin_l:
            try:
                # Attempt to convert the formatted string to a time object
                datetime.strptime(self.hfin_l, "%H:%M:%S").time()
            except ValueError:
                raise ValidationErr("Le format de l'heure doit être HH:MM:SS")
            
    #datej_l=fields.Date("Date jour ")
    driver_l =fields.Many2one(
        'hr.employee',  # Update with your actual model name
        'Conducteur',
        tracking=True,
        help='Conducteur assigné',
        copy=False,
        domain="[('job_id.name', '=', 'CONDUCTEURS')]" # Adjust 'Conducteur' to the name of the job you want to filter by
    )
    driver2_l =fields.Many2one(
        'hr.employee',  # Update with your actual model name
        'Conducteur remplassant',
        tracking=True,
        help='Conducteur assigné',
        copy=False,
        domain="[('job_id.name', '=', 'CONDUCTEURS')]"  # Adjust 'Conducteur' to the name of the job you want to filter by
    )

    




    #  2
    deviceid_mar=fields.Many2one('fleet.vehicle', 'Device ')
    hdeb_mar=fields.Char(string='Heure debut')

    @api.constrains('hdeb_mar')
    def _check_format_heurem(self):
        if self.hdeb_mar:
            try:
                # Attempt to convert the formatted string to a time object
                datetime.strptime(self.hdeb_mar, "%H:%M:%S").time()
            except ValueError:
                raise ValidationErr("Le format de l'heure doit être HH:MM:SS")
            
            
    hfin_mar=fields.Char(string='Heure fin')

    @api.constrains('hfin_mar')
    def _check_format_heuremm(self):
        if self.hfin_mar:
            try:
                # Attempt to convert the formatted string to a time object
                datetime.strptime(self.hfin_mar, "%H:%M:%S").time()
            except ValueError:
                raise ValidationErr("Le format de l'heure doit être HH:MM:SS")
            
    #datej_mar=fields.Date("Date jour ")
    driver_mar =fields.Many2one(
        'hr.employee',  # Update with your actual model name
        'Conducteur',
        tracking=True,
        help='Conducteur assigné',
        copy=False,
        domain="[('job_id.name', '=', 'CONDUCTEURS')]" # Adjust 'Conducteur' to the name of the job you want to filter by
    )
    driver2_mar =fields.Many2one(
        'hr.employee',  # Update with your actual model name
        'Conducteur remplassant',
        tracking=True,
        help='Conducteur assigné',
        copy=False,
        domain="[('job_id.name', '=', 'CONDUCTEURS')]"  # Adjust 'Conducteur' to the name of the job you want to filter by
    )

    #  3
    deviceid_mer=fields.Many2one('fleet.vehicle', 'Device ')
    hdeb_mer=fields.Char(string='Heure debut')

    @api.constrains('hdeb_mer')
    def _check_format_heurme(self):
        if self.hdeb_mer:
            try:
                # Attempt to convert the formatted string to a time object
                datetime.strptime(self.hdeb_mer, "%H:%M:%S").time()
            except ValueError:
                raise ValidationErr("Le format de l'heure doit être HH:MM:SS")
            
    hfin_mer=fields.Char(string='Heure fin')

    @api.constrains('hfin_mer')
    def _check_format_heurmme(self):
        if self.hfin_mer:
            try:
                # Attempt to convert the formatted string to a time object
                datetime.strptime(self.hfin_mer, "%H:%M:%S").time()
            except ValueError:
                raise ValidationErr("Le format de l'heure doit être HH:MM:SS")
    #datej_mer=fields.Date("Date jour ")
    driver_mer =fields.Many2one(
        'hr.employee',  # Update with your actual model name
        'Conducteur',
        tracking=True,
        help='Conducteur assigné',
        copy=False,
        domain="[('job_id.name', '=', 'CONDUCTEURS')]" # Adjust 'Conducteur' to the name of the job you want to filter by
    )
    driver2_mer =fields.Many2one(
        'hr.employee',  # Update with your actual model name
        'Conducteur remplassant',
        tracking=True,
        help='Conducteur assigné',
        copy=False,
        domain="[('job_id.name', '=', 'CONDUCTEURS')]"  # Adjust 'Conducteur' to the name of the job you want to filter by
    )

    #  4
    deviceid_j=fields.Many2one('fleet.vehicle', 'Device ')
    hdeb_j=fields.Char(string='Heure debut')

    @api.constrains('hdeb_j')
    def _check_format_heurej(self):
        if self.hdeb_j:
            try:
                # Attempt to convert the formatted string to a time object
                datetime.strptime(self.hdeb_j, "%H:%M:%S").time()
            except ValueError:
                raise ValidationErr("Le format de l'heure doit être HH:MM:SS")
            
            
    hfin_j=fields.Char(string='Heure fin')

    @api.constrains('hfin_j')
    def _check_format_heurejj(self):
        if self.hfin_j:
            try:
                # Attempt to convert the formatted string to a time object
                datetime.strptime(self.hfin_j, "%H:%M:%S").time()
            except ValueError:
                raise ValidationErr("Le format de l'heure doit être HH:MM:SS")
            
    #datej_j=fields.Date("Date jour ")
    driver_j =fields.Many2one(
        'hr.employee',  # Update with your actual model name
        'Conducteur',
        tracking=True,
        help='Conducteur assigné',
        copy=False,
        domain="[('job_id.name', '=', 'CONDUCTEURS')]" # Adjust 'Conducteur' to the name of the job you want to filter by
    )
    driver2_j =fields.Many2one(
        'hr.employee',  # Update with your actual model name
        'Conducteur remplassant',
        tracking=True,
        help='Conducteur assigné',
        copy=False,
        domain="[('job_id.name', '=', 'CONDUCTEURS')]"  # Adjust 'Conducteur' to the name of the job you want to filter by
    )

    #  5
    deviceid_v=fields.Many2one('fleet.vehicle', 'Device ')
    hdeb_v=fields.Char(string='Heure debut')

    @api.constrains('hdeb_v')
    def _check_format_heurev(self):
        if self.hdeb_v:
            try:
                # Attempt to convert the formatted string to a time object
                datetime.strptime(self.hdeb_v, "%H:%M:%S").time()
            except ValueError:
                raise ValidationErr("Le format de l'heure doit être HH:MM:SS")
            
            
    hfin_v=fields.Char(string='Heure fin')

    @api.constrains('hfin_v')
    def _check_format_heurevv(self):
        if self.hfin_v:
            try:
                # Attempt to convert the formatted string to a time object
                datetime.strptime(self.hfin_v, "%H:%M:%S").time()
            except ValueError:
                raise ValidationErr("Le format de l'heure doit être HH:MM:SS")
    #datej_v=fields.Date("Date jour ")
    driver_v =fields.Many2one(
        'hr.employee',  # Update with your actual model name
        'Conducteur',
        tracking=True,
        help='Conducteur assigné',
        copy=False,
        domain="[('job_id.name', '=', 'CONDUCTEURS')]" # Adjust 'Conducteur' to the name of the job you want to filter by
    )
    driver2_v =fields.Many2one(
        'hr.employee',  # Update with your actual model name
        'Conducteur remplassant',
        tracking=True,
        help='Conducteur assigné',
        copy=False,
        domain="[('job_id.name', '=', 'CONDUCTEURS')]"  # Adjust 'Conducteur' to the name of the job you want to filter by
    )

    #  6
    deviceid_s=fields.Many2one('fleet.vehicle', 'Device ')
    hdeb_s=fields.Char(string='Heure debut')

    @api.constrains('hdeb_s')
    def _check_format_heures(self):
        if self.hdeb_s:
            try:
                # Attempt to convert the formatted string to a time object
                datetime.strptime(self.hdeb_s, "%H:%M:%S").time()
            except ValueError:
                raise ValidationErr("Le format de l'heure doit être HH:MM:SS")
            
            
    hfin_s=fields.Char(string='Heure fin')

    @api.constrains('hfin_s')
    def _check_format_heuress(self):
        if self.hfin_s:
            try:
                # Attempt to convert the formatted string to a time object
                datetime.strptime(self.hfin_s, "%H:%M:%S").time()
            except ValueError:
                raise ValidationErr("Le format de l'heure doit être HH:MM:SS")
    #datej_s=fields.Date("Date jour ")
    driver_s =fields.Many2one(
        'hr.employee',  # Update with your actual model name
        'Conducteur',
        tracking=True,
        help='Conducteur assigné',
        copy=False,
        domain="[('job_id.name', '=', 'CONDUCTEURS')]" # Adjust 'Conducteur' to the name of the job you want to filter by
    )
    driver2_s =fields.Many2one(
        'hr.employee',  # Update with your actual model name
        'Conducteur remplassant',
        tracking=True,
        help='Conducteur assigné',
        copy=False,
        domain="[('job_id.name', '=', 'CONDUCTEURS')]"  # Adjust 'Conducteur' to the name of the job you want to filter by
    )

    #  7
    deviceid_d=fields.Many2one('fleet.vehicle', 'Device ')
    hdeb_d=fields.Char(string='Heure debut')

    @api.constrains('hdeb_d')
    def _check_format_heured(self):
        if self.hdeb_d:
            try:
                # Attempt to convert the formatted string to a time object
                datetime.strptime(self.hdeb_d, "%H:%M:%S").time()
            except ValueError:
                raise ValidationErr("Le format de l'heure doit être HH:MM:SS")
            
            
    hfin_d=fields.Char(string='Heure fin')

    @api.constrains('hfin_d')
    def _check_format_heuredd(self):
        if self.hfin_d:
            try:
                # Attempt to convert the formatted string to a time object
                datetime.strptime(self.hfin_d, "%H:%M:%S").time()
            except ValueError:
                raise ValidationErr("Le format de l'heure doit être HH:MM:SS")
            

    #datej_d=fields.Date("Date jour ")
    driver_d =fields.Many2one(
        'hr.employee',  # Update with your actual model name
        'Conducteur',
        tracking=True,
        help='Conducteur assigné',
        copy=False,
        domain="[('job_id.name', '=', 'CONDUCTEURS')]" # Adjust 'Conducteur' to the name of the job you want to filter by
    )
    driver2_d =fields.Many2one(
        'hr.employee',  # Update with your actual model name
        'Conducteur remplassant',
        tracking=True,
        help='Conducteur assigné',
        copy=False,
        domain="[('job_id.name', '=', 'CONDUCTEURS')]"  # Adjust 'Conducteur' to the name of the job you want to filter by
    )
    # _sql_constraints = [
    #     ('unique_circuitid', 'unique(circuitid)', 'Two records cannot have the same circuitid.'),
    # ]
    def planning(self, dated, datef, device):
        new_query = """
            select 
                * 
            from 
                is_planning_is_planning
            where 
                deviceid = {}
                and hdeb >={}
                and hfin <= {}

        """.format(device, dated, datef )
        # print(new_query)
        self.env.cr.execute(new_query)
        result = self.env.cr.dictfetchall()
        return result

    def openWizard(self):
        active_ids = self.env.context.get('active_ids', [])
        return {
                'name': "excute query",
                'view_mode': 'form',
                'res_model': 'is_planning.execute_planing',
                'type': 'ir.actions.act_window',
                'target': 'new',
                'context': {
                'default_active_ids': active_ids,
            },
               
            }
    



    @api.constrains('circuitid', 'deviceid_l', 'hdeb_l', 'hfin_l', 'driver_l', 'driver2_l')
    def _check_fields_when_circuitid_not_empty(self):
        for record in self:
            if record.deviceid_l and not all([ record.hdeb_l, record.hfin_l,  record.driver_l, record.driver2_l]):
                raise ValidationErr("All fields related to monday must be filled when 'Device' is not empty.")
            

    @api.constrains('deviceid_mar', 'hdeb_mar', 'hfin_mar',  'driver_mar', 'driver2_mar')
    def _check_fields_when_deviceid_mar_not_empty(self):
        for record in self:
            if record.deviceid_mar and not all([record.hdeb_mar, record.hfin_mar,  record.driver_mar, record.driver2_mar]):
                raise ValidationErr("All fields related to day 2 must be filled when 'Device' is not empty.")
            
    @api.constrains('deviceid_mer', 'hdeb_mer', 'hfin_mer', 'driver_mer', 'driver2_mer')
    def _check_fields_when_deviceid_mer_not_empty(self):
        for record in self:
            if record.deviceid_mer and not all([record.hdeb_mer, record.hfin_mer,  record.driver_mer, record.driver2_mer]):
                raise ValidationErr("All fields related to day 3 must be filled when 'Device' is not empty.")

    @api.constrains('deviceid_j', 'hdeb_j', 'hfin_j',  'driver_j', 'driver2_j')
    def _check_fields_when_deviceid_j_not_empty(self):
        for record in self:
            if record.deviceid_j and not all([record.hdeb_j, record.hfin_j,  record.driver_j, record.driver2_j]):
                raise ValidationErr("All fields related to day 4 must be filled when 'Device' is not empty.")

    @api.constrains('deviceid_v', 'hdeb_v', 'hfin_v', 'driver_v', 'driver2_v')
    def _check_fields_when_deviceid_v_not_empty(self):
        for record in self:
            if record.deviceid_v and not all([record.hdeb_v, record.hfin_v,  record.driver_v, record.driver2_v]):
                raise ValidationErr("All fields related to day 5 must be filled when 'Device' is not empty.")

    @api.constrains('deviceid_s', 'hdeb_s', 'hfin_s',  'driver_s', 'driver2_s')
    def _check_fields_when_deviceid_s_not_empty(self):
        for record in self:
            if record.deviceid_s and not all([record.hdeb_s, record.hfin_s,  record.driver_s, record.driver2_s]):
                raise ValidationErr("All fields related to day 6 must be filled when 'Device' is not empty.")

    @api.constrains('deviceid_d', 'hdeb_d', 'hfin_d',  'driver_d', 'driver2_d')
    def _check_fields_when_deviceid_d_not_empty(self):
        for record in self:
            if record.deviceid_d and not all([record.hdeb_d, record.hfin_d,  record.driver_d, record.driver2_d]):
                raise ValidationErr("All fields related to day 7 must be filled when 'Device' is not empty.")



class is_planning(models.Model):
    _name = 'is_planning.is_planning'
    _description = 'is_planning.is_planning'
    
    deviceid=fields.Many2one('fleet.vehicle', 'Device', index=True)
    circuitid=fields.Many2one('is_decoupage.circuits' , 'Circuit name', index=True)
    hdeb=fields.Datetime('Heure Début', index=True)
    hfin=fields.Datetime('Heure fin', index=True)
    datej=fields.Date("Date jour", index=True)
    driver =fields.Many2one(
        'hr.employee',  # Update with your actual model name
        'Conducteur',
        tracking=True,
        help='Conducteur assigné',
        copy=False,
        domain="[('job_id.name', '=', 'CONDUCTEURS')]" # Adjust 'Conducteur' to the name of the job you want to filter by
    )
    driver2 =fields.Many2one(
        'hr.employee',  # Update with your actual model name
        'Conducteur remplassant',
        tracking=True,
        help='Conducteur assigné',
        copy=False,
        domain="[('job_id.name', '=', 'CONDUCTEURS')]"  # Adjust 'Conducteur' to the name of the job you want to filter by
    )
    def get_device_planning(self, circuit, dd, df):
        return self.env['is_planning.is_planning'].search_read([('circuitid','=',circuit), ('datej','>=',dd), ('datej','<=', df)],[])
    
    def planning(self, dated, datef, device):
        new_query = """
            select 
                * 
            from 
                is_planning_is_planning
            where 
                deviceid = {}
                and hdeb >={}
                and hfin <= {}

        """.format(device, dated, datef )
        # print(new_query)
        self.env.cr.execute(new_query)
        result = self.env.cr.dictfetchall()
        return result

    def getForCir(self, dated, datef, device):
            new_query = """
                select 
                    * 
                from 
                    is_planning_is_planning
                where 
                    deviceid = {}
                    and hdeb >={}
                    and hfin <= {}

            """.format(device, dated, datef )
            # print(new_query)
            self.env.cr.execute(new_query)
            result = self.env.cr.dictfetchall()
            return result


    def calculer_taux(self):
            active_ids = self.env.context.get('active_ids', [])

            min_hdeb = datetime.max  # Initializing to maximum datetime
            max_hfin = datetime.min  # Initializing to minimum datetime
            min_hdeb_datej = None
            max_hfin_datej = None
            for record in active_ids:

                orPlaning = self.env['is_planning.is_planning'].search_read([("id","=", record)], [])


                if orPlaning:
                    hdeb = orPlaning[0]['hdeb']  # Assuming hdeb is a field in your records
                    hfin = orPlaning[0]['hfin']  # Assuming hfin is a field in your records
                    datej = orPlaning[0]['datej']  # Assuming datej is a field in your records

                    # Update min_hdeb and corresponding datej if current hdeb is smaller
                    if  hdeb < min_hdeb:
                        min_hdeb = hdeb
                        min_hdeb_datej = datej

                    # Update max_hfin and corresponding datej if current hfin is larger
                    if  hfin > max_hfin:
                        max_hfin = hfin
                        max_hfin_datej = datej
            
            
            headers = {'Content-Type': 'application/json'}

            url = 'http://localhost:8089/api/taux'

            # Define the data you want to send in the request (if any)
            

            hdebformat = min_hdeb.strftime('%Y-%m-%dT%H:%M:%S')
            hfinformat = max_hfin.strftime('%Y-%m-%dT%H:%M:%S')
            datejformat = min_hdeb.strftime('%Y-%m-%d')

             # Formatting date as yyyy/mm/dd
            # formatted_date = datetime_obj.strftime("%Y/%m/%d")
            
            data = {
                'datedeb': hdebformat,
                'datefin': hfinformat,
                "datej":datejformat,
                'vehicleid': 1,
                'circuitid': 1,
            }

            # Send the POST request
            response = requests.post(url, data=json.dumps(data), headers=headers)

            # Check if the request was successful (status code 200)
            
