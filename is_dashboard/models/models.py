# -*- coding: utf-8 -*-

from odoo import models, fields, api , exceptions

import datetime

class Solution(models.Model):
    _name = "is_anomalies.solution"
    _description = "Les solutions"

    name = fields.Char("solution", required=True)



class Probleme(models.Model):
    _name = "is_anomalies.probleme"
    _description = "Les problemes"

    name = fields.Char("probleme", required=True)
    

class Category(models.Model):
    _name = "is_anomalies.category"
    _description = "Les categories"

    name = fields.Char("categorie", required=True)

class Produit(models.Model):
    _name = "is_anomalies.produit"
    _description = "Les produits"

    name = fields.Char("produit", required=True)
    product_type = fields.Many2one('is_anomalies.category')

class UsersVille(models.Model):
    _name = "is_anomalies.uv"
    _description = "Les users "

    name = fields.Char()
    users = fields.Many2many('res.users')

    an_user = fields.Char(default=lambda self: self._default_group_user())

    def _default_group_user(self):
        user_group = self.env.ref('is_anomalies.an_user')
        return user_group.id
    


class Ville(models.Model):
    _name = "is_anomalies.ville"
    _description = "Les villes"

    name = fields.Char("ville", required=True)
    user = fields.Many2one('res.users', required=True)
    agents = fields.Many2many('res.users')

    an_agent = fields.Char(default=lambda self: self._default_group())

    def _default_group(self):
        agent_group = self.env.ref('is_anomalies.an_agent')
        return agent_group.id
    
    an_user = fields.Char(default=lambda self: self._default_group_user())

    def _default_group_user(self):
        user_group = self.env.ref('is_anomalies.an_user')
        return user_group.id
        

class PM(models.Model):
    _name = "is_anomalies.problememetier"
    _description = "Les problemes metier"

    name = fields.Char(required=True)

class Vehicule(models.Model):
    _name = "is_anomalies.vehicule"
    _description = "Les vehicules"

    concatdev = fields.Char("concatdev", required=True)
    ville = fields.Many2one('is_anomalies.ville', required=True)
    name = fields.Char("vehicule", required=True)
    uniqueid = fields.Char()


class Reference(models.Model):
    _name = "is_anomalies.reference"
    _description = "Les references"

    name = fields.Char("reference", required=True)

class Module(models.Model):
    _name = "is_anomalies.module"
    _description = "Les modules"

    name = fields.Char(required=True)
    probleme = fields.Many2many('is_anomalies.probleme')
    solution = fields.Many2many('is_anomalies.solution')

class Fonction(models.Model):
    _name = "is_anomalies.fonction"
    _description = "Les fonctions"

    name = fields.Char(required=True)
    module = fields.Many2many('is_anomalies.module')
    product = fields.Many2many('is_anomalies.produit')

class InfoRaclamtion(models.Model):
    _name = "is_anomalies.info"
    _description = "Info raclamation"


    fonction = fields.Many2one('is_anomalies.fonction')
    module = fields.Many2one('is_anomalies.module')
    probleme = fields.Many2one('is_anomalies.probleme')
    solution = fields.Many2one('is_anomalies.solution')
    description = fields.Text()
    

    info_id = fields.Many2one('is_anomalies.reclamation')


    module_compute = fields.Many2many('is_anomalies.module',stor=False,compute="compute_module")

    @api.depends('fonction')
    def compute_module(self):
        for rec in self:
            rec.module_compute = rec.fonction.module.ids


    probleme_compute = fields.Many2many('is_anomalies.probleme',stor=False,compute="compute_probleme")
    
    @api.depends('module')
    def compute_probleme(self):
        for rec in self:
            rec.probleme_compute = rec.module.probleme.ids

    solution_compute = fields.Many2many('is_anomalies.solution',stor=False,compute="compute_solution")
    
    @api.depends('probleme')
    def compute_solution(self):
        for rec in self:
            rec.solution_compute = rec.module.solution.ids
   

    @api.onchange('module')
    def _onchange_module(self):
        self.probleme=False
    
    @api.onchange('probleme')
    def _onchange_probleme(self):
        self.solution=False
    
    

    # @api.depends('fonction')
    # def _compute_module_domain(self):
    #     for record in self:
    #         if record.fonction:
    #             record.module_domain = [('id', 'in', record.fonction.module.ids)]
    #         else:
    #             record.module_domain = [('id', 'in', [])]

    # module_domain = fields.Many2many('is_anomalies.module', compute='_compute_module_domain')

    # @api.onchange('module_domain')
    # def _onchange_module_domain(self):
    #     return {'domain': {'module': self.module_domain.ids}}

    
    # @api.depends('fonction')
    # def _compute_module_domain(self):
    #     for record in self:
    #         if record.fonction:
    #             record.module = [('id', 'in', record.fonction.module.ids)]
    #         else:
    #             record.module = [('id', 'in', [])]

    @api.onchange('fonction')
    def _onchange_fonction(self):
        self.module=False
        # if self.fonction:
        #     return {'domain': {'module': [('id', 'in', self.fonction.module.ids)]}}
        # else:
        #     return {'domain': {'module': [('id', 'in', [])]}}
    


