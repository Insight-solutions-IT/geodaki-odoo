# -*- coding: utf-8 -*-
from odoo import http
import json
from datetime import datetime

class IsAnalyseThemmatique(http.Controller):
    @http.route('/is_an_them/is_an_them/getAll', csrf=False, type='http', auth='public')
    def get_diagnostic_circuit(self, methode, date1 , date2):
        try:
            curcuit = self._fetch_cirs_tree(methode, date1 , date2)
            response_data = json.dumps(curcuit)
            return http.request.make_response(response_data, headers=[('Content-Type', 'application/json')])
        except Exception as e:
            return str(e)
        
    @http.route('/is_an_them/is_an_them/get', csrf=False, type='http', auth='public')
    def get_an_them_taux(self, methode, date1 , date2, circuit, device):
        print('**********************************************************************************')
        try:
            curcuit = self.fetch_taux( date1 , date2, circuit, device)
            response_data = json.dumps(curcuit)
            return http.request.make_response(response_data, headers=[('Content-Type', 'application/json')])
        except Exception as e:
            print(e)
            return str(e)
        

    
    def _fetch_cirs_tree(self, methode, date1 , date2):
        try:
            query = """
				With t as (
                    SELECT 
                    tr3.datej,
                    tr3.id_cirdet,
                    tr3.id_circuit,
                    tr3.deviceid,
                    tr3.lt as ltr,
                    tr3.methode,
                    tr3.pl,
                    case when SUM(tr3.taux)<=100  then SUM(tr3.taux) else 100 end taux
                    FROM
                    le_taux_tr tr3
                    WHERE
                    tr3.dh >= '{}' AND 
                    tr3.dh <= '{}' AND 
                    tr3.methode = {}  
                        and tr3.pl= 1
                    GROUP BY
                    tr3.datej,
                    tr3.id_cirdet,
                    tr3.id_circuit,
                    tr3.deviceid,
                    tr3.lt,
                    tr3.methode,
                    tr3.pl

                    ), lc as (
                        select sum(st_length(routes.geom::geography, true))/1000 as l, circuits.id
                        from 
                            public.is_decoupage_circuits circuits 
                            inner join public.is_decoupage_circuit_route_rel ON is_decoupage_circuit_route_rel.circuit_id = circuits.id
                            INNER JOIN PUBLIC.is_decoupage_routes routes on routes.id = is_decoupage_circuit_route_rel.route_id
                        group by circuits.id
                        order by circuits.id
                    )



                    select distinct 
                        case when round(sum(t.ltr/(lc.l*1000)*t.taux)) <100 then round(sum(t.ltr/(lc.l*1000)*t.taux))  else 100 end as taux,
                        d.device,
                        row_number() OVER (ORDER BY device) AS id, 
                        cr."name" as circuit_name ,
                        cr."Secteur",
                        d.id as vehicule,
                        cr.id AS circuit,
                        CASE 
                            WHEN sum(t.ltr/(lc.l*1000)*t.taux) <= 25 THEN 'red'
                            WHEN sum(t.ltr/(lc.l*1000)*t.taux) > 25 AND sum(t.ltr/(lc.l*1000)*t.taux) <= 50 THEN '#FF5040'
                            WHEN sum(t.ltr/(lc.l*1000)*t.taux) > 50 AND sum(t.ltr/(lc.l*1000)*t.taux) <= 75 THEN 'lightgreen'
                            ELSE 'green'
                        END AS color 
                    FROM
                        public.is_decoupage_circuits cr
                        INNER JOIN lc ON (cr.id= lc.id) 
                        INNER JOIN t ON (cr."id" = t.id_circuit)
                        INNER JOIN public.fleet_vehicle d ON (t.deviceid = d.id) and t.pl=1
                    group by  
                        cr."name" ,
                        cr."Secteur",
                        d.id,
                        cr.id, 
                        d.device
                    order by d.device

        """.format(date1,date2, methode, date1)
            http.request.env.cr.execute(query)
            data = http.request.env.cr.fetchall()
            results = []
            for row in data:
                result_dict = {
                    'taux': row[0],
                    'device': row[1],
                    'id': row[2],
                    # 'hdeb': row[3].strftime('%Y-%m-%d %H:%M:%S') if row[3] else None,
                    # 'hfin': row[4].strftime('%Y-%m-%d %H:%M:%S') if row[4] else None,
                    'circuit_name': row[3],
                    'Secteur': row[4],
                    'vehicule': row[5],
                    'circuit': row[6],
                    'color': row[7]
                }
                results.append(result_dict)

            return results


        except Exception as e:
            return str(e)
        
    def fetch_taux(self, date1 , date2, circuit, device):
        try:
            query = """
				With t as (
                    SELECT 
                    tr3.datej,
                    tr3.id_cirdet,
                    tr3.id_circuit,
                    tr3.deviceid,
                    tr3.lt as ltr,
                    tr3.methode,
                    tr3.pl,
                    case when SUM(tr3.taux)<=100  then SUM(tr3.taux) else 100 end taux
                    FROM
                    le_taux_tr tr3
                    WHERE
                    tr3.dh >= '{}' AND 
                    tr3.dh <= '{}' AND 
                    tr3.deviceid = {} AND 
                    tr3.id_circuit = {} 
                    AND tr3.pl= 1
                    GROUP BY
                    tr3.datej,
                    tr3.id_cirdet,
                    tr3.id_circuit,
                    tr3.deviceid,
                    tr3.lt,
                    tr3.methode,
                    tr3.pl

                    ), lc as (
                        select sum(st_length(routes.geom::geography, true))/1000 as l, circuits.id
                        from 
                            public.is_decoupage_circuits circuits 
                            inner join public.is_decoupage_circuit_route_rel ON is_decoupage_circuit_route_rel.circuit_id = circuits.id
                            INNER JOIN PUBLIC.is_decoupage_routes routes on routes.id = is_decoupage_circuit_route_rel.route_id
                        group by circuits.id
                        order by circuits.id
                    )



                    select distinct 
                        case when round(sum(t.ltr/(lc.l*1000)*t.taux)) <100 then round(sum(t.ltr/(lc.l*1000)*t.taux))  else 100 end as taux,
                        d.device,
                        row_number() OVER (ORDER BY device) AS id, 
                        cr."name" as circuit_name ,
                        cr."Secteur",
                        d.id as vehicule,
                        cr.id AS circuit,
                        CASE 
                            WHEN sum(t.ltr/(lc.l*1000)*t.taux) <= 25 THEN 'red'
                            WHEN sum(t.ltr/(lc.l*1000)*t.taux) > 25 AND sum(t.ltr/(lc.l*1000)*t.taux) <= 50 THEN '#FF5040'
                            WHEN sum(t.ltr/(lc.l*1000)*t.taux) > 50 AND sum(t.ltr/(lc.l*1000)*t.taux) <= 75 THEN 'lightgreen'
                            ELSE 'green'
                        END AS color 
                    FROM
                        public.is_decoupage_circuits cr
                        INNER JOIN lc ON (cr.id= lc.id) 
                        INNER JOIN t ON (cr."id" = t.id_circuit)
                        INNER JOIN public.fleet_vehicle d ON (t.deviceid = d.id) and t.pl=1
                    group by  
                        cr."name" ,
                        cr."Secteur",
                        d.id,
                        cr.id, 
                        d.device
                    order by d.device

        """.format(date1,date2, device, circuit)
            print(query)
            http.request.env.cr.execute(query)
            data = http.request.env.cr.fetchall()
            results = []
            for row in data:
                result_dict = {
                    'taux': row[0],
                    'device': row[1],
                    'id': row[2],
                    # 'hdeb': row[3].strftime('%Y-%m-%d %H:%M:%S') if row[3] else None,
                    # 'hfin': row[4].strftime('%Y-%m-%d %H:%M:%S') if row[4] else None,
                    'circuit_name': row[3],
                    'Secteur': row[4],
                    'vehicule': row[5],
                    'circuit': row[6],
                    'color': row[7]
                }
                results.append(result_dict)

            return results


        except Exception as e:
            return str(e)
        



    # @http.route('/is_analyse_themmatique/is_analyse_themmatique', auth='public')
    # def index(self, **kw):
    #     return "Hello, world"

    # @http.route('/is_analyse_themmatique/is_analyse_themmatique/objects', auth='public')
    # def list(self, **kw):
    #     return http.request.render('is_analyse_themmatique.listing', {
    #         'root': '/is_analyse_themmatique/is_analyse_themmatique',
    #         'objects': http.request.env['is_analyse_themmatique.is_analyse_themmatique'].search([]),
    #     })

    # @http.route('/is_analyse_themmatique/is_analyse_themmatique/objects/<model("is_analyse_themmatique.is_analyse_themmatique"):obj>', auth='public')
    # def object(self, obj, **kw):
    #     return http.request.render('is_analyse_themmatique.object', {
    #         'object': obj
    #     })
