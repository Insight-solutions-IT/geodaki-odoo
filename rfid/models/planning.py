# -*- coding: utf-8 -*-

from odoo import models, fields 


 

class Planning(models.Model):
    _inherit='is_planning.is_planning'

    def get_vhicle_by_idcir(self, idcir, start, end):
        print("planiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiing")
        query = """
            SELECT 
                public.fleet_vehicle.id,
                public.fleet_vehicle.device,
                public.is_planning_is_planning.datej,
                public.is_decoupage_circuits.name,
                public.is_decoupage_circuits."Secteur",
                public.is_bav_frequences.nbrh,
                public.is_bav_frequences.name,
                public.is_decoupage_circuits.color
            FROM
                public.is_decoupage_circuits
                INNER JOIN public.is_planning_is_planning ON (public.is_decoupage_circuits.id = public.is_planning_is_planning.circuitid)
                INNER JOIN public.fleet_vehicle ON (public.is_planning_is_planning.deviceid = public.fleet_vehicle.id)
                INNER JOIN public.is_bav_frequences ON (public.is_decoupage_circuits.frequence_id = public.is_bav_frequences.id)
            WHERE 
                public.is_planning_is_planning.circuitid = {} and public.is_planning_is_planning.datej between '{}'::date and '{}'::date
        """.format(idcir, start, end)
        # print("planing script : {}".format(query))
        self.env.cr.execute(query)
        res = self.env.cr.dictfetchall()
        return res

    def get_for(self, id, _from, _to):
        query="""
            SELECT 
                public.is_planning_is_planning.deviceid,
                public.is_planning_is_planning.circuitid,
                public.is_planning_is_planning.driver,
                public.is_planning_is_planning.datej,
                public.is_planning_is_planning.hdeb,
                public.is_planning_is_planning.hfin,
                public.is_decoupage_circuits.name
            FROM
                public.is_planning_is_planning
                INNER JOIN public.is_decoupage_circuits ON (public.is_planning_is_planning.circuitid = public.is_decoupage_circuits.id)
            WHERE public.is_planning_is_planning.deviceid = {} and   public.is_planning_is_planning.datej between '{}'::date and '{}'::date
        """.format(id, _from, _to)

        self.env.cr.execute(query)
        res = self.env.cr.dictfetchall()
        return res
    
    def getFor2(self, id, _from):
        query="""
            SELECT 
                public.is_planning_is_planning.deviceid,
                public.is_planning_is_planning.circuitid,
                public.is_planning_is_planning.driver,
                public.is_planning_is_planning.datej,
                public.is_planning_is_planning.hdeb,
                public.is_planning_is_planning.hfin,
                public.is_decoupage_circuits.name
            FROM
                public.is_planning_is_planning
                INNER JOIN public.is_decoupage_circuits ON (public.is_planning_is_planning.circuitid = public.is_decoupage_circuits.id)
            WHERE public.is_planning_is_planning.deviceid = {} and   public.is_planning_is_planning.datej = '{}'::date
        """.format(id, _from)

        self.env.cr.execute(query)
        res = self.env.cr.dictfetchall()
        return res