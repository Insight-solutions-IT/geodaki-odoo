/** @odoo-module **/

import { registry } from "@web/core/registry";
const {
  Component,
  useState,
  onWillStart,
  useRef,
  useListener,
  onMounted,
  onWillUnmount,
} = owl;
import { useService } from "@web/core/utils/hooks";
const rpc = require("web.rpc");

export class RecordHistorique extends Component {

  
  setup() {


    onWillUnmount(()=>{     
      $('body').append(` <div  id="myloader" style="display: flex;position: absolute;overflow: hidden auto;z-index: 13;width: 100%;height: 100%;left: 0vw;min-height: 200px;bottom: 0px;justify-content: center;text-align: left;"> <div  id="loader" style=" position:absolute;top:0px;height:100%;width:100%;display: block;background-color: rgba(64, 64, 64, 0.5);pointer-events: none;z-index:200">
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
      }, 100);
  })

    onWillStart(async () => {
      $("head").append(
        `<link href="${window.location.origin}/is_diagnostic/static/public/Diagnostic.css" rel="stylesheet" id="newcss" />`
      );
      $("head").append(
        `<link href="${window.location.origin}/is_acces_video/static/stream.css" rel="stylesheet" id="newcss" />`
      );
      $("head").append(
        `<link href="https://cdn.jsdelivr.net/npm/video.js@8.10.0/dist/video-js.min.css" rel="stylesheet" id="newcss" />`
      );

      console.log(555555555555);
    });
    this.state = {
      displayTree: true,
    };
    this.jstreeRef = useRef("jstree");
    this.loadScriptMounted();

    this.state.displayTree = true;

    this.isStream = false;

    this.device;
    this.icon;
    onMounted(() => {
      this.socket = io.connect("http://newrabat.geodaki.com:5002");
      this.socket.on("connect", () => {
        console.log("Connected to Socket.IO server");
      });

      this.socket.on("activeClients", value => {
        console.log("active", value);
        document.getElementById("activeUser").innerText = value;
      });
      this.socket.on("disconnect", value => {
        console.log("disconnect", value);
      });

      let TreeDiag = document.getElementById("TreeDiag");
      TreeDiag.style.display = "block";
      document.getElementById("DisplayTree").style.marginLeft = "350px";
      const DisplayTree = document.getElementById("DisplayTree");

      DisplayTree.addEventListener("mousedown", this.handlerTree.bind(this));
      DisplayTree.addEventListener("touchstart", this.handlerTree.bind(this));
      
    });

    this.LoadTree();
  }








  DisplayTree() {
    const treeDiagElement = document.getElementById("TreeDiag");
    const displayTreeButton = document.getElementById("DisplayTree");

    if (
      treeDiagElement.style.display === "block" ||
      treeDiagElement.style.display === ""
    ) {
      treeDiagElement.style.display = "none";
      displayTreeButton.style.marginLeft = "0";
    } else {
      treeDiagElement.style.display = "block";
      displayTreeButton.style.marginLeft = "350px";
    }
  }
  handlerTree(mouseDownEvent) {
    const startButtonTree = document.getElementById("DisplayTree").offsetTop;

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

  async loadScriptMounted() {
    try {
      await this.loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/jstree/3.2.1/jstree.min.js",
        "jstree"
      );

      await this.loadScript(
        `https://cdn.jsdelivr.net/npm/video.js@8.10.0/dist/video.min.js`,
        "video"
      );
      await this.loadScript(
        `${window.location.origin}/is_acces_video/static/src/components/StreamVideo/socket.js`,
        "socket"
      );
    } catch (error) {
      console.log(error);
    }
  }

  async loadScript(src, id) {
    return new Promise((resolve, reject) => {
      if (document.getElementById(id)) {
        // If the script with the given ID already exists, resolve immediately
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.id = id;

      script.onload = () => {
        resolve();
        // After loading, remove the script element
        document.body.removeChild(script);
      };

      script.onerror = error => {
        reject(error);
      };

      document.body.appendChild(script);
    });
  }
  async LoadTree() {
    document.addEventListener("keydown", function (event) {
      if (event.altKey && event.key === "p") {
        const treeDiagElement = document.getElementById("TreeDiag");
        const displayTreeButton = document.getElementById("DisplayTree");

        if (
          treeDiagElement.style.display === "block" ||
          treeDiagElement.style.display === ""
        ) {
          treeDiagElement.style.display = "none";
          displayTreeButton.style.marginLeft = "0";
        } else {
          treeDiagElement.style.display = "block";
          displayTreeButton.style.marginLeft = "350px";
          const searchInput = document.getElementById("searchInputRef");
          searchInput.focus();
        }
        console.log("Alt + P DisplayTree");
      }
    });
    try {
      localStorage.removeItem("jstree");

      await this.loadScriptMounted();
      var self = this;
      var vehicules = [];
      var groups = [];

      // Fetch vehicle and group data
      await Promise.all([
        rpc
          .query({
            model: "fleet.vehicle",
            method: "get_map_data2",
            args: [[]],
          })
          .then(result => {
            vehicules = result;
          }),
        rpc
          .query({
            model: "fleet.vehicle.group",
            method: "get_map_data2",
            args: [[]],
          })
          .then(result => {
            groups = result;
          }),
      ]);
      //  console.log("vehicules" ,vehicules)
      // console.log("groups" ,groups)

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
            // 'checkbox',
          ],
        })
        .on("check_node.jstree uncheck_node.jstree", (e, data) => {
          const selectedText = data.selected
            .map(nodeId => {
              const node = data.instance.get_node(nodeId);
              const parser = new DOMParser();
              const htmlDoc = parser.parseFromString(node.text, "text/html");
              const name = htmlDoc.querySelector(".vehicle-device").textContent;

              return name;
            })
            .join(", ");

          console.log("Selected: " + selectedText);
        });

      $("#searchInputRef").on("input", e => {
        const searchString = e.target.value;
        $("#jstree").jstree("search", searchString);
      });
    } catch (error) {
      console.error("Error loading tree script:", error);
    }

