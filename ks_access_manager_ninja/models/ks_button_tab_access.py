# -*- coding: utf-8 -*-
from odoo import api, fields, models
from lxml import etree


class ButtonTabAccess(models.Model):
    _name = 'button.tab.access'
    _description = 'Button Tab Access'

    ks_model_id = fields.Many2one('ir.model', string='Model', domain="[('id', 'in', ks_profile_domain_model )]")
    ks_model_name = fields.Char(string='Model Name', related='ks_model_id.model', readonly=True, store=True)
    ks_hide_button_ids = fields.Many2many('button.tab.data', 'button_hide_rel_ah', 'button_id', 'user_id',
                                          string='Hide Button')
    ks_hide_tab_ids = fields.Many2many('button.tab.data', string='Hide Tab')
    ks_user_management_id = fields.Many2one('user.management', string='Rule')
    ks_profile_domain_model = fields.Many2many('ir.model', related='ks_user_management_id.ks_profile_domain_model')

    def ks_create_button_tab_data(self, btn, smart_button=False, smart_button_string=False):
        """Create button and smart record inside new model"""
        # string_value is used in case of kanban view button store,
        string_value = 'string_value' in self._context.keys() and self._context['string_value'] or False

        name = btn.get('string') or string_value
        if smart_button:
            name = smart_button_string
        self.env['button.tab.data'].sudo().create({
            'ks_model_id': self.ks_model_id.id,
            'ks_type': 'button',
            'ks_name': btn.get('name'),
            'ks_tab_button_string': name,
            'ks_button_type': btn.get('type'),
            'ks_is_smart_button': smart_button,
        })

    def ks_create_smart_button_string(self, button_list, type=False):
        """ It will create smart button string"""

        def ks_get_span_text(span_list):
            name = ''
            for sp in span_list:
                if sp.text:
                    name = name + ' ' + sp.text
            name = name.strip()
            return name

        for btn in button_list:
            name = ''
            field_list = btn.findall('field')
            if field_list:
                name = field_list[0].get('string')
            else:
                span_list = btn.findall('span')
                if span_list:
                    name = ks_get_span_text(span_list)
                else:
                    div_list = btn.findall('div')
                    if div_list:
                        span_list = div_list[0].findall('span')
                        if span_list:
                            name = ks_get_span_text(span_list)
            if not name:
                try:
                    name = btn.get('string')
                except:
                    pass
            if name and (type == 'object' or type == 'action'):
                domain = [('ks_button_type', '=', btn.get('type')), ('ks_tab_button_string', '=', name),
                          ('ks_model_id', '=', self.ks_model_id.id), ('ks_type', '=', 'button')]
                if type == 'object':
                    domain += [('ks_name', '=', btn.get('name'))]
                if type == 'action':
                    domain += [('ks_name', '=', btn.get('name'))]
                smart_button_id = self.env['button.tab.data'].sudo().search(domain)
                if not smart_button_id:
                    self.ks_create_button_tab_data(button_list, smart_button=True, smart_button_string=name)
                else:
                    smart_button_id[0].ks_is_smart_button = True

    @api.onchange('ks_model_id')
    def onchange_model_id(self):
        """On choosing model, drop down the related button"""
        if self.ks_model_id and self.ks_model_name:
            button_tab_object = self.env['button.tab.data'].sudo()
            view_object = self.env['ir.ui.view']
            view_list = ['form', 'tree', 'kanban']
            for view in view_list:
                for views in view_object.sudo().search(
                        [('model', '=', self.ks_model_name), ('type', '=', view), ('inherit_id', '=', False)]):
                    res = self.env[self.ks_model_name].sudo().fields_view_get(view_id=views.id, view_type=view)
                    doc = etree.XML(res['arch'])

                    object_button = doc.xpath("//button[@type='object']")
                    for btn in object_button:
                        string_value = btn.get('string')
                        normal_button = True
                        if btn.get('name') and string_value:
                            domain = [('ks_button_type', '=', btn.get('type')), ('ks_tab_button_string', '=', string_value),
                                      ('ks_name', '=', btn.get('name')), ('ks_model_id', '=', self.ks_model_id.id),
                                      ('ks_type', '=', 'button')]
                            if not button_tab_object.sudo().search(domain):
                                normal_button = False
                                self.with_context(string_value=string_value).ks_create_button_tab_data(btn)
                            if normal_button and btn.get('class') == 'oe_stat_button':
                                self.ks_create_smart_button_string(btn, type=btn.get('type'))

                    action_button = doc.xpath("//button[@type='action']")
                    for btn in action_button:
                        string_value = btn.get('string')
                        if view == 'kanban' and not string_value:
                            try:
                                string_value = btn.text if not btn.text.startswith('\n') else False
                            except:
                                pass
                        if btn.get('name') and string_value:
                            domain = [('ks_button_type', '=', btn.get('type')), ('ks_tab_button_string', '=', string_value),
                                      ('ks_name', '=', btn.get('name')), ('ks_model_id', '=', self.ks_model_id.id),
                                      ('ks_type', '=', 'button')]
                            if not button_tab_object.sudo().search(domain):
                                self.with_context(string_value=string_value).ks_create_button_tab_data(btn)

                    # Search pages for the selected model and create a record for it
                    page_list = doc.xpath("//page")
                    if page_list:
                        for page in page_list:
                            if page.get('string'):
                                domain = [('ks_tab_button_string', '=', page.get('string')),
                                          ('ks_model_id', '=', self.ks_model_id.id), ('ks_type', '=', 'page')]
                                if page.get('name'):
                                    domain += [('ks_name', '=', page.get('name'))]
                                tab_exist = button_tab_object.sudo().search(domain, limit=1)
                                if not tab_exist:
                                    button_tab_object.create({
                                        'ks_model_id': self.ks_model_id.id,
                                        'ks_name': page.get('name'),
                                        'ks_tab_button_string': page.get('string'),
                                        'ks_type': 'page',
                                    })


class KsButtonTab(models.Model):
    _name = 'button.tab.data'
    _description = 'Store Button/Tab data'
    _rec_name = 'ks_tab_button_string'

    ks_model_id = fields.Many2one('ir.model', string='Model', index=True, ondelete='cascade', required=True)
    ks_model_name = fields.Char(string='Model Name', related='ks_model_id.model', readonly=True, store=True)
    ks_type = fields.Selection([('button', 'Button'), ('page', 'Page'), ('link', 'Link')], string="Type",
                            required=True)
    ks_name = fields.Char('Name')
    ks_tab_button_string = fields.Char('Attribute String', required=True)

    ks_button_type = fields.Selection([('object', 'Object'), ('action', 'Action')], string="Button Type")
    ks_is_smart_button = fields.Boolean('Smart Button')

    def name_get(self):
        result = []
        for rec in self:
            name = rec.ks_tab_button_string
            if rec.ks_name:
                name = name + ' (' + rec.ks_name + ')'
                if rec.ks_is_smart_button and rec.ks_type == 'button':
                    name = name + ' (Smart Button)'
            result.append((rec.id, name))
        return result
