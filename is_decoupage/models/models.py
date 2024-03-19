# -*- coding: utf-8 -*-

from odoo import models, fields, api
import json,math
from shapely import wkt
import geojson
import logging
_logger = logging.getLogger(__name__)

#======================ZONES ET DECOUPAGES====================================
class IsDecoupageCircuitRouteRel(models.Model):
    _name = 'is_decoupage.circuit_route_rel'
    _description = 'Association entre Circuit et Route'

    circuit_id = fields.Many2one('is_decoupage.circuits', string="Circuit")
    route_id = fields.Many2one('is_decoupage.routes', string="Route")
    sequence = fields.Integer('Ordre')
    fusion = fields.Integer('Fusion')

    _sql_constraints = [
        ('unique_circuit_route', 'unique(circuit_id, route_id)',
         'Une route ne peut apparaître qu\'une fois dans un circuit'),
    ]
class IsDecoupage(models.Model):
    _name = 'is_decoupage'
    _inherit = 'google.drawing.shape'
    _description = 'Gestion du découpage'

    name = fields.Char()
    description = fields.Text()

    decoup_id = fields.Many2one(
        'is_decoupage.detail', required=True, ondelete='cascade'
    )

    @staticmethod
    def json_polygon_to_wkt(input_str):
        data = json.loads(input_str)
        if data.get("type") != "polygon":
            return None
        coordinates = data["options"]["paths"]

        # Ensure the polygon is closed
        if coordinates[0] != coordinates[-1]:
            coordinates.append(coordinates[0])

        wkt_coords = ', '.join([f"{coord['lat']} {coord['lng']}" for coord in coordinates])
        return f"POLYGON(({wkt_coords}))"

    def json_polyline_to_wkt(input_str):
        data = json.loads(input_str)
        if data.get("type") != "polyline":
            return None
        coordinates = data["options"]["path"]

        wkt_coords = ', '.join([f"{coord['lat']} {coord['lng']}" for coord in coordinates])
        return f"POLYGON(({wkt_coords}))"

    def circle_to_wkt(input_str, num_points=32):
        """
        Convert JSON representation of a circle to WKT.
        num_points defines the number of points to approximate the circle.
        """
        data = json.loads(input_str)
        if data.get("type") != "circle":
            return None

        center = data["options"]["center"]
        radius = data["options"]["radius"] / 111.32  # Convert km to degrees approx.

        circle_points = []
        for i in range(num_points):
            angle = math.radians(float(i) / num_points * 360.0)
            dx = radius * math.cos(angle)
            dy = radius * math.sin(angle)
            circle_points.append((center['lat'] + dy, center['lng'] + dx))
        circle_points.append(circle_points[0])  # Close the circle

        wkt_coords = ', '.join([f"{lat} {lng}" for lat, lng in circle_points])
        return f"POLYGON(({wkt_coords}))"

    def rectangle_to_wkt(input_str):
        """
        Convert JSON representation of a rectangle to WKT.
        """
        data = json.loads(input_str)
        if data.get("type") != "rectangle":
            return None

        bounds = data["options"]["bounds"]
        south, west, north, east = bounds["south"], bounds["west"], bounds["north"], bounds["east"]

        # Create a list of rectangle's vertices in the order: bottom-left, bottom-right, top-right, top-left
        rectangle_points = [
            (south, west),
            (south, east),
            (north, east),
            (north, west),
            (south, west)  # Close the rectangle
        ]

        wkt_coords = ', '.join([f"{lat} {lng}" for lat, lng in rectangle_points])
        return f"POLYGON(({wkt_coords}))"

    def update_geom_from_gshape(self):
        for record in self:
            shape_type = json.loads(record.gshape_paths).get("type")
            if shape_type == "polygon":
                wkt_str = IsDecoupage.json_polygon__to_wkt(record.gshape_paths)
            elif  shape_type == "polyline":
                wkt_str = IsDecoupage.json_polyline__to_wkt(record.gshape_paths)
            elif shape_type == "circle":
                wkt_str = IsDecoupage.circle_to_wkt(record.gshape_paths)
            elif shape_type == "rectangle":
                wkt_str = IsDecoupage.rectangle_to_wkt(record.gshape_paths)
            else:
                wkt_str = None

            if wkt_str:
                try:
                    self.env.cr.execute("""
                        UPDATE is_decoupage
                        SET geom = ST_GeomFromText(%s, 4326)
                        WHERE id = %s
                    ;""", (wkt_str, record.id))
                except Exception as e:
                    _logger.error(f"Error updating geometry for record {record.id}: {str(e)}")

    def all(self):
        return self.env['is_decoupage'].search_read([],[])
    
class IsDecoupageDetail(models.Model):
    _name = 'is_decoupage.detail'

    name = fields.Char('Nom')
    sequence = fields.Integer('Ordre')
    shape_line_ids = fields.One2many(
        'is_decoupage', 'decoup_id', string='Area'
    )
#======================PROVINCES====================================

