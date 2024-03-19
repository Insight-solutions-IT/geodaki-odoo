from odoo import models, fields, api


class IsDecoupageCircuits(models.Model):
    _inherit = 'is_decoupage'


    def getZonesBYName(self,name):
        query = """
          SELECT
            gshape_name,
            gshape_type,
            gshape_paths,
            st_asText(st_centroid(geom)) as center,
            st_astext(geom) AS geom
          FROM public.is_decoupage
          where gshape_name=%s
    
        """
        self.env.cr.execute(query, (name,))
        result = self.env.cr.dictfetchall()
        
        return result
    
    def getZones(self):
        query = """
          SELECT
          gshape_name,
          gshape_type,
          gshape_paths,
		  st_asText(st_centroid(geom)) as center,
    st_astext(geom) AS geom
   FROM public.is_decoupage
	
    
        """
        self.env.cr.execute(query)
        result = self.env.cr.dictfetchall()
        
        return result