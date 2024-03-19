# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
import json

class IsDecoupage(http.Controller):
    @http.route('/is_decoupage/is_decoupage', auth='public')
    def index(self, **kw):
        return "Hello, world"

    @http.route('/is_decoupage/is_decoupage/circuits', auth='public')
    def list(self, **kw):
        teachers_rec = request.env["is_decoupage.circuits"].search_read([])
        
        
        return str(teachers_rec)
    
    @http.route('/is_decoupage/is_decoupage/circuitname', auth='public')
    def list3(self,name, **kw):
        # teachers_rec = request.env["is_decoupage.circuits"].search_read([("name","=",name)],[])
        query = """
            SELECT *
            FROM public.is_decoupage_circuits c
            
            WHERE c.name = %s
        """
        http.request.env.cr.execute(query, (name,))
        results = http.request.env.cr.fetchall()


        return str(results)
    

    @http.route('/is_decoupage/is_decoupage/dessinecircuitname', auth='public')
    def list2(self, name, **kw):
        query = """
            SELECT distinct r.id as id,
                c.name,
                'Secteur' as secteur,
                c.color,
                st_astext(r.geom) AS geom
            FROM public.is_decoupage_circuits c
            JOIN public.is_decoupage_circuit_route_rel cd ON c.id = cd.circuit_id
            JOIN public.is_decoupage_routes r ON cd.route_id = r.id
            WHERE c.name = %s
        """



    
        http.request.env.cr.execute(query, (name,))
        results = http.request.env.cr.fetchall()
        
        circuits = []
        for result in results:
            circuit_id, circuit_name, circuit_type, circuit_color, multiline_string = result
            vals = {
                'id': circuit_id,
                'name': circuit_name,
                'secteur': circuit_type,
                'color': circuit_color,
                'geom': multiline_string,    
            }
            circuits.append(vals)
        
        return json.dumps(
            # {'circuits':
                            circuits
                            # }
                            )


#     @http.route('/is_decoupage/is_decoupage/objects/<model("is_decoupage.is_decoupage"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('is_decoupage.object', {
#             'object': obj
#         })



# class IsDecoupage(http.Controller):
#     @http.route('/is_decoupage/is_decoupage/circuit_by_name1', type='json', auth='public', methods=['GET'])
#     def get_circuits(self):
#         try:

#             result=self.env["is_decoupage.circuits"].getCircuits(self)

#             response_data = json.dumps(result)

            
#             return http.request.make_response(response_data, headers=[('Content-Type', 'application/json')])

#         except Exception as e:
#             return str(e)
    
#     @http.route('/is_decoupage/is_decoupage/circuit_by_name2',website=True, auth='public', csrf=False )
#     def get_all_teachers(self,**kw):
#         return "hala bilkhomos"
    

#     @http.route('/is_decoupage/is_decoupage/circuit_by_name', auth='public', csrf=False )
#     def get_all_teachers(self,**kw):
#         # get all teachers
#         teachers_rec = request.env["is_decoupage.circuits"].search([])
#         teachers = []
#         for rec in teachers_rec:
            
#             vals = {
#                 'id': rec.id,
#                 'name': rec.name,
#                 'frequence_id': rec.frequence_id.name,
#                 'fonction_id': rec.fonction_id.name,
#                 'methode_id': rec.methode_id.name,
#                 'group': rec.group.name,
#                 'Secteur': rec.Secteur,
#                 'color': rec.color,
                
#             }
#             teachers.append(vals)
#         data = {
#             'status': "200",
#             'message': "success",
#             'response': teachers,
#         }
#         return "<h1>"+data+"</h1>"
