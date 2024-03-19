# -*- coding: utf-8 -*-

from odoo import models, fields, api


class ResUses(models.Model):
    _inherit = "fleet.vehicle"



    gas = fields.Integer(string='Dérnière Mise à jour')
    hrs = fields.Integer(string='Dérnière Mise à jour')
    can4 = fields.Integer(string='Dérnière Mise à jour')
    can5 = fields.Integer(string='Dérnière Mise à jour')
    can6 = fields.Integer(string='Dérnière Mise à jour')
    can7 = fields.Integer(string='Dérnière Mise à jour')
    can8 = fields.Integer(string='Dérnière Mise à jour')
    can9 = fields.Integer(string='Dérnière Mise à jour')
    can10 = fields.Integer(string='Dérnière Mise à jour')
    


    



    last_capt=fields.Char(string='last capt')
    odometer1 = fields.Float(string='Last Odometer',
        help='Odometer measure of the vehicle at the moment of this log',store=True)
    nombre = fields.Integer(string='Nombre',
        help='Odometer measure of the vehicle at the moment of this log',default=1)
    last_soc = fields.Integer(string='current battery')


    #nombre1 = fields.Float(compute='_compute_nombre', inverse='_set_odometer', string='Nombre',
    #    store=True)



    
    def get_vehicles_cans_caps(self,device_name):
        # Find the "RFID" tag
        # rfid_tag = self.env['fleet.vehicle.tag'].search([('name', '=', 'RFID')])
        cap_can=[]
        capteurs = self.env['fleet.vehicle'].search_read([('device', '=', device_name)],['vehicle_cap_id'])
        cans = self.env['fleet.vehicle'].search_read([('device', '=', device_name)],['vehicle_can_id'])
        
       
    
        

        capteurs_all=[]
        cans_all=[]
        if capteurs:
            vehicle_cap_ids = capteurs[0].get('vehicle_cap_id')
            if isinstance(vehicle_cap_ids, (list, tuple, str, dict)):
                for capteur1 in vehicle_cap_ids:
                    
                    capteur=self.env['fleet.vehicle.cap'].search_read([('id', '=', capteur1)],[])

                    
                    capteurs_all.append(capteur[0])
            else:        
                capteurs_all.append('')# = self.env['fleet.vehicle'].search_read([('tag_ids', 'in', rfid_tag.ids)], ['device','latitude','longitude','vehicle_group_id',"vehicle_icon_id","last_update","license_plate","model_id","odometer","image_128","lacc","last_speed"])

            # Return the vehicles in an array or any other desired format
            
        else:
            # If the "RFID" tag does not exist, return an empty array or handle the case accordingly
           capteurs_all.append('')


        cap_can.append(capteurs_all)
        # return cap_can
        if cans:
            vehicle_can_ids = cans[0].get('vehicle_can_id')
            if isinstance(vehicle_can_ids, (list, tuple, str, dict)):
                for can1 in vehicle_can_ids:
                    can = self.env['fleet.vehicle.can'].search_read([('id', '=', can1)], [])
                    cans_all.append(can[0])
            else:
                cans_all.append('')
        else:
            cans_all.append('1')

        cap_can.append(cans_all)

        return cap_can


    def get_device_with_rfid_tag(self,device):
        # Find the "RFID" tag
        rfid_tag = self.env['fleet.vehicle.tag'].search([('name', '=', 'RFID')])

        if rfid_tag:
            # Find vehicles that have the "RFID" tag in their tag_ids
            vehicles_with_rfid = self.env['fleet.vehicle'].search_read([('tag_ids', 'in', rfid_tag.ids),('device','=',device)], ['device','latitude','longitude','vehicle_group_id',"vehicle_icon_id","last_update","license_plate","model_id","odometer","image_128","lacc","last_speed"])

            # Return the vehicles in an array or any other desired format
            return vehicles_with_rfid
        else:
            # If the "RFID" tag does not exist, return an empty array or handle the case accordingly
            return []    
        


    def get_conducteurs(self):
        # Find the "RFID" tag
        rfid_tag = self.env['hr.job'].search([('name', '=', 'CONDUCTEURS')])

        if rfid_tag:
            # Find vehicles that have the "RFID" tag in their tag_ids
            vehicles_with_rfid = self.env['hr.employee'].search_read([('job_id', '=', rfid_tag[0].id)], [])

            # Return the vehicles in an array or any other desired format
            return vehicles_with_rfid
        else:
            # If the "RFID" tag does not exist, return an empty array or handle the case accordingly
            return []    
        


    def get_device_with_capteur_tag(self,device):
        # Find the "RFID" tag
        rfid_tag = self.env['fleet.vehicle.tag'].search([('name', '=', 'CAP')])

        if rfid_tag:
            # Find vehicles that have the "RFID" tag in their tag_ids
            vehicles_with_rfid = self.env['fleet.vehicle'].search_read([('tag_ids', 'in', rfid_tag.ids),('device','=',device)], ['device','last_capt'])

            # Return the vehicles in an array or any other desired format
            return vehicles_with_rfid
        else:
            # If the "RFID" tag does not exist, return an empty array or handle the case accordingly
            return []
    
    def get_device_with_can_tag(self,device):
        # Find the "RFID" tag
        rfid_tag = self.env['fleet.vehicle.tag'].search([('name', '=', 'CAN')])

        if rfid_tag:
            # Find vehicles that have the "RFID" tag in their tag_ids
            vehicles_with_rfid = self.env['fleet.vehicle'].search_read([('tag_ids', 'in', rfid_tag.ids),('device','=',device)], ['device','last_capt'])

            # Return the vehicles in an array or any other desired format
            return vehicles_with_rfid
        else:
            # If the "RFID" tag does not exist, return an empty array or handle the case accordingly
            return []

    def get_bacs(self):
        bacs =  self.env["is_bav.bacs"].search_read([("active", "=", True)], ['latitude','longitude','numero'])
        
        return bacs

    def get_icon(self, bac):
        # Search for the 'is_rfid.bacs' record with the given 'numbac'
        bac_records = self.env['is_rfid.bacs'].search([('numbac', '=', bac)], limit=1)

        if bac_records:
            # Get the 'typeb' field from the first matching 'is_rfid.bacs' record
            bac_type = bac_records.typeb
            # Search for the 'is_rfid.typebacs' record with the same 'name' as 'bac_type'
            typebacs_records = self.env['is_rfid.typebacs'].search_read([('name', '=', bac_type.name)],["icon"], limit=1)

            if typebacs_records:

                return typebacs_records[0]
                # Search for the 'is_rfid.icons' record with the same 'name' as 'typebacs_record'
                if "COLONNE" in typebacs_records[0].icon[1]:
                    icons_records = self.env['is_rfid.icons'].search([('name', '=', "COLONNE")], limit=1)
                    return icons_records
                else:
                    icons_records = self.env['is_rfid.icons'].search_read([('name', '=', typebacs_records.name)],[], limit=1)
                    return icons_records

                if icons_records:
                    # Get the first matching 'is_rfid.icons' record and retrieve the required fields
                    icons_record = icons_records[0]
                    img_red = icons_record.img_red
                    img_green = icons_record.img_green

                    return {
                        'img_red': img_red,
                        'img_green': img_green,
                    }

        # Return None if no matching records are found at any step


    def get_icon2(self, bac):
        # Search for the 'is_rfid.bacs' record with the given 'numbac'
        bac_records = self.env['is_rfid.bacs'].search([('numbac', '=', bac)], limit=1)

        if bac_records:
            # Get the 'typeb' field from the first matching 'is_rfid.bacs' record
            bac_type = bac_records.typeb
            # Search for the 'is_rfid.typebacs' record with the same 'name' as 'bac_type'
            # typebacs_records = self.env['is_rfid.typebacs'].search_read([('name', '=', bac_type.name)],["icon"], limit=1)

            return bac_type.name

    def get_icon_icon(self, icon):    
        if "COLONNE" in icon:
            icons_records = self.env['is_rfid.icons'].search_read([('name', '=', "COLONNE")],['img_red','img_green'], limit=1)
            return icons_records
        else:
            icons_records = self.env['is_rfid.icons'].search_read([('name', '=', icon)],['img_red','img_green'], limit=1)
            return icons_records


    def get_icon_icon2(self):    
        icons_records = self.env['is_rfid.icons'].search_read([],[])
        return icons_records
    
    def get_vehicles_in_categorie(self,name,user):
        query = """
SELECT DISTINCT 
  a.*,
  i.name AS icon,
  i."iconV",
  i."iconR",
  i."iconO",
  c.name AS category_name,
  mo.name AS model,
  ma.name AS marque,
  CASE
        WHEN EXTRACT(EPOCH FROM (NOW() - last_update)) > 3600 AND EXTRACT(EPOCH FROM (NOW() - last_update)) <= 86400 THEN i."iconO"
        WHEN EXTRACT(EPOCH FROM (NOW() - last_update)) <= 3600 THEN i."iconV"
        ELSE i."iconR"
    END AS current_icon
FROM
  public.fleet_vehicle a
  INNER JOIN public.fleet_vehicle_res_groups_rel ON (a.id = public.fleet_vehicle_res_groups_rel.fleet_vehicle_id)
  INNER JOIN public.res_groups ON (public.fleet_vehicle_res_groups_rel.res_groups_id = public.res_groups.id)
  INNER JOIN public.res_groups_users_rel ON (public.res_groups.id = public.res_groups_users_rel.gid)
  INNER JOIN public.res_users u ON (public.res_groups_users_rel.uid = u.id)
  INNER JOIN public.fleet_vehicle_model_category c ON (a.category_id = c.id)
  INNER JOIN public.fleet_vehicle_icon i ON (a.vehicle_icon_id = i.id)
  INNER JOIN public.fleet_vehicle_model mo ON (a.model_id = mo.id)
  INNER JOIN public.fleet_vehicle_model_brand ma ON (mo.brand_id = ma.id)
WHERE
   c.name = %s and u.id = %s;

        """
        self.env.cr.execute(query, (name,user,))
        result = self.env.cr.dictfetchall()
        
        return result
        

    def get_vehicles_function(self,name,device): 
        rfid_tag = self.env['fleet.vehicle.fonction'].search([('name', 'ilike', str(name))])

        if rfid_tag: 
            vehicles_with_rfid = self.env['fleet.vehicle'].search_read([('fonction', 'in', rfid_tag.ids),('device', '=', device)], [])
 
            return vehicles_with_rfid
        else: 
            return [] 


    def vehicules_with_icons2(self,iduser):
        
