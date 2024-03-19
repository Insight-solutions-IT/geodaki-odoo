# -*- coding: utf-8 -*-

from odoo import models, fields, api


class rfid(models.Model):
    _name = 'rfid.rfid'
    _description = 'rfid.rfid'

    name = fields.Char()
    value = fields.Integer()
    value2 = fields.Float(compute="_value_pc", store=True)
    description = fields.Text()

  
# class icon(models.Model):
#     _name = "is_rfid.icons"
#     _description = "Les icons" 
#     name = fields.Char()  # Binary(string="nom")
#     img_red_   =fields.Image("Icon rouge")
#     img_red    = fields.Char("image rouge")
#     img_green  = fields.Char("Image verte")
#     img_green_ = fields.Image("Image verte")
#     img_mouve  =fields.Char("Image mouve")
#     img_mouve_ =fields.Image("Image mouve")

 



# class famille(models.Model):
#     _name = "is_rfid.famille_bac"
#     _description = ""
#     name = fields.Char()


# class freq(models.Model):
#     _name = "is_rfid.frequences"
#     _description = "Les frequences"
#     name = fields.Char()
#     nbrh = fields.Integer("nombre d'heure")


# class tag_type(models.Model):
#     _name = "is_rfid.type_tag"
#     name = fields.Char()


# class type(models.Model):
#     _name = "is_rfid.typebacs"
#     _description = "Les types de bac"
#     name = fields.Char("Nom")
#     capacity = fields.Integer("Capacity")
#     nature = fields.Char("Nature")
#     marque = fields.Char("La marque")
#     icon = fields.Many2one("is_rfid.icons", "Icon", required=False)
#     famille_id = fields.Many2one("is_rfid.famille_bac", "Famille")

#     """  
#         Bacs table 
#     """


# class bac(models.Model):
#     _name = "is_rfid.bacs"
#     _description = "La table de bacs"
#     numpark = fields.Char()
#     numbac = fields.Char()
#     adresse = fields.Char()
#     latitude = fields.Float()
#     longitude = fields.Float()
#     newla = fields.Char()
#     newlo = fields.Char()
#     typeb = fields.Many2one("is_rfid.typebacs", "Type de bac", required=True)
#     lastdeviceid = fields.Integer()
#     lastupdate = fields.Datetime("Last update")
#     datems = fields.Char("date de mise en service")
#     freqlavage = fields.Many2one(
#         "is_rfid.frequences", "Frequence de collecte", required=True
#     )
    
#     freqcollecte = fields.Many2one(
#         "is_rfid.frequences", "Frequence lavage", required=True
#     )
#     nbr_tag = fields.Char("Nombre de tags")
#     active = fields.Boolean("Active", default=True)
#     fixpos = fields.Char("Positions fix", default=False)

#     def getAllActiveBacs(self):
#         return self.env["is_rfid.bacs"].search_read([("active", "=", True)], [id])
    
#     def getByType(self, type):
#         # Search for records of type is_rfid.typebacs matching the provided 'type'
#         # type_records = self.env['is_rfid.typebacs'].search([('name', 'ilike', '%'+type+'%')])

#         # # Extract the 'id' field from the search result (if any records were found)
#         # type_ids = type_records.ids

#         # # Search for records of type is_rfid.bacs that have 'typeb' matching the 'type_ids'
#         # bacs_records = self.env['is_rfid.bacs'].search([('typeb', 'in', type_ids), ('active', '=', True)])

#         # # Convert the search results to a list of dictionaries
#         # result = bacs_records.read([])

#         # return result
#         query= """
#             SELECT b.id,
#                 b.id AS idbac,
#                 b.typeb,
#                 b.lastupdate,
#                 b.freqlavage,
#                 b.freqcollecte,
#                 b.lastdeviceid,
#                 b.numpark,
#                 b.numbac,
#                 b.adresse,
#                 b.newla,
#                 b.newlo,
#                 b.datems,
#                 b.nbr_tag,
#                 b.fixpos,
#                 b.active,
#                 b.latitude,
#                 b.longitude,
#                 tb.id AS idtypeb,
#                 tb.capacity,
#                 tb.icon AS iconid,
#                 tb.name,
#                 tb.nature,
#                 tb.marque,
#                 icons.id AS idicon,
#                 icons.name AS "iconName",
#                 icons.img_red,
#                 icons.img_green,
# 				fc.name as "freq_c", 
# 				fc.nbrh as "nbrh_c",
# 				fl.name as "freq_l",
# 				fl.nbrh as "nbrh_l",
#                 v.device
#             FROM is_rfid_bacs b
#                 JOIN is_rfid_typebacs tb ON b.typeb = tb.id
#                 JOIN is_rfid_icons icons ON icons.id = tb.icon
#                 JOIN is_rfid_frequences fc on fc.id = b.freqcollecte 
# 				JOIN is_rfid_frequences fl on fl.id = b. freqlavage
# 				LEFT JOIN public.fleet_vehicle v on v.id = lastdeviceid
#             WHERE lower(tb.name) like '%{}%'    
#         """


