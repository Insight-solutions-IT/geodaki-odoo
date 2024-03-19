
from odoo import models, fields 


    

class Bacs(models.Model):
    _inherit = "is_bav.bacs"

    def getall(self, t):
        # print("***************************************************************")
        # print(t)
        query = """
            SELECT 
                public.is_bav_bacs.numero,
                public.is_bav_bacs.adresse,
                public.is_bav_bacs.marker_color,
                fl.name AS freqlavage,
                fc.name AS freqcollecte,
                public.is_bav_marque.name AS marque,
                public.is_bav_bacs.categorie,
                public.is_bav_bacs.color,
                public.is_bav_bacs.datems,
                public.is_bav_types.name,
                public.is_bav_types.img_red,
                public.is_bav_types.img_green,
                public.is_bav_types.img_gris,
                public.is_bav_types.img_mauve,
                public.is_bav_types.img_bleu,
                public.is_bav_types.capacite,
                public.is_bav_bacs.lastlatitude,
                public.is_bav_bacs.lastlongitude,
                public.is_bav_bacs.latitude,
                public.is_bav_bacs.longitude,
                public.is_bav_bacs.fixpos,
                public.is_bav_bacs."lastupdateRFID" AS lastupdate

                
            FROM
                public.is_bav_bacs
                INNER JOIN public.is_bav_frequences fl ON (public.is_bav_bacs.freqlavage = fl.id)
                INNER JOIN public.is_bav_frequences fc ON (public.is_bav_bacs.freqcollecte = fc.id)
                INNER JOIN public.is_bav_marque ON (public.is_bav_bacs.marque = public.is_bav_marque.id)
                INNER JOIN public.is_bav_types ON (public.is_bav_bacs.is_bav_type_id = public.is_bav_types.id)
            WHERE
                public.is_bav_bacs.active = true
                AND lower(public.is_bav_types.name) LIKE '%{}%'
            order by latitude asc
        """.format(t)
        # print(query)
        # print("*********************************************************************************")
        self.env.cr.execute(query)
        results = self.env.cr.dictfetchall()
        return results

    def getByZone(self,id_z, t):
        # print("********************************-----------------*******************************")
        # print(t)
        query = """
            SELECT 
                public.is_bav_bacs.numero,
                public.is_bav_bacs.adresse,
                public.is_bav_bacs.marker_color,
                fl.name AS freqlavage,
                fc.name AS freqcollecte,
                public.is_bav_marque.name AS marque,
                public.is_bav_bacs.categorie,
                public.is_bav_bacs.color,
                public.is_bav_bacs.datems,
                public.is_bav_types.name,
                public.is_bav_types.img_red,
                public.is_bav_types.img_green,
                public.is_bav_types.img_gris,
                public.is_bav_types.img_mauve,
                public.is_bav_types.img_bleu,
                public.is_bav_types.capacite,
                public.is_bav_bacs.lastlatitude,
                public.is_bav_bacs.lastlongitude,
                public.is_bav_bacs.latitude,
                public.is_bav_bacs.longitude,
                public.is_bav_bacs.fixpos

                
            FROM
                public.is_bav_bacs
                INNER JOIN public.is_bav_frequences fl ON (public.is_bav_bacs.freqlavage = fl.id)
                INNER JOIN public.is_bav_frequences fc ON (public.is_bav_bacs.freqcollecte = fc.id)
                INNER JOIN public.is_bav_marque ON (public.is_bav_bacs.marque = public.is_bav_marque.id)
                INNER JOIN public.is_bav_types ON (public.is_bav_bacs.is_bav_type_id = public.is_bav_types.id),
				is_decoupage deco     
            WHERE   
				deco.id = {}  and 
				st_contains(deco.geom, st_setsrid(st_makepoint(is_bav_bacs.longitude,is_bav_bacs.latitude), 4326)) and 
                public.is_bav_bacs.active = true
                AND lower(public.is_bav_types.name) LIKE '%{}%'
        """.format(id_z, t)
        # print(query)
        # print("*********************************************************************************")
        self.env.cr.execute(query)
        results = self.env.cr.dictfetchall()
        return results

    def get(self, type):
        query="""

        """