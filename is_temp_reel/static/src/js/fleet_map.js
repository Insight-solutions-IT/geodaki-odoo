/** @odoo-module **/

import { registry } from "@web/core/registry";
const rpc = require("web.rpc");
import { useService } from "@web/core/utils/hooks";
import {
  drawZoneDaki,
  delete_zones_Daki,renderCircuit
} from "../../../../is_decoupage/static/src/js/function";

const { Component, onWillUnmount, onMounted,onWillStart, useState } = owl;
export class FleetMapComponent1 extends Component {
  map;
  marker_list = [];
  marker_list2 = [];
  vehiculesGlobal = [];
  singleSelection = false;
  i = false;
  divhide = 0;
  buttonIds = [];
  buttonIds2 = [];
  intervale = 10;
  vehiculesT;
  vehiculesT2;
  firstCall = true;
  showBacs = false;
  rfidInterval;
  debfinInterval;
  updateInterval;
  markerCluster;
  legendCheck = false;
  dataInterval;
  rfidNumber;
  vitesseInterval;
  backgroundC;
  circuit_marker_list=[]
  devWidth
  zones = [];
  labelZone = [];
  user;
  dataExport
  setup() {
    this.notification = useService("notification");

    this.state = {
      vehicles: [],
    };

    const map = owl.useRef("map_div");
    this.orm = useService("orm");
    this.vehRef = owl.useRef("veh_lis3");

    let session = require("web.session");

    this.user = session.uid;
    // onWillStart(async () => {
    //   this.buttonIds = this.vehiculesT2 = await rpc.query({
    //     model: "fleet.vehicle",
    //     method: "vehicules_with_icons2",
    //     args: [[], this.user],
    //   });

    //   this.buttonIds.forEach(id => {
    //     document.createElement('img').src= window.location.origin+"/web/image?model=fleet.vehicle&amp;id="+id.id+"&amp;field=image_128"
    //   });
    // })

    onWillUnmount(async () => {
      clearInterval(this.dataInterval);
      clearInterval(this.rfidInterval);
      clearInterval(this.debfinInterval);
      clearInterval(this.updateInterval);

      $("body")
        .append(` <div  id="myloader" style="display: flex;position: absolute;overflow: hidden auto;z-index: 13;width: 100%;height: 100%;left: 0vw;min-height: 200px;bottom: 0px;justify-content: center;text-align: left;"> <div  id="loader" style=" position:absolute;top:0px;height:100%;width:100%;display: block;background-color: rgba(64, 64, 64, 0.5);z-index:600 !important">
            <svg version="1.1" style=" position:relative;top:50%;left: 50%;height:10%;width:10%;transform: translateX(-50%) translateY(-50%);" id="L7" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
            <path fill="#fff" d="M31.6,3.5C5.9,13.6-6.6,42.7,3.5,68.4c10.1,25.7,39.2,38.3,64.9,28.1l-3.1-7.9c-21.3,8.4-45.4-2-53.8-23.3
            c-8.4-21.3,2-45.4,23.3-53.8L31.6,3.5z">
            <animateTransform 
            attributeName="transform" 
            attributeType="XML" 
            type="rotate"
            dur="2s" 
            from="0 50 50"
            to="360 50 50" 
            repeatCount="indefinite" />
            </path>
            <path fill="#fff" d="M42.3,39.6c5.7-4.3,13.9-3.1,18.1,2.7c4.3,5.7,3.1,13.9-2.7,18.1l4.1,5.5c8.8-6.5,10.6-19,4.1-27.7
            c-6.5-8.8-19-10.6-27.7-4.1L42.3,39.6z">
            <animateTransform 
            attributeName="transform" 
            attributeType="XML" 
            type="rotate"
            dur="1s" 
            from="0 50 50"
            to="-360 50 50" 
            repeatCount="indefinite" />
            </path>
            <path fill="#fff" d="M82,35.7C74.1,18,53.4,10.1,35.7,18S10.1,46.6,18,64.3l7.6-3.4c-6-13.5,0-29.3,13.5-35.3s29.3,0,35.3,13.5
            L82,35.7z">
            <animateTransform 
            attributeName="transform" 
            attributeType="XML" 
            type="rotate"
            dur="2s" 
            from="0 50 50"
            to="360 50 50" 
            repeatCount="indefinite" />
            </path>
            </svg>
            </div>  </div>`);
      setTimeout(() => {
        window.location.reload();
      }, 50);
    });

    onMounted(async () => {
      let dd = document.getElementsByClassName("o_main_navbar")[0];
      let computedStyle = getComputedStyle(dd);
      this.backgroundC = computedStyle.getPropertyValue("background-color");

      document.getElementById("firstContainer").style.backgroundColor =
        this.backgroundC;

       this.buttonIds = this.vehiculesT2 = await rpc.query({
        model: "fleet.vehicle",
        method: "vehicules_with_icons2",
        args: [[], this.user],
      });
      // await rpc.query({
      //     model: 'fleet.vehicle',
      //     method: 'add_default_groups_to_existing_records',
      //     args: [[]]
      // });

      const currentURL = window.location.href.split("#")[1];
      const urlParams = new URLSearchParams(currentURL);
      const actionValue = urlParams.get("active_id");

      if (actionValue != null) {
      } else {
        if (localStorage.getItem("firstVisit") !== "1") {
          // This is the first visit, so set the flag
          localStorage.setItem("firstVisit", "1");
          location.reload();
        }
      }

      // this.vehiculesT = await rpc.query({
      //     model: 'fleet.vehicle',
      //     method: 'get_map_data2',
      //     args: [[]]
      // });

      await this.loadJquery();
      this.treeJs();
      // Retrieve a value from localStorage

      //             document.addEventListener('click', function (event) {

      //                 if (!event.target.matches('#loader')) {
      //                     localStorage.setItem('firstVisit', '0');
      //  // For example, reload the page
      //                 }

      //             });
      await this.loadGoogleMapsAPI();
      await this.loadScript(
        `https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js`
      );
      let sheetjs = document.createElement("script");
      sheetjs.src =
        "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js";
      document.body.appendChild(sheetjs);
      $("head").append(
        `<link href="${window.location.origin}/is_temp_reel/static/css/map_view.css"" rel="stylesheet" id="newcss" />`
      );

      await this.loadScript(
        `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js`
      );
      await this.loadScript(
        `https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js`
      );
      await this.loadScript(
        `https://cdn.datatables.net/2.0.0/js/dataTables.js`
      );
      // let jspdf = document.createElement("script");
      // jspdf.src =
      //   "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js";
      // document.body.appendChild(jspdf);
      // let jspdf_autot = document.createElement("script");
      // jspdf_autot.src =
      //   "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js";
      // document.body.appendChild(jspdf_autot);
      // let jst = document.createElement("script");
      // jst.src = "https://cdn.datatables.net/2.0.0/js/dataTables.js";
      // document.body.appendChild(jst);
      // this.handlechangestyle()
      if (window.screen.width < 470) {
        document.getElementById("mapid").style.flex = "0";
      } else if (window.screen.width < 743) {
        // Perform a specific action for larger screens (PC)
        document.getElementById("mapid").style.flex = "1";
      } else if (window.screen.width < 1010 && window.screen.height < 755) {
        // Perform a specific action for larger screens (PC)
        document.getElementById("mapid").style.flex = "1";
      }

      try {
        let result = await rpc.query({
          model: "res.config.settings",
          method: "get_interval",
          args: [[]],
        });
        if (result >= 5) {
          this.intervale = result;
        }
      } catch (error) {
        console.error(error);
      }
      this.initMap();
      this.logo();
      //             // this.getVehicleTree();

      await this.uncheckAllCheckboxes();
      this.buttonEventListener();
      this.VehiculePopUpDiv();
      var self = this;
      drawZoneDaki(this.map, this.zones, this.labelZone);
      if (actionValue != null) {
        this.state.vehicles = self.vehiculesT2.filter(
          (vehi) => vehi.id == actionValue
        );
        this.singleSelection = true;
        await this.get_map_data(this.state.vehicles);
        this.VehiculeInfoPopUp(this.state.vehicles);
      } else {
        await this.get_map_data();
      }
      this.get_data_with_interval();
      // this.vehiculeExport()
      // this.get_state_vehs();

      const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    // Define the threshold values for screen width and height
    const thresholdWidth = 1024; // Example threshold for width
    const thresholdHeight = 768;

      if (screenWidth > thresholdWidth && screenHeight > thresholdHeight) {

      var dev=  document.getElementById("dev")

      var button =   document.getElementById("hidebutton1")
      this.devWidth = parseFloat(window.getComputedStyle(dev).width);

      button.style.left = this.devWidth-0.5 + "px";
      console.log("left "+parseFloat(window.getComputedStyle(dev).width)+" !important");
      }
      document
        .getElementById("hidebutton1")
        .addEventListener("click", function () {
          self.i = !self.i;
          self.vehiculeListVisiblity();
        });
      document
        .getElementsByClassName("dropdown-toggle")[0]
        .addEventListener("click", function () {
          if (document.getElementById("origine")) {
            document.getElementById("origine").innerHTML = "";
          }
        });
      this.legende();
      // window.addEventListener('beforeunload', function(){
      //     if(this.rfidInterval){
      //         this.clearInterval(this.rfidInterval)
      //     }
      //     if(this.updateInterval){
      //         this.clearInterval(this.updateInterval)
      //     }
      // });

      document.getElementById("legend").addEventListener("click", function () {
        self.legendCheck = !self.legendCheck;

        $("#legendContainer").slideToggle(400);
      });

      const circleLegend = document.getElementById("legend");

      // letiables to track mouse state
      let isMouseDown = false;
      let offsetX, offsetY;

      // Add mousedown event listener to start moving the element or trigger the click event
      circleLegend.addEventListener("mousedown", (event) => {
        // Check if the mouse button is the left button (button code 0)
        if (event.button === 0) {
          // Trigger the click event for the element
          // event.preventDefault();
          // circleLegend.click();
        } else {
          // The right mouse button is pressed, so we start dragging the element
          isMouseDown = true;

          // Calculate the initial offset from the mouse click to the element's position
          offsetX = event.clientX - circleLegend.getBoundingClientRect().left;
          offsetY = event.clientY - circleLegend.getBoundingClientRect().top;

          // Prevent default behavior to avoid selecting text while dragging
          event.preventDefault();

          // Set cursor style to grabbing to indicate dragging
          circleLegend.style.cursor = "grabbing";

          // Add mousemove event listener to move the element
          document.addEventListener("mousemove", moveElement);

          // Add mouseup event listener to stop moving the element
          document.addEventListener("mouseup", () => {
            isMouseDown = false;
            document.removeEventListener("mousemove", moveElement);

            // Reset cursor style
            circleLegend.style.cursor = "pointer";
          });
        }
      });

      // Function to move the element based on mouse coordinates
      function moveElement(event) {
        if (isMouseDown) {
          // Calculate new element position based on mouse coordinates and offset
          const newX = event.clientX - offsetX;
          const newY = event.clientY - offsetY;

          // Set the element's position to the new coordinates

          circleLegend.style.left = newX + "px";
          if (20 < newY) {
            circleLegend.style.top = newY + "px";
          } else {
            circleLegend.style.top = 25 + "px";
          }
          document.getElementById("legendContainer").style.left =
            newX - 300 + "px";
          document.getElementById("legendContainer").style.position = "fixed";
          document.getElementById("legendContainer").style.right = null;
          document.getElementById("legendContainer").style.top =
            parseFloat(
              window.getComputedStyle(circleLegend).top.toString().replace("px")
            ) +
            45 +
            "px";

          if (
            parseFloat(
              window
                .getComputedStyle(document.getElementById("dev"))
                .width.toString()
                .replace("px")
            ) >=
            parseFloat(
              window
                .getComputedStyle(document.getElementById("legend"))
                .left.toString()
                .replace("px")
            ) -
              parseFloat(
                window
                  .getComputedStyle(document.getElementById("legendContainer"))
                  .width.toString()
                  .replace("px")
              )
          ) {
            if (20 < newY) {
              circleLegend.style.top = newY + "px";
            } else {
              circleLegend.style.top = 25 + "px";
            }
            document.getElementById("legendContainer").style.top =
              parseFloat(
                window
                  .getComputedStyle(circleLegend)
                  .top.toString()
                  .replace("px")
              ) +
              45 +
              "px";
            if (
              newX <
              parseFloat(
                window
                  .getComputedStyle(document.getElementById("dev"))
                  .width.toString()
                  .replace("px")
              )
            ) {
              circleLegend.style.left =
                parseFloat(
                  window
                    .getComputedStyle(document.getElementById("dev"))
                    .width.toString()
                    .replace("px")
                ) +
                30 +
                "px";
              document.getElementById("legendContainer").style.left =
                parseFloat(
                  window
                    .getComputedStyle(circleLegend)
                    .left.toString()
                    .replace("px")
                ) + "px";
            } else {
              circleLegend.style.left = newX + "px";
              document.getElementById("legendContainer").style.left =
                parseFloat(
                  window
                    .getComputedStyle(circleLegend)
                    .left.toString()
                    .replace("px")
                ) + "px";
            }
          }
          if (
            newX <
            parseFloat(
              window
                .getComputedStyle(document.getElementById("dev"))
                .width.toString()
                .replace("px")
            )
          ) {
            circleLegend.style.left =
              parseFloat(
                window
                  .getComputedStyle(document.getElementById("dev"))
                  .width.toString()
                  .replace("px")
              ) +
              30 +
              "px";
            document.getElementById("legendContainer").style.left =
              parseFloat(
                window
                  .getComputedStyle(circleLegend)
                  .left.toString()
                  .replace("px")
              ) + "px";
          }
          if (
            parseFloat(
              window
                .getComputedStyle(document.getElementById("spl"))
                .width.toString()
                .replace("px")
            ) <=
            parseFloat(
              window
                .getComputedStyle(document.getElementById("legend"))
                .left.toString()
                .replace("px")
            ) +
              parseFloat(
                window
                  .getComputedStyle(document.getElementById("legendContainer"))
                  .width.toString()
                  .replace("px")
              )
          ) {
            if (
              parseFloat(
                window
                  .getComputedStyle(document.getElementById("legend"))
                  .left.toString()
                  .replace("px")
              ) >
              parseFloat(
                window
                  .getComputedStyle(document.getElementById("spl"))
                  .width.toString()
                  .replace("px")
              ) +
                45
            ) {
              // document.getElementById("legend").style.left
              if (
                event.clientX <
                parseFloat(
                  window
                    .getComputedStyle(document.getElementById("spl"))
                    .width.toString()
                    .replace("px")
                ) -
                  50
              ) {
                document.getElementById("legendContainer").style.top =
                  newY + 45 + "px";
                circleLegend.style.top = newY + "px";
              } else {
                circleLegend.style.left =
                  parseFloat(
                    window
                      .getComputedStyle(document.getElementById("spl"))
                      .width.toString()
                      .replace("px")
                  ) -
                  20 +
                  "px";
                if (20 < newY) {
                  circleLegend.style.top = newY + "px";
                } else {
                  circleLegend.style.top = 25 + "px";
                }
                document.getElementById("legendContainer").style.left =
                  parseFloat(
                    window
                      .getComputedStyle(document.getElementById("legend"))
                      .left.toString()
                      .replace("px")
                  ) -
                  300 +
                  "px";
                document.getElementById("legendContainer").style.position =
                  "fixed";
                document.getElementById("legendContainer").style.right = null;
                document.getElementById("legendContainer").style.top =
                  parseFloat(
                    window
                      .getComputedStyle(circleLegend)
                      .top.toString()
                      .replace("px")
                  ) +
                  45 +
                  "px";
              }
            }
          }
          // if(parseFloat(window.getComputedStyle(document.getElementById("dev")).left.toString().replace('px'))+100>newX){
          //     circleLegend.style.left = (parseFloat(window.getComputedStyle(document.getElementById("dev")).width.toString().replace('px'))+30)+"px"

          // }
          if (
            parseFloat(
              window
                .getComputedStyle(document.getElementById("spl"))
                .height.toString()
                .replace("px")
            ) <=
              parseFloat(
                window
                  .getComputedStyle(document.getElementById("legend"))
                  .top.toString()
                  .replace("px")
              ) &&
            window.getComputedStyle(document.getElementById("legendContainer"))
              .display == "none"
          ) {
            if (
              event.clientY >
              parseFloat(
                window
                  .getComputedStyle(document.getElementById("spl"))
                  .height.toString()
                  .replace("px")
              ) -
                50
            ) {
              if (
                parseFloat(
                  window
                    .getComputedStyle(document.getElementById("spl"))
                    .height.toString()
                ) -
                  20 >
                newY
              ) {
                circleLegend.style.top = newY + "px";
              } else {
                circleLegend.style.top =
                  parseFloat(
                    window
                      .getComputedStyle(document.getElementById("spl"))
                      .height.toString()
                  ) -
                  25 +
                  "px";
              }
            }
          }

          if (
            parseFloat(
              window
                .getComputedStyle(document.getElementById("spl"))
                .width.toString()
                .replace("px")
            ) <=
              parseFloat(
                window
                  .getComputedStyle(document.getElementById("legend"))
                  .left.toString()
                  .replace("px")
              ) &&
            window.getComputedStyle(document.getElementById("legendContainer"))
              .display == "none"
          ) {
            if (
              event.clientX >
              parseFloat(
                window
                  .getComputedStyle(document.getElementById("spl"))
                  .width.toString()
                  .replace("px")
              ) -
                50
            ) {
              if (
                parseFloat(
                  window
                    .getComputedStyle(document.getElementById("spl"))
                    .width.toString()
                ) -
                  20 >
                newX
              ) {
                circleLegend.style.left = newX + "px";
              } else {
                circleLegend.style.left =
                  parseFloat(
                    window
                      .getComputedStyle(document.getElementById("spl"))
                      .width.toString()
                  ) -
                  30 +
                  "px";
              }
            }
          }
          if (
            parseFloat(
              window
                .getComputedStyle(document.getElementById("spl"))
                .height.toString()
                .replace("px")
            ) <=
            parseFloat(
              window
                .getComputedStyle(document.getElementById("legend"))
                .top.toString()
                .replace("px")
            ) +
              parseFloat(
                window
                  .getComputedStyle(document.getElementById("legendContainer"))
                  .height.toString()
                  .replace("px")
              )
          ) {
            // document.getElementById("legend").style.left
            if (
              event.clientY >
              parseFloat(
                window
                  .getComputedStyle(document.getElementById("spl"))
                  .height.toString()
                  .replace("px")
              ) -
                50
            ) {
              if (
                parseFloat(
                  window
                    .getComputedStyle(document.getElementById("spl"))
                    .height.toString()
                ) -
                  20 >
                newY
              ) {
                circleLegend.style.top = newY + "px";
              } else {
                circleLegend.style.top =
                  parseFloat(
                    window
                      .getComputedStyle(document.getElementById("spl"))
                      .height.toString()
                  ) -
                  25 +
                  "px";
              }
              document.getElementById("legendContainer").style.top =
                parseFloat(
                  window
                    .getComputedStyle(circleLegend)
                    .top.toString()
                    .replace("px")
                ) -
                5 -
                parseFloat(
                  window
                    .getComputedStyle(
                      document.getElementById("legendContainer")
                    )
                    .height.toString()
                ) +
                "px";
            }

            // else{
            //     circleLegend.style.left = (parseFloat(window.getComputedStyle(document.getElementById("dev")).width.toString().replace('px'))+20)+"px"
            //     if( 20<newY){
            //         circleLegend.style.top = newY + 'px';
            //     }else{
            //         circleLegend.style.top = 25 + 'px';
            //     }
            //     document.getElementById("legendContainer").style.left=  (parseFloat(window.getComputedStyle(document.getElementById("dev")).width.toString().replace('px'))+20)+"px";
            //     document.getElementById("legendContainer").style.position=  'fixed';
            //     document.getElementById("legendContainer").style.right= null;
            //     document.getElementById("legendContainer").style.top= parseFloat(window.getComputedStyle(circleLegend).top.toString().replace('px'))+45 + 'px';

            // }
          }
        }
      }

      let isTouchStarted = false;
      let touchStartX, touchStartY;
      let isClick = true;

      // Add touchstart event listener to start moving the element or trigger the click event
      circleLegend.addEventListener("touchstart", (event) => {
        // Prevent default behavior to avoid scrolling or zooming on touch devices
        event.preventDefault();

        // Store the initial touch coordinates
        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;

        // Reset the click flag
        isClick = true;

        // Add touchmove event listener to move the element
        document.addEventListener("touchmove", moveElement2);

        // Add touchend event listener to stop moving the element or trigger the click event
        document.addEventListener("touchend", touchEndHandler);
      });

      // Function to move the element based on touch coordinates
      function moveElement2(event) {
        // Get the current touch coordinates

        const touch = event.touches[0];
        const currentX = touch.clientX;
        const currentY = touch.clientY;

        // Calculate the distance moved
        const deltaX = currentX - touchStartX;
        const deltaY = currentY - touchStartY;

        // Set the new position of the element
        circleLegend.style.left = currentX + "px";
        circleLegend.style.top = currentY - 15 + "px";
        // If there's significant movement, it's not a click
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
          isClick = false;
        }
      }

      // Touchend handler to remove the touchmove and touchend listeners
      function touchEndHandler() {
        document.removeEventListener("touchmove", moveElement2);
        document.removeEventListener("touchend", touchEndHandler);

        // If it's a click (no movement), trigger the click event
        if (isClick) {
          circleLegend.click();
        }
      }

      this.notification.add(this.env._t("Analyse par Vehicule"), {
        type: "success",
      });

      // // document.getElementById("loader2").style.display="none"
      // //             document.getElementById('loader2').addEventListener("click",function(){

      // //                 document.getElementById('loader2').style.display="none"

      // //             })

      this.handlechangestyle();

      var self = this;



      self.dataExport = await rpc.query({
        model: "fleet.vehicle",
        method: "vehicules_export11",
        args: [[], self.user],
      });

      setInterval(async () => {
        self.dataExport = await rpc.query({
          model: "fleet.vehicle",
          method: "vehicules_export11",
          args: [[], self.user],
        });
      }, 60000);

      document.getElementById("pl_to_pdf").addEventListener("click", () => {
        // Assuming `this.state.circuit_table` is your array of data
        
        

        // Sort by 'taux' in descending order
        try {
          const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
          orientation: 'l',
          unit: 'pt',
          format: 'a2',
          putOnlyUsedFonts:true
         });
        // const pdf = new jsPDF('l', 'pt', [20, 10]);

        // Title for the document
        const title = `Infos des vehicules`;
        pdf.setFontSize(18);
        pdf.text(title, 10, 15);

        // Add the table headers
        const headers = Object.keys(self.dataExport[0]);
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
          body: self.dataExport.map((row) => headers.map((header) => row[header])),
          theme: "striped",
          tableWidth: "auto",
          styles: { overflow: "linebreak" },
          columnStyles: { text: { cellWidth: "auto" } },
          
        });

        // Save the PDF
        pdf.save(`Infos des vehicules.pdf`);
        } catch (error) {
          console.error(error);
        }

