# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
from psycopg2 import sql

from odoo import tools
from odoo import api, fields, models


class TauxTrView(models.Model):
    _name = "is_taux.taux_tr"
    _description = "Taux tr view"
    _auto = False 

    def init(self): 
        new_query = """
            SELECT taux_tr_h.route,
                taux_tr_h.datej,
                taux_tr_h.dh,
                taux_tr_h.pl,
                taux_tr_h.circuit,
                taux_tr_h.vehicule, 
                taux_tr_h.li,
                st_length(routes.geom::geography, true) AS lt,
                taux_tr_h.methode,
                    CASE
                        WHEN st_length(routes.geom::geography, true) >= 1::double precision THEN
                        CASE
                            WHEN (taux_tr_h.li / st_length(routes.geom::geography, true) * 100::double precision) <= 100::double precision THEN taux_tr_h.li /
                                st_length(routes.geom::geography, true) * 100::double precision
                            ELSE 100::double precision
                        END
                        ELSE 0::double precision
                    END AS taux
            FROM public.is_taux_taux  taux_tr_h
                JOIN public.is_decoupage_circuit_route_rel "CIRCUIT_DET2" ON taux_tr_h.route = "CIRCUIT_DET2".id
                JOIN is_decoupage_routes routes ON "CIRCUIT_DET2".route_id = routes.id
                     """

        # Drop the existing view if it exists
        tools.drop_view_if_exists(self.env.cr, self._table)
        # Create or replace the view with the new query
        self.env.cr.execute(
            sql.SQL("CREATE or REPLACE VIEW {} as ({})").format(sql.Identifier(self._table), sql.SQL(new_query))
        )