#         query = """
#            SELECT DISTINCT 
#   a.*,
#   i.name AS icon,
#   i."iconV",
#   i."iconR",
#   i."iconO",
#   c.name AS category_name,
#   mo.name AS model,
#   ma.name AS marque
# FROM
#   public.fleet_vehicle a
#   INNER JOIN public.fleet_vehicle_res_groups_rel ON (a.id = public.fleet_vehicle_res_groups_rel.fleet_vehicle_id)
#   INNER JOIN public.res_groups ON (public.fleet_vehicle_res_groups_rel.res_groups_id = public.res_groups.id)
#   INNER JOIN public.res_groups_users_rel ON (public.res_groups.id = public.res_groups_users_rel.gid)
#   INNER JOIN public.res_users u ON (public.res_groups_users_rel.uid = u.id)
#   INNER JOIN public.fleet_vehicle_model_category c ON (a.category_id = c.id)
#   INNER JOIN public.fleet_vehicle_icon i ON (a.vehicle_icon_id = i.id)
#   INNER JOIN public.fleet_vehicle_model mo ON (a.model_id = mo.id)
#   INNER JOIN public.fleet_vehicle_model_brand ma ON (mo.brand_id = ma.id)
# WHERE
#   u.id = %s
#         """

        query = """
          select distinct
a.*,
  c.name AS category_name,
i.name as icon,
   i."iconV",
   i."iconR",
   i."iconO",
  mo.name AS model,
  ma.name AS marque,
  ma.id as brand_id,
  c.name AS category_name,
  mo.name AS model,
  ma.name AS marque,
  CASE 
    WHEN EXTRACT(epoch FROM(NOW() - a.last_update)) > 3600 AND 
  EXTRACT(epoch FROM(NOW() - a.last_update)) <= 86400
      THEN i."iconO"
    WHEN EXTRACT(epoch FROM(NOW() - a.last_update)) <= 3600
      THEN i."iconV"
    ELSE  i."iconR"
  END AS current_icon,
  (SELECT MAX(CASE WHEN t.name::"varchar" LIKE '%CAN%' THEN 1 ELSE 0 END) FROM public.fleet_vehicle_tag t INNER JOIN public.fleet_vehicle_vehicle_tag_rel tr ON t.id = tr.tag_id WHERE tr.vehicle_tag_id = a.id) AS has_can_tag,
  (SELECT MAX(CASE WHEN t.name::"varchar" LIKE '%CAP%' THEN 1 ELSE 0 END) FROM public.fleet_vehicle_tag t INNER JOIN public.fleet_vehicle_vehicle_tag_rel tr ON t.id = tr.tag_id WHERE tr.vehicle_tag_id = a.id) AS has_cap_tag,
  (SELECT MAX(CASE WHEN t.name::"varchar" LIKE '%RFID%' THEN 1 ELSE 0 END) FROM public.fleet_vehicle_tag t INNER JOIN public.fleet_vehicle_vehicle_tag_rel tr ON t.id = tr.tag_id WHERE tr.vehicle_tag_id = a.id) AS has_rfid_tag
from
fleet_vehicle a
LEFT OUTER JOIN public.fleet_vehicle_vehicle_tag_rel tr ON (a.id = tr.vehicle_tag_id)
  LEFT OUTER JOIN public.fleet_vehicle_tag t ON (t.id = tr.tag_id)
  INNER JOIN public.fleet_vehicle_icon i ON (a.vehicle_icon_id = i.id)
  INNER JOIN public.fleet_vehicle_model mo ON (a.model_id = mo.id)
  INNER JOIN public.fleet_vehicle_model_brand ma ON (mo.brand_id = ma.id)
  INNER JOIN public.fleet_vehicle_res_groups_rel ON (a.id = public.fleet_vehicle_res_groups_rel.fleet_vehicle_id)
  INNER JOIN public.res_groups ON (public.fleet_vehicle_res_groups_rel.res_groups_id = public.res_groups.id)
  INNER JOIN public.res_groups_users_rel ON (public.res_groups.id = public.res_groups_users_rel.gid)
  INNER JOIN public.res_users u ON (public.res_groups_users_rel.uid = u.id)
  INNER JOIN public.fleet_vehicle_model_category c ON (a.category_id = c.id)
  where 
  u.id={}
 order by id asc
        """.format(iduser)
