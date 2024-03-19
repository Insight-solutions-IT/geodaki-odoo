from odoo import api, models ,fields, tools
from psycopg2 import sql


    

class VRfidReaded(models.Model):

    _name="is_rfid.readed_bacs"
    _description=""

    numero = fields.Char(string='Numero')
    device = fields.Char(string='Device')
    devicetime=fields.Char("devicetime")
    typeb=fields.Char("type bac")
    lastlatitude = fields.Float(string='Last Latitude')
    lastlongitude = fields.Float(string='Last Longitude')
    session_uid =fields.Integer()

    def isExist(self, uid): 
        existing_record = self.search([('session_uid', '=', uid)], limit=1)
        return bool(existing_record)

    def insert(self, records, uid):
        # print(uid)
        # print(records)
        for record in records:
        # Create a new record in the is_rfid.readed_bacs 
            # print(record )
            lastlatitude_str = record.get('lastlatitude')
            if lastlatitude_str is not None:
                lastlatitude_str = lastlatitude_str.replace(',', '.')  # Replace ',' with '.'
                lastlatitude_float = float(lastlatitude_str)
            else:
                # Handle the case when 'lastlatitude' is None, you can assign a default value or raise an exception as needed.
                lastlatitude_float = 0.0 
            lastlongitude_str = record.get('lastlatitude')
            if lastlongitude_str is not None:
                lastlongitude_str = lastlongitude_str.replace(',', '.')  # Replace ',' with '.'
                lastlongitude_float = float(lastlongitude_str)
            else:
                # Handle the case when 'lastlatitude' is None, you can assign a default value or raise an exception as needed.
                lastlongitude_float = 0.0 
            self.create({
                'numero': record.get('numero'),
                'device': record.get('device'),
                'devicetime': record.get('heure'),
                'typeb': record.get('typeb'),
                'lastlatitude': lastlatitude_float,
                'lastlongitude': lastlongitude_float,
                'session_uid': uid
            })
    def delete(self, session_uid): 
        records_to_delete = self.search([('session_uid', '=', session_uid)])
        records_to_delete.unlink()

class VRfidReadedForCIr(models.Model):

    _name="is_rfid.readed_bacs_in_cir"
    _description=""

    numero = fields.Char(string='Numero')
    device = fields.Char(string='Device')
    circuit= fields.Char(string="Circuit")
    devicetime=fields.Char("devicetime")
    typeb=fields.Char("type bac")
    lastlatitude = fields.Float(string='Last Latitude')
    lastlongitude = fields.Float(string='Last Longitude')
    session_uid =fields.Integer()

    def isExist(self, uid): 
        existing_record = self.search([('session_uid', '=', uid)], limit=1)
        return bool(existing_record)

    def insert(self, records, uid):
        print("deleteing old values : ")
        print(records)
        print("deleteing old values : ")
        self.delete(uid)
        print("succefully deleted ")

        for record in records:
        # Create a new record in the is_rfid.readed_bacs 
            print(record )
            lastlatitude_str = record.get('lat') 
            lastlongitude_str = record.get('lon')

            self.create({
                'numero': record.get('numero'),
                'device': record.get('device'),
                'circuit': 'record.get(scircuit)',
                'devicetime': record.get('heure'),
                'typeb': record.get('typeb'),
                'lastlatitude': lastlongitude_str,
                'lastlongitude': lastlatitude_str,
                'session_uid': uid
            })  
    def delete(self, session_uid): 
        records_to_delete = self.search([('session_uid', '=', session_uid)])
        records_to_delete.unlink()

class VRfidReadedForZone(models.Model):

    _name="is_rfid.readed_bacs_in_zone"
    _description=""

    numero = fields.Char(string='Numero')
    device = fields.Char(string='Device')
    circuit= fields.Char(string="Circuit")
    devicetime=fields.Char("devicetime")
    typeb=fields.Char("type bac")
    lastlatitude = fields.Float(string='Last Latitude')
    lastlongitude = fields.Float(string='Last Longitude')
    session_uid =fields.Integer()

    def isExist(self, uid): 
        existing_record = self.search([('session_uid', '=', uid)], limit=1)
        return bool(existing_record)

    def insert1(self, records, uid):
        print("deleteing old values : *******************************------------------------------********************** ")
        print(records)
        print("deleteing old values : ")
        self.delete(uid)
        print("succefully deleted ")
        # print(records)
        for record in records:
        # Create a new record in the is_rfid.readed_bacs 
            print(record )
            lastlatitude_str = record.get('lat') 
            lastlongitude_str = record.get('lon')

            self.create({
                'numero': record.get('numero'),
                'device': record.get('device'),
                'circuit': 'record.get(scircuit)',
                'devicetime': record.get('heure'),
                'typeb': record.get('typeb'),
                'lastlatitude': lastlongitude_str,
                'lastlongitude': lastlatitude_str,
                'session_uid': uid
            })  
    def delete(self, session_uid): 
        records_to_delete = self.search([('session_uid', '=', session_uid)])
        records_to_delete.unlink()
