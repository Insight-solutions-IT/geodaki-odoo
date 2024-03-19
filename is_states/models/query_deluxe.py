import base64
import io
from odoo import api, fields, models, _



class Querygroup(models.Model):
    _name = "querygroup"
    _description = " group"
    _rec_name = 'namegroup'

    namegroup = fields.Char(string="namegroup")
    description = fields.Text(string="Description", translate=True)



class Queriespram(models.Model):
    _name = 'queriespram'
    _description = "params for queries"
    name = fields.Text(string='Query')
    description = fields.Text(string="Description")
    sequence = fields.Integer(string="sequence")
    label = fields.Text(string="label")
    param = fields.Text(string="param")
    valeur = fields.Text(string="valeur")
    # paramsids = fields.One2many('prams_query', 'query_id', string='parametre')
    typeparams = fields.Text(string="type de parametre")
    query_id = fields.Many2one('querydeluxe', string='query id')


# class prams_query(models.Model):
#     _name = 'prams_query'
#     _description = "params for queries"
#     params_id = fields.Many2one('queriespram', string="Parametre")
#     query_id = fields.Many2one('querydeluxe', string="Query")
#     typeparams = fields.Text(string="type parametre")


class QueryDeluxe(models.Model):
    _name = "querydeluxe"
    _description = ""
    tips = fields.Many2one('tipsqueries', string="Examples")
    rowcount = fields.Text(string='Rowcount')
    html = fields.Html(string='HTML')
    nomreq = fields.Char(string="Nom de la requete")
    name = fields.Text(string='Type a query : ')
    groupid = fields.Many2one('querygroup', string='groupid')
    queryids = fields.One2many('queriespram', 'query_id', string='parametre')
    chart = fields.Boolean(string="chart")
    valid_query_name = fields.Text()

    show_raw_output = fields.Boolean(string='Show the raw output of the query')
    raw_output = fields.Text(string='Raw output')

    def getParamsQuery(self,id): 
        query = """
          SELECT *
   FROM public.queriespramwiz
     
	 where query_id=%s
    
        """
        self.env.cr.execute(query, (id,))
        result = self.env.cr.dictfetchall()
        
        return result       
    
    def getQueryName(self,id): 
        query = """
          SELECT *
   FROM public.displayquery
     
	 where id=%s
    
        """
        self.env.cr.execute(query, (id,))
        result = self.env.cr.dictfetchall()
        
        return result    


    
    def getQueryGroup(self,id): 
        query = """
         SELECT namegroup FROM public.querygroup g INNER JOIN public.querydeluxe q ON g.id = q.groupid WHERE EXISTS ( SELECT 1 FROM public.displayquery dk WHERE q.name = dk.query_name and id = %s ); 
    
        """
        self.env.cr.execute(query, (id,))
        result = self.env.cr.dictfetchall()
        
        return result    







    def executeQuery(self,query,params): 
        test = """ """+query+ """ """


        test.format(*params)

        my_tuple = tuple(params)

        self.env.cr.execute(query)
        result = self.env.cr.dictfetchall()
        
        return result    
    
    def print_result(self):
        self.ensure_one()

        return {
            'name': _("Select orientation of the PDF's result"),
            'view_mode': 'form',
            'res_model': 'pdforientation',
            'type': 'ir.actions.act_window',
            'target': 'new',
            'context': {
                'default_query_name': self.valid_query_name
            },
        }









    def copy_query(self):
        self.ensure_one()

        if self.tips:
            self.name = self.tips.name

    def execute(self):
        queryrow = """
            SELECT * FROM public.queriespram WHERE query_id = %s
        """
        self.env.cr.execute(queryrow, (self.id,))
        first_query_result = self.env.cr.fetchall()
        # print( "ppppppppppppppppppppppppppppppppppp" , first_query_result  , self.id )


        
#         self = self.sudo()
#         self.ensure_one()


  

#         self.show_raw_output = False
#         self.raw_output = ''

#         self.rowcount = ''
#         self.html = '<br></br>'

#         self.valid_query_name = ''

#         if self.name:
#             self.tips = False
#             # self.message_post(body=str(self.name))

#             headers = []
#             datas = []

#             try:
#                 self.env.cr.execute(self.name)
#             except Exception as e:
#                 raise UserError(e)

#             try:
#                 if self.env.cr.description:
#                     headers = [d[0] for d in self.env.cr.description]
#                     datas = self.env.cr.fetchall()
#             except Exception as e:
#                 raise UserError(e)

#             rowcount = self.env.cr.rowcount
#             self.rowcount = _("{0} row{1} processed").format(rowcount, 's' if 1 < rowcount else '')

#             if headers and datas:
#                 self.valid_query_name = self.name
#                 self.raw_output = datas

#                 header_html = "<tr style='background-color: lightgrey'> <th style='background-color:white'/>"
#                 header_html += "".join(["<th style='border: 1px solid black'>" + str(header) + "</th>" for header in headers])
#                 header_html += "</tr>"

#                 body_html = ""
#                 i = 0
#                 for data in datas:
#                     i += 1
#                     body_line = "<tr style='background-color: {0}'> <td style='border-right: 3px double; border-bottom: 1px solid black; background-color: yellow'>{1}</td>".format('cyan' if i%2 == 0 else 'white', i)
#                     for value in data:
#                         display_value = ''
#                         if value is not None:
#                             display_value = str(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
#                         body_line += "<td style='border: 1px solid black'>{0}</td>".format(display_value)
#                     body_line += "</tr>"
#                     body_html += body_line

#                 self.html = """
# <table style="text-align: center">
#   <thead>
#     {0}
#   </thead>

#   <tbody>
#     {1}
#   </tbody>
# </table>
# """.format(header_html, body_html)
        queryids_ids = self.queryids.mapped('id')

        return {
            'name': _("excute query"),
            'view_mode': 'form',
            'res_model': 'displayquery',
            'type': 'ir.actions.act_window',
            'target': 'new',
            'context': {
                'default_query_name': self.name,
                'default_id' : self.id,
                'default_params2' : [self.id],
                'default_chart' : self.chart,
                'default_params' : first_query_result,
                'default_test' : first_query_result
                
                
            },
        }
                
   
                

              


class TipsQueries(models.Model):
    _name = 'tipsqueries'
    _description = "Tips for queries"

    name = fields.Text(string='Query')
    description = fields.Text(string="Description", translate=True)