#         query = """
#           SELECT DISTINCT 
#   a.id,
#   a.message_main_attachment_id,
#   a.manager_id,
#   a.company_id,
#   a.driver_id,
#   a.future_driver_id,
#   a.model_id,
#   a.brand_id,
#   a.state_id,
#   a.seats,
#   a.doors,
#   a.horsepower,
#   a.power,
#   a.category_id,
#   a.create_uid,
#   a.write_uid,
#   a.name,
#   a.license_plate,
#   a.vin_sn,
#   a.color,
#   a.location,
#   a.model_year,
#   a.odometer_unit,
#   a.transmission,
#   a.fuel_type,
#   a.co2_standard,
#   a.frame_type,
#   a.next_assignation_date,
#   a.acquisition_date,
#   a.write_off_date,
#   a.first_contract_date,
#   a.description,
#   a.active,
#   a.trailer_hook,
#   a.plan_to_change_car,
#   a.plan_to_change_bike,
#   a.electric_assistance,
#   a.create_date,
#   a.write_date,
#   a.horsepower_tax,
#   a.co2,
#   a.car_value,
#   a.net_car_value,
#   a.residual_value,
#   a.frame_size,
#   a.vehicle_group_id,
#   a.vehicle_icon_id,
#   a.vitessemax,
#   a.durremax,
#   a.derivegps,
#   a.seuilvitess,
#   a.seuildurre,
#   a.sousregime,
#   a.ecoregime,
#   a.regimeleve,
#   a.surregime,
#   a.seuil_sousregime,
#   a.seuil_ecoregime,
#   a.seuil_regimeleve,
#   a.seuil_surregime,
#   a.seuil_cons_glob,
#   a.seuil_arret,
#   a.ptac,
#   a.pv,
#   a.hauteur,
#   a.largeur,
#   a.longueur,
#   a.largbrosse,
#   a.volumeciterne,
#   a.device,
#   a.unique_id,
#   a.lacc,
#   a.last_speed,
#   a.capacitereserv,
#   a.classe,
#   a.classemiss,
#   a.produitdanger,
#   a.unitepoids,
#   a.ssid,
#   a."numeroSim",
#   a.latitude,
#   a.longitude,
#   a.last_update,
#   a.heurdebac,
#   a.heurfinac,
#   a.hautcitern,
#   a.driver_employee_id,
#   a.future_driver_employee_id,
#   a.mobility_card,
#   a.nombre,
#   a.last_soc,
#   a.last_capt,
#   a.odometer1,
#   a.marker_color,
#   a.numero_sim,
#   i.name AS icon,
#   i."iconV",
#   i."iconR",
#   i."iconO",
#   c.name AS category_name,
#   mo.name AS model,
#   ma.name AS marque,
#   p.devicetime,
#   p.gas ,
#   p.hrs ,
  
# 	p."can4" ,
#   p."can5" ,
# 	p."can6" ,
# 	p."can7" ,
# 	p."can8" ,
# 	p."can9" ,
# 	p."can10",
#     	ma.id as brand_id,
#   CASE
#          WHEN EXTRACT(EPOCH FROM (NOW() - last_update)) > 3600 AND EXTRACT(EPOCH FROM (NOW() - last_update)) <= 86400 THEN i."iconO"
#          WHEN EXTRACT(EPOCH FROM (NOW() - last_update)) <= 3600 THEN i."iconV"
#          ELSE i."iconR"
#      END AS current_icon,
#   MAX(CASE WHEN t.name::varchar LIKE '%CAN%' THEN 1 ELSE 0 END) AS has_can_tag,
#   MAX(CASE WHEN t.name::varchar LIKE '%CAP%' THEN 1 ELSE 0 END) AS has_cap_tag,
#   MAX(CASE WHEN t.name::varchar LIKE '%RFID%' THEN 1 ELSE 0 END) AS has_rfid_tag

# FROM
#   public.fleet_vehicle a
#   LEFT JOIN public.fleet_vehicle_positions2 p ON p.deviceid = a.id AND p.devicetime = a.last_update and datep=last_update::date
#   LEFT JOIN public.fleet_vehicle_vehicle_tag_rel tr ON a.id = tr.vehicle_tag_id
#   LEFT JOIN public.fleet_vehicle_tag t ON t.id = tr.tag_id 
#   INNER JOIN public.fleet_vehicle_res_groups_rel ON (a.id = public.fleet_vehicle_res_groups_rel.fleet_vehicle_id)
#   INNER JOIN public.res_groups ON (public.fleet_vehicle_res_groups_rel.res_groups_id = public.res_groups.id)
#   INNER JOIN public.res_groups_users_rel ON (public.res_groups.id = public.res_groups_users_rel.gid)
#   INNER JOIN public.res_users u ON (public.res_groups_users_rel.uid = u.id)
#   INNER JOIN public.fleet_vehicle_model_category c ON (a.category_id = c.id)
#   INNER JOIN public.fleet_vehicle_icon i ON (a.vehicle_icon_id = i.id)
#   INNER JOIN public.fleet_vehicle_model mo ON (a.model_id = mo.id)
#   INNER JOIN public.fleet_vehicle_model_brand ma ON (mo.brand_id = ma.id)
#   WHERE
#   u.id = {}
# GROUP BY
#  a.id,
#   a.message_main_attachment_id,
#   a.manager_id,
#   a.company_id,
#   a.driver_id,
#   a.future_driver_id,
#   a.model_id,
#   a.brand_id,
#   a.state_id,
#   a.seats,
#   a.doors,
#   a.horsepower,
#   a.power,
#   a.category_id,
#   a.create_uid,
#   a.write_uid,
#   a.name,
#   a.license_plate,
#   a.vin_sn,
#   a.color,
#   a.location,
#   a.model_year,
#   a.odometer_unit,
#   a.transmission,
#   a.fuel_type,
#   a.co2_standard,
#   a.frame_type,
#   a.next_assignation_date,
#   a.acquisition_date,
#   a.write_off_date,
#   a.first_contract_date,
#   a.description,
#   a.active,
#   a.trailer_hook,
#   a.plan_to_change_car,
#   a.plan_to_change_bike,
#   a.electric_assistance,
#   a.create_date,
#   a.write_date,
#   a.horsepower_tax,
#   a.co2,
#   a.car_value,
#   a.net_car_value,
#   a.residual_value,
#   a.frame_size,
#   a.vehicle_group_id,
#   a.vehicle_icon_id,
#   a.vitessemax,
#   a.durremax,
#   a.derivegps,
#   a.seuilvitess,
#   a.seuildurre,
#   a.sousregime,
#   a.ecoregime,
#   a.regimeleve,
#   a.surregime,
#   a.seuil_sousregime,
#   a.seuil_ecoregime,
#   a.seuil_regimeleve,
#   a.seuil_surregime,
#   a.seuil_cons_glob,
#   a.seuil_arret,
#   a.ptac,
#   a.pv,
#   a.hauteur,
#   a.largeur,
#   a.longueur,
#   a.largbrosse,
#   a.volumeciterne,
#   a.device,
#   a.unique_id,
#   a.lacc,
#   a.last_speed,
#   a.capacitereserv,
#   a.classe,
#   a.classemiss,
#   a.produitdanger,
#   a.unitepoids,
#   a.ssid,
#   a."numeroSim",
#   a.latitude,
#   a.longitude,
#   a.last_update,
#   a.heurdebac,
#   a.heurfinac,
#   a.hautcitern,
#   a.driver_employee_id,
#   a.future_driver_employee_id,
#   a.mobility_card,
#   a.nombre,
#   a.last_soc,
#   a.last_capt,
#   a.odometer1,
#   a.marker_color,
#   a.numero_sim,
#   i.name ,
#   i."iconV",
#   i."iconR",
#   i."iconO",
#   c.name ,
#   mo.name ,
#   ma.name ,
#   p.devicetime,
#   p.gas ,
#   p.hrs ,
  
