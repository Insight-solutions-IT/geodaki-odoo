/** @odoo-module **/

import { registry } from "@web/core/registry";
const rpc = require('web.rpc');
import { useService } from "@web/core/utils/hooks";



const { Component, onWillUnmount ,onMounted, useState} = owl;


    export  const drawZoneDaki = async (map,zonesTrace,zoneLabel,zones)=> {
        // Extract polyline options from the provided JSON data
        self=this;

        
        zones.forEach(zone=>{
            if(zone.gshape_type!='circle'){
                
                console.log( zone.geom);
                    const coordinates = zone.geom
                    .replace("MULTIPOLYGON(((", "")
                    .replace(")))", "")
                    .split(",");

                    var coor=[]
            var coor2=[]
            for(var i=0;i<coordinates.length;i++){
                console.log(coordinates[i].toString().split(" "))
                 coor.push(coordinates[i].toString().split(" "))
                 coor2.push({lat: parseFloat(coor[i][1]),lng: parseFloat(coor[i][0])})
                }
                console.log(coor2)

                
                // Create a Polyline object and set its path
                const polyline = new google.maps.Polygon({
                  path: coor2,
                  strokeColor: '#FF0000',
                  strokeOpacity: 1.0,
                  strokeWeight: 2,
                  fillColor: '#FF0000',
                  fillOpacity: 0,
                  map: map,
                });
                zonesTrace.push(polyline)
                const center = zone.center
                    .replace("POINT(", "")
                    .replace(")", "")
                    .split(" ");
                console.error(center)
                    const polygonCenter = { lat: parseFloat(center[1]), lng: parseFloat(center[0])  };

                const marker = new google.maps.Marker({
                    position: polygonCenter,
                    map: map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,  // Adjust the scale value to change the size
                        fillColor: '#FF0000',  // Set the fill color
                        fillOpacity: 0,  // Set the fill opacity
                        strokeWeight: 0  // Set the stroke weight to 0 for no border
                      },
                    label: {
                        text: zone.gshape_name,
                        color: 'black',  // Set the color of the label text
                        fontWeight: 'bold' ,
                        fontSize: '14px'// Make the label text bold
                      },})
                      zoneLabel.push(marker)
            }    
        })
        
      
        // Set the Polyline on the map
        // shape = new google.maps.Circle({
        //     center: { lat: shapeData.options.center.lat, lng: shapeData.options.center.lng },
        //     radius: shapeData.options.radius,
        //     strokeColor: '#FF0000',
        //     strokeOpacity: 1.0,
        //     strokeWeight: 2,
        //     fillOpacity: 0.2,
        //     map: this.map,
        //   });
      }


      export const delete_zones_Daki = (zones,zoneLabels) =>{
          if(zones!=[] || zones !=null || zones.length>0){
              for (var i = 0; i < zones.length; i++) {
                  zones[i].setMap(null);
                  
                } }
                
zones=[]

if(zoneLabels!=[] || zoneLabels !=null || zoneLabels.length>0){
        for (var i = 0; i < zoneLabels.length; i++) {
            zoneLabels[i].setMap(null);
            
        }
        zoneLabels=[]
    }
}



