# -*- coding: utf-8 -*-

from odoo import models, fields, api , exceptions

from datetime import datetime , timedelta , date

import psycopg2
from psycopg2 import extras
import re

sql = """
SELECT 
  d.id,
  d.name,
  d.lastupdate,
  d.vehicule,
  d.typeveh,
  d.disabled,
  d.fonction,
  g.prefecture
FROM
  public.devices d
  INNER JOIN public.groups g ON (d.groupid = g.id)
WHERE d.id < 20
"""

sqlPos = """
SELECT 
  fixtime::date AS "DATE",
  d.name AS "VEHICULE",
  d.typeveh AS "NATURE",
  d.marque,
  d.fonction,
  g.prefecture,
  (MAX(p.km) - MIN(p.km)) AS "KM",
  (MAX(p.hrs) - MIN(p.hrs)) AS "HR",
  (MAX(p.can4) - MIN(p.can4)) AS "CONSOMATION"
  
FROM
  public.positions p
  INNER JOIN public.devices d ON (p.deviceid = d.id)
  INNER JOIN public.groups g ON (d.groupid = g.id)
WHERE
  d.disabled = false AND 
  d.capteur LIKE '%CAN%' AND 
  p.km > -1 AND 
  p.km < 1000000 AND 
  p.hrs > -1 AND 
  p.hrs < 1000000 AND 
  p.can4 >= -1 AND 
  p.can4 < 1000000 AND 
  p.fixtime >= CURRENT_DATE+ '00:00:00' ::time AND 
  p.fixtime <= CURRENT_DATE+ '23:59:59' ::time
GROUP BY
  "DATE",
  d.name,
  d.typeveh,
  d.marque,
  d.fonction,
  g.prefecture;
"""



class dbsource(models.Model):
    _name = 'base.external.dbsource'
    _auto = False

    company_id = fields.Integer()
    
    
    name = fields.Char()
    password = fields.Char()
    ca_certs = fields.Char()
    connector = fields.Char()
    conn_string = fields.Text()
    client_cert = fields.Text()
    client_key = fields.Text()
  
class Bacs(models.Model):
    _name = 'is_dashboard.bacs'
    _description = 'bacs'

    nb_bacs = fields.Integer()
    nb_bacs_deplace = fields.Integer()
    nb_bacs_coll = fields.Integer()
    nb_bacs_lav = fields.Integer()
    nb_bacs_no_coll = fields.Integer()
    realis_bac = fields.Float()
    datej = fields.Char()
    last_date = fields.Char()
    nb_calcule_bacs = fields.Integer()

class DashboardDay(models.Model):
    _name = 'is_dashboard.dashboard_day'
    _description = 'dashboard data day'

    vehId = fields.Integer()

    device = fields.Char(string="Véhicule")

    fonction = fields.Char()

    datej = fields.Char(string="Date jour")

    last_date = fields.Char()

    # last_parc_zone = fields.Boolean()

    heures_travaillees = fields.Char(string='Heures Travaillées')

    km_dans_le_circuit = fields.Float(string='Km dans le Circuit')

    km_hors_du_circuit = fields.Float(string='Km hors du Circuit')

    km_total = fields.Float(string='Km Total')

    pourcentage_realisation_bacs = fields.Float(string='% Réalisation Bacs')

    pourcentage_respect_horaire_planifie = fields.Float(string='% Respect Horaire Planifié')

    bacs_collectes = fields.Integer(string='Bacs Collectés')

    bacs_laves = fields.Integer(string='Bacs Lavés')

    bacs_non_collectes = fields.Integer(string='Bacs Non Collectés')

    services_realises = fields.Integer(string='Services Réalisés')
    
    moyenne_accelerations = fields.Float(string='μ Accélérations')
    
    moyenne_freinage = fields.Float(string='μ Freinage')
    
    acces_decharge = fields.Integer(string='Accès à la Décharge')
    
    acces_points_transfert = fields.Integer(string='Accès aux Points de Transfert')
    
    acces_zones_interets = fields.Integer(string='Accès aux Zones d\'Intérêts')
    
    compactions_dechets = fields.Integer(string='Compactions des Déchets')
    
    cycles_leve_conteneur = fields.Integer(string='Cycles du Lève Conteneur')
    
    heures_activation_pompe = fields.Char(string='Heures Activation Pompe')
    
    moyenne_vitesses = fields.Float(string='μ Vitesses')
    
    max_vitesse = fields.Float(string='Max Vitesse')
    
    exces_vitesse_60 = fields.Integer(string='Excès de Vitesse 60')

    exces_vitesse_80 = fields.Integer(string='Excès de Vitesse 80')                           
    exces_vitesse_100 = fields.Integer(string='Excès de Vitesse 100')                          
    exces_vitesse_120 = fields.Integer(string='Excès de Vitesse 120')
    
    moyenne_tonnage_au_vidage = fields.Float(string='μ Tonnage au Vidage')
    
    max_temperature_moteur = fields.Float(string='Max Température Moteur')
    
    arrets_moins_5min = fields.Integer(string='Arrêts < 5min')
    
    arrets_plus_5min = fields.Integer(string='Arrêts > 5min')
    
    sorties_circuit_theorique = fields.Integer(string='Sorties Circuit Théorique (>10min)')
    
    pt_dechets_verts = fields.Integer(string='Pt Déchets Verts')
    
    anomalies_declarees = fields.Integer(string='Anomalies Déclarées')
    
    anomalies_techniques = fields.Integer(string='Anomalies Techniques')
    
    allumages_extinctions = fields.Integer(string='Allumages/Extinctions')
    
    demarrages_non_autorises = fields.Integer(string='Démarrages Non Autorisés')
    
    chargement_dechargement_amplirolls = fields.Integer(string='Chargement/Déchargement Amplirolls')
    
    bacs_deplaces_plus_30m = fields.Integer(string='Bacs Déplacés >30m')
    
    bacs_actifs_sur_terrain = fields.Integer(string='Bacs Actifs sur Terrain')
    
    entrees_sorties_parc = fields.Integer(string='Entrées/Sorties Parc')
    
    deltaT_entrees_sorties_parc = fields.Char(string='ΔT Entrées/Sorties Parc')
    
    kg_CO2 = fields.Float(string='Kg CO2')
    
    km_voiries_lavees = fields.Float(string='Km Voiries Lavées')
    
    km_voiries_brossees = fields.Float(string='Km Voiries Brossées')
    
    km_blayes_mecaniquement = fields.Float(string='Km Balayés Mécaniquement')
    
    m2_places_lavees = fields.Float(string='m2 Places Lavées')
    
    km_plus_300km_par_jour = fields.Integer(string='Km >300km/jour')
    
    sorties_zone_action = fields.Integer(string='Sorties de Zone d\'Action')
    
    max_vitesse_plus_100km_en_ville = fields.Integer(string='Max Vitesse >100km en Ville')
    
    litres_consommes = fields.Float(string='Litres Consommés')
    
    realisation_circuits = fields.Float(string='Réalisation Circuits')

    last_time_decharge = fields.Char()

    last_time_transfert = fields.Char()

    last_time_ampl = fields.Char()

    nb_calcule = fields.Integer()

    # last_acc_0 = fields.Char()

    last_acc = fields.Char()

    nb_calcule_pl = fields.Integer()
    sum_pl = fields.Integer()


