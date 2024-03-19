/** @odoo-module **/

import { registry } from "@web/core/registry";
const rpc = require("web.rpc");
import { useService } from "@web/core/utils/hooks";
import { drawTracage } from '../../../../is_decoupage/static/src/js/function.js'
const { Component, onWillStart, onMounted, useState } = owl;
  
export class RfidMapComponent extends Component {
  setup() {
    this.state = useState({
      groups: [],
      vehicules: [],
      circuits: [],
      etat_conteneur: "collecte",
      type_afichage: "bac",
      displayTree: false,
    });
    this.uid = null;
    this.initUID();
    this.heightpopUp = null;
    this.map = null; 
    this.chart = null;
    this.notification = useService('notification');
    this.orm = useService("orm");
    this.modelGroup = "fleet.vehicle.group";
    onMounted(async () => {   
      //console.log("i'm in the map");
      // console.log();
      document.getElementById("DisplayTree").style.marginLeft = "314px";
      $(document).off("click", ".clickable");
      console.log();
      const button = document.getElementById("mousEvent");
      //console.warn("Chart : ", button);
      button.addEventListener("mousedown", this.handler.bind(this));
      button.addEventListener("touchstart", this.handler.bind(this));
      //console.log("resizing");
      await this.initMap();
    });
  }
  async isUIDExists(){
    let result = null; 
    //console.log("checking ", this.uid);
    try {
      await Promise.all([
        (result = await rpc.query({
          model: "is_rfid.readed_bacs",
          method: "isExist",
          args: [[], this.uid],
        })),
      ]);
      //console.log(result);
    } catch (error) {
      console.error(error);
    }
    return result  
  }
  generateRandomUid() { 
    return Math.floor(Math.random() * 1000000); 
  }
  async initUID(){
    do{
      this.uid = this.generateRandomUid();
      let exist = await this.isUIDExists();
      //console.log('uid : ', this.uid , ' ?? ' ,(exist ) );

    }while((!this.isUIDExists()));
  }
  async LoadTree() {
    // localStorage.setItem('visitedPage1', 'false');
    //console.log("111111111111111111111111111111111111111111111111111111");
    try {
      localStorage.removeItem("jstree");

      //await this.loadScriptMounted();
      // var self = this;
      var vehicules = []; // this.state.vehicles;
      var groups = []; //this.state.groups;

      // Fetch vehicle and group data
      await Promise.all([
        rpc
          .query({
            model: "fleet.vehicle",
            method: "get_vehicles_with_rfid_tag",
            args: [[]],
          })
          .then((result) => {
            vehicules = result;
          }),
        rpc
          .query({
            model: "fleet.vehicle.group",
            method: "get_map_data_with_rfid",
            args: [[]],
          })
          .then((result) => {
            groups = result;
          }),
      ]);

      //console.log("vehicules", this.state.vehicles);
      //console.log("groups", this.state.groups);
      $("#jstree").empty();

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
            show_only_matches : true
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
            // 'checkbox',
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
    const currentDateString = currentDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    const currentTimeString = currentDate.toTimeString().split(" ")[0]; // Format as HH:mm

    // Set default values for the date and time inputs
    document.getElementById("date_du").value = currentDateString;
    //document.getElementById('time_du').value = currentTimeString;
    document.getElementById("date_au").value = currentDateString;
    //document.getElementById('time_au').value = currentTimeString;
    try {
      await Promise.all([
        (this.state.vehicules = await rpc.query({
          model: "fleet.vehicle",
          method: "get_vehicles_with_rfid_tag",
          args: [[]],
        })),
        (this.state.groups = await rpc.query({
          model: "fleet.vehicle.group",
          method: "get_map_data_with_rfid",
          args: [[]],
        })),
      ]);
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
        groupid: nd.vehicle_group_id,
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
  
    let vars = document.getElementsByName("par_cir_veh");
    for (let i = 0; i < vars.length; i++) {
      const element = vars[i];
      element.addEventListener("change", async (event) => {
        //console.log("eent : ", event.target.id);
        if (event.target.id === "par_veh") {
          $("#vehs").toggleClass("slide-left"); //fadeIn(200);
          $("#cirscont").toggleClass("slide-left"); //.fadeOut(200);
          $("#cirscont").css({ display: "none" });
          $("#vehs").css({ display: "block" });
        } else {
          $("#cirscont").toggleClass("slide-left"); //.fadeIn(200);
          $("#vehs").toggleClass("slide-left"); //.fadeOut(200);
          $("#cirscont").css({ display: "block" });
          $("#vehs").css({ display: "none" });
        }
      });
    }
    // add listener to handle (collecte/lavage)
    let vars0 = document.getElementsByName("etat_lavage_collect");
    for (let i = 0; i < vars0.length; i++) {
      const element = vars0[i];
      element.addEventListener("change", async (event) => {
        //console.log("type  : ", event.target.id);
        this.state.etat_conteneur = (event.target.id + "").split("_")[1];
        var str = "";
        //console.log(this.state.etat_conteneur);
        if (this.state.type_afichage === "tous") {
          if (this.state.etat_conteneur === "lavage") {
            str = "Afficher la situation du lavage";
          } else {
            str = "Afficher la situation de collecte";
          }
        } else if (this.state.type_afichage === "bac") {
          if (this.state.etat_conteneur === "lavage") {
            str = "Afficher la situation du lavage des Bacs";
          } else {
            str = "Afficher la situation de collecte des Bacs";
          }
        } else if (this.state.type_afichage === "colonne") {
          if (this.state.etat_conteneur === "lavage") {
            str = "Afficher la situation du lavage des colonne";
          } else {
            str = "Afficher la situation de collecte des colonne";
          }
        }else if (this.state.type_afichage === "caisson") {
          if (this.state.etat_conteneur === "lavage") {
            str = "Afficher la situation du lavage des caissons";
          } else {
            str = "Afficher la situation de collecte des caissons";
          }
        }
        document.getElementById("display_stat").innerHTML = str;
      });
    }
    // add listener to handle type bacs
    let vars1 = document.getElementsByName("type_cont");
    for (let i = 0; i < vars1.length; i++) {
      const element = vars1[i];
      element.addEventListener("change", async (event) => {
        //console.log("type affichage : ", event.target.id);
        this.state.type_afichage = (event.target.id + "").split("_")[1];
        var str = "";
        //document.getElementById("").innerHTML = "afficher la situation "
        //console.log(this.state.etat_conteneur);
        if (this.state.type_afichage === "tous") {
          if (this.state.etat_conteneur === "lavage") {
            str = "Afficher la situation du lavage";
          } else {
            str = "Afficher la situation de collecte";
          }
        } else if (this.state.type_afichage === "bac") {
          if (this.state.etat_conteneur === "lavage") {
            str = "Afficher la situation du lavage des Bacs";
          } else {
            str = "Afficher la situation de collecte des Bacs";
          }
        } else if (this.state.type_afichage === "colonne") {
          if (this.state.etat_conteneur === "lavage") {
            str = "Afficher la situation du lavage des colonne";
          } else {
            str = "Afficher la situation de collecte des colonne";
          }
        }else if (this.state.type_afichage === "caisson") {
          if (this.state.etat_conteneur === "lavage") {
            str = "Afficher la situation du lavage des caissons";
          } else {
            str = "Afficher la situation de collecte des caissons";
          }
        }
        document.getElementById("display_stat").innerHTML = str;
      });
    }
    /*** */
    let buttons_vehicule = document.getElementsByClassName("afficheFor");
    for (let i = 0; i < buttons_vehicule.length; i++) {
      const element = buttons_vehicule[i];
      element.addEventListener("click", (event) => {
        alert(event.target.innerHTML);
        //console.log(event);
      });
    }

    let livs = document.getElementsByClassName("li-vehicule");
    for (let x = 0; x < livs.length; x++) {
      let li = livs[x];
      li.getElementsByTagName("a")[0]
        .getElementsByTagName("i")[0]
        .classList.remove("jstree-icon");
    }

    //
    // document
    //   .getElementById("is_rfid_home")
    //   .addEventListener("click", async (e) => {
    //     $("#left_1").toggleClass("slide-left"); //fadeIn(200);
    //     $("#left_2").toggleClass("slide-left"); //.fadeOut(200);
    //     $("#left_1").toggleClass("slide-hide"); //fadeIn(200);
    //     $("#left_2").toggleClass("slide-hide"); //.fadeOut(200);
    //     this.map = new google.maps.Map(document.getElementById("map"), {
    //       center: { lat: 35.7444, lng: -5.800731 },
    //       zoom: 8,
    //     });
    //   });

    document
      .getElementById("display_stat")
      .addEventListener("click", async (e) => {
        document.getElementById('is_rfid_loader').style.display='flex'
        document.getElementById('Chart').style.height=' 300px '
        // $("#left_1").toggleClass("slide-left"); //fadeIn(200);
        // $("#left_2").toggleClass("slide-left"); //.fadeOut(200);
        // $("#left_1").toggleClass("slide-hide"); //fadeIn(200);
        // $("#left_2").toggleClass("slide-hide"); //.fadeOut(200);
        var date1 = document.getElementById("date_du").value;
        var time1 = document.getElementById("time_du").value;
        var date2 = document.getElementById("date_au").value;
        var time2 = document.getElementById("time_au").value;
        const start = date1 + ' ' + time1;   
        const end = date2 + ' ' + time2;
        let dif_mil = new Date(end).getTime() - new Date(start).getTime();
        let dif_h = dif_mil/(1000 * 60 * 60) 

        if (start > end) { 
          this.notification.add(
            this.env._t( ' La date entrée est invalide '),
            {
              type: 'danger',
            }
          );
          document.getElementById('is_rfid_loader').style.display='none'
          return;
        }  
        
        document.getElementById('left_1').classList.toggle('slide-hide'); 
        document.getElementById('left_1').classList.toggle('slide-show'); 
        document.getElementById('left_2').classList.toggle('slide-show' );
        document.getElementById('left_2').classList.toggle('slide-hide' );
        const type = this.state.type_afichage == 'tous' ? '' : this.state.type_afichage;
        const etat = this.state.etat_conteneur;
        document.getElementById('Chart').style.display="block";
        document.getElementById('SelectedVehText').innerHTML='All'
        document.getElementById('chiftSelectedText').innerHTML = `du: ${date1} ${time1} au: ${date2} ${time2}`
        let t = "";
        let rfid = [];
        try {
          await Promise.all([
            (rfid = await rpc.query({
              model: "is_rfid.vrfid",
              method: "getRfid",
              args: [
                [],
                date1 + " " + time1,
                date2 + " " + time2,
                etat, type
              ],
            })),
          ]);
        } catch (error) {
          console.log(error);
        }
        console.log("RFID : ", rfid);
        let bacs = [];
        if (this.state.type_afichage === "tous") t = "";
        else t = this.state.type_afichage;
        try {
          await Promise.all([
            (bacs = await rpc.query({
              model: "is_bav.bacs",
              method: "getall",
              args: [[], t],
            })),
          ]);
        } catch (error) {
          console.log(error);
        }
        //console.log(bacs);
        let nbr_on = 0,
          nbr_off = 0;
        let markersBacs = [];
        for (let baci = 0; baci < bacs.length; baci++) {
          const element = bacs[baci];
          let state = "gris";
          let device= this.isGreen2(element, rfid);
          //console.log(device);
          if (device != null) {
            nbr_on++;
            if(this.state.etat_conteneur.toLocaleLowerCase().includes('lavage'.toLocaleLowerCase())){
              state = element.img_mauve;
            }else {
              state = element.img_green;
            }
          } else {
            nbr_off++;
            state = element.img_red;
            if(this.state.etat_conteneur.toLocaleLowerCase().includes('lavage'.toLocaleLowerCase())){
              state = element.img_gris;
            }else {
              state = element.img_red;
            }
            device=""
          }
          //console.log(element);
          const marker = new google.maps.Marker({
            position: {
              lat: parseFloat(element.latitude),
              lng: parseFloat(element.longitude),
            },              
            map: this.map,  
            icon: "is_bav/static/img/bacs/" +  state +"",
            draggable: true,
          });
          markersBacs.push(marker);
          console.log(element);
          const infoWindow = new google.maps.InfoWindow({
            content:  
               `<table style="width: 300px; height: 70px"> 
                  <tr> 
                    <td><b>N° park</b></td>
                    <td style="text-align: left">${element.numero}  </td>
                  </tr> 
                  <tr>  
                    <td><b>Type </b></td>
                    <td style="text-align: left">${element.name}  </td>
                  </tr>
                  <tr>
                    <td><b>Fréquence collecte</b></td>
                    <td style="text-align: left"> ${element.freqcollecte} </td>
                  </tr> 
                  <tr> 
                    <td><b>Fréquence Lavage</b></td><td style="text-align: left"> ${element.freqlavage} </td>
                  </tr>    
                </table>
                <hr>
                <table style="width: 300px; height: 70px">
                  <tr> 
                    <td><b>Véhicule</b></td>
                    <td style="text-align: left"> ${device} </td>
                  </tr>
                  <tr> 
                    <td><b>Dernière collecte</b></td>
                    <td style="text-align: left"> ${element.lastupdate} </td>
                  </tr> 
                  
              </table>`,
          });
          marker.addListener("click", () => {
            infoWindow.open(this.map, marker);
          });
          
        }
        let markerCluster;
        markerCluster = new MarkerClusterer(this.map, markersBacs, {
          imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
          minimumClusterSize: 10,
        });
        if(bacs.length>0)
          this.map.setCenter(
            {
              lat: parseFloat(bacs[bacs.length-1].latitude),
              lng: parseFloat(bacs[bacs.length-1].longitude),
            }

          );      //
        // console.error("nombre on : ", nbr_on, " nombre off : ", nbr_off);
        
        // const ctx = document.getElementById('us_rfid_Chart');
        if (this.chart != null) {
          this.chart.destroy();
        }

        //console.log("************************************************************");
        // console.log(bacs);
        // console.log('rfid : ',rfid);
        // console.log('bac : ',bacs);
        const nameCounts = {};
        bacs.forEach((item) => {
          const name = item.name;
          // console.log(name);  
          if (!nameCounts[name]) {
            nameCounts[name] = {
              total: 0, 
              on: 0,    
              off: 0,   
            };
          }
          nameCounts[name].total++;
           

          let isOkv = this.isGreen2(item, rfid);
          // console.log('isOkV : ',isOkv);
          if (isOkv != null) {
            nameCounts[name].on++;
          } else {
            nameCounts[name].off++;
          }
        });
        //console.log(nameCounts);
        const tableContainer = document.getElementById("is_rfid_table");
        tableContainer.innerHTML = "";
        // Your JSON data and calculations as shown in the previous code

        // Create an HTML table and its header row
        const table = document.createElement("table");
        table.className = 'table table-hover'
        table.style="width: 100%"
        const headerRow = table.insertRow(0);
        const headers = ["Type", "Total", "On", "Off"];

        // Create table headers
        headers.forEach((headerText) => {
          const th = document.createElement("th");
          th.textContent = headerText;
          headerRow.appendChild(th);
          //console.log(th);
        });

        for (const name in nameCounts) {
          const rowData = nameCounts[name];
          const row = table.insertRow();
          const nameCell = row.insertCell(0);
          const totalCell = row.insertCell(1);
          const onCell = row.insertCell(2);
          const offCell = row.insertCell(3);

          nameCell.textContent = name;
          totalCell.textContent = rowData.total;
          onCell.textContent = rowData.on;
          offCell.textContent = rowData.off;
          //console.log(name);
        }
        tableContainer.appendChild(table)
        const data_chart = {
          labels: ["on", "off"],
          datasets: [
            {
              label: "",
              data: [nbr_on, nbr_off],
              backgroundColor: ["green", "red"],
              borderWidth: 1,
            },
          ],
        };
        this.chart = new window.Chart("is_rfid_myChart", {
          type: "pie",
          data: data_chart,
          options: {
            plugins: {
              title: {
                display: true,
                text: "",
                padding: {
                  top: 10,
                  bottom: 30,
                },
              },
            },
          },
        });

        //error.log(data);
        //console.error(data);
        //console.log(`this.displayData(this.map, null, ${start}, ${end}, ${etat}, ${type})`);
        //this.displayData(this.map, null, start, end, etat, type);
        //console.log('start getting data');
        let result = []
        try {
            
          await Promise.all([
            (result = await rpc.query({
              model: "is_rfid.vrfid",
              method: "get_result",
              args: [[],type, etat ,start, end ],
            })),
          ]);
        } catch (error) {
          console.warn(error)
        }
        //console.log('result to insert : ',result);
        try {
          await Promise.all([
            (result = await rpc.query({
              model: "is_rfid.readed_bacs",
              method: "insert",
              args: [[],result, this.uid ],
            })),
          ]);
        } catch (error) {
          console.warn(error)
        }
        const action = this.env.services.action;
        let domain = `[
          ["session_uid", ">=", '${this.uid}'],    
          ['typeb', 'ilike', '${type}']       
        ]`;
        // domain = `[
        //   ["name", 'ilike', '${type}']  ,
        // ]`
        $("head").append(
          `<link href="${window.location.origin}/is_diagnostic/static/public/styleDiagnostic.css" rel="stylesheet" id="newcss" />`
        );
    
        $("#DataDiv").append(` <div id="myloader" style="display: block;z-index: 99;height: 22vw;width: 100%;position: absolute; /* background: #ffffff; */width: 100%;max-height: 62em; overflow: auto; z-index: 1; width: 100%; height: 22vw; left: 0vw; min-height: 200px; bottom: 0; overflow-x: hidden; ">
            <div id="loader"style=" position:absolute;top:0px;height:100%;width:100%;display: block;background-color: rgba(64, 64, 64, 0.5);z-index:200">
                <svg version="1.1" style=" position:relative;top:50%;left: 50%;height:10%;width:10%;transform: translateX(-50%) translateY(-50%);" id="L7" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
                    <path fill="#fff" d="M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3 c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z">
                        <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50"
                            to="360 50 50" repeatCount="indefinite" />
                    </path>
                    <path fill="#fff" d="M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7 c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z">
                        <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="-360 50 50" repeatCount="indefinite" />
                    </path>
                    <path fill="#fff" d="M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5 L82,35.7z">
                        <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50"
                            to="360 50 50" repeatCount="indefinite" />
                    </path>
                </svg>
            </div>
        </div>`
      );
    
        const loadingDiv = document.getElementById("myloader");
        loadingDiv.style.display = "block";
        action
          .doAction({
            type: "ir.actions.act_window",
            name: "Open Vehicle Tree View",
            res_model: "is_rfid.readed_bacs",
            domain: domain,
            views: [[false, "tree"]],
            view_mode: "tree",
            target: "new",
          })
          .then(() => {
            const childDiv = document.getElementsByClassName(
              "o_dialog_container modal-open"
            )[0];
            document
              .getElementsByClassName("modal d-block o_technical_modal")[0]
              .setAttribute("style", "z-index : 0");
            loadingDiv.remove();
            const parentDiv = document.getElementById("DataDiv");
            parentDiv.appendChild(childDiv);
          })

          .catch((error) => {
            console.error(error);
            loadingDiv.style.display = "none";
            loadingDiv.remove();
          });
        document.getElementById('Chart').style.height="300px";
        document.getElementById('is_rfid_loader').style.display='none'

      });
      document.getElementById('is_rfid_home').addEventListener('click', async (e)=>{
        this.map = new google.maps.Map(document.getElementById("map"), {
          center: { lat: 35.7444, lng: -5.800731 },
          zoom: 12,
        });
        
        document.getElementById('Chart').style.display="none"
        
        document.getElementById('left_1').classList.toggle('slide-hide'); 
        document.getElementById('left_1').classList.toggle('slide-show'); 
        document.getElementById('left_2').classList.toggle('slide-show' );
        document.getElementById('left_2').classList.toggle('slide-hide' );
        try {
          let result = null;
          await Promise.all([
            (result = await rpc.query({
              model: "is_rfid.readed_bacs",
              method: "delete",
              args: [[], this.uid ], 
            })),
          ]);
        } catch (error) {
          console.warn(error)
        }

    })
    function isOk(element, rfid) {
      for (let k = 0; k < rfid.length; k++) {
        const rf = rfid[k];
        if (rf.idbac === element.id) return true;
      }
      return false;
    }
  }

  // async drawPositions(mapi, vehicleId, start, end) {
  //   //console.error(vehicleId, " ", start, " ", end);
  //   try {
  //     let positions = [];
  //     await Promise.all([
  //       (positions = await rpc.query({
  //         model: "fleet.vehicle.positions2",
  //         method: "get_positions",
  //         args: [[], vehicleId, start, end],
  //       })),
  //     ]);

  //     //console.log(positions);
  //     let paths = [];

  //     positions.forEach((p) => {
  //       // console.log(p);
  //       paths.push({
  //         lat: p.latitude,
  //         lng: p.longitude,
  //       });
  //     });
  //     const poly = new google.maps.Polyline({
  //       path: paths,
  //       strokeColor: "#0000FF",
  //       strokeOpacity: 1.0,
  //       strokeWeight: 5,
  //       map: mapi,
  //     });
  //     mapi.setCenter(paths[0]);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
  async drawCircuits(mapi, vehicleId, start, end){
    let circuits = await this.getCircuit(vehicleId, start, end);
    //console.log('circuits : ',circuits);
    // if(circuits.length >0)
    let str_cirs = ''
    for (let r  = 0; r  < circuits.length; r++) {
      str_cirs += circuits.name + ',' 
    }


    this.notification.add(
      this.env._t(''+ circuits.length+ ' circuits planifiés'),
      {
        type: 'success',
      }
    );
    if(circuits.length>0)
    this.notification.add(
      this.env._t(''+ str_cirs),
      {
        type: 'success',
      }
    );
    for (let r  = 0; r  < circuits.length; r++) {
      const element = circuits[r];
      //console.log(element);
      try {
        let routes = [];
        await Promise.all([
          (routes = await rpc.query({
            model: "is_decoupage.circuits",
            method: "get",
            args: [[], element.circuitid],
          })),
        ]);
        //console.log(routes);
        for (let r = 0; r < routes.length; r++) {
          const route = routes[r];
          let geom = route.geom;
          geom = geom.replace('MULTILINESTRING((', '')
          geom = geom.replace('))', '')
          let paths = []
          let originsPaths = geom.split(',');
          for (let op  = 0; op  < originsPaths.length; op ++) {
            const path = originsPaths[op];
            let latlngs = path.split(' ');
            paths.push({
              lat: parseFloat(latlngs[1]),
              lng: parseFloat(latlngs[0])
            })
          }
  
          const poly = new google.maps.Polyline({ 
            path: paths,
            strokeColor: routes.color,
            strokeOpacity: 1.0,
            strokeWeight: 5,
            map: mapi,
          });
  
        }
      } catch (error) {
        console.error(error);
      }
    }

  }
  async getCircuit(id, from, to){
    let planning = [];
    try {
      await Promise.all([
        (planning = await rpc.query({
          model: "is_planning.is_planning",
          method: "get_for",
          args: [[], id, from.split(' ')[0], to.split(' ')[0]],
        })),
      ]);
    } catch (error) {
      console.error(error);
    }
    return planning;
  }
  async drawRFID(mapi, vehicleId, start, end, etat, type) {
    // if(etat==='tous') etat  =''
    try {
      //console.warn(start, end, vehicleId, type, etat);
      type = type.replace("tous", "");
      if (type == "tous") type = "";
      //console.warn(start, end, vehicleId, type, etat);
        
      let bacs = await this.loadBacs(type);
      let rfid = await this.loadRFID(start, end, vehicleId, type, etat);
      // alert("ooooooooooooooooooooooooooooooooooooooooook");
      //console.warn('bacs :', bacs);
      const nameCounts = {};
      bacs.forEach((item) => {

        const name = item.name;
        // console.log(name);
        if (!nameCounts[name]) {
          nameCounts[name] = {
            total: 0, 
            on: 0,    
            off: 0,   
          };
        }
        
        nameCounts[name].total++;
        
        // Check the conditions for on and off and increment accordingly
        // console.log(`this.isGreen(${item.numero}, ${rfid}) = `+this.isGreen(item.numero, rfid) )
        if (this.isGreen(item, rfid)) {
          nameCounts[name].on++;
        } else {
          nameCounts[name].off++;
        }

      });
      //console.log(nameCounts);
      const tableContainer = document.getElementById("is_rfid_table");
      tableContainer.innerHTML = "";
      // Your JSON data and calculations as shown in the previous code

      // Create an HTML table and its header row
      const table = document.createElement("table");
      table.className = 'table table-hover'
      table.style="width: 100%"
      const headerRow = table.insertRow(0);
      const headers = ["Type", "Total", "On", "Off"];

      // Create table headers
      headers.forEach((headerText) => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
      });
      let nbr_on =0,nbr_off=0;
      // Loop through the calculated counts and create table rows
      for (const name in nameCounts) {
        const rowData = nameCounts[name];
        const row = table.insertRow();
        const nameCell = row.insertCell(0);
        const totalCell = row.insertCell(1);
        const onCell = row.insertCell(2);
        const offCell = row.insertCell(3);
        nbr_on += rowData.on;
        nbr_off += rowData.off;
        nameCell.textContent = name;
        totalCell.textContent = rowData.total;
        onCell.textContent = rowData.on;
        offCell.textContent = rowData.off;
      }
     // console.log(nbr_on, nbr_off);
      const data_chart = {
        labels: ["on", "off"],
        datasets: [
          {
            label: "",
            data: [nbr_on, nbr_off],
            backgroundColor: ["green", "red"],
            borderWidth: 1,
          },
        ],
      };

      // const ctx = document.getElementById('us_rfid_Chart');

      if (this.chart != null) {
        this.chart.destroy();
      }

      this.chart = new window.Chart("is_rfid_myChart", {
        type: "pie",
        data: data_chart,
        options: {
          plugins: {
            title: {
              display: true,
              text: "",
              padding: {
                top: 10,
                bottom: 30,
              },
            },
          },
        },
      });

      // Append the table to the table container
      tableContainer.appendChild(table);
      // console.warn("rfid :", JSON.stringify(rfid));
      let markers = [];
      rfid.forEach((bac) => {
        let state = "" + bac.img_green;

        //console.log("--------------------------------");
        let xpos = this.isFixedPositions(bac, bacs);
        //console.log("--------------------------------");  

        const marker = new google.maps.Marker({
          position: xpos,//{ lat: bac.lat, lng: bac.lon },
          map: mapi,
          icon: "is_bav/static/img/bacs/" + state,
          draggable: true,
        });
        markers.push(marker);
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
              <table>
                <tr><td>N° PARC :                       </td><td style="text-align: left">  ${bac.numero}</td></tr>
                <tr><td>  Type  :                       </td><td style="text-align: left">  ${bac.typeb}</td></tr>
                <tr><td>  Marque :                      </td><td style="text-align: left">  ${bac.marque.en_US}</td></tr>
                <tr><td>Capacite :                      </td><td style="text-align: left">  ${bac.capacite}</td></tr>
                <tr><td>Date de mise en service :       </td><td style="text-align: left">  ${bac.datems}</td></tr>
                <tr><td>Camion :                        </td><td style="text-align: left">  ${bac.device}</td></tr>
                <tr><td>Fonction  :                     </td><td style="text-align: left">   ${bac.name}</td> </tr>
                <tr><td>Date de la dernière ${etat}  :  </td><td style="text-align: left">  ${bac.devicetime}</td></tr>
              </table>            
            `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      });
      let markerCluster;
      // if(markers.length>0)
      //   markerCluster = new MarkerClusterer(this.map, markers, {
      //     imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
      //     minimumClusterSize: 5,
      //   });
    } catch (error) {
      console.error(error);
    }
    
  }
  isFixedPositions(bac, bacs){
    let existe = {lat: bac.lat, lng: bac.lon};
    for (let b = 0; b < bacs.length; b++) {
      const element = bacs[b];
      if(bac.numero == element.numero)   
        if(element.fixpos == true)
          return {lat: element.latitude, lng: element.longitude};
        else return {lat: element.latitude, lng: element.longitude}; // {lat: parseFloat((element.lastlatitude+"").replace(',', '.')), lng: parseFloat((element.lastlongitude+"").replace(',', '.'))};
        
    }
    return existe;
  }
  async drawBacs(mapi, vehicleId, start, end, etat, type) {
    let bacs = await this.loadBacs(type);
    let rfid = await this.loadRFID(start, end, vehicleId, type, etat);
    // alert("ooooooooooooooooooooooooooooooooooooooooook");
    //console.warn("bacs :", bacs);
    //console.warn("rfid :", rfid);

    bacs.forEach((bac) => {
      let state = "";
      //console.log("is ok ?", this.isGreen(bac, rfid));
      if (this.isGreen(bac, rfid) == true) {
        //console.log(bac.numero);
        state = bac.img_green;
      } else {
        state = bac.img_red;
      }
      const marker = new google.maps.Marker({
        position: { lat: bac.latitude, lng: bac.longitude },
        map: mapi,
        icon: "is_bav/static/img/bacs/" + state,
        draggable: true,
      });
    });
  }
  isGreen(bac, rfid) {
    for (let i = 0; i < rfid.length; i++) {
      const r = rfid[i];
      ///console.log(`test of ${r.numero} and ${bac.numero}`);
      if (r.numero == bac.numero) return true;
    }

    return false;
  }
  isGreen2(bac, rfid) {

    for (let i = 0; i < rfid.length; i++) {
      const r = rfid[i]; 
      if (r.numero == bac.numero) return r.device;
    } 
    return null;
  }
  async loadBacs(type) {
    // alert("ooooooooooooooooooooooooooooooooooooooooook");
    let bacs = [];
    try {
      await Promise.all([
        (bacs = await rpc.query({
          model: "is_bav.bacs",
          method: "getall",
          args: [[], type],
        })),
      ]);
    } catch (error) {
      console.warn(error);
    }
    return bacs;
  }

  async loadRFID(start, end, vehicleId, type, etat) {
    let bacs = [];
    try {
      await Promise.all([
        (bacs = await rpc.query({
          model: "is_rfid.vrfid",
          method: "getRFID",
          args: [[], start, end, vehicleId, type, etat],
        })),
      ]);
    } catch (error) {
      console.warn(error);
    }
    return bacs;
  }
  async displayData(mapi, vehicleId, start, end, etat, type) {
    //console.log("displaying datat for : ", vehicleId, ' from ', start, ' to ', end);
    $("#DataDiv").append(` <div id="myloader" style="display: block;z-index: 99;height: 22vw;width: 100%;position: absolute; /* background: #ffffff; */width: 100%;max-height: 62em; overflow: auto; z-index: 1; width: 100%; height: 22vw; left: 0vw; min-height: 200px; bottom: 0; overflow-x: hidden; ">
            <div id="loader"style=" position:absolute;top:0px;height:100%;width:100%;display: block;background-color: rgba(64, 64, 64, 0.5);z-index:200">
                <svg version="1.1" style=" position:relative;top:50%;left: 50%;height:10%;width:10%;transform: translateX(-50%) translateY(-50%);" id="L7" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
                    <path fill="#fff" d="M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3 c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z">
                        <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50"
                            to="360 50 50" repeatCount="indefinite" />
                    </path>
                    <path fill="#fff" d="M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7 c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z">
                        <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="-360 50 50" repeatCount="indefinite" />
                    </path>
                    <path fill="#fff" d="M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5 L82,35.7z">
                        <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="2s" from="0 50 50"
                            to="360 50 50" repeatCount="indefinite" />
                    </path>
                </svg>
            </div>
        </div>`
      );
      $("head").append(
        `<link href="${window.location.origin}/is_diagnostic/static/public/styleDiagnostic.css" rel="stylesheet" id="newcss" />`
      );
    type=type.replace('tous', '')+"";
    const loadingDiv = document.getElementById("myloader");
   
    loadingDiv.style.display = "block";
    let domain ;
    let vehicule = null;
    const action = this.env.services.action;
    if(vehicleId == null ) {
       domain = `[
        ["devicetime", ">=", '${start}'],            
        ["devicetime", "<=", '${end}']   ,
        ["name", 'ilike', '${type}']  ,
        ['fonction', 'ilike', '${etat} ${type}s']       
      ]`;
    }else{
      try {  
        await Promise.all([
          (vehicule = await rpc.query({
            model: "fleet.vehicle",
            method: "get_name_of",
            args: [[], vehicleId],
          })),
        ]);
        document.getElementById('SelectedVehText').innerHTML = vehicule[0].device;
        domain = `[
          ["device", "=",'${vehicule[0].device}']     ,
          ["devicetime", ">=", '${start}']            ,            
          ["devicetime", "<=", '${end}']              ,
          ["name", 'ilike', '${type}']                ,
          ['fonction', 'ilike', '${etat}']      
        ]`;
        
      } catch (error) {
        console.log(error);
        loadingDiv.style.display = "none";
        loadingDiv.remove();
      }
    }
     
    //console.error("displaying above table for ", vehicule);
    //console.log(vehicule);
    if (action) {
      //console.log(domain);

      action
        .doAction({
          type: "ir.actions.act_window",
          name: "Open Vehicle Tree View",
          res_model: "is_rfid.vrfid",
          domain: domain,
          views: [[false, "tree"]],
          view_mode: "tree",
          target: "new",
        })
        .then(() => {
          const childDiv = document.getElementsByClassName(
            "o_dialog_container modal-open"
          )[0];
          document
            .getElementsByClassName("modal d-block o_technical_modal")[0]
            .setAttribute("style", "z-index : 0");
          loadingDiv.remove();
          const parentDiv = document.getElementById("DataDiv");
          parentDiv.appendChild(childDiv);
        })
        .catch((error) => {
          console.error(error);
          loadingDiv.style.display = "none";
          loadingDiv.remove();
        });
        loadingDiv.style.display = "none";
        loadingDiv.remove();
      }
    
    loadingDiv.style.display = "none";
    loadingDiv.remove();
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
        center: { lat: 35.7444, lng: -5.800731 },
        zoom: 8,
      });
      setTimeout(() => {}, 1000);
      let position = [
        { lat: "35.7444", lng: "-5.800731", display_name: "display_name" },
      ];
      position.forEach((item) => {
        const marker = new window.google.maps.Marker({
          position: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lng),
          },
          map: map,
          icon: "http://larache.geodaki.com:3000/images/bacmetal_vert.png",
          draggable: true,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
                        <div class="o_kanban_record o_kanban_record_has_image_fill d-flex w-100">
                          <h1 class='h1markername'> ${item.display_name}</h1>
                        </div>
                      `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      });
    } catch (e) {
      console.error("e => ", e);
    }

    await this.addSplit();
    
  }

  onClickVehicule(vehicleid) {
    alert(vehicleid);
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
              (vehicle.vehicle_group_id[0] === groupId &&
                vehicle.vehicle_group_id[0] === parentGroupId) ||
              vehicle.vehicle_group_id[0] === parentGroupId
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
                                    <span class="vehicle-device">${vehicle.device}</span>
                                    <div class="imgblock"> 
                                        <img class="vehicle-icon clickable" 
                                          data-icon="${vehicle.vehicle_icon_id[0]}"
                                          data-latitude="${vehicle.latitude}" 
                                          id="${vehicle.id}" 
                                          data-longitude="${vehicle.longitude}"    
                                          data-device="${vehicle.device}" 
                                          src="/fleet_monitoring/static/img/vehicules/pied.png">
                                    </div>
                                </div>`,
              type: "vehicle",
              icon: "none",
            };
          }); 

        return groupVehicles;
      };

      $(document).on("click", ".clickable", async (event) => {
        document.getElementById('is_rfid_loader').style.display='flex'
        document.getElementById('Chart').style.height=' 300px '
        //console.log();
        //console.log(event);
        const clickedElement = event.target;
        const id =  clickedElement.id.replace("v-", "");
        //console.error(id);
        var date1 = document.getElementById("date_du").value;
        var time1 = document.getElementById("time_du").value;
        var date2 = document.getElementById("date_au").value;
        var time2 = document.getElementById("time_au").value;
        const start = date1 + " " + time1;
        const end = date2 + " " + time2;
        let dif_mil = new Date(end).getTime() - new Date(start).getTime();
        let dif_h = dif_mil/(1000 * 60 * 60)
        // if(dif_h<0 || dif_h > 24){
        //   this.notification.add(
        //     this.env._t( ' Veuillez selectioné un intreval du temps < 24H '),
        //     {
        //       type: 'danger',
        //     }
        //   );
        //   document.getElementById('is_rfid_loader').style.display='none'
        //   return;
        // }
        if (start > end) { 
          this.notification.add(
            this.env._t( ' La date entrée est invalide '),
            {
              type: 'danger',
            }
          );
          document.getElementById('is_rfid_loader').style.display='none'
          return;
        }  
        this.map = new google.maps.Map(document.getElementById("map"), {
          center: { lat: 35.7444, lng: -5.800731 },
          zoom: 8,
        }); 

        document.getElementById('Chart').style.display="block" 
        document.getElementById('Chart').style.height=' 300px '
        document.getElementById('left_1').classList.toggle('slide-hide'); 
        document.getElementById('left_1').classList.toggle('slide-show'); 
        document.getElementById('left_2').classList.toggle('slide-show' );
        document.getElementById('left_2').classList.toggle('slide-hide' );
        document.getElementById('chiftSelectedText').innerHTML= 'de ' + start + ' au ' + end;
        //console.log('positions');
        await drawTracage(this.map, id, start, end);
        //console.log('circuits');
        await this.drawCircuits(this.map, id, start, end);
        //console.log('RFID');
        await this.drawRFID(this.map,id,start,end,this.state.etat_conteneur,this.state.type_afichage);
        
        //console.log('Data table');
        await this.displayData(this.map,id,start,end,this.state.etat_conteneur,this.state.type_afichage);
        //console.log('Data table2');

        document.getElementById('is_rfid_loader').style.display='none'

      });

      // <img onclick="console.log('${vehicle.device}')" class="vehicle-icon" id="${vehicle.device}" src="/fleet_monitoring/static/img/vehicules/pied.png">

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
}
RfidMapComponent.template = "rfid.MapTemplate";

registry.category("actions").add("action_window_map_owl", RfidMapComponent);
