#-*- coding: utf-8 -*-

from odoo import models, fields, api


class circuit(models.Model):
    _inherit =  "is_planning.is_planning"

    def getPlanningHistorique(self,idd,date1,date2):     
        #circuits = self.env['is_planning.is_planning'].search_read([("circuitid", "=", idd),("datej", ">=", date1), ("datej", "<=", date2)],[])
        new_query = """
            SELECT * FROM public.is_planning_is_planning
            where circuitid = {} and datej between '{}' and '{}'
        """
 
        self.env.cr.execute(new_query.format(idd,date1,date2))
        
        results = self.env.cr.dictfetchall()
        return results
        
    def getPlanningHistoriqueVehicle(self,idd,date1,date2):     
        #v = self.env['is_planning.is_planning'].search_read([("deviceid", "=", idd),("datej", ">=", date1), ("datej", "<=", date2)],[])
        new_query = """
            SELECT * FROM public.is_planning_is_planning
            where deviceid = {} and datej between '{}' and '{}' and hdeb is not null and hfin is  not null
        """
 
        self.env.cr.execute(new_query.format(idd,date1,date2))
        
        results = self.env.cr.dictfetchall()
        return results

class circuit_det(models.Model):
    _inherit = "is_decoupage.circuits"
    

    def getCircuits_det2Historique(self,idd):     
        circuits = self.env['is_decoupage.circuits'].search_read([("id", "=", idd)],[])
        return circuits
    
    def get_circuit_isdecoupageHisto(self):
        
        new_query = """
        SELECT c.id ,g.name as groupName,c.name as name , "Secteur" , c.color , f.name as fonName , c.group ,fr.name as freName
        FROM public.is_decoupage_circuits c
        left join public.fleet_vehicle_group g on c.group = g.id
        left join public.fleet_vehicle_fonction f on f.id = c.fonction_id
        left join public.is_bav_frequences fr on c.frequence_id = fr.id
        """
 
        self.env.cr.execute(new_query)
        
        results = self.env.cr.dictfetchall()
        return results

class routeHistorique(models.Model):
    _inherit =  "is_decoupage.routes"
   

    def getRoutes(self,idd):     
        routes = self.env['is_decoupage.routes'].search_read([("id", "=", idd)],[])
        return routes
    
    def getResult(self,idd, date1,date2):
        
        new_query = """
        SELECT distinct 
        c.id,
        c."Secteur",
        c.color,
        c.name,
        st_astext(r.geom::text) AS geom
        FROM public.is_decoupage_circuits c 
        JOIN public.is_decoupage_circuit_route_rel cd ON c.id = cd.circuit_id 
        JOIN public.is_decoupage_routes r ON cd.route_id = r.id 
        JOIN public.is_bav_frequences f ON c.frequence_id = f.id
        where c.id in  (select circuitid from public.is_planning_is_planning
        where circuitid = {} and datej between '{}'::date and '{}'::date)
        """
 
        self.env.cr.execute(new_query.format(idd,date1, date2))
        
        results = self.env.cr.dictfetchall()
        return results


# class circuit(models.Model):
#     _inherit =  "is_planning.is_planning"
    

#     # name = fields.Char("Nom du Circuit")
#     # groupid = fields.Many2one("fleet.vehicle.group", string="Group", required=True,domain="[]")
#     # centlat = fields.Float("Latitude de Centre du circuit")
#     # centlon = fields.Float("Longitude de Centre du circuit")
#     # longueur = fields.Float("Longueur du circuit")
#     # secteur = fields.Char("Secteur")
#     # nature = fields.Char("La nature")
#     # metcalctaux = fields.Char("metcalctaux")

#     # def getCircuitsByFonction(self): 
#     #     #fonctions = self.env["is_rfid.fonctions"].search([("name", "in", fonction_names)])
#     #     domain = [("fonction", "in", fonctions)]
#     #     circuits = self.env['is_rfid.circuit'].search_read([('fonction', 'in' ,['Collecte des Bacs'])],[])
#     #     return circuits
    
#     def getCircuits(self): 
#         #fonctions = self.env["is_rfid.fonctions"].search([("name", "in", fonction_names)])
        
#         circuits = self.env['is_rfid.circuit'].search_read([],[])
#         # circuits = self.env['is_rfid.circuit'].search_read([('fonction', 'in' ,['Collecte des Bacs'])],[])
#         return circuits