class Dashboard(models.Model):
    _name = 'is_dashboard.dashboard'
    _description = 'dashboard data'

    vehId = fields.Integer()

    device = fields.Char(string="Véhicule")

    fonction = fields.Char()

    datej = fields.Char(string="Date jour")

    last_date = fields.Char()

    # last_parc_zone = fields.Boolean()

    heures_travaillees = fields.Char(string='Heures Travaillées')

    km_dans_le_circuit = fields.Float(string='Km dans le Circuit')

    km_hors_du_circuit = fields.Float(string='Km hors du Circuit')

    km_total = fields.Float(string='Km Total')

    pourcentage_realisation_bacs = fields.Float(string='% Réalisation Bacs')

    pourcentage_respect_horaire_planifie = fields.Float(string='% Respect Horaire Planifié')

    bacs_collectes = fields.Integer(string='Bacs Collectés')

    bacs_laves = fields.Integer(string='Bacs Lavés')

    bacs_non_collectes = fields.Integer(string='Bacs Non Collectés')

    services_realises = fields.Integer(string='Services Réalisés')
    
    moyenne_accelerations = fields.Float(string='μ Accélérations')
    
    moyenne_freinage = fields.Float(string='μ Freinage')
    
    acces_decharge = fields.Integer(string='Accès à la Décharge')
    
    acces_points_transfert = fields.Integer(string='Accès aux Points de Transfert')

    
    
    acces_zones_interets = fields.Integer(string='Accès aux Zones d\'Intérêts')
    
    compactions_dechets = fields.Integer(string='Compactions des Déchets')
    
    cycles_leve_conteneur = fields.Integer(string='Cycles du Lève Conteneur')
    
    heures_activation_pompe = fields.Char(string='Heures Activation Pompe')
    
    moyenne_vitesses = fields.Float(string='μ Vitesses')
    
    max_vitesse = fields.Float(string='Max Vitesse')

    
    
    exces_vitesse_60 = fields.Integer(string='Excès de Vitesse 60')

    exces_vitesse_80 = fields.Integer(string='Excès de Vitesse 80')                           
    exces_vitesse_100 = fields.Integer(string='Excès de Vitesse 100')                          
    exces_vitesse_120 = fields.Integer(string='Excès de Vitesse 120')
    
    moyenne_tonnage_au_vidage = fields.Float(string='μ Tonnage au Vidage')
    
    max_temperature_moteur = fields.Float(string='Max Température Moteur')
    
    arrets_moins_5min = fields.Integer(string='Arrêts < 5min')
    
    arrets_plus_5min = fields.Integer(string='Arrêts > 5min')
    
    sorties_circuit_theorique = fields.Integer(string='Sorties Circuit Théorique (>10min)')
    
    pt_dechets_verts = fields.Integer(string='Pt Déchets Verts')
    
    anomalies_declarees = fields.Integer(string='Anomalies Déclarées')
    
    anomalies_techniques = fields.Integer(string='Anomalies Techniques')
    
    allumages_extinctions = fields.Integer(string='Allumages/Extinctions')
    
    demarrages_non_autorises = fields.Integer(string='Démarrages Non Autorisés')
    
    chargement_dechargement_amplirolls = fields.Integer(string='Chargement/Déchargement Amplirolls')
    
    bacs_deplaces_plus_30m = fields.Integer(string='Bacs Déplacés >30m')
    
    bacs_actifs_sur_terrain = fields.Integer(string='Bacs Actifs sur Terrain')
    
    entrees_sorties_parc = fields.Integer(string='Entrées/Sorties Parc')
    
    deltaT_entrees_sorties_parc = fields.Char(string='ΔT Entrées/Sorties Parc')
    
    kg_CO2 = fields.Float(string='Kg CO2')
    
    km_voiries_lavees = fields.Float(string='Km Voiries Lavées')
    
    km_voiries_brossees = fields.Float(string='Km Voiries Brossées')
    
    km_blayes_mecaniquement = fields.Float(string='Km Balayés Mécaniquement')
    
    m2_places_lavees = fields.Float(string='m2 Places Lavées')
    
    km_plus_300km_par_jour = fields.Integer(string='Km >300km/jour')
    
    sorties_zone_action = fields.Integer(string='Sorties de Zone d\'Action')
    
    max_vitesse_plus_100km_en_ville = fields.Integer(string='Max Vitesse >100km en Ville')
    
    litres_consommes = fields.Float(string='Litres Consommés')
    
    realisation_circuits = fields.Float(string='Réalisation Circuits')

    last_time_decharge = fields.Char()

    last_time_transfert = fields.Char()

    last_time_ampl = fields.Char()

    # last_acc_0 = fields.Char()

    last_acc = fields.Char()