# class UserVille(models.Model):
#     _inherit = ['res.users']

#     ville = fields.Many2one('is_anomalies.ville')


# class Reclamation(models.Model):
#     _name = "is_anomalies.reclamation"
#     _description = "Les reclamations"

#     date_modification = fields.Char()
#     description = fields.Char()
#     devicename = fields.Char()
#     ident = fields.Char()
#     imei = fields.Char()
#     imgurl = fields.Char()
#     istodo = fields.Boolean(default=False)
#     statut = fields.Char()
#     ville = fields.Char()
#     client = fields.Many2one('res.users', default=lambda self: self.env.user.id, readonly=True)
#     device = fields.Many2one('is_anomalies.vehicule')
#     product = fields.Many2one('is_anomalies.produit')
#     reference = fields.Many2many('is_anomalies.reference')
#     probleme = fields.Many2many('is_anomalies.probleme')
#     solution = fields.Many2many('is_anomalies.solution')
#     #is_in_journal = fields.Boolean(default=False)
#     datej = fields.Date()


 
class ReclamationHistory(models.Model):
    _name = "is_anomalies.reclamation.history"
    _description = "History of Reclamations"

    reclamation_id = fields.Many2one('is_anomalies.reclamation', string="Reclamation")
    field_name = fields.Char(string="Field Name")
    old_value = fields.Char(string="Old Value")
    new_value = fields.Char(string="New Value")
    changed_by = fields.Many2one('res.users', string="Changed By")
    change_date = fields.Datetime(string="Change Date")
    description = fields.Text(string="Description of Change")


