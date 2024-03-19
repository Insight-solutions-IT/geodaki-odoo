from odoo import api, fields, models, _
from odoo.exceptions import UserError
from datetime import datetime
from datetime import datetime, timedelta



# class Queriespram(models.Model):
#     _name = 'queriespramwiz'
#     _description = "params for queries"
#     name = fields.Text(string='Query')
#     label = fields.Text(string="label")
#     valeur = fields.Text(string="valeur")
#     param = fields.Text(string="param")

#     query_id = fields.Many2one('displayquery', string='query id')




class Displayquery(models.Model):
    _name = 'is_planning.execute_planing'
    _description = "executePlaning"

    # d1 = fields.Date(string="Date Début", default=fields.Date.today)
    # d2 = fields.Date(string="Date Fin", default=fields.Date.today)
    dateDebut=fields.Date("Date debut")
    dateFin=fields.Date("Date fin")





    def get_all_mondays(start_date, end_date):
        start_datetime = datetime.strptime(start_date, "%Y-%m-%d")
        end_datetime = datetime.strptime(end_date, "%Y-%m-%d")
        
        current_datetime = start_datetime

        while current_datetime <= end_datetime:
            if current_datetime.weekday() == 0:  # Monday has a weekday index of 0
                print(current_datetime.strftime("%Y-%m-%d"))

            current_datetime += timedelta(days=1)

 
    # @api.model
    # def create(self, values):
    #     # Create the wizard record
    #     wizard_record = super(Displayquery, self).create(values)

    #     # Get values from default_params2
    #     default_params2_values = self._context.get('default_params2', [])

    #     # Create queriespram records based on default_params2 values
    #     queriespram_values = []
    #     for param_value in default_params2_values:
    #         queriespram_values.append({
    #             'name': param_value.get('name', ''),
    #             'label': param_value.get('label', ''),
    #             'valeur': param_value.get('valeur', ''),
    #             'query_id': wizard_record.query_id.id,
    #         })

    #     self.env['queriespramwiz'].create(queriespram_values)

    #     return wizard_record
    

    # @api.model
    # def create(self, values):
    #     # Create the wizard record
    #     wizard_record = super(Queriespramwiz, self).create(values)

    #     # Get values from default_params2
    #     default_params2_values = self._context.get('default_params2', [])

    #     # Create queriespramwiz records based on default_params2 values
    #     queriespramwiz_values = []
    #     for param_value in default_params2_values:
    #         queriespramwiz_values.append({
    #             'name': param_value.get('name', ''),
    #             'label': param_value.get('label', ''),
    #             'valeur': param_value.get('valeur', ''),
    #             'query_id': wizard_record.query_id.id,
    #         })

    #     self.env['queriespramwiz'].create(queriespramwiz_values)

    #     return wizard_record

    # @api.model
    # def default_get(self, fields_list):
    #     res = super(Displayquery, self).default_get(fields_list)
       
    #     default_queryids_values = []
    #     default_params2 = self.env.context.get('default_params2', [])
    #     default_chart = self.env.context.get('default_chart')
       
    #     for id in default_params2:

    #         params = self.env['queriespram'].search_read([("query_id","=", id)], [])
    #     # Default values for the One2many field 'queryids'
        
    #         for param in params:
    #             default_queryids_values.append((0, 0, {
    #                 'param': param.get('param', ''),
    #                 'label': param.get('label', ''),
    #                 'valeur': param.get('valeur', ''),
    #             }))

    #     res.update({'queryids': default_queryids_values})
    #     res.update({'chart': default_chart})

    #     return res


    # @api.onchange('queryids')
    # def onchange_queryids(self):
    #     # Access the values of the One2many field before they are stored
    #     for param1 in self.queryids:
    #         param = param1.name
    #         label = param1.label
    #         valeur = param1.valeur

    #         # Update queriespram records based on the matching name and label
    #         query = """
    #         UPDATE queriespram SET valeur = %s WHERE query_id = %s  AND label = %s
    #         """
    #         print("param: {}, Label: {}, Valeur: {}".format(param, label, valeur))

    #         if valeur is not False:
    #             # Assuming that default_params2 is a list of IDs
    #             for default_param_id in self.env.context.get('default_params2', []):
    #                 self.env.cr.execute(query, (valeur, default_param_id, label))
    #         else:
    #             print("111")


    def execute1(self):
        default_params2 = self.env.context.get('default_active_ids', [])
        print("defaulttttttttttttttttttttttttttttt" + str(default_params2))
        debut_value = self.dateDebut
        fin_value = self.dateFin
        current_datetime = debut_value


        query1 = """
          INSERT INTO public.is_planning_is_planning(
	 deviceid, circuitid, driver, driver2 ,datej, hdeb, hfin)
	VALUES (%s, %s, %s, %s, %s::date, %s::timestamp, %s::timestamp);
        """
       
        # result = self.env.cr.dictfetchall()
        query2 = """
          select * from public.is_planning_planning_val where id= ?;
        """
        
        # self.env.cr.execute(query, (valeur, default_param_id, label))
        

        for record in default_params2:
            current_datetime = debut_value
            orPlaning = self.env['is_planning.planning_val'].search_read([("id","=", record)], [])
            print("vaaaaaaaaaaaaaal" + str(orPlaning[0]))
            while current_datetime <= fin_value:
                if current_datetime.weekday() == 0 and orPlaning[0]['deviceid_l']!=False :  # Monday has a weekday index of 0
                    print(current_datetime.strftime("%Y-%m-%d"))
                    formatted_datetimedeb = orPlaning[0]['hdeb_l']
                    time_deb = datetime.strptime(formatted_datetimedeb, "%H:%M:%S").time()
                # Split to get time part
                    #time_onlydeb = formatted_datetimedeb.split(' ')[1]


                    formatted_datetimefin = orPlaning[0]['hfin_l']
                    time_fin = datetime.strptime(formatted_datetimefin, "%H:%M:%S").time()
                # Split to get time part
                    #time_onlyfin = formatted_datetimedeb.split(' ')[1]
                    next_day=current_datetime

                    if time_deb > time_fin:
                        next_day += timedelta(days=1)




                    self.env.cr.execute(query1, (orPlaning[0]['deviceid_l'][0], orPlaning[0]['circuitid'][0], orPlaning[0]['driver_l'][0],orPlaning[0]['driver2_l'][0],current_datetime.strftime("%Y-%m-%d"),current_datetime.strftime("%Y-%m-%d")+" "+formatted_datetimedeb,next_day.strftime("%Y-%m-%d")+" "+formatted_datetimefin,))
                if current_datetime.weekday() == 1 and orPlaning[0]['deviceid_mar']!=False  :  # Monday has a weekday index of 0
                    print(current_datetime.strftime("%Y-%m-%d"))
                    formatted_datetimedeb = orPlaning[0]['hdeb_mar']
                    time_deb = datetime.strptime(formatted_datetimedeb, "%H:%M:%S").time()
                # Split to get time part
                    #time_onlydeb = formatted_datetimedeb.split(' ')[1]


                    formatted_datetimefin = orPlaning[0]['hfin_mar']
                    time_fin = datetime.strptime(formatted_datetimefin, "%H:%M:%S").time()
                # Split to get time part
                    #time_onlyfin = formatted_datetimedeb.split(' ')[1]
                    next_day=current_datetime

                    if time_deb > time_fin:
                        next_day += timedelta(days=1)




                    self.env.cr.execute(query1, (orPlaning[0]['deviceid_mar'][0], orPlaning[0]['circuitid'][0], orPlaning[0]['driver_mar'][0],orPlaning[0]['driver2_mar'][0],current_datetime.strftime("%Y-%m-%d"),current_datetime.strftime("%Y-%m-%d")+" "+formatted_datetimedeb,next_day.strftime("%Y-%m-%d")+" "+formatted_datetimefin,))
                if current_datetime.weekday() == 2 and orPlaning[0]['deviceid_mer']!=False:  # Monday has a weekday index of 0
                    print(current_datetime.strftime("%Y-%m-%d"))
                    formatted_datetimedeb = orPlaning[0]['hdeb_mer']
                    time_deb = datetime.strptime(formatted_datetimedeb, "%H:%M:%S").time()
                # Split to get time part
                    #time_onlydeb = formatted_datetimedeb.split(' ')[1]


                    formatted_datetimefin = orPlaning[0]['hfin_mer']
                    time_fin = datetime.strptime(formatted_datetimefin, "%H:%M:%S").time()
                # Split to get time part
                    #time_onlyfin = formatted_datetimedeb.split(' ')[1]
                    next_day=current_datetime

                    if time_deb > time_fin:
                        next_day += timedelta(days=1)




                    self.env.cr.execute(query1, (orPlaning[0]['deviceid_mer'][0], orPlaning[0]['circuitid'][0], orPlaning[0]['driver_mer'][0],orPlaning[0]['driver2_mer'][0],current_datetime.strftime("%Y-%m-%d"),current_datetime.strftime("%Y-%m-%d")+" "+formatted_datetimedeb,next_day.strftime("%Y-%m-%d")+" "+formatted_datetimefin,))
                if current_datetime.weekday() == 3 and orPlaning[0]['deviceid_j']!=False :  # Monday has a weekday index of 0
                    print(current_datetime.strftime("%Y-%m-%d"))
                    formatted_datetimedeb = orPlaning[0]['hdeb_j']
                    time_deb = datetime.strptime(formatted_datetimedeb, "%H:%M:%S").time()
                # Split to get time part
                    #time_onlydeb = formatted_datetimedeb.split(' ')[1]


                    formatted_datetimefin = orPlaning[0]['hfin_j']
                    time_fin = datetime.strptime(formatted_datetimefin, "%H:%M:%S").time()
                # Split to get time part
                    #time_onlyfin = formatted_datetimedeb.split(' ')[1]
                    next_day=current_datetime

                    if time_deb > time_fin:
                        next_day += timedelta(days=1)




                    self.env.cr.execute(query1, (orPlaning[0]['deviceid_j'][0], orPlaning[0]['circuitid'][0], orPlaning[0]['driver_j'][0],orPlaning[0]['driver2_j'][0],current_datetime.strftime("%Y-%m-%d"),current_datetime.strftime("%Y-%m-%d")+" "+formatted_datetimedeb,next_day.strftime("%Y-%m-%d")+" "+formatted_datetimefin,))
                if current_datetime.weekday() == 4 and orPlaning[0]['deviceid_v']!=False:  # Monday has a weekday index of 0
                    print(current_datetime.strftime("%Y-%m-%d"))
                    formatted_datetimedeb = orPlaning[0]['hdeb_v']
                    time_deb = datetime.strptime(formatted_datetimedeb, "%H:%M:%S").time()
                # Split to get time part
                    #time_onlydeb = formatted_datetimedeb.split(' ')[1]


                    formatted_datetimefin = orPlaning[0]['hfin_v']
                    time_fin = datetime.strptime(formatted_datetimefin, "%H:%M:%S").time()
                # Split to get time part
                    #time_onlyfin = formatted_datetimedeb.split(' ')[1]
                    next_day=current_datetime

                    if time_deb > time_fin:
                        next_day += timedelta(days=1)




                    self.env.cr.execute(query1, (orPlaning[0]['deviceid_v'][0], orPlaning[0]['circuitid'][0], orPlaning[0]['driver_v'][0],orPlaning[0]['driver2_v'][0],current_datetime.strftime("%Y-%m-%d"),current_datetime.strftime("%Y-%m-%d")+" "+formatted_datetimedeb,next_day.strftime("%Y-%m-%d")+" "+formatted_datetimefin,))
                if current_datetime.weekday() == 5 and orPlaning[0]['deviceid_s']!=False:  # Monday has a weekday index of 0
                    print(current_datetime.strftime("%Y-%m-%d"))
                    formatted_datetimedeb = orPlaning[0]['hdeb_s']
                    time_deb = datetime.strptime(formatted_datetimedeb, "%H:%M:%S").time()
                # Split to get time part
                    #time_onlydeb = formatted_datetimedeb.split(' ')[1]


                    formatted_datetimefin = orPlaning[0]['hfin_s']
                    time_fin = datetime.strptime(formatted_datetimefin, "%H:%M:%S").time()
                # Split to get time part
                    #time_onlyfin = formatted_datetimedeb.split(' ')[1]
                    next_day=current_datetime

                    if time_deb > time_fin:
                        next_day += timedelta(days=1)




                    self.env.cr.execute(query1, (orPlaning[0]['deviceid_s'][0], orPlaning[0]['circuitid'][0], orPlaning[0]['driver_s'][0],orPlaning[0]['driver2_s'][0],current_datetime.strftime("%Y-%m-%d"),current_datetime.strftime("%Y-%m-%d")+" "+formatted_datetimedeb,next_day.strftime("%Y-%m-%d")+" "+formatted_datetimefin,))
                if current_datetime.weekday() == 6  and orPlaning[0]['deviceid_d']!=False :  # Monday has a weekday index of 0
                    print(current_datetime.strftime("%Y-%m-%d"))
                    formatted_datetimedeb = orPlaning[0]['hdeb_d']
                    time_deb = datetime.strptime(formatted_datetimedeb, "%H:%M:%S").time()
                # Split to get time part
                    #time_onlydeb = formatted_datetimedeb.split(' ')[1]


                    formatted_datetimefin = orPlaning[0]['hfin_d']
                    time_fin = datetime.strptime(formatted_datetimefin, "%H:%M:%S").time()
                # Split to get time part
                    #time_onlyfin = formatted_datetimedeb.split(' ')[1]
                    next_day=current_datetime

                    if time_deb > time_fin:
                        next_day += timedelta(days=1)




                    self.env.cr.execute(query1, (orPlaning[0]['deviceid_d'][0], orPlaning[0]['circuitid'][0], orPlaning[0]['driver_d'][0],orPlaning[0]['driver2_d'][0],current_datetime.strftime("%Y-%m-%d"),current_datetime.strftime("%Y-%m-%d")+" "+formatted_datetimedeb,next_day.strftime("%Y-%m-%d")+" "+formatted_datetimefin,))

                current_datetime += timedelta(days=1)

        # try:
        #     self.env.cr.execute(resultquery, (self.env.context.get('default_id'),))
        #     first_query_result = self.env.cr.fetchall()
        # except Exception as e:
            
        #     raise UserError(f"Error executing query: {e}")
        
    
        # for row in first_query_result:
        #     result_params = {
        #         'name'  :  row[0],
        #         'sequence'  :  row[1],
        #         'label'  :  row[2],
        #         'param'  :  row[3],
        #         'valeur'  :  row[4],
        #         'typeparams'  :  row[5]
        #     }

    
        # print(result_params)
    

        # if self.query_name:
        #     # formatted_d1 = self.d1.strftime('%Y-%m-%d')
        #     # formatted_d2 = self.d2.strftime('%Y-%m-%d')


        #     if 'where'  in self.query_name.lower():
        #         # query = self.query_name + f" datej between '{formatted_d1}' and '{formatted_d2}'"
        #         query = self.query_name
        #     else:
        #         query = self.query_name

        #     # querywhere = """
        #     #         update  querydeluxe set name = %s  where id = %s
       
        #     #         """
        #     # self.env.cr.execute(querywhere , (query,self.env.context.get('default_id') ))



        #     # if first_query_result:
        #     #     name_value = first_query_result[0]  
        #     #     print(name_value)
        #     #     print('**************tttttttttt*********************', name_value)
         
           
        #     # else:
           
        #     #     print("No result found for the first query")


        #     headers = []
        #     datas = []

        #     # print('**************tttttttttt*********************'  ,self.test)


        #     try:
        #         self.env.cr.execute(self.query_name)
        #     except Exception as e:
        #         raise UserError(e)

        #     try:
        #         if self.env.cr.description:
        #             headers = [d[0] for d in self.env.cr.description]
        #             datas = self.env.cr.fetchall()
        #     except Exception as e:
        #         raise UserError(e)

        #     rowcount = self.env.cr.rowcount
        #     self.rowcount = _("{0} row{1} processed").format(rowcount, 's' if 1 < rowcount else '')
    
        #     queryrow = """
        #             update  querydeluxe set rowcount = %s  where id = %s
       
        #             """
        #     self.env.cr.execute(queryrow , (self.rowcount, self.env.context.get('default_id') ))

        #     # print("***************" ,headers)
        #     # print("***************" ,datas)

        #     if headers:
        #         self.raw_output = datas

        #         header_html = "<tr style='background-color: lightgrey'> <th style='background-color:white'/>"
        #         header_html += "".join(["<th style='border: 1px solid black'>" + str(header) + "</th>" for header in headers])
        #         header_html += "</tr>"

        #         body_html = ""
        #         i = 0
        #         for data in datas:
        #             i += 1
        #             body_line = "<tr style='background-color: {0}'> <td style='border-right: 3px double; border-bottom: 1px solid black; background-color: yellow'>{1}</td>".format('cyan' if i%2 == 0 else 'white', i)
        #             for value in data:
        #                 display_value = ''
        #                 if value is not None:
        #                     display_value = str(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        #                 body_line += "<td style='border: 1px solid black'>{0}</td>".format(display_value)
        #             body_line += "</tr>"
        #             body_html += body_line

        #         self.html = """
        #         <table style="text-align: center">
        #         <thead>
        #             {0}
        #         </thead>

        #         <tbody>
        #             {1}
        #         </tbody>
        #         </table>
        #         """.format(header_html, body_html)
               
          
        #         query = """
        #             update  querydeluxe set html = %s  where id = %s
        #             """
                
        #         self.env.cr.execute(query , (self.html,self.env.context.get('default_id')))
        #         # result = self.env.cr.dictfetchall()
        #         print( '************************/////////******************************' ,self.env.context.get('default_params2'))
                    
                  


        #         return {
        #             'name': _('Return lines'),
        #             'view_type': 'form',
        #             'view_mode': 'form',
        #             'res_id': self.env.context.get('default_id'),
        #             'view_id': self.env.ref('query_deluxe.query_deluxe_view_form').id,
        #             'res_model': 'querydeluxe',
        #             'type': 'ir.actions.act_window',
        #             'target': 'current',
        #         }

   
   


    def execute(self):
            
            params=[]

            for param1 in self.queryids:
                label = param1.label
                valeur = param1.valeur

                params.append( {
                   
                    'label':label,
                    'valeur': valeur,
                })


                print(params)
            return {
                'type': 'ir.actions.client',
                'tag': 'action_query_execution',  # Replace with the actual tag of your Owl view
                'context': {
                    'default_params': params,
                    'default_query': self.query_name,
                },
            }