# substring(public.devices.can_capt,32,1) ='1'
    def dashboard(self):
        print("///////////////////////// dashboard ///////////////////////")
    



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


    def create_or_update_odoo_record(self, data):
      # 'data' est un dictionnaire avec les clés 'external_id', 'name', 'email'
      record = self.search([('external_id', '=', data['external_id'])], limit=1)

      if record:
          # Mettre à jour l'enregistrement existant
          record.write(data)
      else:
          # Créer un nouvel enregistrement
          record = self.create(data)
      return record

    def sync_external_data(self):
        conn_obj = self.env['base.external.dbsource'].search([('name', '=', 'RABAT')], limit=1)

        # print("-*------------------------ conn_obj",conn_obj)
        positionQuery = """
        WITH pos as
              (
              
          SELECT 
            devices.id AS "deviceid",
            devices.vehicule AS "vehicule",
            st_contains((select geom from geofences where name='ZONE ACTION'),st_setsrid(st_makepoint(p.longitude, p.latitude), 4326)) "zone",
            
            lower(devices.fonction) like 'collecte%' "collecte",
            devices.fonction,
            devices.typeveh,
            devices.name AS "device",
            p.fixtime::date "datej",
            st_contains((select st_union(geom) from decoupage),st_setsrid(st_makepoint(p.longitude, p.latitude), 4326)) "decopage",
            p.can4,
            p.can5,
            substring(p.capt, 1, 1) "bd",
            substring(p.capt, 3, 1) "bg",
            substring(p.capt, 5, 1) "bc",
            substring(p.capt, 12, 1) "bdevant",
            substring(p.capt, 11, 1) "lv",
            substring(capt, 7, 1) "ampl",
            p.gas,
            p.speed,
            p.distance,
            p.latitude,
            p.longitude,
            p.capt,
            p.acc,
            p.fixtime,
            p.hrs,
            p.km,
            substring(p.capt, 17, 1) AS "LC",
            p.can8 AS "ACCELERATION",
            p.can7 AS "FREINAGE",
            substring(p.capt, 18, 1) AS "COMPACTION",
            substring(p.capt, 10, 1) AS "POMPE",
            (select st_contains(g.geom, p.geom) from public.geofences g WHERE st_contains(g.geom, p.geom) AND ( g.description = 'Décharge')) "dech",
            (select st_contains(g.geom, p.geom) from public.geofences g WHERE st_contains(g.geom, p.geom) AND ( g.description = 'Point de transfert')) "trans",
            (select st_contains(g.geom, p.geom) from public.geofences g WHERE st_contains(g.geom, p.geom) AND ( g.description = 'Parc')) "parc",
            (select cnt from  (select deviceid,count(deviceid) "cnt" from public.dv  where deviceid = p.deviceid and devicetime >= '{}' AND devicetime < '{}' group by deviceid) as dv) "dv"
          FROM
            positions p
            inner JOIN devices ON (devices.id = p.deviceid)
            
          WHERE
            p.fixtime >= '{}' AND p.fixtime < '{}'
            
            AND 
            devices.vehicule not LIKE '%CHARIOT%'
            --AND devices.name = 'TR01'
            --and p.deviceid = 38
            
            --and p.acc = 0
            --and (select st_contains(g.geom, p.geom) from public.geofences g WHERE st_contains(g.geom, p.geom) AND ( g.description = 'Parc'))
          
          order by p.fixtime
          ), plan as (
              
              

            
          SELECT pl.deviceid as "dev", pl.datej "datejP", pl.idcircuit "cirId", pl.dd, pl.df, cir."NOM", cir.buf
            FROM
          public.leplanning3 pl
            join "CIRCUIT" cir on pl.idcircuit = cir."IDCIRCUIT"
          )
                  
                  
          SELECT * , 
            st_contains( plan.buf,
                            st_setsrid(st_makepoint(pos.longitude, pos.latitude),
                                      4326
                                      )
                            ) "incir" , (plan.dd <= pos.fixtime AND plan.df > pos.fixtime) "inPla"
          FROM pos left join plan
          on pos.deviceid  = plan.dev and  plan.dd <= pos.fixtime AND plan.df > pos.fixtime
          order by pos.fixtime
        """
        
        
        positionQuery1 = """
          SELECT 
            devices.id AS "deviceid",
            devices.vehicule AS "vehicule",
            lower(fonction) like 'collecte%' "collecte",
            devices.fonction,
            devices.typeveh,
            devices.name AS "device",
            p.fixtime::date "datej",
            st_contains((select st_union(geom) from decoupage),st_setsrid(st_makepoint(p.longitude, p.latitude), 4326)) "decopage",
            st_contains((select geom from geofences where name='ZONE ACTION'),st_setsrid(st_makepoint(p.longitude, p.latitude), 4326)) "zone",
            p.can4,
            p.can5,
            substring(p.capt, 1, 1) "bd",
            substring(p.capt, 3, 1) "bg",
            substring(p.capt, 5, 1) "bc",
            substring(p.capt, 12, 1) "bdevant",
            substring(p.capt, 11, 1) "lv",
            substring(capt, 7, 1) "ampl",
            p.gas,
            p.speed,
            p.distance,
            p.latitude,
            p.longitude,
            p.capt,
            p.acc,
            p.fixtime,
            p.hrs,
            p.km,
            substring(p.capt, 17, 1) AS "LC",
            p.can8 AS "ACCELERATION",
            p.can7 AS "FREINAGE",
            substring(p.capt, 18, 1) AS "COMPACTION",
            substring(p.capt, 10, 1) AS "POMPE",
            (select st_contains(g.geom, p.geom) from public.geofences g WHERE st_contains(g.geom, p.geom) AND ( g.description = 'Décharge')) "dech",
            (select st_contains(g.geom, p.geom) from public.geofences g WHERE st_contains(g.geom, p.geom) AND ( g.description = 'Point de transfert')) "trans",
            (select st_contains(g.geom, p.geom) from public.geofences g WHERE st_contains(g.geom, p.geom) AND ( g.description = 'Parc')) "parc",
            (select cnt from  (select deviceid,count(deviceid) "cnt" from public.dv  where deviceid = p.deviceid and devicetime >= '{}' AND devicetime < '{}' group by deviceid) as dv) "dv"
          FROM
            positions p
            INNER JOIN devices ON (devices.id = p.deviceid)
          WHERE
            p.fixtime >= '{}' AND p.fixtime < '{}'
            AND 
            devices.vehicule not LIKE '%CHARIOT%'
            --AND devices.name = 'ARER3501'
            --and p.deviceid = 3
          order by p.fixtime
        """

        bacQueryList = """
          select  numpark,active
          from  public.bacs
          where active = true
        """
        bacQuery = """
          SELECT DISTINCT
            b.numpark as "N° BAC",
            
            d.fonction,
            d.id "deviceid",
            d.name,
            b.fixpos,
            lower(d.fonction) like 'collecte%' "col",
            lower(d.fonction) like 'lava%' "lav",
            
            
            sqrt(power((t.lat - b.latitude), 2) + power((t.lon - b.longitude), 2)) >= (0.0003) and b.fixpos = True "deplac"
          FROM
            public.vrfid v
            INNER JOIN public.tags t ON (v.tag1 = t.ntag)
            INNER JOIN public.bacs b ON (t.idbac = b.id)
            LEFT OUTER JOIN public.devices d ON (v.deviceid = d.id)
          
            
          WHERE
            v.devicetime >= '{}' AND v.devicetime < '{}'
        """

        planningQuery = """
          select *
          from public.leplanning3
          where dd <= '{}' AND df >= '{}'
        """

        serviceQuery = """
          SELECT deviceid
          FROM
            gps.service
          WHERE
            datej = '{}'
        """

        tauxQuery = """
          SELECT 
            gps.taux_cir.datej,
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
          where
          gps.taux_cir.datej = '{}'
        """

        circuitQuery = """
          SELECT 
            st_contains(
                (SELECT buf FROM public."CIRCUIT" WHERE "IDCIRCUIT" = {}),
                ST_SetSRID(ST_MakePoint({}, {}), 4326)
            ) "inCir"
          FROM public.devices
            where id = {}
        """

        if conn_obj:
            conn_string = conn_obj.conn_string
            conn_pass = conn_obj.password

            # Extraction des informations de la chaîne de connexion
            dbname = re.search("dbname='([^']+)'", conn_string).group(1)
            user = re.search("user='([^']+)'", conn_string).group(1)
            password = conn_pass
            host = re.search("host='([^']+)'", conn_string).group(1)
            port = re.search("port='([^']+)'", conn_string).group(1)

            # Établir la connexion à la base de données externe
            conn = psycopg2.connect(dbname=dbname, user=user, password=password, host=host, port=port)
            cur = conn.cursor(cursor_factory=extras.DictCursor)

            resdata = self.env['is_dashboard.bacs'].search_read([],['last_date'],  order="last_date desc",limit=1)
            if resdata:
              fixtime = resdata[0]['last_date']
              # print(resdata[0]['last_date'])
            else:
              fixtime = '2024-02-29 23:59:59'


            date_now =  date.today()

            one_hour = '01:00:00'
            time_one_hour = datetime.strptime(str(one_hour), '%H:%M:%S')

            start_time = fixtime[11:19]
            end_time = datetime.strptime(str(start_time), '%H:%M:%S') + timedelta(hours=time_one_hour.hour, minutes=time_one_hour.minute, seconds=time_one_hour.second)
            date_start = fixtime[0:10]
            date_fin = date_now.strftime("%Y-%m-%d")




            if date_fin == date_start:
                defdate = (datetime.strptime(str('23:59:59'), '%H:%M:%S') - datetime.strptime(str(start_time), '%H:%M:%S'))
                if datetime.strptime(str(defdate), '%H:%M:%S') > datetime.strptime(str('01:00:00'), '%H:%M:%S') :
                    # print(1)
                    end_time = datetime.strptime(str(start_time), '%H:%M:%S') + timedelta(hours=time_one_hour.hour, minutes=time_one_hour.minute, seconds=time_one_hour.second)
                    start_time = datetime.strptime(str(start_time), '%H:%M:%S')
                    date_fin = date_start = datetime.strptime(str(date_start), '%Y-%m-%d')
                    
                else:
                    # print(2)
                    end_time = datetime.strptime(str('23:59:59'), '%H:%M:%S')
                    start_time = datetime.strptime(str(start_time), '%H:%M:%S')
                    date_fin = date_start = datetime.strptime(str(date_start), '%Y-%m-%d')
                    
            else:
                if start_time == '23:59:59':
                    # print(3)
                    end_time = datetime.strptime(str('01:00:00'), '%H:%M:%S')
                    start_time = datetime.strptime(str('00:00:00'), '%H:%M:%S')
                    date_fin = date_start = datetime.strptime(str(date_start), '%Y-%m-%d') + timedelta(days=1)
                else:
                    # print(4)
                    defdate = (datetime.strptime(str('23:59:59'), '%H:%M:%S') - datetime.strptime(str(start_time), '%H:%M:%S'))
                    if datetime.strptime(str(defdate), '%H:%M:%S') > datetime.strptime(str('01:00:00'), '%H:%M:%S') :
                        # print(5)
                        end_time = datetime.strptime(str(start_time), '%H:%M:%S') + timedelta(hours=time_one_hour.hour, minutes=time_one_hour.minute, seconds=time_one_hour.second)
                        date_fin = date_start = datetime.strptime(str(date_start), '%Y-%m-%d')
                        start_time = datetime.strptime(str(start_time), '%H:%M:%S')
                    else:
                        # print(6)
                        end_time = datetime.strptime(str('23:59:59'), '%H:%M:%S')
                        date_start = date_fin = datetime.strptime(str(date_start), '%Y-%m-%d')
                        start_time = datetime.strptime(str(start_time), '%H:%M:%S')

            dd = str(date_start.strftime('%Y-%m-%d')) + " " + str(start_time.strftime('%H:%M:%S')) #'2024-03-06 16:30:00'
            df = str(date_fin.strftime('%Y-%m-%d')) + " " + str(end_time.strftime('%H:%M:%S')) #'2024-03-06 17:38:00'
            print(dd,df)
            cur.execute(positionQuery.format(dd,df,dd,df))
            rows = cur.fetchall()

            cur.execute(bacQueryList)
            rowsBacsList = cur.fetchall()

            cur.execute(bacQuery.format(dd,df))
            rowsBacs = cur.fetchall()

            cur.execute(planningQuery.format(dd,df))
            rowsPlanning = cur.fetchall()

            cur.execute(serviceQuery.format(str(date_start.strftime('%Y-%m-%d'))))
            rowsService = cur.fetchall()

            cur.execute(tauxQuery.format(str(date_start.strftime('%Y-%m-%d'))))
            rowsTaux = cur.fetchall()

            
            
            # print("--------------------",sum(1 for x in rowsService if x[0] == 2))

            # rows1 = list(rows)
            unique_names = set(obj['deviceid'] for obj in rows)
            device = list(unique_names)
            device.sort()

            
            nb_bacs = 0
            nb_bacs_deplace = 0
            nb_bacs_coll = 0
            nb_bacs_lav = 0
            nb_bacs_no_coll = 0
            realis_bac = 0
            if rowsBacsList:
              nb_bacs = len(rowsBacsList)
            
            if rowsBacs:
              nb_bacs_deplace = sum(1 for x in rowsBacs if x['deplac']) #len(list(filter(lambda x: True in x['deplac'], rowsBacs)))
              nb_bacs_lav = sum(1 for x in rowsBacs if x['lav']) #len(list(filter(lambda x: True in x['lav'], rowsBacs)))
              nb_bacs_coll = sum(1 for x in rowsBacs if x['col']) #len(list(filter(lambda x: True in x['col'], rowsBacs)))
              nb_bacs_no_coll = nb_bacs - nb_bacs_coll
              realis_bac = (nb_bacs_coll * 100)/nb_bacs


            
            # print( nb_bacs ,
            # nb_bacs_deplace ,
            # nb_bacs_coll ,
            # nb_bacs_lav ,
            # nb_bacs_no_coll ,
            # realis_bac , len(rowsPlanning))



            


            bacs_model = self.env['is_dashboard.bacs']

            resBacsModel = bacs_model.search_read([("datej", "=", dd[0:10])], [])

            if resBacsModel:
              bacs_record = bacs_model.search([('datej', '=', resBacsModel[0]['datej'])])
              nb_bacs = nb_bacs
              
              nb_bacs_coll = resBacsModel[0]['nb_bacs_coll'] + nb_bacs_coll
              nb_bacs_lav = resBacsModel[0]['nb_bacs_lav'] + nb_bacs_lav
              nb_bacs_no_coll = nb_bacs - nb_bacs_coll
              realis_bac = (nb_bacs_coll * 100)/nb_bacs

              bacs_record.write({
                'nb_bacs':  nb_bacs,
                'nb_bacs_deplace': nb_bacs_deplace ,
                'nb_bacs_coll':  nb_bacs_coll,
                'nb_bacs_lav': nb_bacs_lav ,
                'nb_bacs_no_coll': nb_bacs_no_coll ,
                'realis_bac': realis_bac,
                'last_date': df,
                'nb_calcule_bacs': resBacsModel[0]['nb_calcule_bacs'] +1
              })
            else:
              
              self.env['is_dashboard.bacs'].create({
                'nb_bacs':  nb_bacs,
                'nb_bacs_deplace': nb_bacs_deplace ,
                'nb_bacs_coll':  nb_bacs_coll,
                'nb_bacs_lav': nb_bacs_lav ,
                'nb_bacs_no_coll': nb_bacs_no_coll ,
                'realis_bac': realis_bac,
                'datej': dd[0:10],
                'last_date': df,
                'nb_calcule_bacs': 1
              })
            

              
            
            

            insert_data = []
            for item in device:
              # print('/-------------------------/', item)

              # pl = None
              # for p in rowsPlanning:
              #   if p[3] == 11:
              #     xx = p
              
              vehicule = None

              planifier =  sum(1 for x in rowsPlanning if x['deviceid'] == item)
              # planning = None
              # for x in rowsPlanning:
              #   if x['deviceid'] == item:
              #     planning = x['idcircuit']

              # print(planning)
                  
              respect_horaire_planifie = 0
              if planifier == 1:
                respect_horaire_planifie = 100
              # print("-             -",planifier)

              #tauxVeh = for x in rowsTaux if x['deviceid'] == item

              realisation_circuits = 0
              for x in rowsTaux:
                if x[2] == item:
                  realisation_circuits = x[7]

              sum_pl =0
              nb_calcule_pl =0
             
              datej = None
              workTime = datetime.strptime('00:00:00', '%H:%M:%S')
              workTimePompe = datetime.strptime('00:00:00', '%H:%M:%S')
              kmTotal = 0
              litre_gas = 0
              AccPP = 0                     
              BrakePP = 0                   
              compactions = 0               
              LC = 0                        
              moy_vitesse = 0
              max_vitesse = 0
              exces_vitesse_60 = 0                            
              exces_vitesse_80 = 0                            
              exces_vitesse_100 = 0                           
              exces_vitesse_120 = 0                           
              max_vitesse_plus_100km_en_ville = 0             
              max_temperature_moteur = 0
              arrets_moins_5min = 0
              arrets_plus_5min = 0
              kg_CO2 = 0
              min_can4 = 0
              max_can4 = 0
              km_voiries_lavees = 0         
              km_voiries_brossees = 0  

              demarrages_non_autorises = 0

              services_realises = sum(1 for x in rowsService if x[0] == item)   

              acces_decharge = 0    
              acces_points_transfert = 0  
              chargement_dechargement_amplirolls = 0
              
              pt_dechets_verts = 0
              allumages_extinctions = 0
              sorties_zone_action = 0
              moyenne_tonnage_au_vidage = 0

              bacs_collectes = sum(1 for x in rowsBacs if x['col'] and x['deviceid'] == item)
              bacs_laves = sum(1 for x in rowsBacs if x['lav'] and x['deviceid'] == item)

              km_dans_le_circuit = 0
              km_hors_du_circuit = 0
              sorties_circuit_theorique = 0
              
              

              pourcentage_respect_horaire_planifie = 0

              entrees_sorties_parc = 0 
              

              ppp = 0

              pos = 0

              vit_cnt_60 = 0
              vit_cnt_80 = 0
              vit_cnt_100 = 0
              vit_cnt_120 = 0

              #print("*-*-*-*-**************" , item)


              device_positions = [i for i in rows if i['deviceid'] == item]



              if device_positions[0]['can4'] != None and device_positions[0]['can4'] > 0:
                min_can4 = device_positions[0]['can4']

              sum_speed = {"cnt": 0 ,"sum": 0}
              sum_acceleration = {"cnt": 0 ,"sum": 0}
              sum_freinage = {"cnt": 0 ,"sum": 0}
              last_acceleration = device_positions[0]['ACCELERATION']
              last_freinage = device_positions[0]['FREINAGE']
              first_time = device_positions[0]['fixtime']
              first_time_pompe = device_positions[0]['fixtime']
              last_time_acc = '2024-03-06 02:29:00'
              last_time = device_positions[0]['fixtime']
              first_pos = 0
              last_acc = device_positions[0]['acc']
              last_pompe = device_positions[0]['POMPE']
              last_compaction = device_positions[0]['COMPACTION']
              last_lc = device_positions[0]['LC']
              last_decharge = device_positions[0]['dech']
              last_trasfert = device_positions[0]['trans']
              last_zone = device_positions[0]['zone']

              last_parc = device_positions[0]['parc']
              last_ampl = device_positions[0]['parc']
              last_pos_in_circuit = device_positions[0]['incir']
              last_acc_0 = None

              if planifier == 1:
                if device_positions[0]['acc'] == 0:
                  respect_horaire_planifie = 0
                  nb_calcule_pl =1 
              

              

              

              # last_parc_zone = device_positions[0]['parc']

              vehId = device_positions[0]['deviceid']
              fonction = device_positions[0]['fonction']
              if device_positions[0]['dv'] != None:
                pt_dechets_verts = device_positions[0]['dv']
              # if len(device_positions) > 1:
              #   if  datetime.strptime(str((device_positions[1]['fixtime'] - device_positions[0]['fixtime'])), '%H:%M:%S') > datetime.strptime('0:05:00', '%H:%M:%S'):
              #     print("****     ***" , device_positions[1]['fixtime'],device_positions[0]['fixtime'])
              #     print("/////////////////", (device_positions[1]['fixtime'] - device_positions[0]['fixtime']))

              resdata_veh = self.env['is_dashboard.dashboard_day'].search_read([("vehId", "=", item),("datej", "=", str(date_start.strftime('%Y-%m-%d')))],['last_date','last_time_ampl','last_time_decharge','last_time_transfert','last_acc'],  order="last_date desc",limit=1)
              # print(resdata_veh)
              last_time_transfert = "2024-02-28 00:00:00"
              last_time_decharge = "2024-02-28 00:00:00"
              last_time_ampl = "2024-02-28 00:00:00"

              # last_sortie_parc = "2024-02-28 22:00:00"
              # last_entrer_parc = "2024-02-28 22:00:00"

              if resdata_veh:
                # last_parc_zone = resdata_veh[0]['last_parc_zone'] 
                #print("----- last acc ",resdata_veh[0]['last_date'])
                if int(resdata_veh[0]['last_acc']) == 0:
                  #print("ahhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh")
                  last_acc_0 = datetime.strptime(resdata_veh[0]['last_date'], "%Y-%m-%d %H:%M:%S")
                  last_acc = resdata_veh[0]['last_acc']
                last_time_transfert = resdata_veh[0]['last_time_transfert']
                last_time_decharge = resdata_veh[0]['last_time_decharge']
                last_time_ampl = resdata_veh[0]['last_time_ampl']
              else:
                last_time_transfert = str(datetime.strptime(dd, "%Y-%m-%d %H:%M:%S") - timedelta(hours=2))
                last_time_decharge = str(datetime.strptime(dd, "%Y-%m-%d %H:%M:%S") - timedelta(hours=2))
                last_time_ampl = str(datetime.strptime(dd, "%Y-%m-%d %H:%M:%S") - timedelta(hours=2))
                
              

              last_service = False
              # print("*-----* ",last_time_decharge,last_time_transfert)
              
              
              last_time_transfert = datetime.strptime(last_time_transfert, "%Y-%m-%d %H:%M:%S")
              last_time_decharge = datetime.strptime(last_time_decharge, "%Y-%m-%d %H:%M:%S")
              last_time_ampl = datetime.strptime(last_time_ampl, "%Y-%m-%d %H:%M:%S")
              for row in device_positions:
                vehicule = row['device']
                kmTotal += row['distance']

                if first_pos == 0:
                 # print("first pos *****************", last_acc_0)
                  if last_acc_0 != None:
                    #last_acc_0 = datetime.strptime(last_acc_0, "%Y-%m-%d %H:%M:%S")
                    if row['acc'] == 1:
                      #print("acc 1 *****************" ,(row['fixtime'] - last_acc_0))
                      time_difference = datetime.strptime(str(row['fixtime']), "%Y-%m-%d %H:%M:%S") - last_acc_0
                      minutes_difference = time_difference.total_seconds() / 60
                      if minutes_difference > 5:
                        #arrets_moins_5min +=1
                          # print("666 <<<< 666", str((row['fixtime'] - first_time)))
                      #else:
                       # print("+++++++++ arret *****************")
                        arrets_plus_5min +=1
                    else:
                      #print("acc 0 *****************")
                      last_acc_0 = row['fixtime']

                if row['acc'] == 1:
                  if row['inPla'] == True:
                    if row['incir'] == True:
                      km_dans_le_circuit += row['distance']
                    else:
                      km_hors_du_circuit += row['distance']
                      if last_pos_in_circuit != row['incir']:
                        time_difference = datetime.strptime(str(row['fixtime']), "%Y-%m-%d %H:%M:%S") - last_time
                        minutes_difference = time_difference.total_seconds() / 60

                        if minutes_difference > 10:
                          sorties_circuit_theorique += 1
                        
                  

                # if planning != None:
                #   cur.execute(circuitQuery.format(planning,row['longitude'],row['latitude'],item))
                #   rowsCircuit = cur.fetchall()

                #   print(rowsCircuit)
             

                if last_acc != row['acc']:
                  allumages_extinctions +=1
                
                # if row['parc'] == True:
                #   if last_service != row['parc']:

                if len(device_positions) > 1 and first_pos == 0:
                  if row['collecte'] == True:
                    if row['ampl'] == '1':
                      time_difference = datetime.strptime(str(row['fixtime']), "%Y-%m-%d %H:%M:%S") - last_time_ampl
                      minutes_difference = time_difference.total_seconds() / 60
                    
                      if minutes_difference < 5:
                        last_time_ampl = datetime.strptime(str(row['fixtime']), "%Y-%m-%d %H:%M:%S")

                  if row['zone'] == False:
                    sorties_zone_action +=1

                  if row['dech'] == True:
                    time_difference = datetime.strptime(str(row['fixtime']), "%Y-%m-%d %H:%M:%S") - last_time_decharge
                    minutes_difference = time_difference.total_seconds() / 60
                    
                    if minutes_difference < 35:
                      last_time_decharge = datetime.strptime(str(row['fixtime']), "%Y-%m-%d %H:%M:%S")
                  
                  if row['trans'] == True:
                    
                    time_difference = datetime.strptime(str(row['fixtime']), "%Y-%m-%d %H:%M:%S") - last_time_transfert
                    minutes_difference = time_difference.total_seconds() / 60

                    if minutes_difference < 59:
                      last_time_transfert = datetime.strptime(str(row['fixtime']), "%Y-%m-%d %H:%M:%S")

                elif len(device_positions) > 1 and first_pos != 0:
                  # if row['parc'] == False:
                  #   if last_parc_zone != row['parc']:
                  #     time_difference = datetime.strptime(str(row['fixtime']), "%Y-%m-%d %H:%M:%S") - last_sortie_parc
                  #     minutes_difference = time_difference.total_seconds() / 60

                  #     if minutes_difference > 10:
                  #       entrees_sorties_parc += 1
                  #     last_sortie_parc = row['fixtime']

                  if planifier == 1:
                    if row['acc'] == 1:
                      respect_horaire_planifie = 100
                      nb_calcule_pl =1 

                  if row['collecte'] == True:
                    if last_ampl != row['ampl']:
                      if row['ampl'] == '1':
                        time_difference = datetime.strptime(str(row['fixtime']), "%Y-%m-%d %H:%M:%S") - last_time_ampl
                        minutes_difference = time_difference.total_seconds() / 60
                      
                        if minutes_difference > 5:
                          chargement_dechargement_amplirolls +=1

                      last_time_ampl = datetime.strptime(str(row['fixtime']), "%Y-%m-%d %H:%M:%S")
                  if last_zone != row['zone']:
                    if row['zone'] == False:
                      sorties_zone_action +=1

                  if row['dech'] == True:
                    time_difference = datetime.strptime(str(row['fixtime']), "%Y-%m-%d %H:%M:%S") - last_time_decharge
                    minutes_difference = time_difference.total_seconds() / 60
                    
                    if last_decharge != row['dech']:
                      if minutes_difference > 35:
                        acces_decharge +=1
                      
                    last_time_decharge = datetime.strptime(str(row['fixtime']), "%Y-%m-%d %H:%M:%S")
                    
                  
                  if row['trans'] == True:
                    
                    time_difference = datetime.strptime(str(row['fixtime']), "%Y-%m-%d %H:%M:%S") - last_time_transfert
                    minutes_difference = time_difference.total_seconds() / 60
                    
                    if last_trasfert != row['trans']:
                      if minutes_difference > 59:
                        acces_points_transfert +=1
                      
                    last_time_transfert = datetime.strptime(str(row['fixtime']), "%Y-%m-%d %H:%M:%S")
                      
                
                    

                if row['acc'] == 1:
                  if planifier != 1:
                    if row['acc'] != last_acc:
                      demarrages_non_autorises +=1
                    
                  
                  last_zone = row['zone']
                    
                  if row['speed'] > max_vitesse:                                       
                    max_vitesse = row['speed']
                  
                  if row['speed'] > 0:
                    if row['speed'] > 120:
                      if vit_cnt_120 == 3:
                        exces_vitesse_120 +=1
                        vit_cnt_60 = -1
                        vit_cnt_80 = -1
                        vit_cnt_100 = -1
                      
                    elif row['speed'] > 100:
                      if vit_cnt_100 == 3:
                        exces_vitesse_100 +=1
                        vit_cnt_60 = -1
                        vit_cnt_80 = -1
                        vit_cnt_120 = -1
                        if row['zone'] == True:
                          max_vitesse_plus_100km_en_ville +=1
                      
                    elif row['speed'] > 80:
                      if vit_cnt_80 == 3:
                        exces_vitesse_80 +=1
                        vit_cnt_60 = -1
                        vit_cnt_100 = -1
                        vit_cnt_120 = -1
                      
                    elif row['speed'] > 60:
                      if vit_cnt_60 == 3:
                        exces_vitesse_60 +=1
                        vit_cnt_80 = -1
                        vit_cnt_100 = -1
                        vit_cnt_120 = -1
                      
                    else:
                      vit_cnt_60 = -1
                      vit_cnt_80 = -1
                      vit_cnt_100 = -1
                      vit_cnt_120 = -1
                    sum_speed['cnt'] += 1
                    sum_speed['sum'] += row['speed']
                  
                  if row['bc'] == '1':
                    km_voiries_brossees += row['distance']
                  elif row['bdevant'] == '1':
                    km_voiries_brossees += row['distance']
                  elif row['bd'] == '1':
                    km_voiries_brossees += row['distance']
                  elif row['bg'] == '1':
                    km_voiries_brossees += row['distance'] 

                  if row['typeveh'] == 'LAVEUSE DE VOIRIE':
                    if row['POMPE'] == '1':
                      ppp +=1
                      # print("* ", row['distance'] , (row['can4'] - rows[pos-1]['can4']))
                      km_voiries_lavees += row['distance'] 

                    
                if row['can4'] != None and  row['can4'] > -1:
                  # print(type(row['can4']),row['can4'] , type(min_can4),min_can4)
                  if row['can4'] < min_can4 or min_can4 == 0:
                    min_can4 = row['can4']
                
                  if row['can4'] > max_can4:
                    max_can4 = row['can4']
                
                if row['can5'] != None and  row['can5'] != -1:
                  if row['can5'] > max_temperature_moteur:
                    max_temperature_moteur = row['can5']

                

                if len(device_positions) > 1 and first_pos != 0:
                  # ACCELERATION
                  if row['ACCELERATION'] != None and row['ACCELERATION'] > 0:
                    if last_acceleration != row['ACCELERATION']:
                      sum_acceleration['cnt'] += 1
                      sum_acceleration['sum'] += row['ACCELERATION']
                    
                  # FREINAGE
                  if row['FREINAGE'] != None and row['FREINAGE'] > 0:
                    if last_freinage != row['FREINAGE']:
                      sum_freinage['cnt'] += 1
                      sum_freinage['sum'] += row['FREINAGE']


                  # compactions des déchets
                  if row['COMPACTION'] == '1':
                    if last_compaction != row['COMPACTION']:
                      compactions +=1
                  
                  # LC
                  if row['LC'] == '1':
                    if last_lc != row['LC']:
                      LC +=1

                  # activation pompe
                  if last_pompe == row['POMPE']:
                    
                    first_time_pompe = first_time_pompe
                  else:
                    # print("!!!!!!!!!!!!!     else          !!!!!!!!!!!!!")
                    if row['POMPE'] == '0':
                      # print(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
                      result_time = datetime.strptime(str((row['fixtime'] - first_time_pompe)), '%H:%M:%S') + timedelta(hours=workTimePompe.hour, minutes=workTimePompe.minute, seconds=workTimePompe.second)
                  
                      time_str = result_time.strftime('%H:%M:%S')
                            

                      workTimePompe = datetime.strptime(time_str, '%H:%M:%S')
                      # print("88 88  888   8888",  workTimePompe, workTimePompe.strftime('%H:%M:%S') )

                    elif row['POMPE'] == '1':
                      # print("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
                      first_time_pompe = row['fixtime'] 


                  # tempe de travail
                  if row['acc'] == last_acc:
                    # if row['acc'] == 0:
                    #   if datetime.strptime(str((row['fixtime'] - first_time)), '%H:%M:%S') < datetime.strptime('0:05:00', '%H:%M:%S'):
                    #     arrets_moins_5min +=1
                    #       # print("666 <<<< 666", str((row['fixtime'] - first_time)))
                    #   else:
                    #     arrets_plus_5min +=1
                    last_time = last_time
                    first_time = row['fixtime']
                  else:
                    # print("******    acc      ******", row['acc'] , last_acc ,type(last_acc))
                    if row['acc'] == 1:
                      # print("******    acc      ******", row['acc'] , last_acc)
                      if  datetime.strptime(str((row['fixtime'] - first_time)), '%H:%M:%S') < datetime.strptime('00:05:00', '%H:%M:%S'):
                        arrets_moins_5min +=1
                        # print("666 <<<< 666", str((row['fixtime'] - first_time)))
                      else:
                        arrets_plus_5min +=1
                        # print("666 >>> 666", str((row['fixtime'] - first_time)) )
                    else:
                      result_time = datetime.strptime(str((row['fixtime'] - last_time)), '%H:%M:%S') + timedelta(hours=workTime.hour, minutes=workTime.minute, seconds=workTime.second)
                      # print("--------------------- - - - - - -- ", datetime.strptime(str((row['fixtime'] - first_time)), '%H:%M:%S') ,row['fixtime'] , first_time)
                      

                      time_str = result_time.strftime('%H:%M:%S')
                      
                      # print("666 666 666 666", row['fixtime'],last_time , workTime )

                      # Now convert to datetime object
                      workTime = datetime.strptime(time_str, '%H:%M:%S')
                      
                      # workTime = datetime.strptime(str(result_time), '%H:%M:%S')
                    
                    last_time = row['fixtime']
                    first_time = first_time
                  


                      
                   


                  # if  datetime.strptime(str((row['fixtime'] - first_time)), '%H:%M:%S') < datetime.strptime('0:05:00', '%H:%M:%S'):
                  #   arrets_moins_5min +=1
                  # else:
                  #   arrets_plus_5min +=1
                first_pos +=1
                # first_time = row['fixtime']
                pos +=1
                last_acc = row['acc']
                last_pompe = row['POMPE']
                last_compaction = row['COMPACTION']
                last_lc = row['LC']
                last_acceleration = row['ACCELERATION']
                last_freinage = row['FREINAGE']
                last_decharge = row['dech']
                last_trasfert = row['trans']
                last_ampl = row['ampl']
                # last_parc_zone = row['parc']
                 


                vit_cnt_60 += 1
                vit_cnt_80 += 1
                vit_cnt_100 += 1
                vit_cnt_120 += 1
                
                # if row['acc'] == '1':
                #   duree = defTime(str(row['fixtime']),start_datetime)
                
              
             
              if last_pompe == '1':
                result_time = datetime.strptime(str((row['fixtime'] - first_time_pompe)), '%H:%M:%S') + timedelta(hours=workTimePompe.hour, minutes=workTimePompe.minute, seconds=workTimePompe.second)
                time_str = result_time.strftime('%H:%M:%S')
                workTimePompe = datetime.strptime(time_str, '%H:%M:%S')
                

              if last_acc == 1:
                result_time = datetime.strptime(str((row['fixtime'] - last_time)), '%H:%M:%S') + timedelta(hours=workTime.hour, minutes=workTime.minute, seconds=workTime.second)
                last_acc_0 = None
                time_str = result_time.strftime('%H:%M:%S')
                      
                # print("666 666 666 666", row['fixtime'],last_time , workTime.strftime('%H:%M:%S') )

                workTime = datetime.strptime(time_str, '%H:%M:%S')
              else:
                if first_pos !=0:
                  if datetime.strptime(str((row['fixtime'] - first_time)), '%H:%M:%S') < datetime.strptime('00:05:00', '%H:%M:%S'):
                    arrets_moins_5min +=1
                  # else:
                  #   arrets_plus_5min +=1
               
                  
              
                  
              kg_CO2 = (max_can4 - min_can4) * 2.7
              litre_gas = (max_can4 - min_can4) 
              # print(max_can4 ,"--------------",item,"-------------", min_can4 ,round(km_voiries_lavees/1000,1) , " ", LC)
              # print("   120   ----   ", exces_vitesse_120)
              # print("   100   ----   ", exces_vitesse_100 , max_vitesse_plus_100km_en_ville ,last_time)
              # print("   80   ----   ", exces_vitesse_80)
              # print("   60   ----   ", exces_vitesse_60)
              if sum_speed['cnt'] == 0:
                moy_vitesse = round(sum_speed['sum'])
              else:
                moy_vitesse = round(sum_speed['sum']/sum_speed['cnt'])

              if sum_acceleration['cnt'] == 0:
                AccPP = round(sum_acceleration['sum'])
              else:
                AccPP = round(sum_acceleration['sum']/sum_acceleration['cnt'])
              
              if sum_freinage['cnt'] == 0:
                BrakePP = round(sum_freinage['sum'])
              else:
                BrakePP = round(sum_freinage['sum']/sum_freinage['cnt'])
              # print("******************************------------", AccPP)

              sum_pl = respect_horaire_planifie

             

             # print("*-*- ", arrets_plus_5min)
              
              # print("_______________________" , vehicule,  arrets_moins_5min , arrets_plus_5min , workTime.strftime('%H:%M:%S') , workTimePompe.strftime('%H:%M:%S') )
              device_data = {
                "deviceid": vehId,
                "fonction": fonction,
                "vehicule":row['device'],
                "datej":row['datej'], 
                "last_date": last_time,
                "arrets_moins_5min": arrets_moins_5min,
                "arrets_plus_5min": arrets_plus_5min,
                "kmTotal": kmTotal/1000,
                "max_vitesse": max_vitesse,
                "workTime": workTime.strftime('%H:%M:%S'),
                "kg_CO2": kg_CO2 ,
                "max_temperature_moteur": max_temperature_moteur,
                "moy_vitesse": round(moy_vitesse),
                "workTimePompe": workTimePompe.strftime('%H:%M:%S'),
                "compactions": compactions,
                "AccPP": AccPP,
                "BrakePP": BrakePP,
                "km_voiries_brossees": round(km_voiries_brossees/1000,1),
                "km_voiries_lavees": round(km_voiries_lavees/1000,1),
                "LC": LC ,
                "max_vitesse_plus_100km_en_ville": round(max_vitesse_plus_100km_en_ville),
                "exces_vitesse_120": exces_vitesse_120,
                "exces_vitesse_100": exces_vitesse_100,
                "exces_vitesse_80": exces_vitesse_80,
                "exces_vitesse_60": exces_vitesse_60,
                "acces_decharge": acces_decharge,
                "acces_points_transfert": acces_points_transfert,
                "dv": pt_dechets_verts,
                "allumages_extinctions": allumages_extinctions,
                "sorties_zone_action": sorties_zone_action,
                "litre_gas": litre_gas,
                "last_time_transfert": last_time_transfert,
                "last_time_decharge": last_time_decharge,
                "last_time_ampl": last_time_ampl,
                "chargement_dechargement_amplirolls": chargement_dechargement_amplirolls,
                "moyenne_tonnage_au_vidage": moyenne_tonnage_au_vidage,
                "bacs_collectes": bacs_collectes,
                "bacs_laves": bacs_laves,
                "services_realises": services_realises,
                "respect_horaire_planifie": respect_horaire_planifie,
                "demarrages_non_autorises": demarrages_non_autorises,
                "realisation_circuits": realisation_circuits,
                "km_dans_le_circuit": round(km_dans_le_circuit/1000),
                "km_hors_du_circuit": round(km_hors_du_circuit/1000),
                "sorties_circuit_theorique": sorties_circuit_theorique ,
                "last_acc": last_acc,
                "nb_calcule_pl": nb_calcule_pl,
                "sum_pl": sum_pl
                # "entrees_sorties_parc": entrees_sorties_parc
              }

              # print("*** ",device_data)
              # print("*-----------------*" , device_data)
              insert_data.append(device_data)
                  
                  
            # print("*******************" ,len(insert_data))    




            




            # print("nnnnnnnnnnnnnnnn",device , len(device) )

            for item in insert_data:
              self.env['is_dashboard.dashboard'].create({
                    'vehId': item['deviceid'], 
                    'fonction': item['fonction'],
                    'device': item['vehicule'], 
                    'datej': item['datej'], 
                    'last_date': item['last_date'],

                    'heures_travaillees': str(item['workTime']), 

                    'km_total': item['kmTotal'], 

                    'moyenne_accelerations': item['AccPP'],
                    
                    'moyenne_freinage': item['BrakePP'],
                    
                    'acces_decharge': item['acces_decharge'],
                    
                    'acces_points_transfert': item['acces_points_transfert'],
                    
                    'compactions_dechets': item['compactions'],
                    
                    'cycles_leve_conteneur': item['LC'],
                    
                    'heures_activation_pompe': str(item['workTimePompe']),
                    
                    'moyenne_vitesses': item['moy_vitesse'],
                    
                    'max_vitesse': item['max_vitesse'],
                    
                    'exces_vitesse_60': item['exces_vitesse_60'],
                    'exces_vitesse_80': item['exces_vitesse_80'],
                    'exces_vitesse_100': item['exces_vitesse_100'],
                    'exces_vitesse_120': item['exces_vitesse_120'],
                    

                    'bacs_collectes': item['bacs_collectes'],
                    'bacs_laves': item['bacs_laves'],
                    'moyenne_tonnage_au_vidage': item['moyenne_tonnage_au_vidage'],
                    
                    'max_temperature_moteur': item['max_temperature_moteur'],
                    
                    'arrets_moins_5min': item['arrets_moins_5min'],
                    
                    'arrets_plus_5min': item['arrets_plus_5min'],
                    
                    'pt_dechets_verts': item['dv'],
                    
                    'allumages_extinctions': item['allumages_extinctions'],
                    
                  
                    'chargement_dechargement_amplirolls': item['chargement_dechargement_amplirolls'],
                    'last_time_ampl': str(item['last_time_ampl']),
                    
                    'kg_CO2': item['kg_CO2'],
                    
                    'km_voiries_lavees': item['km_voiries_lavees'],
                    
                    'km_voiries_brossees': item['km_voiries_brossees'],
                    
                    'sorties_zone_action': item['sorties_zone_action'],
                    
                    'max_vitesse_plus_100km_en_ville': item['max_vitesse_plus_100km_en_ville'],
                    
                    'litres_consommes': item['litre_gas'],
                    
                    'last_time_decharge': str(item['last_time_decharge']),

                    'last_time_transfert': str(item['last_time_transfert']),
                    'services_realises': item['services_realises'],
                    'pourcentage_respect_horaire_planifie': item['respect_horaire_planifie'],
                    'demarrages_non_autorises': item['demarrages_non_autorises'],
                    'realisation_circuits': item['realisation_circuits'],
                    'km_dans_le_circuit': item['km_dans_le_circuit'],
                    'km_hors_du_circuit': item['km_hors_du_circuit'],
                    'last_acc': last_acc
              })



            #   res = self.env['is_dashboard.dashboard'].search_read([("device", "=", item['vehicule']),("datej", "=", item['datej'])], [])
            #   if not res:


            for item in insert_data:
              dashboard_day_model = self.env['is_dashboard.dashboard_day']

              res = dashboard_day_model.search_read([("device", "=", item['vehicule']),("datej", "=", item['datej'])], [] ,order="datej desc" ,limit=1)
              
              
              if res:
	              
                #print("okkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk deja exist")
                item['nb_calcule'] = res[0]['nb_calcule'] +1
                # print(item)
                # print("            *******************************              " ,res)

                return 0
                dashboard_day_record = dashboard_day_model.search([('vehId', '=', res[0]['vehId'])])
                item['deviceid'] = res[0]['vehId'] 
                item['fonction'] = res[0]['fonction'] 
                item['vehicule'] = res[0]['device'] 
                item['datej'] = res[0]['datej'] 
                item['last_date'] = item['last_date']
                
                # print( item['workTime'] )
                timework = datetime.strptime(res[0]['heures_travaillees'], '%H:%M:%S') + timedelta(hours=datetime.strptime(str(item['workTime']), '%H:%M:%S').hour, minutes=datetime.strptime(str(item['workTime']), '%H:%M:%S').minute, seconds=datetime.strptime(str(item['workTime']), '%H:%M:%S').second)
                item['workTime'] = timework.strftime("%H:%M:%S") 
                # print( item['workTime'] ,res[0]['heures_travaillees'])

                item['kmTotal'] = res[0]['km_total'] + item['kmTotal']

                item['AccPP'] = round((res[0]['moyenne_accelerations'] + item['AccPP'])/2)
                
                item['BrakePP'] = round((res[0]['moyenne_freinage'] + item['BrakePP'])/2)
                
                item['acces_decharge']= res[0]['acces_decharge'] + item['acces_decharge']
                
                item['acces_points_transfert'] = res[0]['acces_points_transfert'] + item['acces_points_transfert']
                
                item['compactions'] = res[0]['compactions_dechets'] + item['compactions']
                
                item['LC'] = res[0]['cycles_leve_conteneur'] + item['LC']
                
                timeworkpomp = datetime.strptime(res[0]['heures_activation_pompe'], '%H:%M:%S') + timedelta(hours=datetime.strptime(str(item['workTimePompe']), '%H:%M:%S').hour, minutes=datetime.strptime(str(item['workTimePompe']), '%H:%M:%S').minute, seconds=datetime.strptime(str(item['workTimePompe']), '%H:%M:%S').second)
                item['workTimePompe']= timeworkpomp.strftime("%H:%M:%S")
                
                item['moy_vitesse']= round((res[0]['moyenne_vitesses'] + item['moy_vitesse'])/2)

                
                
                if res[0]['max_vitesse'] > item['max_vitesse']:
                  item['max_vitesse'] = res[0]['max_vitesse'] 
                
                item['exces_vitesse_60'] = res[0]['exces_vitesse_60'] + item['exces_vitesse_60']
                item['exces_vitesse_80']= res[0]['exces_vitesse_80'] + item['exces_vitesse_80']
                item['exces_vitesse_100']= res[0]['exces_vitesse_100'] + item['exces_vitesse_100']
                item['exces_vitesse_120']= res[0]['exces_vitesse_120'] + item['exces_vitesse_120']
                
                item['bacs_collectes']= res[0]['bacs_collectes'] + item['bacs_collectes']
                item['bacs_laves']= res[0]['bacs_laves'] + item['bacs_laves']

              
                item['moyenne_tonnage_au_vidage'] = round((res[0]['moyenne_tonnage_au_vidage'] + item['moyenne_tonnage_au_vidage'])/2)
                
                if res[0]['max_temperature_moteur'] > item['max_temperature_moteur']:
                  item['max_temperature_moteur'] = res[0]['max_temperature_moteur'] 

              
                item['arrets_moins_5min'] = res[0]['arrets_moins_5min'] + item['arrets_moins_5min']
                
                item['arrets_plus_5min'] = res[0]['arrets_plus_5min'] + item['arrets_plus_5min']
                
                item['dv']=res[0]['pt_dechets_verts'] + item['dv']
                
                item['allumages_extinctions']=res[0]['allumages_extinctions'] + item['allumages_extinctions']

                item['demarrages_non_autorises'] = res[0]['demarrages_non_autorises'] + item['demarrages_non_autorises']
                
              
                item['chargement_dechargement_amplirolls']=res[0]['chargement_dechargement_amplirolls'] + item['chargement_dechargement_amplirolls']
                item['last_time_ampl']= str(item['last_time_ampl'])
                
                item['kg_CO2']=res[0]['kg_CO2'] + item['kg_CO2']
                
                item['km_voiries_lavees']=res[0]['km_voiries_lavees'] + item['km_voiries_lavees']
                
                item['km_voiries_brossees']=res[0]['km_voiries_brossees'] + item['km_voiries_brossees']
                
                item['sorties_zone_action']=res[0]['sorties_zone_action'] + item['sorties_zone_action']
                
                if res[0]['max_vitesse_plus_100km_en_ville'] > item['max_vitesse_plus_100km_en_ville']:
                  item['max_vitesse_plus_100km_en_ville']= res[0]['max_vitesse_plus_100km_en_ville']

                item['sum_pl'] = res[0]['sum_pl'] + item['respect_horaire_planifie']
                nb_calcule_pl = item['nb_calcule_pl'] =  res[0]['nb_calcule_pl']+item['nb_calcule_pl']

                if nb_calcule_pl == 0:
                  item['nb_calcule_pl'] = 0
                  item['respect_horaire_planifie'] = 0
                else:
                  item['nb_calcule_pl'] = nb_calcule_pl
                  item['respect_horaire_planifie'] =  round(item['sum_pl'] / item['nb_calcule_pl'])  #round((res[0]['pourcentage_respect_horaire_planifie'] + item['respect_horaire_planifie'])/ 2)
                
                item['litre_gas']=res[0]['litres_consommes'] + item['litre_gas']
                
                item['last_time_decharge']= str(item['last_time_decharge'])

                item['last_time_transfert']= str(item['last_time_transfert'])

                item['km_dans_le_circuit'] = item['km_dans_le_circuit'] + res[0]['km_dans_le_circuit']

                item['km_hors_du_circuit'] = item['km_hors_du_circuit'] + res[0]['km_hors_du_circuit']
                # print(item)
                dashboard_day_record.write({
                    'vehId': item['deviceid'], 
                    'fonction': item['fonction'],
                    'device': item['vehicule'], 
                    'datej': item['datej'], 
                    'last_date': item['last_date'],
                    'nb_calcule': item['nb_calcule'],

                    'heures_travaillees': str(item['workTime']), 

                    'km_total': item['kmTotal'], 

                    'moyenne_accelerations': item['AccPP'],
                    
                    'moyenne_freinage': item['BrakePP'],
                    
                    'acces_decharge': item['acces_decharge'],
                    
                    'acces_points_transfert': item['acces_points_transfert'],
                    
                    'compactions_dechets': item['compactions'],
                    
                    'cycles_leve_conteneur': item['LC'],
                    
                    'heures_activation_pompe': str(item['workTimePompe']),
                    
                    'moyenne_vitesses': item['moy_vitesse'],
                    
                    'max_vitesse': item['max_vitesse'],
                    
                    'exces_vitesse_60': item['exces_vitesse_60'],
                    'exces_vitesse_80': item['exces_vitesse_80'],
                    'exces_vitesse_100': item['exces_vitesse_100'],
                    'exces_vitesse_120': item['exces_vitesse_120'],
                    
                    'bacs_collectes': item['bacs_collectes'],
                    'bacs_laves': item['bacs_laves'],


                    'moyenne_tonnage_au_vidage': item['moyenne_tonnage_au_vidage'],
                    
                    'max_temperature_moteur': item['max_temperature_moteur'],
                    
                    'arrets_moins_5min': item['arrets_moins_5min'],
                    
                    'arrets_plus_5min': item['arrets_plus_5min'],
                    
                    'pt_dechets_verts': item['dv'],
                    
                    'allumages_extinctions': item['allumages_extinctions'],
                    
                  
                    'chargement_dechargement_amplirolls': item['chargement_dechargement_amplirolls'],
                    'last_time_ampl': str(item['last_time_ampl']),
                    
                    'kg_CO2': item['kg_CO2'],
                    
                    'km_voiries_lavees': item['km_voiries_lavees'],
                    
                    'km_voiries_brossees': item['km_voiries_brossees'],
                    
                    'sorties_zone_action': item['sorties_zone_action'],
                    
                    'max_vitesse_plus_100km_en_ville': item['max_vitesse_plus_100km_en_ville'],
                    
                    'litres_consommes': item['litre_gas'],
                    
                    'last_time_decharge': str(item['last_time_decharge']),

                    'last_time_transfert': str(item['last_time_transfert']),
                    'services_realises': item['services_realises'],
                    'pourcentage_respect_horaire_planifie': item['respect_horaire_planifie'],
                    'demarrages_non_autorises': item['demarrages_non_autorises'],
                    'realisation_circuits': item['realisation_circuits'],
                    'km_dans_le_circuit': item['km_dans_le_circuit'],
                    'km_hors_du_circuit': item['km_hors_du_circuit'],
                    'last_acc': item['last_acc'],
                    'sum_pl': item['sum_pl'],
                    'nb_calcule_pl':item['nb_calcule_pl']
                })
              else:
               # print("noooooooooooooooooooooooooooooooo  exist")
                self.env['is_dashboard.dashboard_day'].create({
                      'vehId': item['deviceid'], 
                      'fonction': item['fonction'],
                      'device': item['vehicule'], 
                      'datej': item['datej'], 
                      'last_date': item['last_date'],
                      'nb_calcule': 1,
                      'heures_travaillees': str(item['workTime']), 

                      'km_total': item['kmTotal'], 

                      'moyenne_accelerations': item['AccPP'],
                      
                      'moyenne_freinage': item['BrakePP'],
                      
                      'acces_decharge': item['acces_decharge'],
                      
                      'acces_points_transfert': item['acces_points_transfert'],
                      
                      'compactions_dechets': item['compactions'],
                      
                      'cycles_leve_conteneur': item['LC'],
                      
                      'heures_activation_pompe': str(item['workTimePompe']),
                      
                      'moyenne_vitesses': item['moy_vitesse'],
                      
                      'max_vitesse': item['max_vitesse'],
                      
                      'exces_vitesse_60': item['exces_vitesse_60'],
                      'exces_vitesse_80': item['exces_vitesse_80'],
                      'exces_vitesse_100': item['exces_vitesse_100'],
                      'exces_vitesse_120': item['exces_vitesse_120'],
                      


                      'moyenne_tonnage_au_vidage': item['moyenne_tonnage_au_vidage'],
                      
                      'max_temperature_moteur': item['max_temperature_moteur'],
                      
                      'arrets_moins_5min': item['arrets_moins_5min'],
                      
                      'arrets_plus_5min': item['arrets_plus_5min'],
                      
                      'pt_dechets_verts': item['dv'],
                      
                      'allumages_extinctions': item['allumages_extinctions'],
                      
                    
                      'chargement_dechargement_amplirolls': item['chargement_dechargement_amplirolls'],
                      'last_time_ampl': str(item['last_time_ampl']),
                      
                      'kg_CO2': item['kg_CO2'],
                      
                      'km_voiries_lavees': item['km_voiries_lavees'],
                      
                      'km_voiries_brossees': item['km_voiries_brossees'],
                      
                      'sorties_zone_action': item['sorties_zone_action'],
                      
                      'max_vitesse_plus_100km_en_ville': item['max_vitesse_plus_100km_en_ville'],
                      
                      'litres_consommes': item['litre_gas'],
                      
                      'last_time_decharge': str(item['last_time_decharge']),

                      'last_time_transfert': str(item['last_time_transfert']),
                      'services_realises': item['services_realises'],
                      'pourcentage_respect_horaire_planifie': item['respect_horaire_planifie'],
                      'demarrages_non_autorises': item['demarrages_non_autorises'],
                      'realisation_circuits': item['realisation_circuits'],
                      'km_dans_le_circuit': item['km_dans_le_circuit'],
                      'km_hors_du_circuit': item['km_hors_du_circuit'],
                      'last_acc': item['last_acc'],
                      'sum_pl': item['sum_pl'],
                      'nb_calcule_pl':item['nb_calcule_pl']
                })




            # Synchroniser chaque ligne de données avec Odoo
            # for row in rows:
            #     data = {
            #         'external_id': row[0],
            #         'name': row[1],
            #         'id': row[0],
            #         'lastupdate': row[2],
            #         'nature': row[3],
            #         'type': row[4],
            #         'desactiver': row[5],
            #         'fonction': row[6],
            #         'prefecture': row[7],
            #         'nb' : 1
            #     }
                # self.create_or_update_odoo_record(data)

            # N'oubliez pas de fermer la connexion et le curseur
            cur.close()
            conn.close()
        else:
            raise Exception("La source de données 'RABAT' n'a pas été trouvée.")











