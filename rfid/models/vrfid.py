from odoo import api, models ,fields, tools
from psycopg2 import sql


    

class VRfid(models.Model):
    _name="is_rfid.vrfid"
    _auto=False
    _description="rfid view"
    _table = 'is_rfid_vrfid'
    device=fields.Char("")
    devicetime=fields.Datetime()
    servertime=fields.Char()
    lat=fields.Float("")
    lon=fields.Float("")
    numero=fields.Char("")
    adresse=fields.Char("") 
    freqlavage=fields.Char("")
    freqcollecte=fields.Char("")
    marque=fields.Char("")
    categorie=fields.Char("")
    color=fields.Char("")
    datems=fields.Char("") 
    capacite=fields.Char("")
    name=fields.Char("")
    img_red=fields.Char("")
    img_green=fields.Char("")
    img_bleu=fields.Char("")
    img_gris=fields.Char("")
    img_mauve=fields.Char("")
    fonction=fields.Char("")
 

    def getRFID(self, start, end, vehicleId ,type, etat):
        new_query = """
          SELECT 
            public.is_rfid_vrfid.id,
            public.is_rfid_vrfid.device,
            public.is_rfid_vrfid.devicetime,
            public.is_rfid_vrfid.servertime,
            public.is_rfid_vrfid.lat,                                                                          
            public.is_rfid_vrfid.lon,
            public.is_rfid_vrfid.numero,
            public.is_rfid_vrfid.adresse,
            public.is_rfid_vrfid.freqlavage,
            public.is_rfid_vrfid.freqcollecte,
            public.is_rfid_vrfid.marque,
            public.is_rfid_vrfid.categorie,
            public.is_rfid_vrfid.color,
            public.is_rfid_vrfid.datems,
            public.is_rfid_vrfid.capacite,
            public.is_rfid_vrfid.name as typeb,
            public.is_rfid_vrfid.img_red,
            public.is_rfid_vrfid.img_green,
            public.is_rfid_vrfid.img_bleu,
            public.is_rfid_vrfid.img_gris,
            public.is_rfid_vrfid.img_mauve,
            public.is_rfid_vrfid.fonction as name
          FROM 
            public.is_rfid_vrfid 
            
          WHERE 
            public.is_rfid_vrfid.deviceid = {} and 
            public.is_rfid_vrfid.devicetime BETWEEN '{}' AND '{}' AND  
            lower(public.is_rfid_vrfid.name) LIKE '%{}%' 
            and lower(public.is_rfid_vrfid.fonction) like '%{}%'  
        """.format(vehicleId,start, end, type, etat)
        
        # print(new_query)
        self.env.cr.execute(new_query)
        result = self.env.cr.dictfetchall() 
        
        return result
        
    def getRFIDCir(self, start, end, vehicules, circuitid ,type, etat):
        new_query = """
        SELECT 
          max(public.is_rfid_vrfid.id) AS id,
          public.is_rfid_vrfid.device,
          public.is_rfid_vrfid.devicetime,
          public.is_rfid_vrfid.servertime,
          max(public.is_rfid_vrfid.lat) AS lat,
          max(public.is_rfid_vrfid.lon) AS lon,
          public.is_rfid_vrfid.numero,
          public.is_rfid_vrfid.adresse,
          public.is_rfid_vrfid.freqlavage,
          public.is_rfid_vrfid.freqcollecte,
          public.is_rfid_vrfid.marque,
          public.is_rfid_vrfid.categorie,
          public.is_rfid_vrfid.color,
          public.is_rfid_vrfid.datems,
          public.is_rfid_vrfid.capacite,
          public.is_rfid_vrfid.name AS typeb,
          public.is_rfid_vrfid.img_red,
          public.is_rfid_vrfid.img_green,
          public.is_rfid_vrfid.img_bleu,
          public.is_rfid_vrfid.img_gris,
          public.is_rfid_vrfid.img_mauve,
          public.fleet_vehicle_fonction.name
        FROM
          public.fleet_vehicle
          INNER JOIN public.is_rfid_vrfid ON (public.fleet_vehicle.device = public.is_rfid_vrfid.device)
          INNER JOIN public.fleet_vehicle_fleet_vehicle_fonction_rel ON (public.fleet_vehicle.id = public.fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_id)
          INNER JOIN public.fleet_vehicle_fonction ON (public.fleet_vehicle_fonction.id = public.fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_fonction_id),
          public.is_decoupage_routes r
          INNER JOIN public.is_decoupage_circuit_route_rel ON (r.id = public.is_decoupage_circuit_route_rel.route_id)
          INNER JOIN public.is_decoupage_circuits ON (public.is_decoupage_circuit_route_rel.circuit_id = public.is_decoupage_circuits.id)
          WHERE
            st_dwithin(r.geom, st_setsrid(st_makepoint(public.is_rfid_vrfid.lon, public.is_rfid_vrfid.lat), 4326), 0.00015) AND 
            public.is_decoupage_circuits.id = {} and 
            public.fleet_vehicle.id in ({}) and 
            public.is_rfid_vrfid.devicetime BETWEEN '{}' AND '{}' AND  
            lower(public.is_rfid_vrfid.name) LIKE '%{}%' 
            and lower(public.fleet_vehicle_fonction.name) like '%{}%{}%'  
          GROUP BY
            public.is_rfid_vrfid.device,
            public.is_rfid_vrfid.devicetime,
            public.is_rfid_vrfid.servertime,
            public.is_rfid_vrfid.numero,
            public.is_rfid_vrfid.adresse,
            public.is_rfid_vrfid.freqlavage,
            public.is_rfid_vrfid.freqcollecte,
            public.is_rfid_vrfid.marque,
            public.is_rfid_vrfid.categorie,
            public.is_rfid_vrfid.color,
            public.is_rfid_vrfid.datems, 
            public.is_rfid_vrfid.capacite,
            public.is_rfid_vrfid.name,
            public.is_rfid_vrfid.img_red,
            public.is_rfid_vrfid.img_green,
            public.is_rfid_vrfid.img_bleu,
            public.is_rfid_vrfid.img_gris,
            public.is_rfid_vrfid.img_mauve,
            public.fleet_vehicle_fonction.name
        """.format(circuitid, vehicules,start, end, type, etat, type)
        # print(new_query)
        self.env.cr.execute(new_query)
        result = self.env.cr.dictfetchall() 
        return result
        

    # @api.model 
    def getRfid(self, _from, _to, state, type):  
        new_query = """
          SELECT 
            vrfid.*
          FROM
            public.is_rfid_vrfid vrfid
            INNER JOIN public.fleet_vehicle fv ON (fv.device = vrfid.device)  
            INNER JOIN public.fleet_vehicle_fleet_vehicle_fonction_rel ON fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_id = fv.id
            inner join public.fleet_vehicle_fonction ON fleet_vehicle_fonction.id = fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_fonction_id
			
          WHERE  
            devicetime between '{}'::timestamp and '{}'::timestamp  
            AND lower(public.fleet_vehicle_fonction.name) like '%{}%{}%'
        """.format(_from, _to, state, type )
        # print(new_query)
        self.env.cr.execute(new_query)
        result = self.env.cr.dictfetchall()
      
        return result
    
    def get_result(self, t, e, start, end):
        query="""
          WITH readed AS (
              SELECT DISTINCT 
                rfid.id,
                bacs.numero,
                rfid.deviceid,
                rfid.devicetime
              FROM
                public.is_rfid_rfid rfid
                INNER JOIN public.is_bav_tags tags ON (rfid.tag1 = tags.ntag)
                INNER JOIN public.is_bav_bacs bacs ON (tags.idbac = bacs.id)
                INNER JOIN public.fleet_vehicle fv ON (fv.id = rfid.deviceid)
                INNER JOIN public.fleet_vehicle_fleet_vehicle_fonction_rel ON fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_id = fv.id 
                INNER JOIN public.fleet_vehicle_fonction ON fleet_vehicle_fonction.id = fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_fonction_id
				 
              WHERE devicetime between '{}' AND  '{}' and lower(public.fleet_vehicle_fonction.name) like '%{}%{}%'
          )

          SELECT
              bacs.numero,
              CASE
                  WHEN bacs.numero IN (SELECT numero FROM readed) THEN (
                      SELECT fv.device 
                      FROM 
                          readed
                          INNER JOIN public.fleet_vehicle fv ON readed.deviceid = fv.id
                      WHERE readed.numero = bacs.numero
                      LIMIT 1
                  )
                  ELSE ''
              END AS device,
            CASE
                  WHEN bacs.numero IN (SELECT numero FROM readed) THEN (
                      SELECT devicetime
                      FROM 
                          readed 
                      WHERE readed.numero = bacs.numero
                      LIMIT 1
                  )
                  ELSE null
              END AS heure,
              CASE
                  WHEN bacs.numero IN (SELECT numero FROM readed) THEN (
                      bacs."lastlongitude"
                  )
                  ELSE null
              END AS lastlatitude,
              CASE
                  WHEN bacs.numero IN (SELECT numero FROM readed) THEN (
                bacs."lastlongitude"
                  )
                  ELSE null
              END AS lastlongitude,
            ts.name as typeb
          FROM 
            public.is_bav_bacs bacs
            inner join public.is_bav_types ts on ts.id = bacs.is_bav_type_id
          where lower(ts.name) like '%{}%'  and active = true
          ORDER BY device desc;

        """.format(start, end,e, t, t)
        # print(query)
        self.env.cr.execute(query)
        result = self.env.cr.dictfetchall()
 
        
        return result

    def getRFIDZone(self, start, end,  zone_id ,type, etat):
        new_query = """
        SELECT 
          max(public.is_rfid_vrfid.id) AS id,
          public.is_rfid_vrfid.device,
          public.is_rfid_vrfid.devicetime,
          public.is_rfid_vrfid.servertime,
          max(public.is_rfid_vrfid.lat) AS lat,
          max(public.is_rfid_vrfid.lon) AS lon,
          public.is_rfid_vrfid.numero,
          public.is_rfid_vrfid.adresse,
          public.is_rfid_vrfid.freqlavage,
          public.is_rfid_vrfid.freqcollecte,
          public.is_rfid_vrfid.marque,
          public.is_rfid_vrfid.categorie,
          public.is_rfid_vrfid.color,
          public.is_rfid_vrfid.datems,
          public.is_rfid_vrfid.capacite,
          public.is_rfid_vrfid.name AS typeb,
          public.is_rfid_vrfid.img_red,
          public.is_rfid_vrfid.img_green,
          public.is_rfid_vrfid.img_bleu,
          public.is_rfid_vrfid.img_gris,
          public.is_rfid_vrfid.img_mauve,
          public.fleet_vehicle_fonction.name
        FROM
          public.fleet_vehicle
          INNER JOIN public.is_rfid_vrfid ON (public.fleet_vehicle.device = public.is_rfid_vrfid.device)
          INNER JOIN public.fleet_vehicle_fleet_vehicle_fonction_rel ON (public.fleet_vehicle.id = public.fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_id)
          INNER JOIN public.fleet_vehicle_fonction ON (public.fleet_vehicle_fonction.id = public.fleet_vehicle_fleet_vehicle_fonction_rel.fleet_vehicle_fonction_id),
          is_decoupage deco
          WHERE
            deco.id = {}  and 
            st_contains(deco.geom, st_setsrid(st_makepoint(is_rfid_vrfid.lon,is_rfid_vrfid.lat), 4326)) AND 
            public.is_rfid_vrfid.devicetime BETWEEN '{}' AND '{}' AND  
            lower(public.is_rfid_vrfid.name) LIKE '%{}%' 
            and lower(public.fleet_vehicle_fonction.name) like '%{}%{}%'  
          GROUP BY
            public.is_rfid_vrfid.device,
            public.is_rfid_vrfid.devicetime,
            public.is_rfid_vrfid.servertime,
            public.is_rfid_vrfid.numero,
            public.is_rfid_vrfid.adresse,
            public.is_rfid_vrfid.freqlavage,
            public.is_rfid_vrfid.freqcollecte,
            public.is_rfid_vrfid.marque,
            public.is_rfid_vrfid.categorie,
            public.is_rfid_vrfid.color,
            public.is_rfid_vrfid.datems, 
            public.is_rfid_vrfid.capacite,
            public.is_rfid_vrfid.name,
            public.is_rfid_vrfid.img_red,
            public.is_rfid_vrfid.img_green,
            public.is_rfid_vrfid.img_bleu,
            public.is_rfid_vrfid.img_gris,
            public.is_rfid_vrfid.img_mauve,
            public.fleet_vehicle_fonction.name
        """.format(zone_id, start, end, type, etat, type)
        # print(new_query)
        self.env.cr.execute(new_query)
        result = self.env.cr.dictfetchall() 
        return result
        