# 	p."can4" ,
#   p."can5" ,
# 	p."can6" ,
# 	p."can7" ,
# 	p."can8" ,
# 	p."can9" ,
# 	p."can10",
#     	ma.id 
#         """.format(iduser)
#         query = """
#            SELECT DISTINCT 
#   a.*,
#   i.name AS icon,
#   i."iconV",
#   i."iconR",
#   i."iconO",
#   c.name AS category_name,
#   mo.name AS model,
#   ma.name AS marque,
#   p.devicetime,
#   p.gas ,
#   p.hrs ,
  
# 	p."can4" ,
#   p."can5" ,
# 	p."can6" ,
# 	p."can7" ,
# 	p."can8" ,
# 	p."can9" ,
# 	p."can10",
#     	ma.id as brand_id,

#   CASE
#         WHEN EXTRACT(EPOCH FROM (NOW() - last_update)) > 3600 AND EXTRACT(EPOCH FROM (NOW() - last_update)) <= 86400 THEN i."iconO"
#         WHEN EXTRACT(EPOCH FROM (NOW() - last_update)) <= 3600 THEN i."iconV"
#         ELSE i."iconR"
#     END AS current_icon
# FROM
#   public.fleet_vehicle a
#   LEFT JOIN public.fleet_vehicle_positions2 p ON p.deviceid = a.id AND p.devicetime = a.last_update
#   INNER JOIN public.fleet_vehicle_res_groups_rel ON (a.id = public.fleet_vehicle_res_groups_rel.fleet_vehicle_id)
#   INNER JOIN public.res_groups ON (public.fleet_vehicle_res_groups_rel.res_groups_id = public.res_groups.id)
#   INNER JOIN public.res_groups_users_rel ON (public.res_groups.id = public.res_groups_users_rel.gid)
#   INNER JOIN public.res_users u ON (public.res_groups_users_rel.uid = u.id)
#   INNER JOIN public.fleet_vehicle_model_category c ON (a.category_id = c.id)
#   INNER JOIN public.fleet_vehicle_icon i ON (a.vehicle_icon_id = i.id)
#   INNER JOIN public.fleet_vehicle_model mo ON (a.model_id = mo.id)
#   INNER JOIN public.fleet_vehicle_model_brand ma ON (mo.brand_id = ma.id)
# WHERE
#   u.id = %s
#         """
#         query = """
#             select a.*,
#  i.name as icon,
# i."iconV",
# i."iconR",
# i."iconO", 
# c.name as category_name,
# mo.name as model,
# ma.name as marque
# from public.fleet_vehicle_model_category c 
# join public.fleet_vehicle a on a.category_id=c.id 
# join public.fleet_vehicle_icon i on a.vehicle_icon_id = i.id
# join public.fleet_vehicle_model mo on mo.id=a.model_id
# join public.fleet_vehicle_model_brand ma on mo.brand_id=ma.id
#         """

        self.env.cr.execute(query)
        result = self.env.cr.dictfetchall()
        
        return result



    def vehicules_export11(self,iduser):
        
#         query = """
#            SELECT DISTINCT 
#   a.*,
#   i.name AS icon,
#   i."iconV",
#   i."iconR",
#   i."iconO",
#   c.name AS category_name,
#   mo.name AS model,
#   ma.name AS marque
# FROM
#   public.fleet_vehicle a
#   INNER JOIN public.fleet_vehicle_res_groups_rel ON (a.id = public.fleet_vehicle_res_groups_rel.fleet_vehicle_id)
#   INNER JOIN public.res_groups ON (public.fleet_vehicle_res_groups_rel.res_groups_id = public.res_groups.id)
#   INNER JOIN public.res_groups_users_rel ON (public.res_groups.id = public.res_groups_users_rel.gid)
#   INNER JOIN public.res_users u ON (public.res_groups_users_rel.uid = u.id)
#   INNER JOIN public.fleet_vehicle_model_category c ON (a.category_id = c.id)
#   INNER JOIN public.fleet_vehicle_icon i ON (a.vehicle_icon_id = i.id)
#   INNER JOIN public.fleet_vehicle_model mo ON (a.model_id = mo.id)
#   INNER JOIN public.fleet_vehicle_model_brand ma ON (mo.brand_id = ma.id)
# WHERE
#   u.id = %s
#         """

        lequery = """
                    
SELECT DISTINCT 
  a.id,
  a.device,
  a.license_plate,
  a.unique_id,
  a.lacc as dernier_acc,
  a.latitude,
  a.longitude,
  a.last_speed,
  i.name AS "activité",
  
  c.name AS category,
  mo.name AS model,
  ma.name AS marque,
  a.gas as "Jauge du niveau de carburant (%)",
  a.hrs as "Nombre total d heures travaillées",
	a."can4" as "Carburant total consommé (Litres)",
  a."can5" as "Température du liquide de refroidissement",
	a."can6" as "RPM",
	a."can7" as "Ecrasement de la pédale de frein",
	a."can8" as "Ecrasement de la pédale daccélérateur",
	a."can9" as "Niveau d eau de la citerne (Litres)",
	a."can10" as "Poids"

FROM
  public.fleet_vehicle a
  INNER JOIN public.fleet_vehicle_res_groups_rel ON (a.id = public.fleet_vehicle_res_groups_rel.fleet_vehicle_id)
  INNER JOIN public.res_groups ON (public.fleet_vehicle_res_groups_rel.res_groups_id = public.res_groups.id)
  INNER JOIN public.res_groups_users_rel ON (public.res_groups.id = public.res_groups_users_rel.gid)
  INNER JOIN public.res_users u ON (public.res_groups_users_rel.uid = u.id)
  INNER JOIN public.fleet_vehicle_model_category c ON (a.category_id = c.id)
  INNER JOIN public.fleet_vehicle_icon i ON (a.vehicle_icon_id = i.id)
  INNER JOIN public.fleet_vehicle_model mo ON (a.model_id = mo.id)
  INNER JOIN public.fleet_vehicle_model_brand ma ON (mo.brand_id = ma.id)
WHERE
  u.id = {}
                    """.format(iduser)
