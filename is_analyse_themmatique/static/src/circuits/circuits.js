/** @odoo-module **/

import { registry } from "@web/core/registry";
const rpc = require("web.rpc");
import { useService } from "@web/core/utils/hooks";
import {
  drawTracage,
  drawTracage2,
  drawTracagePoints,
} from "../../../../is_decoupage/static/src/js/function.js";
const { Component, onWillStart, onMounted, useState } = owl;

export class AnalyseTemCircuit extends Component {
  setup() {
    this.state = useState({
      groups: [],
      vehicules: [],
      circuits: [],
      etat_conteneur: "collecte",
      type_afichage: "bac",
      displayTree: false,
      selectedVehicule: null,
      circuit_table: [],
      vtbd: [],
      circuit_table0: [
        {
          circuit: 227,
          circuit_name: "ARMS1",
          datej: "2023-12-25",
          device: "ARER5308",
          id: 1,
          taux: 100,
          vehicule: 31,
        },
      ],
    });
    this.uid = null;
    this.heightpopUp = null;
    this.map = null;
    this.chart = null;
    this.notification = useService("notification");
    this.orm = useService("orm");
    this.modelGroup = "fleet.vehicle.group";
    onMounted(async () => {
      document.getElementById("DisplayTree").style.marginLeft = "314px";
      document.getElementById("is_an_them_loader").style.display = "none";
      document.getElementById("loader").style.zIndex = "120";
      $(document).off("click", ".display_an_them_cir");
      console.log();
      
      const button = document.getElementById("mousEvent");
      button.addEventListener("mousedown", this.handler.bind(this));
      button.addEventListener("touchstart", this.handler.bind(this));
      await this.initMap();
    });
  }