class IsDecoupageProvinces(models.Model):
    _name = 'is_decoupage.provinces'
    _inherit = 'google.drawing.shape'
    _description = 'Gestion des Provinces'


    code = fields.Char()
    coderegion = fields.Char()
    region = fields.Char('Région')
    population  = fields.Integer()
    menage = fields.Integer()
    menage_etrangers = fields.Integer()
    menage_marocains = fields.Integer()


    @staticmethod
    def wkt_to_custom_json(wkt_str):
        # Convertir le WKT en objet géométrique Shapely
        geometry = wkt.loads(wkt_str)

        # Traiter en fonction du type de géométrie
        if geometry.geom_type == "MultiPolygon":
            polygons = []
            lines = {}
            for polygon in geometry.geoms:  # Notez l'utilisation de .geoms ici
                coords = list(polygon.exterior.coords)
                paths = [{"lat": lat, "lng": lon} for lon, lat in coords[:-1]]
                polygons.append({"paths": paths})

                for idx, (start, end) in enumerate(zip(polygon.exterior.coords[:-1], polygon.exterior.coords[1:])):
                    # Ici, on calcule la longueur de la ligne. Pour une approximation plus précise,
                    # vous pouvez utiliser d'autres formules pour calculer la distance entre deux points sur une sphère.
                    length = ((end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2) ** 0.5
                    lines[str(idx + 1)] = {
                        "start": {"lat": start[1], "lng": start[0]},
                        "stop": {"lat": end[1], "lng": end[0]},
                        "length": length
                    }

            json_data = {
                "type": "polygon",
                "options": polygons[0],
                "lines": lines  # Logique pour les lignes
            }
        else:
            raise ValueError(f"Type de géométrie non pris en charge: {geometry.geom_type}")

        return json.dumps(json_data)

    def update_gshape_from_geom(self):
        for record in self:
            try:
                self.env.cr.execute("""
                    SELECT ST_AsText(geom)
                    FROM is_decoupage_provinces
                    WHERE id = %s
                ;""", (record.id,))
                wkt_str = self.env.cr.fetchone()[0]

                if wkt_str:
                    gshape_str = self.wkt_to_custom_json(wkt_str)

                    record.gshape_paths = gshape_str
            except Exception as e:
                _logger.error(f"Error updating gshape for record {record.id}: {str(e)}")

    def update_all_gshapes(self):
        provinces = self.env['is_decoupage.provinces'].search([])
        for province in provinces:
            province.update_gshape_from_geom()

#====================== ROUTES ET CIRCUITS====================================

class IsDecoupageCircuitsMethodes(models.Model):
    _name = "is_decoupage.circuits.methodes"
    _description = "Méthode de calcul du taux de réalisation"
    name = fields.Char()


class IsDecoupageCircuits(models.Model):
    _name = 'is_decoupage.circuits'
    _description = 'Gestion des Circuits'
    name  = fields.Char('Nom du circuit')
    frequence_id = fields.Many2one('is_bav.frequences', string='Fréquence')
    fonction_id = fields.Many2one('fleet.vehicle.fonction', string='Fonction')
    methode_id = fields.Many2one('is_decoupage.circuits.methodes', string='Méthode Calcul Taux')
    group = fields.Many2one('fleet.vehicle.group', string="Groupe")
    Secteur = fields.Char('Secteur')
    color = fields.Char(string='Color')
    route_ids = fields.One2many('is_decoupage.circuit_route_rel', 'circuit_id', string="Routes associées")
    def get_all(self):
        return self.env['is_decoupage.circuits'].search_read([],[])

class IsDecoupageRoutes(models.Model):
    _name = 'is_decoupage.routes'
    _inherit = 'google.drawing.shape'
    _description = 'Gestion des Routes'
    circuit_ids = fields.Many2many(
        'is_decoupage.circuits',
        relation='is_decoupage_circuit_route_rel',
        column1='route_id',
        column2='circuit_id',
        string='Circuits'
    )

    @staticmethod
    def wkt_routes_to_custom_json(wkt_str):
        # Convertir le WKT en objet géométrique Shapely
        geometry = wkt.loads(wkt_str)

        print(geometry)
        # Traiter en fonction du type de géométrie
        if geometry.geom_type == "MultiLineString":
            polylines = []
            lines = {}


            for polyline in geometry.geoms:  # Notez l'utilisation de .geoms ici
                coords = list(polyline.coords)
                paths = [{"lat": lat, "lng": lon} for lon, lat in coords]
                polylines.append({"path": paths})

            # for idx, (start, end) in enumerate(zip(polyline.exterior.coords[:-1], polyline.exterior.coords[1:])):
            #     # Ici, on calcule la longueur de la ligne. Pour une approximation plus précise,
            #     # vous pouvez utiliser d'autres formules pour calculer la distance entre deux points sur une sphère.
            #     length = ((end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2) ** 0.5
            #     lines[str(idx + 1)] = {
            #         "start": {"lat": start[1], "lng": start[0]},
            #         "stop": {"lat": end[1], "lng": end[0]},
            #         "length": length
            #     }

            json_data = {
                "type": "polyline",
                "options": polylines[0]
                # "lines": lines  # Logique pour les lignes
            }
        else:
            raise ValueError(f"Type de géométrie non pris en charge: {geometry.geom_type}")

        return json.dumps(json_data)

    def update_routes_gshape_from_geom(self):
        for record in self:
            try:
                self.env.cr.execute("""
                    SELECT ST_AsText(geom)
                    FROM is_decoupage_routes
                    WHERE id = %s
                ;""", (record.id,))
                wkt_str = self.env.cr.fetchone()[0]

                if wkt_str:
                    gshape_str = self.wkt_routes_to_custom_json(wkt_str)

                    record.gshape_paths = gshape_str
            except Exception as e:
                _logger.error(f"Error updating gshape for record {record.id}: {str(e)}")

    def update_routes_all_gshapes(self):
        routes = self.env['is_decoupage.routes'].search([])
        for route in routes:
            route.update_routes_gshape_from_geom()






