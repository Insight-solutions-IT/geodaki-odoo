/** @odoo-module **/

import { registry } from "@web/core/registry";
const rpc = require("web.rpc");
import { useService } from "@web/core/utils/hooks";

const { Component, onWillUnmount, onMounted, useState } = owl;

export const drawZoneDaki = async (map, zonesTrace, zoneLabel) => {
  // Extract polyline options from the provided JSON data
  // self=this;

  var zones = await rpc.query({
    model: "is_decoupage",
    method: "getZones",
    args: [[]],
  });
  zones.forEach((zone) => {
    if (zone.gshape_type != "circle") {
      //console.log( zone.geom);
      const coordinates = zone.geom
        .replace("MULTIPOLYGON(((", "")
        .replace(")))", "")
        .split(",");

      var coor = [];
      var coor2 = [];
      for (var i = 0; i < coordinates.length; i++) {
        //console.log(coordinates[i].toString().split(" "))
        coor.push(coordinates[i].toString().split(" "));
        coor2.push({
          lat: parseFloat(coor[i][1]),
          lng: parseFloat(coor[i][0]),
        });
      }
      //console.log(coor2)

      // Create a Polyline object and set its path
      const polyline = new google.maps.Polygon({
        path: coor2,
        strokeColor: "#000000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0,
        map: map,
      });
      zonesTrace.push(polyline);
      const center = zone.center
        .replace("POINT(", "")
        .replace(")", "")
        .split(" ");
      //console.error(center)
      const polygonCenter = {
        lat: parseFloat(center[1]),
        lng: parseFloat(center[0]),
      };

      const marker = new google.maps.Marker({
        position: polygonCenter,
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8, // Adjust the scale value to change the size
          fillColor: "#FF0000", // Set the fill color
          fillOpacity: 0, // Set the fill opacity
          strokeWeight: 0, // Set the stroke weight to 0 for no border
        },
        label: {
          text: zone.gshape_name,
          color: "black", // Set the color of the label text
          fontWeight: "bold",
          fontSize: "14px", // Make the label text bold
        },
      });
      zoneLabel.push(marker);
    }
  });

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
};

export const delete_zones_Daki = (zones, zoneLabels) => {
  if (zones != [] || zones != null || zones.length > 0) {
    for (var i = 0; i < zones.length; i++) {
      zones[i].setMap(null);
    }
  }

  zones = [];

  if (zoneLabels != [] || zoneLabels != null || zoneLabels.length > 0) {
    for (var i = 0; i < zoneLabels.length; i++) {
      zoneLabels[i].setMap(null);
    }
    zoneLabels = [];
  }
};

const TestComponent = async (map, id, Startdate) => {
  let circuits = [];
  circuits = [];
  var myHeaders = new Headers();
  myHeaders.append(
    "Cookie",
    "frontend_lang=fr_FR; session_id=aa01331b68e8be7eb7bdbe5baf55bde39cc11f00"
  );

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    redirect: "follow",
  };
  const [datej, time] = Startdate.split(" ");
  await fetch(
    `${window.location.origin}/is_diagnostic/is_diagnostic/get_diagnostic_circuit?deviceid=${id}&datej=${datej}`,
    requestOptions
  )
    .then((response) => response.json())
    .then((result) => (circuits = result))
    .catch((error) => console.log("error", error));
  const colors = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FF00FF",
    "#1245c0",
    "#4e9dcb",
    "#482cc6",
    "#FFFF00",
  ];
  circuits.forEach((circuit, index) => {
    const coordinates = circuit.geom
      .replace("MULTILINESTRING((", "")
      .replace("))", "")
      .split(",")
      .map((coord) => {
        const [lng, lat] = coord.split(" ").map(parseFloat);
        return { lat, lng };
      });

    const polyline = new google.maps.Polyline({
      path: coordinates,
      strokeColor: colors[circuit.circuitid % colors.length] || "#808000",
      // strokeColor: colors[index % colors.length],
      strokeOpacity: 2.0,
      strokeWeight: 4,
      map: map,
    });
    const infoWindow = new google.maps.InfoWindow({
      content: `${circuit.name}`,
    });
    polyline.addListener("mouseover", function (event) {
      infoWindow.setContent(`${circuit.name}`);
      infoWindow.setPosition(event.latLng);
      infoWindow.open(map);
    });
    polyline.addListener("mouseout", function () {
      infoWindow.close();
    });
  });
};

