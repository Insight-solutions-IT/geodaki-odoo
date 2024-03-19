# -*- coding: utf-8 -*-
from odoo import models, fields

class DataDisplayModel(models.Model):
    _name = 'data.display.model'
    _description = 'Data Display Model'

    name_to_display = fields.Char(compute='_compute_name_to_display')
    size_to_display = fields.Char(compute='_compute_size_to_display')


    def _compute_name_to_display(self):
        data = [{'name': 'aa', 'size': '0'}, {'name': 'ab', 'size': '1'}]
        # Assuming you want to display the "name" field
        name_string = ', '.join([item['name'] for item in data])
        self.name_to_display = name_string

    def _compute_size_to_display(self):
        data = [{'name': 'aa', 'size': '0'}, {'name': 'ab', 'size': '1'}]
        # Assuming you want to display the "size" field
        size_string = ', '.join([item['size'] for item in data])
        self.size_to_display = size_string