  async LoadTree() {
    try {
      localStorage.removeItem("jstree");

      var vehicules = []; // this.state.vehicles;
      var groups = []; //this.state.groups;

      await Promise.all([
        rpc
          .query({
            model: "is_decoupage.circuits",
            method: "get_all",
            args: [[]],
          })
          .then((result) => {
            vehicules = result;
          }),
        rpc
          .query({
            model: "fleet.vehicle.group",
            method: "get_map_data2",
            args: [[]],
          })
          .then((result) => {
            groups = result;
          }),
      ]);

      $("#jstree").empty();
      console.log(vehicules, groups);
      const nestedData = this.createNestedData(vehicules, groups);

      $("#jstree")
        .jstree({
          core: {
            cache: false,
            //   check_callback: true,
            data: nestedData,
            themes: {
              responsive: true,
            },
          },
          checkbox: {
            //   cascade: 'up',
            keep_selected_style: false,
            three_state: false,
            whole_node: false,
            tie_selection: false,
          },
          search: {
            case_insensitive: true,
            show_only_matches: true,
          },
          plugins: [
            "wholerow",
            "contextmenu",
            // 'dnd',
            "search",
            "state",
            "types",
            "wholerow",
            "sort",
            //"checkbox",
          ],
        })
        .on("check_node.jstree uncheck_node.jstree", (e, data) => {
          const selectedText = data.selected
            .map((nodeId) => {
              const node = data.instance.get_node(nodeId);
              const parser = new DOMParser();
              const htmlDoc = parser.parseFromString(node.text, "text/html");
              const name = htmlDoc.querySelector(".vehicle-device").textContent;

              return name;
            })
            .join(", ");

          //console.log("Selected: " + selectedText);
        });

      $("#searchInputRef").on("input", (e) => {
        const searchString = e.target.value;
        $("#jstree").jstree("search", searchString);
      });
    } catch (error) {
      console.error("Error loading tree script:", error);
    }

    // $("#searchInputRef").on("input", (e) => {
    //   const searchString = e.target.value;
    //   console.log(searchString);
    //   $("#vehs").jstree("search", searchString);
    // });
  }
  async loadAllGroups() {
    // load data for (groups and vehicules)
    const currentDate = new Date();
    const currentDateString = currentDate
      .toISOString()
      .replace("T", " ")
      .split(" ")[0]; // Format as YYYY-MM-DD
    const currentTimeString = currentDate.toTimeString().split(" ")[0]; // Format as HH:mm
    const { Map, Marker } = await window.google.maps.importLibrary("maps");
    //console.log("map was added successfully");

    let map = null;
    this.map = new Map(document.getElementById("map"), {
      center: { lat: 33.998444, lng: -6.860961 },
      zoom: 8,
    });
    // Set default values for the date and time inputs
    document.getElementById("date_du").value = currentDateString + "T00:00:00";
    //document.getElementById('time_du').value = currentTimeString;
    document.getElementById("date_au").value = currentDateString + "T23:59";
    //document.getElementById('time_au').value = currentTimeString;
    /**
     *
     *
     * machi hna hh
     *
     *
     */
    try {
      await Promise.all([
        (this.state.vehicules = await rpc.query({
          model: "fleet.vehicle",
          method: "get_map_data_with_rfid",
          args: [[]],
        })),
        (this.state.groups = await rpc.query({
          model: "fleet.vehicle.group",
          method: "get_map_data2",
          args: [[]],
        })),
      ]);
      // console.log( JSON.stringify(this.state.vehicules) );
    } catch (error) {
      console.log(error);
    }

    //console.log(this.state.groups);
    //console.log(this.state.vehicules);
    // try to join groups and vehicule in one array
    let newd = [];
    this.state.vehicules.forEach((nd) => {
      newd.push({
        id: "VH-" + nd.id,
        groupid: nd.group,
        name: nd.device,
        type: "veh",
      });
    });
    this.state.groups.forEach((nd) => {
      newd.push({ id: nd.id, groupid: nd.groupid, name: nd.name, type: "gr" });
    });

    this.state.groups = newd;

    const data = this.state.groups;
    // console.log(data);

    //  create tree data function
    async function createTree(data, parentId) {
      const ul = document.createElement("ul");
      //console.log('data : ', data, ' || parentid: ',parentId );
      for (const node of data) {
        //console.log(node);
        // if (node === undefined) continue;
        if (
          (parentId === false && node.groupid === false) ||
          (node.groupid && node.groupid[0] === parentId)
        ) {
          const li = document.createElement("li");
          if (node.type === "gr") li.innerHTML = node.name;
          else {
            //if (node.type === "veh"  ||  node.type === "cirs")
            li.innerHTML = `${node.name}`;
            li.classList.add("li-vehicule");
            li.style.width = "100%";
          }
          //console.log(li);
          ul.appendChild(li);
          const children = await createTree(data, node.id);
          if (children) {
            li.appendChild(children);
          }
        }
      }
      return ul;
    }

    // console.log(JSON.(data));
    const treeContainer = document.getElementById("vehs"); // Replace with your container element ID
    //const tree = await createTree(data, false);
    //treeContainer.appendChild(tree);
    const iconClasses = {
      default: "fa fa-folder", // Default icon for nodes
      vehicle: "fa fa-car", // Icon for vehicle nodes
      group: "fa fa-users", // Icon for group nodes
    };

    this.LoadTree();

    document
      .getElementById("is_an_them_home")
      .addEventListener("click", async (e) => {
        this.state.vtbd = []
        this.map = new google.maps.Map(document.getElementById("map"), {
          center: { lat: 33.998444, lng: -6.860961 },
          zoom: 12,
        });
        this.state.circuit_table = [];
        document.getElementById("Chart").style.display = "none";

        document.getElementById("left_1").classList.toggle("slide-hide");
        document.getElementById("left_1").classList.toggle("slide-show");
        document.getElementById("left_2").classList.toggle("slide-show");
        document.getElementById("left_2").classList.toggle("slide-hide");
        try {
          let result = null;
          await Promise.all([
            (result = await rpc.query({
              model: "is_rfid.readed_bacs",
              method: "delete",
              args: [[], this.uid],
            })),
          ]);
        } catch (error) {
          console.warn(error);
        }
      });

    document
      .getElementById("is_an_them_init_map")
      .addEventListener("click", async (e) => {
        this.map = new google.maps.Map(document.getElementById("map"), {
          center: { lat: 33.998444, lng: -6.860961 },
          zoom: 12,
        });
      });

    /**
     *
     * Circuit again
     *
     */
    document
      .getElementById("is_an_them_circuit")
      .addEventListener("click", async (e) => {
        // this.map = new google.maps.Map(document.getElementById("map"), {
        //   center: { lat: 33.998444, lng: -6.860961 },
        //   zoom: 12,
        // });//33.998444,-6.860961
        var date1 = document.getElementById("date_du").value.replace("T", " ");
        var date2 = document.getElementById("date_au").value.replace("T", " ");
        let inputs = document.getElementsByClassName("vehicle_to_pt");
        if (this.state.selectedVehicule != null) {
          await this.drawCircuits(
            this.map,
            this.state.selectedVehicule,
            date1,
            date2
          );
        } else {
          inputs = Array.from(inputs).filter((input) => input.checked);
          if (inputs.length == 0) {
            this.notification.add(
              this.env._t(" Selectionner au moins une ligne"),
              { type: "success" }
            );
            return;
          }
          console.log(inputs);
          for (let inp = 0; inp < inputs.length; inp++) {
            const input = inputs[inp];
            console.log();
            const _ = input.attributes.value.nodeValue.split("_");
            console.log("circuit", _[1], " vehicule : ", _[2]);
            let circuit = _[1],
              vehicule = _[2];
            //this.drawCircuits(this.map, vehicule, circuit, date1, date2);
            if (input.checked)
              await this.drawCircuits1(
                this.map,
                vehicule,
                date1,
                date2,
                circuit
              );
            // console.warn('check at leas one value');
          }
          try {
          } catch (error) {
            console.warn(error);
          }
        }
      });
    /**
     *
     * print vehicule circuit meth=2
     *
     */
    document
      .getElementById("display_allfor_camion")
      .addEventListener("click", async (e) => {
        document.getElementById("is_an_them_loader").style.display = "block";
        this.map = new google.maps.Map(document.getElementById("map"), {
          center: { lat: 33.998444, lng: -6.860961 },
          zoom: 12,
        }); //33.998444,-6.860961
        this.state.selectedVehicule = null;
        document.getElementById("left_1").classList.toggle("slide-hide");
        document.getElementById("left_1").classList.toggle("slide-show");
        document.getElementById("left_2").classList.toggle("slide-show");
        document.getElementById("left_2").classList.toggle("slide-hide");
        var date1 = document.getElementById("date_du").value.replace("T", " ");
        var date2 = document.getElementById("date_au").value.replace("T", " ");
        let cirs = [];
        try {
          await Promise.all([
            (cirs = await rpc.query({
              model: "is_analyse_thematique",
              method: "get_taux_by_cir_all",
              args: [[], 2, date1, date2],
            })),
          ]);
          console.log(cirs);
          this.state.circuit_table = cirs;
          for (let c = 0; c < this.state.circuit_table.length; c++) {
            const circuit = this.state.circuit_table[c];
            console.log(circuit.circuit);
            await this.drawCircuits0(
              this.map,
              circuit.vehicule,
              date1,
              date2,
              circuit.circuit
            );
          }
          /*
          console.log(2, date1, date2, this.state.circuit_table);
           await Promise.all([
            (
              cirs= await rpc.query({
                model:'is_analyse_thematique',
                method: 'get_taux_by_cir_all',
                args: [[], 2, date1, date2]
              })
            )
          ])
          console.log(cirs);
          this.state.circuit_table = cirs;
          let routes = [];
          await Promise.all([
            (
              routes = await rpc.query({
                model: 'is_analyse_thematique',
                method: 'get_taux_by_cirdet_all',
                args: [[], 2, date1, date2]
              })
            )
          ])
          for (let r = 0; r < routes.length; r++) {
            const route = routes[r];
            let geom = route.geom;
            geom = geom.replace("MULTILINESTRING((", "");
            geom = geom.replace("))", "");
            let paths = [];
            let originsPaths = geom.split(",");
            for (let op = 0; op < originsPaths.length; op++) {
              const path = originsPaths[op];
              let latlngs = path.split(" ");
              paths.push({
                lat: parseFloat(latlngs[1]),
                lng: parseFloat(latlngs[0]),
              });
            }
            let route_color = "red";
            
            route_color = this.getColor(route.taux)==undefined|null?route_color:this.getColor(route.taux) ;
           
            const poly = new google.maps.Polyline({
              path: paths,
              strokeColor: route_color,
              strokeOpacity: 1.0,
              strokeWeight: 5,
              map: this.map,
            });
  
            const infowindow = new google.maps.InfoWindow({
              content: `
                <table>
                  <tr>
                    <td><b>Circuit</b></td>
                    <td style="text-align: left">${route["name"]}</td>
                  </tr>
                  <tr>
                    <td><b>Secteur</b></td>
                    <td style="text-align: left">${route["Secteur"]}</td>
                  </tr>
                  <tr>
                    <td><b>Fonction</b></td>
                    <td style="text-align: left">${route["fonction"]}</td>
                  </tr>
                  <tr>
                    <td><b>Frequence</b></td>
                    <td style="text-align: left">${route["frequence"]}</td>
                  </tr>
                  <tr>
                    <td><b>Taux</b></td>
                    <td style="text-align: left">${route["taux"]}</td>
                  </tr>
                  <tr>
                    <td><b>Nom</b></td>
                    <td style="text-align: left">${
                      route["gshape_name"] == null ? "" : route["gshape_name"]
                    }</td>
                  </tr>
                  
                </table>
                `,
            });
  
            poly.addListener("click", function (event) {
              infowindow.setPosition(event.latLng);
              infowindow.open(this.map);
            });
          }*/
        } catch (error) {
          console.warn(error);
        }
        let tts = document.getElementsByClassName("vehicle_to_pt");
        for (let tt of tts) {
          tt.addEventListener("click", async (e) => {
            console.log("value : ", e.srcElement.defaultValue);
            console.log("checked ? : ", e.srcElement.checked);
            this.addPopUp(e.srcElement.defaultValue);
            if (e.srcElement.checked) {
            } else {
              console.warn("removing ");
            }
          });
        } 
        document.getElementById("is_an_them_loader").style.display = "none";
      });
    /**
     *
     * print vehicule circuit meth=1
     *
     */
    document
      .getElementById("display_allfor_chariot")
      .addEventListener("click", async (e) => {
        document.getElementById("is_an_them_loader").style.display = "block";
        this.map = new google.maps.Map(document.getElementById("map"), {
          center: { lat: 33.998444, lng: -6.860961 },
          zoom: 12,
        }); //33.998444,-6.860961
        this.state.selectedVehicule = null;
        document.getElementById("left_1").classList.toggle("slide-hide");
        document.getElementById("left_1").classList.toggle("slide-show");
        document.getElementById("left_2").classList.toggle("slide-show");
        document.getElementById("left_2").classList.toggle("slide-hide");
        var date1 = document.getElementById("date_du").value.replace("T", " ");
        var date2 = document.getElementById("date_au").value.replace("T", " ");
        let cirs = [];
        try {
          console.log(1, date1, date2);
          await Promise.all([
            (cirs = await rpc.query({
              model: "is_analyse_thematique",
              method: "get_taux_by_cir_all",
              args: [[], 1, date1, date2],
            })),
          ]);
          console.log(cirs);
          this.state.circuit_table = cirs;
          let routes = [];
          await Promise.all([
            (routes = await rpc.query({
              model: "is_analyse_thematique",
              method: "get_taux_by_cirdet_all",
              args: [[], 1, date1, date2],
            })),
          ]);
          for (let r = 0; r < routes.length; r++) {
            const route = routes[r];
            let geom = route.geom;
            geom = geom.replace("MULTILINESTRING((", "");
            geom = geom.replace("))", "");
            let paths = [];
            let originsPaths = geom.split(",");
            for (let op = 0; op < originsPaths.length; op++) {
              const path = originsPaths[op];
              let latlngs = path.split(" ");
              paths.push({
                lat: parseFloat(latlngs[1]),
                lng: parseFloat(latlngs[0]),
              });
            }
            let route_color = "red";

            route_color =
              (this.getColor(route.taux) == undefined) | null
                ? route_color
                : this.getColor(route.taux);

            const poly = new google.maps.Polyline({
              path: paths,
              strokeColor: route_color,
              strokeOpacity: 1.0,
              strokeWeight: 5,
              map: this.map,
            });

            const infowindow = new google.maps.InfoWindow({
              content: `
                <table>
                  <tr>
                    <td><b>Circuit</b></td>
                    <td style="text-align: left">${route["name"]}</td>
                  </tr>
                  <tr>
                    <td><b>Secteur</b></td>
                    <td style="text-align: left">${route["Secteur"]}</td>
                  </tr>
                  <tr>
                    <td><b>Fonction</b></td>
                    <td style="text-align: left">${route["fonction"]}</td>
                  </tr>
                  <tr>
                    <td><b>Frequence</b></td>
                    <td style="text-align: left">${route["frequence"]}</td>
                  </tr>
                  <tr>
                    <td><b>Taux</b></td>
                    <td style="text-align: left">${route["taux"]}</td>
                  </tr>
                  <tr>
                    <td><b>Nom</b></td>
                    <td style="text-align: left">${
                      route["gshape_name"] == null ? "" : route["gshape_name"]
                    }</td>
                  </tr>
                  
                </table>
                `,
            });

            poly.addListener("click", function (event) {
              infowindow.setPosition(event.latLng);
              infowindow.open(this.map);
            });
          }
        } catch (error) {
          console.warn(error);
        }
        let tts = document.getElementsByClassName("vehicle_to_pt");
        for (let tt of tts) {
          tt.addEventListener("click", async (e) => {
            console.log("value : ", e.srcElement.defaultValue);
            console.log("checked ? : ", e.srcElement.checked);
            this.addPopUp(e.srcElement.defaultValue);
            if (e.srcElement.checked) {
            } else {
              console.warn("removing ");
            }
          });
        } 
        document.getElementById("is_an_them_loader").style.display = "none";
      });

    /**
     * Afichage du traçage
     */
    document
      .getElementById("is_an_them_positions")
      .addEventListener("click", async (e) => {
        document.getElementById("is_an_them_loader").style.display = "block";
        var date1 = document.getElementById("date_du").value.replace("T", " ");
        var date2 = document.getElementById("date_au").value.replace("T", " ");
        try {
          if (this.state.selectedVehicule != null) {
            drawTracage(this.map, this.state.selectedVehicule, date1, date2);
            // let positions = [];
            // await Promise.all([
            //   (positions = await rpc.query({
            //     model: "fleet.vehicle.positions2",
            //     method: "get_positions",
            //     args: [[], this.state.selectedVehicule, date1, date2],
            //   })),
            // ]);
          } else {
            console.warn("la hh");
            let inputs = document.getElementsByClassName("vehicle_to_pt");
            inputs = Array.from(inputs).filter((input) => input.checked);
            if (inputs.length == 0) {
              this.notification.add(
                this.env._t(" Selectionner au moins une ligne"),
                { type: "warning" }
              );
              return;
            } else {
              this.notification.add(
                this.env._t(inputs.length + " Selectionnées"),
                { type: "success" }
              );
              for (let i = 0; i < inputs.length; i++) {
                const input = inputs[i];
                drawTracage2(
                  this.map,
                  input.attributes.value.nodeValue.split("_")[2],
                  date1,
                  date2
                );
              }
            }
          }
          // let polylines = [];
          // //console.log(positions);
          // let paths = [];

          // positions.forEach((p) => {
          //   // console.log(p);
          //   paths.push({
          //     lat: p.latitude,
          //     lng: p.longitude,
          //   });
          // });

          // let randomColor = Math.floor(Math.random() * 16777215).toString(16);
          // randomColor = "#" + randomColor;
          // console.log(paths);
          // const poly = new google.maps.Polyline({
          //   //path: [{ lat: 33.998444, lng: -6.860961 },{ lat: 33.7444, lng: -6.860961 },{ lat: 33.998444, lng: -6.800731 }],
          //   path: paths,
          //   strokeColor: "blue",
          //   strokeOpacity: 1.0,
          //   strokeWeight: 5,
          //   map: this.map,
          // });
          // polylines.push(poly)
          // console.log(poly);
          // mapi.setCenter(paths[0]);
          // return polylines;
        } catch (error) {
          console.error(error);
        }
        document.getElementById("is_an_them_loader").style.display = "none";
      });
    document
      .getElementById("is_an_them_points")
      .addEventListener("click", async (e) => {
        document.getElementById("is_an_them_loader").style.display = "block";
        var date1 = document.getElementById("date_du").value.replace("T", " ");
        var date2 = document.getElementById("date_au").value.replace("T", " ");

        if (this.state.selectedVehicule != null) {
          drawTracagePoints(
            this.map,
            this.state.selectedVehicule,
            date1,
            date2
          );
          // let positions = [];
          // await Promise.all([
          //   (positions = await rpc.query({
          //     model: "fleet.vehicle.positions2",
          //     method: "get_positions",
          //     args: [[], this.state.selectedVehicule, date1, date2],
          //   })),
          // ]);
        } else {
          console.warn("la hh");
          let inputs = document.getElementsByClassName("vehicle_to_pt");
          inputs = Array.from(inputs).filter((input) => input.checked);
          if (inputs.length == 0) {
            this.notification.add(
              this.env._t(" Selectionner au moins une ligne"),
              { type: "warning" }
            );
            return;
          } else {
            this.notification.add(
              this.env._t(inputs.length + " Selectionnées"),
              { type: "success" }
            );
            for (let i = 0; i < inputs.length; i++) {
              const input = inputs[i];
              drawTracagePoints(
                this.map,
                input.attributes.value.nodeValue.split("_")[2],
                date1,
                date2
              );
            }
          }
        }
        // let polylines = [];
        // //console.log(positions);
        // let paths = [];

        // positions.forEach((p) => {
        //   // console.log(p);
        //   paths.push({
        //     lat: p.latitude,
        //     lng: p.longitude,
        //   });
        // });

        // let randomColor = Math.floor(Math.random() * 16777215).toString(16);
        // randomColor = "#" + randomColor;
        // console.log(paths);
        // const poly = new google.maps.Polyline({
        //   //path: [{ lat: 33.998444, lng: -6.860961 },{ lat: 33.7444, lng: -6.860961 },{ lat: 33.998444, lng: -6.800731 }],
        //   path: paths,
        //   strokeColor: "blue",
        //   strokeOpacity: 1.0,
        //   strokeWeight: 5,
        //   map: this.map,
        // });
        // polylines.push(poly)
        // console.log(poly);
        // mapi.setCenter(paths[0]);
        // return polylines;
        document.getElementById("is_an_them_loader").style.display = "none";
      });

    function isOk(element, rfid) {
      for (let k = 0; k < rfid.length; k++) {
        const rf = rfid[k];
        if (rf.idbac === element.id) return true;
      }
      return false;
    }
  }
  async loadAndPrint(circuit, vehicule, start, end) {
    try {
    } catch (error) {
      console.warn(error);
    }
  }
  async loadCircuits(meth) {}
  async getCircuit(id, from, to) {
    let planning = [];
    try {
      await Promise.all([
        (planning = await rpc.query({
          model: "is_planning.is_planning",
          method: "get_for",
          args: [[], id, from.split(" ")[0], to.split(" ")[0]],
        })),
      ]);
    } catch (error) {
      console.error(error);
    }
    return planning;
  }