export const renderCircuit = async (
  name,
  circuitRoutes,
  map,
  tempreel =null,
  operation = null,
  div = null,
  infowindowTrac = null
) => {
  var data = await rpc.query({
    model: "fleet_vehicle.circuit_view",
    method: "getCircuits",
    args: [[], name],
  });
  //console.time('time3')
  //console.log(data)

  data.forEach((item) => {
    const coordinates = item.geom
      .replace("MULTILINESTRING((", "")
      .replace("))", "")
      .split(",");

    var coor = [];
    var coor2 = [];
    for (var i = 0; i < coordinates.length; i++) {
      coor.push(coordinates[i].toString().split(" "));
      coor2.push({ lat: parseFloat(coor[i][1]), lng: parseFloat(coor[i][0]) });
    }
    var line;

    // if (tempreel != null) {
    //   line = new google.maps.Polyline({
    //     path: coor2,
    //     strokeColor: item.color, // Line color
    //     strokeOpacity: 1.0,
    //     strokeWeight: 2.5, // Line width
    //     map: map,
    //     title:
    //       operation == 
    //          "<div><h1> " + data[0].name + " </h1></div>"
            
    //   });
    //   circuitRoutes.push(line);
    // } else {
      line = new google.maps.Polyline({
        path: coor2,
        strokeColor: item.color, // Line color
        strokeOpacity: 1.0,
        strokeWeight: 2.5, // Line width
        map: map,
      });
      if (tempreel != null) {
      google.maps.event.addListener(line, 'click', function(event) {
        var infoWindow = new google.maps.InfoWindow({
          content: `<div><div><h1>Circuit:  ${data[0].name}  </h1></div><br>
          <div>Secteur: ${data[0].secteur}</div>
          <div>Frequence: ${data[0].frequence}</div>
          <div>Fonction: ${data[0].fonction}</div>
          <div>Methode: ${data[0].methode}</div>
          
          </div>`
        });
        infoWindow.setPosition(event.latLng);
        infoWindow.open(map);
      });
    }
      circuitRoutes.push(line);
    // }
  });

  if (operation != null) {
    circuitRoutes.forEach((elem) => {
      elem.setMap(map);

      elem.addListener("click", (e) => {
        if (infowindowTrac != null) {
          //alert(1)
          infowindowTrac.close();
        }

        infowindowTrac = new google.maps.InfoWindow({
          content: elem.title,
          maxWidth: 200,
          position: e.latLng,
        });
        //alert(1);
        infowindowTrac.open(map);
      });
    });
  }

  //console.timeEnd('time3')
};

 export const  drawTracage = async (mapi, vehicleId, start, end)=> {
    const colors = [
        "blue", "black", 'gray', "Brown", "Indigo",
    ];
    //console.error(vehicleId, " ", start, " ", end);
    try {
      let positions = [];
      await Promise.all([
        (positions = await rpc.query({
          model: "fleet.vehicle.positions2",
          method: "get_positions",
          args: [[], vehicleId, start, end],
        })),
      ]);
      let polylines = [];
      console.log(positions);
      let paths = [];

      positions.forEach((p) => {
        // console.log(p);
        paths.push({
          lat: p.latitude,
          lng: p.longitude,
        });
      });
      let randomColor = Math.floor(Math.random()*16777215).toString(16);
      randomColor = "#" + randomColor;
      console.log(paths);
      const poly = new google.maps.Polyline({
        //path: [{ lat: 35.7444, lng: -5.800731 },{ lat: 33.7444, lng: -5.800731 },{ lat: 35.7444, lng: -6.800731 }],
        path: paths,
        strokeColor: colors[Math.floor(Math.random() * colors.length)],
        strokeOpacity: 1.0,
        strokeWeight: 5,
        map: mapi,
      });
      let infowindow = new google.maps.InfoWindow();

      /*** */
      google.maps.event.addListener(poly, 'mouseover', function() {
          infowindow.setContent('Traçage du : ' + positions[0].device);
          infowindow.open(mapi, poly);
      });

      // Event listener for mouseout
      google.maps.event.addListener(poly, 'mouseout', function() {
          infowindow.close();
      });
      /*** */
      polylines.push(poly)
      //console.log(poly);
      // mapi.setCenter(paths[0]);
      return polylines;
    } catch (error) {
      console.error(error);
    }

  }
 export const  drawTracage2 = async (mapi, vehicleId, start, end)=> {
    const colors = [
        "blue", "black", 'gray', "Brown", "Indigo",
    ];
    //console.error(vehicleId, " ", start, " ", end);
    try {
      let positions = [];
      try{
        await Promise.all([
          (positions = await rpc.query({
            model: "fleet.vehicle.positions2",
            method: "get_positions2",
            args: [[], vehicleId, start, end],
          })),
        ]);
      }catch(e){
        console.warn(e);
      }
      let polylines = [];
      console.log(positions);
      let paths = [];

      positions.forEach((p) => {
        // console.log(p);
        paths.push({
          lat: p.latitude,
          lng: p.longitude,
        });
      });
      let randomColor = Math.floor(Math.random()*16777215).toString(16);
      randomColor = "#" + randomColor;
      console.log(paths);
      const poly = new google.maps.Polyline({
        //path: [{ lat: 35.7444, lng: -5.800731 },{ lat: 33.7444, lng: -5.800731 },{ lat: 35.7444, lng: -6.800731 }],
        path: paths,
        strokeColor: colors[Math.floor(Math.random() * colors.length)],
        strokeOpacity: 1.0,
        strokeWeight: 5,
        map: mapi,
      });
      // let infowindow = new google.maps.InfoWindow();

      /*** */
      // google.maps.event.addListener(poly, 'mouseover', function() {
      //     infowindow.setContent('Traçage du : ' + positions[0].device);
      //     infowindow.open(mapi, poly);
      // });

      // Event listener for mouseout
      // google.maps.event.addListener(poly, 'mouseout', function() {
      //     infowindow.close();
      // });
      /*** */
      polylines.push(poly)
      //console.log(poly);
      // mapi.setCenter(paths[0]);
      return polylines;
    } catch (error) {
      console.error(error);
    }

  }
 export const  drawTracagePoints = async (mapi, vehicleId, start, end)=> {
     
    //console.error(vehicleId, " ", start, " ", end);
    try {
      let positions = [];
      await Promise.all([
        (positions = await rpc.query({
          model: "fleet.vehicle.positions2",
          method: "get_positions",
          args: [[], vehicleId, start, end],
        })),
      ]);
      let polylines = [];
      //console.log(positions);
      let points = [];
      console.log(JSON.stringify(positions));
      let zeroSpeedCount = 0; // Counter for consecutive zero-speed entries

      positions.forEach((p) => {
          // Check if the speed is 0
          if (p.speed === 0) {
              // Increment counter if speed is 0
              zeroSpeedCount++;
          } else {
              // Reset counter if speed is not 0
              zeroSpeedCount = 0;
          }
          let infowindow = new google.maps.InfoWindow();

          // Add marker only if the zeroSpeedCount is less than or equal to 3
          if (zeroSpeedCount < 2) {
            let marker = new google.maps.Marker({
              position: {
                  lat: p.latitude,
                  lng: p.longitude,
              },
              map: mapi,
              icon: {
                  url: p.speed == 0 ? '/is_analyse_themmatique/static/img/pt.png' : '/is_analyse_themmatique/static/img/ptr.png',
                  scaledSize: new google.maps.Size(20, 10)
              }
          });
      
          // Event listener for mouseover
          google.maps.event.addListener(marker, 'mouseover', function() {
              infowindow.setContent('Time: ' + p.fixtime + '<br>Véhicule : ' + p.device);
              infowindow.open(mapi, marker);
          });
      
          // Event listener for mouseout
          google.maps.event.addListener(marker, 'mouseout', function() {
              infowindow.close();
          });
      
          points.push(marker);
              // points.push(
              //     new google.maps.Marker({
              //         position: {
              //             lat: p.latitude,
              //             lng: p.longitude,
              //         },
              //         map: mapi,
              //         icon: {
              //             url: p.speed == 0 ? '/is_analyse_themmatique/static/img/pt.png' : '/is_analyse_themmatique/static/img/ptr.png',
              //             scaledSize: new google.maps.Size(20, 10) // Set the width and height here
              //         }
              //     })
              // );
          }
      });
      
      return points;
    } catch (error) {
      console.error(error);
    }

  }


export { TestComponent };
