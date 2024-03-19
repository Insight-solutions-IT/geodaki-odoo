#-*- coding: utf-8 -*-

from odoo import models, fields, api

class FleetVehicleHis(models.Model):
    _inherit = "fleet.vehicle"

    def get_map_dataHis(self):
        # print('***************************************')
        # print(self.env.user.id)
        return self.env['fleet.vehicle'].search_read([], order="device")
    

    def get_num_bacs_historique(self,idd,date1,date2):

        d1 = date1+' 00:00:00'
        d2 = date2+' 23:59:59'

        # query = """
        
        #  SELECT
        #             b.id,
        #             b.lastdeviceid,
        #             b.numpark,
        #             b.numbac,
        #             b.adresse,
        #             b.newla,
        #             b.newlo,
        #             b.datems,
        #             b.latitude,
        #             b.longitude,
        #             b.active,
        #             fc.name as "frequence_collect",
        #             b.lastupdate,
        #             fl.name as "frequence_lavage",
        #             tb.name as "typeb",
        #             tb.capacity,
        #             i.img_green,
        #             i.name as "icon_name",
        #             fb.name as "famille",
        #             t.ntag,
        #             t.lasttime
        #             FROM public.is_rfid_rfid r
        #             inner join public.is_rfid_tags t on r.tag1=t.ntag
        #             inner join public.is_rfid_bacs b on b.id=t.idbac
        #             INNER JOIN public.is_rfid_frequences fl ON (b.freqlavage = fl.id)
        #             INNER JOIN public.is_rfid_frequences fc ON (b.freqcollecte = fc.id)
        #             INNER JOIN public.is_rfid_typebacs tb ON (b.typeb = tb.id)
        #             INNER JOIN public.is_rfid_famille_bac fb ON (tb.famille_id = fb.id)
        #             INNER JOIN public.is_rfid_icons i ON (tb.icon = i.id)
        #             where deviceid = {} and devicetime between '{}'::timestamp and '{}'::timestamp
        # """

        query = """
        SELECT is_rfid_rfid.id,
        
            
            
            fl.name AS freqlavage,
            fc.name AS freqcollecte,
            is_bav_marque.name AS marque,
            is_bav_bacs.categorie,
            
            
        
            
            is_bav_types.name
        FROM is_bav_bacs
            JOIN is_bav_frequences fl ON is_bav_bacs.freqlavage = fl.id
            JOIN is_bav_frequences fc ON is_bav_bacs.freqcollecte = fc.id
            JOIN is_bav_marque ON is_bav_bacs.marque = is_bav_marque.id
            JOIN is_bav_tags ON is_bav_bacs.id = is_bav_tags.idbac
            JOIN is_rfid_rfid ON is_rfid_rfid.tag1::text = is_bav_tags.ntag::text AND is_bav_tags.ntag::text = is_rfid_rfid.tag1::text
            JOIN is_bav_types ON is_bav_bacs.is_bav_type_id = is_bav_types.id

        where is_rfid_rfid.deviceid = {} and devicetime between '{}' and '{}'
        """



        self.env.cr.execute(query.format(idd,d1,d2))
        # result2 = self.env.cr.dictfetchall()
        result = self.env.cr.dictfetchall()


        # result=[]
        # result.append(result1)
        # result.append(result2)

        return result


class dh(models.Model):
    _inherit =  "is_tools.dh"

    def getHistoriqueDH(self,idd,date1,date2):     
        res = self.env['is_tools.dh'].search_read([("deviceid", "=", idd),("datej", ">=", date1), ("datej", "<=", date2)],[])
        return res
        
class vd(models.Model):
    _inherit =  "is_tools.vd"

    def getHistoriqueVD(self,idd,date1,date2):     
        res = self.env['is_tools.vd'].search_read([("deviceid", "=", idd),("datej", ">=", date1), ("datej", "<=", date2)],[])
        return res

class CalculePos(models.Model):
    _name = 'is_historique.calcule'
    #_auto = False

    deviceid = fields.Integer(string='Device ID')
    datep = fields.Char(string='DATEP')
    unique_id = fields.Char(string='Unique ID')
    acc = fields.Char(string='Acc')
    duree = fields.Char(string='DUREE CONDUITE')
    arret = fields.Char(string='ARRET')
    new_adresse = fields.Char(string='ADRESSE ARRIVEE')
    old_adresse = fields.Char(string='ADRESSE DEPART')
    sommeD = fields.Float(string='DISTANCE')
    start_datetime = fields.Char(string='HEURE DEBUT')
    end_datetime = fields.Char(string='HEURE FIN')
    datej = fields.Char(string='DATE')
    uuid = fields.Char(string='UUID')

    def hisGetIcon(self,id):
        new_query = """
        SELECT * FROM public.fleet_vehicle_icon 
        where id = {} 
        """

        # Execute the SQL query and fetch the results
        self.env.cr.execute(new_query.format(id))
        result = self.env.cr.dictfetchall()

       
        
        return result



# class is_historique(models.Model):
#     _name = 'is_historique.is_historique'
#     _description = 'is_historique.is_historique'

#     name = fields.Char()
#     value = fields.Integer()
#     value2 = fields.Float(compute="_value_pc", store=True)
#     description = fields.Text()
#
#     @api.depends('value')
#     def _value_pc(self):
#         for record in self:
#             record.value2 = float(record.value) / 100
