/** @odoo-module **/

import { registry } from "@web/core/registry";
const rpc = require("web.rpc");
import { useService } from "@web/core/utils/hooks";

const { Component, onWillStart, onMounted, useState } = owl;

export class DisplayStateBtn extends Component {
  setup() {
    // this.state = useState({
    //   groups: [],
    //   vehicules: [],
    //   circuits: [],
    //   etat_conteneur: "collecte",
    //   type_afichage: "bac",
    // });
    this.map= null;
    onMounted(async () => {
    //   await this.getAllBac();
    });
    onWillStart(async () => {
    //   await this.getAllBac();
    });
  }
  async getAllBac(ec, map) {
    this.map=map;
    console.log("get all bacs");
    document
      .getElementById("display_stat")
      .addEventListener("click", async (e) => {
        $("#left_1").toggleClass("slide-left"); //fadeIn(200);
        $("#left_2").toggleClass("slide-left"); //.fadeOut(200);
        $("#left_1").toggleClass("slide-hide"); //fadeIn(200);
        $("#left_2").toggleClass("slide-hide"); //.fadeOut(200);

        var date1 = document.getElementById("date_du").value;
        var time1 = document.getElementById("time_du").value;
        var date2 = document.getElementById("date_au").value;
        var time2 = document.getElementById("time_au").value;
        // alert(
        //   "you want " +
        //     this.state.etat_conteneur +
        //     " des " +
        //     this.state.type_afichage +
        //     " from " +
        //     date1 +
        //     " " +
        //     time1 +
        //     " to " +
        //     date2 +
        //     "  " +
        //     time2
        // );
        let t = "";
        let rfid = [];
        try {
          // await Promise.all([
          //   (rfid = await rpc.query({
          //     model: "is_rfid.vrfid",
          //     method: "getRfid",
          //     args: [[],date1 +' ' + time1, date2 +' ' + time2, this.state.etat_conteneur ],
          //   }))
          // ]);
        } catch (error) {
          console.log(error);
        }
        console.log("RFID : ", rfid);
        let bacs = [];
        // if (this.state.type_afichage === "tous") t = "";
        // else t = this.state.type_afichage;

        try {
          await Promise.all([
            (bacs = await rpc.query({
              model: "is_bav.bacs",
              method: "getall",
              args: [[], ec],
            })),
          ]);
        } catch (error) {
          console.log(error);
        }
        
        console.log('bacs : ',bacs);
        let nbr_on = 0,
          nbr_off = 0;
        let markersBacs = [];
        
        for (let baci = 0; baci < bacs.length; baci++) {
          const element = bacs[baci];
          let state = "gris";
          if (this.isOk(element, rfid)) {
            nbr_on++;
            state = element.img_green;
          } else {
            nbr_off++;
            state = element.img_red;
          }
          const marker = new google.maps.Marker({
            position: {
              lat: parseFloat(element.latitude),
              lng: parseFloat(element.longitude),
            },
            map: this.map,
            icon: "is_rfid/static/img/bacs/" + state + "",
            draggable: true,
          });
          const infoWindow = new google.maps.InfoWindow({
            content:
              "<table>" +
              "<tr>" +
              "<td>N° park</td><td>" +
              element.numpark +
              "</td></tr><tr>" +
              "<td>Véhicule</td><td>" +
              element.device +
              "</td></tr>" +
              "<td>Fréquence collecte</td><td>" +
              element.freq_c +
              "</td><tr>" +
              "<td>Fréquence Lavage</td><td>" +
              element.freq_l +
              "</td></tr><tr>" +
              "<td>Type</td><td>" +
              element.name +
              "</td></tr>" +
              +"</tr>" +
              "</table>",
          });
          marker.addListener("click", () => {
            infoWindow.open(this.map, marker);
          });

          markersBacs.push(marker);
        }
        console.error("nombre on : ", nbr_on, " nombre off : ", nbr_off);
        const data_chart = {
          labels: ["on", "off"],
          datasets: [
            {
              label: "",
              data: [nbr_on, nbr_off],
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

        //error.log(data);
        // console.error(data);
      });
  }
  isOk(element, rfid){
    return true;
  }
}
DisplayStateBtn.template = "rfid.display_state_btn";