  handler(mouseDownEvent) {
    var self = this;
    const startHeight = document.getElementById("Chart").offsetHeight;
    const startPosition = {
      x:
        mouseDownEvent.pageX ||
        (mouseDownEvent.touches && mouseDownEvent.touches[0].pageX),
      y:
        mouseDownEvent.pageY ||
        (mouseDownEvent.touches && mouseDownEvent.touches[0].pageY),
    };
    let newHeight;

    function onMouseMove(mouseMoveEvent) {
      const currentPosition = {
        x:
          mouseMoveEvent.pageX ||
          (mouseMoveEvent.touches && mouseMoveEvent.touches[0].pageX),
        y:
          mouseMoveEvent.pageY ||
          (mouseMoveEvent.touches && mouseMoveEvent.touches[0].pageY),
      };

      newHeight = startHeight - (currentPosition.y - startPosition.y);

      let Chart = document.getElementById("Chart");
      Chart.style.height = `${newHeight}px`;
      Chart.setAttribute("data-heigh", `${newHeight}px`);
      // Get elements with the specified class

      var elements = document.getElementsByClassName("modal-dialog modal-lg");
      var modall = document.getElementsByClassName("modal");
      let resolution = window.screen.width;
      if (resolution > 500) {
        let dialogHeight = 1260 + -newHeight;
        for (var i = 0; i < elements.length; i++) {
          elements[i].style.setProperty(
            "height",
            `${newHeight - 72}px`,
            "important"
          );
        }
        for (var i = 0; i < modall.length; i++) {
          // 448 is the max top
          if (dialogHeight <= 448) {
            // modall[i].style.setProperty('top', `448px`, 'important');
          } else {
            // modall[i].style.setProperty('top', `${dialogHeight}px`, 'important');
          }
        }
      } else {
        for (var i = 0; i < elements.length; i++) {
          elements[i].style.setProperty(
            "height",
            `${newHeight - 85}px`,
            "important"
          );
        }
      }

      //console.log("Your screen resolution is: " +  resolution)

      self.heightpopUp = newHeight;
    }

    function onMouseUp() {
      document.body.removeEventListener("mousemove", onMouseMove);
      document.body.removeEventListener("touchmove", onMouseMove);
      document.body.removeEventListener("mouseup", onMouseUp);
      document.body.removeEventListener("touchend", onMouseUp);
    }

    document.body.addEventListener("mousemove", onMouseMove);
    document.body.addEventListener("touchmove", onMouseMove, {
      passive: false,
    });
    document.body.addEventListener("mouseup", onMouseUp, { once: true });
    document.body.addEventListener("touchend", onMouseUp, { once: true });
  }