#         query = """
#             select a.*,
#  i.name as icon,
# i."iconV",
# i."iconR",
# i."iconO", 
# c.name as category_name,
# mo.name as model,
# ma.name as marque
# from public.fleet_vehicle_model_category c 
# join public.fleet_vehicle a on a.category_id=c.id 
# join public.fleet_vehicle_icon i on a.vehicle_icon_id = i.id
# join public.fleet_vehicle_model mo on mo.id=a.model_id
# join public.fleet_vehicle_model_brand ma on mo.brand_id=ma.id
#         """

        self.env.cr.execute(lequery)
        result = self.env.cr.dictfetchall()
        
        return result
    
    
    def vehicules_InfoFull(self,iduser):
        
#         query = """
#            SELECT DISTINCT 
#   a.*,
#   i.name AS icon,
#   i."iconV",
#   i."iconR",
#   i."iconO",
#   c.name AS category_name,
#   mo.name AS model,
#   ma.name AS marque
# FROM
#   public.fleet_vehicle a
#   INNER JOIN public.fleet_vehicle_res_groups_rel ON (a.id = public.fleet_vehicle_res_groups_rel.fleet_vehicle_id)
#   INNER JOIN public.res_groups ON (public.fleet_vehicle_res_groups_rel.res_groups_id = public.res_groups.id)
#   INNER JOIN public.res_groups_users_rel ON (public.res_groups.id = public.res_groups_users_rel.gid)
#   INNER JOIN public.res_users u ON (public.res_groups_users_rel.uid = u.id)
#   INNER JOIN public.fleet_vehicle_model_category c ON (a.category_id = c.id)
#   INNER JOIN public.fleet_vehicle_icon i ON (a.vehicle_icon_id = i.id)
#   INNER JOIN public.fleet_vehicle_model mo ON (a.model_id = mo.id)
#   INNER JOIN public.fleet_vehicle_model_brand ma ON (mo.brand_id = ma.id)
# WHERE
#   u.id = %s
#         """

        lequery = """
                    
SELECT DISTINCT 
  SELECT DISTINCT
  a.*,
  i.name AS icon,
  i."iconV",
  i."iconR",
  i."iconO",
  c.name AS category_name,
  mo.name AS model,
  ma.name AS marque,
  p.devicetime,
  p.gas ,
  p.hrs ,
  
	p."can4" ,
  p."can5" ,
	p."can6" ,
	p."can7" ,
	p."can8" ,
	p."can9" ,
	p."can10" 
FROM
  public.fleet_vehicle a
  LEFT JOIN public.fleet_vehicle_positions2 p ON p.deviceid = a.id AND p.devicetime = a.last_update
  INNER JOIN public.fleet_vehicle_res_groups_rel ON (a.id = public.fleet_vehicle_res_groups_rel.fleet_vehicle_id)
  INNER JOIN public.res_groups ON (public.fleet_vehicle_res_groups_rel.res_groups_id = public.res_groups.id)
  INNER JOIN public.res_groups_users_rel ON (public.res_groups.id = public.res_groups_users_rel.gid)
  INNER JOIN public.res_users u ON (public.res_groups_users_rel.uid = u.id)
  INNER JOIN public.fleet_vehicle_model_category c ON (a.category_id = c.id)
  INNER JOIN public.fleet_vehicle_icon i ON (a.vehicle_icon_id = i.id)
  INNER JOIN public.fleet_vehicle_model mo ON (a.model_id = mo.id)
  INNER JOIN public.fleet_vehicle_model_brand ma ON (mo.brand_id = ma.id)
WHERE
  a.id = {}
                    """.format(iduser)
#         query = """
#             select a.*,
#  i.name as icon,
# i."iconV",
# i."iconR",
# i."iconO", 
# c.name as category_name,
# mo.name as model,
# ma.name as marque
# from public.fleet_vehicle_model_category c 
# join public.fleet_vehicle a on a.category_id=c.id 
# join public.fleet_vehicle_icon i on a.vehicle_icon_id = i.id
# join public.fleet_vehicle_model mo on mo.id=a.model_id
# join public.fleet_vehicle_model_brand ma on mo.brand_id=ma.id
#         """

        self.env.cr.execute(lequery)
        result = self.env.cr.dictfetchall()
        
        return result

    


    def vehicules_with_icons(self):
        