class Reclamation(models.Model):
    _name = "is_anomalies.reclamation"
    _description = "Les reclamations"

    #xx = self.env['res.users'].search([('name', '=', device_name)], limit=1)
    now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    date_modification = fields.Char(now)
    description = fields.Char()
    
    def _get_default_devicename(self):
        current_user = self.env.user
        test = True
        if current_user.has_group('an_user'):
            test = False
        return test

    # devicename = fields.Char(default=_get_default_devicename)
   
    imei = fields.Char(default=lambda self: self.env.user)
    imgurl = fields.Char()
    image = fields.Binary(string="Image")
    icon = fields.Char('icon' ,default='fa-wrench')

    STATUT_SELECTION = [
        
        ('Réclamation agent GPS','Réclamation agent GPS'),
        ('To Do', 'To Do'),
        ('En cours', 'En cours'),
        ('Traité', 'Traité'),
    ]


    # @api.model
    # def get_user_specific_statuts(self):
    #     current_user = self.env.user
    #     if current_user.has_group('is_anomalies.an_admin'):
    #         self.STATUT_SELECTION.append(('ToDo', 'ToDo'))
    #     return self.STATUT_SELECTION

    # statuts = fields.Selection(selection='get_user_specific_statuts', string="Statuts", required=True)

    # if _get_default_devicename:
    #     STATUT_SELECTION = [
    #     ('Traité', 'Traité'),
    #     ('En cours', 'En cours'),
    #     ('ToDo', 'ToDo'),
    #     ]
    # else:
    #     STATUT_SELECTION = [
    #     ('Traité', 'Traité'),
    #     ('En cours', 'En cours'),
        
    #     ]
    

    statuts = fields.Selection(STATUT_SELECTION,string="statuts" , required=True ,default=lambda self: self.cam_statut())

    def cam_statut(self):
        
        if self.env.user.has_group('is_anomalies.an_admin'):
            return 'To Do'
        # elif self.env.user.has_group('is_anomalies.an_user_global'):
        #     return 'En cours'
        elif self.env.user.has_group('is_anomalies.an_user_global'):
            self.istodo = False
            return 'En cours'
        elif self.env.user.has_group('is_anomalies.an_agent'):
            self.istodo = True
            return 'Réclamation agent GPS'
        
        return 'En cours'
    
    def cam_agent(self):
        if self.env.user.has_group('is_anomalies.an_admin'):
            return False

        if self.env.user.has_group('is_anomalies.an_agent'):
           
            return True
        return False
        


            
    @api.depends('isUser')
    def cam_user(self):
       
        # if self.env.user.has_group('is_anomalies.an_agent'):
            

        if self.env.user.has_group('is_anomalies.an_user'):
            self.isUser = True

        self.isUser = False
        

    ident = fields.Char()

    # stockProduit = fields.Many2many('product.template')
    # qnt = fields.Float(compute='_compute_qnt', string='Quantity Available', store=True)

    def sendEmail(self):
        try:
            self.env['mail.mail'].create({
                'email_from': 'your@email.com',
                'email_to': 'azizbella0@gmail.com',
                'subject': 'Subject of your email',
                'body_html': 'hello',
            }).send()
        except ValidationError as e:
            # Handle validation errors if any
            pass

    # @api.depends('stockProduit')
    # def _compute_qnt(self):
    #     for record in self:
            
    #         if record.stockProduit:
    #             # Assuming that you want the total quantity available for all selected products
                
    #             total_qty = sum(product.qty_available for product in record.stockProduit)
    #             record.qnt = total_qty
    #         else:
    #             record.qnt = 0.0


    #statut = fields.Many2one('is_anomalies.statut')

    def allVille(self):
        res = self.env['is_anomalies.ville'].search_read([])
        liste =  []
        for v in res:
            liste.add(tuple(v.id,v.name))
        
        return liste

    # VILLE_SELECTION = allVille 
    # ville = fields.Selection(allVille,string="ville" , required=True)

    
 

    istodo = fields.Boolean(default=lambda self: self.cam_agent())
    isUser = fields.Boolean(compute="cam_user" ,store = False)

    agent_read = fields.Boolean(default=lambda self: self.cam_read_only(),store=False)
    agent_ville = fields.Boolean(default=lambda self: self.cam_agent_ville(),store=False)

    user_read_only = fields.Boolean(default=lambda self: self.user_cam_read_only(),store=False)


    info = fields.One2many('is_anomalies.info','info_id')

    @api.onchange('product')
    def _onchange_produit(self):
        self.info=False

    def user_cam_read_only(self):
        if self.env.user.has_group('is_anomalies.an_user'):
            if self.statuts != 'Réclamation agent GPS' and self.client.id != self.env.user.id:
                return True
            else:
                return False
        return False

    def cam_read_only(self):
        if self.env.user.has_group('is_anomalies.an_agent'):
            # if self.statuts != 'Réclamation agent GPS':
            return True
            # else:
            #     return False
        return False


    def cam_agent_ville(self):
        target_group_id = self.env.ref('is_anomalies.an_agent').id
        user_group_ids = self.env.user.groups_id.ids

        if target_group_id in user_group_ids:
            return True
        else:
            return False

    client = fields.Many2one('res.users', default=lambda self: self.env.user.id , required=True)
    currentUser = fields.Char(default=lambda self: self.env.user.id ,store=False)

    group = fields.Many2one('res.groups', default=lambda self: self._default_group(), required=True)

    an_user = fields.Char(default=lambda self: self._default_group_user() ,store=False)
    an_agent = fields.Char(default=lambda self: self.env.ref('is_anomalies.an_agent').id ,store=False)
    userGroup = fields.Char(default=lambda self: self.env.user.groups_id.ids ,store=False)

    def _default_group_user(self):
        user_group = self.env.ref('is_anomalies.an_user')
        return user_group.id

    device = fields.Many2one('is_anomalies.vehicule' , required=True)
    product = fields.Many2one('is_anomalies.produit')
    
    category_product = fields.Many2one('is_anomalies.category')
    
    @api.onchange('category_product')
    def onchange_category(self):
        self.product = False

    reference = fields.Many2many('is_anomalies.reference')


    

    solution = fields.Many2many('is_anomalies.solution')
    
    datej = fields.Date()

    image_url = fields.Char(string="Image URL", compute="_compute_image_url")

    probleme = fields.Many2many('is_anomalies.probleme')
    problememetier = fields.Many2many('is_anomalies.problememetier')
    isProbleme = fields.Boolean(default=False,store = False,compute="load_probleme")

    @api.depends('probleme')
    def load_probleme(self):
        test_record = self.env['is_anomalies.probleme'].search([('name', '=', 'Problème métier')], limit=1)
        if test_record and test_record.id in self.probleme.ids:
            self.isProbleme = True
        else:
            self.problememetier = False
            self.isProbleme = False



    @api.onchange('probleme')
    def onchange_probleme(self): 
        test_record = self.env['is_anomalies.probleme'].search([('name', '=', 'Problème métier')], limit=1)
        if test_record and test_record.id in self.probleme.ids:
            self.isProbleme = True
        else:
            self.problememetier = False
            self.isProbleme = False


    def _default_group(self):
        agent_group = self.env.ref('is_anomalies.an_agent')
        user_group = self.env.ref('is_anomalies.an_user')
        if self.env.user.has_group('is_anomalies.an_admin'):
            return user_group.id
        elif self.env.user.has_group('is_anomalies.an_agent'):
            
            return agent_group.id
        else:
            return user_group.id

    # @api.onchange('statuts')
    # def onchange_statuts(self):
    #     if self.statuts == 'ToDo':
    #         self.istodo = True
    #     else:
    #         self.istodo = False
    #         self.client = self.env.user.id
        
        # if self.env.user.has_group('an_user'):
            
        #     STATUT_SELECTION = [
        #         ('Traité', 'Traité'),
        #         ('En cours', 'En cours'),
                
        #     ]
        
   
        
    @api.onchange('statuts')
    def onchange_statuts(self):
        # print("*-**--*--*-*",self.product.fonction.ids)
        # res = self.env['is_anomalies.fonction'].search_read([], [])
       
        #if self._origin:  # Checks if the record has already been created
        if self.statuts == 'To Do':
            # self.istodo = True
            # if not self.env.user.has_group('is_anomalies.an_user_global'):
            #     self.statuts = 'En cours'
            # if self.env.user.has_group('is_anomalies.an_admin') :
            #     self.statuts = False
            # if self.env.user.has_group('is_anomalies.an_user_global'):
            #     self.statuts = False
            if self.env.user.has_group('is_anomalies.an_user'):
                self.client = False
                # return 'En cours'
            # elif self.env.user.has_group('is_anomalies.an_user_global'):
            #     return 'En cours'
        elif self.statuts == 'Réclamation agent GPS':
            if not self.env.user.has_group('is_anomalies.an_agent'):
                self.statuts = False
                # return 'En cours'
        else:
            # self.istodo = False
            self.client = self.env.user.id
            if self.statuts == 'En cours':
                self.detail = 'ok'

            if self.statuts == 'Traité':
                if len(self.info) != 0: 
                    self.detail = 'ok'
                else:
                    self.detail = 'no'
    
    
    
   
    # def _compute_in_group_agent(self):
    #     agent_group = self.env.ref('is_anomalies.an_agent')
    #     for record in self:
    #         record.in_group_agent = agent_group in record.env.user.groups_id


    # @api.onchange('ville')
    # def onchange_ville(self):
    #     if self.env.user.has_group('is_anomalies.an_agent'):
    #         self.statuts = 'Réclamation agent GPS'


    

    
    ville = fields.Many2one('is_anomalies.ville', string="Ville", required=True )
    ville_agent = fields.Many2one('is_anomalies.ville', string="Ville" )

    uv = fields.Many2one('is_anomalies.uv' )

    @api.onchange('ville')
    def onchange_ville(self):   
        # if self.env.user.has_group('is_anomalies.an_agent'):
        #     self.client = self.ville.user.id
        if self.ville:
            self.ville_agent = self.ville
            self.uv = self.ville.id
        self.device = False
    

    @api.onchange('ville_agent')
    def onchange_ville_2(self):   
        # if self.env.user.has_group('is_anomalies.an_agent'):
        #     self.client = self.ville_agent.user.id
        if self.ville_agent:
            self.uv = self.ville_agent.id
            self.ville = self.ville_agent
        # res = self.env['res.users'].search_read([("id", "=", 2)], [])
        # self.product = 3
        # print("------------------------------",res)
        self.device = False
   

    @api.depends('image')
    def _compute_image_url(self):
        base_url = self.env["ir.config_parameter"].sudo().get_param("web.base.url")
        for rec in self:
            if rec.image:
                rec.image_url = f"{base_url}/web/image?model={self._name}&id={rec.id}&field=image"
            else:
                rec.image_url = False

    # def _compute_image_url(self):
    #     if self.image:
    #         base_url = self.env["ir.config_parameter"].sudo().get_param("web.base.url")
    #         for rec in self:
    #             rec.image_url = f"{base_url}/web/image?model=is_anomalies.reclamation&id={rec.id}&field=image"

    def tester(self):
        return 0

    old_rec = fields.Boolean()
    
    def download_image(self):
        base_url = self.env["ir.config_parameter"].sudo().get_param("web.base.url")
        return {
            'type': 'ir.actions.act_url',
            'url': f"{base_url}/web/image?model=is_anomalies.reclamation&id={self.id}&field=image",
            'target': 'new',
        }
  
    def unlink(self):
        for record in self:
            if self.env.user.has_group('is_anomalies.an_agent') and record.statuts != 'Réclamation agent GPS':
                raise exceptions.ValidationError("Delete to this record are not allowed.")

        return super(Reclamation, self).unlink()

    infoLen = fields.Char(compute='_compute_info_length',store = False)

    detail = fields.Char()


   

    @api.onchange('info')
    def onchange_info(self): 
        if self.statuts == 'Traité':  
            if len(self.info) != 0: 
                self.detail = 'ok'
            else:
                self.detail = 'no'
        else:
                self.detail = 'ok'

   

    @api.depends('info')
    def _compute_info_length(self):
        for record in self:
            record.infoLen = len(record.info)
    
    


    # def action_check(self):

    #     action = self.env.ref('is_anomalies.product_category_action_form')

    #     print("self.categ_id",self.categ_id)

    #     notification = {

    #         'type': 'ir.actions.client',

    #         'tag': 'display_notification',

    #         'params': {

    #             'title': _('Click here'),

    #             'message': '%s',

    #             'links': [{

    #                 'label': self.categ_id.name,

    #                 'url': f'#action={action.id}&id={self.categ_id.id}&model=product.category'

    #             }],

    #             'sticky': False,

    #         }

    #     }

    #     return notification

    # @api.model
    # def create(self,vals):
    #     if vals.get('statuts') == 'Traité' and not vals.get('info'): 
    #         raise exceptions.ValidationError("Détail obligatoire !")
    #     res = super(Reclamation, self).create(vals)
    #     return res

    

    
    def write(self, vals):
       
        print("//*/**/**/*//*/*/",vals)
        if vals and not vals.get('problememetier'):
            print("*-*--**-**-*--",self.detail)
            if vals.get('detail') == 'no':
                raise exceptions.ValidationError("Détail obligatoire !")
        #     print("***************************", len(self['info']))
            
        #     if self['statuts'] == 'Traité' and len(self['info']) == 0: 
        #         print("///////////",self['infoLen'])
        #         raise exceptions.ValidationError("Détail obligatoire !")
        
      
        


        # if self.statuts == 'Traité' and not vals.get('info'): 
        #     self.reqInfo = 'ok'
        #     return 0
        # for record in self:
        #     if self.env.user.has_group('is_anomalies.an_agent') and record.statuts != 'Réclamation agent GPS':
        #         raise exceptions.ValidationError("Updates to this record are not allowed.")
        # if self.client != self.env.user:
        #     raise ValidationError(_("Only Managers can perform that move !"+self.env.user))
        # old_values = {field: self[field] for field in vals.keys()}
        # res = super(Reclamation, self).write(vals)
        # changed_by = self.env.user  # User making the change
       

        
        # res_search = self.env['is_anomalies.info'].search([('info_id', '=', self.id)], limit=1)
        # if not self._origin:
        #     if self.statuts == 'Traité' :
        #         if len(self.info) == 0:
        #             raise exceptions.ValidationError("ba ba ba ba .")


        # print("-------------",len(res_search))
   
        old_values = {field: self[field] for field in vals.keys()}
        res = super(Reclamation, self).write(vals)
        changed_by = self.env.user
        




        # print("-------------",len(self.info))
        # if 'statuts' in vals and vals['statuts'] == 'Traité' and not vals.get('info'):
            # raise ValidationError("If 'Statuts' is 'Traité', at least one record is required in the 'Info' field.")
                # print("-------------",self.info)
        # for record in self:
        #     print("-------------",record.info)
            # if record.info == False:
            #     raise exceptions.ValidationError("ba ba ba ba .")

        for field, new_value in vals.items():
            old_value = old_values.get(field)
            if field == 'image':
                if old_value != new_value:
                    self.env['is_anomalies.reclamation.history'].create({
                        'reclamation_id': self.id,
                        'field_name': field,
                        'old_value': str('image1'),
                        'new_value': str('image2'),
                        'changed_by': changed_by.id,
                        'change_date': fields.Datetime.now(),
                        'description': f"Changed {field} from image1 to image2"
                    })
            else:
                if old_value != new_value:
                    self.env['is_anomalies.reclamation.history'].create({
                        'reclamation_id': self.id,
                        'field_name': field,
                        'old_value': str(old_value),
                        'new_value': str(new_value),
                        'changed_by': changed_by.id,
                        'change_date': fields.Datetime.now(),
                        'description': f"Changed {field} from {old_value} to {new_value}"
                    })
        return res

   


    # image_url = fields.Char(string="Image URL", compute="_compute_image_url",readonly=False)

    # def _compute_image_url(self):
    #     base_url = self.env["ir.config_parameter"].sudo().get_param("web.base.url")
    #     for rec in self:
    #         rec.image_url = f"{base_url}/web/image?model=is_anomalies.reclamation&id={rec.id}&field=image"

    

    
    # ville = fields.Many2one('is_anomalies.ville', string="Ville", required=True )
    # @api.onchange('ville')
    # def onchange_ville(self):   
    #     if self.env.user.has_group('is_anomalies.an_agent'):
    #         self.client = self.ville.user.id
    #     self.device = False

    

    # @api.depends('image')
    # def _compute_image_url(self):
        # base_url = self.env["ir.config_parameter"].sudo().get_param("web.base.url")
        # for rec in self:
        #     if rec.image:
        #         rec.image_url = f"{base_url}/web/image?model={self._name}&id={rec.id}&field=image"
        #     else:
        #         rec.image_url = False

    # def _compute_image_url(self):
    #     if self.image:
    #         base_url = self.env["ir.config_parameter"].sudo().get_param("web.base.url")
    #         for rec in self:
    #             rec.image_url = f"{base_url}/web/image?model=is_anomalies.reclamation&id={rec.id}&field=image"

 


    # def download_image(self):
    #     base_url = self.env["ir.config_parameter"].sudo().get_param("web.base.url")
    #     return {
    #         'type': 'ir.actions.act_url',
    #         'url': f"{base_url}/web/image?model=is_anomalies.reclamation&id={self.id}&field=image",
    #         'target': 'new',
    #     }
  

    

   



    

    