        // Initialize jsPDF
        
      });
      document.getElementById("pl_to_csv").addEventListener("click", () => {
       try {
        let myArray = self.dataExport;
        
        // Exclude specific fields and create a new array
        
        // Sort by 'taux' in descending order
        const sortedArray = self.dataExport;
        
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
        link.setAttribute("download", `Infos des vehicules.csv`);
        
        // Append the link to the body to make it clickable
        document.body.appendChild(link);
        
        // Trigger the download
        link.click();
        
        // Clean up the link
        document.body.removeChild(link);
       } catch (error) {
        console.error(error);

       }
        
        
      });

      document.getElementById("pl_to_excel").addEventListener("click", () => {
        
        // myArray = myArray.map(
        //   ({ id, circuit, vehicule, color, ...keepAttrs }) => keepAttrs
        // );

        // Sort by 'taux' in descending order
        

        // Create a workbook
        try{const wb = XLSX.utils.book_new();

        // Convert the array to a worksheet starting from the second row to leave space for the title
        const ws = XLSX.utils.json_to_sheet(self.dataExport, { origin: "A3" });

        // Add the title row
        const title = `Infos des vehicules`;
        const titleCellRef = XLSX.utils.encode_cell({ c: 0, r: 0 }); // A1 cell reference
        ws[titleCellRef] = { v: title, t: "s", s: { font: { bold: true } } };

        // Merge cells for the title row (spanning as wide as the data)
        const merge = [
          {
            s: { r: 0, c: 0 },
            e: { r: 0, c: Object.keys(this.dataExport[0]).length - 1 },
          },
        ];
        if (!ws["!merges"]) ws["!merges"] = [];
        ws["!merges"].push(...merge);

        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // Write the workbook to a file (in Node.js)
        XLSX.writeFile(wb, `Infos des vehicules.xlsx`);
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
        a.download = `Infos des vehicules.xlsx`;
        document.body.appendChild(a);
        // a.click(); // Note: This line was missing in your provided code, it's necessary to trigger the download

        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
}catch(e){
  console.error(e)
}
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

      // setTimeout(() => {
      //   localStorage.setItem("firstVisit", "null");
      // }, 3000);

      // if(localStorage.getItem('firstVisit') == '1'){
      //     localStorage.setItem('firstVisit', '0');

      // }

      // let testB=document.getElementById("testB");
      // testB.addEventListener('click',function(){
      //     self.get_bacs_data();
      // })

      //             try {
      //                 let result = await rpc.query({
      //                     model: 'res.users',
      //                     method: 'user_info2',
      //                     args: [[]]
      //                 });
      //
      //                 let groupIdsString = result[1];
      //                 let groupIdsArray = groupIdsString.match(/\d+/g).map(Number);

      //

      //                 let userGroupIds = groupIdsArray; // Assuming the group IDs are at index 1
      //                 let groupModelAccess=[]
      // // Iterate through group IDs
      // for (let i = 0; i < userGroupIds.length; i++) {
      //     let groupId = userGroupIds[i];

      //     // Make an RPC call to get the group name and access rights based on the group ID
      //     try {
      //     let groupInfo = await rpc.query({
      //         model: 'res.groups',
      //         method: 'search_read',
      //         domain: [['id', '=', groupId]],
      //         fields: ['name', 'model_access'],
      //     });
      //     }catch(error){
      //         console.error("Error during RPC call group permitions:", error);
      //     }
      //     if (groupInfo.length > 0) {
      //         let groupName = groupInfo[0].name;
      //          groupModelAccess.push(groupInfo[0].model_access);

      //
      //     }

      // }
      // const flattenedArray = [...new Set(groupModelAccess.flat())];

      // for (let i = 0; i < flattenedArray.length; i++) {
      //     let accessRightId = flattenedArray[i];

      //     // Make an RPC call to get the group name and access rights based on the group ID
      //     let groupInfo = await rpc.query({
      //         model: 'ir.model.access',
      //         method: 'search_read',
      //         domain: [['id', '=', accessRightId]],
      //         fields: ['name', 'model_id', 'perm_read', 'perm_write', 'perm_create', 'perm_unlink'],
      //     });

      //     if (groupInfo.length > 0) {
      //         let groupName = groupInfo[0].name;
      //         let accessRights = {
      //             read: groupInfo[0].perm_read,
      //             write: groupInfo[0].perm_write,
      //             create: groupInfo[0].perm_create,
      //             unlink: groupInfo[0].perm_unlink,
      //         };

      //
      //     }
      // }
      //             } catch (error) {
      //                 console.error("Error during RPC call:", error);
      //             }
    });
  }

  // async updateVehicleLocation() {
  //     const deviceId = "ARIN1201";

  //     try {
  //         const response = await fetch('http://rabat.geodaki.com:3000/rpc/tempsreel?uid=71');
  //         const jsonData = await response.json();

  //         for (const vehicle of jsonData) {

  //                 try {
  //                     const result = await rpc.query({
  //                         model: 'fleet.vehicle',
  //                         method: 'update_vehicle_location',
  //                         args: [[],vehicle.name, vehicle.lat, vehicle.lon],
  //                     });

  //                     // Handle the result or perform further actions
  //                     if (result) {
  //
  //                     } else {
  //
  //                     }
  //                 } catch (error) {
  //                     console.error('Error updating vehicle location:', error);
  //                 }

  //         }
  //     } catch (error) {
  //         console.error('Error fetching vehicle data:', error);
  //     }
  // }

  // async get_map_data() {
  //     var self = this;
  //     let rpccall =  rpc.query({
  //         model: 'fleet.vehicle',
  //         method: 'get_map_data',
  //         args:[[]],
  //         }).then(async function(result) {
  //           // await self.updateVehicleLocation();
  //             self.delete_old_marker();
  //             self.render_map_data(result);
  //         });
  // }

  async legende() {
    const mainContainer = document.createElement("div");

    // Create the three child divs

    const mainContainer1 = document.createElement("div");
    mainContainer.id = "legendContainer";
    mainContainer.style.display = "none";
    mainContainer1.className = "container1";
    mainContainer1.id = "container1";
    mainContainer.appendChild(mainContainer1);

    // Create a box div inside each child div

    const boxDiv1 = document.createElement("div");
    boxDiv1.className = "box1";
    mainContainer1.appendChild(boxDiv1);

    let string1 = `<div style="display: flex;
                align-items: center;flex-direction:column; margin:4px" ><div><img class="legende-CAMION" src="/fleet_monitoring/static/img/vehicules/camion-vert.png" alt="Example Image"></div>camion</div></div>
                <div style="display: flex;align-items: center;flex-direction:column; margin:4px"><img class="legende-CHARIOT" src="/fleet_monitoring/static/img/vehicules/chariot-vert.png" alt="Example Image">chariot</div></div>
                <div style="display: flex;align-items: center;flex-direction:column; margin:4px"><img class="legende-VOITURE" src="/fleet_monitoring/static/img/vehicules/voiture-vert.png" alt="Example Image">voiture</div></div>
                <div style="display: flex;align-items: center;flex-direction:column; margin:4px"><img class="legende-MOTO" src="/fleet_monitoring/static/img/vehicules/moto-vert.png" alt="Example Image">moto</div></div>
                <div style="display: flex;align-items: center;flex-direction:column; margin:4px;"><img class="legende-NULL" style="width:30px" src="/fleet_monitoring/static/description/icon1.png" alt="Example Image">non définit</div></div>`;

    boxDiv1.innerHTML = string1;

    const boxDiv2 = document.createElement("div");
    boxDiv2.className = "box2";
    mainContainer1.appendChild(boxDiv2);

    let string2 = `<div style="display: flex;align-items: center;margin:5px"><div class="circle-green " style="display:flex"  title="vehicules actifs" ></div>véhicule démarré ou recéption <= 1h</div>
                <div style="display: flex;align-items: center;margin:5px"><div class="circle-yellow "  title="vehicules qui n'ont pas envoyé un signale depuis 1h"></div>véhicule étteint ou réception > 1h</div>
                <div style="display: flex;align-items: center;margin:5px"><div class="circle-red "   title="vehicules qui n'ont pas envoyé un signale depuis 24h"></div>réception > 24h</div>`;

    boxDiv2.innerHTML = string2;

    const boxDiv3 = document.createElement("div");
    boxDiv3.className = "box2";
    mainContainer1.appendChild(boxDiv3);

    let string3 = `<div style="display: flex;align-items: center;"><div><img style="width: 22px;margin: 6px;" src="/fleet_monitoring/static/img/vehicules/acc-vitesse.png" alt="Example Image"></div>Contact ON  véhicule en mouvement</div></div>
                <div style="display: flex;align-items: center;"><div><img style="width: 22px;margin: 6px;" src="/fleet_monitoring/static/img/vehicules/acc.png" alt="Example Image"></div>Contact ON véhicule à l'arrêt</div></div>
                <div style="display: flex;align-items: center;"><div><img style="width: 22px;margin: 6px;" src="/fleet_monitoring/static/img/vehicules/point-exclamation-rouge.png" alt="Example Image"></div>Aucune réception depuis 24h</div></div>
                <div style="display: flex;align-items: center;"><div><img style="width: 22px;margin: 6px;" src="/fleet_monitoring/static/img/vehicules/no-acc-orange.png" alt="Example Image"></div>Contact OFF</div></div>
                `;

    boxDiv3.innerHTML = string3;

    mainContainer.style.position = "absolute";
    mainContainer.style.top = "91px";
    mainContainer.style.right = "0px";
    mainContainer.style.zIndex = "99";
    document.getElementById("mapid").appendChild(mainContainer);
  }

  handlerTree(mouseDownEvent) {
    const startButtonTree = document.getElementById("hidebutton").offsetTop;

    const startPosition = {
      x:
        mouseDownEvent.pageX ||
        (mouseDownEvent.touches && mouseDownEvent.touches[0].pageX),
      y:
        mouseDownEvent.pageY ||
        (mouseDownEvent.touches && mouseDownEvent.touches[0].pageY),
    };

    function onMouseMove(mouseMoveEvent) {
      const currentPosition = {
        x:
          mouseMoveEvent.pageX ||
          (mouseMoveEvent.touches && mouseMoveEvent.touches[0].pageX),
        y:
          mouseMoveEvent.pageY ||
          (mouseMoveEvent.touches && mouseMoveEvent.touches[0].pageY),
      };

      const newHeightButtonTree =
        startButtonTree - (startPosition.y - currentPosition.y);

      document.getElementById(
        "DisplayTree"
      ).style.top = `${newHeightButtonTree}px`;

      // Chart.style.minHeight = `${newHeight}px`;
    }
  }

  //  exportToXLSX(data) {
  //     const worksheet = XLSX.utils.json_to_sheet(data);
  //     const workbook = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');

  //     // Create a blob object containing the XLSX data
  //     const blob = XLSX.write(workbook, { bookType: 'xlsx', type: 'blob' });

  //     // Create a URL for the blob and trigger a download
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'data.xlsx';
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //   }

  //     vehiculeExport(){
  //         var self=this;
  //         let cont=document.getElementById('export');
  //         let input=document.createElement("div");
  //         input.innerHTML=`<svg style="fill:white" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zm368 56a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"/></svg>`
  //         input.style.cursor="pointer"
  //         var self=this
  //         input.addEventListener('click',async function(){
  //             // const action = self.env.services.action;
  //             console.log(self.vehiculesT2)
  //             self.exportToXLSX(self.vehiculesT2);
  //         // action.doAction({
  //         //     type: "ir.actions.act_window",
  //         //     name: "Open Vehicle Form",
  //         //     res_model: "fleet.vehicle", // Replace with your model name
  //         //     // res_id: id, // Replace with the specific vehicle ID
  //         //     domain: [],
  //         //     views: [
  //         //         [false, "tree"],
  //         //     ],
  //         //     view_mode: "tree",
  //         //     target: "new", // Opens in a new frame or small window
  //         // });
  //         // let result = await rpc.query({
  //         //     model: 'fleet.vehicle',
  //         //     method: 'get_map_data',
  //         //     args: [[]]
  //         // });
  //         })

  //         // Assuming you have already obtained the 'result' data
  // // input.addEventListener('click', async function () {
  // //     let result = await rpc.query({
  // //         model: 'fleet.vehicle',
  // //         method: 'get_xls_data',
  // //         args: [[]]
  // //     });
  // //     // Prepare your 'result' data as an array of arrays (2D array)
  // //     const data = result.map(obj => Object.values(obj));

  // //     // Create an XLS workbook and worksheet
  // //     const ws = XLSX.utils.aoa_to_sheet(data);
  // //     const wb = XLSX.utils.book_new();
  // //     XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // //     // Generate XLSX file
  // //     const blob = XLSX.write(wb, { bookType: 'xlsx', type: 'blob' });

  // //     // Create a download link
  // //     const url = URL.createObjectURL(blob);
  // //     const a = document.createElement('a');
  // //     a.href = url;
  // //     a.download = 'fleet_data.xlsx'; // Set the desired filename
  // //     a.click();
  // //     URL.revokeObjectURL(url);
  // // });

  //         cont.appendChild(input)
  //     }

  VehiculePopUpDiv() {
    let origine = document.createElement("div");
    origine.id = "origine";
    let map = document.getElementById("mapid");

    // origine.style.position = "relative"; // Set position to "absolute"
    // origine.style.direction= "rtl";   // Set position to "absolute"

    // origine.style.zIndex = 300;
    // origine.style.backgroundColor = "transparent"; // Set transparent background
    // origine.style.top = "55px";
    // origine.style.right = "0px";
    // if ( window.screen.width < 743 ) {
    //     origine.style.top = "17px"; // Perform a specific action for larger screens (PC)
    //     origine.style.right = "54px";

    // } // Adjust left position as needed
    origine.style.marginLeft = "5px"; // Adjust left position as needed
    origine.style.color = "black"; // Set text color
    origine.style.overflow = "auto"; // Set text color
    origine.style.pointerEvents = "none";

    map.appendChild(origine);
  }

  async VehiculeInfoPopUp(vehiculetemp) {
    // vehiculetemp=await rpc.query({
    //   model: "fleet.vehicle",
    //   method: "vehicules_InfoFull",
    //   args: [[], vehiculetemp.id],
    // });
    console.time("part1")

      clearInterval(this.rfidInterval);
      clearInterval(this.debfinInterval);
      clearInterval(this.debfinInterval);
      clearInterval(this.updateInterval);

    
    var self = this;
    let origine = document.getElementById("origine");
    // origine.style.top = "55px";
    // origine.style.right = "0px";
    // if ( window.screen.width < 743 ) {
    //     origine.style.top = "17px"; // Perform a specific action for larger screens (PC)
    //     origine.style.right = "54px";

    // }
    if (this.state.vehicles.length <= 0) {
      origine.style.height = "0px";
      origine.innerHTML = "";
    } else {
      document.getElementById("loader3").style.display = "block";

      origine.innerHTML = "";
      for (let i = 0; i < vehiculetemp.length; i++) {
        let container = document.createElement("div");
        //    container.style.border="1px solid black";

        let title = document.createElement("div");
        title.style.borderBottom = "1px solid black";
        title.style.backgroundColor = self.backgroundC;
        title.id = vehiculetemp[i].device;
        title.style.fontSize="16px"
        title.style.fontWeight="bold"
        title.innerHTML = "<div>^</div><div>"+vehiculetemp[i].device+"</div>";
        title.style.borderRadius = "8px";
        //    title.style.width="300px";
        //    title.style.height="35px";
        title.style.pointerEvents = "auto";
        title.classList.add("detailsss");
        //    if ( window.screen.width < 743 ) {
        //     title.style.width = "109px"; // Perform a specific action for larger screens (PC)

        // }

        title.style.display = "flex";
        // title.style.justifyContent = "center"; // Center horizontally
        title.style.alignItems = "center"; // Center the text
        title.style.color = "white"; // Set text color
        title.style.cursor = "pointer";

        let details = document.createElement("div");
        details.style.backgroundColor = "white";
        details.style.borderRadius = "8px";
        details.style.direction = "ltr";
        details.style.maxHeight = "488px";
        details.style.overflowX = "hidden";
        details.style.overflowY = "auto";
        details.id =
          "detail-" +
          vehiculetemp[i].device.replaceAll("/", "-").replaceAll(" ", "");
        //    details.innerText=this.state.vehicles[i].device;
        details.style.width = "300px";
        details.style.display = "none";
        details.style.pointerEvents = "auto";
        let vehicleContentDiv = document.createElement("div");
        vehicleContentDiv.style.width = "100%";
        vehicleContentDiv.style.margin = "0px 0px 7px 29px";

        details.style.display = "flex";
        details.style.flexDirection = "column";
        details.style.alignItems = "center";
        let divButtons = document.createElement("div");

        // Create the "info" button
        let infoButton = document.createElement("button");
        infoButton.className = "info-button-click";
        infoButton.textContent = "info";

        let rfidButton = document.createElement("button");
        rfidButton.className = "rfid-button";
        rfidButton.textContent = "RFID";

        divButtons.appendChild(infoButton);
        divButtons.appendChild(rfidButton);
        divButtons.style.margin = "3px";

        let distance=[{
          "sum":0
        } ]
        // = await rpc.query({
        //   model: "fleet.vehicle",
        //   method: "kilometrage",
        //   args: [[], self.state.vehicles[0].id],
        // });

        let contentString = "";

        
          if (vehiculetemp[i].category_name == "CHARIOT") {
            contentString += `
                    <span class="vehicle-type"> <img  style="width: 27px;margin: 6px;transform: translateY(-39px);" src="/fleet_monitoring/static/img/vehicules/${
                      vehiculetemp[i].iconV
                    }" alt="Example Image"> </span><br>
                    <span>Vehicule: ${vehiculetemp[i].device}</span>
                        <hr>
                        <span class="vehicle-info"> Activité: ${
                          vehiculetemp[i].icon
                        }</span>
                        <hr>
                        <span class="vehicle-date"> Date: ${
                          vehiculetemp[i].last_update || ""
                        }</span>
                        <hr>
                        <span class="vehicle-battery" id="v-batterie"> Batterie: ${
                          vehiculetemp[i].last_soc != null
                            ? vehiculetemp[i].last_soc
                            : 0
                        }</span>
                    `;
          } else if (vehiculetemp[i].category_name === "CAMION") {
            // let captExist = await rpc.query({
            //   model: "fleet.vehicle",
            //   method: "get_device_with_capteur_tag",
            //   args: [[], self.state.vehicles[i].device],
            // });
            // let canExist = await rpc.query({
            //   model: "fleet.vehicle",
            //   method: "get_device_with_can_tag",
            //   args: [[], self.state.vehicles[i].device],
            // });
            let date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            // let nbrHeur = await rpc.query({
            //   model: "fleet.vehicle",
            //   method: "getDHActivity",
            //   args: [[], self.state.vehicles[i].id, `${year}-${month}-${day}`],
            // });
            let nbrHeur = 0
            contentString += `
                    <span class="vehicle-type"> <img style="width: 27px;margin: 6px;transform: translateY(-39px);" src="/fleet_monitoring/static/img/vehicules/${
                      vehiculetemp[i].iconV
                    }" alt="Example Image"> </span><br>
                    <span>Vehicule: ${vehiculetemp[i].device}</span>
                        <br>
                        <span class="vehicle-matricule"> Matricule: ${
                          vehiculetemp[i].license_plate || ""
                        }</span>
                        <br>
                        <span class="vehicle-marque"> Marque: ${
                          vehiculetemp[i].model
                        }</span>
                        <br>
                        <span class="vehicle-kilometrage" id="v-kilometrage"> Kilometrage: ${(
                          distance[0].sum / 1000
                        ).toFixed(2)}</span>
                        <br>
                        <span class="vehicle-nbrheure"> Nombre heures: ${
                          nbrHeur.length > 0 ? nbrHeur[0].activite : 0
                        }</span>      
                        <br>
                        <span class="vehicle-fonction"> Activité: ${
                          vehiculetemp[i].icon
                        }</span>
                        <hr>
                        <span class="vehicle-type"> Acc: ${
                          vehiculetemp[i].lacc || ""
                        }</span>
                        <hr>
                        <span class="vehicle-type" id="v-vitesse"> <span style="color:black">Vitesse:</span> ${
                          vehiculetemp[i].last_speed || ""
                        }</span>
                        <hr>
                        <span class="vehicle-date"> Date: ${
                          vehiculetemp[i].last_update || ""
                        }</span>
                        <br>
                        <hr>`;
                        let capteurs_cans = await rpc.query({
                          model: "fleet.vehicle",
                          method: "get_vehicles_cans_caps",
                          args: [[], self.state.vehicles[i].device],
                        });
            if (vehiculetemp[i].has_cap_tag > 0) {

              // let capt_string = await rpc.query({
              //     model: 'fleet.vehicle',
              //     method: 'last_capt_string',
              //     args: [[],self.state.vehicles[i].id]
              // });

              let capt_string = vehiculetemp[i].last_capt;

              contentString += `
                        <span class="vehicle-type"> Capteurs: </span>
                        <br>
                        `;
              capteurs_cans[0].forEach((capteur) => {
                //     contentString += `
                // <p style="color:${capteur.color}">${capteur.name}:<span style="color:${capt_string[0].capt[capteur.position]==1?"green":"red"}"> ${capt_string[0].capt[capteur.position]==1?"on":"off"}</span></p>

                // `
                contentString += `
                        <p style="color:${capteur.color}">${
                  capteur.name
                }:<span style="color:${
                  capt_string[capteur.position] == 1 ? "green" : "red"
                }"> ${
                  capt_string[capteur.position] == 1 ? "on" : "off"
                }</span></p>
                        
                        `;
              });
              contentString += `<hr>`;
            }
            if (vehiculetemp[i].has_can_tag > 0) {
              // let capteurs_cans = await rpc.query({
              //   model: "fleet.vehicle",
              //   method: "get_vehicles_cans_caps",
              //   args: [[], self.state.vehicles[i].device],
              // });

              // let cans = await rpc.query({
              //   model: "fleet.vehicle",
              //   method: "last_capt_string",
              //   args: [[], self.state.vehicles[i].id],
              // });

              // let capt_string =vehiculetemp[i].last_capt

              contentString += `
                        <span class="vehicle-type"> Cans: </span>
                        <br>
                        `;
              // if (cans.length > 0) {
                capteurs_cans[1].forEach((can) => {
                  //     contentString += `
                  // <p style="color:${capteur.color}">${capteur.name}:<span style="color:${capt_string[0].capt[capteur.position]==1?"green":"red"}"> ${capt_string[0].capt[capteur.position]==1?"on":"off"}</span></p>

                  // `
                  if (can.name == "Jauge du niveau de carburant (%)") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span style="color: black"> ${vehiculetemp[i].gas<0?0:vehiculetemp[i].gas}</span></p>
                                
                                `;
                  }
                  if (can.name == "Nombre total d'heures travaillées") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span style="color: black"> ${vehiculetemp[i].hrs<0?vehiculetemp[i].hrs:0}</span></p>
                                
                                `;
                  }
                  if (can.name == "Carburant total consommé (Litres)") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span style="color: black"> ${vehiculetemp[i].can4<0?0:vehiculetemp[i].can4}</span></p>
                                
                                `;
                  }
                  if (can.name == "Température du liquide de refroidissement") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span style="color: black"> ${vehiculetemp[i].can5<0?0:vehiculetemp[i].can5}</span></p>
                                
                                `;
                  }
                  if (can.name == "RPM") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span style="color: black"> ${vehiculetemp[i].can6<0?0:vehiculetemp[i].can6}</span></p>
                                
                                `;
                  }
                  if (can.name == "Ecrasement de la pédale de frein") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span style="color: black"> ${vehiculetemp[i].can7<0?0:vehiculetemp[i].can7}</span></p>
                                
                                `;
                  }
                  if (can.name == "Ecrasement de la pédale d'accélérateur") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span style="color: black"> ${vehiculetemp[i].can8<0?0:vehiculetemp[i].can8}</span></p>
                                
                                `;
                  }
                  if (can.name == "Niveau d'eau de la citerne (Litres)") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span style="color: black"> ${vehiculetemp[i].can9<0?0:vehiculetemp[i].can9}</span></p>
                                
                                `;
                  }
                  if (can.name == "Poids") {

                    if(vehiculetemp[i].unitepoids=="Kg"){

                      contentString += `
                                  <p style="color:${can.color}">${can.name}:<span style="color: black"> ${vehiculetemp[i].can10<0?0:vehiculetemp[i].can10} kg</span></p>
                                  
                                  `;
                    }else{
                      
                      var total=Math.abs(vehiculetemp[i].pv)-Math.abs(vehiculetemp[i].ptac)
                      var can10=Math.abs(vehiculetemp[i].can10)-Math.abs(vehiculetemp[i].ptac)
                      var pourcentage=(can10*100)/total

                      contentString += `
                                  <p style="color:${can.color}">${can.name}:<span style="color: black"> ${vehiculetemp[i].can10<0?0:pourcentage.toFixed(2)} %</span></p>
                                  
                                  `;
                    }
                  }
                });
              // }
              // contentString += `
              //           <p >Odometre:<span "> ${
              //             cans[0] != null ? cans[0].odometre : 0
              //           }</span></p>
                            
              //               `;
              contentString += `<hr>`;
            }

            contentString += `
                        <hr>
                        <span class="vehicle-battery" id="v-batterie"> Batterie: ${
                          vehiculetemp[i].last_soc != null
                            ? vehiculetemp[i].last_soc
                            : 0
                        }</span>
                    `;
          } else if (vehiculetemp[i].category_name === "VOITURE") {
            // let captExist = await rpc.query({
            //   model: "fleet.vehicle",
            //   method: "get_device_with_capteur_tag",
            //   args: [[], self.state.vehicles[i].device],
            // });
            // let canExist = await rpc.query({
            //   model: "fleet.vehicle",
            //   method: "get_device_with_can_tag",
            //   args: [[], self.state.vehicles[i].device],
            // });
            contentString += `
                    <span class="vehicle-type"> <img style="width: 27px;margin: 6px;transform: translateY(-39px);" src="/fleet_monitoring/static/img/vehicules/${
                      vehiculetemp[i].iconV
                    }" alt="Example Image"> </span><br>
                    <span>Vehicule: ${vehiculetemp[i].device}</span>
                        <br>
                        <span class="vehicle-matricule"> Matricule: ${
                          vehiculetemp[i].license_plate || ""
                        }</span>
                        <br>
                        <span class="vehicle-marque"> Marque: ${
                          vehiculetemp[i].model
                        }</span>
                        <br>
                        <span class="vehicle-kilometrage" id="v-kilometrage"> Kilometrage: ${(
                          distance[0].sum / 1000
                        ).toFixed(2)}</span>
                        <br>
                        <span class="vehicle-fonction"> Activité: ${
                          vehiculetemp[i].icon
                        }</span>
                        <hr>
                        <span class="vehicle-type"> Acc: ${
                          vehiculetemp[i].lacc || ""
                        }</span>
                        <hr>
                        <span class="vehicle-type" id="v-vitesse"> <span style="color:black">Vitesse:</span> ${
                          vehiculetemp[i].last_speed || ""
                        }</span>
                        <hr>
                        <span class="vehicle-date"> Date: ${
                          vehiculetemp[i].last_update || ""
                        }</span>
                        <br>
                        <hr>`;
            if (vehiculetemp[i].has_cap_tag > 0) {
              let capteurs_cans = await rpc.query({
                model: "fleet.vehicle",
                method: "get_vehicles_cans_caps",
                args: [[], self.state.vehicles[i].device],
              });

              // let capt_string = await rpc.query({
              //     model: 'fleet.vehicle',
              //     method: 'last_capt_string',
              //     args: [[],self.state.vehicles[i].id]
              // });

              let capt_string = vehiculetemp[i].last_capt;

              contentString += `
                            <span class="vehicle-type"> Capteurs: </span>
                            <br>
                            `;
              capteurs_cans[0].forEach((capteur) => {
                //     contentString += `
                // <p style="color:${capteur.color}">${capteur.name}:<span style="color:${capt_string[0].capt[capteur.position]==1?"green":"red"}"> ${capt_string[0].capt[capteur.position]==1?"on":"off"}</span></p>

                // `
                contentString += `
                            <p style="color:${capteur.color}">${
                  capteur.name
                }:<span style="color:${
                  capt_string[capteur.position] == 1 ? "green" : "red"
                }"> ${
                  capt_string[capteur.position] == 1 ? "on" : "off"
                }</span></p>
                            
                            `;
              });
              contentString += `<hr>`;
            }
            if (vehiculetemp[i].has_can_tag > 0) {
              let capteurs_cans = await rpc.query({
                model: "fleet.vehicle",
                method: "get_vehicles_cans_caps",
                args: [[], self.state.vehicles[i].device],
              });

              let cans = await rpc.query({
                model: "fleet.vehicle",
                method: "last_capt_string",
                args: [[], self.state.vehicles[i].id],
              });

              // let capt_string =vehiculetemp[i].last_capt

              contentString += `
                            <span class="vehicle-type"> Cans: </span>
                            <br>
                            `;
              if (cans.length > 0) {
                capteurs_cans[1].forEach((can) => {
                  //     contentString += `
                  // <p style="color:${capteur.color}">${capteur.name}:<span style="color:${capt_string[0].capt[capteur.position]==1?"green":"red"}"> ${capt_string[0].capt[capteur.position]==1?"on":"off"}</span></p>

                  // `
                  if (can.name == "Jauge du niveau de carburant (%)") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span "> ${cans[0].gas}</span></p>
                                
                                `;
                  }
                  if (can.name == "Nombre total d'heures travaillées") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span }"> ${cans[0].hrs}</span></p>
                                
                                `;
                  }
                  if (can.name == "Carburant total consommé (Litres)") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span "> ${cans[0].can4}</span></p>
                                
                                `;
                  }
                  if (can.name == "Température du liquide de refroidissement") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span "> ${cans[0].can5}</span></p>
                                
                                `;
                  }
                  if (can.name == "RPM") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span "> ${cans[0].can6}</span></p>
                                
                                `;
                  }
                  if (can.name == "Ecrasement de la pédale de frein") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span "> ${cans[0].can7}</span></p>
                                
                                `;
                  }
                  if (can.name == "Ecrasement de la pédale d'accélérateur") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span "> ${cans[0].can8}</span></p>
                                
                                `;
                  }
                  if (can.name == "Niveau d'eau de la citerne (Litres)") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span "> ${cans[0].can9}</span></p>
                                
                                `;
                  }
                  if (can.name == "Poids") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span "> ${cans[0].can10}</span></p>
                                
                                `;
                  }
                });
              }
              contentString += `
                            <p >Odometre:<span "> ${
                              cans[0] != null ? cans[0].odometre : 0
                            }</span></p>
                                
                                `;
              contentString += `<hr>`;
            }

            contentString += `
                            <hr>
                            <span class="vehicle-battery" id="v-batterie"> Batterie: ${
                              vehiculetemp[i].last_soc != null
                                ? vehiculetemp[i].last_soc
                                : 0
                            }</span>
                        `;
          } else if (vehiculetemp[i].category_name.includes("MOTO")) {
            let captExist = await rpc.query({
              model: "fleet.vehicle",
              method: "get_device_with_capteur_tag",
              args: [[], self.state.vehicles[i].device],
            });
            let canExist = await rpc.query({
              model: "fleet.vehicle",
              method: "get_device_with_can_tag",
              args: [[], self.state.vehicles[i].device],
            });
            contentString += `
                    <span class="vehicle-type"> <img style="width: 27px;margin: 6px;transform: translateY(-39px);" src="/fleet_monitoring/static/img/vehicules/${
                      vehiculetemp[i].iconV
                    }" alt="Example Image"> </span><br>
                    <span>Vehicule: ${vehiculetemp[i].device}</span>
                        <br>
                        <span class="vehicle-matricule"> Matricule: ${
                          vehiculetemp[i].license_plate || ""
                        }</span>
                        <br>
                        <span class="vehicle-marque"> Marque: ${
                          vehiculetemp[i].model
                        }</span>
                        <br>
                        <span class="vehicle-kilometrage" id="v-kilometrage"> Kilometrage: ${(
                          distance[0].sum / 1000
                        ).toFixed(2)}</span>
                        <br>
                        <span class="vehicle-fonction"> Activité: ${
                          vehiculetemp[i].icon
                        }</span>
                        <hr>
                        <span class="vehicle-type"> Acc: ${
                          vehiculetemp[i].lacc || ""
                        }</span>
                        <hr>
                        <span class="vehicle-type" id="v-vitesse"> <span style="color:black">Vitesse:</span> ${
                          vehiculetemp[i].last_speed || ""
                        }</span>
                        <hr>
                        <span class="vehicle-date"> Date: ${
                          vehiculetemp[i].last_update || ""
                        }</span>
                        <br>
                        <hr>`;
            if (captExist.length > 0) {
              let capteurs_cans = await rpc.query({
                model: "fleet.vehicle",
                method: "get_vehicles_cans_caps",
                args: [[], self.state.vehicles[i].device],
              });

              // let capt_string = await rpc.query({
              //     model: 'fleet.vehicle',
              //     method: 'last_capt_string',
              //     args: [[],self.state.vehicles[i].id]
              // });

              let capt_string = vehiculetemp[i].last_capt;

              contentString += `
                            <span class="vehicle-type"> Capteurs: </span>
                            <br>
                            `;
              capteurs_cans[0].forEach((capteur) => {
                //     contentString += `
                // <p style="color:${capteur.color}">${capteur.name}:<span style="color:${capt_string[0].capt[capteur.position]==1?"green":"red"}"> ${capt_string[0].capt[capteur.position]==1?"on":"off"}</span></p>

                // `
                contentString += `
                            <p style="color:${capteur.color}">${
                  capteur.name
                }:<span style="color:${
                  capt_string[capteur.position] == 1 ? "green" : "red"
                }"> ${
                  capt_string[capteur.position] == 1 ? "on" : "off"
                }</span></p>
                            
                            `;
              });
              contentString += `<hr>`;
            }
            if (canExist.length > 0) {
              let capteurs_cans = await rpc.query({
                model: "fleet.vehicle",
                method: "get_vehicles_cans_caps",
                args: [[], self.state.vehicles[i].device],
              });

              let cans = await rpc.query({
                model: "fleet.vehicle",
                method: "last_capt_string",
                args: [[], self.state.vehicles[i].id],
              });

              // let capt_string =vehiculetemp[i].last_capt

              contentString += `
                            <span class="vehicle-type"> Cans: </span>
                            <br>
                            `;
              if (cans.length > 0) {
                capteurs_cans[1].forEach((can) => {
                  //     contentString += `
                  // <p style="color:${capteur.color}">${capteur.name}:<span style="color:${capt_string[0].capt[capteur.position]==1?"green":"red"}"> ${capt_string[0].capt[capteur.position]==1?"on":"off"}</span></p>

                  // `
                  if (can.name == "Jauge du niveau de carburant (%)") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span "> ${cans[0].gas}</span></p>
                                
                                `;
                  }
                  if (can.name == "Nombre total d'heures travaillées") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span }"> ${cans[0].hrs}</span></p>
                                
                                `;
                  }
                  if (can.name == "Carburant total consommé (Litres)") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span "> ${cans[0].can4}</span></p>
                                
                                `;
                  }
                  if (can.name == "Température du liquide de refroidissement") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span "> ${cans[0].can5}</span></p>
                                
                                `;
                  }
                  if (can.name == "RPM") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span "> ${cans[0].can6}</span></p>
                                
                                `;
                  }
                  if (can.name == "Ecrasement de la pédale de frein") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span "> ${cans[0].can7}</span></p>
                                
                                `;
                  }
                  if (can.name == "Ecrasement de la pédale d'accélérateur") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span "> ${cans[0].can8}</span></p>
                                
                                `;
                  }
                  if (can.name == "Niveau d'eau de la citerne (Litres)") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span "> ${cans[0].can9}</span></p>
                                
                                `;
                  }
                  if (can.name == "Poids") {
                    contentString += `
                                <p style="color:${can.color}">${can.name}:<span "> ${cans[0].can10}</span></p>
                                
                                `;
                  }
                });
              }
              contentString += `
                            <p >Odometre:<span "> ${
                              cans[0] != null ? cans[0].odometre : 0
                            }</span></p>
                                
                                `;
              contentString += `<hr>`;
            }

            contentString += `
                            <hr>
                            <span class="vehicle-battery" id="v-batterie"> Batterie: ${
                              vehiculetemp[i].last_soc != null
                                ? vehiculetemp[i].last_soc
                                : 0
                            }</span>
                        `;
          }
          console.timeEnd("part1")
          console.time("part2")


        // let result = await rpc.query({
        //   model: "fleet.vehicle",
        //   method: "get_device_with_rfid_tag",
        //   args: [[], self.state.vehicles[i].device],
        // });






        // divButtons.appendChild(infoButton);
        details.appendChild(divButtons);
        details.appendChild(vehicleContentDiv);

        title.addEventListener("click", function () {
          $(
            ("#detail-" + self.state.vehicles[i].device)
              .replaceAll("/", "-")
              .replaceAll(" ", "")
          ).slideToggle(400);
        });

        vehicleContentDiv.innerHTML = contentString;
        vehicleContentDiv.style.marginBottom = "7px";


        origine.style.height = "600px";

        container.style.marginBottom = "10px";
        container.appendChild(title);
        container.appendChild(details);
        origine.appendChild(container);

        
        if (vehiculetemp[i].has_rfid_tag <= 0) {
          rfidButton.style.display = "none";
        }else{
          let vehicleRfidDiv = document.createElement("div");
          vehicleRfidDiv.style.display = "none";
          vehicleRfidDiv.style.width = "100%";
          vehicleRfidDiv.style.paddingLeft = "10px";
          vehicleRfidDiv.style.paddingRight = "10px";


          infoButton.addEventListener("click", function () {
            infoButton.className = "info-button-click";
            rfidButton.className = "rfid-button";
            details.style.height = "488px";
  
            vehicleContentDiv.style.display = "block";
            vehicleRfidDiv.style.display = "none";
          });
          rfidButton.addEventListener("click", function () {
            details.style.height = "fit-content";
            infoButton.className = "info-button";
            rfidButton.className = "rfid-button-click";
            vehicleContentDiv.style.display = "none";
            vehicleRfidDiv.style.display = "block";
          });

          let debut_fin = await rpc.query({
            model: "fleet.vehicle",
            method: "get_work_hours",
            args: [[], self.state.vehicles[i].id],
          });
          let debutText = document.createElement("p");
          debutText.id = "debutHeure";
          if (debut_fin[0].min != null) {
            debutText.textContent = "Début: " + debut_fin[0].min.split(" ")[1];
          } else {
            debutText.textContent = "Début: ";
          }
          let numb = await rpc.query({
            model: "fleet.vehicle",
            method: "get_num_bacs",
            args: [[], self.state.vehicles[i].id],
          });
          // Create the "Nombre de bacs relevés" text element
          let nombreDeBacsText = document.createElement("p");
          nombreDeBacsText.id = "nbrBacs";
          nombreDeBacsText.textContent =
            "Nombre de bacs relevés: " + numb[0].count;
  
            
          // Create the "Fin:" text element
          let finText = document.createElement("p");
          finText.id = "finHeure";
          if (debut_fin[0].max != null) {
            finText.textContent = "Fin: " + debut_fin[0].max.split(" ")[1];
          } else {
            finText.textContent = "Fin: ";
          }
          vehicleRfidDiv.appendChild(debutText);
        vehicleRfidDiv.appendChild(nombreDeBacsText);
        vehicleRfidDiv.appendChild(finText);
        let buttonDivBacs = document.createElement("div");
        buttonDivBacs.style.position = "relative"; // Center the button horizontally
        buttonDivBacs.style.transform = "translatex(-31%)"; // Center the button horizontally
        buttonDivBacs.style.left = "50%"; // Center the button horizontally

        let afficherButton = document.createElement("button");
        afficherButton.textContent = "Afficher les bacs";
        afficherButton.style.backgroundColor = "#7091F5"; // Button background color
        afficherButton.style.color = "#fff"; // Button text color
        afficherButton.style.padding = "8px 16px"; // Button padding
        afficherButton.style.border = "none"; // Remove button border
        afficherButton.style.cursor = "pointer"; // Add pointer cursor
        afficherButton.style.margin = "0 auto"; // Center the button horizontally
        afficherButton.style.borderRadius = "7px"; // Center the button horizontally
        afficherButton.style.marginBottom = "7px"; // Center the button horizontally
        afficherButton.style.marginRight = "7px"; // Center the button horizontally
        afficherButton.style.display = "inline"; // Center the button horizontally
        afficherButton.style.position = "initial"; // Center the button horizontally

        let afficherButton1 = document.createElement("button");
        afficherButton1.textContent = "Afficher les bacs";
        afficherButton1.style.backgroundColor = "#7091F5"; // Button background color
        afficherButton1.style.color = "#fff"; // Button text color
        afficherButton1.style.padding = "8px 16px"; // Button padding
        afficherButton1.style.border = "none"; // Remove button border
        afficherButton1.style.cursor = "pointer"; // Add pointer cursor
        afficherButton1.style.margin = "0 auto"; // Center the button horizontally
        afficherButton1.style.borderRadius = "7px"; // Center the button horizontally
        afficherButton1.style.marginBottom = "7px"; // Center the button horizontally
        afficherButton1.style.marginRight = "7px"; // Center the button horizontally
        afficherButton1.style.display = "inline"; // Center the button horizontally
        afficherButton1.style.position = "initial";
        let supprimerButton = document.createElement("button");
        supprimerButton.className = "delete-button";
        supprimerButton.innerHTML =
          '<svg class="rfid-svg" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M49.7 32c-10.5 0-19.8 6.9-22.9 16.9L.9 133c-.6 2-.9 4.1-.9 6.1C0 150.7 9.3 160 20.9 160h94L140.5 32H49.7zM272 160V32H173.1L147.5 160H272zm32 0h58c15.1-18.1 32.1-35.7 50.5-52.1c1.5-1.4 3.2-2.6 4.8-3.8L402.9 32H304V160zm209.9-23.7c17.4-15.8 43.9-16.2 61.7-1.2c-.1-.7-.3-1.4-.5-2.1L549.2 48.9C546.1 38.9 536.8 32 526.3 32H435.5l12.8 64.2c9.6 1 19 4.9 26.6 11.8c11.7 10.6 23 21.6 33.9 33.1c1.6-1.6 3.3-3.2 5-4.8zM325.2 210.7c3.8-6.2 7.9-12.5 12.3-18.7H32l4 32H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H44L64 448c0 17.7 14.3 32 32 32s32-14.3 32-32H337.6c-31-34.7-49.6-80.6-49.6-129.9c0-35.2 16.3-73.6 37.2-107.4zm128.4-78.9c-2.8-2.5-6.3-3.7-9.8-3.8c-3.6 0-7.2 1.2-10 3.7c-33.2 29.7-61.4 63.4-81.4 95.8c-19.7 31.9-32.4 66.2-32.4 92.6C320 407.9 390.3 480 480 480c88.7 0 160-72 160-159.8c0-20.2-9.6-50.9-24.2-79c-14.8-28.5-35.7-58.5-60.4-81.1c-5.6-5.1-14.4-5.2-20 0c-9.6 8.8-18.6 19.6-26.5 29.5c-17.3-20.7-35.8-39.9-55.5-57.7zM530 401c-15 10-31 15-49 15c-45 0-81-29-81-78c0-24 15-45 45-82c4 5 62 79 62 79l36-42c3 4 5 8 7 12c18 33 10 75-20 96z"/></svg>';
        // supprimerButton.style.backgroundColor = "#7091F5"; // Button background color
        supprimerButton.style.color = "#fff"; // Button text color
        supprimerButton.style.padding = "8px 16px"; // Button padding
        supprimerButton.style.border = "none"; // Remove button border
        supprimerButton.style.cursor = "pointer"; // Add pointer cursor
        supprimerButton.style.margin = "0 auto"; // Center the button horizontally
        supprimerButton.style.borderRadius = "7px"; // Center the button horizontally
        supprimerButton.style.marginBottom = "7px"; // Center the button horizontally


        let buttonCircuitDiv = document.createElement("div");
        buttonCircuitDiv.style.position = "relative"; // Center the button horizontally
        buttonCircuitDiv.style.transform = "translatex(-83%)"; // Center the button horizontally
        buttonCircuitDiv.style.left = "100%"; // Center the button horizontally


        let circuitButton1 = document.createElement("button");
        circuitButton1.textContent = "Afficher le Circuit Theorique";
        circuitButton1.style.backgroundColor = "#7091F5"; // Button background color
        circuitButton1.style.color = "#fff"; // Button text color
        circuitButton1.style.padding = "8px 16px"; // Button padding
        circuitButton1.style.border = "none"; // Remove button border
        circuitButton1.style.cursor = "pointer"; // Add pointer cursor
        circuitButton1.style.margin = "0 auto"; // Center the button horizontally
        circuitButton1.style.borderRadius = "7px"; // Center the button horizontally
        circuitButton1.style.marginBottom = "7px"; // Center the button horizontally
        circuitButton1.style.marginRight = "7px"; // Center the button horizontally
        circuitButton1.style.display = "inline"; // Center the button horizontally
        circuitButton1.style.position = "initial";

        // Append the text elements and button to the vehicleRfidDiv
        vehicleRfidDiv.appendChild(debutText);
        vehicleRfidDiv.appendChild(nombreDeBacsText);
        vehicleRfidDiv.appendChild(finText);
        buttonDivBacs.appendChild(afficherButton1);
        buttonDivBacs.appendChild(supprimerButton);
        buttonCircuitDiv.appendChild(circuitButton1)
        vehicleRfidDiv.appendChild(buttonCircuitDiv);
        vehicleRfidDiv.appendChild(buttonDivBacs);

        // Create a container div for the colored bar
        let coloredBar = document.createElement("div");
        coloredBar.id="coloredbar"
        coloredBar.style.backgroundColor = "#7091F5"; // Color of your choice
        coloredBar.style.height = "18px"; // Height of the colored bar
        coloredBar.style.borderRadius = "5px"; // Small border radius to create a baguette-like effect
        coloredBar.style.width = "98%"; // Full width of the container
        coloredBar.style.height = "auto"; // Full width of the container
        coloredBar.style.minHeight = "16px"; // Full width of the container
        coloredBar.style.marginBottom = "7px";

        afficherButton.style.position = "relative"; // Center the button horizontally
        afficherButton.style.transform = "translatex(-50%)"; // Center the button horizontally
        afficherButton.style.left = "50%";
        // Append the colored bar to the vehicleRfidDiv
        vehicleRfidDiv.appendChild(coloredBar);
        // divButtons.appendChild(rfidButton);
        details.appendChild(vehicleRfidDiv);




        afficherButton1.addEventListener("click", async function () {
          $(".delete-button").animate(
            {
              backgroundColor: "#ff0000",
            },
            800
          );
          self.delete_old_marker2();
          await self.lazyBacRenderer(self.state.vehicles);
          self.render_bacs_data2();
          self.showBacs = true;
        });
        circuitButton1.addEventListener("click", async function () {
          $(".delete-button").animate(
            {
              backgroundColor: "#ff0000",
            },
            800
          );
          var result = await rpc.query({
            model: 'fleet_vehicle.planing_view',
            method: 'getplaningVehicle',
            args: [[],self.state.vehicles[0].device,new Date()]
        });

        if(result.length > 0){
          renderCircuit(result[0].name,self.circuit_marker_list,self.map,1)
        }else{
          alert("Ce véhicule n'est planifié dans aucun circuit en ce moment !")
        }

          
        });

        supprimerButton.addEventListener("click", function () {
          self.showbacs = false;
          self.delete_old_marker2();
          self.delete_old_marker3();
          $(".delete-button").animate(
            {
              backgroundColor: "#7091F5",
            },
            400
          );
        });

        }

        var battery=await rpc.query({
          model: "fleet.vehicle",
          method: "get_battery",
          args: [[], self.state.vehicles[i].id],
        });
        if(battery.length>0){
          document.getElementById("v-batterie").innerText="Batterie: "+battery[0].soc
        }
        

        



        


        // Append the text elements to the vehicleRfidDiv
        
        // Rest of your code...
        var self = this;


        // var battery=await rpc.query({
        //   model: "fleet.vehicle",
        //   method: "get_battery",
        //   args: [[], self.state.vehicles[i].id],
        // });
        // document.getElementById("v-batterie").innerText="Batterie: "+battery[0].soc

        self.debfinInterval=setInterval(async () => {
          console.time("time2")
          try {

            // if (!result || result.length <= 0) {
            //   rfidButton.style.display = "none";
            // }else{
              let result = await rpc.query({
                model: "fleet.vehicle",
                method: "getTagLast10s",
                args: [[], self.state.vehicles[0].id],
              });
              console.log("result")
              console.log(result)
              if (document.getElementById("coloredbar")!=null) {
                document.getElementById("coloredbar").innerHTML = "";
              }
              if (result.length >= 1) {
                for (let i = 0; i < result.length; i++) {
                  if (document.getElementById("coloredbar")) {
                    document.getElementById("coloredbar").innerHTML += result[i].tag1 + "<br>";
                  } else {
                    clearInterval(self.debfinInterval);
                  }
                }
                if (document.getElementById("coloredbar") && self.showBacs) {
                  // self.delete_old_marker2();
                  // await self.lazyBacRenderer(self.state.vehicles);
                  
                  await self.updateBacs(self.state.vehicles, result);
                  
                  // self.render_bacs_data2();
                  
                }
              }
              let debut_fin = await rpc.query({
                model: "fleet.vehicle",
                method: "get_work_hours",   
                args: [[], self.state.vehicles[i].id],
              });
              console.log(debut_fin)
              if (debut_fin[0].min != null) {
                document.getElementById("debutHeure").textContent = "Début: " + debut_fin[0].min.split(" ")[1];
              } else {
                document.getElementById("debutHeure").textContent = "Début: ";
              }
              let numb = await rpc.query({
                model: "fleet.vehicle",
                method: "get_num_bacs",
                args: [[], self.state.vehicles[i].id],
              });
              console.log(numb)
              // Create the "Nombre de bacs relevés" text element
              document.getElementById("nbrBacs").textContent =
              "Nombre de bacs relevés: " + numb[0].count;
              
              
              // Create the "Fin:" text element
              if (debut_fin[0].max != null) {
                document.getElementById("finHeure").textContent = "Fin: " + debut_fin[0].max.split(" ")[1];
              } else {
                document.getElementById("finHeure").textContent = "Fin: ";
              }

          // }
            
            
            var battery=await rpc.query({
              model: "fleet.vehicle",
              method: "get_battery",
              args: [[], self.state.vehicles[i].id],
            });
            if(battery.length>0){
              document.getElementById("v-batterie").innerText="Batterie: "+battery[0].soc
            }
          } catch (error) {
            console.error(error)
          }
          
          console.timeEnd("time2")
        }, 10000);
        
        document.getElementById("loader3").style.display = "none";

       
        console.timeEnd("part2")
      }
    }
  }



  delete_old_marker3() {
    if(this.circuit_marker_list!=[] || this.circuit_marker_list !=null)
for (var i = 0; i < this.circuit_marker_list.length; i++) {
this.circuit_marker_list[i].setMap(null);

} 
}

  vehiculeListVisiblity() {
    const devElement = $("#dev");
    const button = $("#hidebutton1");
    let split = $(".vsplitter");
    let map = $(".right_panel");

    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    // Define the threshold values for screen width and height
    const thresholdWidth = 1024; // Example threshold for width
    const thresholdHeight = 768;
    // Example threshold for height
    if (!this.i) {
      // Check if the screen width and height exceed the thresholds
      // if (screenWidth > thresholdWidth && screenHeight > thresholdHeight) {
      //     // Perform a specific action for larger screens (PC)
      //     button.animate({
      //         top: "40px"
      //     }, 400, function() {

      //     });

      // }

      // split.animate({
      //     left: "20%",
      //     opacity: "100%",
      //     display:"block"
      // }, 400, function() {
      //     // Animation complete
      // });
      if (screenWidth > thresholdWidth && screenHeight > thresholdHeight) {


        var dev=  document.getElementById("dev")

      var button1 =   document.getElementById("hidebutton1")
      

      button1.style.left = this.devWidth-0.5 + "px";
      console.log("left "+parseFloat(window.getComputedStyle(dev).width)+" !important");
        // Perform a specific action for larger screens (PC)
        
      }
      map.animate(
        {
          width: "80%",
          flex: 2,
        },
        400,
        function () {
          // Animation complete
        }
      );

      devElement.animate(
        {
          width: "20%",
          opacity: "100%",
          display: "block",
          flex: 1,
        },
        400,
        function () {
          // Animation complete
        }
      );
      if (window.screen.width < 470) {
        document.getElementById("mapid").style.flex = "0";
      } else if (window.screen.width < 743) {
        // Perform a specific action for larger screens (PC)
        document.getElementById("mapid").style.flex = "1";
      } else if (window.screen.width < 1010 && window.screen.height < 755) {
        document.getElementById("mapid").style.flex = "1";
      } else {
        document.getElementById("mapid").style.flex = "3";
      }
      document.getElementById("dev").style.display = "block";
    } else {
      if (screenWidth > thresholdWidth && screenHeight > thresholdHeight) {
        // Perform a specific action for larger screens (PC)
        var dev=  document.getElementById("dev")

      var button1 =   document.getElementById("hidebutton1")
      var devWidth = parseFloat(window.getComputedStyle(dev).width);

      button1.style.left = 0 + "px";
      }
      document.getElementById("mapid").style.flex = "1";
      map.animate(
        {
          width: "100%",
        },
        400,
        function () {
          // Animation complete
        }
      );

      devElement.animate(
        {
          width: "0%",
          opacity: 0,
          display: "none",
          flex: 0,
        },
        400,
        function () {
          // Animation complete
        }
      );
      document.getElementById("dev").style.display = "none";

      // split.animate({
      //     left: "-1%",
      //     opacity: 0,
      //     display:"none"
      // }, 400, function() {
      //     // Animation complete
      // });
      // Your jSplit-related code here
    }
  }

  async uncheckAllCheckboxes() {
    var self = this;
    const vehiculeDiv = document.getElementById("vehicules");
    const vehiculeDiv2 = document.getElementById("vehicules2");

    const resetButton = document.createElement("div");
    resetButton.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 0 0 0 0h.4c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V448c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H176c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"/></svg>';
    resetButton.style.display = "inline";

    resetButton.addEventListener("click", async function () {
      self.delete_old_marker3();

      
        
      clearInterval(self.rfidInterval);
    
      clearInterval(self.debfinInterval);
      clearInterval(self.vitesseInterval);
      self.showBacs = false;
      self.delete_old_marker2();
      self.singleSelection = false;
      self.firstCall = true;
      self.map.setZoom(12);
      self.map.setCenter({ lat: 33.964451, lng: -6.842338 });
      // let checkboxes = vehiculeDiv.querySelectorAll("input[type='checkbox']");
      // checkboxes.forEach((checkbox) => {
      //   checkbox.checked = false;
      // });
      // checkboxes = vehiculeDiv2.querySelectorAll("input[type='checkbox']");
      // checkboxes.forEach((checkbox) => {
      //   checkbox.checked = false;
      // });
      self.state.vehicles = [];
      self.render();

      self.VehiculeInfoPopUp();
      await self.get_map_data();

      delete_zones_Daki(self.zones, self.labelZone);
      await drawZoneDaki(self.map, self.zones, self.labelZone);
      // Apply rotation animation by updating the style.transform property
      let rotation = 0;
      const rotationInterval = setInterval(() => {
        rotation += 10; // Adjust the rotation speed
        resetButton.querySelector(
          "svg"
        ).style.transform = `rotate(${rotation}deg)`;

        if (rotation >= 360) {
          clearInterval(rotationInterval);
          resetButton.querySelector("svg").style.transform = ""; // Reset the transform after the animation
        }
      }, 20); // Adjust the interval for smoother animation
    });

    const val = document.getElementById("veh");
    val.appendChild(resetButton);
  }

  // Attach the uncheckAllCheckboxes function to the button click event

  logo() {
    let divRoot = document.getElementById("root1");
    divRoot.style.borderRadius = "7px";
    divRoot.style.margin = "7px";
    divRoot.style.width = "auto";
    divRoot.style.boxShadow =
      "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)";

    let logodiv = document.getElementById("logo");
    let marquee = document.createElement("marquee");
    marquee.textContent = "";
    // logodiv.appendChild(marquee);

    marquee.style.backgroundColor = "#71639E"; // Purple color of Odoo
    marquee.style.color = "white"; // White text color
    marquee.style.padding = "10px";
    marquee.style.fontSize = "25px";
    marquee.style.fontFamily = "Arial, sans-serif"; // Specify a font family
    marquee.style.fontWeight = "bold"; // Make the text bold
    marquee.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.3)"; // Add a subtle text shadow

    // let backgroundImageDiv = document.createElement("div");
    // backgroundImageDiv.style.backgroundImage = "url('/fleet_monitoring/static/img/vehicules/logo1.png')";
    // backgroundImageDiv.style.width = "100%";
    // backgroundImageDiv.style.height = "300px"; // Set the height as needed
    // backgroundImageDiv.style.backgroundSize = "cover";
    // backgroundImageDiv.style.backgroundPosition = "center";
    // logodiv.appendChild(backgroundImageDiv);

    // // Create a container for the circular logo and center it using flexbox
    // let logoContainer = document.createElement("div");
    // logoContainer.style.display = "flex";
    // logoContainer.style.justifyContent = "center"; // Center horizontally
    // logoContainer.style.alignItems = "center"; // Center vertically
    // logoContainer.style.height = "100%"; // Fill the height of the background image div
    // backgroundImageDiv.appendChild(logoContainer);

    // // Create the circular logo image
    // let logoImage = document.createElement("img");
    // logoImage.src = "/fleet_monitoring/static/img/vehicules/insight.png";
    // logoImage.alt = "Logo";
    // logoImage.style.width = "100px"; // Set the width and height as needed
    // logoImage.style.height = "100px";
    // logoImage.style.borderRadius = "50%";
    // logoContainer.appendChild(logoImage);
  }

  get_data_with_interval() {
    var self = this;

    let time = this.intervale; //Seconds
    time = time * 1000;

    console.log();
    this.dataInterval = window.setInterval(function () {
      try {
        if (self.state.vehicles.length <= 0 || self.state.vehicles == []) {
          self.get_map_data();
        } else {
          self.get_map_data(self.state.vehicles);
        }
      } catch (error) {
        clearInterval(self.dataInterval);
        clearInterval(self.rfidInterval);
        clearInterval(self.debfinInterval);
        clearInterval(self.updateInterval);
      }
    }, time);
  }

  // render_map_data(data) {
  //     let img = L.icon({iconUrl: "/fleet_monitoring/static/description/icon1.png",iconSize:[40, 40]});
  //     let i;
  //     for (i = 0; i < data.length; i++) {
  //         let driver = data[i].driver_id && data[i].driver_id[1]
  //         let popup = '<p>Name: </p><span>'+data[i].display_name+'</span><br/><p>Driver Name: </p><span>'+ driver +'</span>'
  //         let m = L.marker([data[i].latitude,data[i].longitude],{icon:img}).addTo(this.map).bindPopup(popup)
  //         this.map.addLayer(m);
  //         this.marker_list.push(m);
  //     }
  // }

  // delete_old_marker() {for (let i = 0; i < this.marker_list.length; i++) {this.map.removeLayer(this.marker_list[i])}}

  async get_state_vehs() {
    var self = this;

    let red = this.vehiculesT.filter(
      (vehicule) =>
        Math.abs(
          new Date(vehicule.last_update.toString().replace("T", " ")) -
            new Date()
        ) /
          (1000 * 60 * 60) /
          24 >
          1 || !vehicule.last_update
    );
    let yellow = this.vehiculesT.filter(
      (vehicule) =>
        Math.abs(
          new Date(vehicule.last_update.toString().replace("T", " ")) -
            new Date()
        ) /
          (1000 * 60 * 60) /
          24 <
          1 &&
        Math.abs(new Date(vehicule.last_update) - new Date()) /
          (1000 * 60 * 60) >
          1
    );
    let green = this.vehiculesT.filter(
      (vehicule) =>
        Math.abs(
          new Date(vehicule.last_update.toString().replace("T", " ")) -
            new Date()
        ) /
          (1000 * 60 * 60) <
        1
    );

    if (document.getElementsByClassName("circle-red")) {
      document.getElementsByClassName("circle-red")[0].innerText = red.length;
      document.getElementsByClassName("circle-green")[0].innerText =
        green.length;
      document.getElementsByClassName("circle-yellow")[0].innerText =
        yellow.length;
    }

    this.updateInterval = setInterval(async function () {
      try {
        if (document.getElementsByClassName("circle-red").length > 0) {
          let result = await rpc.query({
            model: "fleet.vehicle",
            method: "vehicules_with_icons2",
            args: [[]],
          });

          let red = result.filter(
            (vehicule) =>
              (vehicule.last_update != null &&
                Math.abs(
                  new Date(vehicule.last_update.toString().replace("T", " ")) -
                    new Date()
                ) /
                  (1000 * 60 * 60) /
                  24 >
                  1) ||
              vehicule.last_update == null
          );
          let yellow = result.filter(
            (vehicule) =>
              vehicule.last_update != null &&
              Math.abs(
                new Date(vehicule.last_update.toString().replace("T", " ")) -
                  new Date()
              ) /
                (1000 * 60 * 60) /
                24 <
                1 &&
              Math.abs(
                new Date(vehicule.last_update.toString().replace("T", " ")) -
                  new Date()
              ) /
                (1000 * 60 * 60) >
                1
          );
          let green = result.filter(
            (vehicule) =>
              vehicule.last_update != null &&
              Math.abs(
                new Date(vehicule.last_update.toString().replace("T", " ")) -
                  new Date()
              ) /
                (1000 * 60 * 60) <
                1
          );

          document.getElementsByClassName("circle-red")[0].innerHTML =
            red.length;
          document.getElementsByClassName("circle-green")[0].innerHTML =
            green.length;
          document.getElementsByClassName("circle-yellow")[0].innerHTML =
            yellow.length;
        } else {
          clearInterval(self.dataInterval);
          clearInterval(self.rfidInterval);
          clearInterval(self.debfinInterval);
          clearInterval(self.updateInterval);
        }
      } catch (error) {}
    }, (self.intervale + 5) * 1000);
  }

  // Fetch and render map data
  async get_map_data(data = null) {
    var self = this;
    if (data != null) {
    }
    if (data == null || data == []) {
      try {
        let result = await rpc.query({
          model: "fleet.vehicle",
          method: "vehicules_with_icons2",
          args: [[], self.user],
        });
        if (self.firstCall) {
          self.delete_old_marker();
        }
        self.render_map_data(result);
      } catch (error) {
        console.error(error);
      }
    } else if (data.length == 1) {
      try {
        let result = await rpc.query({
          model: "fleet.vehicle",
          method: "vehicules_with_icons2",
          args: [[], self.user],
        });

        // Filter the result array based on a condition
        result = result.filter((vehicle) => vehicle.id === data[0].id);
        if (self.firstCall) {
          self.delete_old_marker();
        }
        self.render_map_data(result);
      } catch (error) {
        console.error(error);
      }

      // self.delete_old_marker();
      // self.render_map_data(data);
    } else {
      if (this.firstCall) {
        self.delete_old_marker();
      }
      this.render_map_data(data);
    }
  }

  //  openVehicleForm(vehicleId) {
  //     // Replace the URL with the appropriate URL to open the form view of the vehicle
  //
  //     const formUrl = `http://localhost:8069/web#id=${vehicleId}&cids=1&menu_id=98&action=131&model=fleet.vehicle&view_type=form`;
  //     window.open(formUrl, '_blank', 'width=800,height=600');
  //
  // }

  openVehicleForm(id) {
    const action = this.env.services.action;

    action.doAction({
      type: "ir.actions.act_window",
      name: "Open Vehicle Form",
      res_model: "fleet.vehicle", // Replace with your model name
      res_id: id, // Replace with the specific vehicle ID
      domain: [],
      views: [[false, "form"]],
      view_mode: "form",
      target: "new", // Opens in a new frame or small window
    });
  }

  openBacForm(id) {
    const action = this.env.services.action;

    action.doAction({
      type: "ir.actions.act_window",
      name: "Open bac Form",
      res_model: "is_bav.bacs", // Replace with your model name
      res_id: id, // Replace with the specific vehicle ID
      domain: [],
      views: [[false, "form"]],
      view_mode: "form",
      target: "new", // Opens in a new frame or small window
    });
  }

  async buttonEventListener() {
    var self = this;
    const container = document.getElementById("mapid");
    this.buttonIds.forEach((buttonid) => {
      container.addEventListener("click", async (event) => {
        if (event.target.matches(`.btn-open-form-${buttonid.id}`)) {
          // Find the associated vehicle ID from a data attribute
          const clickedVehicleId = event.target.dataset.vehicleId;

          // Call the openVehicleForm function with the vehicle ID
          // this.openVehicleForm(clickedVehicleId);

          self.openVehicleForm(buttonid.id);
          //  document.getElementById('popup').style.display="block"
        } else if (event.target.matches(`.btn-open-map-${buttonid.id}`)) {
          let results = await rpc.query({
            model: "fleet.vehicle",
            method: "vehicules_with_icons2",
            args: [[], self.user],
          });

          results = results.filter((result) => result.id == buttonid.id);
          self.openGoogleMaps(results[0].latitude, results[0].longitude);
        }
      });
    });
    this.buttonIds2 = await rpc.query({
      model: "is_bacs.icon_view",
      method: "get_icon2",
      args: [[]],
    });
    this.buttonIds2.forEach((buttonid) => {
      container.addEventListener("click", async (event) => {
        if (event.target.matches(`.btn-open-map-bac-${buttonid.id}`)) {
          let results = await rpc.query({
            model: "fleet.vehicle",
            method: "get_bacs",
            args: [[]],
          });
          results = results.filter((result) => result.id == buttonid.id);
          self.openGoogleMaps(
            parseFloat(results[0].latitude),
            parseFloat(results[0].longitude)
          );
        } else if (event.target.matches(`.btn-open-form-bac-${buttonid.id}`)) {
          // Find the associated vehicle ID from a data attribute
          const clickedVehicleId = event.target.dataset.vehicleId;

          // Call the openVehicleForm function with the vehicle ID
          // this.openVehicleForm(clickedVehicleId);

          self.openBacForm(buttonid.id);
          //  document.getElementById('popup').style.display="block"
        }
      });
    });
    document.addEventListener("click", async (event) => {
      if (event.target.matches(`.legende-CHARIOT`)) {
        let results = await rpc.query({
          model: "fleet.vehicle",
          method: "get_vehicles_in_categorie",
          args: [[], "CHARIOT",this.user],
        });
        this.firstCall = true;

        this.state.vehicles = results;
        this.render();
        this.get_map_data(this.state.vehicles);
      } else if (event.target.matches(`.legende-CAMION`)) {
        let results = await rpc.query({
          model: "fleet.vehicle",
          method: "get_vehicles_in_categorie",
          args: [[], "CAMION",this.user],
        });

        this.firstCall = true;
        this.state.vehicles = results;
        this.render();
        this.get_map_data(this.state.vehicles);
      } else if (event.target.matches(`.legende-MOTO`)) {
        let results = await rpc.query({
          model: "fleet.vehicle",
          method: "get_vehicles_in_categorie",
          args: [[], "MOTO",this.user],
        });

        this.firstCall = true;
        this.state.vehicles = results;
        this.render();
        this.get_map_data(this.state.vehicles);
      } else if (event.target.matches(`.legende-VOITURE`)) {
        let results = await rpc.query({
          model: "fleet.vehicle",
          method: "get_vehicles_in_categorie",
          args: [[], "VOITURE",this.user],
        });

        this.firstCall = true;
        this.state.vehicles = results;
        this.render();
        this.get_map_data(this.state.vehicles);
      } else if (event.target.matches(`.legende-NULL`)) {
        let results = await rpc.query({
          model: "fleet.vehicle",
          method: "get_vehicles_in_categorie",
          args: [[], "Null",this.user],
        });
        // results1=results1.filter(result=> result.category_id.id == null)

        this.firstCall = true;
        this.state.vehicles = results;
        this.render();
        this.get_map_data(this.state.vehicles);
      }
    });
  }

  openGoogleMaps(lat, lng) {
    let googleMapsUrl =
      "https://www.google.com/maps/search/?api=1&query=" + lat + "," + lng;
    window.open(googleMapsUrl, "_blank");
  }

   wait(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

  // Render map data using Google Maps API
  async render_map_data(data) {
    console.time("time1")
    this.buttonIds = data;
    var self = this;
    let img = {
      url: "/fleet_monitoring/static/description/icon1.png",
      scaledSize: new google.maps.Size(40, 40),
    };

    if (self.singleSelection == false) {
    //   if (data.length > 0) {
        if (self.firstCall) {
        //   if (document.getElementById("loader")) {
            document.getElementById("loader").style.display = "block";
        //   }

          for (let i = 0; i < data.length; i++) {
            // img.url = "/fleet_monitoring/static/description/"+data[i].current_icon;

            let contentString =
              "<div><p>Name: </p><span>" +
              data[i].device +
              "</span><br/><p>Driver Name: </p><span>" +
              "</span></div>";

            // const container = document.getElementById("mapid");

            // const buttonex = document.getElementById(
            //   `btn-open-form-${data[i].id}`
            // );

            const button = document.createElement("button");
            button.classList.add(
              "btn",
              "btn-primary",
              `btn-open-form-${data[i].id}`
            );
            button.style.width = "80px";
            button.style.height = "26px";
            button.textContent = "Open";
            button.id = data[i].id;
            button.dataset.vehicleId = data[i].id;

            const button2 = document.createElement("button");
            button2.style.margintop = "15px";
            button2.classList.add(
              "btn",
              "btn-primary",
              `btn-open-map-${data[i].id}`
            );
            button2.style.width = "80px";
            button2.style.height = "26px";
            button2.textContent = "navigate";
            button2.id = data[i].id;
            button2.dataset.vehicleId = data[i].id;

            contentString = `
                   <div style="display: flex;">
                       <div style="display: flex; flex-direction: column; align-items: center; padding-right: 10px;">
                           <img class="img img-fluid" alt="Fichier binaire"
                               src="${window.location.origin}/web/image?model=fleet.vehicle.model.brand&amp;id=${data[i].brand_id}&amp;field=image_128"
                               name="image_128"
                               style="width: 80px; height: 80px; object-fit: cover; margin-bottom: 5px;">
                               ${button.outerHTML} <br>${button2.outerHTML}
                               
                               </div>
                               <div style="flex: 1;">`;
                              //  src="${window.location.origin}/web/image?model=fleet.vehicle.model.brand&amp;id=${data[i].brand_id}&amp;field=image_128"
            // if (data[i].category_id) {
              if (data[i].category_name == "CHARIOT") {
                contentString += `<p>N°Park: ${
                  data[i].device
                }</p><span> Type: ${
                  data[i].category_name
                }</span><br><hr><span> Activité: ${
                  data[i].icon
                }</span><hr><span> Date: ${
                  data[i].last_update || ""
                }
                </span></span>`;
              } else if (data[i].category_name === "CAMION") {
                // let date = new Date();
                // const year = date.getFullYear();
                // const month = String(date.getMonth() + 1).padStart(2, "0");
                // const day = String(date.getDate()).padStart(2, "0");

                // //        let icons=[];
                // let nbrHeur = await rpc.query({
                //   model: "fleet.vehicle",
                //   method: "getDHActivity",
                //   args: [[], data[i].id, `${year}-${month}-${day}`],
                // });
                // +
                // </span><br><span> Nombre heures: ${
                //   nbrHeur.length > 0 ? nbrHeur[0].activite : 0
                // }
                contentString += `<p>Vehicule: ${
                  data[i].device
                }</p><span> Type: ${
                  data[i].category_name
                }</span><br><span> Matricule: ${
                  data[i].license_plate || ""
                }</span><br><span> Marque: ${data[i].marque}/${
                  data[i].model
                }</span><br><span> Kilometrage: ${
                  data[i].odometer1!=null?data[i].odometer1:0
                }</span><br><span> Activité: ${
                  data[i].icon
                }</span><br><hr><span> Date: ${
                  data[i].last_update || ""
                }</span><br></span>`;
              } else if (data[i].category_name === "VOITURE") {
                contentString += `<p>Vehicule: ${
                  data[i].device
                }</p><span> Type: ${
                  data[i].category_name
                }</span><br><span> Matricule: ${
                  data[i].license_plate || ""
                }</span><br><span> Marque:${data[i].marque}/${
                  data[i].model
                }</span><br><span> Activité: ${
                  data[i].icon
                }</span><hr></span><hr><span> Date: ${
                  data[i].last_update || ""
                }</span><br></span>`;
              } else if (data[i].category_name.includes("MOTO")) {
                contentString += `<p>Vehicule: ${
                  data[i].device
                }</p><span> Type: ${
                  data[i].category_name
                }</span><br><span> Matricule: ${
                  data[i].license_plate || ""
                }</span><br><span> Marque: ${data[i].marque}/${
                  data[i].model
                }</span><br><span> Activité: ${
                  data[i].icon
                }</span><hr></span><hr><span> Date: ${
                  data[i].last_update || ""
                }</span><br></span>`;
              }
              //  else{
              //    popupContent = '<p>Vehicule: ' + vehicule.name + '</p><span> Type: ' + vehicule.typecamion + '</span><br><span> Matricule: ' + (vehicule.immatricule !== null ? vehicule.immatricule : '') + '</span><br><span> Marque: ' + vehicule.marque + '</span><br><span> Date de mise en service: ' + vehicule.datems + '</span><br><span> Fonction: ' + vehicule.fonction + '</span><hr><span> Date: ' + vehicule.lastupdate + '</span><br></span><hr><span> Batterie: ' + vehicule.battterie + '</span>';

              //  }
            // }

            contentString += `</div></div>`;

            img.url = "/fleet_monitoring/static/img/vehicules/"+data[i].current_icon;
            // if (data[i].last_update) {
              // const timestamp1 = new Date();
              // let timestamp2 = data[i].last_update;
              // timestamp2 = new Date(
              //   data[i].last_update.toString().replace("T", " ")
              // );

              // // Calculate the time difference in milliseconds
              // const timeDifference = Math.abs(timestamp2 - timestamp1);

              // // Convert milliseconds to hours and days
              // const hoursDifference = timeDifference / (1000 * 60 * 60); // 1 hour = 3600000 milliseconds
              // const daysDifference = hoursDifference / 24;

              // // Define your conditions

              // if (hoursDifference < 1) {
              //   img.url =
              //     "/fleet_monitoring/static/img/vehicules/" + data[i].iconV;
              // } else if (hoursDifference >= 1 && daysDifference < 1) {
              //   img.url =
              //     "/fleet_monitoring/static/img/vehicules/" + data[i].iconO;
              // } else {
              //   img.url =
              //     "/fleet_monitoring/static/img/vehicules/" + data[i].iconR;
              // }
            // }
            // if(i%3==0){
            //   await this.wait(0.5)

            // }
            // await this.wait(0.09)
             
            let infowindow = new google.maps.InfoWindow({
              content: contentString,
            });

            let marker = new google.maps.Marker({
              position: { lat: data[i].latitude, lng: data[i].longitude },
              icon: img,
              map: this.map,
              draggable: false,
              markerId: data[i].id,
            });

            // Use a closure to create a new scope for each marker
            marker.addListener(
              "click",
              (function (marker, infowindow) {
                return function () {
                  infowindow.open(self.map, marker);
                };
              })(marker, infowindow)
            );

            this.marker_list.push(marker);
          }
          self.firstCall = false;
        } else {
          let results = await rpc.query({
            model: "fleet.vehicle",
            method: "vehicules_with_icons2",
            args: [[], self.user],
          });

          data = results.filter((result) => {
            return data.some((item) => item.id === result.id);
          });

          for (let i = 0; i < data.length; i++) {
            img.url = "/fleet_monitoring/static/img/vehicules/"+data[i].current_icon;

            let markerToUpdate = this.marker_list.find(
              (marker) => marker.markerId === data[i].id
            );
            if (markerToUpdate) {
              // Update the marker's position

              
              // if (data[i].last_update) {
              //   const timestamp1 = new Date();
              //   let timestamp2 = data[i].last_update;
              //   timestamp2 = new Date(
              //     data[i].last_update.toString().replace("T", " ")
              //   );

              //   // Calculate the time difference in milliseconds
              //   const timeDifference = Math.abs(timestamp2 - timestamp1);

              //   // Convert milliseconds to hours and days
              //   const hoursDifference = timeDifference / (1000 * 60 * 60); // 1 hour = 3600000 milliseconds
              //   const daysDifference = hoursDifference / 24;

              //   // Define your conditions

              //   if (hoursDifference < 1) {
              //     img.url =
              //       "/fleet_monitoring/static/img/vehicules/" + data[i].iconV;
              //   } else if (hoursDifference >= 1 && daysDifference < 1) {
              //     img.url =
              //       "/fleet_monitoring/static/img/vehicules/" + data[i].iconO;
              //   } else {
              //     img.url =
              //       "/fleet_monitoring/static/img/vehicules/" + data[i].iconR;
              //   }
              // }

              let contentString =
                "<div><p>Name: </p><span>" +
                data[i].device +
                "</span><br/><p>Driver Name: </p><span>" +
                "</span></div>";

              const container = document.getElementById("mapid");

              const buttonex = document.getElementById(
                `btn-open-form-${data[i].id}`
              );

              const button = document.createElement("button");
              button.classList.add(
                "btn",
                "btn-primary",
                `btn-open-form-${data[i].id}`
              );
              button.style.width = "80px";
              button.style.height = "26px";
              button.textContent = "Open";
              button.id = data[i].id;
              button.dataset.vehicleId = data[i].id;

              const button2 = document.createElement("button");
              button2.style.margintop = "15px";
              button2.classList.add(
                "btn",
                "btn-primary",
                `btn-open-map-${data[i].id}`
              );
              button2.style.width = "80px";
              button2.style.height = "26px";
              button2.textContent = "navigate";
              button2.id = data[i].id;
              button2.dataset.vehicleId = data[i].id;

              contentString = `
                <div style="display: flex;">
                    <div style="display: flex; flex-direction: column; align-items: center; padding-right: 10px;">
                        <img class="img img-fluid" alt="Fichier binaire"
                            src="${window.location.origin}/web/image?model=fleet.vehicle.model.brand&amp;id=${data[i].brand_id}&amp;field=image_128"
                            name="image_128"
                            style="width: 80px; height: 80px; object-fit: cover; margin-bottom: 5px;">
                           ${button.outerHTML} <br>${button2.outerHTML}
       
                    </div>
                    <div style="flex: 1;">`;
              // if (data[i].category_id) {
                if (data[i].category_name == "CHARIOT") {
                  contentString += `<p>N°Park: ${
                    data[i].device
                  }</p><span> Type: ${
                    data[i].category_name
                  }</span><br><hr><span> Activité: ${
                    data[i].icon
                  }</span><hr><span> Date: ${
                    data[i].last_update || ""
                  }</span></span>`;
                } else if (data[i].category_name === "CAMION") {
                  // let date = new Date();
                  // const year = date.getFullYear();
                  // const month = String(date.getMonth() + 1).padStart(2, "0");
                  // const day = String(date.getDate()).padStart(2, "0");

                  // //        let icons=[];
                  // let nbrHeur = await rpc.query({
                  //   model: "fleet.vehicle",
                  //   method: "getDHActivity",
                  //   args: [[], data[i].id, `${year}-${month}-${day}`],
                  // });
                  contentString += `<p>Vehicule: ${
                    data[i].device
                  }</p><span> Type: ${
                    data[i].category_name
                  }</span><br><span> Matricule: ${
                    data[i].license_plate || ""
                  }</span><br><span> Marque: ${data[i].marque}/${
                    data[i].model
                  }</span><br><span> Kilometrage: ${
                    data[i].odometer1!=null?data[i].odometer1:0
                  }
                  </span><br><span> Activité: ${
                    data[i].icon
                  }</span><br><hr><span> Date: ${
                    data[i].last_update || ""
                  }</span><br></span>`;
                } else if (data[i].category_name === "VOITURE") {
                  contentString += `<p>Vehicule: ${
                    data[i].device
                  }</p><span> Type: ${
                    data[i].category_name
                  }</span><br><span> Matricule: ${
                    data[i].license_plate || ""
                  }</span><br><span> Marque:${data[i].marque}/${
                    data[i].model
                  }</span><br><span> Activité: ${
                    data[i].icon
                  }</span><hr></span><hr><span> Date: ${
                    data[i].last_update || ""
                  }</span><br></span>`;
                } else if (data[i].category_name.includes("MOTO")) {
                  contentString += `<p>Vehicule: ${
                    data[i].device
                  }</p><span> Type: ${
                    data[i].category_name
                  }</span><br><span> Matricule: ${
                    data[i].license_plate || ""
                  }</span><br><span> Marque: ${data[i].marque}/${
                    data[i].model
                  }</span><br><span> Activité: ${
                    data[i].icon
                  }</span><hr></span><hr><span> Date: ${
                    data[i].last_update || ""
                  }</span><br></span>`;
                }
                //  else{
                //    popupContent = '<p>Vehicule: ' + vehicule.name + '</p><span> Type: ' + vehicule.typecamion + '</span><br><span> Matricule: ' + (vehicule.immatricule !== null ? vehicule.immatricule : '') + '</span><br><span> Marque: ' + vehicule.marque + '</span><br><span> Date de mise en service: ' + vehicule.datems + '</span><br><span> Fonction: ' + vehicule.fonction + '</span><hr><span> Date: ' + vehicule.lastupdate + '</span><br></span><hr><span> Batterie: ' + vehicule.battterie + '</span>';

                //  }
              // }

              contentString += `</div></div>`;

              let infowindow = new google.maps.InfoWindow({
                content: contentString,
              });

              google.maps.event.clearListeners(markerToUpdate, "click");
              // Use a closure to create a new scope for each marker
              markerToUpdate.addListener(
                "click",
                (function (markerToUpdate, infowindow) {
                  return function () {
                    infowindow.open(self.map, markerToUpdate);
                  };
                })(markerToUpdate, infowindow)
              );

              markerToUpdate.setPosition(
                new google.maps.LatLng(data[i].latitude, data[i].longitude)
              );
              markerToUpdate.setIcon(img);
            }
          }
        }
    //   }
    } else {
      if (this.firstCall) {
        for (let i = 0; i < data.length; i++) {
          // img.url = "/fleet_monitoring/static/img/vehicules/"+data[i].current_icon;

          let contentString =
            "<div><p>Name: </p><span>" +
            data[i].device +
            "</span><br/><p>Driver Name: </p><span>" +
            "</span></div>";

          const button = document.createElement("button");
          button.classList.add(
            "btn",
            "btn-primary",
            `btn-open-form-${data[i].id}`
          );
          button.style.width = "80px";
          button.style.height = "26px";
          button.textContent = "Open";
          button.id = data[i].id;
          button.dataset.vehicleId = data[i].id;

          const button2 = document.createElement("button");
          button2.style.margintop = "15px";
          button2.classList.add(
            "btn",
            "btn-primary",
            `btn-open-map-${data[i].id}`
          );
          button2.style.width = "80px";
          button2.style.height = "26px";
          button2.textContent = "navigate";
          button2.id = data[i].id;
          button2.dataset.vehicleId = data[i].id;

          contentString = `
                    <div style="display: flex;">
                        <div style="display: flex; flex-direction: column; align-items: center; padding-right: 10px;">
                            <img class="img img-fluid" alt="Fichier binaire"
                                src="${window.location.origin}/web/image?model=fleet.vehicle.model.brand&amp;id=${data[i].brand_id}&amp;field=image_128"
                                name="image_128"
                                style="width: 80px; height: 80px; object-fit: cover; margin-bottom: 5px;">
                               ${button.outerHTML} <br>${button2.outerHTML}
    
                        </div>
                        <div style="flex: 1;">`;

          // if (data[i].category_id) {
            if (data[i].category_name == "CHARIOT") {
              contentString += `<p>N°Park: ${data[i].device}</p><span> Type: ${
                data[i].category_name
              }</span><br><hr><span> Activité: ${
                data[i].icon
              }</span><hr><span> Date: ${
                data[i].last_update || ""
              }</span></span>`;
            } else if (data[i].category_name === "CAMION") {
              // let date = new Date();
              // const year = date.getFullYear();
              // const month = String(date.getMonth() + 1).padStart(2, "0");
              // const day = String(date.getDate()).padStart(2, "0");

              // //        let icons=[];
              // let nbrHeur = await rpc.query({
              //   model: "fleet.vehicle",
              //   method: "getDHActivity",
              //   args: [[], data[i].id, `${year}-${month}-${day}`],
              // });
              contentString += `<p>Vehicule: ${
                data[i].device
              }</p><span> Type: ${
                data[i].category_name
              }</span><br><span> Matricule: ${
                data[i].license_plate || ""
              }</span><br><span> Marque:${data[i].marque}/${
                data[i].model
              }</span><br><span> Kilometrage: ${
                data[i].odometer1!=null?data[i].odometer1:0
              }</span><br><span> Activité: ${
                data[i].icon
              }</span><br><hr><span> Date: ${
                data[i].last_update || ""
              }</span><br></span>`;
            } else if (data[i].category_name === "VOITURE") {
              contentString += `<p>Vehicule: ${
                data[i].device
              }</p><span> Type: ${
                data[i].category_name
              }</span><br><span> Matricule: ${
                data[i].license_plate || ""
              }</span><br><span> Marque: ${data[i].marque}/${
                data[i].model
              }</span><br><span> Activité: ${
                data[i].icon
              }</span><hr></span><hr><span> Date: ${
                data[i].last_update || ""
              }</span><br></span>`
              // <hr><span> Batterie: ${
              //   data[i].last_soc != null ? data[i].last_soc : 0
              // }</span>`;
            } else if (data[i].category_name.includes("MOTO")) {
              contentString += `<p>Vehicule: ${
                data[i].device
              }</p><span> Type: ${
                data[i].category_name
              }</span><br><span> Matricule: ${
                data[i].license_plate || ""
              }</span><br><span> Marque: ${data[i].marque}/${
                data[i].model
              }</span><br><span> Activité: ${
                data[i].icon
              }</span><hr></span><hr><span> Date: ${
                data[i].last_update || ""
              }</span><br></span>`
              // <hr><span> Batterie: ${
              //   data[i].last_soc != null ? data[i].last_soc : 0
              // }</span>`;
            }
            //  else{
            //    popupContent = '<p>Vehicule: ' + vehicule.name + '</p><span> Type: ' + vehicule.typecamion + '</span><br><span> Matricule: ' + (vehicule.immatricule !== null ? vehicule.immatricule : '') + '</span><br><span> Marque: ' + vehicule.marque + '</span><br><span> Date de mise en service: ' + vehicule.datems + '</span><br><span> Fonction: ' + vehicule.fonction + '</span><hr><span> Date: ' + vehicule.lastupdate + '</span><br></span><hr><span> Batterie: ' + vehicule.battterie + '</span>';

            //  }
          // }
          let newLatLng = new google.maps.LatLng(
            data[i].latitude,
            data[i].longitude
          );
          self.map.panTo(newLatLng);
          self.map.setZoom(25);

          contentString += `</div></div>`;

          img.url = "/fleet_monitoring/static/img/vehicules/"+data[i].current_icon;
          // if (data[i].last_update) {
          //   const timestamp1 = new Date();
          //   const timestamp2 = new Date(
          //     data[i].last_update.toString().replace("T", " ")
          //   );

          //   // Calculate the time difference in milliseconds
          //   const timeDifference = Math.abs(timestamp2 - timestamp1);

          //   // Convert milliseconds to hours and days
          //   const hoursDifference = timeDifference / (1000 * 60 * 60); // 1 hour = 3600000 milliseconds
          //   const daysDifference = hoursDifference / 24;

          //   // Define your conditions

          //   if (hoursDifference < 1) {
          //     img.url =
          //       "/fleet_monitoring/static/img/vehicules/" + data[i].iconV;
          //   } else if (hoursDifference >= 1 && daysDifference < 1) {
          //     img.url =
          //       "/fleet_monitoring/static/img/vehicules/" + data[i].iconO;
          //   } else {
          //     img.url =
          //       "/fleet_monitoring/static/img/vehicules/" + data[i].iconR;
          //   }
          // }

          let infowindow = new google.maps.InfoWindow({
            content: contentString,
          });

          let marker = new google.maps.Marker({
            position: { lat: data[i].latitude, lng: data[i].longitude },
            icon: img,
            map: this.map,
            draggable: false,
            markerId: data[i].id,
          });

          // Use a closure to create a new scope for each marker
          marker.addListener(
            "click",
            (function (marker, infowindow) {
              return function () {
                infowindow.open(self.map, marker);
              };
            })(marker, infowindow)
          );

          this.marker_list.push(marker);
        }
        this.firstCall = false;
      } else {
        let results = await rpc.query({
          model: "fleet.vehicle",
          method: "vehicules_with_icons2",
          args: [[], self.user],
        });

        data = results.filter((result) => {
          return data.some((item) => item.id === result.id);
        });

        for (let i = 0; i < data.length; i++) {
          // img.url = "/fleet_monitoring/static/img/vehicules/"+data[i].current_icon;

          let markerToUpdate = this.marker_list.find(
            (marker) => marker.markerId === data[i].id
          );
          if (markerToUpdate) {
            // Update the marker's position

            img.url = "/fleet_monitoring/static/img/vehicules/"+data[i].current_icon;
            // if (data[i].last_update) {
            //   const timestamp1 = new Date();
            //   let timestamp2 = data[i].last_update;
            //   timestamp2 = new Date(
            //     data[i].last_update.toString().replace("T", " ")
            //   );

            //   // Calculate the time difference in milliseconds
            //   const timeDifference = Math.abs(timestamp2 - timestamp1);

            //   // Convert milliseconds to hours and days
            //   const hoursDifference = timeDifference / (1000 * 60 * 60); // 1 hour = 3600000 milliseconds
            //   const daysDifference = hoursDifference / 24;

            //   // Define your conditions

            //   if (hoursDifference < 1) {
            //     img.url =
            //       "/fleet_monitoring/static/img/vehicules/" + data[i].iconV;
            //   } else if (hoursDifference >= 1 && daysDifference < 1) {
            //     img.url =
            //       "/fleet_monitoring/static/img/vehicules/" + data[i].iconO;
            //   } else {
            //     img.url =
            //       "/fleet_monitoring/static/img/vehicules/" + data[i].iconR;
            //   }
            // }

            let contentString =
              "<div><p>Name: </p><span>" +
              data[i].device +
              "</span><br/><p>Driver Name: </p><span>" +
              "</span></div>";

            

            const button = document.createElement("button");
            button.classList.add(
              "btn",
              "btn-primary",
              `btn-open-form-${data[i].id}`
            );
            button.style.width = "80px";
            button.style.height = "26px";
            button.textContent = "Open";
            button.id = data[i].id;
            button.dataset.vehicleId = data[i].id;

            const button2 = document.createElement("button");
            button2.style.margintop = "15px";
            button2.classList.add(
              "btn",
              "btn-primary",
              `btn-open-map-${data[i].id}`
            );
            button2.style.width = "80px";
            button2.style.height = "26px";
            button2.textContent = "navigate";
            button2.id = data[i].id;
            button2.dataset.vehicleId = data[i].id;

            contentString = `
                <div style="display: flex;">
                    <div style="display: flex; flex-direction: column; align-items: center; padding-right: 10px;">
                        <img class="img img-fluid" alt="Fichier binaire"
                            src="${window.location.origin}/web/image?model=fleet.vehicle.model.brand&amp;id=${data[i].brand_id}&amp;field=image_128"
                            name="image_128"
                            style="width: 80px; height: 80px; object-fit: cover; margin-bottom: 5px;">
                           ${button.outerHTML} <br>${button2.outerHTML}
       
                    </div>
                    <div style="flex: 1;">`;
            // if (data[i].category_id) {
              if (data[i].category_name == "CHARIOT") {
                contentString += `<p>N°Park: ${
                  data[i].device
                }</p><span> Type: ${
                  data[i].category_name
                }</span><br><hr><span> Activité: ${
                  data[i].icon
                }</span><hr><span> Date: ${
                  data[i].last_update || ""
                }</span></span>`
              } else if (data[i].category_name === "CAMION") {
                // let date = new Date();
                // const year = date.getFullYear();
                // const month = String(date.getMonth() + 1).padStart(2, "0");
                // const day = String(date.getDate()).padStart(2, "0");

                // //        let icons=[];
                // let nbrHeur = await rpc.query({
                //   model: "fleet.vehicle",
                //   method: "getDHActivity",
                //   args: [[], data[i].id, `${year}-${month}-${day}`],
                // });
                contentString += `<p>Vehicule: ${
                  data[i].device
                }</p><span> Type: ${
                  data[i].category_name
                }</span><br><span> Matricule: ${
                  data[i].license_plate || ""
                }</span><br><span> Marque: ${data[i].marque}/${
                  data[i].model
                }</span><br><span> Kilometrage: ${
                  data[i].odometer1!=null?data[i].odometer1:0
                }</span><br><span> Activité: ${
                  data[i].icon
                }</span><br><hr><span> Date: ${
                  data[i].last_update || ""
                }</span><br></span>`
              } else if (data[i].category_name === "VOITURE") {
                contentString += `<p>Vehicule: ${
                  data[i].device
                }</p><span> Type: ${
                  data[i].category_name
                }</span><br><span> Matricule: ${
                  data[i].license_plate || ""
                }</span><br><span> Marque:${data[i].marque}/${
                  data[i].model
                }</span><br><span> Activité: ${
                  data[i].icon
                }</span><hr></span><hr><span> Date: ${
                  data[i].last_update || ""
                }</span><br></span>`
              } else if (data[i].category_name.includes("MOTO")) {
                contentString += `<p>Vehicule: ${
                  data[i].device
                }</p><span> Type: ${
                  data[i].category_name
                }</span><br><span> Matricule: ${
                  data[i].license_plate || ""
                }</span><br><span> Marque: ${data[i].marque}/${
                  data[i].model
                }</span><br><span> Activité: ${
                  data[i].icon
                }</span><hr></span><hr><span> Date: ${
                  data[i].last_update || ""
                }</span><br></span>`
              }
              //  else{
              //    popupContent = '<p>Vehicule: ' + vehicule.name + '</p><span> Type: ' + vehicule.typecamion + '</span><br><span> Matricule: ' + (vehicule.immatricule !== null ? vehicule.immatricule : '') + '</span><br><span> Marque: ' + vehicule.marque + '</span><br><span> Date de mise en service: ' + vehicule.datems + '</span><br><span> Fonction: ' + vehicule.fonction + '</span><hr><span> Date: ' + vehicule.lastupdate + '</span><br></span><hr><span> Batterie: ' + vehicule.battterie + '</span>';

              //  }
            // }

            contentString += `</div></div>`;

            let infowindow = new google.maps.InfoWindow({
              content: contentString,
            });

            google.maps.event.clearListeners(markerToUpdate, "click");

            // Use a closure to create a new scope for each marker
            markerToUpdate.addListener(
              "click",
              (function (markerToUpdate, infowindow) {
                return function () {
                  infowindow.open(self.map, markerToUpdate);
                };
              })(markerToUpdate, infowindow)
            );

            markerToUpdate.setPosition(
              new google.maps.LatLng(data[i].latitude, data[i].longitude)
            );
            self.map.panTo(
              new google.maps.LatLng(data[i].latitude, data[i].longitude)
            );
            markerToUpdate.setIcon(img);
          }
        }
      }
    }
    document.getElementById("loader").style.display = "none";

    console.timeEnd("time1")
  }

  // Delete old markers from the map
  delete_old_marker() {
    if (this.marker_list != [] || this.marker_list != null)
      for (let i = 0; i < this.marker_list.length; i++) {
        this.marker_list[i].setMap(null);
      }
    this.marker_list = [];
  }

  async fetchVehicleData() {
    self = this;
    try {
      let response = rpc
        .query({
          model: "fleet.vehicle",
          method: "get_map_data22",
          args: [[]],
        })
        .then(async function (result) {
          self.state.vehicles = result;
          self.render();
        });
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
    }
  }

  loadJquery() {
    return new Promise((resolve, reject) => {
      const script0 = document.createElement("script");
      script0.src = `https://www.jqueryscript.net/demo/Split-Layout-Plugin-jQuery-Splitter/js/jquery.splitter.js?ver=1`;
      script0.onload = resolve;
      script0.onerror = reject;
      document.body.appendChild(script0);
    });
  }

  async recursiveCheck(checkbox, vehicules, groups, i) {
    var self = this;
    if (i) {
      checkbox.checked = true;
    }
    if (isNaN(parseInt(checkbox.id))) {
      if (checkbox.id.includes("check-")) {
        checkbox.addEventListener("change", function () {
          let c = checkbox.id.split("-");

          if (this.checked) {
            let groupsch = groups.filter((group) => group.groupid[0] == c[1]);

            groupsch.forEach((groupch) => {
              document.getElementById("check-" + groupch.id).checked = true;
            });
            let vehiculesch = [];
            if (groupsch.length <= 0) {
              vehiculesch = vehiculesch.concat(
                vehicules.filter(
                  (vehiculech) => vehiculech.vehicle_group_id[0] == c[1]
                )
              );
            } else {
              groupsch.forEach((groupch) => {
                vehiculesch = vehiculesch.concat(
                  vehicules.filter(
                    (vehiculech) =>
                      vehiculech.vehicle_group_id[0] == groupch.id ||
                      vehiculech.vehicle_group_id[0] == c[1]
                  )
                );
              });
            }

            vehiculesch.forEach((vehiculech) => {
              document.getElementById(vehiculech.device).checked = true;
            });
            self.state.vehicles = self.state.vehicles.concat(vehiculesch);
            self.render();
            this.firstCall = true;
            self.get_map_data(self.state.vehicles);
          } else {
            let groupsch = groups.filter((group) => group.groupid[0] == c[1]);

            groupsch.forEach((groupch) => {
              document.getElementById("check-" + groupch.id).checked = false;
            });
            let vehiculesch = [];
            if (groupsch.length <= 0) {
              vehiculesch = vehiculesch.concat(
                vehicules.filter(
                  (vehiculech) => vehiculech.vehicle_group_id[0] == c[1]
                )
              );
            } else {
              groupsch.forEach((groupch) => {
                vehiculesch = vehiculesch.concat(
                  vehicules.filter(
                    (vehiculech) =>
                      vehiculech.vehicle_group_id[0] == groupch.id ||
                      vehiculech.vehicle_group_id[0] == c[1]
                  )
                );
              });
            }
            vehiculesch.forEach((vehiculech) => {
              document.getElementById(vehiculech.device).checked = false;
            });
            self.state.vehicles = vehiculesch.filter(
              (vehicule) => !self.state.vehicles.includes(vehicule)
            );
            self.render();

            if (self.state.vehicles.length <= 0) {
              this.firstCall = true;
              self.get_map_data();
            } else {
              this.firstCall = true;
              self.get_map_data(self.state.vehicles);
            }
          }
        });
      }
    }
  }

  async loadScript(char) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = char;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
  async loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;

      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async treeJs() {
    this.loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/jstree/3.2.1/jstree.min.js"
    );

    var self = this;
    let vehicules = [];
    let groups = [];

    // Fetch vehicle and group data
    await Promise.all([
      rpc
        .query({
          model: "fleet.vehicle",
          method: "vehicules_with_icons2",
          args: [[], self.user],
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
    try {
      localStorage.removeItem("jstree");

      const nestedData = this.createNestedData(vehicules, groups);
      let a;
      $("#vehicules3").jstree({
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
          // 'checkbox',
        ],
      });
      //                 .on('select_node.jstree', (e, data) => {
      //                     const selectedText = data.selected
      //                         .map((nodeId) => {
      //                             const node = data.instance.get_node(nodeId);
      //                             const parser = new DOMParser();
      // const htmlDoc = parser.parseFromString(node.text, 'text/html');
      // if( htmlDoc.querySelector('.vehicle-device')){
      //     const name = htmlDoc.querySelector('.vehicle-device').textContent;
      //     return name

      // }
      // return node.text
      // .replace(/<[^>]+>/g, '')
      // .replace(/\s+/g, '');
      //                         })
      //                         .join(', ');
      //

      //
      //                         self.state.vehicles = vehicules.filter(vehicule => vehicule.device == selectedText)
      //                     self.render()

      //                    if(self.state.vehicles.length>0){
      //
      //                     self.singleSelection = true;
      //                     self.get_map_data(self.state.vehicles);
      //                     self.VehiculeInfoPopUp()
      //                    }

      //
      //                 });

      $("#searchInputRef").on("input", (e) => {
        const searchString = e.target.value;
        $("#vehicules3").jstree("search", searchString);
      });
    } catch (error) {
      console.error("Error loading tree script:", error);
    }

    $("#searchInputRef").on("input", (e) => {
      const searchString = e.target.value;
      $("#vehicules3").jstree("search", searchString);
    });
  }

  createNestedData(vehicles, groups) {
    let temp = [];
    vehicles.forEach((vehicule) => {
      vehicule.id = "v-" + vehicule.id;
    });
    var self = this;
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
            (vehicle.vehicle_group_id === groupId &&
              vehicle.vehicle_group_id === parentGroupId) ||
            vehicle.vehicle_group_id === parentGroupId
        )
        .map((vehicle) => {
          let imageSrc =
            "/fleet_monitoring/static/img/vehicules/" + "pv" + ".png";
          if (vehicle.last_update) {
            const timestamp1 = new Date();
            const timestamp2 = new Date(
              vehicle.last_update.toString().replace("T", " ")
            );

            // Calculate the time difference in milliseconds
            const timeDifference = Math.abs(timestamp2 - timestamp1);

            // Convert milliseconds to hours and days
            const hoursDifference = timeDifference / (1000 * 60 * 60); // 1 hour = 3600000 milliseconds
            const daysDifference = hoursDifference / 24;
            const isToday = daysDifference <= 1;

            // Define your conditions
            imageSrc = "";
            if (vehicle.category_name === "CHARIOT") {
              if (hoursDifference < 1) {
                imageSrc =
                  "/fleet_monitoring/static/img/vehicules/" + "pv" + ".png";
              } else if (hoursDifference >= 1 && daysDifference < 1) {
                imageSrc = "/fleet_monitoring/static/img/vehicules/po.png";
              } else {
                imageSrc = "/fleet_monitoring/static/img/vehicules/pr.png";
              }
            } else if (vehicle.category_name !== "CHARIOT") {
              imageSrc = "/fleet_monitoring/static/img/vehicules/acc.png";

              if (isToday) {
                if (hoursDifference <= 1) {
                  imageSrc =
                    "/fleet_monitoring/static/img/vehicules/no-acc-orange.png";
                  if (vehicle.lacc === "1") {
                    imageSrc = "/fleet_monitoring/static/img/vehicules/acc.png";
                    if (
                      parseFloat(vehicle.last_speed) !== 0.0 &&
                      vehicle.last_speed !== false &&
                      vehicle.last_speed !== ""
                    ) {
                      imageSrc =
                        "/fleet_monitoring/static/img/vehicules/acc-vitesse.png";
                    }
                  }
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

          // <img class="vehicle-icon" id="${vehicle.device}" src="/fleet_monitoring/static/img/vehicules/pied.png">
          return {
            id: vehicle.id.toString(),
            text: `<div class="vehicle-node1"><span class="vehicle-device">${vehicle.device}</span> <div class="imgblock" ><img class="vehicle-icon" src="${imageSrc}"><img class="vehicle-icon clickable" id="${vehicle.device}" src="/fleet_monitoring/static/img/vehicules/pied.png"> </div></div>`,
            type: "vehicle",
            icon: "none",
          };
        });

      return groupVehicles;
    };

    $(document).on("click", ".clickable", async (event) => {
      // const {Map,Marker} = await window.google.maps.importLibrary("maps");

      //     this.map = new google.maps.Map( document.getElementById('mapid') ,//this.mapContainerRef.el,
      //    {
      //    center: { lat: 34.0556680, lng: -6.8138070 },
      //    zoom: 8
      //    });

      if (window.screen.width < 470) {
        self.i = !self.i;
        self.vehiculeListVisiblity();
      }

      clearInterval(self.vitesseInterval);
      self.showBacs = false;
      self.vehiculesT2 = await rpc.query({
        model: "fleet.vehicle",
        method: "vehicules_with_icons2",
        args: [[], self.user],
      });
      let vehiculestemp = (self.state.vehicles = self.vehiculesT2.filter(
        (vehicule) => vehicule.device == event.target.id
      ));

      self.render();

      self.delete_old_marker2();
      delete_zones_Daki(self.zones, self.labelZone);
      self.singleSelection = true;
      self.firstCall = true;
      self.get_map_data(self.state.vehicles);
      self.VehiculeInfoPopUp(vehiculestemp);
      self.vitesseInterval = setInterval(async () => {
        try {
          let vehSpeed = await rpc.query({
            model: "fleet.vehicle",
            method: "speedVeh",
            args: [[], self.state.vehicles[0].device],
          });
          if (document.getElementById("v-vitesse")) {
            // let distance = await rpc.query({
            //   model: "fleet.vehicle",
            //   method: "kilometrage",
            //   args: [[], self.state.vehicles[0].id],
            // });

            // document.getElementById(
            //   "v-kilometrage"
            // ).innerHTML = `<span style='color:black'>Kilometrage: ${(
            //   distance[0].sum / 1000
            // ).toFixed(2)}</span>`;
            if (parseFloat(vehSpeed[0].last_speed) > 80) {
              document.getElementById("v-vitesse").style.color = "red";
              document.getElementById(
                "v-vitesse"
              ).innerHTML = `<span style='color:black'>Vitesse:</span>${
                vehSpeed[0].last_speed || ""
              }!!!!!!`;
            } else {
              document.getElementById("v-vitesse").style.color = "black";
              document.getElementById(
                "v-vitesse"
              ).innerHTML = `<span style='color:black'>Vitesse:</span>${
                vehSpeed[0].last_speed || ""
              }`;
            }
          }
        } catch (error) {}
      }, 10000);
    });

    const groupNodes = topLevelGroups.map((group) => ({
      id: group.id.toString(),
      text: '<span class="group_name">' + group.name + " </span>",
      children: [...buildTree(group.id), ...buildVehicles(group.id, group.id)],
      type: "group",
      icon: "none",
    }));

    const nestedData = groupNodes;

    return nestedData;
  }

  barClick(event) {
    const elements = getElementAtEvent(chartref.current, event);

    // if (elements.length > 0) {
    //
    // }
  }

  attachEventHandlers(element) {
    var self = this;
    if (element == document.getElementById("vehicules3")) {
      images.forEach((image) => {
        image.addEventListener("click", function () {
          self.state.vehicles = vehicules.filter(
            (vehicule) => vehicule.device == image.id
          );
          self.render();

          const vehiculeDiv = document.getElementById("vehicules");
          let checkboxes = vehiculeDiv.querySelectorAll(
            "input[type='checkbox']"
          );
          checkboxes.forEach((checkbox) => {
            checkbox.checked = false;
          });
          self.singleSelection = true;
          self.get_map_data(self.state.vehicles);
          self.VehiculeInfoPopUp();
        });
        image.addEventListener("touchend", function () {
          self.state.vehicles = vehicules.filter(
            (vehicule) => vehicule.device == image.id
          );
          self.render();

          const vehiculeDiv = document.getElementById("vehicules");
          let checkboxes = vehiculeDiv.querySelectorAll(
            "input[type='checkbox']"
          );
          checkboxes.forEach((checkbox) => {
            checkbox.checked = false;
          });
          self.singleSelection = true;
          self.get_map_data(self.state.vehicles);
          self.VehiculeInfoPopUp();
        });
      });
    }
  }

  async getVehicleTree() {
    var self = this;
    let vehicules = [];
    let groups = [];

    // Fetch vehicle and group data
    await Promise.all([
      rpc
        .query({
          model: "fleet.vehicle",
          method: "get_map_data22",
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

    // Organize groups into a hierarchical structure
    const rootGroups = groups.filter(
      (group) => !group.groupid || group.groupid === ""
    );

    // Create the top-level container for the tree
    const treeContainer = document.getElementById("vehicules");
    const treeContainer2 = document.getElementById("vehicules2");
    treeContainer.innerHTML = ""; // Clear existing content
    const vehiculeElement123 = document.createElement("div");
    vehiculeElement123.style.paddingLeft = "10px";
    vehiculeElement123.id = "original_tree";
    treeContainer.appendChild(vehiculeElement123);

    // Generate the tree structure
    rootGroups.forEach((rootGroup) => {
      const groupElement = document.createElement("ul");
      const detailsElement = document.createElement("details");
      const summaryElement = document.createElement("summary");
      summaryElement.textContent = rootGroup.name;

      const groupCheckbox = document.createElement("input");
      groupCheckbox.type = "checkbox";
      groupCheckbox.id = rootGroup.id;
      groupCheckbox.style.marginRight = "5px";
      groupCheckbox.style.verticalAlign = "middle";
      groupCheckbox.style.display = "none";
      groupCheckbox.addEventListener("change", function () {
        if (this.checked) {
          let groupsch = groups.filter(
            (group) => group.groupid[0] == rootGroup.id
          );

          groupsch.forEach((groupch) => {
            document.getElementById("check-" + groupch.id).checked = true;
          });
          let vehiculesch = [];
          groupsch.forEach((groupch) => {
            vehiculesch = vehiculesch.concat(
              vehicules.filter(
                (vehiculech) => vehiculech.vehicle_group_id[0] == groupch.id
              )
            );
          });

          let grandchgroups = [];
          groupsch.forEach((groupch) => {
            grandchgroups = groups.filter(
              (group) => group.groupid[0] == groupch.id
            );

            if (grandchgroups.length >= 0) {
              grandchgroups.forEach((groupch) => {
                document.getElementById("check-" + groupch.id).checked = true;
                vehiculesch = vehiculesch.concat(
                  vehicules.filter(
                    (vehiculech) => vehiculech.vehicle_group_id[0] == groupch.id
                  )
                );
              });
            }
          });

          vehiculesch.forEach((vehiculech) => {
            document.getElementById(vehiculech.device).checked = true;
          });

          self.state.vehicles = self.state.vehicles.concat(vehiculesch);
          self.render();
          self.get_map_data(self.state.vehicles);
        } else {
          let groupsch = groups.filter(
            (group) => group.groupid[0] === rootGroup.id
          );

          groupsch.forEach((groupch) => {
            document.getElementById("check-" + groupch.id).checked = false;
          });
          let vehiculesch = [];
          groupsch.forEach((groupch) => {
            vehiculesch = vehiculesch.concat(
              vehicules.filter(
                (vehiculech) => vehiculech.vehicle_group_id[0] == groupch.id
              )
            );
          });

          let grandchgroups = [];
          groupsch.forEach((groupch) => {
            grandchgroups = groups.filter(
              (group) => group.groupid[0] == groupch.id
            );

            if (grandchgroups.length >= 0) {
              grandchgroups.forEach((groupch) => {
                document.getElementById("check-" + groupch.id).checked = false;
                vehiculesch = vehiculesch.concat(
                  vehicules.filter(
                    (vehiculech) => vehiculech.vehicle_group_id[0] == groupch.id
                  )
                );
              });
            }
          });

          vehiculesch.forEach((vehiculech) => {
            document.getElementById(vehiculech.device).checked = false;
          });
          self.state.vehicles = vehiculesch.filter(
            (vehicule) => !self.state.vehicles.includes(vehicule)
          );
          self.render();

          if (self.state.vehicles.length <= 0) {
            self.get_map_data();
          } else {
            self.get_map_data(self.state.vehicles);
          }
        }

        // Update the rendering
        // self.render();
        // self.get_map_data(self.state.vehicles);
      });

      summaryElement.insertBefore(groupCheckbox, summaryElement.firstChild);

      // Generate and append child nodes
      const childrenHTML = self.generateGroupHTML(rootGroup, groups, vehicules);
      groupElement.innerHTML = childrenHTML;

      // Build the tree structure
      detailsElement.appendChild(summaryElement);
      detailsElement.appendChild(groupElement);
      vehiculeElement123.appendChild(detailsElement);
    });

    // Attach event handling to checkboxes and images in the generated structure
    function attachEventHandlers(element) {
      if (element == document.getElementById("vehicules")) {
        const checkboxes = element.querySelectorAll('input[type="checkbox"]');
        const images = element.querySelectorAll("img");
        checkboxes.forEach((checkbox) => {
          if (isNaN(parseInt(checkbox.id))) {
            if (checkbox.id.includes("check-")) {
              checkbox.addEventListener("change", function () {
                let c = checkbox.id.split("-");

                if (this.checked) {
                  let groupsch = groups.filter(
                    (group) => group.groupid[0] == c[1]
                  );

                  groupsch.forEach((groupch) => {
                    document.getElementById(
                      "check-" + groupch.id
                    ).checked = true;
                  });
                  let vehiculesch = [];
                  if (groupsch.length <= 0) {
                    vehiculesch = vehiculesch.concat(
                      vehicules.filter(
                        (vehiculech) => vehiculech.vehicle_group_id[0] == c[1]
                      )
                    );
                  } else {
                    groupsch.forEach((groupch) => {
                      vehiculesch = vehiculesch.concat(
                        vehicules.filter(
                          (vehiculech) =>
                            vehiculech.vehicle_group_id[0] == groupch.id ||
                            vehiculech.vehicle_group_id[0] == c[1]
                        )
                      );
                    });
                  }

                  vehiculesch.forEach((vehiculech) => {
                    document.getElementById(vehiculech.device).checked = true;
                  });
                  self.state.vehicles = self.state.vehicles.concat(vehiculesch);
                  self.render();
                  self.get_map_data(self.state.vehicles);
                } else {
                  let groupsch = groups.filter(
                    (group) => group.groupid[0] == c[1]
                  );

                  groupsch.forEach((groupch) => {
                    document.getElementById(
                      "check-" + groupch.id
                    ).checked = false;
                  });
                  let vehiculesch = [];
                  if (groupsch.length <= 0) {
                    vehiculesch = vehiculesch.concat(
                      vehicules.filter(
                        (vehiculech) => vehiculech.vehicle_group_id[0] == c[1]
                      )
                    );
                  } else {
                    groupsch.forEach((groupch) => {
                      vehiculesch = vehiculesch.concat(
                        vehicules.filter(
                          (vehiculech) =>
                            vehiculech.vehicle_group_id[0] == groupch.id ||
                            vehiculech.vehicle_group_id[0] == c[1]
                        )
                      );
                    });
                  }
                  vehiculesch.forEach((vehiculech) => {
                    document.getElementById(vehiculech.device).checked = false;
                  });
                  self.state.vehicles = vehiculesch.filter(
                    (vehicule) => !self.state.vehicles.includes(vehicule)
                  );
                  self.render();

                  if (self.state.vehicles.length <= 0) {
                    self.get_map_data();
                  } else {
                    self.get_map_data(self.state.vehicles);
                  }
                }
              });
            } else {
              checkbox.addEventListener("change", function () {
                if (this.checked) {
                  if (self.singleSelection == true) {
                    self.state.vehicles = vehicules.filter(
                      (vehicule) => vehicule.device == checkbox.id
                    );
                  } else {
                    self.state.vehicles = self.state.vehicles.concat(
                      vehicules.filter(
                        (vehicule) => vehicule.device == checkbox.id
                      )
                    );
                  }

                  self.render();

                  self.singleSelection = false;
                  self.get_map_data(self.state.vehicles);

                  // Your handling code here
                } else {
                  self.state.vehicles = self.state.vehicles.filter(
                    (vehicule) => vehicule.device != checkbox.id
                  );
                  self.render();
                  if (self.state.vehicles.length <= 0) {
                    self.get_map_data();
                  } else {
                    self.get_map_data(self.state.vehicles);
                  }
                }
              });
            }
          }
        });

        images.forEach((image) => {
          image.addEventListener("click", function () {
            self.state.vehicles = vehicules.filter(
              (vehicule) => vehicule.device == image.id
            );
            self.render();

            const vehiculeDiv = document.getElementById("vehicules");
            let checkboxes = vehiculeDiv.querySelectorAll(
              "input[type='checkbox']"
            );
            checkboxes.forEach((checkbox) => {
              checkbox.checked = false;
            });
            self.singleSelection = true;
            self.get_map_data(self.state.vehicles);
            self.VehiculeInfoPopUp();
          });
          image.addEventListener("touchend", function () {
            self.state.vehicles = vehicules.filter(
              (vehicule) => vehicule.device == image.id
            );
            self.render();

            const vehiculeDiv = document.getElementById("vehicules");
            let checkboxes = vehiculeDiv.querySelectorAll(
              "input[type='checkbox']"
            );
            checkboxes.forEach((checkbox) => {
              checkbox.checked = false;
            });
            self.singleSelection = true;
            self.get_map_data(self.state.vehicles);
            self.VehiculeInfoPopUp();
          });
        });
      } else {
        const checkboxes = element.querySelectorAll('input[type="checkbox"]');

        const images = element.querySelectorAll("img");
        checkboxes.forEach((checkbox) => {
          checkbox.addEventListener("change", function () {
            const vehicleId = checkbox.id.substring(7);
            if (this.checked) {
              // Check if the vehicle is not already in the array
              if (self.singleSelection == true) {
                if (
                  !self.state.vehicles.some(
                    (vehicule) => vehicule.device === vehicleId
                  )
                ) {
                  self.state.vehicles = vehicules.filter(
                    (vehicule) => vehicule.device == checkbox.id
                  );
                }
              } else {
                if (
                  !self.state.vehicles.some(
                    (vehicule) => vehicule.device === vehicleId
                  )
                ) {
                  self.state.vehicles.push(
                    ...vehicules.filter(
                      (vehicule) => vehicule.device === vehicleId
                    )
                  );
                }
              }

              document.getElementById(vehicleId).checked = true;
              self.render();
              self.singleSelection = false;

              self.get_map_data(self.state.vehicles);
            } else {
              self.state.vehicles = self.state.vehicles.filter(
                (vehicule) => vehicule.device != checkbox.id.substring(7)
              );
              self.render();
              document.getElementById(vehicleId).checked = false;
              if (self.state.vehicles.length <= 0) {
                self.get_map_data();
              } else {
                self.get_map_data(self.state.vehicles);
              }
            }
          });
        });

        images.forEach((image) => {
          image.addEventListener("click", function () {
            const vehicleId = image.id.substring(7);
            // Your handling code here

            self.state.vehicles = vehicules.filter(
              (vehicule) => vehicule.device == vehicleId
            );
            self.render();

            const vehiculeDiv = document.getElementById("vehicules");
            let checkboxes = vehiculeDiv.querySelectorAll(
              "input[type='checkbox']"
            );
            checkboxes.forEach((checkbox) => {
              checkbox.checked = false;
            });
            self.singleSelection = true;
            self.get_map_data(self.state.vehicles);
            self.VehiculeInfoPopUp();
          });
          image.addEventListener("touchend", function () {
            const vehicleId = image.id.substring(7);
            // Your handling code here

            self.state.vehicles = vehicules.filter(
              (vehicule) => vehicule.device == vehicleId
            );
            self.render();

            const vehiculeDiv = document.getElementById("vehicules");
            let checkboxes = vehiculeDiv.querySelectorAll(
              "input[type='checkbox']"
            );
            checkboxes.forEach((checkbox) => {
              checkbox.checked = false;
            });
            self.singleSelection = true;
            self.get_map_data(self.state.vehicles);
            self.VehiculeInfoPopUp();
          });
        });
      }
    }

    // Attach event handlers for the entire tree structure
    attachEventHandlers(treeContainer);

    // Search bar
    let divsearch = document.createElement("div");
    const searchBar = document.createElement("input");
    searchBar.type = "text";
    searchBar.type = "text";
    searchBar.placeholder = "Search vehicles...";
    divsearch.style.marginTop = "10px";
    divsearch.style.marginBottom = "10px";
    divsearch.style.marginRight = "10px";
    divsearch.style.marginLeft = "10px";
    divsearch.appendChild(searchBar);

    searchBar.addEventListener("input", (event) => {
      const searchText = event.target.value.toLowerCase();
      const filteredVehicles = vehicules.filter((vehicule) =>
        vehicule.device.toLowerCase().includes(searchText)
      );

      // Create a new container for the filtered tree
      const filteredTreeContainer = document.createElement("div");
      filteredTreeContainer.style.paddingLeft = "10px";
      if (searchText == "" || searchText == null) {
        treeContainer2.style.display = "none";
        vehiculeElement123.style.display = "block";
        treeContainer2.innerHTML = "";
      } else {
        treeContainer2.style.display = "block";
        while (treeContainer2.firstChild) {
          treeContainer2.removeChild(treeContainer2.firstChild);
        }

        vehiculeElement123.style.display = "none";
      }
      filteredVehicles.forEach((vehicle) => {
        const vehicleElement = document.createElement("div");
        vehicleElement.style.marginBottom = "5px";
        const leftContent = document.createElement("div");
        const rightContent = document.createElement("div");
        const vehicleName = document.createElement("div");
        const checkbox = document.createElement("input");
        const image1 = document.createElement("img");
        const image2 = document.createElement("img");

        // Set attributes for vehicleName
        vehicleName.style.display = "inline";
        vehicleName.textContent = vehicle.device;

        // Set checkbox attributes
        checkbox.type = "checkbox";
        checkbox.id = "search-" + vehicle.device;
        checkbox.style.display = "inline";
        checkbox.style.display = "none";
        checkbox.style.marginRight = "3px";
        checkbox.style.marginLeft = "3px";

        // Set images' attributes
        image1.src = "/fleet_monitoring/static/img/vehicules/pv.png"; // Replace with the actual image URL
        if (vehicle.last_update) {
          const timestamp1 = new Date();
          const timestamp2 = new Date(
            vehicle.last_update.toString().replace("T", " ")
          );

          // Calculate the time difference in milliseconds
          const timeDifference = Math.abs(timestamp2 - timestamp1);

          // Convert milliseconds to hours and days
          const hoursDifference = timeDifference / (1000 * 60 * 60); // 1 hour = 3600000 milliseconds
          const daysDifference = hoursDifference / 24;
          let isToday = timestamp1 === timestamp2;

          // Define your conditions
          if (vehicle.vehicle_icon_id[1] == "CHARIOT") {
            if (hoursDifference < 1) {
              image1.src =
                "/fleet_monitoring/static/img/vehicules/" + "pv" + ".png";
            } else if (hoursDifference >= 1 && daysDifference < 1) {
              image1.src = "/fleet_monitoring/static/img/vehicules/po.png";
            } else {
              image1.src = "/fleet_monitoring/static/img/vehicules/pr.png";
            }
          } else if (vehicle.vehicle_icon_id[1] != "CHARIOT") {
            image1.src = "/fleet_monitoring/static/img/vehicules/acc.png";
            if (vehicle.lacc == "1") {
              image1.src = "/fleet_monitoring/static/img/vehicules/acc.png";
              if (parseFloat(vehicle.last_speed) != 0) {
                image1.src =
                  "/fleet_monitoring/static/img/vehicules/acc-vitesse.png";
              }
            } else {
              if (isToday) {
                if (hoursDifference <= 1) {
                  image1.src =
                    "/fleet_monitoring/static/img/vehicules/no-acc-orange.png";
                } else {
                  image1.src =
                    "/fleet_monitoring/static/img/vehicules/no-acc-rouge.png";
                }
              } else {
                image1.src =
                  "/fleet_monitoring/static/img/vehicules/point-exclamation-rouge.png";
              }
            }
          }
        }
        image1.style.width = "20px"; // Adjust the width as needed
        image1.style.marginRight = "5px"; // Adjust the width as needed
        image2.src = "/fleet_monitoring/static/img/vehicules/pied.png";
        image2.id = "search-" + vehicle.device;
        image2.style.width = "20px"; // Adjust the width as needed
        image2.style.cursor = "pointer"; // Adjust the width as needed

        // Append elements to containers
        leftContent.appendChild(checkbox);
        leftContent.appendChild(vehicleName);
        rightContent.appendChild(image1);
        rightContent.appendChild(image2);

        // Apply flex styles to containers
        vehicleElement.style.display = "flex";
        vehicleElement.style.alignItems = "center";
        vehicleElement.style.width = "100%";
        vehicleElement.style.justifyContent = "space-between";
        leftContent.style.display = "flex";
        leftContent.style.alignItems = "center";
        rightContent.style.display = "flex";
        rightContent.style.alignItems = "center";

        vehicleElement.appendChild(leftContent);
        vehicleElement.appendChild(rightContent);
        filteredTreeContainer.appendChild(vehicleElement);

        attachEventHandlers(filteredTreeContainer);
      });

      // Remove previous filtered tree, if exists
      if (treeContainer2.contains(filteredTreeContainer)) {
        treeContainer2.removeChild(filteredTreeContainer);
      }

      // Append filtered tree to the main container
      treeContainer2.appendChild(filteredTreeContainer);
    });

    // Append search bar to the tree container
    const root1Element = document.getElementById("root1");
    const secondChildElement = root1Element.children[1]; // Get the second child element

    // Insert the searchBar before the second child
    root1Element.insertBefore(divsearch, secondChildElement);
  }

  generateGroupHTML(group, allGroups, vehicules) {
    var self = this;
    const childGroups = allGroups.filter(
      (childGroup) => childGroup.groupid[0] === group.id
    );
    const groupVehicles = vehicules.filter(
      (vehicule) => vehicule.vehicle_group_id[0] === group.id
    );

    const childrenHTML = childGroups.map((childGroup) => {
      const nextLevelChildren = allGroups.filter(
        (group) => group.groupid === childGroup.idd
      );
      const childGroupElement = document.createElement("ul");
      const childDetailsElement = document.createElement("details");
      const childSummaryElement = document.createElement("summary");
      childSummaryElement.textContent = childGroup.name;

      const groupCheckbox = document.createElement("input");
      groupCheckbox.type = "checkbox";
      groupCheckbox.id = "check-" + childGroup.id;
      groupCheckbox.style.marginRight = "5px";
      groupCheckbox.style.verticalAlign = "middle";
      groupCheckbox.style.display = "none";

      childSummaryElement.insertBefore(
        groupCheckbox,
        childSummaryElement.firstChild
      );

      const childChildrenHTML = this.generateGroupHTML(
        childGroup,
        allGroups,
        vehicules
      );
      childGroupElement.innerHTML = childChildrenHTML;

      childDetailsElement.appendChild(childSummaryElement);
      childDetailsElement.appendChild(childGroupElement);
      return childDetailsElement;
    });

    // Create a checkbox for the current group

    const vehiclesHTML = groupVehicles.map((vehicle) => {
      const vehicleElement = document.createElement("li");
      vehicleElement.style.marginBottom = "5px";
      const vehicleElement2 = document.createElement("div");
      const leftContent = document.createElement("div"); // Container for checkbox and name
      const rightContent = document.createElement("div"); // Container for images
      const vehicleName = document.createElement("div");
      const checkbox = document.createElement("input"); // Use <input> for checkboxes
      const image1 = document.createElement("img"); // First image
      const image2 = document.createElement("img"); // Second image

      // Set checkbox attributes
      checkbox.type = "checkbox";
      checkbox.id = vehicle.device;
      checkbox.style.display = "inline";
      checkbox.style.marginRight = "3px";
      checkbox.style.marginLeft = "3px";
      checkbox.style.display = "none";

      // Set images' attributes
      image1.src = "/fleet_monitoring/static/img/vehicules/pv.png";
      if (vehicle.last_update) {
        const timestamp1 = new Date();
        const timestamp2 = new Date(
          vehicle.last_update.toString().replace("T", " ")
        );

        // Calculate the time difference in milliseconds
        const timeDifference = Math.abs(timestamp2 - timestamp1);

        // Convert milliseconds to hours and days
        const hoursDifference = timeDifference / (1000 * 60 * 60); // 1 hour = 3600000 milliseconds
        const daysDifference = hoursDifference / 24;
        let isToday = timestamp1 === timestamp2;

        // Define your conditions
        if (vehicle.vehicle_icon_id[1] == "CHARIOT") {
          if (hoursDifference < 1) {
            image1.src =
              "/fleet_monitoring/static/img/vehicules/" + "pv" + ".png";
          } else if (hoursDifference >= 1 && daysDifference < 1) {
            image1.src = "/fleet_monitoring/static/img/vehicules/po.png";
          } else {
            image1.src = "/fleet_monitoring/static/img/vehicules/pr.png";
          }
        } else if (vehicle.vehicle_icon_id[1] != "CHARIOT") {
          image1.src = "/fleet_monitoring/static/img/vehicules/acc.png";
          if (vehicle.lacc == "1") {
            image1.src = "/fleet_monitoring/static/img/vehicules/acc.png";
            if (parseFloat(vehicle.last_speed) != 0) {
              image1.src =
                "/fleet_monitoring/static/img/vehicules/acc-vitesse.png";
            }
          } else {
            if (isToday) {
              if (hoursDifference <= 1) {
                image1.src =
                  "/fleet_monitoring/static/img/vehicules/no-acc-orange.png";
              } else {
                image1.src =
                  "/fleet_monitoring/static/img/vehicules/no-acc-rouge.png";
              }
            } else {
              image1.src =
                "/fleet_monitoring/static/img/vehicules/point-exclamation-rouge.png";
            }
          }
        }
      }

      image1.style.width = "20px"; // Adjust the width as needed
      image1.style.marginRight = "5px"; // Adjust the width as needed
      image2.src = "/fleet_monitoring/static/img/vehicules/pied.png";
      image2.id = vehicle.device;
      image2.style.width = "20px"; // Adjust the width as needed
      image2.style.cursor = "pointer"; // Adjust the width as needed

      // Set vehicle name
      vehicleName.style.display = "inline";
      vehicleName.textContent = vehicle.device;

      // Apply flex styles to the vehicle element container
      vehicleElement2.style.display = "flex";
      vehicleElement2.style.alignItems = "center"; // Center items vertically
      vehicleElement2.style.width = "100%";
      vehicleElement2.style.justifyContent = "space-between"; // Space between items

      // Apply flex styles to left and right content containers
      leftContent.style.display = "flex";
      leftContent.style.alignItems = "center"; // Center items vertically
      rightContent.style.display = "flex";
      rightContent.style.alignItems = "center"; // Center images vertically

      // Append checkbox and name to left content
      leftContent.appendChild(checkbox);
      leftContent.appendChild(vehicleName);

      // Append images to right content
      rightContent.appendChild(image1);
      rightContent.appendChild(image2);

      // Append content containers to the vehicle element container
      vehicleElement2.appendChild(leftContent);
      vehicleElement2.appendChild(rightContent);

      vehicleElement.appendChild(vehicleElement2);
      vehicleElement.style.width = "100%";
      return vehicleElement;
    });

    return [...childrenHTML, ...vehiclesHTML]
      .map((element) => element.outerHTML)
      .join("");
  }

  async loadGoogleMapsAPI() {
    let api_key;

    try {
      let result = await rpc.query({
        model: "res.config.settings",
        method: "get_map_api_key",
        args: [[]],
      });
      if (result) {
        api_key = result;
      }
    } catch (error) {
      console.error(error);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${api_key}&libraries=places&region=ma`;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async initMap() {
    $("head").append(
      `<link href="${window.location.origin}/is_temp_reel/static/css/map_view.css"" rel="stylesheet" id="newcss" />`
    );

    try {
      // await this.loadGoogleMapsAPI();

      const { Map, Marker } = await window.google.maps.importLibrary("maps");

      this.map = new Map(
        document.getElementById("mapid"), //this.mapContainerRef.el,
        {
          center: { lat: 33.964451, lng: -6.842338 },
          zoom: 12,
          gestureHandling: "greedy",
        }
      );
    } catch (error) {}
    // jQuery(function($) {
    //     $('#spl').css({ width: '100%', height: '100%' }).split({
    //         orientation: 'vertical',
    //         limit: 20,
    //         position: '20%' // Set the position to 1/3 of the container width
    //     });

    //     // Split the right part further
    //     $('.vsplitbar').eq(0).trigger('mousedown'); // Trigger mousedown event on the splitter bar
    //     $('.vsplitbar').eq(0).css('left', '80%'); // Move the splitter to 2/3 of the container width
    //     $('.vsplitbar').eq(0).trigger('mouseup'); // Trigger mouseup event to finalize the split
    // });
  }

  async get_bacs_data(device) {
    var self = this;
    this.delete_old_marker2();
    try {
      let result = await rpc.query({
        model: "fleet.vehicle",
        method: "get_bacs",
        args: [[]],
      });

      self.delete_old_marker2();
      self.render_bacs_data(result, device);
    } catch (error) {
      console.error(error);
    }
  }

  async updateBacs(id, tags) {
    try {
      let lavage = await rpc.query({
        model: "fleet.vehicle",
        method: "get_vehicles_function",
        args: [[], "lavage".toUpperCase(), id[0].device],
      });
      let collecte = await rpc.query({
        model: "fleet.vehicle",
        method: "get_vehicles_function",
        args: [[], "collecte".toUpperCase(), id[0].device],
      });
  
      for (let i = 0; i < tags.length; i++) {
        let img = {
          url: "/fleet_monitoring/static/description/icon1.png",
          scaledSize: new google.maps.Size(40, 40),
        };
        if (collecte.length > 0) {
          let updatedBac = await rpc.query({
            model: "fleet.vehicle",
            method: "update_bac",
            args: [[], tags[i].tag1],
          });

          let index = this.marker_list2.findIndex(function (marker) {
            return marker.markerId == "bac-" + updatedBac[0].bacid;
          });
          console.log("bac");
          console.log(this.marker_list2);
          console.log(updatedBac);
          console.log("index");
          console.log(index);
          let data = await rpc.query({
            model: "is_bacs.icon_view",
            method: "get_icon3",
            args: [[], updatedBac[0].bacid],
          });
          img.url = "/is_bav/static/img/bacs/" + data[i].img_green;
          this.marker_list2[index].setIcon(img);
        } else if (lavage.length > 0) {
          let updatedBac = await rpc.query({
            model: "fleet.vehicle",
            method: "update_bac",
            args: [[], "lavage", tags[i]],
          });
  
          let index = this.marker_list2.findIndex(function (marker) {
            return marker.markerId == "bac-" + updatedBac[0].bacid;
          });
  
          let data = await rpc.query({
            model: "is_bacs.icon_view",
            method: "get_icon3",
            args: [[], updatedBac[0].bacid],
          });
  
          img.url =
            "/is_bav/static/img/bacs/" +
            data[i].img_green.split("-")[0] +
            "-bleu.png";
          this.marker_list2[index].setIcon(img);
        }
      }
    } catch (error) {
      console.error(error)
    }
    
  }

  async lazyBacRenderer(id) {
    let lavage = await rpc.query({
      model: "fleet.vehicle",
      method: "get_vehicles_function",
      args: [[], "lavage", id[0].device],
    });
    let collecte = await rpc.query({
      model: "fleet.vehicle",
      method: "get_vehicles_function",
      args: [[], "collecte", id[0].device],
    });
    // let data
    // try {
    // let data = await rpc.query({
    //   model: "is_bacs.icon_view",
    //   method: "get_icon2",
    //   args: [[]],
    // });
    var data=[]
    
     
    
    if (lavage.length > 0) {
     data =await rpc.query({
          model: 'fleet.vehicle',
          method: 'rfid_update3',
          args: [[]]
      });
    }else{
      data =await rpc.query({
        model: 'fleet.vehicle',
        method: 'rfid_update2',
        args: [[]]
    });
    }
    // } catch (error) {
    //     console.error(error);
    // }
    var self = this;
    let img = {
      url: "/fleet_monitoring/static/img/vehicules/bacmetal_orange.png",
      scaledSize: new google.maps.Size(40, 40),
    };

    document.getElementById("loader2").style.display = "block";
    for (let i = 0; i < data.length; i++) {
      img.url = "/is_bav/static/img/bacs/"+data[i].final_icon;

      let contentString =
        "<div><p>Num: </p><span>" +
        data[i].numero +
        "</span><br/><p>Num: </p><span>" +
        data[i].numero +
        "</span></div>";

      if (data[i].name) {
        let icons = [];
        // try {
        //   // let response = await rpc.query({
        //   //     model: 'fleet.vehicle',
        //   //     method: 'get_icon',
        //   //     args:[[],data[i].numbac],
        //   // }).then(async function(result) {
        //   //     icons=result;
        //   // });
        //   // let response = await rpc.query({
        //   //     model: 'fleet.vehicle',
        //   //     method: 'get_icon2',
        //   //     args:[[],data[i].numbac],
        //   // }).then(async function(result) {
        //   //     icons=result;
        //   // });
        // } catch (error) {
        //   console.error(error);
        // }
        

        const button = document.createElement("button");
        button.classList.add(
          "btn",
          "btn-primary",
          `btn-open-form-bac-${data[i].bacid}`
        );
        button.style.width = "80px";
        button.style.height = "26px";
        button.textContent = "Open";
        button.id = data[i].id;
        button.dataset.vehicleId = data[i].id;

        const button2 = document.createElement("button");
        button2.style.margintop = "15px";
        button2.classList.add(
          "btn",
          "btn-primary",
          `btn-open-map-bac-${data[i].bacid}`
        );
        button2.style.width = "80px";
        button2.style.height = "26px";
        button2.textContent = "navigate";
        button2.id = data[i].id;
        button2.dataset.vehicleId = data[i].id;

        // let response = await rpc.query({
        //     model: 'fleet.vehicle',
        //     method: 'get_icon_icon',
        //     args:[[],icons.icon[1]],
        // }).then(async function(result) {
        //     ic=result;

        // });

        //    let  ic = ic1.filter(icc => data[i].typeb[1].replaceAll(' ','').includes(icc.name.replaceAll(' ','')));

        contentString = `
                            <div style="display: flex;">
                                <div style="display: flex; flex-direction: column; align-items: center; padding-right: 10px;">
                                    <img class="img img-fluid" alt="Fichier binaire"
                                    src="/is_bav/static/img/bacs/${data[i].img_green}"
                                        name="image_128"
                                        style="width: 50px; height: 50px; object-fit: cover; margin-bottom: 5px;">
                                        ${button.outerHTML} <br>${button2.outerHTML}
            
                                </div>
                                <div style="flex: 1;">`;

        // if(data[i].vehicle_icon_id[1]=="CHARIOT"){
        contentString += `<div>Num: <span>${data[i].numero}</span><br>Num park: <span>${data[i].numero}</span><br>
                                Type bac: <span>${data[i].name}</span><br>
                                Frequence lavage: <span>${data[i].freqlavage}</span><br>
                                Frequence collect: <span>${data[i].freqcollecte}</span><br>
                                Dernier vehicule: <span>${data[i].device}</span><br>
                                
                                
                                
                                </div>`;
        // }else if (data[i].vehicle_icon_id[1] === "CAMION") {
        //     contentString += `<p>Vehicule: ${data[i].device}</p><span> Type: ${data[i].vehicle_icon_id[1]}</span><br><span> Matricule: ${data[i].license_plate || ''}</span><br><span> Marque: ${data[i].model_id[1]}</span><br><span> Kilometrage: ${data[i].odometer}</span><br><span> Nombre heures: ${"vehicule.nbrheure"}</span><br><span> Fonction: ${data[i].vehicle_icon_id[1]}</span><br><hr><span> Date: ${data[i].last_update || ''}</span><br></span><hr><span> Batterie: ${data[i].last_soc!=null?data[i].last_soc:0}</span>`;
        // } else if (data[i].vehicle_icon_id[1] === "VOITURE") {
        //     contentString += `<p>Vehicule: ${data[i].vehicle_icon_id[1]}</p><span> Type: ${data[i].vehicle_icon_id[1]}</span><br><span> Matricule: ${data[i].license_plate || ''}</span><br><span> Marque: ${data[i].model_id[1]}</span><br><span> Fonction: ${data[i].vehicle_icon_id[1]}</span><hr></span><hr><span> Date: ${data[i].last_update || ''}</span><br></span><hr><span> Batterie: ${data[i].last_soc!=null?data[i].last_soc:0}</span>`;
        // }else if (data[i].vehicle_icon_id[1].includes( "MOTO")) {
        //     contentString += `<p>Vehicule: ${data[i].vehicle_icon_id[1]}</p><span> Type: ${data[i].vehicle_icon_id[1]}</span><br><span> Matricule: ${data[i].license_plate || ''}</span><br><span> Marque: ${data[i].model_id[1]}</span><br><span> Fonction: ${data[i].vehicle_icon_id[1]}</span><hr></span><hr><span> Date: ${data[i].last_update || ''}</span><br></span><hr><span> Batterie: ${data[i].last_soc!=null?data[i].last_soc:0}</span>`;
        // }
        //  else{
        //    popupContent = '<p>Vehicule: ' + vehicule.name + '</p><span> Type: ' + vehicule.typecamion + '</span><br><span> Matricule: ' + (vehicule.immatricule !== null ? vehicule.immatricule : '') + '</span><br><span> Marque: ' + vehicule.marque + '</span><br><span> Date de mise en service: ' + vehicule.datems + '</span><br><span> Fonction: ' + vehicule.fonction + '</span><hr><span> Date: ' + vehicule.lastupdate + '</span><br></span><hr><span> Batterie: ' + vehicule.battterie + '</span>';

        //  }

        contentString += `</div></div>`;

        if (icons) {
          if (collecte.length > 0) {
            // let dc = await rpc.query({
            //   model: "fleet.vehicle",
            //   method: "rfid_update",
            //   args: [[], "Collecte".toUpperCase(), data[i].id],
            // });
            img.url = "/is_bav/static/img/bacs/"+data[i].final_icon;

            // if (dc.length > 0) {
            //   if (dc[0].devicetime) {
            //     const timestamp1 = new Date();
            //     const timestamp2 = new Date(
            //       dc[0].devicetime.toString().replace("T", " ")
            //     );

            //     // Calculate the time difference in milliseconds
            //     const timeDifference = Math.abs(timestamp2 - timestamp1);

            //     // Convert milliseconds to hours and days
            //     const hoursDifference = timeDifference / (1000 * 60 * 60); // 1 hour = 3600000 milliseconds
            //     const daysDifference = hoursDifference / 24;

            //     // Define your conditions

            //     if (hoursDifference < 24) {
            //       img.url = "/is_bav/static/img/bacs/" + data[i].img_green;
            //     } else {
            //       img.url = "/is_bav/static/img/bacs/" + data[i].img_red;
            //     }
            //   }
            // } else {
            //   img.url = "/is_bav/static/img/bacs/" + data[i].img_red;
            // }
          } else if (lavage.length > 0) {
            // let dc = await rpc.query({
            //   model: "fleet.vehicle",
            //   method: "rfid_update",
            //   args: [[], "Lavage".toUpperCase(), data[i].id],
            // });
            img.url =
              "/is_bav/static/img/bacs/"+data[i].final_icon;
            // img.url =
            //   "/is_bav/static/img/bacs/" +
            //   data[i].img_green.split("-")[0] +
            //   "-gris.png";
            // if (dc.length > 0) {
            //   if (dc[0].devicetime) {
            //     const timestamp1 = new Date();
            //     const timestamp2 = new Date(
            //       dc[0].devicetime.toString().replace("T", " ")
            //     );

            //     // Calculate the time difference in milliseconds
            //     const timeDifference = Math.abs(timestamp2 - timestamp1);

            //     // Convert milliseconds to hours and days
            //     const hoursDifference = timeDifference / (1000 * 60 * 60); // 1 hour = 3600000 milliseconds
            //     const daysDifference = hoursDifference / 24;

            //     // Define your conditions

            //     if (hoursDifference < 24) {
            //       img.url = "/is_bav/static/img/bacs/" + data[i].img_bleu;
            //     } else {
            //       img.url = "/is_bav/static/img/bacs/" + data[i].img_gris;
            //       // .split('-')[0]
            //       // +'-gris.png'
            //     }
            //   }
            // } else {
            //   img.url = "/is_bav/static/img/bacs/" + data[i].img_gris;
            // }
          }
        }
      }
      let infowindow = new google.maps.InfoWindow({
        content: contentString,
      });

      let marker2 = new google.maps.Marker({
        position: { lat: data[i].latitude, lng: data[i].longitude },
        icon: img,
        map: null,
        markerId: "bac-" + data[i].bacid,
        draggable: true,
      });

      // Use a closure to create a new scope for each marker
      marker2.addListener(
        "click",
        (function (marker2, infowindow) {
          return function () {
            infowindow.open(self.map, marker2);
          };
        })(marker2, infowindow)
      );

      this.marker_list2.push(marker2);
    }
    document.getElementById("loader2").style.display = "none";
  }

  render_bacs_data2() {
    this.marker_list2.forEach((marker) => {
      marker.setMap(this.map);
    });
    this.markerCluster = new MarkerClusterer(this.map, this.marker_list2, {
      minimumClusterSize: 5, // Set your desired minimum cluster size
      imagePath:
        "https://cdn.jsdelivr.net/gh/googlemaps/v3-utility-library@07f15d84/markerclustererplus/images/m",
    });
  }

  async render_bacs_data(data, device) {
    this.showBacs = true;
    this.buttonIds2 = data;
    let vehicule = await rpc.query({
      model: "fleet.vehicle",
      method: "get_map_data22",
      args: [[]],
    });
    vehicule = vehicule.filter((veh) => veh.device == device);

    var self = this;
    const container = document.getElementById("mapid");

    data = data.filter(
      (bac) =>
        bac.latitude >= vehicule[0].latitude - Math.abs(6.799556 - 6.799304) &&
        bac.latitude <= vehicule[0].latitude + Math.abs(6.799556 - 6.799304) &&
        bac.longitude >=
          vehicule[0].longitude - Math.abs(6.799556 - 6.799304) &&
        bac.longitude <= vehicule[0].longitude + Math.abs(6.799556 - 6.799304)
    );

    this.buttonIds2.forEach((buttonid) => {
      container.addEventListener("click", async (event) => {
        if (event.target.matches(`.btn-open-map-bac-${buttonid.id}`)) {
          let results = await rpc.query({
            model: "fleet.vehicle",
            method: "get_bacs",
            args: [[]],
          });
          results = results.filter((result) => result.id == buttonid.id);
          self.openGoogleMaps(results[0].latitude, results[0].longitude);
        } else if (event.target.matches(`.btn-open-form-bac-${buttonid.id}`)) {
          // Find the associated vehicle ID from a data attribute
          const clickedVehicleId = event.target.dataset.vehicleId;

          // Call the openVehicleForm function with the vehicle ID
          // this.openVehicleForm(clickedVehicleId);

          self.openBacForm(buttonid.id);
          //  document.getElementById('popup').style.display="block"
        }
      });
    });

    var self = this;
    let img = {
      url: "/fleet_monitoring/static/img/vehicules/bacmetal_orange.png",
      scaledSize: new google.maps.Size(40, 40),
    };

    // document.getElementById("loader").style.display="block"

    for (let i = 0; i < data.length; i++) {
      img.url = "/fleet_monitoring/static/img/vehicules/bacmetal_orange.png";

      let contentString =
        "<div><p>Num: </p><span>" +
        data[i].numbac +
        "</span><br/><p>Num: </p><span>" +
        data[i].numpark +
        "</span></div>";

      if (data[i].name) {
        let icons = [];
        try {
          // let response = await rpc.query({
          //     model: 'fleet.vehicle',
          //     method: 'get_icon',
          //     args:[[],data[i].numbac],
          // }).then(async function(result) {
          //     icons=result;

          // });

          let response = await rpc
            .query({
              model: "fleet.vehicle",
              method: "get_icon2",
              args: [[], data[i].numbac],
            })
            .then(async function (result) {
              icons = result;
            });
        } catch (error) {
          console.error(error);
        }
        const container = document.getElementById("mapid");

        const buttonex = document.getElementById(`btn-open-form-${data[i].id}`);

        const button = document.createElement("button");
        button.classList.add(
          "btn",
          "btn-primary",
          `btn-open-form-bac-${data[i].id}`
        );
        button.style.width = "80px";
        button.style.height = "26px";
        button.textContent = "Open";
        button.id = data[i].id;
        button.dataset.vehicleId = data[i].id;

        const button2 = document.createElement("button");
        button2.style.margintop = "15px";
        button2.classList.add(
          "btn",
          "btn-primary",
          `btn-open-map-bac-${data[i].id}`
        );
        button2.style.width = "80px";
        button2.style.height = "26px";
        button2.textContent = "navigate";
        button2.id = data[i].id;
        button2.dataset.vehicleId = data[i].id;

        // let response = await rpc.query({
        //     model: 'fleet.vehicle',
        //     method: 'get_icon_icon',
        //     args:[[],icons.icon[1]],
        // }).then(async function(result) {
        //     ic=result;

        // });

        let ic = ic1.filter((icc) =>
          data[i].name[1]
            .replaceAll(" ", "")
            .includes(icc.name.replaceAll(" ", ""))
        );

        contentString = `
                    <div style="display: flex;">
                        <div style="display: flex; flex-direction: column; align-items: center; padding-right: 10px;">
                            <img class="img img-fluid" alt="Fichier binaire"
                            src="/fleet_monitoring/static/img/vehicules/bacs/${ic[0].img_green}"
                                name="image_128"
                                style="width: 50px; height: 50px; object-fit: cover; margin-bottom: 5px;">
                                ${button.outerHTML} <br>${button2.outerHTML}
    
                        </div>
                        <div style="flex: 1;">`;

        // if(data[i].vehicle_icon_id[1]=="CHARIOT"){
        contentString += `<div><p>Num: </p><span>${data[i].numbac}</span><br><p>Num park: </p><span>${data[i].numpark}</span></div>`;
        // }else if (data[i].vehicle_icon_id[1] === "CAMION") {
        //     contentString += `<p>Vehicule: ${data[i].device}</p><span> Type: ${data[i].vehicle_icon_id[1]}</span><br><span> Matricule: ${data[i].license_plate || ''}</span><br><span> Marque: ${data[i].model_id[1]}</span><br><span> Kilometrage: ${data[i].odometer}</span><br><span> Nombre heures: ${"vehicule.nbrheure"}</span><br><span> Fonction: ${data[i].vehicle_icon_id[1]}</span><br><hr><span> Date: ${data[i].last_update || ''}</span><br></span><hr><span> Batterie: ${data[i].last_soc!=null?data[i].last_soc:0}</span>`;
        // } else if (data[i].vehicle_icon_id[1] === "VOITURE") {
        //     contentString += `<p>Vehicule: ${data[i].vehicle_icon_id[1]}</p><span> Type: ${data[i].vehicle_icon_id[1]}</span><br><span> Matricule: ${data[i].license_plate || ''}</span><br><span> Marque: ${data[i].model_id[1]}</span><br><span> Fonction: ${data[i].vehicle_icon_id[1]}</span><hr></span><hr><span> Date: ${data[i].last_update || ''}</span><br></span><hr><span> Batterie: ${data[i].last_soc!=null?data[i].last_soc:0}</span>`;
        // }else if (data[i].vehicle_icon_id[1].includes( "MOTO")) {
        //     contentString += `<p>Vehicule: ${data[i].vehicle_icon_id[1]}</p><span> Type: ${data[i].vehicle_icon_id[1]}</span><br><span> Matricule: ${data[i].license_plate || ''}</span><br><span> Marque: ${data[i].model_id[1]}</span><br><span> Fonction: ${data[i].vehicle_icon_id[1]}</span><hr></span><hr><span> Date: ${data[i].last_update || ''}</span><br></span><hr><span> Batterie: ${data[i].last_soc!=null?data[i].last_soc:0}</span>`;
        // }
        //  else{
        //    popupContent = '<p>Vehicule: ' + vehicule.name + '</p><span> Type: ' + vehicule.typecamion + '</span><br><span> Matricule: ' + (vehicule.immatricule !== null ? vehicule.immatricule : '') + '</span><br><span> Marque: ' + vehicule.marque + '</span><br><span> Date de mise en service: ' + vehicule.datems + '</span><br><span> Fonction: ' + vehicule.fonction + '</span><hr><span> Date: ' + vehicule.lastupdate + '</span><br></span><hr><span> Batterie: ' + vehicule.battterie + '</span>';

        //  }

        contentString += `</div></div>`;

        if (icons) {
          img.url =
            "/fleet_monitoring/static/img/vehicules/bacs/" + ic[0].img_green;
          //         if(data[i].last_update){
          //             const timestamp1 = new Date();
          //             const timestamp2 = data[i].last_update;

          //             // Calculate the time difference in milliseconds
          //             const timeDifference = Math.abs(timestamp2 - timestamp1);

          //             // Convert milliseconds to hours and days
          //             const hoursDifference = timeDifference / (1000 * 60 * 60); // 1 hour = 3600000 milliseconds
          //             const daysDifference = hoursDifference / 24;

          //             // Define your conditions

          //     if (hoursDifference < 1) {
          //         img.url="/fleet_monitoring/static/img/vehicules/"+icon.iconV;

          //     } else if (hoursDifference >= 1 && daysDifference < 1) {
          //         img.url="/fleet_monitoring/static/img/vehicules/"+icon.iconO;

          //     } else {
          //         img.url="/fleet_monitoring/static/img/vehicules/"+icon.iconR;

          //     }
          // }

          //         return
        }
      }
      let infowindow = new google.maps.InfoWindow({
        content: contentString,
      });

      let marker2 = new google.maps.Marker({
        position: { lat: data[i].latitude, lng: data[i].longitude },
        icon: img,
        map: this.map,
        draggable: false,
      });

      // Use a closure to create a new scope for each marker
      marker2.addListener(
        "click",
        (function (marker2, infowindow) {
          return function () {
            infowindow.open(self.map, marker2);
          };
        })(marker2, infowindow)
      );

      this.marker_list2.push(marker2);
    }
    document.getElementById("loader").style.display = "none";
  }

  delete_old_marker2() {
    if (this.marker_list2 != [] || this.marker_list2 != null)
      for (let i = 0; i < this.marker_list2.length; i++) {
        this.marker_list2[i].setMap(null);
      }

    if (this.markerCluster) {
      // Clear all markers and clusters
      this.markerCluster.clearMarkers();

      // Set the markerCluster instance to null
      this.markerCluster = null;
    }
    this.marker_list2 = [];
  }

  handlechangestyle() {
    const currentURL = window.location.href.split("#")[1];
    const urlParams = new URLSearchParams(currentURL);
    const actionValue = urlParams.get("action");
    // if(actionValue != 320 || actionValue != 315  || actionValue != 313){
    //     $(`link[href="${window.location.origin}/is_temp_reel/static/css/map_view.css"]`).remove();
    // }

    if (actionValue != 229 && actionValue != "action_is_temp_reel1") {
      $(
        `link[href="${window.location.origin}/is_temp_reel/static/css/map_view.css"]`
      ).remove();
    }

    // window.addEventListener("beforeunload", function (e) {
    //     e.preventDefault();
    //     e.returnValue = "";
    //     const confirmationMessage = "Are you sure you want to leave this page?";
    //     e.returnValue = confirmationMessage;
    // });
  }
}

FleetMapComponent1.template = "is_temp_reel.FleetMap";
registry.category("actions").add("action_is_temp_reel1", FleetMapComponent1);