  async addSplit() {
    //console.log("add libs : ");
    return new Promise((resolve, reject) => {
      let link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://cdnjs.cloudflare.com/ajax/libs/jstree/3.2.1/themes/default/style.min.css`;
      document.head.appendChild(link);
      let q = document.createElement("script");
      // q.src =
      //   "https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.1/jquery.min.js";
      document.body.appendChild(q);
      let script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jstree/3.2.1/jstree.min.js";
      document.body.appendChild(script);
      //console.log("groups ok .");
      this.loadAllGroups();
      let charts = document.createElement("script");
      charts.src = "https://cdn.jsdelivr.net/npm/chart.js";
      document.body.appendChild(charts);
      let sheetjs = document.createElement("script");
      sheetjs.src =
        "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js";
      document.body.appendChild(sheetjs);
      let jspdf = document.createElement("script");
      jspdf.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js";
      document.body.appendChild(jspdf);
      let jspdf_autot = document.createElement("script");
      jspdf_autot.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js";
      document.body.appendChild(jspdf_autot);
      let jst = document.createElement("script");
      jst.src = "https://cdn.datatables.net/2.0.0/js/dataTables.js";
      document.body.appendChild(jst);
    });
  }
  async loadGoogleMapsAPI() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB-dn4yi8nZ8f8lMfQZNZ8AmEEVT07DEcE&libraries=places&region=ma`;
      script.onload = resolve;
      script.onerror = reject;
      //console.log("map script : ", script);
      document.body.appendChild(script);
      const script0 = document.createElement("script");
      script0.src = `https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js`;
      script0.onload = resolve;
      script0.onerror = reject;
      //console.log("map script : ", script0);
      document.body.appendChild(script0);
      // <script src="https://cdnjs.cloudflare.com/ajax/libs/js-marker-clusterer/2.2.0/markerclusterer.js"></script>
    });
  }
  async initMap() {
    try {
      await this.loadGoogleMapsAPI();

      const { Map, Marker } = await window.google.maps.importLibrary("maps");
      //console.log("map was added successfully");

      let map = null;
      this.map = new Map(document.getElementById("map"), {
        center: { lat: 33.998444, lng: -6.860961 },
        zoom: 8,
      });
      setTimeout(() => {}, 1000);
      //alert(map)
      let position = [
        { lat: "33.998444", lng: "-6.860961", display_name: "display_name" },
      ];
    } catch (e) {
      console.error("e => ", e);
    }

    await this.addSplit();
  }
  async addPopUp(e) {
    console.log(e, this.state.circuit_table);
    if (this.state.vtbd.some((item) => item.value === e)) {
      // Remove the element
      this.state.vtbd = this.state.vtbd.filter((item) => item.value !== e);
    } else {
      // Add the element
      let xSplit = e.split("_");
      let circuit = xSplit[1];
      let vehicule = xSplit[2];
      let circuit_name = "";
      let vehicule_name = "";
      for (let x = 0; x < this.state.circuit_table.length; x++) {
        const t = this.state.circuit_table[x];
        console.log(
          "test : (",
          circuit,
          ",",
          vehicule,
          ") in t   ===  (",
          t.circuit,
          ",",
          t.vehicule,
          ")"
        );
        console.log(
          t.circuit,
          "===",
          circuit,
          "&&",
          t.vehicule,
          "===",
          vehicule,
          " ? ",
          t.circuit === Number(circuit) && t.vehicule === Number(vehicule)
        );
        if (t.circuit === Number(circuit) && t.vehicule === Number(vehicule)) {
          circuit_name = t.circuit_name;
          vehicule_name = t.device;
          console.log("fine");
          break;
        }
      }

      this.state.vtbd.push({
        value: e,
        circuit: circuit,
        vehicule: vehicule,
        circuit_name: circuit_name,
        vehicule_name: vehicule_name,
      });
      console.log(this.state.vtbd);
    }
    if(this.state.vtbd.length==0){
      document.getElementById('DataDiv').innerHTML='';
      document.getElementById('Chart').style.display = 'none'
    }
  }
  onClickVehicule(vehicleid) {
    alert(vehicleid);
  }
  async loadPlanningFor(id, date1, date2) {
    let planning = [];
    try {
      await Promise.all([
        (planning = await rpc.query({
          model: "is_planning.is_planning",
          method: "get_for",
          args: [[], id, date1, date2],
        })),
      ]);
    } catch (error) {
      console.error(error);
    }
    return planning;
  }
  async loadPlanningFor1(id, date1) {
    let planning = [];
    try {
      await Promise.all([
        (planning = await rpc.query({
          model: "is_planning.is_planning",
          method: "get_device_planning",
          args: [[], id, date1.split(" ")[0], date1.split(" ")[0]],
        })),
      ]);
    } catch (error) {
      console.error(error);
    }
    return planning;
  }
  async drawCircuit(mapi, id, start, end) {
    try {
      let routes = [];
      await Promise.all([
        (routes = await rpc.query({
          model: "is_analyse_thematique",
          method: "get_by_device_id",
          args: [[], id, start, end],
        })),
      ]);
      console.log("routes : ", routes);
      for (let r = 0; r < routes.length; r++) {
        const route = routes[r];
        let geom = route.geom;
        geom = geom.replace("MULTILINESTRING((", "");
        geom = geom.replace("))", "");
        let paths = [];
        let originsPaths = geom.split(",");
        for (let op = 0; op < originsPaths.length; op++) {
          const path = originsPaths[op];
          let latlngs = path.split(" ");
          paths.push({
            lat: parseFloat(latlngs[1]),
            lng: parseFloat(latlngs[0]),
          });
        }
        const color = this.getColor(route.taux);
        const poly = new google.maps.Polyline({
          path: paths,
          strokeColor: color,
          strokeOpacity: 1.0,
          strokeWeight: 7,
          map: this.map,
        });

        const infowindow = new google.maps.InfoWindow({
          content: "This is your info window content. " + route.name,
        });

        poly.addListener("click", function (event) {
          infowindow.setPosition(event.latLng);
          infowindow.open(this.map);
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
  async drawCircuits(mapi, vehicleId, start, end, veh) {
    let circuits = await this.getCircuit(vehicleId, start, end);
    //console.log('circuits : ',circuits);
    // if(circuits.length >0)
    let str_cirs = "";
    for (let r = 0; r < circuits.length; r++) {
      str_cirs += circuits.name + ",";
    }

    this.notification.add(
      this.env._t("" + circuits.length + " circuits planifiés"),
      {
        type: "success",
      }
    );
    if (circuits.length > 0)
      this.notification.add(this.env._t("" + str_cirs), {
        type: "success",
      });
    for (let r = 0; r < circuits.length; r++) {
      const element = circuits[r];
      //console.log(element);
      try {
        let routes = [];
        let taux = [];
        await Promise.all([
          (routes = await rpc.query({
            model: "is_decoupage.circuits",
            method: "get",
            args: [[], element.circuitid],
          })),
        ]);
        await Promise.all([
          (taux = await rpc.query({
            model: "is_analyse_thematique",
            method: "get_taux_by_cirdet",
            args: [[], element.circuitid, vehicleId, start, end],
          })),
        ]);
        // console.log(routes);
        // console.log(taux);

        for (let r = 0; r < routes.length; r++) {
          const route = routes[r];
          let geom = route.geom;
          geom = geom.replace("MULTILINESTRING((", "");
          geom = geom.replace("))", "");
          let paths = [];
          let originsPaths = geom.split(",");
          for (let op = 0; op < originsPaths.length; op++) {
            const path = originsPaths[op];
            let latlngs = path.split(" ");
            paths.push({
              lat: parseFloat(latlngs[1]),
              lng: parseFloat(latlngs[0]),
            });
          }

          let route_color = "red";
          for (let t = 0; t < taux.length; t++) {
            const element = taux[t];
            // console.log(element.route ,' == ',route.id, '?');
            if (element.route == route.id) {
              // console.log(element.route ,' == ',route.id);
              route_color = this.getColor(element.taux);
              // console.log(`color is : `, route_color);
            }
          }
          const poly = new google.maps.Polyline({
            path: paths,
            strokeColor: route_color,
            strokeOpacity: 1.0,
            strokeWeight: 5,
            map: mapi,
          });

          const infowindow = new google.maps.InfoWindow({
            content: `
              <table>
                <tr>
                  <td><b>Circuit</b></td>
                  <td style="text-align: left">${route["circuit"]}</td>
                </tr>
                <tr>
                  <td><b>Secteur</b></td>
                  <td style="text-align: left">${route["Secteur"]}</td>
                </tr>
                <tr>
                  <td><b>Fonction</b></td>
                  <td style="text-align: left">${route["fonction"]}</td>
                </tr>
                <tr>
                  <td><b>Frequence</b></td>
                  <td style="text-align: left">${route["frequence"]}</td>
                </tr>
                <tr>
                  <td><b>Nom</b></td>
                  <td style="text-align: left">${
                    route["gshape_name"] == null ? "" : route["gshape_name"]
                  }</td>
                </tr>
                
