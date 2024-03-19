# -*- coding: utf-8 -*-

from collections import defaultdict
from odoo import models, fields, api
from odoo.exceptions import ValidationError

class famille(models.Model):
    _name = "is_bav.famille_bac"
    _description = ""
    name = fields.Char()

#================================================== LES FREQUENCES=========================================

class freq(models.Model):
    _name = "is_bav.frequences"
    _description = "Les frequences"
    name = fields.Char()
    nbrh = fields.Integer("nombre d'heure")

#================================================== LES TYPES DE TAGE=========================================

class tag_type(models.Model):
    _name = "is_bav.type_tag"
    name = fields.Char()

#================================================== LES TYPE DE BACS =========================================

class type(models.Model):
    _name = "is_bav.typebacs"
    _description = "Les types de bac"
    name = fields.Char("Nom")
    capacity = fields.Integer("Capacity")
    nature = fields.Char("Nature")
    marque = fields.Char("La marque")
    icon = fields.Many2one("is_bav.icons", "Icon", required=False)
    famille_id = fields.Many2one("is_bav.famille_bac", "Famille")

#================================================== LES EPC =========================================

class EPC(models.Model):
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _name = "is_bav.bacs"
    _description = "La table de EPCs"
    _rec_name = 'numero'

    def _get_default_state(self):
        state = self.env.ref('is_bav.is_bav_state_registered', raise_if_not_found=False)
        return state if state and state.id else False

    numero = fields.Char(string="N° EPC")
    adresse = fields.Char(string="Adresse")
    latitude = fields.Float(string="Latitude")
    longitude = fields.Float(string="Longitude")
    categorie = fields.Many2one("is_bav.categories", "Catégories", required=True)
    # typeb = fields.Many2one("is_bav.types", "Types", required=True)
    state_id = fields.Many2one('is_bav.state', 'State',
                               default=_get_default_state, group_expand='_read_group_stage_ids',
                               tracking=True,
                               help='Statut courrant pour cet EPC', ondelete="set null")
    marque = fields.Many2one("is_bav.marque", "Marque", required=True)
    image_128 = fields.Image(related='marque.image_128', readonly=True)
    active = fields.Boolean('Active', default=True, tracking=True)
    service_count = fields.Integer(compute="_compute_count_all", string='Interventions')
    log_services = fields.One2many('is_bav.log.services', 'bacs_id', 'Services Logs')
    equipement = fields.Many2many(
        comodel_name="is_bav.equipement",
        relation="is_bav_equipement_rel",  # Table de relation
        column1="bacs_equipement_id",  # Colonne référençant ce modèle
        column2="equipement_id",  # Colonne référençant le modèle is_bav.equipement
        string="Equipement",
        copy=False
    )


    datems = fields.Date("Date de mise en service")
    freqlavage = fields.Many2one(
        "is_bav.frequences", "Frequence de collecte", required=True
    )

    freqcollecte = fields.Many2one(
        "is_bav.frequences", "Frequence de lavage", required=True
    )
    fixpos = fields.Boolean("Fixer la position", default=False)
    color = fields.Char(string='Couleur')

    # Champs pour lier ce modèle à is_bav.types
    is_bav_type_id = fields.Many2one("is_bav.types", string="Types")

    # Champs d'image lié à image_32V de is_bav.types
    image_32 = fields.Image(related='is_bav_type_id.image_32V', readonly=True)
    icong = fields.Char(related='is_bav_type_id.img_green', readonly=True)
    lastlatitude = fields.Char(string='Latitude mise à jour')
    lastlongitude = fields.Char(string='Longitude mise à jour')
    lastdeviceid = fields.Integer(string='Identifiant du camion')
    lastupdateRFID = fields.Datetime("Date de la dernière mise à jour")
    tags_ids = fields.One2many('is_bav.tags', 'idbac', string="Tags")
    latcalc = fields.Float(string="Latitude Calculée", compute='_compute_lat_lon')
    loncalc = fields.Float(string="Longitude Calculée", compute='_compute_lat_lon')

    notes = fields.Text(string="Observations")
    service_activity = fields.Selection([
        ('none', 'None'),
        ('overdue', 'Overdue'),
        ('today', 'Today'),
    ], compute='_compute_service_activity')


    @api.depends('log_services')
    def _compute_service_activity(self):
        for bacs in self:
            activities_state = set(
                state for state in bacs.log_services.mapped('activity_state') if state and state != 'planned')
            bacs.service_activity = sorted(activities_state)[0] if activities_state else 'none'

    @api.constrains('numero')
    def numero_unique_champ(self):
        for record in self:
            if self.search_count([('numero', '=', record.numero)]) > 1:
                raise ValidationError("Le numéro EPC doit être unique !")

    @api.depends('fixpos', 'latitude', 'longitude', 'lastlatitude', 'lastlongitude')
    def _compute_lat_lon(self):
        for record in self:
            if record.fixpos:
                record.latcalc = record.latitude
                record.loncalc = record.longitude
            else:
                record.latcalc = float(record.lastlatitude) if record.lastlatitude else 0.0
                record.loncalc = float(record.lastlongitude) if record.lastlongitude else 0.0

    def return_action_to_open(self):
        """ This opens the xml view specified in xml_id for the current vehicle """
        self.ensure_one()
        xml_id = self.env.context.get('xml_id')
        print('RACHID=======',xml_id)
        if xml_id:
            res = self.env['ir.actions.act_window']._for_xml_id('is_bav.%s' % xml_id)
            print('RES=======', res)
            res.update(
                context=dict(self.env.context, default_bacs_id=self.id, group_by=False),
                domain=[('bacs_id', '=', self.id)]
            )
            return res
        return False

    def open_assignation_logs(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': 'Interventions',
            'view_mode': 'tree',
            'res_model': 'is_bav_log_services_view_tree',
            'domain': [('bacs_id', '=', self.id)],
            'context': {'bacs_id': self.bacs_id.id, 'bacs_id': self.id}
        }

    def _compute_count_all(self):

        LogService = self.env['is_bav.log.services'].with_context(active_test=False)
        services_data = LogService.read_group([('bacs_id', 'in', self.ids)], ['bacs_id', 'active'], ['bacs_id', 'active'], lazy=False)

        mapped_service_data = defaultdict(lambda: defaultdict(lambda: 0))

        for service_data in services_data:
            mapped_service_data[service_data['bacs_id'][0]][service_data['active']] = service_data['__count']

        for bacs in self:
            bacs.service_count = mapped_service_data[bacs.id][bacs.active]













