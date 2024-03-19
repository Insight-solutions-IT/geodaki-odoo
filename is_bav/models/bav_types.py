# -*- coding: utf-8 -*-

import base64
from odoo import models, fields, api
from odoo.tools import config

#================================================== LES ICONE=========================================

class cls_icons(models.Model):
    _name = "is_bav.types"
    _description = "Les Types"

    name = fields.Char(string="Nom")
    capacite = fields.Integer(string="Capacité")
    img_red = fields.Char(string="Rouge")
    img_green = fields.Char(string="Vert")
    img_bleu = fields.Char(string="Bleu")
    img_gris = fields.Char(string="Gris")
    img_mauve = fields.Char(string="Mauve")
    image_32V = fields.Image(string='Image Verte', compute='_compute_image', store=True)
    image_32R = fields.Image(string='Image Rouge', compute='_compute_image', store=True)
    image_32B = fields.Image(string='Image Bleu', compute='_compute_image', store=True)
    image_32G = fields.Image(string='Image Gris', compute='_compute_image', store=True)
    image_32M = fields.Image(string='Image Mauve', compute='_compute_image', store=True)


    @api.depends('img_red', 'img_green', 'img_bleu', 'img_gris', 'img_mauve')
    def _compute_image(self):
        odoo_root_path = config['root_path']
        image_path = f"{odoo_root_path}/addons/is_bav/static/img/bacs/"

        def read_image(record, icon_field, image_field):
            icon_value = getattr(record, icon_field)

            if not icon_value or not isinstance(icon_value, str):
                setattr(record, image_field, False)
                return

            full_image_path = image_path + icon_value
            try:
                with open(full_image_path, 'rb') as image_file:
                    setattr(record, image_field, base64.b64encode(image_file.read()))
            except FileNotFoundError:
                setattr(record, image_field, False)

        for record in self:
            read_image(record, 'img_red', 'image_32R')
            read_image(record, 'img_green', 'image_32V')
            read_image(record, 'img_bleu', 'image_32B')
            read_image(record, 'img_gris', 'image_32G')
            read_image(record, 'img_mauve', 'image_32M')