              </table>
              `,
          });

          poly.addListener("click", function (event) {
            infowindow.setPosition(event.latLng);
            infowindow.open(this.map);
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
  async drawCircuits0(mapi, vehicleId, start, end, circuit) {
    console.log(vehicleId, start, end, circuit);
    // if(circuits.length >0)

    const element = { circuitid: circuit };
    //console.log(element);
    try {
      let routes = [];
      let taux = [];
      await Promise.all([
        (routes = await rpc.query({
          model: "is_decoupage.circuits",
          method: "get",
          args: [[], element.circuitid],
        })),
      ]);
      await Promise.all([
        (taux = await rpc.query({
          model: "is_analyse_thematique",
          method: "get_taux_by_cirdet",
          args: [[], element.circuitid, vehicleId, start, end],
        })),
      ]);
      // console.log(routes);

      // console.log(taux);
      for (let r = 0; r < routes.length; r++) {
        const route = routes[r];
        let geom = route.geom;
        geom = geom.replace("MULTILINESTRING((", "");
        geom = geom.replace("))", "");
        let paths = [];
        let originsPaths = geom.split(",");
        for (let op = 0; op < originsPaths.length; op++) {
          const path = originsPaths[op];
          let latlngs = path.split(" ");
          paths.push({
            lat: parseFloat(latlngs[1]),
            lng: parseFloat(latlngs[0]),
          });
        }
        let route_color = "red";
        for (let t = 0; t < taux.length; t++) {
          const element = taux[t];
          // console.log(element.route ,' == ',route.id, '?');
          if (element.route == route.id) {
            // console.log(element.route ,' == ',route.id);
            route_color = this.getColor(element.taux);
            // console.log(`color is : `, route_color);
          }
        }
        const poly = new google.maps.Polyline({
          path: paths,
          strokeColor: route_color,
          strokeOpacity: 1.0,
          strokeWeight: 5,
          map: mapi,
        });
        const infowindow = new google.maps.InfoWindow({
          content: `
              <table>
                <tr>
                  <td><b>Circuit</b></td>
                  <td style="text-align: left">${route["circuit"]}</td>
                </tr>
                <tr>
                  <td><b>Secteur</b></td>
                  <td style="text-align: left">${route["Secteur"]}</td>
                </tr>
                <tr>
                  <td><b>Fonction</b></td>
                  <td style="text-align: left">${route["fonction"]}</td>
                </tr>
                <tr>
                  <td><b>Frequence</b></td>
                  <td style="text-align: left">${route["frequence"]}</td>
                </tr>
                <tr>
                  <td><b>Nom</b></td>
                  <td style="text-align: left">${
                    route["gshape_name"] == null ? "" : route["gshape_name"]
                  }</td>
                </tr>
                <tr>
                  <td><b>Taux</b></td>
                  <td style="text-align: left">${
                    route["gshape_name"] == null ? "" : route["gshape_name"]
                  }</td>
                </tr>
                
