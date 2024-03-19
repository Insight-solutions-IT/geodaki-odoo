from odoo import api, fields, models, _
from odoo.exceptions import UserError
from datetime import datetime



class Queriespram(models.Model):
    _name = 'queriespramwiz'
    _description = "params for queries"
    name = fields.Text(string='Query')
    label = fields.Text(string="label")
    valeur = fields.Text(string="valeur")
    param = fields.Text(string="param")

    query_id = fields.Many2one('displayquery', string='query id')




class Displayquery(models.Model):
    _name = 'displayquery'
    _description = "displayqueryyy"

    # d1 = fields.Date(string="Date Début", default=fields.Date.today)
    # d2 = fields.Date(string="Date Fin", default=fields.Date.today)
    show_raw_output = fields.Boolean(string='Show the raw output of the query')
    raw_output = fields.Text(string='Raw output')
    rowcount = fields.Text(string='Rowcount')
    html = fields.Html(string='HTML')
    query_name = fields.Text(string="Query")
    filter =  fields.Selection([('Oui', 'oui'), ('Non', 'non')], default='Oui')
    queryids = fields.One2many('queriespramwiz', 'query_id', string='parametre')
    params = fields.Text(string='params')
    chart = fields.Boolean(string="chart")


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

    @api.model
    def default_get(self, fields_list):
        res = super(Displayquery, self).default_get(fields_list)
       
        default_queryids_values = []
        default_params2 = self.env.context.get('default_params2', [])
        default_chart = self.env.context.get('default_chart')
       
        for id in default_params2:

            params = self.env['queriespram'].search_read([("query_id","=", id)], [])
        # Default values for the One2many field 'queryids'
        
            for param in params:
                default_queryids_values.append((0, 0, {
                    'param': param.get('param', ''),
                    'label': param.get('label', ''),
                    'valeur': param.get('valeur', ''),
                }))

        res.update({'queryids': default_queryids_values})
        res.update({'chart': default_chart})

        return res


    @api.onchange('queryids')
    def onchange_queryids(self):
        # Access the values of the One2many field before they are stored
        for param1 in self.queryids:
            param = param1.name
            label = param1.label
            valeur = param1.valeur

            # Update queriespram records based on the matching name and label
            query = """
            UPDATE queriespram SET valeur = %s WHERE query_id = %s  AND label = %s
            """
            # print("param: {}, Label: {}, Valeur: {}".format(param, label, valeur))

            if valeur is not False:
                # Assuming that default_params2 is a list of IDs
                for default_param_id in self.env.context.get('default_params2', []):
                    self.env.cr.execute(query, (valeur, default_param_id, label))
            else:
                print("111")


    def execute1(self):
        # default_queryids_values = []
        # default_params2 = self.queryids.mapped('id')
        # for id in default_params2:

        #     params = self.env['queriespramwiz'].search_read([("query_id","=", id)], [])
        # # Default values for the One2many field 'queryids'
        
        #     for param in params:
        #         default_queryids_values.append((0, 0, {
        #             'name': param.get('name', ''),
        #             'label': param.get('label', ''),
        #             'valeur': param.get('valeur', ''),
        #         }))
        # for param in default_queryids_values:
        #     query = """
        #     update queriespram set valeur %s  where query_id = %s and label = %s
        #     """
        #     print(param[2]['valeur'])
        #     if param[2]['valeur'] != False:
        #         self.env.cr.execute(query, (param[2]['valeur'],default_params2[0],param[2]['label']))      
        #     else:
        #         print("111") 
        self = self.sudo()
        self.ensure_one()

        self.show_raw_output = False
        self.raw_output = ''
        self.rowcount = ''
        self.html = '<br></br>'

        resultquery = """
            select  name ,sequence ,label ,param ,valeur  ,typeparams  
                from public.queriespram where query_id = %s

        """
            
            

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
    

        if self.query_name:
            # formatted_d1 = self.d1.strftime('%Y-%m-%d')
            # formatted_d2 = self.d2.strftime('%Y-%m-%d')


            if 'where'  in self.query_name.lower():
                # query = self.query_name + f" datej between '{formatted_d1}' and '{formatted_d2}'"
                query = self.query_name
            else:
                query = self.query_name

            # querywhere = """
            #         update  querydeluxe set name = %s  where id = %s
       
            #         """
            # self.env.cr.execute(querywhere , (query,self.env.context.get('default_id') ))



            # if first_query_result:
            #     name_value = first_query_result[0]  
            #     print(name_value)
            #     print('**************tttttttttt*********************', name_value)
         
           
            # else:
           
            #     print("No result found for the first query")


            headers = []
            datas = []

            # print('**************tttttttttt*********************'  ,self.test)


            try:
                self.env.cr.execute(self.query_name)
            except Exception as e:
                raise UserError(e)

            try:
                if self.env.cr.description:
                    headers = [d[0] for d in self.env.cr.description]
                    datas = self.env.cr.fetchall()
            except Exception as e:
                raise UserError(e)

            rowcount = self.env.cr.rowcount
            self.rowcount = _("{0} row{1} processed").format(rowcount, 's' if 1 < rowcount else '')
    
            queryrow = """
                    update  querydeluxe set rowcount = %s  where id = %s
       
                    """
            self.env.cr.execute(queryrow , (self.rowcount, self.env.context.get('default_id') ))

            # print("***************" ,headers)
            # print("***************" ,datas)

            if headers:
                self.raw_output = datas

                header_html = "<tr style='background-color: lightgrey'> <th style='background-color:white'/>"
                header_html += "".join(["<th style='border: 1px solid black'>" + str(header) + "</th>" for header in headers])
                header_html += "</tr>"

                body_html = ""
                i = 0
                for data in datas:
                    i += 1
                    body_line = "<tr style='background-color: {0}'> <td style='border-right: 3px double; border-bottom: 1px solid black; background-color: yellow'>{1}</td>".format('cyan' if i%2 == 0 else 'white', i)
                    for value in data:
                        display_value = ''
                        if value is not None:
                            display_value = str(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                        body_line += "<td style='border: 1px solid black'>{0}</td>".format(display_value)
                    body_line += "</tr>"
                    body_html += body_line

                self.html = """
                <table style="text-align: center">
                <thead>
                    {0}
                </thead>

                <tbody>
                    {1}
                </tbody>
                </table>
                """.format(header_html, body_html)
               
          
                query = """
                    update  querydeluxe set html = %s  where id = %s
                    """
                
                self.env.cr.execute(query , (self.html,self.env.context.get('default_id')))
                # result = self.env.cr.dictfetchall()
                print( '************************/////////******************************' ,self.env.context.get('default_params2'))
                    
                  


                return {
                    'name': _('Return lines'),
                    'view_type': 'form',
                    'view_mode': 'form',
                    'res_id': self.env.context.get('default_id'),
                    'view_id': self.env.ref('query_deluxe.query_deluxe_view_form').id,
                    'res_model': 'querydeluxe',
                    'type': 'ir.actions.act_window',
                    'target': 'current',
                }

   
   


    def execute(self):
            
            params=[]

            for param1 in self.queryids:
                label = param1.label
                valeur = param1.valeur

                params.append( {
                   
                    'label':label,
                    'valeur': valeur,
                })


                # print(params)
            return {
                'type': 'ir.actions.client',
                'tag': 'action_query_execution',  # Replace with the actual tag of your Owl view
                'context': {
                    'default_params': params,
                    'default_query': self.query_name,
                },
            }