#         self.env.cr.execute(query.format(type))
#         result = self.env.cr.dictfetchall()
        
#         return result


# class IsRfidTags(models.Model):
#     _name = "is_rfid.tags"
#     _description = "Les tags"

#     ntag = fields.Char("N tag")
#     lastp1 = fields.Char()
#     orientation = fields.Char()
#     lasttime = fields.Datetime("Last time")
#     lng = fields.Float()
#     lat = fields.Float()
#     lastdevice = fields.Integer()
#     idbac = fields.Many2one("is_rfid.bacs", "Bac")


# class tableTest(models.Model):
#     _name = "is_rfid.tabletest"
#     _auto = False
#     name = fields.Char("name")
#     image_128 = fields.Image("Logo", max_width=128, max_height=128)


class FleetVehiclePositions(models.Model):
    _inherit = "fleet.vehicle.positions2"
    def get_positions(self, device, start, end):
        print("positions---------------------------")
        query = """
            select fleet_vehicle_positions2.*, fv.device from public.fleet_vehicle_positions2 join public.fleet_vehicle fv on fv.id = fleet_vehicle_positions2.deviceid
            where deviceid = {} and fixtime between '{}'::timestamp and '{}'::timestamp
            order by fixtime
        """.format(device, start, end)
        print(query)
        self.env.cr.execute(query)
        res = self.env.cr.dictfetchall()
        return res
    
    def get_positions2(self, device, start, end):
        print("positions---------------------------2222222222222222")
        resu = self.env['fleet.vehicle.positions2'].search_read([
                        ('deviceid', '=', device),
                        ('fixtime', '>=', start),
                        ('fixtime', '<=', end)
                    ], [], order='fixtime')
        return resu

    # protocol = fields.Char(string="Protocol", size=128)
    # deviceid = fields.Integer(string="Device ID", required=True)
    # servertime = fields.Datetime(string="Server Time", required=True)
    # devicetime = fields.Datetime(string="Device Time", required=True)
    # fixtime = fields.Datetime(string="Fix Time", required=True)
    # valid = fields.Boolean(string="Valid", required=True)
    # latitude = fields.Float(string="Latitude", required=True)
    # longitude = fields.Float(string="Longitude", required=True)
    # altitude = fields.Float(string="Altitude")
    # speed = fields.Float(string="Speed")
    # course = fields.Float(string="Course")
    # address = fields.Char(string="Address", size=512)
    # attributes = fields.Char(string="Attributes", size=4000)
    # accuracy = fields.Float(string="Accuracy", default=0)
    # network = fields.Char(string="Network", size=4000)
    # geom = fields.Char(string="Geometry (,Point,4326)")
    # flags = fields.Char(string="Flags", size=5)
    # gps = fields.Char(string="GPS", size=3)
    # distance = fields.Float(string="Distance")
    # d2 = fields.Float(string="D2")
    # iccid = fields.Char(string="ICCID", size=20)
    # sat = fields.Integer(string="Satellites")
    # bat = fields.Integer(string="Battery")
    # id_cirdet = fields.Integer(string="ID Cirdet")
    # dsb = fields.Boolean(string="DSB", default=False)
    # powerdetect = fields.Integer(string="Power Detect")
    # acc = fields.Char(string="Acc", required=True, default="0")
    # nomrue = fields.Char(string="Nomrue", size=100)
    # id2 = fields.Integer(string="ID2", default=0, digits=(18, 0))
    # power2 = fields.Integer(string="Power2")
    # power3 = fields.Integer(string="Power3")
    # odometre = fields.Integer(string="Odometre")
    # km = fields.Integer(string="Kilometers")
    # hrs = fields.Integer(string="Hours")
    # gas = fields.Integer(string="Gas")
    # capt = fields.Char(string="Capt", size=40)
    # can4 = fields.Integer(string="CAN 4")
    # can5 = fields.Integer(string="CAN 5")
    # can6 = fields.Integer(string="CAN 6")
    # can7 = fields.Integer(string="CAN 7")
    # can8 = fields.Integer(string="CAN 8")
    # can9 = fields.Integer(string="CAN 9")
    # can10 = fields.Integer(string="CAN 10")     
    # datep = fields.Date(string="Datep")         
    




class rfid(models.Model):
    _name="is_rfid.rfid"
    # _auto=False
    deviceid=fields.Many2one("fleet.vehicle")
    servertime=fields.Datetime("Server time")
    devicetime=fields.Datetime("Device time")
    tag1=fields.Char("Tag")
    p1=fields.Integer('')
    lat=fields.Float("Latutude")
    lon=fields.Float("Longitude")

    def getTagLAst10s(self, id):
        query = """
            select * from public.is_rfid_rfid 
            where devicetime >= current_timestamp - '00:10:00'::time and deviceid= {}
        """

    



#     """"
#         deviceid integer NOT NULL,
#         servertime timestamp(0) without time zone NOT NULL,
#         devicetime timestamp(0) without time zone NOT NULL,
#         tag1 character varying(28) COLLATE pg_catalog."default" NOT NULL,
#         p1 integer NOT NULL,
#         lat double precision,
#         lon double precision,
#     """