              </table>
              `,
        });

        poly.addListener("click", function (event) {
          infowindow.setPosition(event.latLng);
          infowindow.open(this.map);
        });
      }
    } catch (error) {
      console.error(error);
    }
  }
  async drawCircuits1(mapi, vehicleId, start, end, circuit) {
    console.log(vehicleId, start, end, circuit);

    const element = { circuitid: circuit };

    try {
      let routes = [];
      let taux = [];

      await Promise.all([
        (routes = await rpc.query({
          model: "is_analyse_thematique",
          method: "get_circuit_with_taux",
          args: [[], start, end, element.circuitid, vehicleId],
        })),
      ]);
      for (let r = 0; r < routes.length; r++) {
        const route = routes[r];
        let geom = route.geom;
        geom = geom.replace("MULTILINESTRING((", "");
        geom = geom.replace("))", "");
        let paths = [];
        let originsPaths = geom.split(",");
        for (let op = 0; op < originsPaths.length; op++) {
          const path = originsPaths[op];
          let latlngs = path.split(" ");
          paths.push({
            lat: parseFloat(latlngs[1]),
            lng: parseFloat(latlngs[0]),
          });
        }
        let route_color = "red";
        route_color = this.getColor(route.taux);

        const poly = new google.maps.Polyline({
          path: paths,
          strokeColor: route_color,
          strokeOpacity: 1.0,
          strokeWeight: 5,
          map: mapi,
        });
        const infowindow = new google.maps.InfoWindow({
          content: `
              <table>
                <tr>
                  <td><b>Circuit</b></td>
                  <td style="text-align: left">${route["circuit"]}</td>
                </tr>
                <tr>
                  <td><b>Secteur</b></td>
                  <td style="text-align: left">${route["Secteur"]}</td>
                </tr>
                <tr>
                  <td><b>Fonction</b></td>
                  <td style="text-align: left">${route["fonction"]}</td>
                </tr>
                <tr>
                  <td><b>Frequence</b></td>
                  <td style="text-align: left">${route["frequence"]}</td>
                </tr>
                <tr>
                  <td><b>Nom</b></td>
                  <td style="text-align: left">${
                    route["gshape_name"] == null ? "" : route["gshape_name"]
                  }</td>
                </tr>
                <tr>
                  <td><b>Taux</b></td>
                  <td style="text-align: left">${route["taux"]}</td>
                </tr>
                
              </table>
              `,
        });

        poly.addListener("click", function (event) {
          infowindow.setPosition(event.latLng);
          infowindow.open(this.map);
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  async printLeftTable(planning, id, date1, date2) {
    /**
     *
     * circuit_table
     *
     **/
    this.state.circuit_table = [];
    // console.clear()
    let circuits = [];
    // alert('okiiih')
    for (let p = 0; p < planning.length; p++) {
      const pl = planning[p];
      try {
        let routes = [];

        await Promise.all([
          (routes = await rpc.query({
            model: "is_analyse_thematique",
            method: "get_taux_by_cir",
            args: [[], pl.circuitid, id, date1, date2],
          })),
        ]);

        console.log("routes : ", routes);
        for (let x = 0; x < routes.length; x++) {
          const route = routes[x];
          circuits.push(route);
        }
        //circuits.push(routes[0]);
      } catch (err) {
        console.log(err);
      }
      this.state.circuit_table = circuits;
      console.log(JSON.stringify(this.state.circuit_table));
    }
  }
  getColor(taux) {
    // console.log(`get color for ${taux}`);
    // if(taux==0) return 'gray'
    // else
    if (taux >= 0 && taux < 25) return "#FF0000";
    else if (taux >= 25 && taux < 50) return "#FF9900";
    else if (taux >= 50 && taux < 75) return "#99FF00";
    else if (taux >= 75) return "#00FF00";
  }
  createNestedData(vehicles, groups) {
    vehicles.forEach((vehicule) => {
      vehicule.id = "v-" + vehicule.id;
    });
    document.getElementById("jstree").innerHTML = "";
    try {
      const topLevelGroups = groups.filter((group) => !group.groupid);

      const buildTree = (groupId) => {
        const children = groups
          .filter((group) => group.groupid[0] === groupId)
          .map((group) => ({
            id: group.id.toString(),
            text: '<span class="semigroup_name1">' + group.name + " </span>",
            children: [
              ...buildTree(group.id),
              ...buildVehicles(group.id, group.id),
            ],
            type: "group",
            icon: "none",
          }));

        return children;
      };

      const buildVehicles = (groupId, parentGroupId) => {
        const groupVehicles = vehicles
          .filter(
            (vehicle) =>
              (vehicle.group[0] === groupId &&
                vehicle.group[0] === parentGroupId) ||
              vehicle.group[0] === parentGroupId
          )
          .map((vehicle) => {
            var imageSrc =
              "/fleet_monitoring/static/img/vehicules/" + "pv" + ".png";
            if (vehicle.last_update) {
              const timestamp1 = new Date();
              const mytime = new Date(
                vehicle.last_update.toString().replace("T", " ")
              );

              const timeDifference = Math.abs(mytime - timestamp1);

              const hoursDifference = timeDifference / (1000 * 60 * 60);
              const daysDifference = hoursDifference / 24;
              const Now = timestamp1 === mytime;

              // console.log("vv" ,  vehicle.vehicle_icon_id[1])
              imageSrc = "";
              if (vehicle.vehicle_icon_id[1] === "BALAYAGE MANUEL") {
                if (hoursDifference < 1) {
                  imageSrc =
                    "/fleet_monitoring/static/img/vehicules/" + "pv" + ".png";
                } else if (hoursDifference >= 1 && daysDifference < 1) {
                  imageSrc = "/fleet_monitoring/static/img/vehicules/po.png";
                } else {
                  imageSrc = "/fleet_monitoring/static/img/vehicules/pr.png";
                }
              } else if (vehicle.vehicle_icon_id[1] !== "BALAYAGE MANUEL") {
                imageSrc = "/fleet_monitoring/static/img/vehicules/acc.png";
                if (vehicle.lacc === "1") {
                  imageSrc = "/fleet_monitoring/static/img/vehicules/acc.png";
                  if (vehicle.last_speed !== "0") {
                    imageSrc =
                      "/fleet_monitoring/static/img/vehicules/acc-vitesse.png";
                  }
                } else {
                  if (Now) {
                    if (hoursDifference <= 1) {
                      imageSrc =
                        "/fleet_monitoring/static/img/vehicules/no-acc-orange.png";
                    } else {
                      imageSrc =
                        "/fleet_monitoring/static/img/vehicules/no-acc-rouge.png";
                    }
                  } else {
                    imageSrc =
                      "/fleet_monitoring/static/img/vehicules/point-exclamation-rouge.png";
                  }
                }
              }
            }

            return {
              id: vehicle.id.toString(),
              text: `
                                <div class="vehicle-node1">
                                    <span class="vehicle-device">${vehicle.name}</span>
                                    <div class="imgblock"> 
                                        <img class="vehicle-icon display_an_them_cir"  
                                          data-latitude="${vehicle.latitude}" 
                                          id="${vehicle.id}" 
                                          data-longitude="${vehicle.longitude}"    
                                          data-device="${vehicle.name}" 
                                          src="/fleet_monitoring/static/img/vehicules/pied.png">
                                    </div>
                                </div>`,
              type: "vehicle",
              icon: "none",
            };
          });

        return groupVehicles;
      };
      document.getElementById("show_filter").addEventListener("click", () => {
        document.getElementById("filter").classList.toggle("filterok");
      });
      document.getElementById("pl_to_excel").addEventListener("click", () => {
        const date1 = document
          .getElementById("date_du")
          .value.replace("T", " ");
        const date2 = document
          .getElementById("date_au")
          .value.replace("T", " ");
        let myArray = this.state.circuit_table;
        myArray = myArray.map(
          ({ id, circuit, vehicule, color, ...keepAttrs }) => keepAttrs
        );

        // Sort by 'taux' in descending order
        myArray.sort((a, b) => b.taux - a.taux);

        // Create a workbook
        const wb = XLSX.utils.book_new();

        // Convert the array to a worksheet starting from the second row to leave space for the title
        const ws = XLSX.utils.json_to_sheet(myArray, { origin: "A3" });

        // Add the title row
        const title = `Le planning de ${date1} a ${date2}`;
        const titleCellRef = XLSX.utils.encode_cell({ c: 0, r: 0 }); // A1 cell reference
        ws[titleCellRef] = { v: title, t: "s", s: { font: { bold: true } } };

        // Merge cells for the title row (spanning as wide as the data)
        const merge = [
          {
            s: { r: 0, c: 0 },
            e: { r: 0, c: Object.keys(myArray[0]).length - 1 },
          },
        ];
        if (!ws["!merges"]) ws["!merges"] = [];
        ws["!merges"].push(...merge);

        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // Write the workbook to a file (in Node.js)
        XLSX.writeFile(wb, `Les taux de ${date1} a ${date2}.xlsx`);
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

        function s2ab(s) {
          const buf = new ArrayBuffer(s.length);
          const view = new Uint8Array(buf);
          for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
          return buf;
        }

        // Create a Blob object
        const blob = new Blob([s2ab(wbout)], {
          type: "application/octet-stream",
        });

        // Create a download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Les taux de ${date1} a ${date2}.xlsx`;
        document.body.appendChild(a);
        // a.click(); // Note: This line was missing in your provided code, it's necessary to trigger the download

        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // const date1 = document.getElementById('date_du').value.replace('T', ' ');
        // const date2 = document.getElementById('date_au').value.replace('T', ' ');
        // const myArray = this.state.circuit_table