#         query = """
#            SELECT DISTINCT 
#   a.*,
#   i.name AS icon,
#   i."iconV",
#   i."iconR",
#   i."iconO",
#   c.name AS category_name,
#   mo.name AS model,
#   ma.name AS marque
# FROM
#   public.fleet_vehicle a
#   INNER JOIN public.fleet_vehicle_res_groups_rel ON (a.id = public.fleet_vehicle_res_groups_rel.fleet_vehicle_id)
#   INNER JOIN public.res_groups ON (public.fleet_vehicle_res_groups_rel.res_groups_id = public.res_groups.id)
#   INNER JOIN public.res_groups_users_rel ON (public.res_groups.id = public.res_groups_users_rel.gid)
#   INNER JOIN public.res_users u ON (public.res_groups_users_rel.uid = u.id)
#   INNER JOIN public.fleet_vehicle_model_category c ON (a.category_id = c.id)
#   INNER JOIN public.fleet_vehicle_icon i ON (a.vehicle_icon_id = i.id)
#   INNER JOIN public.fleet_vehicle_model mo ON (a.model_id = mo.id)
#   INNER JOIN public.fleet_vehicle_model_brand ma ON (a.brand_id = ma.id)
# WHERE
#   u.id = %s
#         """
        query = """
            select a.*,
 i.name as icon,
i."iconV",
i."iconR",
i."iconO", 
c.name as category_name,
mo.name as model,
ma.name as marque
from public.fleet_vehicle_model_category c 
join public.fleet_vehicle a on a.category_id=c.id 
join public.fleet_vehicle_icon i on a.vehicle_icon_id = i.id
join public.fleet_vehicle_model mo on mo.id=a.model_id
join public.fleet_vehicle_model_brand ma on mo.brand_id=ma.id
        """

        self.env.cr.execute(query, ())
        result = self.env.cr.dictfetchall()
        
        return result
   

    def kilometrage(self,id):
        
        query = """

SELECT  sum(distance) FROM public.fleet_vehicle_positions2 where deviceid=%s 
        """

        self.env.cr.execute(query, (id,))
        result = self.env.cr.dictfetchall()
        
        return result
   
   
   
   
    def last_capt_string(self,id):
        
        query = """
           SELECT * FROM public.fleet_vehicle_positions2 where deviceid=%s
ORDER BY  devicetime DESC limit 1
        """

        self.env.cr.execute(query, (id,))
        result = self.env.cr.dictfetchall()
        
        return result
    def speedVeh(self,id):
        
        query = """
           select device , last_speed from public.fleet_vehicle where device = %s
        """

        self.env.cr.execute(query, (id,))
        result = self.env.cr.dictfetchall()
        
        return result



    # @api.depends('model_id.brand_id.name', 'model_id.name', 'license_plate')
    # def _get_odometer1(self):
    #     FleetVehicalOdometer = self.env['fleet.vehicle.odometer']
    #     for record in self:
    #         vehicle_odometer = FleetVehicalOdometer.search([('vehicle_id', '=', record.id)], limit=1, order='value desc')
    #         if vehicle_odometer:
    #             record.odometer1 = vehicle_odometer.value
    #         else:
    #             record.odometer1 = 0


    #@api.depends('marker_color')
    #def _compute_nombre(self):
    #    for vehicle in self:
    #        if vehicle.marker_color:
                # Add your computation logic here
                
    #                vehicle.nombre1 = 1
    #        else:
    #            vehicle.nombre1 = 0 



    def update_bac(self,idtag):
        query = """
           SELECT r.*,
  t.ntag,
  b.numero,
  b.id AS bacid



FROM public.is_rfid_rfid r
join public.is_bav_tags t on r.tag1=t.ntag
join public.is_bav_bacs b on b.id=t.idbac


where tag1=%s order by devicetime desc limit 1
        """

        self.env.cr.execute(query, (idtag,))
        result = self.env.cr.dictfetchall()
        
        return result
        
            

    def rfid_update(self,name,idbac):
        
        query = """
            SELECT r.*,
t.ntag,
b.numero,
b.id as bacid,
v.device,

f.name as fonctionName

FROM 
  public.is_rfid_rfid r
  INNER JOIN public.is_bav_tags t ON (r.tag1 = t.ntag)
  INNER JOIN public.is_bav_bacs b ON (b.id = t.idbac)
  INNER JOIN public.fleet_vehicle v ON (r.deviceid = v.id)
  INNER JOIN public.fleet_vehicle_fleet_vehicle_fonction_rel ON (v.id = public.fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_id)
  INNER JOIN public.fleet_vehicle_fonction f ON (f.id = public.fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_fonction_id)

where  f.name like %s and b.id=%s order by devicetime  desc limit 1
        """
        

# SELECT r.*,
# t.ntag,
# b.numbac,
# b.id as bacid,
# v.device,
# v.fonction,
# f.name as fonctionName

