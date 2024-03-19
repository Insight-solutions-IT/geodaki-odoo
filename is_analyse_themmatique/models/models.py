# -*- coding: utf-8 -*-

from odoo import models, fields, api


class is_analyse_themmatique(models.Model):
    _name = "is_analyse_themmatique.is_analyse_themmatique"
    _description = "is_analyse_themmatique.is_analyse_themmatique"

    name = fields.Char()
    value = fields.Integer()
    value2 = fields.Float(compute="_value_pc", store=True)
    description = fields.Text()

    @api.depends("value")
    def _value_pc(self):
        for record in self:
            record.value2 = float(record.value) / 100


class AnalyseThematique(models.Model):
    _name = "is_analyse_thematique"
    _auto = False
    
    def get_by_device_id(self, id, start, end):
        query = """
            SELECT 
                p.hdeb,
                p.hfin,
                st_astext(public.is_decoupage_routes.geom) AS geom,
                sum(public.is_taux_taux_tr.taux) AS "taux",
                --public.is_taux_taux_tr.lt,
                sum(public.is_taux_taux_tr.li),
                public.is_decoupage_circuits.name,
                public.is_decoupage_circuits."Secteur",
                fr.name AS frequence,
                f.name AS fonction
                FROM
                public.is_decoupage_routes
                INNER JOIN public.is_taux_taux_tr ON (public.is_decoupage_routes.id = public.is_taux_taux_tr.route)
                INNER JOIN public.is_decoupage_circuits ON (public.is_taux_taux_tr.circuit = public.is_decoupage_circuits.id)
                INNER JOIN public.fleet_vehicle_fonction f ON (public.is_decoupage_circuits.fonction_id = f.id)
                INNER JOIN public.is_bav_frequences fr ON (public.is_decoupage_circuits.frequence_id = fr.id)
                INNER JOIN public.is_planning_is_planning p ON (public.is_decoupage_circuits.id = p.circuitid)
                
            WHERE
                p.circuitid = {}
                AND p.hdeb >= '{}'::timestamp
                AND p.hfin <= '{}'::timestamp
                AND is_taux_taux_tr.datej = '{}'::date
                AND p.datej = is_taux_taux_tr.datej
            GROUP BY 
                p.hdeb,
                p.hfin,
                geom,
                --public.is_taux_taux_tr.lt,
--                 public.is_taux_taux_tr.li,
                public.is_decoupage_circuits.name,
                public.is_decoupage_circuits."Secteur",
                fr.name,
                f.name
        """.format(id, start, end, start)
        print("000000000000000000000000000000000000000000000000000000")
        print(query)
        self.env.cr.execute(query)
        res = self.env.cr.dictfetchall()
        return res

    def get_taux_by_cirdet(self, id, veh, start, end):
        query = """
            SELECT 
                public.is_decoupage_routes.id AS route,
                public.is_decoupage_routes.geom,
                public.is_decoupage_routes.gshape_name,
               -- tr3.datej,
                tr3.pl,
                case when SUM(tr3.taux)<=100  then SUM(tr3.taux) else 100 end  as taux,
                tr3.circuit,
                tr3.vehicule,
                tr3.lt,
                tr3.methode
            FROM
                public.is_decoupage_circuit_route_rel
                INNER JOIN public.is_decoupage_routes ON (public.is_decoupage_circuit_route_rel.route_id = public.is_decoupage_routes.id)
                INNER JOIN public.is_taux_taux_tr tr3 ON (public.is_decoupage_circuit_route_rel.id = tr3.route)
            WHERE
                tr3.dh >= '{}'::timestamp AND 
                tr3.dh <= '{}'::timestamp AND 
                tr3.circuit = {} and tr3.vehicule = {}
            GROUP BY
                public.is_decoupage_routes.id,
                public.is_decoupage_routes.geom,
                public.is_decoupage_routes.gshape_name,
                --tr3.datej,
                tr3.pl,
                tr3.circuit,
                tr3.vehicule,
                tr3.lt,
                tr3.methode  
        """.format( start, end, id, veh)
        print("000000000000000000000000000000000000000000000000000000")
        print(query)
        self.env.cr.execute(query)
        res = self.env.cr.dictfetchall()
        return res
    
    def get_taux_by_cirdet_with_id(self, id, veh, start, end):
        query = """
            SELECT 
                ROW_NUMBER() OVER (ORDER BY public.is_decoupage_routes.id) AS id,
                public.is_decoupage_routes.id AS route,
                --public.is_decoupage_routes.geom,
                public.is_decoupage_routes.gshape_name,
               -- tr3.datej,
                tr3.pl,
                case when SUM(tr3.taux)<=100  then SUM(tr3.taux) else 100 end  as taux,
                tr3.circuit,
                tr3.vehicule,
                round(tr3.lt::decimal, 2) as lt, 
                tr3.methode,
                ST_X(ST_Centroid(public.is_decoupage_routes.geom)) AS x,
                ST_Y(ST_Centroid(public.is_decoupage_routes.geom)) AS y
            FROM
                public.is_decoupage_circuit_route_rel
                INNER JOIN public.is_decoupage_routes ON (public.is_decoupage_circuit_route_rel.route_id = public.is_decoupage_routes.id)
                INNER JOIN public.is_taux_taux_tr tr3 ON (public.is_decoupage_circuit_route_rel.id = tr3.route)
            WHERE
                tr3.dh >= '{}'::timestamp AND 
                tr3.dh <= '{}'::timestamp AND 
                tr3.circuit = {} and tr3.vehicule = {}
            GROUP BY
                public.is_decoupage_routes.id,
                --public.is_decoupage_routes.geom,
                public.is_decoupage_routes.gshape_name,
                --tr3.datej,
                tr3.pl,
                tr3.circuit,
                tr3.vehicule,
                tr3.lt,
                tr3.methode  
        """.format( start, end, id, veh)
        print("000000000000000000000000000000000000000000000000000000")
        print(query)
        self.env.cr.execute(query)
        res = self.env.cr.dictfetchall()
        return res
    

    def get_taux_by_cirdet_all(self, meth, start, end):
        query = """
            SELECT 
                public.is_decoupage_routes.id AS route,
                st_astext(public.is_decoupage_routes.geom) as geom,
                public.is_decoupage_routes.gshape_name,
                tr3.datej,
                tr3.pl,
                CASE 
                    WHEN SUM(tr3.taux) <= 100
                    THEN SUM(tr3.taux)
                    ELSE  100 
                END AS taux,
                tr3.circuit,
                tr3.vehicule,
                tr3.lt,
                tr3.methode,
                public.is_planning_is_planning.hdeb,
                public.is_planning_is_planning.hfin,
                public.is_decoupage_circuits."Secteur",
                public.is_decoupage_circuits.name,
                public.is_decoupage_circuits.frequence_id as frequence,
                public.is_decoupage_circuits.fonction_id  as fonction
            FROM
                public.is_decoupage_circuit_route_rel
                INNER JOIN public.is_decoupage_routes ON (public.is_decoupage_circuit_route_rel.route_id = public.is_decoupage_routes.id)
                INNER JOIN public.is_taux_taux_tr tr3 ON (public.is_decoupage_circuit_route_rel.id = tr3.route)
                INNER JOIN public.is_planning_is_planning ON (tr3.circuit = public.is_planning_is_planning.circuitid)
                AND (tr3.vehicule = public.is_planning_is_planning.deviceid)
                INNER JOIN public.is_decoupage_circuits ON (public.is_decoupage_circuit_route_rel.circuit_id = public.is_decoupage_circuits.id)
            WHERE
                tr3.dh >= '{}' ::timestamp AND 
                tr3.dh <= '{}' ::timestamp AND 
                is_planning_is_planning.datej = '{}'::date
                and tr3.methode = {} 
                and tr3.pl = 1
                
            GROUP BY
                public.is_decoupage_routes.id,
                public.is_decoupage_routes.geom,
                public.is_decoupage_routes.gshape_name,
                tr3.datej,
                tr3.pl,
                tr3.circuit,
                tr3.vehicule,
                tr3.lt,
                tr3.methode,
                public.is_planning_is_planning.hdeb,
                public.is_planning_is_planning.hfin,
                public.is_decoupage_circuits."Secteur",
                public.is_decoupage_circuits.name,
                public.is_decoupage_circuits.frequence_id ,
                public.is_decoupage_circuits.fonction_id
        """.format( start, end, start, meth)
        # print("000000000000000000000000000000000000000000000000000000")
        # print(query)
        self.env.cr.execute(query)
        res = self.env.cr.dictfetchall()
        return res
    
    def get_taux_by_cir(self, id, veh, start, end):
        query = """
            SELECT 
                ROW_NUMBER () OVER (ORDER BY circuit) as id,
                public.is_taux_taux_tr.circuit,
                public.is_taux_taux_tr.datej,
                public.is_taux_taux_tr.vehicule,
                public.fleet_vehicle.device,
                public.is_decoupage_circuits.name as circuit_name,
                case when avg(public.is_taux_taux_tr.taux)< 75 then round(avg(public.is_taux_taux_tr.taux)) else  100 end  AS taux
            FROM
                public.fleet_vehicle
                INNER JOIN public.is_taux_taux_tr ON (public.fleet_vehicle.id = public.is_taux_taux_tr.vehicule)
                INNER JOIN public.is_decoupage_circuits ON (public.is_taux_taux_tr.circuit = public.is_decoupage_circuits.id)
            WHERE
                circuit = {} AND 
                pl = 1 AND       
                datej = current_date AND  taux !=0 and
                vehicule = {} and dh >= '{}'::timestamp and dh <= '{}'::timestamp
            GROUP BY
                public.is_taux_taux_tr.circuit,
                public.is_taux_taux_tr.datej,
                public.is_taux_taux_tr.vehicule,
                public.fleet_vehicle.device,
                public.is_decoupage_circuits.name

        """.format(id, veh, start, end )
        self.env.cr.execute(query)
        res = self.env.cr.dictfetchall()
        return res

    def get_taux_by_cir_and_vehicule_and_pl(self, circuit, vehicule, start, end):
        query = """
            WITH tt AS ( 
                SELECT    
                    public.is_decoupage_routes.id ,
                    public.is_planning_is_planning.circuitid, 
                    public.fleet_vehicle.device, 
                    public.is_planning_is_planning.hdeb,
                    public.is_planning_is_planning.hfin,
                    st_astext(public.is_decoupage_routes.geom) as geom,
                    public.is_decoupage_routes.gshape_name,
                    public.is_decoupage_circuits.name as circuit_name,
                    public.is_decoupage_circuits."Secteur",
                    public.is_planning_is_planning.deviceid,
                    st_length(public.is_decoupage_routes.geom::geography, true) as lt,
                    ST_X(ST_Centroid(public.is_decoupage_routes.geom)) AS x,
                    ST_Y(ST_Centroid(public.is_decoupage_routes.geom)) AS y
                FROM
                    public.is_decoupage_circuit_route_rel
                    INNER JOIN public.is_decoupage_circuits ON (public.is_decoupage_circuit_route_rel.circuit_id = public.is_decoupage_circuits.id)
                    INNER JOIN public.is_decoupage_routes ON (public.is_decoupage_circuit_route_rel.route_id = public.is_decoupage_routes.id)
                    INNER JOIN public.is_planning_is_planning ON (public.is_decoupage_circuits.id = public.is_planning_is_planning.circuitid)
                    INNER JOIN public.fleet_vehicle ON (public.is_planning_is_planning.deviceid = public.fleet_vehicle.id)
                WHERE
                    public.is_planning_is_planning.datej = '{}'::date AND  
                    public.is_planning_is_planning.deviceid = {} AND 
                    public.is_planning_is_planning.circuitid = {}  
                GROUP BY    
                    public.fleet_vehicle.device,
                    public.is_planning_is_planning.hdeb,
                    public.is_planning_is_planning.hfin,
                    public.is_decoupage_routes.geom,
                    public.is_decoupage_routes.gshape_name,
                    public.is_decoupage_circuits.name,
                    public.is_decoupage_circuits."Secteur",
                    public.is_planning_is_planning.deviceid,
                    public.is_planning_is_planning.circuitid,
                    public.is_decoupage_routes.id 
            ), tr as(
                SELECT    
                    case when sum(le_taux_tr.taux) <= 100 then sum(le_taux_tr.taux) else 100 end AS avg_taux, 
                    pl, 
                    public.le_taux_tr.deviceid,
                    public.is_decoupage_circuits.id as circuitid,
                    public.is_decoupage_routes.id 
                FROM
                    public.is_decoupage_circuit_route_rel
                    INNER JOIN public.is_decoupage_circuits ON (public.is_decoupage_circuit_route_rel.circuit_id = public.is_decoupage_circuits.id)
                    INNER JOIN public.is_decoupage_routes ON (public.is_decoupage_circuit_route_rel.route_id = public.is_decoupage_routes.id)
                    right outer  JOIN public.le_taux_tr ON (public.le_taux_tr.id_cirdet = public.is_decoupage_circuit_route_rel.id  )  --(public.is_planning_is_planning.circuitid = public.le_taux_tr.id_circuit AND public.is_planning_is_planning.deviceid = public.le_taux_tr.deviceid)
                WHERE
                    public.le_taux_tr.deviceid = {} AND 
                    public.is_decoupage_circuits.id = {} AND 
                    pl=1
                    and  public.le_taux_tr.dh between '{}'::timestamp and '{}'::timestamp
                GROUP BY	  
                    pl, 
                    public.le_taux_tr.deviceid,
                    public.is_decoupage_circuits.id,
                    public.is_decoupage_routes.id
                    order by id asc
            )
            SELECT row_number() over (ORDER BY tt.id desc) AS idd, tt.*, case when tr.avg_taux is null then 0 else tr.avg_taux end as taux
            from tt Left OUTER join tr on (tt.id = tr.id)
        """.format(start, vehicule, circuit,vehicule, circuit, start, end)
        # print(query)
        self.env.cr.execute(query)
        res = self.env.cr.dictfetchall()
        return res
    # def get_taux_by_cir_all(self, pl, start, end):
    #     query = """
    #         select row_number()over (ORDER BY tt.device) AS id,
    #             tt.circuit, tt.circuit_name, tt.vehicule, tt.device, 
    #             CASE 
    #                 WHEN avg(tt.taux) < 25
    #                 THEN 'red'
    #                 WHEN avg(tt.taux) >= 25 AND 
    #                         avg(tt.taux) < 50
    #                 THEN '#FF5060'
    #                 WHEN avg(tt.taux) >= 50 AND 
    #             avg(tt.taux) < 75
    #                 THEN 'lightgreen'
    #                 ELSE  'green'
    #             END AS color,
    #             round(avg(tt.taux)) as taux, tt.hdeb, tt.hfin
    #             from
    #                 (
    #                     SELECT DISTINCT
                            
    #                         public.is_taux_taux_tr.circuit,
    #                         --public.is_taux_taux_tr.datej,
    #                         public.is_taux_taux_tr.vehicule,  
    #                         --public.is_taux_taux_tr.dh,   
    #                         public.is_taux_taux_tr.route,  
    #                         --max(public.is_taux_taux_tr.taux) as taux,
    #                         public.fleet_vehicle.device,
    #                         public.is_decoupage_circuits.name AS circuit_name
    #                         ,CASE 
    #                             WHEN sum(public.is_taux_taux_tr.taux) < 100
    #                             THEN round(sum(public.is_taux_taux_tr.taux))
    #                             ELSE  100
    #                         END AS taux  , is_planning_is_planning.hdeb, is_planning_is_planning.hfin
    #                     FROM
    #                         public.fleet_vehicle
    #                         INNER JOIN public.is_taux_taux_tr ON (public.fleet_vehicle.id = public.is_taux_taux_tr.vehicule)
    #                         INNER JOIN public.is_decoupage_circuits ON (public.is_taux_taux_tr.circuit = public.is_decoupage_circuits.id)
    #                         INNER JOIN public.is_planning_is_planning ON (public.is_decoupage_circuits.id = public.is_planning_is_planning.circuitid)
    #                         AND (public.fleet_vehicle.id = public.is_planning_is_planning.deviceid)
    #                     WHERE
    #                         public.is_planning_is_planning.datej = '{}' ::date AND 
    #                         --public.is_planning_is_planning.datej <= '2024/01/11 00:00:00' ::date AND
    #                         is_planning_is_planning.hdeb >= '{}' ::timestamp AND 
    #                         is_planning_is_planning.hdeb <= '{}' ::timestamp AND
    #                         pl = 1 AND 
    #                         methode = {} AND 
                            
    #                         dh >= is_planning_is_planning.hdeb AND 
    #                         dh <= is_planning_is_planning.hfin --AND 
    #                         --public.is_taux_taux_tr.circuit = 228
    #                     GROUP BY
    #                         public.is_taux_taux_tr.circuit,
    #                         --public.is_taux_taux_tr.datej,
    #                         public.is_taux_taux_tr.vehicule,
    #                         public.fleet_vehicle.device,
    #                         public.is_decoupage_circuits.name,
    #                         public.is_taux_taux_tr.route,  is_planning_is_planning.hdeb, is_planning_is_planning.hfin
    #                     ) tt
    #             group by tt.circuit, tt.circuit_name, tt.vehicule, tt.device  , tt.hdeb, tt.hfin
    #     """.format(start,start, end, pl  )

    #     print(query)
    #     self.env.cr.execute(query)
    #     res = self.env.cr.dictfetchall()
    #     return res

    
    def get_circuit_with_taux(self,dd, df, circuit, vehicule ):

        query= """
            SELECT 
                public.is_decoupage_routes.id AS route,
                st_astext(public.is_decoupage_routes.geom) as geom,
                public.is_decoupage_routes.gshape_name,
                tr3.pl,
                tr3.circuit,
                tr3.vehicule,
                tr3.lt, 
                tr3.methode,
                public.is_decoupage_circuits.name AS circuit,
                public.is_bav_frequences.name AS frequence,
                case when SUM(tr3.taux)<=100  then SUM(tr3.taux) else 100 end  as taux,
                public.is_decoupage_circuits."Secteur",
                public.is_decoupage_circuits.color,
                public.fleet_vehicle_fonction.name AS fonction
            FROM
                public.is_decoupage_circuit_route_rel
                INNER JOIN public.is_decoupage_routes ON (public.is_decoupage_circuit_route_rel.route_id = public.is_decoupage_routes.id)
                INNER JOIN public.is_taux_taux_tr tr3 ON (public.is_decoupage_circuit_route_rel.id = tr3.route)
                INNER JOIN public.is_decoupage_circuits ON (public.is_decoupage_circuit_route_rel.circuit_id = public.is_decoupage_circuits.id)
                INNER JOIN public.is_bav_frequences ON (public.is_decoupage_circuits.frequence_id = public.is_bav_frequences.id)
                INNER JOIN public.fleet_vehicle_fonction ON (public.is_decoupage_circuits.fonction_id = public.fleet_vehicle_fonction.id)
            WHERE
                tr3.dh >= '{}' ::timestamp AND 
                tr3.dh <= '{}' ::timestamp AND 
                tr3.circuit = {} AND 
                tr3.vehicule = {}
            GROUP BY
                public.is_decoupage_routes.id,
                public.is_decoupage_routes.geom,
                public.is_decoupage_routes.gshape_name,
                tr3.pl,
                tr3.circuit,
                tr3.vehicule,
                tr3.lt,
                tr3.methode,
                public.is_decoupage_circuits."Secteur",
                public.is_decoupage_circuits.color,
                public.fleet_vehicle_fonction.name,
                public.is_decoupage_circuits.name, public.is_bav_frequences.name

        """.format(dd, df, circuit, vehicule)
        self.env.cr.execute(query)
        res = self.env.cr.dictfetchall()
        return res
    
    
    def get_taux_by_cir_all(self, pl, start, end):
        # query0 = """
        #     select row_number()over (ORDER BY tt.device) AS id,
        #         tt.circuit, tt.circuit_name, tt.vehicule, tt.device, 
        #         CASE 
        #             WHEN sum(tt.taux) < 25
        #                 THEN 'red'
        #             WHEN sum(tt.taux) >= 25 AND sum(tt.taux) < 50
        #                 THEN '#FF5060'
        #             WHEN sum(tt.taux) >= 50 AND sum(tt.taux) < 75
        #                 THEN 'lightgreen'
        #             ELSE  'green'
        #         END AS color,
        #         round(sum(tt.taux)) as taux, tt.hdeb, tt.hfin
        #         from
        #             (
        #                 SELECT DISTINCT
                            
        #                     public.is_taux_taux_tr.circuit,
        #                     --public.is_taux_taux_tr.datej,
        #                     public.is_taux_taux_tr.vehicule,  
        #                     --public.is_taux_taux_tr.dh,   
        #                     public.is_taux_taux_tr.route,  
        #                     --max(public.is_taux_taux_tr.taux) as taux,
        #                     public.fleet_vehicle.device,
        #                     public.is_decoupage_circuits.name AS circuit_name
        #                     ,
        #                     CASE 
        #                         WHEN sum(public.is_taux_taux_tr.taux) < 100
        #                         THEN round(sum(public.is_taux_taux_tr.taux))
        #                         ELSE  100
        #                     END AS taux  , is_planning_is_planning.hdeb, is_planning_is_planning.hfin
        #                 FROM
        #                     public.fleet_vehicle
        #                     INNER JOIN public.is_taux_taux_tr ON (public.fleet_vehicle.id = public.is_taux_taux_tr.vehicule)
        #                     INNER JOIN public.is_decoupage_circuits ON (public.is_taux_taux_tr.circuit = public.is_decoupage_circuits.id)
        #                     INNER JOIN public.is_planning_is_planning ON (public.is_decoupage_circuits.id = public.is_planning_is_planning.circuitid)
        #                     AND (public.fleet_vehicle.id = public.is_planning_is_planning.deviceid)
        #                 WHERE
        #                     public.is_planning_is_planning.datej = '{}' ::date AND 
        #                     --public.is_planning_is_planning.datej <= '2024/01/11 00:00:00' ::date AND
        #                     is_planning_is_planning.hdeb >= '{}' ::timestamp AND 
        #                     is_planning_is_planning.hdeb <= '{}' ::timestamp AND
        #                     pl = 1 AND 
        #                     methode = {} AND 
                            
        #                     dh >= is_planning_is_planning.hdeb AND 
        #                     dh <= is_planning_is_planning.hfin --AND 
        #                     --public.is_taux_taux_tr.circuit = 228
        #                 GROUP BY
        #                     public.is_taux_taux_tr.circuit,
        #                     --public.is_taux_taux_tr.datej,
        #                     public.is_taux_taux_tr.vehicule,
        #                     public.fleet_vehicle.device,
        #                     public.is_decoupage_circuits.name,
        #                     public.is_taux_taux_tr.route,  is_planning_is_planning.hdeb, is_planning_is_planning.hfin
        #                 ) tt
        #         group by tt.circuit, tt.circuit_name, tt.vehicule, tt.device  , tt.hdeb, tt.hfin
        # """
        
        # query = """
        #         SELECT 
        #             row_number()over (ORDER BY device) AS  id,
        #             public.is_planning_is_planning.hdeb,
        #             public.is_planning_is_planning.hfin,
        #             public.fleet_vehicle.device,
        #             public.is_decoupage_circuits.name as circuit_name,
        #             public.is_decoupage_circuits."Secteur",
        #             CASE 
        #                 WHEN sum(public.le_taux_tr.taux)<=100 THEN
        #                     round(sum(public.le_taux_tr.taux)) 
        #                 ELSE 100 
        #             END AS taux,
        #             public.is_planning_is_planning.deviceid as vehicule,
        #             public.is_planning_is_planning.circuitid as circuit,
        #             CASE 
        #                 WHEN sum(public.le_taux_tr.taux) <=25
        #                     THEN 'red'
        #                 WHEN sum(public.le_taux_tr.taux)>25 AND sum(public.le_taux_tr.taux)<=50
        #                     THEN '#FF5040'
        #                 WHEN sum(public.le_taux_tr.taux)>50 AND sum(public.le_taux_tr.taux)<=75
        #                     THEN 'lightgreen'
        #                 ELSE 'green'
        #             END AS color
        #         FROM	
        #             public.is_decoupage_circuits	
        #             INNER JOIN public.is_planning_is_planning ON (public.is_decoupage_circuits.id = public.is_planning_is_planning.circuitid)
        #             INNER JOIN public.le_taux_tr ON (public.is_planning_is_planning.deviceid = public.le_taux_tr.deviceid)
        #             AND (public.is_planning_is_planning.circuitid = public.le_taux_tr.id_circuit)
        #             INNER JOIN public.fleet_vehicle ON (public.is_planning_is_planning.deviceid = public.fleet_vehicle.id)
        #         WHERE  public.le_taux_tr.dh BETWEEN 	
        #             public.is_planning_is_planning.hdeb AND 		
        #             public.is_planning_is_planning.hfin AND 			
        #             public.is_planning_is_planning.datej = '{}'::date	
        #             and dh between '{}'::timestamp and '{}'::timestamp
        #             and methode = {}
        #         GROUP BY
        #             public.is_planning_is_planning.hdeb,
        #             public.is_planning_is_planning.hfin,
        #             public.fleet_vehicle.device,
        #             public.is_decoupage_circuits.name,
        #             public.is_decoupage_circuits."Secteur",
        #             public.is_planning_is_planning.deviceid,
        #             public.is_planning_is_planning.circuitid
        # """.format(start,start, end, pl  )

        query = """
                with lc as (
                    select sum(st_length(routes.geom::geography, true))/1000 as l, circuits.id
                    from 
                        public.is_decoupage_circuits circuits 
                        inner join public.is_decoupage_circuit_route_rel ON is_decoupage_circuit_route_rel.circuit_id = circuits.id
                        INNER JOIN PUBLIC.is_decoupage_routes routes on routes.id = is_decoupage_circuit_route_rel.route_id
                    group by circuits.id
                    order by circuits.id
                )


                SELECT 
                    case when avg(taux) <100 then round(avg(taux)) else 100 end as taux, 
                    --case when sum(le_taux_tr.lt/(lc.l*1000)*le_taux_tr.taux)<100 then round(sum(le_taux_tr.lt/(lc.l*1000)*le_taux_tr.taux)) else 100 end  AS taux,
                    public.fleet_vehicle.device,
                    row_number()over (ORDER BY device) AS  id,
                    public.is_planning_is_planning.hdeb,
                    public.is_planning_is_planning.hfin,
                    public.fleet_vehicle.device,
                    public.is_decoupage_circuits.name as circuit_name,
                    public.is_decoupage_circuits."Secteur",
                    CASE 
                        WHEN sum(public.le_taux_tr.taux)<=100 THEN
                            round(sum(public.le_taux_tr.taux)) 
                        ELSE 100 
                    END AS taux,
                    public.is_planning_is_planning.deviceid as vehicule,
                    public.is_planning_is_planning.circuitid as circuit,
                    CASE 
                        WHEN sum(public.le_taux_tr.taux) <=25
                            THEN 'red'
                        WHEN sum(public.le_taux_tr.taux)>25 AND sum(public.le_taux_tr.taux)<=50
                            THEN '#FF5040'
                        WHEN sum(public.le_taux_tr.taux)>50 AND sum(public.le_taux_tr.taux)<=75
                            THEN 'lightgreen'
                        ELSE 'green'
                    END AS color
                FROM
                    public.is_decoupage_circuit_route_rel
                    INNER JOIN public.is_decoupage_circuits ON (public.is_decoupage_circuit_route_rel.circuit_id = public.is_decoupage_circuits.id)
                    INNER JOIN public.is_decoupage_routes ON (public.is_decoupage_circuit_route_rel.route_id = public.is_decoupage_routes.id)
                    INNER JOIN public.is_planning_is_planning ON (public.is_decoupage_circuits.id = public.is_planning_is_planning.circuitid)
                    INNER JOIN public.fleet_vehicle ON (public.is_planning_is_planning.deviceid = public.fleet_vehicle.id)
                    inner join lc on is_decoupage_circuits.id = lc.id
                    right outer  JOIN public.le_taux_tr ON (public.le_taux_tr.id_cirdet = public.is_decoupage_circuit_route_rel.id  )  --(public.is_planning_is_planning.circuitid = public.le_taux_tr.id_circuit AND public.is_planning_is_planning.deviceid = public.le_taux_tr.deviceid)
                WHERE
                    public.is_planning_is_planning.datej = '{}' AND 
                    public.le_taux_tr.dh between is_planning_is_planning.hdeb and is_planning_is_planning.hfin   and
                    --   public.is_planning_is_planning.deviceid = 36 AND 
                    --   public.is_planning_is_planning.circuitid = 1335 --AND pl=1
                        
                    --     dh >= '07/03/2024 00:00:00'::timestamp and dh <= '07/03/2024 20:00:00'::timestamp and
                    public.le_taux_tr.methode={}
                GROUP BY	
                    public.fleet_vehicle.device,
                    public.is_planning_is_planning.hdeb,
                    public.is_planning_is_planning.hfin  ,
                    public.is_decoupage_circuits.name,
                    public.is_decoupage_circuits."Secteur",
                    public.is_planning_is_planning.deviceid,
                    public.is_planning_is_planning.circuitid ,
                    pl 


        """.format(start, pl)
        print(query, pl)
        self.env.cr.execute(query)
        res = self.env.cr.dictfetchall()
        return res
