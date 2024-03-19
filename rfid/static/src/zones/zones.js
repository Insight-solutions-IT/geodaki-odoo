/** @odoo-module **/

import { registry } from "@web/core/registry";
const rpc = require("web.rpc");
import { useService } from "@web/core/utils/hooks";
import { drawZoneDaki } from '../../../../is_decoupage/static/src/js/function.js'
const { Component, onWillStart, onMounted, useState } = owl;

export class CircuitsMap extends Component {
  zonesTrace=[]
  zoneLabel=[]
  setup() {
    
    this.state = useState({
        zones: [],
        etat_conteneur: "collecte",
        type_afichage: "bac",
        displayTree: false,
        selectedZone: null,
        longitude:  -6.841769,
        latitude: 33.992856

    });
    //33.992856, -6.841769


    // onWillUnmount(async ()=>{
    //   // clearInterval(this.dataInterval);
    //   clearInterval(this.rfidInterval);
    //   clearInterval(this.updateInterval);
    //   clearInterval(this.interval5);
    // })
    this.uid = null;
    this.notification = useService('notification');
    this.initUID();
    this.heightpopUp = null;
    this.map = null; 
    this.chart = null;
    this.orm = useService("orm");
    this.modelGroup = "fleet.vehicle.group";
    onMounted(async () => {
        console.log("i'm in the map"); 
        this.notification.add(
          this.env._t('Analyse par zones'),
          {
            type: 'success',
          }
        ); 
        
        
        await this.loadZones();

        if (localStorage.getItem('firstVisitRFID') !== '1') {
          // This is the first visit, so set the flag
          localStorage.setItem('firstVisitRFID', '1');
          location.reload();
        }
        console.warn(this.state.zones);  
        // document.getElementById("DisplayTree").style.marginLeft = "300px";
        //$(document).off("click", ".clickable_circuit");
        const button = document.getElementById("mousEvent");
        console.warn("Chart : ", button);
        button.addEventListener("mousedown", this.handler.bind(this));
        button.addEventListener("touchstart", this.handler.bind(this));
        console.log("resizing");
        document.getElementById("TreeDiag").appendChild(document.getElementById("left_2"))
        setTimeout(()=>{
          localStorage.setItem('firstVisitRFID', 'null');
      },3000);
       await this.initMap();

    });
  }
  async loadZones(){
    try {
      await Promise.all([
        (this.state.zones = await rpc.query({
          model: "is_decoupage",
          method: "all",
          args: [[]],
        })),
      ]);
      // console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
  getData(zone){
    return zone
    // for (let z  = 0; z  < this.state.zones.length; z ++) {
    //   const zi = this.state.zones[z ];
    //   if(zi.id == zone.id)
    //     return zi
    // }
    // return null
  }
  async isUIDExists(){
    let result = null; 
    console.log("checking ", this.uid);
    try {
      await Promise.all([
        (result = await rpc.query({
          model: "is_rfid.readed_bacs_in_zone",
          method: "isExist",
          args: [[], this.uid],
        })),
      ]);
      console.log(result);
    } catch (error) {
      console.error(error);
    }
    return result  
  }
  getZone(id){
    for (let zn  = 0; zn  < this.state.zones.length; zn++) {
      const element = this.state.zones[zn];
      if(element.id ==id)
        return element
    }
    return null
  }
  async reloadMap(){
    this.zonesTrace=[]
    this.zoneLabel=[]
    this.map =  new google.maps.Map(document.getElementById("map"), {
      center: { lat: this.state.latitude, lng:this.state.longitude },
      zoom: 12,
    });
    
    setTimeout(async ()=>{
      await drawZoneDaki(this.map,this.zonesTrace,this.zoneLabel)
      
    }, 500)

  }
  generateRandomUid() { 
    return Math.floor(Math.random() * 1000000); 
  }
  async initUID(){
    do{
      this.uid = this.generateRandomUid();
      let exist = await this.isUIDExists();
      console.log('uid : ', this.uid , ' ?? ' ,(exist ) );

    }while((!this.isUIDExists()));
  }

  async LoadTree() {
    // localStorage.setItem('visitedPage1', 'false');
    console.log("33333333333333333333333333333333333333333333333333333");
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
            model: "is_decoupage.circuits",
            method: "get_collecte_and_lavage",
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

      console.log("vehicules", this.state.vehicles);
      console.log("groups", this.state.groups);
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

          console.log("Selected: " + selectedText);
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
    const currentDate = new Date();
    const currentDateString = currentDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    const currentTimeString = currentDate.toTimeString().split(" ")[0]; // Format as HH:mm

    document.getElementById("date_du").value = currentDateString; 
    document.getElementById("date_au").value = currentDateString;
   
  
 
     
    let vars0 = document.getElementsByName("etat_lavage_collect");
    for (let i = 0; i < vars0.length; i++) {
      const element = vars0[i];
      element.addEventListener("change", async (event) => {
        console.log("type  : ", event.target.id);
        this.state.etat_conteneur = (event.target.id + "").split("_")[1];
        var str = "";
        console.log(this.state.etat_conteneur);
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
        }
        else if (this.state.type_afichage === "caisson") {
          if (this.state.etat_conteneur === "lavage") {
            str = "Afficher la situation du lavage des caisson";
          } else {
            str = "Afficher la situation de collecte des caisson";
          }
        }
        document.getElementById("display_stat").innerHTML = str;
      });
    }
    let vars1 = document.getElementsByName("type_cont");
    for (let i = 0; i < vars1.length; i++) {
      const element = vars1[i];
      element.addEventListener("change", async (event) => {
        console.log("type affichage : ", event.target.id);
        this.state.type_afichage = (event.target.id + "").split("_")[1];
        var str = "";
        //document.getElementById("").innerHTML = "afficher la situation "
        console.log(this.state.etat_conteneur);
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
        } else if (this.state.type_afichage === "caisson") {
          if (this.state.etat_conteneur === "lavage") {
            str = "Afficher la situation du lavage des caissons";
          } else { 
            str = "Afficher la situation de collecte des caissons";
          }
        }
        document.getElementById("display_stat").innerHTML = str;
      });
    }
    
    $(document).on("click", ".display_detail", async (event) => {
      console.log(event.target);
      console.log(event.target.id);
      const id = (event.target.id+'').split('_')[2]
      this.state.selectedZone= this.getZone(id);
      document.getElementById('is_rfid_loader').style.display='flex'

      document.getElementById('Chart').style.height=' 300px '
      var date1 = document.getElementById("date_du").value;
      var time1 = document.getElementById("time_du").value;
      var date2 = document.getElementById("date_au").value;
      var time2 = document.getElementById("time_au").value;
      const start = date1 + " " + time1;
      const end = date2 + " " + time2;
         
      console.error(id);
      // let vehiculePlanifie = await this.loadVehiculeFromPlanning(id, date1, date2);
      // if(vehiculePlanifie.length==0){
        document.getElementById('is_rfid_loader').style.display='none'
        this.notification.add(
          this.env._t(''+ this.state.selectedZone.gshape_name, 'success')
        );
        // return;
      // } 
      
      document.getElementById('Chart').style.display="block"
      document.getElementById('left_1').classList.toggle('slide-hide'); 
      document.getElementById('left_1').classList.toggle('slide-show');  
      document.getElementById('left_2').classList.toggle('slide-hide' )
      document.getElementById('left_2').classList.toggle('slide-show' ) 
      document.getElementById('chiftSelectedText').innerHTML= 'de ' + start + ' au ' + end;
      
    


      // console.warn("vehicle planifier est : ", vehiculePlanifie.length);
      // let vehicles = '';  // Initialize the vehicles string
      // for (let i = 0; i < vehiculePlanifie.length; i++) {
      //   const planif = vehiculePlanifie[i];
      //   console.warn(planif);
      //   vehicles += planif.id;
      //   if (i < vehiculePlanifie.length - 1) {
      //     vehicles += ', ';  // Add a comma and space for all but the last element
      //   }
      //   await this.drawPositions(this.map, planif.id, start, end);
      // }
      // await this.drawCircuit(this.map, id);
      await this.drawRFID(this.map, id,start,end,this.state.etat_conteneur,this.state.type_afichage);
      await this.displayData(this.map, this.state.selectedZone, 'start', 'end', 'etat', 'type')
      // document.getElementById('is_rfid_loader').style.display='none'

    });
        
    document
      .getElementById("display_stat")
      .addEventListener("click", async (e) => {

        document.getElementById('is_rfid_loader').style.display='flex'
        document.getElementById('Chart').style.height=' 300px ' 
        document.getElementById('left_1').classList.toggle('slide-hide'); 
        document.getElementById('left_1').classList.toggle('slide-show'); 
        document.getElementById('left_2').classList.toggle('slide-show' );
        document.getElementById('left_2').classList.toggle('slide-hide' );
        var date1 = document.getElementById("date_du").value;
        var time1 = document.getElementById("time_du").value;
        var date2 = document.getElementById("date_au").value;
        var time2 = document.getElementById("time_au").value;
        
        const start = date1 + ' ' + time1;   
        const end = date2 + ' ' + time2;
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
        // console.log("RFID : ", rfid);
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
          const infoWindow = new google.maps.InfoWindow({
            content:
               `<table> 
                  <tr> 
                    <td>N° park</td>
                    <td style="text-align: left">${element.numero}  </td>
                  </tr>
                  <tr> 
                    <td>Véhicule</td>
                    <td style="text-align: left"> ${device} </td>
                  </tr>
                  <tr>   
                    <td>Fréquence collecte</td>
                    <td style="text-align: left"> ${element.freqcollecte} </td>
                  </tr> 
                  <tr> 
                    <td>Fréquence Lavage</td><td style="text-align: left"> ${element.freqlavage} </td>
                  </tr>
                  <tr> 
                    <td>Type</td>
                    <td style="text-align: left"> ${element.name} </td>
                  </tr>  
              </table>`,
          });
          marker.addListener("click", () => {
            infoWindow.open(this.map, marker);
          });
          
        }
        let markerCluster;
        // markerCluster = new MarkerClusterer(this.map, markersBacs, {
        //   imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
        //   minimumClusterSize: 10,
        // });
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

        console.log("************************************************************");
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
        console.log(nameCounts);
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
          console.log(th);
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

        this.chart = new window.Chart("is_rfid_zones_chart", {
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
        console.log(`this.displayData(this.map, null, ${start}, ${end}, ${etat}, ${type})`);
        //this.displayData(this.map, null, start, end, etat, type);
        console.log('start getting data');
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
        console.log('result to insert : ',result);
        try {
          await Promise.all([
            (result = await rpc.query({
              model: "is_rfid.readed_bacs_in_zone",
              method: "insert1",
              args: [[],result, this.uid ],
            })),
          ]);
        } catch (error) {
          console.warn(error)
        }
        const action = this.env.services.action;
        let domain = `[
          ["session_uid", ">=", '${this.uid}']        
        ]`;
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
            res_model: "is_rfid.readed_bacs_in_zone",
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
      document.getElementById('is_rfid_home_zones').addEventListener('click', async (e)=>{
        // this.map = new google.maps.Map(document.getElementById("map"), {
        //   center: { lat: this.state.latitude, lng:this.state.longitude },
        //   zoom: 12,
        // });
        await this.reloadMap()
        document.getElementById('Chart').style.display="none"
        
        document.getElementById('left_1').classList.toggle('slide-hide'); 
        document.getElementById('left_1').classList.toggle('slide-show'); 
        document.getElementById('left_2').classList.toggle('slide-show' );
        document.getElementById('left_2').classList.toggle('slide-hide' );

        // document.getElementById('left_2').classList.toggle('slide-hide'); 
        // document.getElementById('left_2').classList.toggle('slide-left'); 
        // document.getElementById('left_2').classList.toggle('hide');
        // document.getElementById('left_1').classList.toggle('slide-hide' )
        // document.getElementById('left_1').classList.toggle('slide-left' )
        // document.getElementById('left_1').classList.toggle('hide');
        try {
            
          await Promise.all([
            ( await rpc.query({
              model: "is_rfid.readed_bacs_in_zone",
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
  async loadGoogleMapsAPI() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB-dn4yi8nZ8f8lMfQZNZ8AmEEVT07DEcE&libraries=places&region=ma`;
      script.onload = resolve;
      script.onerror = reject;
      console.log("map script : ", script);
      document.body.appendChild(script);
      const script0 = document.createElement("script");
      script0.src = `https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js`;
      script0.onload = resolve;
      script0.onerror = reject;
      console.log("map script : ", script0);
      document.body.appendChild(script0);
      // <script src="https://cdnjs.cloudflare.com/ajax/libs/js-marker-clusterer/2.2.0/markerclusterer.js"></script>

    });
  }
  async initMap() {
    try {
      await this.loadGoogleMapsAPI();
        
      const { Map, Marker } = await window.google.maps.importLibrary("maps");
      console.log("map was added successfully");

      let map = null;
      // this.map = new Map(document.getElementById("map"), {
      //   center: { lat: this.state.latitude, lng:this.state.longitude },
      //   zoom: 8,
      // });
      await this.reloadMap()
      setTimeout(() => {}, 1000);
      let position = [
        { lat: "this.state.latitude", lng: "-5.800731", display_name: "display_name" },
      ];
  
    } catch (e) {
      console.error("e => ", e);
    }

    await this.addSplit();
    
  }
  async addSplit() {
    console.log("add libs : ");
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
      console.log("groups ok .");
      this.loadAllGroups();
      let charts = document.createElement("script");
      charts.src = "https://cdn.jsdelivr.net/npm/chart.js";
      document.body.appendChild(charts);
    });
  }
  async drawPositions(mapi, vehicleId, start, end) {
    console.log(
      this.map, ' ', mapi
    );
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

      //console.log(positions);
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
        //path: [{ lat: this.state.latitude, lng:this.state.longitude },{ lat: 33.7444, lng:this.state.longitude },{ lat: this.state.latitude, lng: -6.800731 }],
        path: paths,
        strokeColor: randomColor,
        strokeOpacity: 1.0,
        strokeWeight: 5,
        map: mapi,
      });
      //console.log(poly);
      mapi.setCenter(paths[0]);
      
    } catch (error) {
      console.error(error);
    }
  }
  async drawCircuit(mapi, id){
    try {
      let routes = [];
      await Promise.all([
        (routes = await rpc.query({
          model: "is_decoupage.circuits",
          method: "get",
          args: [[], id],
        })),
      ]);
      console.log(routes);
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
          map: this.map,
        });

      }
    } catch (error) {
      console.error(error);
    }
  }
  async loadVehiculeFromPlanning(id, start, end){
    let vehicule = null;
    
    try {
      Promise.all([
        (vehicule = await rpc.query({
          model: "is_planning.is_planning",
          method: "get_vhicle_by_idcir",
          args: [[], id, start, end ],
        })),
      ])
    } catch (error) {
      console.error(error);
    }
    return vehicule
  }
  async drawRFID(mapi, zone_id, start, end, etat, type) {
    // if(etat==='tous') etat  ='' 
    type = type.replace("tous", "");
    if (type == "tous") type = ""; 
    let bacs = await this.loadBacs(type);
    let rfid = await this.loadRFIDForZone(start, end, zone_id, type, etat);
    // alert("ooooooooooooooooooooooooooooooooooooooooook");
    // console.warn('bacs :', bacs);
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
    console.log(nameCounts);
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
    console.log(nbr_on, nbr_off);
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
    }else{
      // this.chart.destroy();

    }
    // document.getElementById('is_rfid_zones_chart').innerHTML=""
    console.log('chart: ',this.chart);

    this.chart = new window.Chart("is_rfid_zones_chart", {
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
    //console.warn("rfid :", JSON.stringify(rfid));
    console.log(rfid)
    
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
      const infoWindow = new google.maps.InfoWindow({
        content:
           `<table> 
              <tr> 
                <td>N° park</td>
                <td style="text-align: left;">${element.numero}  </td>
              </tr>
              <tr> 
                <td>Véhicule</td>
                <td style="text-align: left;"> ${device} </td>
              </tr>
              <tr>
                <td>Fréquence collecte</td>
                <td style="text-align: left;"> ${element.freqcollecte} </td>
              </tr> 
              <tr> 
                <td style="text-align: left;">Fréquence Lavage</td><td> ${element.freqlavage} </td>
              </tr>
              <tr> 
                <td style="text-align: left;">Type</td>
                <td style="text-align: left;"> ${element.name} </td>
              </tr>  
          </table>`,
      });
      marker.addListener("click", () => {
        infoWindow.open(this.map, marker);
      });
      
    }
    let markerCluster;
    // markerCluster = new MarkerClusterer(this.map, markersBacs, {
    //   imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
    //   minimumClusterSize: 10,
    // });
    // this.map.setCenter(
    //   {
    //     lat: parseFloat(bacs[bacs.length-1].latitude),
    //     lng: parseFloat(bacs[bacs.length-1].longitude),
    //   }
    // )
    // rfid.forEach((bac) => { /********** 00 */
    //   let state = "" + bac.img_green;
    //   const marker = new google.maps.Marker({
    //     position: { lat: bac.lat, lng: bac.lon },
    //     map: mapi,
    //     icon: "is_bav/static/img/bacs/" + state,
    //     draggable: true,
    //   });
    // }); 
    await this.inert_data_for_cir(rfid, this.uid);

  }
  async inert_data_for_cir(rfid, uid){
    try {
      await Promise.all([
        (await rpc.query({
          model: "is_rfid.readed_bacs_in_zone",
          method: "insert1",
          args: [[],rfid, this.uid ],
        })),
      ]);
    } catch (error) {
      console.warn(error)
    }
  }
  async loadBacs(type) {
    // alert("ooooooooooooooooooooooooooooooooooooooooook");
    let bacs = [];
    try {
      await Promise.all([
        (bacs = await rpc.query({
          model: "is_bav.bacs",
          method: "getByZone",
          args: [[],this.state.selectedZone.id, type],
        })),
      ]);
    } catch (error) {
      console.warn(error);
    }
    return bacs;
  }
  async loadRFIDForZone(start, end,  zone, type, etat) {
    let bacs = [];
    try {
      await Promise.all([          
        (bacs = await rpc.query({  
          model: "is_rfid.vrfid",  
          method: "getRFIDZone",    
          args: [[], start, end, zone, type, etat],
        })),
      ]);
    } catch (error) {
      console.warn(error);
    }
    return bacs;
  }
  async displayData(mapi, zone, start, end, etat, type) {
    console.log("displaying datat for : ", zone.id, ' from ', start, ' to ', end);
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
    
      try {  
         
        document.getElementById('SelectedVehText').innerHTML = zone.gshape_name;
        // ["zone", "=",'${zone.gshape_name}']     , 
        domain = `[
            ["session_uid", '=', ${this.uid}]         
          ]`;
      } catch (error) {
        console.log(error);
        loadingDiv.style.display = "none";
        loadingDiv.remove();
      }
   
     
       
    if (action) {
      console.log(domain); 
      action
        .doAction({
          type: "ir.actions.act_window",
          name: "Open Vehicle Tree View",
          res_model: "is_rfid.readed_bacs_in_zone",
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
  isGreen(bac, rfid) {
    for (let i = 0; i < rfid.length; i++) {
      const r = rfid[i];
      ///console.log(`test of ${r.numero} and ${bac.numero}`);
      if (r.numero == bac.numero) return true;
    }

    return false;
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
  isGreen2(bac, rfid) {

    for (let i = 0; i < rfid.length; i++) {
      const r = rfid[i];
      // console.log(`test of ${r.numero} and ${bac.numero}`);
      if (r.numero == bac.numero) return r.device;
    } 

    return null;

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
}
CircuitsMap.template = "rfid.zonesTemplate";
registry.category("actions").add("action_window_map_owl_zones", CircuitsMap);