# FROM public.is_rfid_rfid r
# join public.is_rfid_tags t on r.tag1=t.ntag
# join public.is_rfid_bacs b on b.id=t.idbac
# join public.fleet_vehicle v on r.deviceid=v.id
# join public.is_rfid_fonctions f on f.id=v.fonction
# where  f.name like %s and b.id=%s order by devicetime desc limit 1


        self.env.cr.execute(query, ("%"+name+"%",idbac,))
        result = self.env.cr.dictfetchall()
        
        return result


    def rfid_update2(self):
        query = """
            WITH RankedData AS (
    SELECT *,
	
           ROW_NUMBER() OVER (PARTITION BY sub.bacid ORDER BY sub.rn) AS row_num,
	CASE
                    WHEN (lower(fonctionname) LIKE '%collecte%' AND EXTRACT(EPOCH FROM (NOW() - devicetime)) <= 86400 ) THEN img_green
                    WHEN (lower(fonctionname) LIKE '%collecte%' AND devicetime < NOW() - INTERVAL '24 hours') THEN img_red
                    ELSE img_red
    END AS final_icon
    FROM (
        SELECT 
            r.*,
            t.ntag,
            b.*,
            b.id AS bacid,
            v.device,
            f.name AS fonctionName,
            fc.name AS freqcollecte,
            fl.name AS freqlavage,
            tp.*,
            ROW_NUMBER() OVER (PARTITION BY b.numero ORDER BY r.devicetime DESC) AS rn
        FROM 
            public.is_bav_bacs b
            INNER JOIN public.is_bav_types tp ON b.is_bav_type_id = tp.id
            LEFT OUTER JOIN public.is_bav_tags t ON b.id = t.idbac
            LEFT OUTER JOIN public.is_bav_frequences fc ON b.freqcollecte = fc.id
            LEFT OUTER JOIN public.is_bav_frequences fl ON b.freqlavage = fl.id
            LEFT OUTER JOIN public.is_rfid_rfid r ON t.ntag = r.tag1
            LEFT OUTER JOIN public.fleet_vehicle v ON r.deviceid = v.id
            LEFT OUTER JOIN public.fleet_vehicle_fleet_vehicle_fonction_rel ON v.id = public.fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_id
            LEFT OUTER JOIN public.fleet_vehicle_fonction f ON f.id = public.fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_fonction_id
        WHERE 
            b.active = true  
            AND lower(f.name) LIKE '%collecte%'
        UNION ALL
        SELECT 
            r.*,
            t.ntag,
            b.*,
            b.id AS bacid,
            v.device,
            f.name AS fonctionName,
            fc.name AS freqcollecte,
            fl.name AS freqlavage,
            tp.*,
            ROW_NUMBER() OVER (PARTITION BY b.numero ORDER BY r.devicetime DESC) AS rn
        FROM 
            public.is_bav_bacs b
            INNER JOIN public.is_bav_types tp ON b.is_bav_type_id = tp.id
            LEFT OUTER JOIN public.is_bav_tags t ON b.id = t.idbac
            LEFT OUTER JOIN public.is_bav_frequences fc ON b.freqcollecte = fc.id
            LEFT OUTER JOIN public.is_bav_frequences fl ON b.freqlavage = fl.id
            LEFT OUTER JOIN public.is_rfid_rfid r ON t.ntag = r.tag1
            LEFT OUTER JOIN public.fleet_vehicle v ON r.deviceid = v.id
            LEFT OUTER JOIN public.fleet_vehicle_fleet_vehicle_fonction_rel ON v.id = public.fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_id
            LEFT OUTER JOIN public.fleet_vehicle_fonction f ON f.id = public.fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_fonction_id
        WHERE 
            b.active = true  
    ) AS sub
)
SELECT *
FROM RankedData
WHERE row_num = 1;


        """
        # query = """
        #     SELECT *,
        #         CASE
        #             WHEN (fonctionname LIKE '%COLLECTE%' AND EXTRACT(EPOCH FROM (NOW() - devicetime)) <= 86400 ) THEN img_green
        #             WHEN (fonctionname LIKE '%COLLECTE%' AND devicetime < NOW() - INTERVAL '24 hours') THEN img_red
        #             WHEN (fonctionname LIKE '%Lavage%' AND devicetime >= NOW() - INTERVAL '24 hours') THEN img_bleu
        #             WHEN (fonctionname LIKE '%Lavage%' AND devicetime < NOW() - INTERVAL '24 hours') THEN img_gris
        #             ELSE img_red
        #         END AS final_icon
        #     FROM (
        #         SELECT 
        #             r.*,
        #             t.ntag,
        #             b.*,
        #             b.id AS bacid,
        #             v.device,
        #             f.name AS fonctionName,
		# 			fc.name as freqcollecte,
		# 			fl.name as freqlavage,
        #             tp.*,
        #             ROW_NUMBER() OVER (PARTITION BY b.numero ORDER BY r.devicetime DESC) AS rn
        #         FROM 
        #             public.is_bav_bacs b
        #             INNER JOIN public.is_bav_types tp ON b.is_bav_type_id = tp.id
        #             LEFT OUTER JOIN public.is_bav_tags t ON b.id = t.idbac
		# 			LEFT OUTER JOIN public.is_bav_frequences fc ON b.freqcollecte = fc.id
		# 			LEFT OUTER JOIN public.is_bav_frequences fl ON b.freqlavage = fl.id
        #             LEFT OUTER JOIN public.is_rfid_rfid r ON t.ntag = r.tag1
        #             LEFT OUTER JOIN public.fleet_vehicle v ON r.deviceid = v.id
        #             LEFT OUTER JOIN public.fleet_vehicle_fleet_vehicle_fonction_rel ON v.id = public.fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_id
        #             LEFT OUTER JOIN public.fleet_vehicle_fonction f ON f.id = public.fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_fonction_id
        #         where b.active=true
        #     ) AS sub
		# 	WHERE sub.rn = 1;
        # """
        

        self.env.cr.execute(query)
        result = self.env.cr.dictfetchall()

        return result
    def rfid_update3(self):
        query = """
            WITH RankedData AS (
    SELECT *,
	
           ROW_NUMBER() OVER (PARTITION BY sub.bacid ORDER BY sub.rn) AS row_num,
	CASE
                    
                    WHEN (lower(fonctionname) LIKE '%lavage%' AND devicetime >= NOW() - INTERVAL '24 hours') THEN img_bleu
                    WHEN (lower(fonctionname) LIKE '%lavage%' AND devicetime < NOW() - INTERVAL '24 hours') THEN img_gris
                    ELSE img_gris
    END AS final_icon
    FROM (
        SELECT 
            r.*,
            t.ntag,
            b.*,
            b.id AS bacid,
            v.device,
            f.name AS fonctionName,
            fc.name AS freqcollecte,
            fl.name AS freqlavage,
            tp.*,
            ROW_NUMBER() OVER (PARTITION BY b.numero ORDER BY r.devicetime DESC) AS rn
        FROM 
            public.is_bav_bacs b
            INNER JOIN public.is_bav_types tp ON b.is_bav_type_id = tp.id
            LEFT OUTER JOIN public.is_bav_tags t ON b.id = t.idbac
            LEFT OUTER JOIN public.is_bav_frequences fc ON b.freqcollecte = fc.id
            LEFT OUTER JOIN public.is_bav_frequences fl ON b.freqlavage = fl.id
            LEFT OUTER JOIN public.is_rfid_rfid r ON t.ntag = r.tag1
            LEFT OUTER JOIN public.fleet_vehicle v ON r.deviceid = v.id
            LEFT OUTER JOIN public.fleet_vehicle_fleet_vehicle_fonction_rel ON v.id = public.fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_id
            LEFT OUTER JOIN public.fleet_vehicle_fonction f ON f.id = public.fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_fonction_id
        WHERE 
            b.active = true  
            AND lower(f.name) LIKE '%lavage%'
        UNION ALL
        SELECT 
            r.*,
            t.ntag,
            b.*,
            b.id AS bacid,
            v.device,
            f.name AS fonctionName,
            fc.name AS freqcollecte,
            fl.name AS freqlavage,
            tp.*,
            ROW_NUMBER() OVER (PARTITION BY b.numero ORDER BY r.devicetime DESC) AS rn
        FROM 
            public.is_bav_bacs b
            INNER JOIN public.is_bav_types tp ON b.is_bav_type_id = tp.id
            LEFT OUTER JOIN public.is_bav_tags t ON b.id = t.idbac
            LEFT OUTER JOIN public.is_bav_frequences fc ON b.freqcollecte = fc.id
            LEFT OUTER JOIN public.is_bav_frequences fl ON b.freqlavage = fl.id
            LEFT OUTER JOIN public.is_rfid_rfid r ON t.ntag = r.tag1
            LEFT OUTER JOIN public.fleet_vehicle v ON r.deviceid = v.id
            LEFT OUTER JOIN public.fleet_vehicle_fleet_vehicle_fonction_rel ON v.id = public.fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_id
            LEFT OUTER JOIN public.fleet_vehicle_fonction f ON f.id = public.fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_fonction_id
        WHERE 
            b.active = true  
    ) AS sub
)
SELECT *
FROM RankedData
WHERE row_num = 1;


        """
        # query = """
        #     SELECT *,
        #         CASE
        #             WHEN (fonctionname LIKE '%COLLECTE%' AND EXTRACT(EPOCH FROM (NOW() - devicetime)) <= 86400 ) THEN img_green
        #             WHEN (fonctionname LIKE '%COLLECTE%' AND devicetime < NOW() - INTERVAL '24 hours') THEN img_red
        #             WHEN (fonctionname LIKE '%Lavage%' AND devicetime >= NOW() - INTERVAL '24 hours') THEN img_bleu
        #             WHEN (fonctionname LIKE '%Lavage%' AND devicetime < NOW() - INTERVAL '24 hours') THEN img_gris
        #             ELSE img_red
        #         END AS final_icon
        #     FROM (
        #         SELECT 
        #             r.*,
        #             t.ntag,
        #             b.*,
        #             b.id AS bacid,
        #             v.device,
        #             f.name AS fonctionName,
		# 			fc.name as freqcollecte,
		# 			fl.name as freqlavage,
        #             tp.*,
        #             ROW_NUMBER() OVER (PARTITION BY b.numero ORDER BY r.devicetime DESC) AS rn
        #         FROM 
        #             public.is_bav_bacs b
        #             INNER JOIN public.is_bav_types tp ON b.is_bav_type_id = tp.id
        #             LEFT OUTER JOIN public.is_bav_tags t ON b.id = t.idbac
		# 			LEFT OUTER JOIN public.is_bav_frequences fc ON b.freqcollecte = fc.id
		# 			LEFT OUTER JOIN public.is_bav_frequences fl ON b.freqlavage = fl.id
        #             LEFT OUTER JOIN public.is_rfid_rfid r ON t.ntag = r.tag1
        #             LEFT OUTER JOIN public.fleet_vehicle v ON r.deviceid = v.id
        #             LEFT OUTER JOIN public.fleet_vehicle_fleet_vehicle_fonction_rel ON v.id = public.fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_id
        #             LEFT OUTER JOIN public.fleet_vehicle_fonction f ON f.id = public.fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_fonction_id
        #         where b.active=true
        #     ) AS sub
		# 	WHERE sub.rn = 1;
        # """
        

        self.env.cr.execute(query)
        result = self.env.cr.dictfetchall()

        return result


    def getDHActivity(self,idd,date):     
        res = self.env['is_tools.dh'].search_read([("deviceid", "=", idd),("datej", "=", date)],["activite"])
        return res
    


    def open_owl_view(self):
        return {
            'type': 'ir.actions.client',
            'tag': 'action_is_temp_reel1',  # Replace with the actual tag of your Owl view
            'context': {
                'default_device': self.device,
            },
        }
    


    def get_map_data22(self):
        return self.env['fleet.vehicle'].search_read([],order = "device")
    




    def get_work_hours(self,idVeh):
        # query = """
        #  select * from public.fleet_vehicle_positions2 where deviceid=%s and fixtime > current_date+'00:00:00'::time and acc='1' order by fixtime asc limit 1
         
        # """
        # self.env.cr.execute(query, (idVeh,))
        # result1 = self.env.cr.dictfetchall()
        

        # query = """
        #  select * from public.fleet_vehicle_positions2 where deviceid=%s and fixtime > current_date+'00:00:00'::time and acc='1' order by fixtime desc limit 1
         
        # """
        query = """
 SELECT MIN(devicetime), MAX(devicetime)
FROM public.is_rfid_vrfid 
WHERE deviceid = %s and devicetime>=current_date
        """
        # query = """
        # select min(fixtime),max(fixtime) from public.fleet_vehicle_positions2 where deviceid=%s and fixtime > current_date+'00:00:00'::time and acc='1' 
         
        # """



        self.env.cr.execute(query, (idVeh,))
        # result2 = self.env.cr.dictfetchall()
        result = self.env.cr.dictfetchall()


        # result=[]
        # result.append(result1)
        # result.append(result2)

        return result
    def get_battery(self,idVeh):
        # query = """
        #  select * from public.fleet_vehicle_positions2 where deviceid=%s and fixtime > current_date+'00:00:00'::time and acc='1' order by fixtime asc limit 1
         
        # """
        # self.env.cr.execute(query, (idVeh,))
        # result1 = self.env.cr.dictfetchall()
        

        # query = """
        #  select * from public.fleet_vehicle_positions2 where deviceid=%s and fixtime > current_date+'00:00:00'::time and acc='1' order by fixtime desc limit 1
         
        # """
        query = """
 SELECT soc
FROM public.batterie a

WHERE deviceid = %s
order by devicetime desc limit 1
  
        """
        # query = """
        # select min(fixtime),max(fixtime) from public.fleet_vehicle_positions2 where deviceid=%s and fixtime > current_date+'00:00:00'::time and acc='1' 
         
        # """



        self.env.cr.execute(query, (idVeh,))
        # result2 = self.env.cr.dictfetchall()
        result = self.env.cr.dictfetchall()


        # result=[]
        # result.append(result1)
        # result.append(result2)

        return result
    




    def get_num_bacs(self,idVeh):
        # query = """
        #  select * from public.fleet_vehicle_positions2 where deviceid=%s and fixtime > current_date+'00:00:00'::time and acc='1' order by fixtime asc limit 1
         
        # """
        # self.env.cr.execute(query, (idVeh,))
        # result1 = self.env.cr.dictfetchall()
        

        # query = """
        #  select * from public.fleet_vehicle_positions2 where deviceid=%s and fixtime > current_date+'00:00:00'::time and acc='1' order by fixtime desc limit 1
         
        # """
        query = """

select count(*) from is_rfid_vrfid where deviceid = %s and devicetime between current_date+'00:00:00'::time and current_date+'23:59:59'::time 

"""
#         query = """

