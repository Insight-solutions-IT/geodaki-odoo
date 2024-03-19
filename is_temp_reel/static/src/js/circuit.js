/** @odoo-module **/

import { registry } from "@web/core/registry";
const rpc = require('web.rpc');
import { useService } from "@web/core/utils/hooks";
import { drawZoneDaki, delete_zones_Daki ,renderCircuit} from "../../../../is_decoupage/static/src/js/function";




const { Component, onWillUnmount ,onMounted, useState} = owl;
export class FleetMapComponent2 extends Component {
     map;
     marker_list=[];
     marker_list2=[];
     vehiculesGlobal = [];
     singleSelection = false;
     i=false;
     divhide=0;
     buttonIds=[];
     buttonIds2=[];
     intervale=10;
     vehiculesT
     firstCall=true;
     showBacs=false
     rfidInterval
     updateInterval
     markerCluster
     legendCheck=false
     circuit_marker_list=[]
     devWidth
     interval5
     zones=[]
     labelZone=[]
     setup() {
         
        
        this.notification = useService('notification');

        
        this.state = {
            vehicles: [],
        };
        
        const map = owl.useRef("map_div");
        this.orm = useService("orm");
        this.vehRef = owl.useRef("veh_lis3");


        onWillUnmount(async ()=>{
            // clearInterval(this.dataInterval);
            clearInterval(this.rfidInterval);
            clearInterval(this.updateInterval);
            clearInterval(this.interval5);

            $('body').append(` <div  id="myloader" style="display: flex;position: absolute;overflow: hidden auto;z-index: 13;width: 100%;height: 100%;left: 0vw;min-height: 600px;bottom: 0px;justify-content: center;text-align: left;"> <div  id="loader" style=" position:absolute;top:0px;height:100%;width:100%;display: block;background-color: rgba(64, 64, 64, 0.5);z-index:200">
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
                  
        })
        onMounted(async ()=>{
            
            
            
            this.vehiculesT = await rpc.query({
                model: 'is_decoupage.circuits',
                method: 'getCircuits',
                args: [[]]
            });
            if (localStorage.getItem('firstVisit') != '2') {
                // This is the first visit, so set the flag
                localStorage.setItem('firstVisit', '2');
                location.reload();
            }
            // this.zones = await rpc.query({
            //     model: 'is_decoupage',
            //     method: 'getZones',
            //     args: [[]]
            // });
            
            
            // Retrieve a value from localStorage
           
            await this.loadGoogleMapsAPI();
            await this.loadScript(`https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js`);
            // this.lazyBacRenderer()
            $('head').append(`<link href="${window.location.origin}/is_temp_reel/static/css/map_view.css"" rel="stylesheet" id="newcss" />`);
            if(window.screen.width<470){
                document.getElementById("mapid").style.flex="0";
                
            }
            else if ( window.screen.width < 743 ) {
                // Perform a specific action for larger screens (PC)
                document.getElementById("mapid").style.flex="1";
                
            } else if ( window.screen.width < 1010 && window.screen.height < 755) {
                // Perform a specific action for larger screens (PC)
                document.getElementById("mapid").style.flex="1";
                
            } 
            
            try {
                var result = await rpc.query({
                    model: 'res.config.settings',
                    method: 'get_interval',
                    args: [[]]
                });
                if(result>=5){this.intervale=result;}
                
            } catch (error) {
                console.error(error);
            }
            this.logo();
            await this.initMap();
            // this.getVehicleTree();   
            
            await this.uncheckAllCheckboxes();
            this.treeJs2();
            // await this.get_map_data();
            // this.get_data_with_interval();
            this.buttonEventListener();
            this.VehiculePopUpDiv();
            var self=this;
            
            drawZoneDaki(this.map,this.zones,this.labelZone)

            // await drawZoneDaki(this.map,this.zones,this.labelZone)

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
            
            document.getElementById("hidebutton1").addEventListener("click",function(){
                self.i=!self.i;
                self.vehiculeListVisiblity();
            })
            document.getElementsByClassName("dropdown-toggle")[0].addEventListener("click",function(){
                if(document.getElementById("origine")){
                    document.getElementById("origine").innerHTML="";
                }
            })
    //         // window.addEventListener('beforeunload', function(){
        //             //     if(this.rfidInterval){
            //         //         this.clearInterval(this.rfidInterval)
            //         //     }
    //         //     if(this.updateInterval){
    //         //         this.clearInterval(this.updateInterval)
    //         //     }
    //         // });
            
            
            this.legende()
            
            
            this.legendeCircleEvents()
            
            document.getElementById("loader").style.display="none"
            document.getElementById("loader2").style.display="none"
           
            this.handlechangestyle()
            
            this.notification.add(
                this.env._t('Analyse par circuit'),
                {
                  type: 'success',
                }
              );
            // var testB=document.getElementById("testB");
            // testB.addEventListener('click',function(){
                //     self.get_bacs_data();
                // })
                
                //             try {
                    //                 var result = await rpc.query({
//                     model: 'res.users',
//                     method: 'user_info2',
//                     args: [[]]
//                 });
//                
//                 var groupIdsString = result[1];
//                 var groupIdsArray = groupIdsString.match(/\d+/g).map(Number);


//                 var userGroupIds = groupIdsArray; // Assuming the group IDs are at index 1
//                 var groupModelAccess=[]
// // Iterate through group IDs
// for (var i = 0; i < userGroupIds.length; i++) {
//     var groupId = userGroupIds[i];

//     // Make an RPC call to get the group name and access rights based on the group ID
//     try {
//     var groupInfo = await rpc.query({
//         model: 'res.groups',
//         method: 'search_read',
//         domain: [['id', '=', groupId]],
//         fields: ['name', 'model_access'],
//     });
//     }catch(error){
//         console.error("Error during RPC call group permitions:", error);
//     }
//     if (groupInfo.length > 0) {
//         var groupName = groupInfo[0].name;
//          groupModelAccess.push(groupInfo[0].model_access);
        
        

//     }
    
// }
// const flattenedArray = [...new Set(groupModelAccess.flat())];
// for (var i = 0; i < flattenedArray.length; i++) {
//     var accessRightId = flattenedArray[i];

//     // Make an RPC call to get the group name and access rights based on the group ID
//     var groupInfo = await rpc.query({
//         model: 'ir.model.access',
//         method: 'search_read',
//         domain: [['id', '=', accessRightId]],
//         fields: ['name', 'model_id', 'perm_read', 'perm_write', 'perm_create', 'perm_unlink'],
//     });

//     if (groupInfo.length > 0) {
//         var groupName = groupInfo[0].name;
//         var accessRights = {
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
            
           
        })


        

        


          
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
    //                     } else {
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
    //     var rpccall =  rpc.query({
    //         model: 'fleet.vehicle',
    //         method: 'get_map_data',
    //         args:[[]],
    //         }).then(async function(result) {
    //           // await self.updateVehicleLocation();
    //             self.delete_old_marker();
    //             self.render_map_data(result);
    //         });
    // }

    legendeCircleEvents(){
        document.getElementById("legend").addEventListener("click",function(){
            self.legendCheck=!self.legendCheck
            
                $("#legendContainer").slideToggle(400)
            
        })
        

        const circleLegend = document.getElementById('legend');

// Variables to track mouse state
let isMouseDown = false;
let offsetX, offsetY;

// Add mousedown event listener to start moving the element or trigger the click event
circleLegend.addEventListener('mousedown', (event) => {
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
    circleLegend.style.cursor = 'grabbing';

    // Add mousemove event listener to move the element
    document.addEventListener('mousemove', moveElement);

    // Add mouseup event listener to stop moving the element
    document.addEventListener('mouseup', () => {
        isMouseDown = false;
        document.removeEventListener('mousemove', moveElement);

        // Reset cursor style
        circleLegend.style.cursor = 'pointer';
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
       

        
            
                circleLegend.style.left = newX + 'px';
                if(  20<newY){
                    circleLegend.style.top = newY + 'px';
                }else{
                    circleLegend.style.top = 25 + 'px';
                }
                document.getElementById("legendContainer").style.left= (newX-300)+ 'px';
            document.getElementById("legendContainer").style.position=  'fixed';
            document.getElementById("legendContainer").style.right= null;
            document.getElementById("legendContainer").style.top=parseFloat( window.getComputedStyle(circleLegend).top.toString().replace('px'))+45 + 'px';
           
            if(  parseFloat(window.getComputedStyle(document.getElementById("dev")).width.toString().replace('px'))>=parseFloat(window.getComputedStyle(document.getElementById("legend")).left.toString().replace('px'))-parseFloat(window.getComputedStyle(document.getElementById("legendContainer")).width.toString().replace('px'))){
                if( 20<newY){
                    circleLegend.style.top = newY + 'px';
                }else{ 
                    circleLegend.style.top = 25 + 'px';
                }
                document.getElementById("legendContainer").style.top= parseFloat(window.getComputedStyle(circleLegend).top.toString().replace('px'))+45 + 'px';
                if( newX<parseFloat(window.getComputedStyle(document.getElementById("dev")).width.toString().replace('px'))){
                    
                    circleLegend.style.left=parseFloat(window.getComputedStyle(document.getElementById("dev")).width.toString().replace('px'))+30+"px"
                    document.getElementById("legendContainer").style.left= parseFloat(window.getComputedStyle(circleLegend).left.toString().replace('px')) + 'px';
                    
                    
                }else{
                    circleLegend.style.left=(newX)+"px"
                    document.getElementById("legendContainer").style.left= parseFloat(window.getComputedStyle(circleLegend).left.toString().replace('px')) + 'px';
                        }
                    }
                    if( newX<parseFloat(window.getComputedStyle(document.getElementById("dev")).width.toString().replace('px'))){
                    
                        circleLegend.style.left=parseFloat(window.getComputedStyle(document.getElementById("dev")).width.toString().replace('px'))+30+"px"
                        document.getElementById("legendContainer").style.left= parseFloat(window.getComputedStyle(circleLegend).left.toString().replace('px')) + 'px';
                        
                        
                    }
            if(  parseFloat(window.getComputedStyle(document.getElementById("spl")).width.toString().replace('px'))<=parseFloat(window.getComputedStyle(document.getElementById("legend")).left.toString().replace('px'))+parseFloat(window.getComputedStyle(document.getElementById("legendContainer")).width.toString().replace('px'))){
                
                if(parseFloat(window.getComputedStyle(document.getElementById("legend")).left.toString().replace('px'))>parseFloat(window.getComputedStyle(document.getElementById("spl")).width.toString().replace('px'))+45){
                    // document.getElementById("legend").style.left
                    if( event.clientX<parseFloat(window.getComputedStyle(document.getElementById("spl")).width.toString().replace('px'))-50){
                        document.getElementById("legendContainer").style.top= newY+45 + 'px';
                        circleLegend.style.top = newY + 'px';
                    }
                    else{
                        circleLegend.style.left = (parseFloat(window.getComputedStyle(document.getElementById("spl")).width.toString().replace('px'))-20)+"px"
                        if( 20<newY){
                            circleLegend.style.top = newY + 'px';
                        }else{
                            circleLegend.style.top = 25 + 'px';
                        }
                        document.getElementById("legendContainer").style.left=  (parseFloat(window.getComputedStyle(document.getElementById("legend")).left.toString().replace('px'))-300)+ 'px';
                        document.getElementById("legendContainer").style.position=  'fixed';
                        document.getElementById("legendContainer").style.right= null;
                        document.getElementById("legendContainer").style.top= parseFloat( window.getComputedStyle(circleLegend).top.toString().replace('px'))+45 + 'px';
    
                    }
                }
                
                
            }
            // if(parseFloat(window.getComputedStyle(document.getElementById("dev")).left.toString().replace('px'))+100>newX){
            //     circleLegend.style.left = (parseFloat(window.getComputedStyle(document.getElementById("dev")).width.toString().replace('px'))+30)+"px"
               
            // }
            if(parseFloat(window.getComputedStyle(document.getElementById("spl")).height.toString().replace('px'))<=parseFloat(window.getComputedStyle(document.getElementById("legend")).top.toString().replace('px')) && window.getComputedStyle(document.getElementById("legendContainer")).display=="none"){
                if( event.clientY>parseFloat(window.getComputedStyle(document.getElementById("spl")).height.toString().replace('px'))-50){
                    if( parseFloat(window.getComputedStyle(document.getElementById("spl")).height.toString())-20>newY){
                        circleLegend.style.top = newY + 'px';
                    }else{ 
                        circleLegend.style.top =parseFloat(window.getComputedStyle(document.getElementById("spl")).height.toString())- 25 + 'px';
                    }
                }
                
            }

            if(parseFloat(window.getComputedStyle(document.getElementById("spl")).width.toString().replace('px'))<=parseFloat(window.getComputedStyle(document.getElementById("legend")).left.toString().replace('px')) && window.getComputedStyle(document.getElementById("legendContainer")).display=="none"){
                if( event.clientX>parseFloat(window.getComputedStyle(document.getElementById("spl")).width.toString().replace('px'))-50){
                    
                    if( parseFloat(window.getComputedStyle(document.getElementById("spl")).width.toString())-20>newX){
                        circleLegend.style.left = newX + 'px';
                    }else{ 
                        circleLegend.style.left =parseFloat(window.getComputedStyle(document.getElementById("spl")).width.toString())- 30 + 'px';
                    }
                }
                
            }
            if(  parseFloat(window.getComputedStyle(document.getElementById("spl")).height.toString().replace('px'))<=parseFloat(window.getComputedStyle(document.getElementById("legend")).top.toString().replace('px'))+parseFloat(window.getComputedStyle(document.getElementById("legendContainer")).height.toString().replace('px'))){
                // document.getElementById("legend").style.left
                if( event.clientY>parseFloat(window.getComputedStyle(document.getElementById("spl")).height.toString().replace('px'))-50){
                    if( parseFloat(window.getComputedStyle(document.getElementById("spl")).height.toString())-20>newY){
                        circleLegend.style.top = newY + 'px';
                    }else{ 
                        circleLegend.style.top =parseFloat(window.getComputedStyle(document.getElementById("spl")).height.toString())- 25 + 'px';
                    }
                    document.getElementById("legendContainer").style.top= parseFloat(window.getComputedStyle(circleLegend).top.toString().replace('px'))-5-parseFloat(window.getComputedStyle(document.getElementById("legendContainer")).height.toString()) + 'px';
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
circleLegend.addEventListener('touchstart', (event) => {
// Prevent default behavior to avoid scrolling or zooming on touch devices
event.preventDefault();

// Store the initial touch coordinates
const touch = event.touches[0];
touchStartX = touch.clientX;
touchStartY = touch.clientY;

// Reset the click flag
isClick = true;

// Add touchmove event listener to move the element
document.addEventListener('touchmove', moveElement2);

// Add touchend event listener to stop moving the element or trigger the click event
document.addEventListener('touchend', touchEndHandler)
    

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
circleLegend.style.left = currentX + 'px';
    circleLegend.style.top = currentY - 15+'px';
// If there's significant movement, it's not a click
if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
    isClick = false;
}
}

// Touchend handler to remove the touchmove and touchend listeners
function touchEndHandler() {
document.removeEventListener('touchmove', moveElement2);
document.removeEventListener('touchend', touchEndHandler);

// If it's a click (no movement), trigger the click event
if (isClick) {
    circleLegend.click();
}
}
    }



    async legende(){

        const mainContainer = document.createElement("div");

        // Create the three child divs
        
            const mainContainer1 = document.createElement("div");
            mainContainer.id="legendContainer"
            mainContainer.style.display="none"
            mainContainer1.className = "container1";
            mainContainer1.id = "container1";
            mainContainer.appendChild(mainContainer1);

            // Create a box div inside each child div
            
                const boxDiv1 = document.createElement("div");
                boxDiv1.className = "box1";
                mainContainer1.appendChild(boxDiv1);

               

                var string1=`<div style="display: flex;
                align-items: center;flex-direction:column; margin:4px" ><div><img src="/fleet_monitoring/static/img/vehicules/camion-vert.png" alt="Example Image"></div>camion</div></div>
                <div style="display: flex;align-items: center;flex-direction:column; margin:4px"><img src="/fleet_monitoring/static/img/vehicules/chariot-vert.png" alt="Example Image">chariot</div></div>
                <div style="display: flex;align-items: center;flex-direction:column; margin:4px"><img src="/fleet_monitoring/static/img/vehicules/voiture-vert.png" alt="Example Image">voiture</div></div>
                <div style="display: flex;align-items: center;flex-direction:column; margin:4px"><img src="/fleet_monitoring/static/img/vehicules/moto-vert.png" alt="Example Image">moto</div></div>
                <div style="display: flex;align-items: center;flex-direction:column; margin:4px;"><img style="width:30px" src="/fleet_monitoring/static/description/icon1.png" alt="Example Image">non definit</div></div>`
                
                boxDiv1.innerHTML=string1

                const boxDiv2 = document.createElement("div");
                boxDiv2.className = "box2";
                mainContainer1.appendChild(boxDiv2);

                var string2=`<div style="display: flex;align-items: center;margin:5px"><div class="circle-green " style="display:flex"  title="vehicules actifs" ></div>vehicule demarre ou reception <= 1h</div>
                <div style="display: flex;align-items: center;margin:5px"><div class="circle-yellow "  title="vehicules qui n'ont pas envoyé un signale depuis 1h"></div>vehicule etteint ou reception > 1h</div>
                <div style="display: flex;align-items: center;margin:5px"><div class="circle-red "   title="vehicules qui n'ont pas envoyé un signale depuis 24h"></div>reception > 24h</div>`
                
                boxDiv2.innerHTML=string2


                const boxDiv3 = document.createElement("div");
                boxDiv3.className = "box2";
                mainContainer1.appendChild(boxDiv3);

                var string3=`<div style="display: flex;align-items: center;"><div><img style="width: 22px;margin: 6px;" src="/fleet_monitoring/static/img/vehicules/acc-vitesse.png" alt="Example Image"></div>Contact ON  vehicule en mouvement</div></div>
                <div style="display: flex;align-items: center;"><div><img style="width: 22px;margin: 6px;" src="/fleet_monitoring/static/img/vehicules/acc.png" alt="Example Image"></div>Contact ON vehicule à l'arrêt</div></div>
                <div style="display: flex;align-items: center;"><div><img style="width: 22px;margin: 6px;" src="/fleet_monitoring/static/img/vehicules/point-exclamation-rouge.png" alt="Example Image"></div>Aucune reception depuis 24h</div></div>
                <div style="display: flex;align-items: center;"><div><img style="width: 22px;margin: 6px;" src="/fleet_monitoring/static/img/vehicules/no-acc-orange.png" alt="Example Image"></div>Contact OFF</div></div>
                `
                
                boxDiv3.innerHTML=string3




                mainContainer.style.position="absolute"
                mainContainer.style.top="130px"
                mainContainer.style.right="0px"
                mainContainer.style.zIndex="99"
                document.getElementById('spl').appendChild(mainContainer)


    }




    handlerTree(mouseDownEvent) {
        const startButtonTree = document.getElementById('hidebutton').offsetTop;

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
                'DisplayTree'
            ).style.top = `${newHeightButtonTree}px`;

            // Chart.style.minHeight = `${newHeight}px`;
        }}

     VehiculePopUpDiv() {
        var origine = document.createElement("div");
        origine.id="origine"
        var map = document.getElementById("mapid");
        
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

    async VehiculeInfoPopUp(){
        if(this.rfidInterval){
            clearInterval(this.rfidInterval);}
        var self=this;
        var origine = document.getElementById("origine");
        // origine.style.top = "55px";
        // origine.style.right = "0px";
        // if ( window.screen.width < 743 ) {
        //     origine.style.top = "17px"; // Perform a specific action for larger screens (PC)
        //     origine.style.right = "54px";
            
        // } 
        if(this.state.vehicles.length<=0){
            origine.style.height="0px";
            origine.innerHTML="";
        }else{
            origine.innerHTML="";
           for(let i=0;i<this.state.vehicles.length;i++){

               var container = document.createElement("div");
            //    container.style.border="1px solid black";
               
               var title = document.createElement("div");
               title.style.borderBottom="1px solid black"
               title.style.backgroundColor = "#793FDF";
               title.id=this.state.vehicles[i].device;
               title.innerText=this.state.vehicles[i].device;
               title.style.borderRadius="8px";
            //    title.style.width="300px";
            //    title.style.height="35px";
               title.style.pointerEvents = "auto";
               title.classList.add("detailsss");
            //    if ( window.screen.width < 743 ) {
            //     title.style.width = "109px"; // Perform a specific action for larger screens (PC)
                
                
            // } 
               
               title.style.display = "flex";
               title.style.justifyContent = "center"; // Center horizontally
               title.style.alignItems = "center"; // Center the text
               title.style.color = "white"; // Set text color
               title.style.cursor="pointer"

               var details = document.createElement("div");
               details.style.backgroundColor="white";
               details.style.borderRadius="8px";
               details.style.direction= "ltr";
               details.id="detail-"+this.state.vehicles[i].device;
            //    details.innerText=this.state.vehicles[i].device;
               details.style.width="300px";
               details.style.display="none";
               details.style.pointerEvents = "auto";
               var vehicleContentDiv=document.createElement("div");
               details.style.display="flex"
               details.style.flexDirection="column"
               details.style.alignItems="center"
               var divButtons=document.createElement("div");
               
               // Create the "info" button
var infoButton = document.createElement("button");
infoButton.className="info-button-click"; // You can define CSS styles for this class
infoButton.textContent = "info"; // Use textContent to set button text

// Create the "RFID" button
var rfidButton = document.createElement("button");
rfidButton.className="rfid-button"; // You can define CSS styles for this class
rfidButton.textContent = "RFID"; // Use textContent to set button text

// Append the buttons to your container (replace 'container' with your actual container)
divButtons.appendChild(infoButton);
divButtons.appendChild(rfidButton);
divButtons.style.margin = "3px";

                var contentString=""

            if(this.state.vehicles[i].vehicle_icon_id[1]){

                if (this.state.vehicles[i].vehicle_icon_id[1] == "CHARIOT") {
                    contentString += `
                        <p>Nom: ${this.state.vehicles[i].device}</p>
                        <span class="vehicle-type"> Type: ${this.state.vehicles[i].vehicle_icon_id[1]}</span>
                        <hr>
                        <span class="vehicle-info"> Fonction: ${this.state.vehicles[i].vehicle_icon_id[1]}</span>
                        <hr>
                        <span class="vehicle-date"> Date: ${this.state.vehicles[i].last_update || ''}</span>
                        <hr>
                        <span class="vehicle-battery"> Batterie: ${"vehicule.battterie"}</span>
                    `;
                } else if (this.state.vehicles[i].vehicle_icon_id[1] === "CAMION") {
                    contentString += `
                        <p>Vehicule: ${this.state.vehicles[i].device}</p>
                        <span class="vehicle-type"> Type: ${this.state.vehicles[i].vehicle_icon_id[1]}</span>
                        <br>
                        <span class="vehicle-matricule"> Matricule: ${this.state.vehicles[i].license_plate || ''}</span>
                        <br>
                        <span class="vehicle-marque"> Marque: ${this.state.vehicles[i].model_id[1]}</span>
                        <br>
                        <span class="vehicle-kilometrage"> Kilometrage: ${this.state.vehicles[i].odometer}</span>
                        <br>
                        <span class="vehicle-nbrheure"> Nombre heures: ${"vehicule.nbrheure"}</span>
                        <br>
                        <span class="vehicle-fonction"> Fonction: ${this.state.vehicles[i].vehicle_icon_id[1]}</span>
                        <hr>
                        <span class="vehicle-date"> Date: ${this.state.vehicles[i].last_update || ''}</span>
                        <br>
                        <hr>
                        <span class="vehicle-battery"> Batterie: ${"vehicule.battterie"}</span>
                    `;
                } else if (this.state.vehicles[i].vehicle_icon_id[1] === "VOITURE") {
                    contentString += `
                        <p>Vehicule: ${this.state.vehicles[i].device}</p>
                        <span class="vehicle-type"> Type: ${this.state.vehicles[i].vehicle_icon_id[1]}</span>
                        <br>
                        <span class="vehicle-matricule"> Matricule: ${this.state.vehicles[i].license_plate || ''}</span>
                        <br>
                        <span class="vehicle-marque"> Marque: ${this.state.vehicles[i].model_id[1]}</span>
                        <br>
                        <span class="vehicle-fonction"> Fonction: ${this.state.vehicles[i].vehicle_icon_id[1]}</span>
                        <hr>
                        <hr>
                        <span class="vehicle-date"> Date: ${this.state.vehicles[i].last_update || ''}</span>
                        <br>
                        <hr>
                        <span class="vehicle-battery"> Batterie: ${"vehicule.battterie"}</span>
                    `;
                } else if (this.state.vehicles[i].vehicle_icon_id[1].includes("MOTO")) {
                    contentString += `
                        <p>Vehicule: ${this.state.vehicles[i].device}</p>
                        <span class="vehicle-type"> Type: ${this.state.vehicles[i].vehicle_icon_id[1]}</span>
                        <br>
                        <span class="vehicle-matricule"> Matricule: ${this.state.vehicles[i].license_plate || ''}</span>
                        <br>
                        <span class="vehicle-marque"> Marque: ${this.state.vehicles[i].model_id[1]}</span>
                        <br>
                        <span class="vehicle-fonction"> Fonction: ${this.state.vehicles[i].vehicle_icon_id[1]}</span>
                        <hr>
                        <hr>
                        <span class="vehicle-date"> Date: ${this.state.vehicles[i].last_update || ''}</span>
                        <br>
                        <hr>
                        <span class="vehicle-battery"> Batterie: ${"vehicule.battterie"}</span>
                    `;
                }
            }
                
            var result = await rpc.query({
                model: 'fleet.vehicle',
                method: 'get_device_with_rfid_tag',
                args: [[],self.state.vehicles[i].device]
            });

                if(!result || result.length<=0){
                    rfidButton.style.display="none"
                }


                vehicleContentDiv.innerHTML=contentString
                vehicleContentDiv.style.marginBottom="7px"
                var vehicleRfidDiv=document.createElement("div")
                vehicleRfidDiv.style.display="none";
                vehicleRfidDiv.style.width="100%";
                vehicleRfidDiv.style.paddingLeft="10px";
                vehicleRfidDiv.style.paddingRight="10px";
                infoButton.addEventListener("click", function(){
                    infoButton.className="info-button-click"
                    rfidButton.className="rfid-button"

                    vehicleContentDiv.style.display="block";
                    vehicleRfidDiv.style.display="none";
                })                
                rfidButton.addEventListener("click", function(){
                   
                    infoButton.className="info-button"
                    rfidButton.className="rfid-button-click"
                    vehicleContentDiv.style.display="none";
                    vehicleRfidDiv.style.display="block";
                })  

                var debutText = document.createElement("p");
debutText.textContent = "Début:";

// Create the "Nombre de bacs relevés" text element
var nombreDeBacsText = document.createElement("p");
nombreDeBacsText.textContent = "Nombre de bacs relevés:";

// Create the "Fin:" text element
var finText = document.createElement("p");
finText.textContent = "Fin:";

// Append the text elements to the vehicleRfidDiv
vehicleRfidDiv.appendChild(debutText);
vehicleRfidDiv.appendChild(nombreDeBacsText);
vehicleRfidDiv.appendChild(finText);
var buttonDivBacs = document.createElement("div");
buttonDivBacs.style.position = "relative"; // Center the button horizontally
buttonDivBacs.style.transform = "translatex(-31%)"; // Center the button horizontally
buttonDivBacs.style.left = "50%"; // Center the button horizontally


var afficherButton = document.createElement("button");
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



var afficherButton1 = document.createElement("button");
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
var supprimerButton = document.createElement("button");
supprimerButton.className="delete-button";
supprimerButton.innerHTML = '<svg class="rfid-svg" xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M49.7 32c-10.5 0-19.8 6.9-22.9 16.9L.9 133c-.6 2-.9 4.1-.9 6.1C0 150.7 9.3 160 20.9 160h94L140.5 32H49.7zM272 160V32H173.1L147.5 160H272zm32 0h58c15.1-18.1 32.1-35.7 50.5-52.1c1.5-1.4 3.2-2.6 4.8-3.8L402.9 32H304V160zm209.9-23.7c17.4-15.8 43.9-16.2 61.7-1.2c-.1-.7-.3-1.4-.5-2.1L549.2 48.9C546.1 38.9 536.8 32 526.3 32H435.5l12.8 64.2c9.6 1 19 4.9 26.6 11.8c11.7 10.6 23 21.6 33.9 33.1c1.6-1.6 3.3-3.2 5-4.8zM325.2 210.7c3.8-6.2 7.9-12.5 12.3-18.7H32l4 32H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H44L64 448c0 17.7 14.3 32 32 32s32-14.3 32-32H337.6c-31-34.7-49.6-80.6-49.6-129.9c0-35.2 16.3-73.6 37.2-107.4zm128.4-78.9c-2.8-2.5-6.3-3.7-9.8-3.8c-3.6 0-7.2 1.2-10 3.7c-33.2 29.7-61.4 63.4-81.4 95.8c-19.7 31.9-32.4 66.2-32.4 92.6C320 407.9 390.3 480 480 480c88.7 0 160-72 160-159.8c0-20.2-9.6-50.9-24.2-79c-14.8-28.5-35.7-58.5-60.4-81.1c-5.6-5.1-14.4-5.2-20 0c-9.6 8.8-18.6 19.6-26.5 29.5c-17.3-20.7-35.8-39.9-55.5-57.7zM530 401c-15 10-31 15-49 15c-45 0-81-29-81-78c0-24 15-45 45-82c4 5 62 79 62 79l36-42c3 4 5 8 7 12c18 33 10 75-20 96z"/></svg>';
// supprimerButton.style.backgroundColor = "#7091F5"; // Button background color
supprimerButton.style.color = "#fff"; // Button text color
supprimerButton.style.padding = "8px 16px"; // Button padding
supprimerButton.style.border = "none"; // Remove button border
supprimerButton.style.cursor = "pointer"; // Add pointer cursor
supprimerButton.style.margin = "0 auto"; // Center the button horizontally
supprimerButton.style.borderRadius = "7px"; // Center the button horizontally
supprimerButton.style.marginBottom = "7px"; // Center the button horizontally



// Append the text elements and button to the vehicleRfidDiv
vehicleRfidDiv.appendChild(debutText);
vehicleRfidDiv.appendChild(nombreDeBacsText);
vehicleRfidDiv.appendChild(finText);
buttonDivBacs.appendChild(afficherButton1);
buttonDivBacs.appendChild(supprimerButton);
vehicleRfidDiv.appendChild(buttonDivBacs);



// Create a container div for the colored bar
var coloredBar = document.createElement("div");
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

// Rest of your code...
var self=this
                this.rfidInterval=setInterval(async function(){
                    var result = await rpc.query({
                        model: 'is_rfid.rfid',
                        method: 'getTagLast10s',
                        args: [[],self.state.vehicles[0].id]
                    });
                    coloredBar.innerText="";
                        
                        for(var i=0;i<result.length;i++){
                        coloredBar.innerHTML+= result[i].tag1+'<br>'
                        }
                },10000)



               divButtons.appendChild(infoButton)
               divButtons.appendChild(rfidButton)
               details.appendChild(divButtons)
               details.appendChild(vehicleContentDiv)
               details.appendChild(vehicleRfidDiv)

               title.addEventListener("click", function() {
                   $("#detail-" + self.state.vehicles[i].device).slideToggle(400);
               });



               afficherButton1.addEventListener("click", function() {
                   $('.delete-button').animate({
                       backgroundColor: '#ff0000'
                   },800)                
                self.render_bacs_data2()
            });
            
            supprimerButton.addEventListener("click", function() {
                self.delete_old_marker2()
                $('.delete-button').animate({
                    backgroundColor: '#7091F5'
                },400)  
         });


               origine.style.height="600px";

               container.style.marginBottom="10px";
               container.appendChild(title);
               container.appendChild(details);
               origine.appendChild(container);
           } 
            
                
            
        }


    }
    

    vehiculeListVisiblity(){
            const devElement = $("#dev");
            const button = $("#hidebutton1");
            var split= $(".vsplitter");
            var map= $(".right_panel");
            
            const screenWidth = window.screen.width;
const screenHeight = window.screen.height;






// Define the threshold values for screen width and height
const thresholdWidth = 1024; // Example threshold for width
const thresholdHeight = 768;
 // Example threshold for height
        if(!this.i){

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
                // Perform a specific action for larger screens (PC)
                var dev=  document.getElementById("dev")

                var button1 =   document.getElementById("hidebutton1")
                
          
                button1.style.left = this.devWidth-0.5 + "px";
                console.log("left "+parseFloat(window.getComputedStyle(dev).width)+" !important");
                  // Perform a specific action for larger screens (PC)
                
            } 
            map.animate({
                width: "80%",
                flex:2
            }, 400, function() {
                // Animation complete
            });
           
            devElement.animate({
                width: "20%",
                opacity: "100%",
                display:"block",
                flex:1
            }, 400, function() {
                // Animation complete
            });
            if(window.screen.width<470){
                document.getElementById("mapid").style.flex="0";
                
            } else if ( window.screen.width < 743 ) {
                // Perform a specific action for larger screens (PC)
                document.getElementById("mapid").style.flex="1";
                
            }else if ( window.screen.width < 1010 && window.screen.height < 755){
                document.getElementById("mapid").style.flex="1";
            }else{
                document.getElementById("mapid").style.flex="3";
            }
            document.getElementById("dev").style.display="block";
        }
        else{
            if (screenWidth > thresholdWidth && screenHeight > thresholdHeight) {
                // Perform a specific action for larger screens (PC)
                var dev=  document.getElementById("dev")

                var button1 =   document.getElementById("hidebutton1")
                var devWidth = parseFloat(window.getComputedStyle(dev).width);
          
                button1.style.left = 0 + "px";
                
            } 
            document.getElementById("mapid").style.flex="1";
            map.animate({
                width: "100%"
            }, 400, function() {
                // Animation complete
            });
            
            devElement.animate({
                width: "0%",
                opacity: 0,
                display:"none",
                flex:0
            }, 400, function() {
                // Animation complete
            });
            document.getElementById("dev").style.display="none";

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
        var self=this;
        const vehiculeDiv = document.getElementById("vehicules");
        const vehiculeDiv2 = document.getElementById("vehicules2");
    
        const resetButton = document.createElement("div");
        resetButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 0 0 0 0h.4c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V448c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H176c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"/></svg>';
        resetButton.style.display = "inline";
    
        resetButton.addEventListener("click", async function () {
            if(this.rfidInterval){
                clearInterval(this.rfidInterval);}
            self.showBacs=false
            // self.delete_old_marker2()
            self.singleSelection = false;
            self.firstCall=true;
            self.map.setZoom(12);
            self.map.setCenter({lat: 33.964451, lng: -6.842338});
            var checkboxes = vehiculeDiv.querySelectorAll("input[type='checkbox']");
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            checkboxes = vehiculeDiv2.querySelectorAll("input[type='checkbox']");
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            self.state.vehicles = [];
            self.render();
            clearInterval(self.interval5)
        //    await self.get_map_data();
        //    self.VehiculeInfoPopUp()
            self.delete_old_marker()
            self.delete_old_marker3()
            delete_zones_Daki(self.zones,self.labelZone)
            await drawZoneDaki(self.map,self.zones,self.labelZone)
            // Apply rotation animation by updating the style.transform property
            let rotation = 0;
            const rotationInterval = setInterval(() => {
                rotation += 10; // Adjust the rotation speed
                if(resetButton.querySelector("svg")){
                resetButton.querySelector("svg").style.transform = `rotate(${rotation}deg)`;
if (rotation >= 360) {
                    clearInterval(rotationInterval);
                    resetButton.querySelector("svg").style.transform = ""; // Reset the transform after the animation
                }
                }
        
                
            }, 20); // Adjust the interval for smoother animation
        });
        
        const val = document.getElementById("veh");
        val.appendChild(resetButton);
        
    }
    
    
    
    // Attach the uncheckAllCheckboxes function to the button click event
    
    



    logo() {
        var divRoot = document.getElementById("root1");
        divRoot.style.borderRadius = "7px";
        divRoot.style.margin = "7px";
        divRoot.style.width="auto"
        divRoot.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)";

        var logodiv = document.getElementById("logo");
        var marquee = document.createElement("marquee");
        marquee.textContent = "";
        // logodiv.appendChild(marquee);

        marquee.style.backgroundColor = "#71639E"; // Purple color of Odoo
    marquee.style.color = "white"; // White text color
    marquee.style.padding = "10px"; 
    marquee.style.fontSize = "25px"
    marquee.style.fontFamily = "Arial, sans-serif"; // Specify a font family
    marquee.style.fontWeight = "bold"; // Make the text bold
    marquee.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.3)"; // Add a subtle text shadow
    
        // var backgroundImageDiv = document.createElement("div");
        // backgroundImageDiv.style.backgroundImage = "url('/fleet_monitoring/static/img/vehicules/logo1.png')";
        // backgroundImageDiv.style.width = "100%";
        // backgroundImageDiv.style.height = "300px"; // Set the height as needed
        // backgroundImageDiv.style.backgroundSize = "cover";
        // backgroundImageDiv.style.backgroundPosition = "center";
        // logodiv.appendChild(backgroundImageDiv);
    
        // // Create a container for the circular logo and center it using flexbox
        // var logoContainer = document.createElement("div");
        // logoContainer.style.display = "flex";
        // logoContainer.style.justifyContent = "center"; // Center horizontally
        // logoContainer.style.alignItems = "center"; // Center vertically
        // logoContainer.style.height = "100%"; // Fill the height of the background image div
        // backgroundImageDiv.appendChild(logoContainer);
    
        // // Create the circular logo image
        // var logoImage = document.createElement("img");
        // logoImage.src = "/fleet_monitoring/static/img/vehicules/insight.png";
        // logoImage.alt = "Logo";
        // logoImage.style.width = "100px"; // Set the width and height as needed
        // logoImage.style.height = "100px";
        // logoImage.style.borderRadius = "50%";
        // logoContainer.appendChild(logoImage);
    }
    

    get_data_with_interval() {
        var self=this;
       
        
            var time = this.intervale //Seconds
        time = time*1000
        
        this.interval5 = window.setInterval(function(){
            
            if(self.state.vehicles.length<=0 || self.state.vehicles.length==[] ){
           }
           else{
            self.get_map_data();
           
           }
        }, time);
        
        
    }    

    // render_map_data(data) {
    //     var img = L.icon({iconUrl: "/fleet_monitoring/static/description/icon1.png",iconSize:[40, 40]});
    //     var i;
    //     for (i = 0; i < data.length; i++) {
    //         var driver = data[i].driver_id && data[i].driver_id[1]
    //         var popup = '<p>Name: </p><span>'+data[i].display_name+'</span><br/><p>Driver Name: </p><span>'+ driver +'</span>'
    //         var m = L.marker([data[i].latitude,data[i].longitude],{icon:img}).addTo(this.map).bindPopup(popup)
    //         this.map.addLayer(m);
    //         this.marker_list.push(m);                
    //     }
    // }

    // delete_old_marker() {for (var i = 0; i < this.marker_list.length; i++) {this.map.removeLayer(this.marker_list[i])}}


    async get_state_vehs(){
        var self=this
   

        var result = await rpc.query({
            model: 'fleet.vehicle',
            method: 'vehicules_with_icons',
            args: [[]]
        });


        var red= result.filter(vehicule =>(vehicule.last_update!=null &&( ( Math.abs(new Date(vehicule.last_update.toString().replace('T', ' '))-new Date())/ (1000 * 60 * 60))/ 24 )>1) ||  vehicule.last_update==null)
            var yellow= result.filter(vehicule =>(vehicule.last_update!=null && ((Math.abs(new Date(vehicule.last_update.toString().replace('T', ' '))-new Date())/ (1000 * 60 * 60))/ 24 )<1 && (( Math.abs(new Date(vehicule.last_update.toString().replace('T', ' '))-new Date())/ (1000 * 60 * 60)))>1))
            var green= result.filter(vehicule =>(vehicule.last_update!=null &&(( Math.abs(new Date(vehicule.last_update.toString().replace('T', ' '))-new Date())/ (1000 * 60 * 60)))<1))
           
        if(document.getElementsByClassName("circle-red")){
            document.getElementsByClassName("circle-red")[0].innerText=red.length
            document.getElementsByClassName("circle-green")[0].innerText=green.length
            document.getElementsByClassName("circle-yellow")[0].innerText=yellow.length
            
        }
        

    this.updateInterval= setInterval(async function(){
        if(document.getElementsByClassName("circle-red").length>0){
            var result = await rpc.query({
                model: 'fleet.vehicle',
                method: 'vehicules_with_icons',
                args: [[]]
            });
            
           
        var red= result.filter(vehicule =>(vehicule.last_update!=null &&( ( Math.abs(new Date(vehicule.last_update.toString().replace('T', ' '))-new Date())/ (1000 * 60 * 60))/ 24 )>1) ||  vehicule.last_update==null)
        var yellow= result.filter(vehicule =>(vehicule.last_update!=null && ((Math.abs(new Date(vehicule.last_update.toString().replace('T', ' '))-new Date())/ (1000 * 60 * 60))/ 24 )<1 && (( Math.abs(new Date(vehicule.last_update.toString().replace('T', ' '))-new Date())/ (1000 * 60 * 60)))>1))
        var green= result.filter(vehicule =>(vehicule.last_update!=null &&(( Math.abs(new Date(vehicule.last_update.toString().replace('T', ' '))-new Date())/ (1000 * 60 * 60)))<1))
       
            document.getElementsByClassName("circle-red")[0].innerHTML=red.length
            document.getElementsByClassName("circle-green")[0].innerHTML=green.length
            document.getElementsByClassName("circle-yellow")[0].innerHTML=yellow.length

        }else{
            clearInterval(self.dataInterval);
            clearInterval(self.rfidInterval);
            clearInterval(self.updateInterval);
        }
    },(self.intervale+5)*1000)

}
    
    // Fetch and render map data
    async  get_map_data(data=null) {
        var self = this
        if(data==null || data==[] ){
        try {
            var result = await rpc.query({
                model: 'fleet.vehicle',
                method: 'vehicules_with_icons',
                args: [[]]
            });
    if(self.firstCall){
        self.delete_old_marker();
            self.render_map_data(self.state.vehicles);
    }else{
        var veh4=[]
        
    this.state.vehicles.forEach(vehic=>{
        veh4.push(result.filter(resultat=> resultat.device == vehic.device)[0])
                self.render_map_data(veh4);
    })
    }
    
    
        } catch (error) {
            console.error(error);
        }}else if(data.length<=0){

        }
        // else{
        //     try {
        //         var result = await rpc.query({
        //             model: 'fleet.vehicle',
        //             method: 'get_map_data2',
        //             args: [[]]
        //         });
                
        //         // Filter the result array based on a condition
        //         result = result.filter(vehicle => vehicle.id === data[0].id);
        //         if(self.firstCall){
        //             self.delete_old_marker();
            
        //         }
        //         self.render_map_data(result);
        //     } catch (error) {
        //         console.error(error);
        //     }
            
        //     // self.delete_old_marker();
        //     // self.render_map_data(data);
        // }
    }
    
    //  openVehicleForm(vehicleId) {
    //     // Replace the URL with the appropriate URL to open the form view of the vehicle
    //     const formUrl = `http://localhost:8069/web#id=${vehicleId}&cids=1&menu_id=98&action=131&model=fleet.vehicle&view_type=form`;
    //     window.open(formUrl, '_blank', 'width=800,height=600');
    // }



    openVehicleForm(id) {
        const action = this.env.services.action;
    
        action.doAction({
            type: "ir.actions.act_window",
            name: "Open Vehicle Form",
            res_model: "fleet.vehicle", // Replace with your model name
            res_id: id, // Replace with the specific vehicle ID
            domain: [],
            views: [
                [false, "form"],
            ],
            view_mode: "form",
            target: "new", // Opens in a new frame or small window
        });
    }


    openBacForm(id) {
        const action = this.env.services.action;
    
        action.doAction({
            type: "ir.actions.act_window",
            name: "Open bac Form",
            res_model: "is_rfid.bacs", // Replace with your model name
            res_id: id, // Replace with the specific vehicle ID
            domain: [],
            views: [
                [false, "form"],
            ],
            view_mode: "form",
            target: "new", // Opens in a new frame or small window
        });
    }
    

    async buttonEventListener(){
        var self=this
        const container = document.getElementById('mapid');
        this.buttonIds= await rpc.query({
            model: 'fleet.vehicle',
            method: 'vehicules_with_icons',
            args: [[]]
        });
        this.render()
        this.buttonIds.forEach(buttonid=>{
          
          container.addEventListener('click', async (event) => {
        
        

            if (event.target.matches(`.btn-open-form-${buttonid.id}`)) {
                // Find the associated vehicle ID from a data attribute
                const clickedVehicleId = event.target.dataset.vehicleId;
    
                // Call the openVehicleForm function with the vehicle ID
                // this.openVehicleForm(clickedVehicleId);
                
                self.openVehicleForm(buttonid.id);
                //  document.getElementById('popup').style.display="block"
        
        }else if(event.target.matches(`.btn-open-map-${buttonid.id}`)){
            var results = await rpc.query({
                model: 'fleet.vehicle',
                method: 'vehicules_with_icons',
                args: [[]]
            });

            results=results.filter(result =>  result.id ==buttonid.id )
            self.openGoogleMaps(results[0].latitude,results[0].longitude);
        }
       
        
    });
    
        })
        
    }

     openGoogleMaps(lat, lng) {
        var googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=" + lat + "," + lng;
        window.open(googleMapsUrl, "_blank");
    }
    
    // Render map data using Google Maps API
    async render_map_data(data) {
        this.buttonIds=data;
        var self = this;
        var img = {
            url: "/fleet_monitoring/static/description/icon1.png",
            scaledSize: new google.maps.Size(40, 40)
        };
        
    if(self.singleSelection == false){

        if(self.firstCall){
            for (var i = 0; i < data.length; i++) {
                img.url="/fleet_monitoring/static/description/icon1.png";
    
                var contentString = '<div><p>Name: </p><span>' + data[i].device + '</span><br/><p>Driver Name: </p><span>' + '</span></div>';
                
                
             //        var icons=[];
             //        var response = await rpc.query({
             //            model: 'fleet.vehicle.icon',
             //            method: 'get_icon_data2',
             //            args:[[]],
             //        }).then(async function(result) {
             //            icons=result;
                        
                        
             //        });
                    
                    const container = document.getElementById('mapid');
    
                    const buttonex =document.getElementById(`btn-open-form-${data[i].id}`)
    
                    
    
                    const button = document.createElement('button');
        button.classList.add('btn', 'btn-primary', `btn-open-form-${data[i].id}`);
        button.style.width = '80px';
        button.style.height = '26px';
        button.textContent = 'Open';
        button.id=data[i].id;
        button.dataset.vehicleId = data[i].id;
        
        
        const button2 = document.createElement('button');
        button2.style.margintop="15px"
        button2.classList.add('btn', 'btn-primary', `btn-open-map-${data[i].id}`);
        button2.style.width = '80px';
        button2.style.height = '26px';
        button2.textContent = 'navigate';
        button2.id=data[i].id;
        button2.dataset.vehicleId = data[i].id;
    
                    contentString =`
                    <div style="display: flex;">
                        <div style="display: flex; flex-direction: column; align-items: center; padding-right: 10px;">
                            <img class="img img-fluid" alt="Fichier binaire"
                                src="${window.location.origin}/web/image?model=fleet.vehicle&amp;id=${data[i].id}&amp;field=image_128&amp;unique=1693390267000"
                                name="image_128"
                                style="width: 80px; height: 80px; object-fit: cover; margin-bottom: 5px;">
                               ${button.outerHTML} <br>${button2.outerHTML}
    
                        </div>
                        <div style="flex: 1;">`;
                        if(data[i].category_id){
                         if(data[i].category_name=="CHARIOT"){
                                            contentString += `<p>N°Park: ${data[i].device}</p><span> Type: ${data[i].category_name}</span><br><hr><span> Activité: ${data[i].icon}</span><hr><span> Date: ${data[i].last_update || ''}</span></span><hr><span> Batterie: ${"vehicule.battterie"}</span>`;
                                        }else if (data[i].category_name === "CAMION") {
                                            contentString += `<p>Vehicule: ${data[i].device}</p><span> Type: ${data[i].category_name}</span><br><span> Matricule: ${data[i].license_plate || ''}</span><br><span> Marque: ${data[i].marque}/${data[i].model}</span><br><span> Kilometrage: ${data[i].odometer1}</span><br><span> Nombre heures: ${"vehicule.nbrheure"}</span><br><span> Activité: ${data[i].icon}</span><br><hr><span> Date: ${data[i].last_update || ''}</span><br></span><hr><span> Batterie: ${"vehicule.battterie"}</span>`;
                                        } else if (data[i].category_name === "VOITURE") {
                                            contentString += `<p>Vehicule: ${data[i].device}</p><span> Type: ${data[i].category_name}</span><br><span> Matricule: ${data[i].license_plate || ''}</span><br><span> Marque:${data[i].marque}/${data[i].model}</span><br><span> Activité: ${data[i].icon}</span><hr></span><hr><span> Date: ${data[i].last_update || ''}</span><br></span><hr><span> Batterie: ${"vehicule.battterie"}</span>`;
                                        }else if (data[i].category_name.includes( "MOTO")) {
                                            contentString += `<p>Vehicule: ${data[i].device}</p><span> Type: ${data[i].category_name}</span><br><span> Matricule: ${data[i].license_plate || ''}</span><br><span> Marque: ${data[i].marque}/${data[i].model}</span><br><span> Activité: ${data[i].icon}</span><hr></span><hr><span> Date: ${data[i].last_update || ''}</span><br></span><hr><span> Batterie: ${"vehicule.battterie"}</span>`;
                                        }
                                        //  else{
                                        //    popupContent = '<p>Vehicule: ' + vehicule.name + '</p><span> Type: ' + vehicule.typecamion + '</span><br><span> Matricule: ' + (vehicule.immatricule !== null ? vehicule.immatricule : '') + '</span><br><span> Marque: ' + vehicule.marque + '</span><br><span> Date de mise en service: ' + vehicule.datems + '</span><br><span> Fonction: ' + vehicule.fonction + '</span><hr><span> Date: ' + vehicule.lastupdate + '</span><br></span><hr><span> Batterie: ' + vehicule.battterie + '</span>';
                                     
                                        //  }
                        }
                    
                    contentString += `</div></div>`;
                    
                        
                            img.url="/fleet_monitoring/static/img/vehicules/"+data[i].iconV;
                            if(data[i].last_update){
                                const timestamp1 = new Date();
                                var timestamp2 = data[i].last_update;
                                timestamp2 =new Date(data[i].last_update.toString().replace('T', ' '));
                                
                                 // Calculate the time difference in milliseconds
                                 const timeDifference = Math.abs(timestamp2 - timestamp1);
                                 
                                 // Convert milliseconds to hours and days
                                 const hoursDifference = timeDifference / (1000 * 60 * 60); // 1 hour = 3600000 milliseconds
                                 const daysDifference = hoursDifference / 24;
        
                                // Define your conditions
                    
                        if (hoursDifference < 1) {
                            img.url="/fleet_monitoring/static/img/vehicules/"+data[i].iconV;
        
                        } else if (hoursDifference >= 1 && daysDifference < 1) {
                            img.url="/fleet_monitoring/static/img/vehicules/"+data[i].iconO;
        
                        } else {
                            img.url="/fleet_monitoring/static/img/vehicules/"+data[i].iconR; 
        
                        }
                    }
                            
                            
                        
                        
                    
                    
                
                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });
                
                var marker = new google.maps.Marker({
                    position: { lat: data[i].latitude, lng: data[i].longitude },
                    icon: img,
                    map: this.map,
                    draggable: false,
                    markerId: data[i].id
                });
        
                // Use a closure to create a new scope for each marker
                marker.addListener('click', (function(marker, infowindow) {
                    return function() {
                        infowindow.open(self.map, marker);
                    };
                })(marker, infowindow));
        
                this.marker_list.push(marker);
            }
            self.firstCall=false;
        }else{
 
         var results = await rpc.query({
             model: 'fleet.vehicle',
             method: 'vehicules_with_icons',
             args:[[]],
         })
 
         data = results.filter(result => {
             return data.some(item => item.id === result.id);
         });
         
 
         for(var i=0;i<data.length;i++)
         {
            
                 img.url="/fleet_monitoring/static/description/icon1.png";
 
             var markerToUpdate = this.marker_list.find(marker => marker.markerId === data[i].id);
             if (markerToUpdate) {
                 // Update the marker's position
                 
                 
                        
                         img.url="/fleet_monitoring/static/img/vehicules/"+data[i].iconV;
                         if(data[i].last_update){
                             const timestamp1 = new Date();
                                var timestamp2 = data[i].last_update;
                                timestamp2 =new Date(data[i].last_update.toString().replace('T', ' '));
     
                             // Calculate the time difference in milliseconds
                             const timeDifference = Math.abs(timestamp2 - timestamp1);
     
                             // Convert milliseconds to hours and days
                             const hoursDifference = timeDifference / (1000 * 60 * 60); // 1 hour = 3600000 milliseconds
                             const daysDifference = hoursDifference / 24;
     
                             // Define your conditions
                 
                     if (hoursDifference < 1) {
                         img.url="/fleet_monitoring/static/img/vehicules/"+data[i].iconV;
     
                     } else if (hoursDifference >= 1 && daysDifference < 1) {
                         img.url="/fleet_monitoring/static/img/vehicules/"+data[i].iconO;
     
                     } else {
                         img.url="/fleet_monitoring/static/img/vehicules/"+data[i].iconR; 
     
                     }
                 }
                         
                         
                     
                     
                  
                 markerToUpdate.setPosition(new google.maps.LatLng(data[i].latitude, data[i].longitude));
                 markerToUpdate.setIcon(img);
             }
 
         }
 
 
        }
        }
    //     else{
    //         for (var i = 0; i < data.length; i++) {
    //             img.url="/fleet_monitoring/static/description/icon1.png";
    
    //             var contentString = '<div><p>Name: </p><span>' + data[i].device + '</span><br/><p>Driver Name: </p><span>' + '</span></div>';
                
                
    //             if(data[i].vehicle_icon_id){
    //                 var icons=[];
    //                 var response = await rpc.query({
    //                     model: 'fleet.vehicle.icon',
    //                     method: 'get_icon_data2',
    //                     args:[[]],
    //                 }).then(async function(result) {
    //                     icons=result;
                        
                        
    //                 });
                    
    //                 const button = document.createElement('button');
    // button.classList.add('btn', 'btn-primary', `btn-open-form-${data[i].id}`);
    // button.style.width = '80px';
    // button.style.height = '26px';
    // button.textContent = 'Open';
    // button.id=data[i].id;
    // button.dataset.vehicleId = data[i].id;
    
    
                

    // const button2 = document.createElement('button');
    // button2.style.margintop="15px"
    // button2.classList.add('btn', 'btn-primary', `btn-open-map-${data[i].id}`);
    // button2.style.width = '80px';
    // button2.style.height = '26px';
    // button2.textContent = 'navigate';
    // button2.id=data[i].id;
    // button2.dataset.vehicleId = data[i].id;

    //             contentString =`
    //             <div style="display: flex;">
    //                 <div style="display: flex; flex-direction: column; align-items: center; padding-right: 10px;">
    //                     <img class="img img-fluid" alt="Fichier binaire"
    //                         src="http://${window.location.hostname}:8069/web/image?model=fleet.vehicle&amp;id=${data[i].id}&amp;field=image_128&amp;unique=1693390267000"
    //                         name="image_128"
    //                         style="width: 80px; height: 80px; object-fit: cover; margin-bottom: 5px;">
    //                        ${button.outerHTML} <br>${button2.outerHTML}

    //                 </div>
    //                 <div style="flex: 1;">`;

                    
    //                 if(data[i].vehicle_icon_id[1]=="CHARIOT"){
    //                     contentString += `<p>N°Park: ${data[i].device}</p><span> Type: ${data[i].vehicle_icon_id[1]}</span><br><hr><span> Fonction: ${data[i].vehicle_icon_id[1]}</span><hr><span> Date: ${data[i].last_update || ''}</span></span><hr><span> Batterie: ${"vehicule.battterie"}</span>`;
    //                 }else if (data[i].vehicle_icon_id[1] === "CAMION") {
    //                     contentString += `<p>Vehicule: ${data[i].device}</p><span> Type: ${data[i].vehicle_icon_id[1]}</span><br><span> Matricule: ${data[i].license_plate || ''}</span><br><span> Marque: ${data[i].model_id[1]}</span><br><span> Kilometrage: ${data[i].odometer}</span><br><span> Nombre heures: ${"vehicule.nbrheure"}</span><br><span> Fonction: ${data[i].vehicle_icon_id[1]}</span><br><hr><span> Date: ${data[i].last_update || ''}</span><br></span><hr><span> Batterie: ${"vehicule.battterie"}</span>`;
    //                 } else if (data[i].vehicle_icon_id[1] === "VOITURE") {
    //                     contentString += `<p>Vehicule: ${data[i].vehicle_icon_id[1]}</p><span> Type: ${data[i].vehicle_icon_id[1]}</span><br><span> Matricule: ${data[i].license_plate || ''}</span><br><span> Marque: ${data[i].model_id[1]}</span><br><span> Fonction: ${data[i].vehicle_icon_id[1]}</span><hr></span><hr><span> Date: ${data[i].last_update || ''}</span><br></span><hr><span> Batterie: ${"vehicule.battterie"}</span>`;
    //                 }else if (data[i].vehicle_icon_id[1].includes( "MOTO")) {
    //                     contentString += `<p>Vehicule: ${data[i].vehicle_icon_id[1]}</p><span> Type: ${data[i].vehicle_icon_id[1]}</span><br><span> Matricule: ${data[i].license_plate || ''}</span><br><span> Marque: ${data[i].model_id[1]}</span><br><span> Fonction: ${data[i].vehicle_icon_id[1]}</span><hr></span><hr><span> Date: ${data[i].last_update || ''}</span><br></span><hr><span> Batterie: ${"vehicule.battterie"}</span>`;
    //                 }
    //                 //  else{
    //                 //    popupContent = '<p>Vehicule: ' + vehicule.name + '</p><span> Type: ' + vehicule.typecamion + '</span><br><span> Matricule: ' + (vehicule.immatricule !== null ? vehicule.immatricule : '') + '</span><br><span> Marque: ' + vehicule.marque + '</span><br><span> Date de mise en service: ' + vehicule.datems + '</span><br><span> Fonction: ' + vehicule.fonction + '</span><hr><span> Date: ' + vehicule.lastupdate + '</span><br></span><hr><span> Batterie: ' + vehicule.battterie + '</span>';
                 
    //                 //  }
    //                 var newLatLng = new google.maps.LatLng(data[i].latitude, data[i].longitude);
    //                         self.map.panTo(newLatLng);
    //                          self.map.setZoom(25);

    //                 contentString += `</div></div>`;
                    
    //                 icons.forEach(icon =>{
                        
    //                     if(icon.name==data[i].vehicle_icon_id[1]){
    //                         img.url="/fleet_monitoring/static/img/vehicules/"+icon.iconV;
    //                     if(data[i].last_update){
    //                         const timestamp1 = new Date();
    //                         const timestamp2 =  new Date(data[i].last_update.toString().replace('T', ' '));
    
    //                         // Calculate the time difference in milliseconds
    //                         const timeDifference = Math.abs(timestamp2 - timestamp1);
    
    //                         // Convert milliseconds to hours and days
    //                         const hoursDifference = timeDifference / (1000 * 60 * 60); // 1 hour = 3600000 milliseconds
    //                         const daysDifference = hoursDifference / 24;
    
    //                         // Define your conditions
                
    //                 if (hoursDifference < 1) {
    //                     img.url="/fleet_monitoring/static/img/vehicules/"+icon.iconV;
    
    //                 } else if (hoursDifference >= 1 && daysDifference < 1) {
    //                     img.url="/fleet_monitoring/static/img/vehicules/"+icon.iconO;
    
    //                 } else {
    //                     img.url="/fleet_monitoring/static/img/vehicules/"+icon.iconR; 
    
    //                 }
    //             }
    //                         return
    //                     }
                        
    //                 }) 
    //                 
    //             }
    //             var infowindow = new google.maps.InfoWindow({
    //                 content: contentString
    //             });
                
    //             var marker = new google.maps.Marker({
    //                 position: { lat: data[i].latitude, lng: data[i].longitude },
    //                 icon: img,
    //                 map: this.map,
    //                 draggable: false
    //             });
        
    //             // Use a closure to create a new scope for each marker
    //             marker.addListener('click', (function(marker, infowindow) {
    //                 return function() {
    //                     infowindow.open(self.map, marker);
    //                 };
    //             })(marker, infowindow));
        
    //             this.marker_list.push(marker);
    //         }
    //     }
    }
    
    
    // Delete old markers from the map
     delete_old_marker() {
        if(this.marker_list!=[] || this.marker_list !=null)
        for (var i = 0; i < this.marker_list.length; i++) {
            this.marker_list[i].setMap(null);
            
        }
    }



    

    async fetchVehicleData() {
        self=this
        try {
            var response =  rpc.query({
                model: 'fleet.vehicle',
                method: 'get_map_data2',
                args:[[]],
                }).then(async function(result) {
                  
                  self.state.vehicles = result;
                  self.render();
                  
                });
         
    
          
        } catch (error) {
          console.error('Error fetching vehicle data:', error);
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

    async recursiveCheck(checkbox,vehicules,groups,i){
        var self=this;
        if(i){
            checkbox.checked=true;
        }
        if(isNaN(parseInt(checkbox.id))){
            if (checkbox.id.includes("check-")){
                
                checkbox.addEventListener('change', function() {
                    var c=checkbox.id.split('-')
                    
                if (this.checked) {
                    var groupsch =  groups.filter(group =>  group.groupid[0] == c[1]);
                    
                    groupsch.forEach(groupch=>{
                        document.getElementById("check-"+groupch.id).checked = true;
                    })
                    var vehiculesch =[]
                    if(groupsch.length<=0){
                        
                            vehiculesch =  vehiculesch.concat(vehicules.filter(vehiculech=> vehiculech.vehicle_group_id[0] == c[1]))
                        
                    }else{
                        groupsch.forEach(groupch=>{
                    vehiculesch =  vehiculesch.concat(vehicules.filter(vehiculech=> vehiculech.vehicle_group_id[0] == groupch.id || vehiculech.vehicle_group_id[0] == c[1]))
                    })
                    }
                    
                    vehiculesch.forEach(vehiculech=>{
                        document.getElementById(vehiculech.device).checked = true;
                    })
                    self.state.vehicles = self.state.vehicles.concat(vehiculesch)
                    self.render();
                    this.firstCall=true
                    self.get_map_data(self.state.vehicles);
                    
    
                } else {
                    var groupsch =  groups.filter(group =>  group.groupid[0] == c[1]);
                    
                    groupsch.forEach(groupch=>{
                        document.getElementById("check-"+groupch.id).checked = false;
                    })
                    var vehiculesch =[]
                    if(groupsch.length<=0){
                        
                        vehiculesch =  vehiculesch.concat(vehicules.filter(vehiculech=> vehiculech.vehicle_group_id[0] == c[1]))
                    
                }else{
                    groupsch.forEach(groupch=>{
                vehiculesch =  vehiculesch.concat(vehicules.filter(vehiculech=> vehiculech.vehicle_group_id[0] == groupch.id || vehiculech.vehicle_group_id[0] == c[1]))
                })
                }
                    vehiculesch.forEach(vehiculech=>{
                        document.getElementById(vehiculech.device).checked = false;
                    })
                    self.state.vehicles=vehiculesch.filter(vehicule=>!self.state.vehicles.includes(vehicule));
                    self.render();
                    
                    if(self.state.vehicles.length<=0){
                        this.firstCall=true
                        self.get_map_data();
                        
    
                    }else{
                        this.firstCall=true
                        self.get_map_data(self.state.vehicles);
                        
                    }
                }})
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
            const script = document.createElement('script');
            script.src = src;

            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }
    async treeJs2(){
        this.loadScript(
            'https://cdnjs.cloudflare.com/ajax/libs/jstree/3.2.1/jstree.min.js'
        );

        var self = this;
        var vehicules = [];
        var circuits = this.vehiculesT;
        var groups = [];
        // await rpc.query({
        //     model: 'is_decoupage.circuits',
        //     method: 'getCircuits',
        //     args: [[]],
        // }).then(result => {
        //     circuits = result;
        // }),
        console.log(circuits)
        // Fetch vehicle and group data
        await Promise.all([
            // rpc.query({
            //     model: 'fleet.vehicle',
            //     method: 'get_map_data2',
            //     args: [[]],
            // }).then(result => {
            //     vehicules = result;
            // }),
            rpc.query({
                model: 'fleet.vehicle.group',
                method: 'get_map_data2',
                args: [[]],
            }).then(result => {
                groups = result;
            })
        ]);
        
        try {
            
            localStorage.removeItem('jstree');
  
            const nestedData = this.createNestedData2(circuits, groups);
            var a
            $("#vehicules3")
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
                    'wholerow',
                    'contextmenu',
                    // 'dnd',
                    'search',
                    'state',
                    'types',
                    'wholerow',
                    "sort"
                    // 'checkbox',
                ],
            })
//      

            $('#searchInputRef').on('input', (e) => {
                const searchString = e.target.value;
                $('#vehicules3').jstree('search', searchString);
            });
        } catch (error) {
            console.error('Error loading tree script:', error);
        }

        $('#searchInputRef').on('input', (e) => {
            const searchString = e.target.value;
            $('#vehicules3').jstree('search', searchString);
        });

    }

     async drawZoneDaki(map,zonesTrace,zoneLabel) {
        // Extract polyline options from the provided JSON data
        self=this;

        var zones= await rpc.query({
            model: 'is_decoupage',
            method: 'getZones',
            args: [[]]
        });
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


      delete_zones_Daki(zones,zoneLabels) {
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
      
      // Example usage:
      // Assuming you have a Google Map instance named 'map' and your JSON data named 'polylineData'
      
    renderCircuit(data){
        console.time('time3')
        var self=this
        console.log(data)

            data.forEach((item) => {
                const coordinates = item.geom
                .replace("MULTILINESTRING((", "")
                .replace("))", "")
                .split(",");
                
            var coor=[]
            var coor2=[]
            for(var i=0;i<coordinates.length;i++){
                 coor.push(coordinates[i].toString().split(" "))
                 coor2.push({lat: parseFloat(coor[i][1]),lng: parseFloat(coor[i][0])})
                }
                
                
                
                const line = new google.maps.Polyline({
                    path: coor2,
                    strokeColor: item.color, // Line color
                    strokeOpacity: 1.0,
                    strokeWeight: 2, // Line width
                    map: this.map,
                });
                self.circuit_marker_list.push(line)
            
            });
    
            
            console.timeEnd('time3')
        }

        
        delete_old_marker3() {
            if(this.circuit_marker_list!=[] || this.circuit_marker_list !=null)
        for (var i = 0; i < this.circuit_marker_list.length; i++) {
    this.circuit_marker_list[i].setMap(null);
    
} 
}

    createNestedData2(vehicles, groups) {
        let temp = [];
        vehicles.forEach(vehicule =>{
            temp.push({id: 'c-'+vehicule.id, group: vehicule.group, name: vehicule.name })
        })
        vehicles=temp;
        console.log(vehicles)
        var self=this;
        const topLevelGroups = groups.filter((group) => !group.groupid);

        const buildTree = (groupId) => {
            const children = groups
                .filter((group) => group.groupid[0] === groupId)
                .map((group) => ({
                    id: group.id.toString(),
                    text: '<span class="semigroup_name1">' + group.name + ' </span>',
                    children: [
                        ...buildTree(group.id),
                        ...buildVehicles(group.id, group.id),
                    ],
                    type: 'group',
                    icon: 'none',
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
                   
                    // <img class="vehicle-icon" id="${vehicle.device}" src="/fleet_monitoring/static/img/vehicules/pied.png">
                    return {
                        id: vehicle.id.toString(),
                        text: `<div class="vehicle-node1"><span class="vehicle-device">${vehicle.name}</span> <div class="imgblock" ><img class="vehicle-icon clickable2" id="${vehicle.name}" src="/fleet_monitoring/static/img/vehicules/pied.png"> </div></div>`,
                        type: 'circuit',
                        icon: 'none',
                    };
                });

                return groupVehicles;
            };
            
            $(document).on('click', '.clickable2', async (event) => {
                if(window.screen.width<470){
                
                    self.i=!self.i;
                    self.vehiculeListVisiblity();
                }
                clearInterval(this.interval5)
                
                this.delete_old_marker()
                delete_zones_Daki(this.zones,this.labelZone)
                this.delete_old_marker3();
                    // self.showBacs=false
                    // self.state.vehicles = self.vehiculesT.filter(vehicule => vehicule.device == event.target.id)
                    console.time('timer4')
                    var vehPlan=await rpc.query({
                        model: 'fleet.vehicle',
                        method: 'vehicules_with_icons',
                        args: [[]]
                    });
                    console.timeEnd('timer4')
                    self.singleSelection = false;
                    self.firstCall=true;
                    console.time('timer2')
                    console.time('timer1')
                    var v = this.vehiculesT = await rpc.query({
                        model: 'fleet_vehicle.circuit_view',
                        method: 'getCircuits',
                        args: [[],event.target.id]
                    });
                    console.timeEnd('timer1')
                    
                    
                    var result = await rpc.query({
                        model: 'fleet_vehicle.planing_view',
                        method: 'getplaning',
                        args: [[],event.target.id,new Date()]
                    });
            
                    // self.render()
                    
                    var vehplan2=[]
                    result.forEach(resultat=>{
                        vehplan2.push(vehPlan.filter(vehic=>vehic.device==resultat.vehname)[0])
                    })
                    this.state.vehicles=vehplan2;
                    this.render();
                    renderCircuit(event.target.id,this.circuit_marker_list,this.map,1)
                    // this.renderCircuit(v)
                    this.get_map_data()
                    
                    console.timeEnd('timer2')
                    
                    var time = this.intervale //Seconds
                    time = time*1000
                    
                    
                    this.interval5 = window.setInterval(async function(){
                        
                        
                        var vehPlan=await rpc.query({
                            model: 'fleet.vehicle',
                            method: 'vehicules_with_icons',
                            args: [[]]
                        });
                        
                        
                        var v = self.vehiculesT = await rpc.query({
                            model: 'fleet_vehicle.circuit_view',
                            method: 'getCircuits',
                            args: [[],event.target.id]
                        });
                        
                        
                        var result = await rpc.query({
                            model: 'fleet_vehicle.planing_view',
                            method: 'getplaning',
                            args: [[],event.target.id,new Date()]
                        });
                        
                        
                        var vehplan2=[]
                        result.forEach(resultat=>{
                        vehplan2.push(vehPlan.filter(vehic=>vehic.device==resultat.vehname)[0])
                    })

                    if(self.state.vehicles.length!=vehplan2.length){
                        self.firstCall=true
                    }else{
                        var dif=0
                        self.state.vehicles.forEach(veh=>{
                            if(vehplan2.filter(veha=>veha.device == veh.device).length<=0){
                                dif=1
                                return
                            }
                        })
                        if(dif==1){self.firstCall=true}
                        
                    }
                    
                    self.state.vehicles=vehplan2;
                    self.render();
                    self.get_map_data()
                    
                }, time);
                    // self.singleSelection = true;
                    // this.firstCall=true
                    // self.get_map_data(self.state.vehicles);
                    // self.VehiculeInfoPopUp()
        });
        

        const groupNodes = topLevelGroups.map((group) => ({
            id: group.id.toString(),
            text: '<span class="group_name">' + group.name + ' </span>',
            children: [...buildTree(group.id), ...buildVehicles(group.id, group.id)],
            type: 'group',
            icon: 'none',
        }));

        const nestedData = groupNodes;
        
        return nestedData;
    }

    async treeJs(){
        this.loadScript(
            'https://cdnjs.cloudflare.com/ajax/libs/jstree/3.2.1/jstree.min.js'
        );

        var self = this;
        var vehicules = [];
        var circuits = [];
        var groups = [];
        await rpc.query({
            model: 'is_rfid.circuit',
            method: 'getCircuits',
            args: [[]],
        }).then(result => {
            circuits = result;
        }),
        // Fetch vehicle and group data
        await Promise.all([
            rpc.query({
                model: 'fleet.vehicle',
                method: 'get_map_data2',
                args: [[]],
            }).then(result => {
                vehicules = result;
            }),
            rpc.query({
                model: 'fleet.vehicle.group',
                method: 'get_map_data2',
                args: [[]],
            }).then(result => {
                groups = result;
            })
        ]);
        
        try {
            
            localStorage.removeItem('jstree');
  
            const nestedData = this.createNestedData(vehicules, groups);
            var a
            $("#vehicules3")
                .jstree({
                    core: {
                        //   check_callback: true,
                        data: nestedData,
                        themes: {
                            responsive: true,
                        },
                    },
                    checkbox: {
                        //   cascade: 'up',
                        keep_selected_style: true,
                        three_state: true,
                        whole_node: true,
                        tie_selection: false,
                    },
                    plugins: [
                        'wholerow',
                        'contextmenu',
                        // 'dnd',
                        'search',
                        'state',
                        'types',
                        'wholerow',
                        // 'checkbox',
                    ],
                })
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

            $('#searchInputRef').on('input', (e) => {
                const searchString = e.target.value;
                $('#vehicules3').jstree('search', searchString);
            });
        } catch (error) {
            console.error('Error loading tree script:', error);
        }

        $('#searchInputRef').on('input', (e) => {
            const searchString = e.target.value;
            $('#vehicules3').jstree('search', searchString);
        });

    }

    createNestedData(vehicles, groups) {
        var self=this;
        const topLevelGroups = groups.filter((group) => !group.groupid);

        const buildTree = (groupId) => {
            const children = groups
                .filter((group) => group.groupid[0] === groupId)
                .map((group) => ({
                    id: group.id.toString(),
                    text: '<span class="semigroup_name1">' + group.name + ' </span>',
                    children: [
                        ...buildTree(group.id),
                        ...buildVehicles(group.id, group.id),
                    ],
                    type: 'group',
                    icon: 'none',
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
                    var imageSrc = "/fleet_monitoring/static/img/vehicules/" + "pv" + ".png"
                    if(vehicle.last_update){
                        const timestamp1 = new Date();
                    const timestamp2 = new Date(vehicle.last_update.toString().replace('T', ' '));
            
                    // Calculate the time difference in milliseconds
                    const timeDifference = Math.abs(timestamp2 - timestamp1);
            
                    // Convert milliseconds to hours and days
                    const hoursDifference = timeDifference / (1000 * 60 * 60); // 1 hour = 3600000 milliseconds
                    const daysDifference = hoursDifference / 24;
                    const isToday = timestamp1 === timestamp2;
            
                    // Define your conditions
                     imageSrc = '';
                    if (vehicle.vehicle_icon_id[1] === "CHARIOT") {
                        if (hoursDifference < 1) {
                            imageSrc = "/fleet_monitoring/static/img/vehicules/" + "pv" + ".png";
                        } else if (hoursDifference >= 1 && daysDifference < 1) {
                            imageSrc = "/fleet_monitoring/static/img/vehicules/po.png";
                        } else {
                            imageSrc = "/fleet_monitoring/static/img/vehicules/pr.png";
                        }
                    } else if (vehicle.vehicle_icon_id[1] !== "CHARIOT") {
                        imageSrc = "/fleet_monitoring/static/img/vehicules/acc.png";
                        if (vehicle.lacc === "1") {
                            imageSrc = "/fleet_monitoring/static/img/vehicules/acc.png";
                            if (vehicle.last_speed !== "0") {
                                imageSrc = "/fleet_monitoring/static/img/vehicules/acc-vitesse.png";
                            }
                        } else {
                            if (isToday) {
                                if (hoursDifference <= 1) {
                                    imageSrc = "/fleet_monitoring/static/img/vehicules/no-acc-orange.png";
                                } else {
                                    imageSrc = "/fleet_monitoring/static/img/vehicules/no-acc-rouge.png";
                                }
                            } else {
                                imageSrc = "/fleet_monitoring/static/img/vehicules/point-exclamation-rouge.png";
                            }
                        }
                    }
                    }
                    
                    // <img class="vehicle-icon" id="${vehicle.device}" src="/fleet_monitoring/static/img/vehicules/pied.png">
                    return {
                        id: vehicle.id.toString(),
                        text: `<div class="vehicle-node1"><span class="vehicle-device">${vehicle.device}</span> <div class="imgblock" ><img class="vehicle-icon" src="${imageSrc}"><img class="vehicle-icon clickable" id="${vehicle.device}" src="/fleet_monitoring/static/img/vehicules/pied.png"> </div></div>`,
                        type: 'vehicle',
                        icon: 'none',
                    };
                });

            return groupVehicles;
        };

        $(document).on('click', '.clickable', async (event) => {
            if(window.screen.width<470){
                
                self.i=!self.i;
                self.vehiculeListVisiblity();
            }
                    self.showBacs=false
                    self.state.vehicles = self.vehiculesT.filter(vehicule => vehicule.device == event.target.id)
                    self.render()
                    
                   
                    self.singleSelection = true;
                    this.firstCall=true
                    self.get_map_data(self.state.vehicles);
                    self.VehiculeInfoPopUp()
        });


        const groupNodes = topLevelGroups.map((group) => ({
            id: group.id.toString(),
            text: '<span class="group_name">' + group.name + ' </span>',
            children: [...buildTree(group.id), ...buildVehicles(group.id, group.id)],
            type: 'group',
            icon: 'none',
        }));

        const nestedData = groupNodes;
        
        return nestedData;
    }


    barClick(event) {
        const elements = getElementAtEvent(chartref.current, event);
       
        // if (elements.length > 0) {
       
        // }
    }

    attachEventHandlers(element) {
            var self=this
        if(element==document.getElementById("vehicules3")){
            
            
                   
        
            images.forEach(image => {
                
                image.addEventListener('click', function() {
                    self.state.vehicles = vehicules.filter(vehicule => vehicule.device == image.id)
                    self.render()
                    
                    const vehiculeDiv = document.getElementById("vehicules");
                    var checkboxes = vehiculeDiv.querySelectorAll("input[type='checkbox']");
                    checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                    self.singleSelection = true;
                    self.get_map_data(self.state.vehicles);
                    self.VehiculeInfoPopUp()
                });
                image.addEventListener('touchend', function() {
                    self.state.vehicles = vehicules.filter(vehicule => vehicule.device == image.id)
                    self.render()
                    
                    const vehiculeDiv = document.getElementById("vehicules");
                    var checkboxes = vehiculeDiv.querySelectorAll("input[type='checkbox']");
                    checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                    self.singleSelection = true;
                    self.get_map_data(self.state.vehicles);
                    self.VehiculeInfoPopUp()
                });
            });
           
        }
                
            }




    async getVehicleTree() {
        var self = this;
        var vehicules = [];
        var groups = [];
    
        // Fetch vehicle and group data
        await Promise.all([
            rpc.query({
                model: 'fleet.vehicle',
                method: 'get_map_data2',
                args: [[]],
            }).then(result => {
                vehicules = result;
            }),
            rpc.query({
                model: 'fleet.vehicle.group',
                method: 'get_map_data2',
                args: [[]],
            }).then(result => {
                groups = result;
            })
        ]);
    
        // Organize groups into a hierarchical structure
        const rootGroups = groups.filter(group => !group.groupid || group.groupid === "");
    
        // Create the top-level container for the tree
        const treeContainer = document.getElementById('vehicules');
        const treeContainer2 = document.getElementById('vehicules2');
        treeContainer.innerHTML = ''; // Clear existing content
        const vehiculeElement123 = document.createElement('div');
        vehiculeElement123.style.paddingLeft ="10px";
        vehiculeElement123.id="original_tree";
        treeContainer.appendChild(vehiculeElement123);
    
        // Generate the tree structure
        rootGroups.forEach(rootGroup => {
            const groupElement = document.createElement('ul');
            const detailsElement = document.createElement('details');
            const summaryElement = document.createElement('summary');
            summaryElement.textContent = rootGroup.name;
            
            const groupCheckbox = document.createElement('input');
            groupCheckbox.type = 'checkbox';
            groupCheckbox.id = rootGroup.id;
            groupCheckbox.style.marginRight = '5px';
            groupCheckbox.style.verticalAlign = 'middle';
            groupCheckbox.style.display="none"
            groupCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    var groupsch =  groups.filter(group =>  group.groupid[0] == rootGroup.id);
                    
                    groupsch.forEach(groupch=>{
                        document.getElementById("check-"+groupch.id).checked = true;
                    })
                    var vehiculesch =[]
                    groupsch.forEach(groupch=>{
                    vehiculesch =  vehiculesch.concat(vehicules.filter(vehiculech=> vehiculech.vehicle_group_id[0] == groupch.id))
                    })
                        
                    var grandchgroups=[]
                    groupsch.forEach(groupch=>{
                        grandchgroups =  groups.filter(group =>  group.groupid[0] == groupch.id);
                        
                        

                        if(grandchgroups.length>=0){
                            grandchgroups.forEach(groupch=>{
                                document.getElementById("check-"+groupch.id).checked = true;
                                vehiculesch =  vehiculesch.concat(vehicules.filter(vehiculech=> vehiculech.vehicle_group_id[0] == groupch.id))
                                })

                        }

                        })


                    vehiculesch.forEach(vehiculech=>{
                        document.getElementById(vehiculech.device).checked = true;
                    })
                    
                    self.state.vehicles = self.state.vehicles.concat(vehiculesch)
                    self.render();
                    self.get_map_data(self.state.vehicles);
                    

                } else {
                    var groupsch =  groups.filter(group =>  group.groupid[0] === rootGroup.id);

                    groupsch.forEach(groupch=>{
                        document.getElementById("check-"+groupch.id).checked = false;
                    })
                    var vehiculesch =[]
                    groupsch.forEach(groupch=>{
                    vehiculesch =  vehiculesch.concat(vehicules.filter(vehiculech=> vehiculech.vehicle_group_id[0] == groupch.id))
                    })
                    
                    var grandchgroups=[]
                    groupsch.forEach(groupch=>{
                        grandchgroups =  groups.filter(group =>  group.groupid[0] == groupch.id);
                        
                        

                        if(grandchgroups.length>=0){
                            grandchgroups.forEach(groupch=>{
                                document.getElementById("check-"+groupch.id).checked = false;
                                vehiculesch =  vehiculesch.concat(vehicules.filter(vehiculech=> vehiculech.vehicle_group_id[0] == groupch.id))
                                })

                        }

                        })

                    vehiculesch.forEach(vehiculech=>{
                        document.getElementById(vehiculech.device).checked = false;
                    })
                    self.state.vehicles=vehiculesch.filter(vehicule=>!self.state.vehicles.includes(vehicule));
                    self.render();
                    
                    if(self.state.vehicles.length<=0){
                        
                        self.get_map_data();
                        

                    }else{
                        self.get_map_data(self.state.vehicles);
                        
                        
                    }
                }
                
                // Update the rendering
                // self.render();
                // self.get_map_data(self.state.vehicles);
            });

            summaryElement.insertBefore(groupCheckbox,summaryElement.firstChild);


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
            
    if(element==document.getElementById("vehicules")){
        
        const checkboxes = element.querySelectorAll('input[type="checkbox"]');
            const images = element.querySelectorAll('img');
        checkboxes.forEach(checkbox => {
            
        if(isNaN(parseInt(checkbox.id))){
            if (checkbox.id.includes("check-")){
                
                checkbox.addEventListener('change', function() {
                    var c=checkbox.id.split('-')
                    
                if (this.checked) {
                    var groupsch =  groups.filter(group =>  group.groupid[0] == c[1]);
                    
                    groupsch.forEach(groupch=>{
                        document.getElementById("check-"+groupch.id).checked = true;
                    })
                    var vehiculesch =[]
                    if(groupsch.length<=0){
                        
                            vehiculesch =  vehiculesch.concat(vehicules.filter(vehiculech=> vehiculech.vehicle_group_id[0] == c[1]))
                        
                    }else{
                        groupsch.forEach(groupch=>{
                    vehiculesch =  vehiculesch.concat(vehicules.filter(vehiculech=> vehiculech.vehicle_group_id[0] == groupch.id || vehiculech.vehicle_group_id[0] == c[1]))
                    })
                    }
                    
                    vehiculesch.forEach(vehiculech=>{
                        document.getElementById(vehiculech.device).checked = true;
                    })
                    self.state.vehicles = self.state.vehicles.concat(vehiculesch)
                    self.render();
                    self.get_map_data(self.state.vehicles);
                    
    
                } else {
                    var groupsch =  groups.filter(group =>  group.groupid[0] == c[1]);
                    
                    groupsch.forEach(groupch=>{
                        document.getElementById("check-"+groupch.id).checked = false;
                    })
                    var vehiculesch =[]
                    if(groupsch.length<=0){
                        
                        vehiculesch =  vehiculesch.concat(vehicules.filter(vehiculech=> vehiculech.vehicle_group_id[0] == c[1]))
                    
                }else{
                    groupsch.forEach(groupch=>{
                vehiculesch =  vehiculesch.concat(vehicules.filter(vehiculech=> vehiculech.vehicle_group_id[0] == groupch.id || vehiculech.vehicle_group_id[0] == c[1]))
                })
                }
                    vehiculesch.forEach(vehiculech=>{
                        document.getElementById(vehiculech.device).checked = false;
                    })
                    self.state.vehicles=vehiculesch.filter(vehicule=>!self.state.vehicles.includes(vehicule));
                    self.render();
                    
                    if(self.state.vehicles.length<=0){
                        
                        self.get_map_data();
                        
    
                    }else{
                        self.get_map_data(self.state.vehicles);
                        
                        
                    }
                }})
            }else {

                checkbox.addEventListener('change', function() {
                    if (this.checked) {
                        if(self.singleSelection == true){
                            self.state.vehicles = vehicules.filter(vehicule => vehicule.device == checkbox.id);   
                        }else{
                            
                            self.state.vehicles = self.state.vehicles.concat(vehicules.filter(vehicule => vehicule.device == checkbox.id));  
                        }
                        
                        self.render();
    
                        self.singleSelection = false;
                        self.get_map_data(self.state.vehicles);
                        
                        // Your handling code here
                    } else {
                        
                        self.state.vehicles = self.state.vehicles.filter(vehicule => vehicule.device != checkbox.id);
                        self.render();
                        if(self.state.vehicles.length <=0){
                            self.get_map_data();
                           
                           
                        }else{
                            
                            self.get_map_data(self.state.vehicles);
                            
                        }
                    }
                });
            }
        }
        });
    
        images.forEach(image => {
            image.addEventListener('click', function() {
                self.state.vehicles = vehicules.filter(vehicule => vehicule.device == image.id)
                self.render()
                
                const vehiculeDiv = document.getElementById("vehicules");
                var checkboxes = vehiculeDiv.querySelectorAll("input[type='checkbox']");
                checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
                self.singleSelection = true;
                self.get_map_data(self.state.vehicles);
                self.VehiculeInfoPopUp()
            });
            image.addEventListener('touchend', function() {
                self.state.vehicles = vehicules.filter(vehicule => vehicule.device == image.id)
                self.render()
                
                const vehiculeDiv = document.getElementById("vehicules");
                var checkboxes = vehiculeDiv.querySelectorAll("input[type='checkbox']");
                checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
                self.singleSelection = true;
                self.get_map_data(self.state.vehicles);
                self.VehiculeInfoPopUp()
            });
        });
       
    }else{
        const checkboxes = element.querySelectorAll('input[type="checkbox"]');
        
            const images = element.querySelectorAll('img');
        checkboxes.forEach(checkbox => {
            
            checkbox.addEventListener('change', function() {
                const vehicleId = checkbox.id.substring(7);
                if (this.checked) {
                    
                    
                    // Check if the vehicle is not already in the array
                    if(self.singleSelection == true){
                        if (!self.state.vehicles.some(vehicule => vehicule.device === vehicleId)) {
                            self.state.vehicles = vehicules.filter(vehicule => vehicule.device == checkbox.id);
                        }
                         
                    }else{
                        if (!self.state.vehicles.some(vehicule => vehicule.device === vehicleId)) {
                            self.state.vehicles.push(...vehicules.filter(vehicule => vehicule.device === vehicleId));
                        }
                    }
                    
                    document.getElementById(vehicleId).checked=true;
                    self.render();
                    self.singleSelection = false;
                    
                    self.get_map_data(self.state.vehicles);
                    
                }
                 else {
                    
                    self.state.vehicles = self.state.vehicles.filter(vehicule => vehicule.device != checkbox.id.substring(7));
                    self.render();
                    document.getElementById(vehicleId).checked=false;
                    if(self.state.vehicles.length <=0){
                        self.get_map_data();
                        
                       
                    }else{
                       
                        self.get_map_data(self.state.vehicles);
                        
                    }
                }
            });
        });

        images.forEach(image => {
            image.addEventListener('click', function() {
                const vehicleId = image.id.substring(7);
                // Your handling code here

                self.state.vehicles = vehicules.filter(vehicule => vehicule.device == vehicleId)
                self.render()
                
                const vehiculeDiv = document.getElementById("vehicules");
                var checkboxes = vehiculeDiv.querySelectorAll("input[type='checkbox']");
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
                self.singleSelection = true;
                self.get_map_data(self.state.vehicles);
                self.VehiculeInfoPopUp()
            
            });
            image.addEventListener('touchend', function() {
                const vehicleId = image.id.substring(7);
                // Your handling code here

                self.state.vehicles = vehicules.filter(vehicule => vehicule.device == vehicleId)
                self.render()
                
                const vehiculeDiv = document.getElementById("vehicules");
                var checkboxes = vehiculeDiv.querySelectorAll("input[type='checkbox']");
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
                self.singleSelection = true;
                self.get_map_data(self.state.vehicles);
                self.VehiculeInfoPopUp()
            
            });
        });
    }
            
        }
    
        // Attach event handlers for the entire tree structure
        attachEventHandlers(treeContainer);


         // Search bar
         var divsearch =document.createElement('div');
         const searchBar = document.createElement('input');
         searchBar.type = 'text';
         searchBar.type = 'text';
         searchBar.placeholder = 'Search vehicles...';
         divsearch.style.marginTop = '10px';
         divsearch.style.marginBottom = '10px';
         divsearch.style.marginRight = '10px';
         divsearch.style.marginLeft = '10px';
         divsearch.appendChild(searchBar)
         
         searchBar.addEventListener('input', event => {
             const searchText = event.target.value.toLowerCase();
             const filteredVehicles = vehicules.filter(vehicule => vehicule.device.toLowerCase().includes(searchText));
         
             // Create a new container for the filtered tree
             const filteredTreeContainer = document.createElement('div');
             filteredTreeContainer.style.paddingLeft = '10px';
         if(searchText==""||searchText==null){
                treeContainer2.style.display="none";
                vehiculeElement123.style.display="block";
                treeContainer2.innerHTML="";
         }else{
            treeContainer2.style.display="block";
            while (treeContainer2.firstChild) {
                treeContainer2.removeChild(treeContainer2.firstChild);
            }
            
            vehiculeElement123.style.display="none";
         }
             filteredVehicles.forEach(vehicle => {
                 const vehicleElement = document.createElement('div');
                 vehicleElement.style.marginBottom = '5px';
                 const leftContent = document.createElement('div');
                 const rightContent = document.createElement('div');
                 const vehicleName = document.createElement('div');
                 const checkbox = document.createElement('input');
                 const image1 = document.createElement('img');
                 const image2 = document.createElement('img');
         
                 // Set attributes for vehicleName
                 vehicleName.style.display = 'inline';
                 vehicleName.textContent = vehicle.device;
         
                 // Set checkbox attributes
            checkbox.type = 'checkbox';
            checkbox.id = "search-"+vehicle.device;
            checkbox.style.display = 'inline';
            checkbox.style.display = 'none';
            checkbox.style.marginRight = "3px";
            checkbox.style.marginLeft = "3px";
                
                // Set images' attributes
                image1.src = "/fleet_monitoring/static/img/vehicules/pv.png"; // Replace with the actual image URL
                if(vehicle.last_update){
                    const timestamp1 = new Date();
                    const timestamp2 = new Date(vehicle.last_update.toString().replace('T', ' '));;

                    // Calculate the time difference in milliseconds
                    const timeDifference = Math.abs(timestamp2 - timestamp1);

                    // Convert milliseconds to hours and days
                    const hoursDifference = timeDifference / (1000 * 60 * 60); // 1 hour = 3600000 milliseconds
                    const daysDifference = hoursDifference / 24;
                    var isToday = timestamp1 === timestamp2;

                    // Define your conditions
        if(vehicle.vehicle_icon_id[1]=="CHARIOT"){
            if (hoursDifference < 1) {
                image1.src = "/fleet_monitoring/static/img/vehicules/"+"pv"+".png"; 

            } else if (hoursDifference >= 1 && daysDifference < 1) {
                image1.src = "/fleet_monitoring/static/img/vehicules/po.png"; 

            } else {
                image1.src = "/fleet_monitoring/static/img/vehicules/pr.png"; 

            }
        }else if(vehicle.vehicle_icon_id[1]!="CHARIOT"){
            image1.src = "/fleet_monitoring/static/img/vehicules/acc.png"; 
            if (vehicle.lacc == "1") {
                image1.src = "/fleet_monitoring/static/img/vehicules/acc.png"; 
                if(vehicle.last_speed !="0"){
                    image1.src = "/fleet_monitoring/static/img/vehicules/acc-vitesse.png"; 
                }

            } else {
                if (isToday) {

                    if(hoursDifference <=1){
                        
                        image1.src = "/fleet_monitoring/static/img/vehicules/no-acc-orange.png"; 
                    }else{
                        image1.src = "/fleet_monitoring/static/img/vehicules/no-acc-rouge.png";
                    }

            } else {
                image1.src = "/fleet_monitoring/static/img/vehicules/point-exclamation-rouge.png"; 

            }
        }
        }
            
        }
                image1.style.width = '20px'; // Adjust the width as needed
                image1.style.marginRight = '5px'; // Adjust the width as needed
                image2.src = "/fleet_monitoring/static/img/vehicules/pied.png";
                image2.id = "search-"+vehicle.device;
                image2.style.width = '20px'; // Adjust the width as needed
                image2.style.cursor = 'pointer'; // Adjust the width as needed
         
                 // Append elements to containers
                 leftContent.appendChild(checkbox);
                 leftContent.appendChild(vehicleName);
                 rightContent.appendChild(image1);
                 rightContent.appendChild(image2);
         
                 // Apply flex styles to containers
                 vehicleElement.style.display = 'flex';
                 vehicleElement.style.alignItems = 'center';
                 vehicleElement.style.width = '100%';
                 vehicleElement.style.justifyContent = 'space-between';
                 leftContent.style.display = 'flex';
                 leftContent.style.alignItems = 'center';
                 rightContent.style.display = 'flex';
                 rightContent.style.alignItems = 'center';
         
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
        const childGroups = allGroups.filter(childGroup => childGroup.groupid[0] === group.id);
        const groupVehicles = vehicules.filter(vehicule => vehicule.vehicle_group_id[0] === group.id);
       
        const childrenHTML = childGroups.map(childGroup => {
            const nextLevelChildren = allGroups.filter(group => group.groupid === childGroup.idd);
            const childGroupElement = document.createElement('ul');
            const childDetailsElement = document.createElement('details');
            const childSummaryElement = document.createElement('summary');
            childSummaryElement.textContent = childGroup.name;

            const groupCheckbox = document.createElement('input');
            groupCheckbox.type = 'checkbox';
            groupCheckbox.id = "check-"+childGroup.id;
            groupCheckbox.style.marginRight = '5px';
            groupCheckbox.style.verticalAlign = 'middle';
            groupCheckbox.style.display = 'none';
        
            
            

            childSummaryElement.insertBefore(groupCheckbox,childSummaryElement.firstChild);

            const childChildrenHTML = this.generateGroupHTML(childGroup, allGroups, vehicules);
            childGroupElement.innerHTML = childChildrenHTML;
    
            childDetailsElement.appendChild(childSummaryElement);
            childDetailsElement.appendChild(childGroupElement);
            return childDetailsElement;
        });

         // Create a checkbox for the current group
    
    
        const vehiclesHTML = groupVehicles.map(vehicle => {
            const vehicleElement = document.createElement('li');
            vehicleElement.style.marginBottom = "5px";
            const vehicleElement2 = document.createElement('div');
            const leftContent = document.createElement('div'); // Container for checkbox and name
            const rightContent = document.createElement('div'); // Container for images
            const vehicleName = document.createElement('div');
            const checkbox = document.createElement('input'); // Use <input> for checkboxes
            const image1 = document.createElement('img'); // First image
            const image2 = document.createElement('img'); // Second image
            
            // Set checkbox attributes
            checkbox.type = 'checkbox';
        checkbox.id = vehicle.device;
        checkbox.style.display = 'inline';
        checkbox.style.marginRight = "3px";
        checkbox.style.marginLeft = "3px";
        checkbox.style.display = "none";
            
            // Set images' attributes
            image1.src = "/fleet_monitoring/static/img/vehicules/pv.png"; 
            if(vehicle.last_update){
                        const timestamp1 = new Date();
                        const timestamp2 = new Date(vehicle.last_update.toString().replace('T', ' '));;

                        // Calculate the time difference in milliseconds
                        const timeDifference = Math.abs(timestamp2 - timestamp1);

                        // Convert milliseconds to hours and days
                        const hoursDifference = timeDifference / (1000 * 60 * 60); // 1 hour = 3600000 milliseconds
                        const daysDifference = hoursDifference / 24;
                        var isToday = timestamp1 === timestamp2;

                        // Define your conditions
            if(vehicle.vehicle_icon_id[1]=="CHARIOT"){
                if (hoursDifference < 1) {
                    image1.src = "/fleet_monitoring/static/img/vehicules/"+"pv"+".png"; 

                } else if (hoursDifference >= 1 && daysDifference < 1) {
                    image1.src = "/fleet_monitoring/static/img/vehicules/po.png"; 

                } else {
                    image1.src = "/fleet_monitoring/static/img/vehicules/pr.png"; 

                }
            }else if(vehicle.vehicle_icon_id[1]!="CHARIOT"){
                image1.src = "/fleet_monitoring/static/img/vehicules/acc.png"; 
                if (vehicle.lacc == "1") {
                    image1.src = "/fleet_monitoring/static/img/vehicules/acc.png"; 
                    if(vehicle.last_speed !="0"){
                        image1.src = "/fleet_monitoring/static/img/vehicules/acc-vitesse.png"; 
                    }

                } else {
                    if (isToday) {

                        if(hoursDifference <=1){
                            
                            image1.src = "/fleet_monitoring/static/img/vehicules/no-acc-orange.png"; 
                        }else{
                            image1.src = "/fleet_monitoring/static/img/vehicules/no-acc-rouge.png";
                        }

                } else {
                    image1.src = "/fleet_monitoring/static/img/vehicules/point-exclamation-rouge.png"; 

                }
            }
            }
                
            }
            
            image1.style.width = '20px'; // Adjust the width as needed
            image1.style.marginRight = '5px'; // Adjust the width as needed
            image2.src = "/fleet_monitoring/static/img/vehicules/pied.png";
            image2.id = vehicle.device;
            image2.style.width = '20px'; // Adjust the width as needed
            image2.style.cursor = 'pointer'; // Adjust the width as needed
            
           
            

            

            // Set vehicle name
            vehicleName.style.display = 'inline';
            vehicleName.textContent = vehicle.device;
            
            // Apply flex styles to the vehicle element container
            vehicleElement2.style.display = 'flex';
            vehicleElement2.style.alignItems = 'center'; // Center items vertically
            vehicleElement2.style.width = '100%';
            vehicleElement2.style.justifyContent = 'space-between'; // Space between items
            
            // Apply flex styles to left and right content containers
            leftContent.style.display = 'flex';
            leftContent.style.alignItems = 'center'; // Center items vertically
            rightContent.style.display = 'flex';
            rightContent.style.alignItems = 'center'; // Center images vertically
            
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
        
        
    
        return [...childrenHTML, ...vehiclesHTML].map(element => element.outerHTML).join('');
    }
    
    
    
    

    

    async loadGoogleMapsAPI() {
        var api_key
        
        try {
            var result = await rpc.query({
                model: 'res.config.settings',
                method: 'get_map_api_key',
                args: [[]]
            });
            if(result){api_key=result;}
            
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
        await this.loadJquery();
        $('head').append(`<link href="${window.location.origin}/is_temp_reel/static/css/map_view.css"" rel="stylesheet" id="newcss" />`);

        try {
            // await this.loadGoogleMapsAPI();
    
    
            const {Map,Marker} = await window.google.maps.importLibrary("maps");
    
             this.map = new Map( document.getElementById('mapid') ,//this.mapContainerRef.el,
            {
            center: { lat: 33.964451, lng: -6.842338 },
            zoom: 12,
            gestureHandling: 'greedy'
            });
           
    
    
        }catch (error) {
           
            
        }
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

        async  get_bacs_data(device) {
            var self = this
            this.delete_old_marker2()
            try {
                var result = await rpc.query({
                    model: 'fleet.vehicle',
                    method: 'get_bacs',
                    args: [[]]
                });
        
                self.delete_old_marker2();
                self.render_bacs_data(result,device);
            } catch (error) {
                console.error(error);
            }
        }


        async lazyBacRenderer(){
            try {
                var data = await rpc.query({
                    model: 'is_bacs.icon_view',
                    method: 'get_icon2',
                    args: [[]]
                });
            } catch (error) {
                console.error(error);
            }

            var self = this;
            var img = {
                url: "/fleet_monitoring/static/img/vehicules/bacmetal_orange.png",
                scaledSize: new google.maps.Size(40, 40)
            };

            var ic1;
            var response = await rpc.query({
                     model: 'fleet.vehicle',
                   method: 'get_icon_icon2',
                        args:[[]],
            }).then(async function(result) {
                        ic1=result;
                   
                        
                    }); 

                    for (var i = 0; i < data.length; i++) {
                        img.url="/fleet_monitoring/static/img/vehicules/bacmetal_orange.png";
            
                        var contentString = '<div><p>Num: </p><span>' + data[i].numbac + '</span><br/><p>Num: </p><span>'+ data[i].numpark + '</span></div>';
                        
                        
                        if(data[i].typeb){
                            var icons=[];
                            try{
                            // var response = await rpc.query({
                            //     model: 'fleet.vehicle',
                            //     method: 'get_icon',
                            //     args:[[],data[i].numbac],
                            // }).then(async function(result) {
                            //     icons=result;
                                
                                
                            // });
        
                            // var response = await rpc.query({
                            //     model: 'fleet.vehicle',
                            //     method: 'get_icon2',
                            //     args:[[],data[i].numbac],
                            // }).then(async function(result) {
                            //     icons=result;
                                
                                
                            // });
                        }catch(error){
                            console.error(error)
                        }
                            const container = document.getElementById('mapid');
            
                            const buttonex =document.getElementById(`btn-open-form-${data[i].idbac}`)
            
                            
            
                            const button = document.createElement('button');
                button.classList.add('btn', 'btn-primary', `btn-open-form-bac-${data[i].idbac}`);
                button.style.width = '80px';
                button.style.height = '26px';
                button.textContent = 'Open';
                button.id=data[i].id;
                button.dataset.vehicleId = data[i].id;
                
                
                const button2 = document.createElement('button');
                button2.style.margintop="15px"
                button2.classList.add('btn', 'btn-primary', `btn-open-map-bac-${data[i].idbac}`);
                button2.style.width = '80px';
                button2.style.height = '26px';
                button2.textContent = 'navigate';
                button2.id=data[i].id;
                button2.dataset.vehicleId = data[i].id;
                
                
          
                
                // var response = await rpc.query({
                //     model: 'fleet.vehicle',
                //     method: 'get_icon_icon',
                //     args:[[],icons.icon[1]],
                // }).then(async function(result) {
                //     ic=result;
                    
                    
                // });
        
                
           
             
                
             
        
             
        
            //    var  ic = ic1.filter(icc => data[i].typeb[1].replaceAll(' ','').includes(icc.name.replaceAll(' ','')));
        
               
            
                            contentString =`
                            <div style="display: flex;">
                                <div style="display: flex; flex-direction: column; align-items: center; padding-right: 10px;">
                                    <img class="img img-fluid" alt="Fichier binaire"
                                    src="/fleet_monitoring/static/img/vehicules/bacs/${data[i].img_green}"
                                        name="image_128"
                                        style="width: 50px; height: 50px; object-fit: cover; margin-bottom: 5px;">
                                        ${button.outerHTML} <br>${button2.outerHTML}
            
                                </div>
                                <div style="flex: 1;">`;
            
                            // if(data[i].vehicle_icon_id[1]=="CHARIOT"){
                                contentString += `<div><p>Num: </p><br><span>' + ${data[i].numbac }+ '</span><br><p>Num park: </p><br><span>'+ ${data[i].numpark} + '</span></div>`;
                            // }else if (data[i].vehicle_icon_id[1] === "CAMION") {
                            //     contentString += `<p>Vehicule: ${data[i].device}</p><span> Type: ${data[i].vehicle_icon_id[1]}</span><br><span> Matricule: ${data[i].license_plate || ''}</span><br><span> Marque: ${data[i].model_id[1]}</span><br><span> Kilometrage: ${data[i].odometer}</span><br><span> Nombre heures: ${"vehicule.nbrheure"}</span><br><span> Fonction: ${data[i].vehicle_icon_id[1]}</span><br><hr><span> Date: ${data[i].last_update || ''}</span><br></span><hr><span> Batterie: ${"vehicule.battterie"}</span>`;
                            // } else if (data[i].vehicle_icon_id[1] === "VOITURE") {
                            //     contentString += `<p>Vehicule: ${data[i].vehicle_icon_id[1]}</p><span> Type: ${data[i].vehicle_icon_id[1]}</span><br><span> Matricule: ${data[i].license_plate || ''}</span><br><span> Marque: ${data[i].model_id[1]}</span><br><span> Fonction: ${data[i].vehicle_icon_id[1]}</span><hr></span><hr><span> Date: ${data[i].last_update || ''}</span><br></span><hr><span> Batterie: ${"vehicule.battterie"}</span>`;
                            // }else if (data[i].vehicle_icon_id[1].includes( "MOTO")) {
                            //     contentString += `<p>Vehicule: ${data[i].vehicle_icon_id[1]}</p><span> Type: ${data[i].vehicle_icon_id[1]}</span><br><span> Matricule: ${data[i].license_plate || ''}</span><br><span> Marque: ${data[i].model_id[1]}</span><br><span> Fonction: ${data[i].vehicle_icon_id[1]}</span><hr></span><hr><span> Date: ${data[i].last_update || ''}</span><br></span><hr><span> Batterie: ${"vehicule.battterie"}</span>`;
                            // }
                            //  else{
                            //    popupContent = '<p>Vehicule: ' + vehicule.name + '</p><span> Type: ' + vehicule.typecamion + '</span><br><span> Matricule: ' + (vehicule.immatricule !== null ? vehicule.immatricule : '') + '</span><br><span> Marque: ' + vehicule.marque + '</span><br><span> Date de mise en service: ' + vehicule.datems + '</span><br><span> Fonction: ' + vehicule.fonction + '</span><hr><span> Date: ' + vehicule.lastupdate + '</span><br></span><hr><span> Batterie: ' + vehicule.battterie + '</span>';
                         
                            //  }
                            
                            contentString += `</div></div>`;
                           
                                if(icons){
                                    img.url="/fleet_monitoring/static/img/vehicules/bacs/"+data[i].img_green;
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
                        var infowindow = new google.maps.InfoWindow({
                            content: contentString
                        });
                        
                        var marker2 = new google.maps.Marker({
                            position: { lat: data[i].latitude, lng: data[i].longitude },
                            icon: img,
                            map: null,
                            markerId: "bac-"+data[i].id,
                            draggable: false
                        });
                
                        // Use a closure to create a new scope for each marker
                        marker2.addListener('click', (function(marker2, infowindow) {
                            return function() {
                                infowindow.open(self.map, marker2);
                            };
                        })(marker2, infowindow));
                
                        this.marker_list2.push(marker2);
                    }

        }


        render_bacs_data2(){
            this.marker_list2.forEach(marker => {
                marker.setMap(this.map)
            })
             this.markerCluster = new MarkerClusterer(this.map, this.marker_list2, {
                minimumClusterSize: 5, // Set your desired minimum cluster size
                imagePath: 'https://cdn.jsdelivr.net/gh/googlemaps/v3-utility-library@07f15d84/markerclustererplus/images/m'
              });
        }




        async render_bacs_data(data,device) {
            this.showBacs=true
            this.buttonIds2=data;
            var vehicule=await rpc.query({
                model: 'fleet.vehicle',
                method: 'get_map_data2',
                args: [[]],
            })
            vehicule = vehicule.filter(veh => veh.device == device);


            var self=this
        const container = document.getElementById('mapid');

        data = data.filter(bac => 
            
                bac.latitude >= vehicule[0].latitude-Math.abs(6.799556-(6.799304)) &&
                bac.latitude <= vehicule[0].latitude+Math.abs(6.799556-(6.799304)) &&
                bac.longitude >= vehicule[0].longitude-Math.abs(6.799556-(6.799304)) &&
                bac.longitude <= vehicule[0].longitude+Math.abs(6.799556-(6.799304))
            
        );

            this.buttonIds2.forEach(buttonid=>{
          
                container.addEventListener('click', async (event) => {
              
              
      
                  if(event.target.matches(`.btn-open-map-bac-${buttonid.id}`)){
                  var results = await rpc.query({
                      model: 'fleet.vehicle',
                      method: 'get_bacs',
                      args: [[]]
                  });
                  results=results.filter(result =>  result.id ==buttonid.id )
                  self.openGoogleMaps(results[0].latitude,results[0].longitude);
              }else if (event.target.matches(`.btn-open-form-bac-${buttonid.id}`)) {
                // Find the associated vehicle ID from a data attribute
                const clickedVehicleId = event.target.dataset.vehicleId;
    
                // Call the openVehicleForm function with the vehicle ID
                // this.openVehicleForm(clickedVehicleId);
                
                self.openBacForm(buttonid.id);
                //  document.getElementById('popup').style.display="block"
        
        }
              
          });
          
              })


              

            var self = this;
            var img = {
                url: "/fleet_monitoring/static/img/vehicules/bacmetal_orange.png",
                scaledSize: new google.maps.Size(40, 40)
            };
       
            // document.getElementById("loader").style.display="block"
           

                  
        
        var ic1;
        var response = await rpc.query({
                 model: 'fleet.vehicle',
               method: 'get_icon_icon2',
                    args:[[]],
        }).then(async function(result) {
                    ic1=result;
               
                    
                }); 



            for (var i = 0; i < data.length; i++) {
                img.url="/fleet_monitoring/static/img/vehicules/bacmetal_orange.png";
    
                var contentString = '<div><p>Num: </p><span>' + data[i].numbac + '</span><br/><p>Num: </p><span>'+ data[i].numpark + '</span></div>';
                
                
                if(data[i].typeb){
                    var icons=[];
                    try{
                    // var response = await rpc.query({
                    //     model: 'fleet.vehicle',
                    //     method: 'get_icon',
                    //     args:[[],data[i].numbac],
                    // }).then(async function(result) {
                    //     icons=result;
                        
                        
                    // });

                    var response = await rpc.query({
                        model: 'fleet.vehicle',
                        method: 'get_icon2',
                        args:[[],data[i].numbac],
                    }).then(async function(result) {
                        icons=result;
                        
                        
                    });
                }catch(error){
                    console.error(error)
                }
                    const container = document.getElementById('mapid');
    
                    const buttonex =document.getElementById(`btn-open-form-${data[i].id}`)
    
                    
    
                    const button = document.createElement('button');
        button.classList.add('btn', 'btn-primary', `btn-open-form-bac-${data[i].id}`);
        button.style.width = '80px';
        button.style.height = '26px';
        button.textContent = 'Open';
        button.id=data[i].id;
        button.dataset.vehicleId = data[i].id;
        
        
        const button2 = document.createElement('button');
        button2.style.margintop="15px"
        button2.classList.add('btn', 'btn-primary', `btn-open-map-bac-${data[i].id}`);
        button2.style.width = '80px';
        button2.style.height = '26px';
        button2.textContent = 'navigate';
        button2.id=data[i].id;
        button2.dataset.vehicleId = data[i].id;
        
        
  
        
        // var response = await rpc.query({
        //     model: 'fleet.vehicle',
        //     method: 'get_icon_icon',
        //     args:[[],icons.icon[1]],
        // }).then(async function(result) {
        //     ic=result;
            
            
        // });

        
   
     
        
     

       

       var  ic = ic1.filter(icc => data[i].typeb[1].replaceAll(' ','').includes(icc.name.replaceAll(' ','')));

        
    
                    contentString =`
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
                        contentString += `<div><p>Num: </p><br><span>' + ${data[i].numbac }+ '</span><br><p>Num park: </p><br><span>'+ ${data[i].numpark} + '</span></div>`;
                    // }else if (data[i].vehicle_icon_id[1] === "CAMION") {
                    //     contentString += `<p>Vehicule: ${data[i].device}</p><span> Type: ${data[i].vehicle_icon_id[1]}</span><br><span> Matricule: ${data[i].license_plate || ''}</span><br><span> Marque: ${data[i].model_id[1]}</span><br><span> Kilometrage: ${data[i].odometer}</span><br><span> Nombre heures: ${"vehicule.nbrheure"}</span><br><span> Fonction: ${data[i].vehicle_icon_id[1]}</span><br><hr><span> Date: ${data[i].last_update || ''}</span><br></span><hr><span> Batterie: ${"vehicule.battterie"}</span>`;
                    // } else if (data[i].vehicle_icon_id[1] === "VOITURE") {
                    //     contentString += `<p>Vehicule: ${data[i].vehicle_icon_id[1]}</p><span> Type: ${data[i].vehicle_icon_id[1]}</span><br><span> Matricule: ${data[i].license_plate || ''}</span><br><span> Marque: ${data[i].model_id[1]}</span><br><span> Fonction: ${data[i].vehicle_icon_id[1]}</span><hr></span><hr><span> Date: ${data[i].last_update || ''}</span><br></span><hr><span> Batterie: ${"vehicule.battterie"}</span>`;
                    // }else if (data[i].vehicle_icon_id[1].includes( "MOTO")) {
                    //     contentString += `<p>Vehicule: ${data[i].vehicle_icon_id[1]}</p><span> Type: ${data[i].vehicle_icon_id[1]}</span><br><span> Matricule: ${data[i].license_plate || ''}</span><br><span> Marque: ${data[i].model_id[1]}</span><br><span> Fonction: ${data[i].vehicle_icon_id[1]}</span><hr></span><hr><span> Date: ${data[i].last_update || ''}</span><br></span><hr><span> Batterie: ${"vehicule.battterie"}</span>`;
                    // }
                    //  else{
                    //    popupContent = '<p>Vehicule: ' + vehicule.name + '</p><span> Type: ' + vehicule.typecamion + '</span><br><span> Matricule: ' + (vehicule.immatricule !== null ? vehicule.immatricule : '') + '</span><br><span> Marque: ' + vehicule.marque + '</span><br><span> Date de mise en service: ' + vehicule.datems + '</span><br><span> Fonction: ' + vehicule.fonction + '</span><hr><span> Date: ' + vehicule.lastupdate + '</span><br></span><hr><span> Batterie: ' + vehicule.battterie + '</span>';
                 
                    //  }
                    
                    contentString += `</div></div>`;
                   
                        if(icons){
                            img.url="/fleet_monitoring/static/img/vehicules/bacs/"+ic[0].img_green;
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
                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });
                
                var marker2 = new google.maps.Marker({
                    position: { lat: data[i].latitude, lng: data[i].longitude },
                    icon: img,
                    map: this.map,
                    draggable: false
                });
        
                // Use a closure to create a new scope for each marker
                marker2.addListener('click', (function(marker2, infowindow) {
                    return function() {
                        infowindow.open(self.map, marker2);
                    };
                })(marker2, infowindow));
        
                this.marker_list2.push(marker2);
            }
            document.getElementById("loader").style.display="none"
            
        }

        delete_old_marker2() {
            if(this.marker_list2!=[] || this.marker_list2 !=null)
            for (var i = 0; i < this.marker_list2.length; i++) {
                this.marker_list2[i].setMap(null);
                
            }
           
                if (this.markerCluster) {
                  // Clear all markers and clusters
                  this.markerCluster.clearMarkers();
                  
                  // Set the markerCluster instance to null
                  this.markerCluster = null;
                }
              
        }

        handlechangestyle(){

            const currentURL = window.location.href.split('#')[1];
            const urlParams =  new URLSearchParams(currentURL)
            const actionValue = urlParams.get('action');
           
            if( actionValue != 230)  
            {
                $(`link[href="${window.location.origin}/is_temp_reel/static/css/newcss_conducteur.css"]`).remove();
            }
            
    
            // window.addEventListener("beforeunload", function (e) {
            //     e.preventDefault(); 
            //     e.returnValue = ""; 
            //     const confirmationMessage = "Are you sure you want to leave this page?";
            //     e.returnValue = confirmationMessage; 
            // });
     }

}

FleetMapComponent2.template = "is_temp_reel.FleetMap2";
registry.category("actions").add("action_is_temp_reel2", FleetMapComponent2);



// async treeJs(){
//     this.loadScript(
//         'https://cdnjs.cloudflare.com/ajax/libs/jstree/3.2.1/jstree.min.js'
//     );

//     var self = this;
//     var vehicules = [];
//     var groups = [];

//     // Fetch vehicle and group data
//     await Promise.all([
//         rpc.query({
//             model: 'fleet.vehicle',
//             method: 'get_conducteurs',
//             args: [[]],
//         }).then(result => {
//             vehicules = result;
//         }),
//         rpc.query({
//             model: 'fleet.vehicle.group',
//             method: 'get_map_data2',
//             args: [[]],
//         }).then(result => {    
//             groups = result;
//         })
//     ]);
     
//     var dataConducteur=[]

//     // http://test-geodaki.ddns.net:2001/web/image?model=hr.employee&id=1&field=image_128&unique=1693390267000
//     // `<div class="vehicle-node1"><span class="vehicle-device">${vehicle.device}</span> <div class="imgblock" ><img class="vehicle-icon" src="${imageSrc}"><img class="vehicle-icon clickable" id="${vehicle.device}" src="/fleet_monitoring/static/img/vehicules/pied.png"> </div></div>`
//     // <div style="display: flex; flex-direction: column; align-items: center; padding-right: 10px;">
//     //                    <img class="img img-fluid" alt="Fichier binaire"
//     //                        src="${window.location.origin}/web/image?model=hr.employee&id${data[i].id}&amp;field=image_128&amp;unique=1693390267000"
//     //                        name="image_128"
//     //                        style="width: 80px; height: 80px; object-fit: cover; margin-bottom: 5px;">
//     //                       ${button.outerHTML} <br>${button2.outerHTML}
      
//     //                </div>
//     vehicules.forEach(vehicle=>{
//         dataConducteur.push({id:vehicle.id,text:`<div style="height:fit-content;display:flex;align-items:center"><img class="img img-fluid" style="width:38px;height:38px;border-radius:20px;margin-right:10px" alt="Fichier binaire"
//         //                        src="${window.location.origin}/web/image?model=hr.employee&id=${vehicle.id}&amp;field=image_128&amp;unique=1693390267000"
//         //                        name="image_128"
//         //                        style="width: 80px; height: 80px; object-fit: cover; margin-bottom: 5px;"><div ><span class="vehicle-device" style="margin-right:10px">  ${vehicle.name} </span><img class="vehicle-icon clickable3" id="${vehicle.name}" src="/fleet_monitoring/static/img/vehicules/pied.png"></div></div>`,icon: 'none',children:[]})
//     })
    
//     try {
        
//         localStorage.removeItem('jstree');

//         // const nestedData = this.createNestedData(vehicules, groups);
//         var a
//         $("#vehicules3")
//             .jstree({
//                 core: {
//                     //   check_callback: true,
//                     data: dataConducteur,
//                     themes: {
//                         responsive: true,
//                     },
//                 },
//                 checkbox: {
//                     //   cascade: 'up',
//                     keep_selected_style: true,
//                     three_state: true,
//                     whole_node: true,
//                     tie_selection: false,
//                 },
//                 plugins: [
//                     'wholerow',
//                     'contextmenu',
//                     // 'dnd',
//                     'search',
//                     'state',
//                     'types',
//                     'wholerow',
//                     // 'checkbox',
//                 ],
//             })

//             $(document).on('click', '.clickable3', async (event) => {
        
                
            
//     });
// //                 .on('select_node.jstree', (e, data) => {
// //                     const selectedText = data.selected
// //                         .map((nodeId) => {
// //                             const node = data.instance.get_node(nodeId);
// //                             const parser = new DOMParser();
// // const htmlDoc = parser.parseFromString(node.text, 'text/html');
// // if( htmlDoc.querySelector('.vehicle-device')){
// //     const name = htmlDoc.querySelector('.vehicle-device').textContent;
// //     return name

// // }
// // return node.text
// // .replace(/<[^>]+>/g, '')
// // .replace(/\s+/g, '');
// //                         })
// //                         .join(', ');
// //                        
                    
// //                   
// //                         self.state.vehicles = vehicules.filter(vehicule => vehicule.device == selectedText)
// //                     self.render()
                
// //                    if(self.state.vehicles.length>0){
// //                   
// //                     self.singleSelection = true;
// //                     self.get_map_data(self.state.vehicles);
// //                     self.VehiculeInfoPopUp()
// //                    }
                

// //                   
// //                 });

//         $('#searchInputRef').on('input', (e) => {
//             const searchString = e.target.value;
//             $('#vehicules3').jstree('search', searchString);
//         });
//     } catch (error) {
//         console.error('Error loading tree script:', error);
//     }

//     $('#searchInputRef').on('input', (e) => {
//         const searchString = e.target.value;
//         $('#vehicules3').jstree('search', searchString);
//     });

// }