    $("#searchInputRef").on("input", e => {
      const searchString = e.target.value;
      console.log(searchString);
      $("#jstree").jstree("search", searchString);
    });





  }

  createNestedData(vehicles, groups) {
    vehicles.forEach(vehicule => {
      vehicule.id = "v-" + vehicule.id;
    });

    try {
      const topLevelGroups = groups.filter(group => !group.groupid);

      const buildTree = groupId => {
        const children = groups
          .filter(group => group.groupid[0] === groupId)
          .map(group => ({
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
            vehicle =>
              (vehicle.vehicle_group_id[0] === groupId &&
                vehicle.vehicle_group_id[0] === parentGroupId) ||
              vehicle.vehicle_group_id[0] === parentGroupId
          )
          .map(vehicle => {
            return {
              id: vehicle.id.toString(),
              text: `
                            <div class="vehicle-node1">
                                <span class="vehicle-device">${vehicle.device}</span>
                                <div class="imgblock">
                                    <img class="vehicle-icon clickable"  
                                    data-name=${vehicle.device}   
                                    data-icon=${vehicle.vehicle_icon_id} 
                                    data-id="${vehicle.id}" 
                                    src="${window.location.origin}/is_acces_video/static/img/cam_icon.png">
                                  
                                </div>
                            </div>`,
              type: "vehicle",
              icon: "none",
            };
          });

        return groupVehicles;
      };

      let treeContanair = document.getElementById("treeContanair");
      let dialog = document.getElementsByClassName(
        "o-main-components-container"
      );

      treeContanair.style.zIndex = 1;
      if (dialog) {
        for (let i = 0; i < dialog.length; i++) {
          dialog[i].setAttribute("style", "z-index : 0");
        }
      }

      $(document).on("click", ".clickable", async event => {
        document.getElementById("Tree_container").style.display = 'none'
        document.getElementById("containerHistory").style.display = 'block'
        document.getElementById("searchHis_div").style.display = 'block'
        document.getElementById('JustForPlace').style.display = 'block';

        var existingVideo = document.getElementById("recviddiv");
        if (existingVideo) {
          existingVideo.parentNode.removeChild(existingVideo);
        }

  
        let StreamContainer = document.getElementById("StreamContainer");

         
       
        const streambtn = document.getElementById("toggleStream");
        const deviceNameP = document.getElementById("deviceName");
        const device_icon = document.getElementById("device_icon");

        StreamContainer.style.setProperty("height", `96.2vh`, "important");

        //document.getElementById("TreeDiag").style.display = "none";
        //document.getElementById("DisplayTree").style.marginLeft = "0";

        const deviceName = $(event.currentTarget).data("name");
        const icon = $(event.currentTarget).data("icon");
        const id = $(event.currentTarget).data("id").replace("v-", "");

        console.log(icon);
        this.device = deviceName;
        deviceNameP.innerText = deviceName;




        const data = {
          device: deviceName,
        };
        await this.socket.emit("history", data);

        let sockett = this.socket
        try {
          this.socket.on("history", History => {
              console.log("History Value:", History);
              const container = document.getElementById("containerHistory");
              const fileList = document.createElement("ul");
              fileList.id = "myul";
              fileList.style.listStyleType = 'disclosure-closed';
      
              const searchInputRef = document.getElementById("searchHistorique");
      
              if (History && Array.isArray(History.file)) {
                  const files = History.file;
      
                  function filterListItems(searchTerm) {
                      fileList.innerHTML = "";
                      const filteredFiles = files.filter(filename => {
                          const displayName = filename.split("*")[1];
                          return displayName.toLowerCase().includes(searchTerm.toLowerCase());
                      });
      
                      filteredFiles.forEach(filename => {
                          let displayname = filename.split("*")[1];
                          const listItem = document.createElement("li");
                          listItem.className = 'historique_li';
                          listItem.textContent = displayname;
                          fileList.appendChild(listItem);
      
                          listItem.addEventListener("click", async() => {
                            document.getElementById('JustForPlace').style.display = 'block';
                            sockett.emit("GetVideo", filename);
                              console.log(filename);
                              var existingVideo = document.getElementById("recviddiv");
                              if (existingVideo) {
                                  existingVideo.parentNode.removeChild(existingVideo);
                              }
      
                              StreamContainer.style.display =  'none'
                              StreamContainer.style.display =  'flex'
                              setTimeout(async() => {
                                  document.getElementById('JustForPlace').style.display = 'none';
                                  var existingVideo = document.getElementById("recviddiv");
                                  if (existingVideo) {
                                    existingVideo.parentNode.removeChild(existingVideo);
                                  }
                                  var videoElement = document.createElement("video");
                                  videoElement.setAttribute("id", "recviddiv");
                                  videoElement.setAttribute("class", "video-js");
                                  videoElement.setAttribute("controls", "");
                                  videoElement.setAttribute("preload", "auto");
                                  videoElement.setAttribute("style", "width: 100%; height: 605px;");
                                  var sourceElement = document.createElement("source");
                                  sourceElement.setAttribute("id", "source-rec");
                                  sourceElement.setAttribute(
                                    "src",
                                    `http://newrabat.geodaki.com:5002/videos/${filename}`
                                  );
                                  sourceElement.setAttribute("type", "video/mp4");
                                  videoElement.appendChild(sourceElement);
                                  var videoContainer = document.getElementById("video-container");
                                  videoContainer.appendChild(videoElement);
                                  videoElement.load();
                                 // videoElement.play();
                              }, 10000);
                          });
                      });
                  }
      
          
                  $("#searchHistorique").on("input", e => {
                    const searchTerm = e.target.value.trim();
                    console.log(searchTerm)
                    filterListItems(searchTerm);

                  });
              
      
                  container.innerHTML = ""; // Clear container before appending
                  container.appendChild(fileList);
      
                  filterListItems(""); // Initially, display all items
              }
          });
      } catch(err) {
          console.error(err);
      }
      

  

        console.log(deviceName);

        //StreamContainer.style.display = "block";



         await this.getIcons(id)
         device_icon.setAttribute('src' , this.icon)
         console.log(deviceName  , this.icon);
      });

 

      const groupNodes = topLevelGroups.map(group => ({
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

      return nestedData;
    } catch (error) {
      console.log(error);
    }
  }



  handleReturn(){
    document.getElementById("Tree_container").style.display = 'block'
    document.getElementById("containerHistory").style.display = 'none'
    document.getElementById("searchHis_div").style.display = 'none'

    var existingVideo = document.getElementById("recviddiv");
    if (existingVideo) {
      existingVideo.parentNode.removeChild(existingVideo);
    }
  }

   createAndPlayVideo(filename) {
    var existingVideo = document.getElementById("recviddiv");
    if (existingVideo) {
      existingVideo.parentNode.removeChild(existingVideo);
    }
    var videoElement = document.createElement("video");
    videoElement.setAttribute("id", "recviddiv");
    videoElement.setAttribute("class", "video-js");
    videoElement.setAttribute("controls", "");
    videoElement.setAttribute("preload", "auto");
    videoElement.setAttribute("style", "width: 100%; height: 605px;");
    var sourceElement = document.createElement("source");
    sourceElement.setAttribute("id", "source-rec");
    sourceElement.setAttribute(
      "src",
      filename
    );
    sourceElement.setAttribute("type", "video/mp4");
    videoElement.appendChild(sourceElement);
    var videoContainer = document.getElementById("video-container");
    videoContainer.appendChild(videoElement);
    videoElement.load();
    //videoElement.play();
  }


  LoadRecord() {
    try{}
    catch(err) {}
    let video_record = document.querySelector("#recviddiv");
    let sourceElement = document.querySelector("#recviddiv source");
    if (sourceElement) {
        let sourceSrc = sourceElement.getAttribute("src");
        console.log(sourceSrc);
     
       this.createAndPlayVideo(sourceSrc)

    } else {
        console.error("Source element not found.");
    }
  }


  async getIcons(id) {
    var myHeaders = new Headers();
    myHeaders.append(
      "Cookie",
      "frontend_lang=fr_FR; session_id=86bbb6cb8901f947db8806eb49ac3fa81d0bf0a3"
    );

    var requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    await fetch(
      `${window.location.origin}/is_diagnostic/is_diagnostic/iconDisplay?deviceid=${id}`,
      requestOptions
    )
      .then(response => response.json())
      .then(
        result =>
          (this.icon = `${window.location.origin}/fleet_monitoring/static/img/vehicules/${result[0].iconV}`)
      )
      .catch(error => console.log("error", error));
  }
}

RecordHistorique.template = "is_acces_video.RecordHistoriqueTemp";
registry.category("actions").add("is_acces_video.RecordHistorique", RecordHistorique);