# select count(*) from is_rfid_vrfid where device = %s and devicetime between current_date+'00:00:00'::time and current_date+'23:59:59'::time 

# """
        
        
        
        
        
        #  SELECT
        #            count(*)
        #             FROM public.is_rfid_rfid r
        #             inner join public.is_rfid_tags t on r.tag1=t.ntag
        #             inner join public.is_rfid_bacs b on b.id=t.idbac
        #             INNER JOIN public.is_rfid_frequences fl ON (b.freqlavage = fl.id)
        #             INNER JOIN public.is_rfid_frequences fc ON (b.freqcollecte = fc.id)
        #             INNER JOIN public.is_rfid_typebacs tb ON (b.typeb = tb.id)
        #             INNER JOIN public.is_rfid_famille_bac fb ON (tb.famille_id = fb.id)
        #             INNER JOIN public.is_rfid_icons i ON (tb.icon = i.id)
        #             where deviceid = %s and devicetime between current_date+'00:00:00'::time and current_date+'23:59:59'::time 
        
        # SELECT
        #             b.id,
        #             b.lastdeviceid,
        #             b.numpark,
        #             b.numbac,
        #             b.adresse,
        #             b.newla,
        #             b.newlo,
        #             b.datems,
        #             b.latitude,
        #             b.longitude,
        #             b.active,
        #             fc.name as "frequence_collect",
        #             b.lastupdate,
        #             fl.name as "frequence_lavage",
        #             tb.name as "typeb",
        #             tb.capacity,
        #             i.img_green,
        #             i.name as "icon_name",
        #             fb.name as "famille",
        #             t.ntag,
        #             t.lasttime
        #             FROM public.is_rfid_rfid r
        #             inner join public.is_rfid_tags t on r.tag1=t.ntag
        #             inner join public.is_rfid_bacs b on b.id=t.idbac
        #             INNER JOIN public.is_rfid_frequences fl ON (b.freqlavage = fl.id)
        #             INNER JOIN public.is_rfid_frequences fc ON (b.freqcollecte = fc.id)
        #             INNER JOIN public.is_rfid_typebacs tb ON (b.typeb = tb.id)
        #             INNER JOIN public.is_rfid_famille_bac fb ON (tb.famille_id = fb.id)
        #             INNER JOIN public.is_rfid_icons i ON (tb.icon = i.id)
        #             where deviceid = %s and devicetime between current_date+'00:00:00'::time and current_date+'23:59:59'::time 


        self.env.cr.execute(query, (idVeh,))
        # result2 = self.env.cr.dictfetchall()
        result = self.env.cr.dictfetchall()


        # result=[]
        # result.append(result1)
        # result.append(result2)

        return result
    
    def getTagLast10s(self, id):
        query = """
            SELECT * FROM public.is_rfid_rfid 
             WHERE servertime >= current_timestamp - '00:00:10'::interval AND servertime <= current_timestamp + '00:00:10'::interval  AND deviceid = %s 
        """

        self.env.cr.execute(query, (id,))
        result = self.env.cr.dictfetchall()

        return result