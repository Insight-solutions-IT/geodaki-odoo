# -*- coding: utf-8 -*-

from odoo import models, fields, api
from datetime import datetime

class FleetVehiclePos(models.Model):
    # _name = "is_historique.positions"
    # _auto = False
    _inherit =  "fleet.vehicle.positions2"


    # protocol = fields.Char(string='Protocol', size=128)
    # deviceid = fields.Integer(string='Device ID', required=True)
    # servertime = fields.Datetime(string='Server Time', required=True)
    # devicetime = fields.Datetime(string='Device Time', required=True)
    # fixtime = fields.Datetime(string='Fix Time', required=True)
    # start = fields.Char(string='HEURE DEBUT', compute='_compute_start', store=False)
    # test = fields.Date(string='test', compute='select1', store=False)
    # #sommeD = fields.Float(string='sommeD', compute='select1', store=False)

    # valid = fields.Boolean(string='Valid', required=True)
    # latitude = fields.Float(string='Latitude', required=True)
    # longitude = fields.Float(string='Longitude', required=True)
    # altitude = fields.Float(string='Altitude')
    # speed = fields.Float(string='Speed')
    # course = fields.Float(string='Course')
    # address = fields.Char(string='ADRESSE DEPART', size=512)
    # attributes = fields.Char(string='Attributes', size=4000)
    # accuracy = fields.Float(string='Accuracy', default=0)
    # network = fields.Char(string='Network' , size=4000)
    # geom = fields.Char(string='Geometry (,Point,4326)')
    # flags = fields.Char(string='Flags', size=5)
    # gps = fields.Char(string='GPS', size=3)
    # distance = fields.Float(string='Distance')
    # d2 = fields.Float(string='D2')
    # iccid = fields.Char(string='ICCID', size=20)
    # sat = fields.Integer(string='Satellites')
    # bat = fields.Integer(string='Battery')
    # id_cirdet = fields.Integer(string='ID Cirdet')
    # dsb = fields.Boolean(string='DSB', default=False)
    # powerdetect = fields.Integer(string='Power Detect')
    # acc = fields.Char(string='Acc', required=True, default='0')
    # nomrue = fields.Char(string='Nomrue', size=100)
    # id2 = fields.Integer(string='ID2', default=0, digits=(18, 0))
    # power2 = fields.Integer(string='Power2')
    # power3 = fields.Integer(string='Power3')
    # odometre = fields.Integer(string='Odometre')
    # km = fields.Integer(string='Kilometers')
    # hrs = fields.Integer(string='Hours')
    # gas = fields.Integer(string='Gas')
    # capt = fields.Char(string='Capt', size=40)
    # can4 = fields.Integer(string='CAN 4')
    # can5 = fields.Integer(string='CAN 5')
    # can6 = fields.Integer(string='CAN 6')
    # can7 = fields.Integer(string='CAN 7')
    # can8 = fields.Integer(string='CAN 8')
    # can9 = fields.Integer(string='CAN 9')
    # can10 = fields.Integer(string='CAN 10')
    # datep = fields.Date(string='DATE')

    

    # def _compute_start(self):
    #     for record in self:
    #         # Perform the calculation here
    #         # For example, you can add 1 hour to the fixtime
    #         if record.fixtime:
    #             fixtime = str(record.fixtime)

                
    #             record.start = fixtime[11:19]
    #         else:
    #             record.start = False
    

    # def select1(self):
    #     new_query = """
    #     SELECT *
    #     FROM public.is_historique_positions 
    #     where deviceid =788 and datep = '2023-09-19'::date 
    #     """

    #     # Execute the SQL query and fetch the results
    #     self.env.cr.execute(new_query)
    #     result = self.env.cr.dictfetchall()

    #     for record in result:
    #         record.test=result[0].datep

    #     return result

    """
    SELECT t.device as "N° PARC",
            t.t1 as "Temps Entrée",
            t.z1::text as "Zone Entrée",
            t.t2 as "Temps Sortie",
            t.z2::text as "Zone Sortie"
        FROM (
              SELECT devices.name AS device,
                      devices.id,
                      positions.fixtime AS t1,
                      geofences.name::text AS z1,
                      lag(positions.fixtime) OVER(PARTITION BY positions.deviceid
              ORDER BY positions.fixtime) AS t2,
                        (lag(geofences.name) OVER(PARTITION BY positions.deviceid
              ORDER BY positions.fixtime))::text AS z2
              FROM public.fleet_vehicle_positions2 positions
                    JOIN public.fleet_vehicle devices ON positions.deviceid = devices.id,
                    geofences
              WHERE st_contains(geofences.geom, positions.geom) = true 
                      and devices.id = 24
                      and positions.fixtime >= '11-03-2024 00:00:00'
                      and positions.fixtime <= '12-03-2024 23:59:59'
            ) t
        WHERE t.z1::text <> t.z2::text AND 
              (t.z1::text = 'Parc'::text AND t.z2::text = 'PARCSORTIE'::text) or
              (t.z1::text = 'PARCSORTIE'::text AND t.z2::text = 'Parc'::text)

----------------------------

 SELECT 
            gps.taux_cir.datej,
            public.leplanning3.df,
            public.devices.name as vehicule,
            public.devices.id "deviceid",
            public.devices.fonction,
            public.groups.prefecture,
            public."CIRCUIT"."NOM" AS circuit,
            public."CIRCUIT".secteur,
            gps.taux_cir.taux
            
          FROM
            gps.taux_cir
            INNER JOIN public.devices ON (gps.taux_cir.deviceid = public.devices.id)
            INNER JOIN public.groups ON (public.devices.groupid = public.groups.id)
            INNER JOIN public."CIRCUIT" ON (gps.taux_cir.idcircuit = public."CIRCUIT"."IDCIRCUIT")
            inner join public.leplanning3 on (public.leplanning3.idcircuit = public."CIRCUIT"."IDCIRCUIT")
          where
          gps.taux_cir.datej = '2024-03-01'
          and public.devices.name = 'ARER5308'
          and public.leplanning3.datej = '2024-03-01'


-----------------------------------------
#   dechet verte

CREATE TABLE public.dv (
  id SERIAL,
  deviceid INTEGER NOT NULL,
  devicetime TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  flag SMALLINT DEFAULT 0,
  username VARCHAR,
  phone VARCHAR,
  CONSTRAINT dv_pkey PRIMARY KEY(id)
) ;



--------------------------------------------
#    gas consom

SELECT 
    
    
    devices.name AS "device",
    
    max(p.can4)-min(p.can4),
    max(p.can4),
    min(p.can4),
    sum(p.distance),
    max(p.speed)
  

   FROM
    positions p
    inner JOIN devices ON (devices.id = p.deviceid)
            
  WHERE
    p.fixtime >= '01-03-2024 00:00:00' AND p.fixtime < '01-03-2024 23:59:59'
            
    and p.can4 > 0
  
  group by devices.name

  -----------------------------------

  SELECT *
FROM
  public.fleet_vehicle
  INNER JOIN public.fleet_vehicle_fleet_vehicle_fonction_rel ON (public.fleet_vehicle.id = public.fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_id)
  INNER JOIN public.fleet_vehicle_fonction ON (public.fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_fonction_id = public.fleet_vehicle_fonction.id)
  INNER JOIN public.fleet_vehicle_positions2 ON (public.fleet_vehicle.id = public.fleet_vehicle_positions2.deviceid)
    
    """
   

    def calculePosHis(self,idd,date1 ,date2 ,uuid):

        new_query = """
        SELECT *
        FROM public.fleet_vehicle_positions2 
        where deviceid ={} and fixtime between '{}'::timestamp and '{}'::timestamp
        ORDER BY fixtime ASC 
        """

        # Execute the SQL query and fetch the results
        self.env.cr.execute(new_query.format(idd,date1, date2))
        results = self.env.cr.dictfetchall()
       
        # results = self.env['fleet.vehicle.positions2'].search_read([
        # ("deviceid", "=", ),("fixtime", ">=", ), ("fixtime", "<=", )
        # ], [])


        def defTime(start_datetime,end_datetime):
            x_time = datetime.strptime(end_datetime, '%Y-%m-%d %H:%M:%S')
            y_time = datetime.strptime(start_datetime, '%Y-%m-%d %H:%M:%S')

            time_difference =  y_time - x_time

            # Extract hours, minutes, and seconds from the time difference
            total_seconds = time_difference.total_seconds()
            hours = int(total_seconds // 3600)
            minutes = int((total_seconds % 3600) // 60)
            seconds = int(total_seconds % 60)
            return str(hours) +':'+ str(minutes) +':'+ str(seconds)

            
        

        listPos = []
        if results:
            sommeD = 0
            old_acc = results[0]['acc']
            i = 0
            
            start_datetime = str(results[0]['fixtime'])
            end_datetime = ''
            temp_datetime = ''
            old_adresse =results[0]['address']
            new_adresse =''
            duree= ''
            arret= ''
            datep=''
            datej = str(results[0]['fixtime'])[0:10]
            for pos in results:
                
                
                if pos['acc'] == old_acc:
              

                    sommeD = sommeD + pos['distance'] 
                    
                    end_datetime = str(pos['fixtime'])
                    
                    start_datetime = start_datetime
                    old_adresse = pos['address']  
                    new_adresse = old_adresse
                    old_acc = pos['acc'] 
                    datep = pos['datep']
                else:
                    
                    

                    if old_acc == '0':
                        duree= ''
                        arret= defTime(end_datetime,start_datetime)
                    else:
                        duree= defTime(end_datetime,start_datetime)
                        arret= ''

                    listPos.append({'datej':datej,'datep':datep,'deviceid':idd,'duree':duree,'arret':arret,'id':str(idd) + str(start_datetime)+ str(end_datetime) ,'old_adresse':old_adresse,'new_adresse':new_adresse,'acc': old_acc, 'sommeD': sommeD, 'start_datetime':start_datetime[11:],'end_datetime':end_datetime[11:]})
                    # start_datetime=''
                    start_datetime = end_datetime
                    old_adresse = new_adresse = pos['address']
                    end_datetime = str(pos['fixtime'])
                    datep = pos['datep']
                    old_acc = pos['acc']
                    sommeD=pos['distance']
                    
                i+=1

            

            if old_acc == '0':
                duree= ''
                arret= defTime(end_datetime,start_datetime)
            else:
                duree= defTime(end_datetime,start_datetime)
                arret= ''
            listPos.append({'datej':datej,'datep':datep,'deviceid':idd,'duree':duree,'arret':arret,'id':str(idd) + str(start_datetime)+ str(end_datetime) ,'old_adresse':old_adresse,'new_adresse':new_adresse,'acc': old_acc, 'sommeD': sommeD, 'start_datetime':start_datetime[11:],'end_datetime':end_datetime[11:]})

            #print("-*--***-****-",listPos)

            # vide table calcule
            # sql = """delete from public.is_historique_calcule where deviceid = {} and datej = '{}' """

            # self.env.cr.execute(sql.format(idd,datej))

            # iserer calcule
            for p in listPos:
                # res = self.env['is_historique.calcule'].search_read([
                # ("unique_id", "=", p['id']),("start_datetime", "=", p['start_datetime']), ("end_datetime", "=", p['end_datetime'])
                # ], [])
                
                # if not res:
                position_record = self.env['is_historique.calcule'].create({
                    'deviceid': p['deviceid'],
                    'datep': p['datep'],
                    'unique_id': p['id'],
                    'acc': p['acc'],
                    'duree': p['duree'],
                    'arret': p['arret'],
                    'new_adresse': p['new_adresse'],
                    'old_adresse': p['old_adresse'],
                    'sommeD': p['sommeD'],
                    'start_datetime': p['start_datetime'],
                    'end_datetime': p['end_datetime'],
                    'datej':p['datej'],
                    'uuid' : uuid
                })


        return results

        

    
     

   


    def affPosMult(self, idd, start_time, end_time):
        tup = tuple(idd)
        tup_str = str(tup)
        if len(idd) == 1:
            tup_str = tup_str[:-2] + tup_str[-1]
    


        new_query = """
        SELECT *
        FROM public.fleet_vehicle_positions2 
        where deviceid in {} and fixtime between '{}'::timestamp and '{}'::timestamp
        ORDER BY fixtime ASC 
        """

        # Execute the SQL query and fetch the results
        self.env.cr.execute(new_query.format(tup_str,start_time, end_time))
        result = self.env.cr.dictfetchall()

       
        
        return result
#

    def affPos(self, idd, start_time, end_time):
        new_query = """
        SELECT *
        FROM public.fleet_vehicle_positions2 
        where deviceid={} and fixtime between '{}' and '{}'
        ORDER BY fixtime ASC 
        """

        # Execute the SQL query and fetch the results
        self.env.cr.execute(new_query.format(idd,start_time, end_time))
        result = self.env.cr.dictfetchall()

        
        
        return result


    def affPosTracage(self, idd, date):
        new_query = """
            SELECT *
            FROM public.fleet_vehicle_positions2
            where deviceid={} and devicetime between '{} 00:00:00' and '{} 23:59:59'
            ORDER BY fixtime ASC
        """

        # Execute the SQL query and fetch the results
        self.env.cr.execute(new_query.format(idd,date,date))
        result = self.env.cr.dictfetchall()

        
        
        return result
        
    