        // // Create a workbook
        // const wb = XLSX.utils.book_new();

        // // Convert the array to a worksheet
        // const ws = XLSX.utils.json_to_sheet(myArray);

        // // Append the worksheet to the workbook
        // XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // // Write the workbook to a file (in Node.js)
        // XLSX.writeFile(wb, `Les taux de ${date1} a ${date2} .xlsx`);
        // const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

        // function s2ab(s) {
        //   const buf = new ArrayBuffer(s.length);
        //   const view = new Uint8Array(buf);
        //   for (let i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
        //   return buf;
        // }

        // // Create a Blob object
        // const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });

        // // Create a download link
        // const url = URL.createObjectURL(blob);
        // const a = document.createElement("a");
        // a.href = url;
        // a.download = `Les taux de ${date1} a ${date2} .xlsx`;
        // document.body.appendChild(a);

        // // Clean up
        // document.body.removeChild(a);
        // URL.revokeObjectURL(url);
      });
      document.getElementById("pl_to_pdf").addEventListener("click", () => {
        // Assuming `this.state.circuit_table` is your array of data
        const date1 = document
          .getElementById("date_du")
          .value.replace("T", " ");
        const date2 = document
          .getElementById("date_au")
          .value.replace("T", " ");
        let myArray = this.state.circuit_table;

        // Exclude specific fields and create a new array
        const filteredArray = myArray.map(
          ({ id, circuit, vehicule, color, ...keepAttrs }) => keepAttrs
        );

        // Sort by 'taux' in descending order
        const sortedArray = filteredArray.sort(
          (a, b) => parseFloat(b.taux) - parseFloat(a.taux)
        );

        // Initialize jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        // Title for the document
        const title = `Le planning de ${date1} a ${date2}`;
        pdf.setFontSize(18);
        pdf.text(title, 10, 10);

        // Add the table headers
        const headers = Object.keys(sortedArray[0]);
        const headerConfig = headers.map((header) => ({
          name: header,
          prompt: header,
          width: 65,
          align: "center",
        }));

        // Calculate the starting position of the table to be below the title
        const tableStartY = 20;

        // Use the `autoTable` plugin to add the data to the PDF
        pdf.autoTable({
          startY: tableStartY,
          head: [headerConfig.map((header) => header.prompt)],
          body: sortedArray.map((row) => headers.map((header) => row[header])),
          theme: "striped",
          tableWidth: "auto",
          styles: { overflow: "linebreak" },
          columnStyles: { text: { cellWidth: "auto" } },
        });

        // Save the PDF
        pdf.save(`Les taux de ${date1} a ${date2}.pdf`);
      });
      document.getElementById("pl_to_csv").addEventListener("click", () => {
        const date1 = document.getElementById('date_du').value.replace('T', ' ');
        const date2 = document.getElementById('date_au').value.replace('T', ' ');
        let myArray = this.state.circuit_table;
        
        // Exclude specific fields and create a new array
        const filteredArray = myArray.map(({ id, circuit, vehicule, color, ...keepAttrs }) => keepAttrs);
        
        // Sort by 'taux' in descending order
        const sortedArray = filteredArray.sort((a, b) => parseFloat(b.taux) - parseFloat(a.taux));
        
        // Create CSV content
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Add the headers
        csvContent += Object.keys(sortedArray[0]).join(",") + "\r\n";
        
        // Add the rows
        sortedArray.forEach(row => {
            let rowContent = Object.values(row).join(",");
            csvContent += rowContent + "\r\n";
        });
        
        // Encode the CSV content so it can be parsed as a URI
        const encodedUri = encodeURI(csvContent);
        
        // Create a link element
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Les taux de ${date1} a ${date2}.csv`);
        
        // Append the link to the body to make it clickable
        document.body.appendChild(link);
        
        // Trigger the download
        link.click();
        
        // Clean up the link
        document.body.removeChild(link);
        
      });
      $(document).on("click", ".display_an_them_cir", async (event) => {
        document.getElementById("is_an_them_loader").style.display = "block";
        document.getElementById("Chart").style.height = " 300px ";

        const clickedElement = event.target;
        const id = clickedElement.id.replace("v-", "");
        this.state.selectedVehicule = id;
        var date1 = document.getElementById("date_du").value.replace("T", " ");
        var date2 = document.getElementById("date_au").value.replace("T", " ");

        console.log(`vehicule : ${id} de ${date1} a ${date2}`);

        this.map = new google.maps.Map(document.getElementById("map"), {
          center: { lat: 33.998444, lng: -6.860961 },
          zoom: 8,
        });
        let planning = await this.loadPlanningFor1(id, date1, date2);
        console.warn("planning : ", planning);
        for (let p = 0; p < planning.length; p++) {
          const pl = planning[p];
          // await this.drawCircuit(this.map, pl.circuitid, date1, date2);
          // await this.drawCircuits(this.map, pl.deviceid, date1, date2);
          await this.drawCircuits1(
            this.map,
            pl.deviceid,
            date1,
            date2,
            pl.circuitid
          );
        }

        await this.printLeftTable(planning, id, date1, date2);
        console.warn(planning);
        document.getElementById("left_1").classList.toggle("slide-hide");
        document.getElementById("left_1").classList.toggle("slide-show");
        document.getElementById("left_2").classList.toggle("slide-show");
        document.getElementById("left_2").classList.toggle("slide-hide");
        document.getElementById("chiftSelectedText").innerHTML =
          "de " + date1 + " au " + date2;
        document.getElementById("is_an_them_loader").style.display = "none";
      });

      $('.filter_change').on('change', function(e) {
        // Retrieve filter values
        //console.log(e);
        const tauxSelect = document.querySelector('#tauxSelect').value;
        const tauxValue = document.querySelector('#tauxValue').value;
        const circuitValue = document.querySelector('#circuitValue').value.trim().toLowerCase();
        const vehiculeValue = document.querySelector('#vehiculeValue').value.trim().toLowerCase();
        
        let root = document.getElementById('is_an_them_Canvas');
        let sub_roots = root.getElementsByTagName('li');
    
        for (let sr = 0; sr < sub_roots.length; sr++) {
            const sub_root = sub_roots[sr];
            let divs_content = sub_root.getElementsByTagName('p')[0].getElementsByTagName('div');
            let divCircuit = divs_content[0].innerHTML.trim().toLowerCase();
            let divVehicule = divs_content[1].innerHTML.trim().toLowerCase();
            let divTaux = parseFloat(divs_content[2].innerHTML);
    
            // Apply the filter criteria
            // console.log(circuitValue , ' searching for this ');
            // console.log(vehiculeValue , ' searching for this ');
            let show1= true, show2= true, show3 = true;
            // if (circuitValue && divCircuit.includes(circuitValue)) {
            //     show1 = true;
            // }
            console.log(divVehicule, '  ', vehiculeValue ,"", divVehicule.includes(vehiculeValue) > -1);
            if (divVehicule.includes(vehiculeValue) > -1) {
              show2 = true;
            }else{
              show2 = false
            }
            // console.log(show1, "  ", show2 , ' before comparing taux');
            //if (tauxValue) {
            
            // switch (tauxSelect) {
            //     case '>':
            //         if ((divTaux >= parseFloat(tauxValue))) show3 = false;
            //         break;
            //     // case '≥':
            //     //     if ((divTaux >= parseFloat(tauxValue))) show3 = true;
            //     //     break;
            //     case '<':
            //         if ((divTaux <= parseFloat(tauxValue))) show3 = false;
            //         break;
            //     // case '≤':
            //     //     if ((divTaux <= parseFloat(tauxValue))) show3 = true;
            //     //     break;
            //     default:
            //         break;
            //   }
            // //}
            show3 = eval(`${divTaux}  ${tauxSelect} ${parseFloat(tauxValue)}`)
            // console.log(`if( ${divTaux}  ${tauxSelect} ${parseFloat(tauxValue)} ) = ${show3}`);
            
            // Show or hide the li element
            // console.warn(show2);
            if(!show2){
              sub_root.classList.remove('d-flex'); 
              sub_root.classList.add('d-none');
            }else{
              sub_root.classList.add('d-flex'); 
              sub_root.classList.remove('d-none');
            }
            //sub_root.style.display = show ? '' : 'none';
        }
    });
    
      //
      //
      const groupNodes = topLevelGroups.map((group) => ({
        id: group.id.toString(),
        text: '<span class="group_name">' + group.name + " </span>",
        children: [
          ...buildTree(group.id),
          ...buildVehicles(group.id, group.id),
        ],
        type: "group",
        icon: "none",
      }));

      const nestedData = groupNodes;
      //  console.log(nestedData);

      return nestedData;
    } catch (error) {
      console.log(error);
    }
  }
  DisplayTree() {
    document.getElementById("DisplayTree").classList.toggle('desktop')
    try {
      if (this.state.displayTree === true) {
        document.getElementById("TreeDiag").style.display = "block";
        document.getElementById("TreeDiag").style.width = "100vw";
        //document.getElementById("DisplayTree").style.marginLeft = "300px";
        // document.getElementById('DisplayTree').style.borderRadius = "6px 0px 0px 5px"
        this.state.displayTree = !this.state.displayTree;
        //   console.log(this.state.displayTree)
      } else {
        document.getElementById("TreeDiag").style.display = "none";
        //document.getElementById("DisplayTree").style.marginLeft = "0";
        // document.getElementById('DisplayTree').style.borderRadius = "0px 5px 5px 0px"
        this.state.displayTree = !this.state.displayTree;
        //  console.log(this.state.displayTree)
      }
    } catch (error) {
      console.log(error);
    }
  }
  async toggleCollapse(id, vtbd, map) {
    console.log(id, this);
    vtbd.forEach((v) => {
      var element = document.getElementById("collapse_" + v.value);
      if (element.classList.contains("show") && v.value != id)
        element.classList.remove("show");
    });
    var element = document.getElementById("collapse_" + id);
    element.classList.toggle("show");
    if (element.classList.contains("show")) {
      document.getElementById("Chart").style.display = "block";
      document.getElementById("Chart").style.maxHeight = "650px !important";
      /****** working here */
      // document.getElementById('DataDiv').innerHTML = id
      var data = [
         
      ];
      try {
        let vals = id.split("_");
        const circuitid = vals[1];
        const vehicleId = vals[2];
        const start = document.getElementById("date_du").value;
        const end = document.getElementById("date_au").value;
        await Promise.all([
          (data = await rpc.query({
            model: "is_analyse_thematique",
            method: "get_taux_by_cirdet_with_id",
            args: [[], circuitid, vehicleId, start, end],
          })),
        ]);
        console.log("data : ", data);
        let table = null;
        document.getElementById('DataDiv').innerHTML = `
        <table id="myTable" class="display" style="width: 100%">
            <thead>
                <tr>
                    <th>ORDRE</th>
                    <th>ADRESSE</th>
                    <th>TAUX</th>
                    <th>LONGUEUR</th> 
                </tr>
            </thead>
            <tbody>
                
            </tbody>
        </table>
        
        `; 
        if ($.fn.dataTable.isDataTable("#myTable")) {
          $('#myTable').DataTable({
            data: data,
            columns: [
              { data: 'id' },
              { data: 'gshape_name' },
              { data: 'taux' },
              { data: 'lt' } 
            ],
            rowCallback: function(row, data, dataIndex) {
              // Clear previously bound events to prevent duplicate handlers
              $(row).off('click');
          
              // Add click event to the row
              $(row).on('click', function() {
                // Handle the click event
                // For example, alert the gshape_name of the clicked row
                console.log('Clicked row id: ' + data.x, data.y);
                map.setCenter(new google.maps.LatLng(data.y, data.x));
                map.setZoom(24)
              });
            }
          });
        } else {
          // table = $("#example").DataTable({
            // });
            $('#myTable').DataTable({
              data: data,
              columns: [
                { data: 'id' },
                { data: 'gshape_name' },
                { data: 'taux' },
                { data: 'lt' } 
              ],
              rowCallback: function(row, data, dataIndex) {
                // Clear previously bound events to prevent duplicate handlers
                $(row).off('click');
            
                // Add click event to the row
                $(row).on('click', function() {
                  // Handle the click event
                  // For example, alert the gshape_name of the clicked row
                  console.log('Clicked row id else: ' + data.x, data.y);
                  map.setCenter(new google.maps.LatLng(data.y, data.x));
                  map.setZoom(24)
                });
              }
              // paging: false,
          });
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      // document.getElementById('DataDiv').innerHTML = ''
      document.getElementById("Chart").style.display = "none";
    }

    // if (element.style.display === "none") {
    //     element.style.display = "block";
    // } else {
    //     element.style.display = "none";
    // }
  }
}
AnalyseTemCircuit.template = "is_analyse_themmatique.circuitTemplate_an";

registry
  .category("actions")
  .add("an_them_action_window_map_owl_circuit", AnalyseTemCircuit);
