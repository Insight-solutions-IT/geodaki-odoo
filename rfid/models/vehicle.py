# -*- coding: utf-8 -*-

from odoo import models, fields 

 

class FleetVehicle(models.Model):
    _inherit = "fleet.vehicle" 



    def get_map_data_with_rfid(self):
        return self.env['fleet.vehicle'].search_read(
            [],
            ['display_name', 'latitude', 'longitude', 'driver_id', 'vehicle_group_id', 'vehicle_icon_id', 'last_update', 'license_plate', 'lacc', 'last_speed']
        )
    
    def get_vehicles_with_rfid_tag(self): 
        rfid_tag = self.env['fleet.vehicle.tag'].search([('name', '=', 'RFID')])

        if rfid_tag: 
            vehicles_with_rfid = self.env['fleet.vehicle'].search_read([('tag_ids', 'in', rfid_tag.ids)], ['device','latitude','longitude','driver_id','vehicle_group_id',"vehicle_icon_id","last_update","license_plate","lacc","last_speed"])
 
            return vehicles_with_rfid
        else: 
            return [] 

    def get_id_of(self, name):
        print('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh:')      
        print(name)                                                         
        return self.env['fleet.vehicle'].search_read([('device', '=', name)], ['id'])
    def get_name_of(self, id):
        print('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh:')      
        print(id)                                                         
        return self.env['fleet.vehicle'].search_read([('id', '=', id)], ['device'])
    def get_names_of(self, id):
        print('hhhhhhhhhhhhhhhhhhhhhhhhh33339999hhhhhhhhhhhhhhhhhhhhhhhhhhh:')      
        print(id)                                                         
        ids = id.split(',')
        ids = [int(i.strip()) for i in ids]
        ids_tuple = tuple(ids)
        print(ids_tuple)
        return self.env['fleet.vehicle'].search_read([('id', 'in', ids_tuple)], ['device'])
    
class FleetVehicleGroupe(models.Model):
    _inherit = "fleet.vehicle.group"
 

    def get_map_data_with_rfid(self):
        return self.env['fleet.vehicle.group'].search_read(
            [('rfid', '=', True)],
            []
        )
    
    
