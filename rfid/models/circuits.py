# -*- coding: utf-8 -*-

from odoo import models, fields 

 


class circuits(models.Model):
    _inherit='is_decoupage.circuits'

    def get_collecte_and_lavage(self):
        """
        
        """
        functions_id = self.search_read(
            [('fonction_id.name', 'ilike', 'collecte'), ('fonction_id.name', 'ilike', 'collecte')],
            ['id', 'name', 'frequence_id','methode_id','Secteur', 'fonction_id','group']
            )
        print('*************-*-*-*-*-----------------------')
        print(functions_id)
        return functions_id#self.env['is_decoupage.circuits'].search_read(['fonction_id', 'in', functions_id],[])
    def get(self, id):
        query= """
            SELECT 
                public.is_decoupage_routes.id,
                st_astext(public.is_decoupage_routes.geom) as geom,
                public.is_decoupage_routes.gshape_name,
                public.is_bav_frequences.name as frequence,
                public.is_bav_frequences.nbrh,
                public.is_decoupage_circuits."Secteur",
                public.is_decoupage_circuits.color,
                public.is_decoupage_circuits.name as circuit,
                public.fleet_vehicle_fonction.name as fonction
            FROM
                public.is_decoupage_circuits
                INNER JOIN public.is_decoupage_circuit_route_rel ON (public.is_decoupage_circuits.id = public.is_decoupage_circuit_route_rel.circuit_id)
                INNER JOIN public.is_decoupage_routes ON (public.is_decoupage_circuit_route_rel.route_id = public.is_decoupage_routes.id)
                INNER JOIN public.is_bav_frequences ON (public.is_decoupage_circuits.frequence_id = public.is_bav_frequences.id)
                INNER JOIN public.fleet_vehicle_fonction ON (public.is_decoupage_circuits.fonction_id = public.fleet_vehicle_fonction.id)
            WHERE 
                public.is_decoupage_circuits.id = {}
        """.format(id)
        print(query)
        self.env.cr.execute(query)
        res = self.env.cr.dictfetchall()
        return res