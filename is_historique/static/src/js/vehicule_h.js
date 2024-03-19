/** @odoo-module **/

import { registry } from "@web/core/registry";
const rpc = require('web.rpc');
import { useService } from "@web/core/utils/hooks";
import { drawZoneDaki, delete_zones_Daki } from "../../../../is_decoupage/static/src/js/function";


const { Component, onWillStart ,onMounted, useState} = owl;
export class FleetMapComponent extends Component {
    map;
    marker_list=[];
    polyline_list=[];
    vehiculesGlobal = [];
    singleSelection = false;
    i=false;
    divhide=0;
    buttonIds=[];
    mult=false;
    message=''


    zone = []
    zoneLabel = []
     
     
    setup() {
        
        // onMounted(()=>{
        //     (function()
        //     {
        //       if( window.localStorage)
        //       {
        //         if( !localStorage.getItem('pageReloaded') )
        //         {
        //           localStorage['pageReloaded'] = true;
        //           setTimeout(function(){
        //             location.reload();
        //         }, 100); // 
        //         //   localStorage.removeItem('firstLoad');
        //         }  
        //         else
        //           localStorage.removeItem('pageReloaded');
        //       }
        //     })();
        
        // })
        
        this.state = useState({
            vehicles: [],
            period : [],
            listPosition:[],
            typeTreee : false,
            device:'',
            planningCircuit:[],
            dateInfo:[],
            infoPlanning:[],
            endTime:'23:59',
            trac:[],
            typeColl:'',
            intervalError:false,
            currentStartDate:new Date().toISOString().slice(0, 10),
            currentEndDate:new Date().toISOString().slice(0, 10)
        })

        this.notification = useService("notification");
        this.test
        //this.currentStartDate = this.currentEndDate = new Date().toISOString().slice(0, 10)
        this.period = []
        this.tree
        this.multCheck = false
        this.v=[]
        this.g=[]
        this.circuits=[]
        this.tableClick=false
        this.action
        this.infoCheck=false
        this.trac=null
        this.firstcir=false
        this.mymodule=false

        this.infowindowTrac = null

        this.lavegeDiv = false
        this.dechargeDiv = false
        this.collecteDiv = false
        this.bvDiv = false

        


        this.openFormAction=false

        this.planificationDiv = false
        
        this.icon=true
        //this.infoPlanning = []
       
        this.c=[]
        this.markerStart=null
        this.markerEnd=null

        this.orm = useService("orm")
        this.model = "fleet.vehicle.positions2"

        
       

        
        const map = owl.useRef("map_div");
        //this.orm = useService("orm");
       
        onMounted(async ()=>{

            
            //$('head').append(`<link href="${window.location.origin}/is_historique/static/css/map_view.css" rel="stylesheet" id="newcss" />`);
            this.handlechangestyle()
            if ( window.screen.width < 743 ) {
                document.getElementById("container-bottom").style.flex="0";
                document.getElementById("dev_ish").style.flex="auto"
                document.getElementById("searchButton").style.left="100%"
                document.getElementById("searchButton").style.transform="translate(-50px, 2px)"
            }else{
                document.getElementById("container-bottom").style.flex="3";
                document.getElementById("dev_ish").style.flex="1"
                
            }
            
            this.logo();
            await this.initMap();
           
            await this.uncheckAllCheckboxes();
        
            this.treeJs_ish()


            
          
            

            

            
            
            var self=this;
            
            //}

            
                
            document.querySelectorAll('.parCir').forEach(element => {
                element.addEventListener("change",function(){
                    self.delete_old_marker()
                    self.delete_old_polyline()
                    document.getElementById('searchInputRef').value=''
                    document.getElementById('iconsearch').style.display='block'
                    document.getElementById('iconcancel').style.display='none'
                    document.getElementById('_is_hist_multi_btn').style.display="none"

                    if (document.getElementById('jstreeCir_ish').style.display=='none') {
                        self.state.typeTreee = true
                        document.getElementById('jstreeCir_ish').style.display='block'
                        document.getElementById('jstree_ish').style.display='none'
                        $("#jstree_ish").jstree().close_all()
                        $("#jstree_ish").jstree().uncheck_all();
                        
            
                    } else {
                        self.state.typeTreee = false
                        document.getElementById('jstreeCir_ish').style.display='none'
                        document.getElementById('jstree_ish').style.display='block'
                        $("#jstreeCir_ish").jstree().close_all()
                        
                    }
                })
            });
            

            document.getElementById("hidebutton").addEventListener("click",function(){
                self.hideDev(0)
                
            })
            

            
            document.getElementById("iconcancel").addEventListener("click",function(){
                
               //alert(1)
                document.getElementById('searchInputRef').value=''
                
                $('#jstree_ish').jstree('search', '');
                
                $("#jstree_ish").jstree().close_all()
                $("#jstree_ish").jstree().uncheck_all();
        
               

                
                
                document.getElementById('_is_hist_multi_btn').style.display='none'
                document.getElementById('iconsearch').style.display='block'
                document.getElementById('iconcancel').style.display='none'
                
        
            })
            
          
            const container = document.getElementById('info');
            const resizable = document.getElementById('resizable');
            const handle = document.getElementById('handle');
            let isResizing = false;
            let lastDownX;

            handle.addEventListener('touchstart', function (e) {
                isResizing = true;

                e.preventDefault();

                handle.addEventListener('touchmove', function (e) {
                    if (!isResizing) {
                        return;
                    }

                    lastDownX = e.touches[0].clientY;

                    const offsetRight = lastDownX - container.offsetTop;
                    resizable.style.height = offsetRight + 'px';
                    if (lastDownX < 380 && lastDownX > 212) {
                        document.getElementById('detailInfo').style.top = (lastDownX+10)+'px'
                        
                        document.getElementById('detailInfo').style.height = ((window.screen.height - lastDownX)-38) +'px'
                    }
                });

                handle.addEventListener('touchend', function (e) {
                    // stop resizing
                    isResizing = false;
                });
            });

            handle.addEventListener('mousedown', function (e) {
                isResizing = true;

                document.addEventListener('mousemove', function (e) {
                    lastDownX = e.clientY;

                    if (!isResizing) {
                        return;
                    }

                    const offsetRight = e.clientY - container.offsetTop;
                    //document.getElementById('tester').style.height= (document.getElementById('tester').style.height + (resizable.style.height - offsetRight)) + 'px'
                    //console.log(document.getElementById('tester').style.height , (document.getElementById('tester').style.height + (resizable.style.height - offsetRight)));
                    resizable.style.height = offsetRight + 'px';
                    // console.log("===",document.getElementById('detailInfo').style.height,(((20 * parseInt(document.getElementById('detailInfo').style.height.substring(0,2))) / 100)))// = '100px'//document.getElementById('detailInfo').style.height - 
                    
                    if (e.clientY < 537 && e.clientY > 205) {
                        document.getElementById('detailInfo').style.top = (e.clientY+10)+'px'
                        
                        document.getElementById('detailInfo').style.height = ((window.screen.height - e.clientY)-147) +'px'
                    }
                    //document.getElementById('detailInfo').style.height =(((20 * parseInt(document.getElementById('detailInfo').style.height.substring(0,2)))))+'px'//document.getElementById('detailInfo').style.height - 
                });

                document.addEventListener('mouseup', function (e) {
                    // stop resizing
                    isResizing = false;
                });
            });




            const container_bottom = document.getElementById('container-bottom');
            const resizable_bottom = document.getElementById('resizable-bottom');
            const handle_bottom = document.getElementById('handle-bottom');
            const handle_bottom_div = document.getElementById('handle-bottom-div');
            const mapid = document.getElementById('mapid');
            let isResizing_bottom = false;
            let lastDownY;


            handle_bottom_div.addEventListener('touchstart', function (e) {
                isResizing_bottom = true;
                e.preventDefault();
            })
            handle_bottom.addEventListener('touchstart', function (e) {
                isResizing_bottom = true;

                e.preventDefault();

                
            });
            handle_bottom.addEventListener('touchmove', function (e) {
                if (!isResizing_bottom) {
                    return;
                }

                lastDownY = e.touches[0].clientY;

                var maxH = (window.screen.height /10)
               

                if (maxH > lastDownY ) {
                    isResizing_bottom = false;
                } 

                
                if (maxH > lastDownY ) {
                    isResizing_bottom = false;
                } 

                if (!isResizing_bottom) {
                    return;
                } else{

                    const offsetRight =  container_bottom.clientHeight - lastDownY  ;
                    resizable_bottom.style.height = offsetRight + 'px';
                }

                
                
            });

            handle_bottom.addEventListener('touchend', function (e) {
                // stop resizing
                
                isResizing_bottom = false;
            });


            handle_bottom_div.addEventListener('mousedown', function (e) {
                isResizing_bottom = true;
            })
            handle_bottom.addEventListener('mousedown', function (e) {
                isResizing_bottom = true;

                
            });
            document.addEventListener('mousemove', function (e) {
                lastDownY = e.clientY;

                var maxH = (window.screen.height /10)
               

                if (maxH > lastDownY ) {
                    isResizing_bottom = false;
                } 

                if (!isResizing_bottom) {
                    return;
                } else{

                   

                    const offsetRight =  container_bottom.clientHeight - lastDownY  ;
                    resizable_bottom.style.height = offsetRight + 'px';
                    
                }
                
            });

            document.addEventListener('mouseup', function (e) {
                // stop resizing
                isResizing_bottom = false;
            });   
            

            drawZoneDaki(this.map,this.zone,this.zoneLabel)


            
            
        })


        
        

          
    }


    async dataBacsFetch(id , StartDate  , EndDate){
    
        var myHeaders = new Headers();
        myHeaders.append("Cookie", "frontend_lang=fr_FR; session_id=f7b347322574d2c16197668256c78d0ee34218cf");

        var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow'
        };

        await fetch(`${window.location.origin}/is_diagnostic/is_diagnostic/get_diagnostic_bacs?deviceid=${id}&db=${StartDate}&df=${EndDate}`, requestOptions)
        .then(response => response.json())
        .then(result => this.bacs = result)
       

         // console.log(this.bacs)

       // console.warn(8,this.bacs); 

        

        //return this.bacs.length
    }


    generateUUID() {
        // Generate a random hexadecimal string of 32 characters
        
        var characters = '0123456789abcdef';
        var uuid = '';
        for (var i = 0; i < 32; i++) {
            uuid += characters.charAt(Math.floor(Math.random() * 16));
        }
    
        // Insert hyphens at the appropriate positions to create a valid UUID
        uuid = uuid.substr(0, 8) + '-' + uuid.substr(8, 4) + '-' + '4' + uuid.substr(13, 3) + '-' + '89ab'[Math.floor(Math.random() * 2)] + uuid.substr(16, 3) + '-' + uuid.substr(19);
        

        return uuid;
    }
    
    

    handlechangestyle(){

        const currentURL = window.location.href.split('#')[1];
       // console.log(currentURL)
        const urlParams =  new URLSearchParams(currentURL)
        const actionValue = urlParams.get('action');
        //console.log('Action Value:', actionValue);
        
        if(actionValue != 383){
            $(`link[href="${window.location.origin}/is_historique/static/css/map_view.css"]`).remove();
        }

        


        // window.addEventListener("beforeunload", function (e) {
        //     e.preventDefault(); 
        //     e.returnValue = ""; 
        //     const confirmationMessage = "Are you sure you want to leave this page?";
        //     e.returnValue = confirmationMessage; 
        // });
    }
    





    openForm(id,date,uuid) {

        
        //var view = document.querySelector('.modal-content')

        if (document.querySelector('.o_dialog_container')) {
            
            if (!this.openFormAction) {
                var x = document.querySelector('.o_dialog_container').querySelectorAll('*')
              
    
    
                this.action = this.env.services.action;
                
                this.action.doAction({
                    type: "ir.actions.act_window",
                    name: "tree positions",
                    res_model: "is_historique.calcule", // model name
                    //res_id: id, // vehicle ID
                    domain: [["deviceid", "=", id],["uuid", "=", uuid],["datej", "=", date],["start_datetime", ">=", this.state.period[2]],["end_datetime", "<=", this.state.period[3]]],
                    
                    views: [
                        [false, "tree"],
                    ],
                    view_mode: "tree",
                    target: "new", // Opens in a new frame or small window
                    
                }).then(()=>{
                    if (document.querySelector('.modal-content')) {
                        
                        //alert(1)

                        if (document.getElementById('resizable-bottom') && document.querySelector('.modal-content')) {
                           
                           // console.log("x[0].childNodes ",x[0].childNodes);
                           // console.log("x[0] = ",x[0].childNodes.length-1,x[0].childElementCount,x[0].childNodes[x[0].childNodes.length-2]);

                            var d = x[0].childNodes[x[0].childNodes.length-2]
                           // console.log(d.childNodes[0].childNodes[0].childNodes[0]);
                            

                            var view = document.querySelector('.modal-content')
                            view.style.height='100%'
                            //document.getElementById('resizable-bottom').appendChild(view)
                            if (d.childNodes[0].childNodes[0].childNodes[0]) {
                                
                                document.getElementById('resizable-bottom').appendChild(d.childNodes[0].childNodes[0].childNodes[0])
                            }

                            document.querySelector('.o_dialog').style.display='none'
                            document.querySelector('.modal-header').style.display='none'
                            document.querySelector('.o_dialog_container').style.display='none'

                           
                            // if (document.querySelector('.o_list_table')) {
                            //     document.querySelector('.o_list_table').style.marginLeft = '-21px'
                            // }
                                
                          
                        }

                    }
        
                    if (document.querySelector('.o_cp_buttons')) {
                        document.querySelector('.o_cp_buttons').style.position='absolute'
                        document.querySelector('.o_cp_buttons').style.top='1%'
                        document.querySelector('.o_cp_buttons').style.left='7px'
                        document.querySelector('.o_cp_buttons').style.zIndex =12
                     
                        document.querySelector('.o_cp_bottom_left').append(document.getElementById('paragraph'))
                    }
        
                    document.addEventListener('click',(event)=>{
                       
                        if (event.target.classList.value.startsWith('o_facet_remove')) {
                            //alert(1)
                            if (document.querySelector('.o_cp_buttons')) {
                                document.querySelector('.o_cp_buttons').style.position='absolute'
                                document.querySelector('.o_cp_buttons').style.top='1%'
                                document.querySelector('.o_cp_buttons').style.left='7px'
                                document.querySelector('.o_cp_buttons').style.zIndex =12
                            }
                        }
                        
                    })
                    
                    
  
        
                    if (window.screen.width < 994) {
                        document.querySelector('.o_toggle_searchview_full').style.display ='none'
                    }
                    
                    
                    document.querySelector('.o_list_button_add').style.display ='none'
                    document.querySelector('.o_list_renderer').style.height='100%'
        
                    //console.log(view);

                    this.openFormAction=true

                    //alert(11)
                    
                    
                })
            }
        
        }
                        
        
        

      
    }

    async showHome(){
       
        if (this.infoCheck) {
            this.infoCheck=false
            //this.testClick=true
            //this.icon=!this.icon
        }
        this.multCheck = false
        this.state.dateInfo=[]

        if (this.trancheTrac) {
                                
            this.trancheTrac.setMap(null)
            this.marker_tranch.setMap(null)
        }

        if (this.trac!=null) {
            this.trac.setMap(null)
            this.trac=null
        }
        
        this.openFormAction=false
        this.delete_old_marker()
        this.delete_old_polyline()

        const {Map,Marker} = await window.google.maps.importLibrary("maps");
    
        this.map = new Map( document.getElementById('mapid') ,{
            center: { lat: 33.964451, lng: -6.842338 },
            zoom: 12,
            gestureHandling: "greedy"
        });


        this.lavegeDiv = false
        this.dechargeDiv = false
        this.collecteDiv = false
        this.bvDiv = false
        this.dhDiv = false
        this.vdDiv = false
        this.planificationDiv = false



        document.getElementById('homeButton').style.display='none'
        document.getElementById('info').style.display='none'
        document.getElementById('infoMult').style.display='none'
        document.getElementById('info-split').style.display='none'
        document.getElementById('info-split').style.width='100%'
        document.getElementById('home').style.display='block'
        document.getElementById('infoCircuit').style.display='none'

        if (window.screen.width > 768) {
            document.getElementById('hidebutton').style.left="25%"
        }

        

        
        

        var div = document.querySelector('#resizable-bottom')
        div.append(document.getElementById('paragraph'))
        div.style.height='120px'
        if (div.querySelector('.modal-content')) {
            //alert(2)
            div.querySelector('.modal-content').remove()
        }
       

        this.planificationDiv = false

        this.dhDiv = false

        this.dhDiv = false

        document.removeEventListener("click", this.event_for_table);
        
                    
       // this.i = !this.i
       
      
      drawZoneDaki(this.map,this.zone,this.zoneLabel)
        
        
    }

 
   hideDev(mult){
        this.icon=!this.icon
       

        if (this.icon) {
            document.getElementById('ic-right').style.display="none"
            document.getElementById('ic-left').style.display="block"
        }else{
            document.getElementById('ic-right').style.display="block"
            document.getElementById('ic-left').style.display="none"
        }
        this.i=!this.i;
        if (this.testClick==true) {
            this.i=!this.i;
            this.testClick=false
        }
        //this.openForm()
       // console.log("----",this.i);
        const devElement = $("#dev");
        const button = $("#hidebutton");
        var split= $(".vsplitter");
        //var map= $(".right_panel");

        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;

        // Define the threshold values for screen width and height
        const thresholdWidth = 1024; // Example threshold for width
        const thresholdHeight = 768; // Example threshold for height

        if ( window.screen.width < 743 ) {
            if (this.firstcir) {
                this.i=!this.i;
                this.firstcir=false
            }
            
            
            if(this.i){
    
                if (screenWidth > thresholdWidth && screenHeight > thresholdHeight) {
                    // (PC)
                    button.animate({
                        top: "40px"
                    }, 400, function() {});
                
                } 
                //alert(1)
                
                
               // console.log("this.infoCheck befor - this.i - mult",this.infoCheck ,this.i,mult);
                
                

                if (mult==1) {
                    
                    document.getElementById("container-bottom").style.flex="0";
                    document.getElementById("dev_ish").style.flex="3";
                    document.getElementById('info-split').style.display='none'
                    
                }else{
                    if (this.infoCheck) {
                        document.getElementById("container-bottom").style.flex="0";
                        document.getElementById("dev_ish").style.flex="3";
                        document.getElementById('info-split').style.display='none'
                        
                        document.getElementById('dev_ish').style.display='block'
                       // this.infoCheck=false
                        
                    }else{
                        //if (this.multCheck==true) {
                        //    document.getElementById("container-bottom").style.flex="0";
                        //    document.getElementById("dev").style.flex="1";
                        //}else{
                            document.getElementById("container-bottom").style.flex="3";
                            document.getElementById("dev_ish").style.flex="0";
                            document.getElementById('dev_ish').style.display='none'
                        //}
                    }
                    
                    
                }

                if (this.multCheck==true) {
                    document.getElementById('homeButton').style.display='block'
                    document.getElementById('home').style.display='none'
                    document.getElementById('infoMult').style.display='block'
                }

                this.firstcir=false
                

               

                
                 
                
                //
            }else{
               // alert(0)
                if (screenWidth > thresholdWidth && screenHeight > thresholdHeight) {
                    // Perform a specific action for larger screens (PC)
                    button.animate({
                        top: "129px"
                    }, 400, function() {
                        // Animation complete
                    });
                    
                } 

                
                    // Perform a specific action for larger screens (PC)
                    
                    if (this.infoCheck) {
                        document.getElementById("container-bottom").style.flex="3";
                        document.getElementById("dev_ish").style.flex="0";
                        document.getElementById('info-split').style.display='block'
                        document.getElementById('info-split').style.width='100%'
                        document.getElementById("dev_ish").style.display="none";
                        //this.infoCheck=false
                  
                    }else{
                        
                        document.getElementById("container-bottom").style.flex="0";
                        document.getElementById("dev_ish").style.flex="1";
                        
                        document.getElementById('dev_ish').style.display='block'
                        document.getElementById('info-split').style.display='none'
                    }
                 
             
               
                
              
    
            }
        } else {
            if(!this.i){

       // alert(1)
                if (screenWidth > thresholdWidth && screenHeight > thresholdHeight) {
                    
                    button.animate({
                        top: "40%",
                        //left:'25%'
                    }, 200, function() {});
                
                } 
                if (document.querySelector('.o_list_table')) {
                    document.querySelector('.o_list_table').style.marginLeft = '-21px'
                }
                
                
                if (this.infoCheck) {
                    document.getElementById("container-bottom").style.flex="3";
                    document.getElementById("dev_ish").style.flex="1";
                    document.getElementById('hidebutton').style.left="25%"
                    document.getElementById('info-split').style.display='block'
                    document.getElementById('info-split').style.width='75vw'
                   // this.infoCheck=false
                    
                }else{
                    document.getElementById("container-bottom").style.flex="3";
                    document.getElementById("dev_ish").style.flex="1";
                    document.getElementById('hidebutton').style.left="25%"
                    document.getElementById('info-split').style.display='none'
                    
                }

                if (this.multCheck==true) {
                    
                    document.getElementById('homeButton').style.display='block'
                    document.getElementById('home').style.display='none'
                    document.getElementById('infoMult').style.display='block'
                }else{
                    //alert(1)
                    document.getElementById('infoMult').style.display='none'
                }

                
               
                
                document.getElementById('dev_ish').style.display='block'
                
                //
            }else{
                if (screenWidth > thresholdWidth && screenHeight > thresholdHeight) {
                    // Perform a specific action for larger screens (PC)
                    
                    button.animate({
                        top: "40%",
                        left:0
                    }, 200, function() {
                        // Animation complete
                        
                    });
                    
                } 
                //alert(2)

                if (document.querySelector('.o_list_table')) {
                    document.querySelector('.o_list_table').style.marginLeft = '-45px'
                }

                if (this.infoCheck) {
                    document.getElementById("container-bottom").style.flex="3";
                    document.getElementById("dev_ish").style.flex="1";
                    document.getElementById('info-split').style.display='block'
                    
                    document.getElementById('info-split').style.width='100%'
                    
                   // this.infoCheck=false
                    
                }else{
                    document.getElementById("container-bottom").style.flex="3";
                    document.getElementById("dev_ish").style.flex="1";
                    document.getElementById('info-split').style.display='none'
                }
                
                
                
                document.getElementById('dev_ish').style.display='none'
                
                            


                
                
                
            

            }
        }
        

      
    }


    

    selDevice(){
        const selected = document.getElementsByClassName('vehicle-icon');
       
        

        Array.from(selected).forEach(image => {
            //console.log("elem = ", image);
            image.addEventListener('click', function() {
          
          
             
            });
            
        });
    }

   
    

    // async getAllTasks(){
    //     this.state.listPosition = await this.orm.searchRead(this.model, [], ['deviceid', 'servertime','latitude', 'longitude', 'speed', 'course', 'address',
    //     'attributes', 'accuracy', 'network', 'geom', 'flags', 'gps',
    //     'distance', 'd2', 'iccid', 'sat', 'bat', 'id_cirdet', 'dsb',
    //     'powerdetect', 'acc', 'nomrue', 'id2', 'power2', 'power3',
    //     'odometre', 'km', 'hrs', 'gas', 'capt', 'can4', 'can5',
    //     'can6', 'can7', 'can8', 'can9', 'can10', 'datep'])


    //     //console.log(this.state.taskList[0].latitude);
    // }



    async testdata(){
        var vehicules  = []
        var groups  = []
        var pos  = []
        await Promise.all([
            
            rpc.query({
                model: 'fleet.vehicle',
                method: 'get_map_dataHis',
                args: [[]],
            }).then(result => {
                this.v = result;
            }),
            rpc.query({
                model: 'fleet.vehicle.group',
                method: 'get_map_data2',
                args: [[]],
            }).then(result => {
                this.g = result;
                //this.g2 = result
            }),
            rpc.query({
                model: 'is_decoupage.circuits',
                method: 'get_circuit_isdecoupageHisto',
                args: [[]],
            }).then(result => {
                this.circuits = result;
                //this.c = result
            })
        ]);

        var startDate = document.getElementById('startDate').value
        var endDate = document.getElementById('endDate').value
        var startTime = document.getElementById('startTime').value
        var endTime = document.getElementById('endTime').value
        

    }

   

    


    multSelect(){
        this.mult=!this.mult
        this.treeJs_ish()
    }


  
    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.id = "treeJsHisto"
            script.src = src;

            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }
        


    // fun de cree les tree pour vehicules et circuits
    async treeJs_ish(){
        if (!document.getElementById("treeJsHisto")) {
            this.loadScript(
                'https://cdnjs.cloudflare.com/ajax/libs/jstree/3.2.1/jstree.min.js'
            );
        }
        await this.testdata()
        
        var self = this;
        var vehicules = [];
        var groups = [];
        var circuits = []
        
        try {

            
            this.v.forEach(v=>{v.id = 'd'+v.id});
         
            
            const nestedData = this.createNestedData_ish(this.v, this.g);
            localStorage.removeItem('jstree');

            this.v.forEach(element => {
                element.id=element.id.substring(1,element.id.length)
            });

           
            
            $("#jstree_ish")
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
                    keep_selected_style: true,
                    three_state: true,
                    whole_node: true,
                    tie_selection: false,
                },
                search: {
                    case_insensitive: true,
                    show_only_matches : true
                },
                plugins: [
                    'wholerow',
                    'contextmenu',
                    //'dnd',
                    'search',
                    'state',
                    'types',
                    //'wholerow',
                    'checkbox',
                    "sort"
                    
                ],
            }).on('click', '.vehicle-icon', function(e) {
                const vehicleDevice = $(this).closest('.vehicle-node1').find('.vehicle-device').text();
                document.getElementById('loader_ish').style.display='block'
                //console.log("$$$$$$$$$ ",document.querySelector('.o_dialog_container').querySelectorAll('*'));
                
                self.showInfo(vehicleDevice)
                
                //console.log('Vehicle Device:', vehicleDevice);
            }).on('check_node.jstree uncheck_node.jstree', (e, data) => {
                //console.log("data " , data);                   
                var listVehicule = []
                var oldGroup = []
                data.selected.forEach(element => {
                    var d=data.instance.get_node(element)
                    
                    // console.log(' * ',d.original.type)
                    if (d.original.type=='group') {
                        //console.log(element);
                        oldGroup.push(element)
                        d.children_d.forEach(line => {
                            var id = data.instance.get_node(line)
                            if (listVehicule.indexOf(line) == -1 && id.original.type != 'group') {
                                listVehicule.push(line)
                                
                            }
                        });
                        //console.log(data.instance.get_node(element));
                    } else{
                        if (listVehicule.indexOf(element) == -1) {
                            listVehicule.push(element)
                        }
                        
                    }
                                        
                });
            
                const selectedText = listVehicule.map((nodeId) => {
                        const node = data.instance.get_node(nodeId);
                        return node.text
                            .replace(/<[^>]+>/g, '')
                            .replace(/\s+/g, '');
                })
                .join(',');
                console.log('list : ' , listVehicule);
                var spList = selectedText.split(',')
                this.selVehicule = spList
                                    
                // console.log('spList: ' , spList);
                // console.log('Selected: ' , selectedText);
                if (data.instance.get_checked().length === 0) {
                    this.mult = false
                    document.getElementById('_is_hist_multi_btn').style.display="none"
                    self.delete_old_marker()
                    self.delete_old_polyline()
                }else{
                    this.mult = true
                    document.getElementById('_is_hist_multi_btn').style.display="block"
                    self.delete_old_marker()
                    self.delete_old_polyline()
                }
                
            });
        
            
                
            
                

            $('#searchInputRef').on('input', (e) => {
                const searchString = e.target.value;
                if (window.screen.width < 743) {
                    document.getElementById('searchButton').style.transform="translate(-50px,2px)"
                } else {
                    document.getElementById('searchButton').style.transform="translate(-37px,3px)"
                    
                }
                if (searchString =='') {
                    document.getElementById('iconsearch').style.display='block'
                    document.getElementById('iconcancel').style.display='none'
                } else {
                    document.getElementById('iconsearch').style.display='none'
                    document.getElementById('iconcancel').style.display='block'
                }


                

                $('#jstree_ish').jstree('search', searchString);
                
                
            });
          

            


            
           
        
        
            document.getElementById('loader_ish').style.display='none'
    

        } catch (error) {
            console.error('Error loading tree script:', error);
        }

        
    }

       
    createNestedData_ish(vehicles, groups) {
        
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
            var feet
            if (!this.state.mult) {
                feet = ` <div class="imgblock">
                <img class="vehicle-icon" src="/fleet_monitoring/static/img/vehicules/pied.png">
            </div></div>`
            } else {
                feet = `</div>`
            }
            const groupVehicles = vehicles
                .filter(
                    (vehicle) =>
                        (vehicle.vehicle_group_id[0] === groupId &&
                            vehicle.vehicle_group_id[0] === parentGroupId) ||
                        vehicle.vehicle_group_id[0] === parentGroupId
                )
                .map((vehicle) => ({
                    id: vehicle.id.toString(),
                    text: `
                    <div class="vehicle-node1">
                        <span class="vehicle-device">${vehicle.device}</span>`+feet,
                    type: 'vehicle',
                    icon: 'none',
                }));

            return groupVehicles;
        };

        const groupNodes = topLevelGroups.map((group) => ({
            id: group.id.toString(),
            text: '<span class="group_name">' + group.name + ' </span>',
            children: [...buildTree(group.id), ...buildVehicles(group.id, group.id)],
            type: 'group',
            icon: 'none',
        }));

        const nestedData = groupNodes;
       // console.log(nestedData);

        return nestedData;
    }


    

    // fun pour afficher les tracages d'une vehicule
    async showInfo(image){
        

        
        
        this.lavegeDiv = false
        //this.dechargeDiv = false
        this.collecteDiv = false
        this.bvDiv = false

        
        // this.dhDiv = true
        // this.vdDiv = true
        // this.planificationDiv = true
        
        delete_zones_Daki(this.zone,this.zoneLabel)
        this.delete_old_marker()
        this.delete_old_polyline()
        var startDate = document.getElementById('startDate').value
        var endDate = document.getElementById('endDate').value
        var startTime = document.getElementById('startTime').value
        var endTime = document.getElementById('endTime').value
        
        

        
        document.getElementById('infoMult').style.display='none'

        var date1 = new Date(endDate);
        var date2 = new Date(startDate);
        var diffDays = parseInt((date1 - date2) / (1000 * 60 * 60 * 24), 10)
        //alert(diffDays)

        console.log('image = ',image);

        var x = this.v.filter(vehicule => vehicule.device.replace(/ /g, '') == image)
        //x[0].id = x[0].id.substring(1,x[0].id.length-1)
        var idd
        

      

        




        

        if (startDate > endDate ) {
            endDate = startDate
        }
        if (endDate == startDate) {
            if (endTime < startTime) {
                document.getElementById('endTime').value=endTime='23:59'
            }
        }

        var dc = new Date().toISOString().slice(0, 10)

        if (x[0] != undefined) {
            idd = x[0].id

            
            if (endDate > dc) {
                this.state.intervalError=true
                this.message='Interval invalid!'
                document.getElementById('spl').style.opacity = 0.3
                document.getElementById('spl').style.pointerEvents = 'none'
            }else{
                this.state.currentStartDate = startDate
                this.state.currentEndDate = endDate
                if (diffDays < 8 ) {
                    this.i=true
                    this.infoCheck=true
                    this.multCheck=false
                    document.getElementById('container-bottom').style.display='block'
                    document.getElementById('home').style.display='none'
                    document.getElementById('info').style.display='block'
                    this.hideDev(1)

                    var planning = []
                    var dh = []
                    var vd = []
                    this.bacs=[]

                    var icon



                    

                
                
                    try{
                        var r = []
                        
                        Promise.all(
                            r= await rpc.query({
                                model: 'fleet.vehicle.positions2',
                                method: 'affPos',
                                args: [[], idd, startDate +' ' + startTime, endDate +' ' + endTime ]
                                //args: [[],'2023/09/01 12:30:00' ,  '2023/09/05 12:30:00'  ]
                            }),
                            // r= await rpc.query({
                            //     model: 'fleet.vehicle.positions2',
                            //     method: 'getAllDate_his',
                            //     args: [[], startDate +' ' + startTime, endDate +' ' + endTime ]
                            // }),
                            planning= await rpc.query({
                                model: 'is_planning.is_planning',
                                method: 'getPlanningHistoriqueVehicle',
                                args: [[], idd,startDate, endDate]
                            }),
                            dh= await rpc.query({
                                model: 'is_tools.dh',
                                method: 'getHistoriqueDH',
                                args: [[], idd,startDate, endDate]
                            }),
                            vd= await rpc.query({
                                model: 'is_tools.vd',
                                method: 'getHistoriqueVD',
                                args: [[], idd,startDate, endDate]
                            }),
                            
                            this.bacs= await rpc.query({
                                model: 'fleet.vehicle',
                                method: 'get_num_bacs_historique',
                                args: [[],idd,startDate,endDate]
                            })
                            
                        )
                       // console.log("res pos = ",r);
                       // console.log("res planning = ",planning);
                        this.state.listPosition = r
                    }catch(error){
                        console.error(error)
                    }

                    //console.warn(icon );

                    document.getElementById('iconeVeh').src="/fleet_monitoring/static/img/vehicules/"+ x[0].icong
                    

                    if (planning.length > 0) {
                        
                        var cir = this.circuits.filter(c => c.id == planning[0].circuitid)

                        this.planificationInfo = {circuit: planning[0].circuitid ,groupe: cir[0].groupname,frequence: cir[0].frename,service: '',hdeb: planning[0].hdeb.substring(11,19),hfin: planning[0].hfin.substring(11,19)}
                        //this.planificationInfo = {circuit: planning[0].circuitid ,groupe: 'cir[0].group',frequence: 'cir[0].frequence[1]',service: '',hdeb: planning[0].hdeb.substring(11,19),hfin: planning[0].hfin.substring(11,19)}
                        
                        this.planificationDiv = true
                        this.noPlanning = ''

                        
                    }else{
                        this.planificationDiv = true
                        this.noPlanning = 'Non planifier'
                    }


                    this.balayageMec = false

                    


                    //await this.dataBacsFetch(idd,startDate +' ' + startTime, endDate +' ' + endTime)

                    


                    //console.warn(9,this.bacs.length);
                    
                        
                    switch (x[0].vehicle_group_id[0]) {
                        case 9:
                            // bom
                            this.collecteDiv = true
                            this.state.typeColl = 'Colonnes collectées : '+this.bacs.length
                            break;
                    
                        case 7:
                            // grue
                            this.collecteDiv = true
                            this.state.typeColl = 'Bacs collectés : '+this.bacs.length
                            break;

                        case 19:
                            // Laveuse colonnes
                            this.lavegeDiv = true
                            //this.typeLav = 'Colonnes lavées : 0'
                            this.state.typeColl = 'Colonnes lavées : '+this.bacs.length
                            //console.warn(this.state.typeColl,this.bacs.length);
                            break;
                        case 11:
                            // Laveuse de bacs
                            this.lavegeDiv = true
                            //this.typeLav = 'Bacs lavés : 0'
                            this.state.typeColl = 'Bacs lavés : '+this.bacs.length

                            //console.warn(this.state.typeColl,this.bacs.length);
                            break;
                        case 16:
                            // Balayage Mecanique
                            this.bvDiv = true
                            this.balayageMec = true
                            break;
                        case 18:
                            // "Laveuse de voirie"

                            this.bvDiv = true
                            this.balayageMec = true
                            break;
                        case 17:
                            // amplirolle
                            //this.amplirolle = true
                            break;
                    }
                    

                    

                    //alert(1)

                    if (x[0].vehicle_can_id.length > 0) {
                        if (dh.length > 0) {
                        
                            //var cir = this.circuits.filter(c => c.id == planning[0].circuitid[0])

                            this.dhInfo = {contact: dh[0].contact,roulage: dh[0].roulage,arret:dh[0].arret }
                            
                            this.dhDiv = true

                            //console.warn("555 ",vd);

                            if (vd.length > 0) {
                            
                                //var cir = this.circuits.filter(c => c.id == planning[0].circuitid[0])
                                var min = Math.min(...this.state.listPosition.map(item => item.can4));
                                var max = Math.max(...this.state.listPosition.map(item => item.can4));
                                var maxTemp = Math.max(...this.state.listPosition.map(item => item.can5));

                                
                                this.vdInfo = {activite: dh[0].activite, km: vd[0].km, gaz: (max-min) ,jc:this.state.listPosition[this.state.listPosition.length-1].gas ,date: this.state.listPosition[this.state.listPosition.length-1].fixtime ,tmp: maxTemp}
                                
                                this.vdDiv = true
        
        
                                
                            }
                            
                        }
                    }

                    

                    
                    this.dechargeDiv = false
            
                        
                
                    var homeDiv = document.getElementById('home')
                    var info = document.getElementById('info')
                    var info_split = document.getElementById('info-split')
                
        
            
    
                    this.device = x[0].model_id[1]
                    this.state.period = [startDate , endDate ,startTime ,endTime]
        
                    //console.log(x[0].id);
                    this.polyline_list=[]
                    
                    this.state.device=image
        
                    
                    document.getElementById('homeButton').style.display='block'
                    
                    var device = []
                    var cer = []
                    var date = []
                    //var color = ['#FCE22A','#7D7C7C','#088395','#8BE8E5','#FF0850','#071952','#9A3B3B']
                    var color = [
                        "#ff6fff","#86b300","#2e8b57","#ffff00","#bf9000","#ffa500","#a67b5b","#a52a2a","#3c341f","#00b7eb","#769ad4","#0000ff","#800080","#b768a2","#696969","#ff0000"
                    ]   

                    //console.log("color = ",_.sample(color));
        
                    
                    this.state.listPosition.forEach(element => {
                        if ((date.indexOf(element.fixtime.substring(0,10))==-1)) {
                            date.push(element.fixtime.substring(0,10))
                                
                                
                        }
                        
                        
                    });


                    var traceActive = []
                    let infoCer=[]
                    if (this.balayageMec) {
                        
                        date.forEach(d => {
                            let oneCer=[]

                            let oneAct = []
                            
                            let sommD = 0
                            let sommV = 0
                            this.sommDistActive = 0

                            let j = 0
                            var last = 0
                            this.state.listPosition.forEach(element => {
                                
                                if (element.fixtime.substring(0,10) == d ) {
                                    //device.push(element)
                                    //console.log(element.capt.substring(0,5) );
                                    oneCer.push({lat: element.latitude, lng: element.longitude})
                                    if (element.capt.substring(0,5) > '00000') {
                                        oneAct.push({lat: element.latitude, lng: element.longitude})
                                        this.sommDistActive = this.sommDistActive + element.distance
                                        
                                        
                                        
                                    }else{
                                        traceActive.push(oneAct)
                                        oneAct = []
                                    }
                                    
                                    sommD = sommD + element.distance
                                    
                                    if(element.acc !='0'){
                                        if (element.speed > 0){
                                            sommV = sommV + element.speed
                                            j++
                                        }
                                    }
                                    
                                    
                                }
                            })

                            this.sommDistActive = (this.sommDistActive/1000).toFixed(2)


                            
                            cer.push(oneCer)

                            
                            
                            sommV = (sommV/j).toFixed(2);
                            infoCer.push({device:x[0].device, date:d, fonction: x[0].fonction[1], license_plate:x[0].license_plate})
                            this.state.dateInfo.push({date:d,sommD:((sommD/1000)+'').substring(0,5),sommV:sommV})

                            
                        });
                    } else {
                        date.forEach(d => {
                            let oneCer=[]
                            
                            let sommD = 0
                            let sommV = 0
                            let j = 0
                            this.state.listPosition.forEach(element => {
                                
                                if (element.fixtime.substring(0,10) == d ) {
                                    //device.push(element)
                                    oneCer.push({lat: element.latitude, lng: element.longitude})
                                    sommD = sommD + element.distance
                                    if (x[0].vehicle_icon_id[0] == 73) {
                                        sommV = sommV + element.speed
                                    } else {
                                        if(element.acc!='0'){
                                            if (element.speed > 0){
                                                sommV = sommV + element.speed
                                                j++
                                            }

                                        }
                                    }
                                    
                                }
                            })
                            
                            
                            cer.push(oneCer)
                            sommV = (sommV/j).toFixed(2);
                            infoCer.push({device:x[0].device, date:d, fonction: x[0].fonction[1], license_plate:x[0].license_plate})
                            this.state.dateInfo.push({date:d,sommD:((sommD/1000)+'').substring(0,5),sommV:sommV})

                            
                        }); 
                    }
                    
                    
    
                
                
    

                
                
                    var start
                    var end
        
        
                    const markerIcon = {
                        url: '/is_historique/static/img/start.png', 
                        scaledSize: new google.maps.Size(30, 40) 
                    };
        
                    const markerIconEnd = {
                        url: '/is_historique/static/img/end.png', 
                        scaledSize: new google.maps.Size(30, 40) 
                    };
        
                    if (cer[0] != undefined) {
                        if (cer.length==1) {
                            start = cer[0][0]
                            end = cer[0][cer[0].length-1]
        
        
                            this.marker_list[0] = new google.maps.Marker({
                                position: start,
                                icon: markerIcon,
                                map: this.map,
                                draggable: false
                            });
        
                            this.marker_list[1] = new google.maps.Marker({
                                position: end,
                                icon: markerIconEnd,
                                map: this.map,
                                draggable: false
                            });
                        } 
                        
                        
                    }

                    
                    
                
                    let i = 0
                    cer.forEach(c => {
                        var CerLine
                        var col = _.sample(color)
                        this.state.dateInfo[i].color=col
                        this.state.dateInfo[i].i=i
                        
                        CerLine = new google.maps.Polyline({
                            path: c,
                            strokeColor: col,
                            strokeOpacity: 1.0,
                            strokeWeight: 3,
                            title:`<div>
                                <b>Nom :</b><span>${infoCer[i].device}</span><br></br>
                                <b>Date :</b><span>${infoCer[i].date}</span><br></br>
                                <b>Matricule :</b><span>${infoCer[i].license_plate}</span><br></br>
                            
                                <b>Fonction :</b><span>${infoCer[i].fonction}</span>
                            </div>`
                        });
                        
                        color = _.without(color, col)
                        this.polyline_list.push(CerLine)
        
                        i++
                    });

                    traceActive.forEach(a => {
                        if (a.length != 0) {
                            var CerLine
                            
                            
                            CerLine = new google.maps.Polyline({
                                path: a,
                                strokeColor: '#16FF00',
                                strokeOpacity: 1.0,
                                strokeWeight: 4,
                                
                            });
                            
                            
                            this.polyline_list.push(CerLine)

                        }
                        
                    });

                    var self=this;
                    this.polyline_list.forEach(element => {
                        element.setMap(this.map)
                        
                        //console.log("element ",element);
                        element.addListener("click", (e) => {
                            if (self.infowindowTrac!=null) {
                                //alert(1)
                                self.infowindowTrac.close();
                            }

                            self.infowindowTrac = new google.maps.InfoWindow({
                                content: element.title,
                                maxWidth: 200,
                                position:e.latLng
                            });
                            //alert(1); 
                            self.infowindowTrac.open(self.map);
                        });
                    });
        
                    this.c = cer
                    //console.log("l = " , cer[0]);
                    if (cer ==[] || cer[0]!=undefined) {
                        if (cer[0].length==0) {
                            this.state.dateInfo=[]
                            //console.log("**",this.state.dateInfo);
                        }
                    }
        
                    
                    //console.log("v = " , this.state.dateInfo);
        
                    
        
                    
                    this.polyline_list.forEach(element => {
                        element.setMap(this.map)
                    });
        
                    
                    document.addEventListener("click", this.event_for_table);
        
                    
                    //console.log(" this.polyline_list = " ,  this.polyline_list);
                    //console.log("latlog = ",x[0].latitude, x[0].longitude);
                    //this.map.setCenter({lat: parseFloat(x[0].latitude), lng: parseFloat(x[0].longitude)})
                    this.map.setCenter(start)
                    this.map.setZoom(12)
                    cer=[]

                    } else {
                        this.state.intervalError=true
                        this.message='Interval de temps supérieur à 8 jours!'
                        document.getElementById('spl').style.opacity=0.3
                        document.getElementById('spl').style.pointerEvents='none'
                    }
                

                }
        }else{
            this.state.intervalError=true
            this.message='Véhicule introuvable !'
            document.getElementById('spl').style.opacity = 0.3
            document.getElementById('spl').style.pointerEvents = 'none'
        }  

            
        document.getElementById('loader_ish').style.display='none'
            
        

    }


    // fun pour afficher multi tracage
    async showInfoMult(images){
        if (images.length == 1) {
            document.getElementById('loader_ish').style.display='block'
            this.showInfo(images[0])
        } else {
        
            this.delete_old_marker()
            this.delete_old_polyline()

            delete_zones_Daki(this.zone,this.zoneLabel)
            this.polyline_list = []
            this.state.dateInfo=[]

            var startDate = document.getElementById('startDate').value
            var endDate = document.getElementById('endDate').value
            var startTime = document.getElementById('startTime').value
            var endTime = document.getElementById('endTime').value

            var date1 = new Date(endDate);
            var date2 = new Date(startDate);
            var diffDays = parseInt((date1 - date2) / (1000 * 60 * 60 * 24), 10)
            //alert(diffDays)
            if (startDate > endDate ) {
                endDate = startDate
            }

            if (endDate == startDate) {
                if (endTime < startTime) {
                    document.getElementById('endTime').value=endTime='23:59'
                }
            }
            this.state.currentStartDate = startDate
            this.state.currentEndDate = endDate

            var idd = []

            console.log(images);
            images.forEach(element => {
                let x = this.v.filter(vehicule => vehicule.device.replace(/ /g, '') == element)
                console.log("x = ",x);
                //x[0].id = x[0].id.substring(1,x[0].id.length-1)
                
                idd.push(x[0].id)
            });

            var dc = new Date().toISOString().slice(0, 10)
            

            
            if (endDate > dc) {
                this.state.intervalError=true
                this.message='Interval invalid!'
                document.getElementById('spl').style.opacity=0.3
                document.getElementById('spl').style.pointerEvents='none'
            }else{
                if (diffDays < 8 && idd.length > 0) {
    
                    this.i=false
                    this.multCheck=true
                    this.infoCheck=false
                    document.getElementById('loader_ish').style.display='block'

                
                
                    try{
                        var r = []
                        Promise.all(
                            r= await rpc.query({
                                model: 'fleet.vehicle.positions2',
                                method: 'affPosMult',
                                args: [[],idd,startDate +' ' + startTime, endDate +' ' + endTime ]
                                //args: [[],'2023/09/01 12:30:00' ,  '2023/09/05 12:30:00'  ]
                            })
                        )
                        //console.log("res mult pos = ",r);
                        this.state.listPosition = r
                    }catch(error){
                        console.error(error)
                    }

                    var homeDiv = document.getElementById('home')
                    var info = document.getElementById('info')
                    var info_split = document.getElementById('info-split')
                    var device = []
                    var cer = []
                    var infoCer = []
                    var date = []
                    var color = ["#ff6fff","#86b300","#2e8b57","#ffff00","#bf9000","#ffa500","#a67b5b","#a52a2a","#3c341f","#00b7eb","#769ad4","#0000ff","#800080","#b768a2","#696969","#ff0000"]



                    
                    this.state.listPosition.forEach(element => {
                        if (date.indexOf(element.fixtime.substring(0,10))==-1) {
                        
                            date.push(element.fixtime.substring(0,10))
                            
                        }
                        
                    });
                    images.forEach(image => {
                        
                        var x = this.v.filter(vehicule => vehicule.device.replace(/ /g, '') == image)
                          
                        date.forEach(d => {
                            let oneCer=[]
                            let index = 0
                            this.state.listPosition.forEach(element => {
                                if (element.fixtime.substring(0,10) == d  && element.deviceid==x[0].id) {
                                    //device.push(element)
                                    oneCer.push({lat: element.latitude, lng: element.longitude})
                                    index++
                                    
                                }
                            })
            
                            cer.push(oneCer)
                            infoCer.push({device:x[0].device, date:d, fonction: x[0].fonction[1], license_plate:x[0].license_plate})
                        
                            this.state.dateInfo.push({device:x[0].device, date:d , id:x[0].id, nbPos:index})
                            
                            
                            
                        });
                    
                    
                                
                                
                    
                                
                                
                                
                    });

                    var start
                    var end
                    
                    
                    const markerIcon = {
                        url: '/is_historique/static/img/start.png', 
                        scaledSize: new google.maps.Size(30, 40) 
                    };
        
                    const markerIconEnd = {
                        url: '/is_historique/static/img/end.png', 
                        scaledSize: new google.maps.Size(30, 40) 
                    };
        
                    if (cer[0] != undefined) {
                        if (cer.length==1) {
                            start = cer[0][0]
                            end = cer[0][cer[0].length-1]
        
        
                            this.marker_list[0] = new google.maps.Marker({
                                position: start,
                                icon: markerIcon,
                                map: this.map,
                                draggable: false
                            });
        
                            this.marker_list[1] = new google.maps.Marker({
                                position: end,
                                icon: markerIconEnd,
                                map: this.map,
                                draggable: false
                            });
                        } 
                    
                    
                    }
        
                    
                    
                    var self=this
                    let i = 0
                    cer.forEach(c => {
                        var CerLine
                        if (color.length == 0) {
                            color = ["#ff6fff","#86b300","#2e8b57","#ffff00","#bf9000","#ffa500","#a67b5b","#a52a2a","#3c341f","#00b7eb","#769ad4","#0000ff","#800080","#b768a2","#696969","#ff0000"]
                        }
                        var col = _.sample(color)
                        
                      
                        CerLine = new google.maps.Polyline({
                            path: c,
                            strokeColor: col,
                            strokeOpacity: 1.0,
                            strokeWeight: 3,
                            title:`<div>
                            <b>Nom :</b><span>${infoCer[i].device}</span><br></br>
                            <b>Date :</b><span>${infoCer[i].date}</span><br></br>
                            <b>Matricule :</b><span>${infoCer[i].license_plate}</span><br></br>
                            
                            <b>Fonction :</b><span>${infoCer[i].fonction}</span>
                            </div>`
                            
                            
                        });
                        this.state.dateInfo[i].color=col
                        this.state.dateInfo[i].i=i


        
                        
                        
                        color = _.without(color, col)
                        this.polyline_list.push(CerLine)
        
                        i++
                    });

                    this.state.dateInfo = this.state.dateInfo.filter(line => line.nbPos != 0)

                    //console.warn(this.state.dateInfo);
                    
        
                    this.c = cer

                    
                   
                    this.polyline_list.forEach(element => {
                        element.setMap(this.map)
                        
                        //console.log("element ",element);
                        element.addListener("click", (e) => {
                            if (self.infowindowTrac!=null) {
                                //alert(1)
                                self.infowindowTrac.close();
                            }

                            self.infowindowTrac = new google.maps.InfoWindow({
                                content: element.title,
                                maxWidth: 200,
                                position:e.latLng
                            });
                            //alert(1); 
                            self.infowindowTrac.open(self.map);
                        });
                    });
                    
                    this.hideDev(0)
                    //this.i=!this.i
                    var self=this;

                    document.addEventListener("click", async function(event) {
                        if (event.target.classList.value.startsWith('mult-')) {
                            document.getElementById('loader_ish').style.display='block'
                            document.getElementById('resizable-bottom').style.height='120px'


                            var randomUUID = self.generateUUID();
                           // console.warn(randomUUID);

                            if (self.trancheTrac) {
                                
                                self.trancheTrac.setMap(null)
                                self.marker_tranch.setMap(null)
                                self.trancheTrac=null
                            }

                            const parent = event.target.parentNode
                            const sp = event.target.classList.value//.split('-')[1];
                            let idd = parent.childNodes[0].childNodes[0].textContent.trim().split('-')[1]
                            let startDate = parent.childNodes[2].textContent.trim()
                            let endDate = parent.childNodes[2].textContent.trim() 
                            self.state.period[0] =  startDate
                            self.state.period[1] =  endDate
                            self.state.period[3] =  '23:59:59'
                            self.state.period[2] = '00:00:00'
                            
                            //console.warn(self.state.period[2],self.state.period[3]);
                            try{
                                var r = []
                                Promise.all(
                                        r= await rpc.query({
                                            model: 'fleet.vehicle.positions2',
                                            method: 'calculePosHis',
                                            args: [[], idd,startDate + ' 00:00:00' , endDate + ' 23:59:59' , randomUUID]
                                        }),
                                        
                                )
                                //console.log("res calcul = ",r);
                                
                            }catch(error){
                                console.error(error)
                            }

                            //console.log(event.target.classList.value.startsWith('mult-'))
                            
                            // parent.childNodes[6].textContent.trim()
                            
                            
                            var selected_line = document.querySelectorAll('[id^="tr-"]')
                            selected_line.forEach((elem)=>{
                                elem.classList.remove('selected_line')
                                
                            })

                            document.querySelector('#tr-'+sp.split('-')[1]).classList.add('selected_line')

                            //console.log(parent);
                            //console.log("log ",sp,parent.childNodes[0].childNodes[0].textContent.trim().split('-')[1]);

                            
                            var path

                            
                            

                            let p = 0
                            self.polyline_list.map((polyline)=>{
                                //console.log(polyline);
                                if (p==parent.childNodes[0].childNodes[0].textContent.trim().split('-')[0]) {
                                    polyline.setMap(self.map)
                                    path = polyline.getPath();
                                    //console.log("*",polyline);
                                    
                                } else {
                                    polyline.setMap(null)
                                    
                                }
                                
                                p++
                            })
                            

                            if (self.openFormAction) {
                                let div = document.querySelector('#resizable-bottom')
                                div.append(document.getElementById('paragraph'))
                                if (div.querySelector('.modal-content')) {
                                    
                                    div.querySelector('.modal-content').remove()
                                    
                                }
                            

                                self.openFormAction=false
                                
                                
                            }

                            self.infoCheck = true
                            self.openForm(idd,startDate,randomUUID)

                            
                            let start
                            let end
                            const markerIcon = {
                                url: '/is_historique/static/img/start.png', 
                                scaledSize: new google.maps.Size(30, 40) 
                            };

                            const markerIconEnd = {
                                url: '/is_historique/static/img/end.png', 
                                scaledSize: new google.maps.Size(30, 40) 
                            };

                            
                           
                           
                            if (path.getLength() != undefined && path.getLength() > 0) {
                        
                                self.delete_old_marker()
                                start = {lat:path.getAt(0).lat() ,lng:path.getAt(0).lng()}
                                end = {lat:path.getAt(path.getLength()-1).lat() ,lng:path.getAt(path.getLength()-1).lng()};

                                ///console.warn(start);
                                self.marker_list[0] = new google.maps.Marker({
                                    position: start,
                                    icon: markerIcon,
                                    map: self.map,
                                    draggable: false
                                });

                                self.marker_list[1] = new google.maps.Marker({
                                    position: end,
                                    icon: markerIconEnd,
                                    map: self.map,
                                    draggable: false
                                });
                              

                                self.map.setCenter(start)
                                
                                
                            }else{
                                
                                // self.notification.add("", {title: "", type: "danger"});
                            }
                            


                            self.i = true
                            self.multCheck==true
                            self.hideDev(0)
                            document.getElementById('info-split').style.display='block'
                            document.getElementById('loader_ish').style.display='none'

                            

                        }


                            // onClick dans le tableau des shifts
                        if (event.target.classList.value.startsWith('o_data_cell')) {
                            const sp = event.target.classList.value.split('-')[1];
                            //document.getElementById('dev').style.display='none'
                            
                            if (self.trancheTrac) {
                                
                                self.trancheTrac.setMap(null)
                                self.marker_tranch.setMap(null)
                                self.trancheTrac=null
                            }
                            
                            const parent = event.target.parentNode

                            let deviceid
                            let date 
                            let hdeb 
                            let hfin 
                            if (window.screen.width < 743) {
                                deviceid = parent.childNodes[4].textContent.trim()
                                date = parent.childNodes[1].innerText
                                hdeb = parent.childNodes[10].innerText
                                hfin = parent.childNodes[16].innerText
                            } else {
                                deviceid = parent.childNodes[5].textContent.trim()
                                date = parent.childNodes[2].innerText
                                hdeb = parent.childNodes[11].innerText
                                hfin = parent.childNodes[17].innerText
                            }
                            

                            let d1 = date+' '+hdeb
                            let d2 = date+' '+hfin
                            
                            
                            const maker = {
                                url: '/is_historique/static/img/ping.png', 
                                scaledSize: new google.maps.Size(50, 50) 
                            };
                            

                            //console.log(t,f,d);

                            var pos1 = self.state.listPosition.filter(p=>
                                //p.fixtime.substring(0,19) >= date+' '+hdeb && p.fixtime.substring(0,19) <= date+' '+hfin 
                                p.deviceid == deviceid
                            )

                            //console.warn(deviceid,pos1);
                            var oneCer=[]
                            var pos = self.state.listPosition.filter(p=>
                                p.fixtime.substring(0,19) >= date+' '+hdeb && p.fixtime.substring(0,19) <= date+' '+hfin && p.deviceid == deviceid
                            ).map(p=>{
                                oneCer.push({lat: p.latitude, lng: p.longitude})
                            })

                            
                           // console.log("-*-",oneCer);
                            self.marker_tranch = new google.maps.Marker({
                                position: {lat:oneCer[Math.floor(oneCer.length/2)].lat, lng:oneCer[Math.floor(oneCer.length/2)].lng},
                                icon: maker,
                                map: self.map,
                                draggable: false
                            });

                            self.trancheTrac = new google.maps.Polyline({
                                path: oneCer,
                                strokeColor: '#16FF00',
                                strokeOpacity: 2.0,
                                zIndex:10,
                                strokeWeight: 4,
                                map:self.map
                            
                            });

                           

                            const mapHeightBelowMarker = -0.50; 
                            const centerLat = oneCer[Math.floor(oneCer.length / 2)].lat;
                            const centerLng = oneCer[Math.floor(oneCer.length / 2)].lng;

                          

                            if (self.map && self.map.getBounds() !== null && self.map.getBounds() !== undefined) {
                                const mapCenterBelowMarker = new google.maps.LatLng(
                                    centerLat + (mapHeightBelowMarker * (self.map.getBounds().getNorthEast().lat() - centerLat)),
                                    centerLng
                                );

                                self.map.setCenter(mapCenterBelowMarker);
                            }
                                                    
                        }
                    
                    })
                
            
                    this.map.setZoom(12)
                    this.c=cer=[]
                } else {
                    this.state.intervalError=true
                    this.message='Interval de temps supérieur à 8 jours!'
                    document.getElementById('spl').style.opacity=0.3
                    document.getElementById('spl').style.pointerEvents='none'
                }
            }

          

            document.getElementById('loader_ish').style.display='none'
        }

      
    }
        

    closePopUp(){
        this.state.intervalError=false;
        document.getElementById('spl').style.opacity=1
        document.getElementById('spl').style.pointerEvents='all'
    }
    

   


    async uncheckAllCheckboxes() {
        var self=this;
        const vehiculeDiv = document.getElementById("vehicules");
        const vehiculeDiv2 = document.getElementById("vehicules2");
    
        const resetButton = document.createElement("div");
        resetButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 0 0 0 0h.4c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V448c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H176c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"/></svg>';
        resetButton.style.display = "inline";
    
        resetButton.addEventListener("click", async function () {
            
            $("#jstree_ish").jstree().close_all()
            $("#jstree_ish").jstree().uncheck_all();
            self.delete_old_marker()
            self.delete_old_polyline()
            document.getElementById('_is_hist_multi_btn').style.display='none'
            document.getElementById("iconcancel").click()

       
            // rotation 
            let rotation = 0;
            const rotationInterval = setInterval(() => {
                rotation += 10; 
                resetButton.querySelector("svg").style.transform = `rotate(${rotation}deg)`;
        
                if (rotation >= 360) {
                    clearInterval(rotationInterval);
                    resetButton.querySelector("svg").style.transform = ""; 
                }
            }, 20);
        });
        
        const val = document.getElementById("veh");
        val.appendChild(resetButton);
        
    }
    
    
    
   
    
    



    logo() {
        var divRoot = document.getElementById("root1");
        divRoot.style.borderRadius = "7px";
        divRoot.style.margin = "7px";
        divRoot.style.width="auto"
        divRoot.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)";

        var logodiv = document.getElementById("logo");
        var marquee = document.createElement("marquee");
        marquee.textContent = "";
        logodiv.appendChild(marquee);

        marquee.style.backgroundColor = "#71639E"; // Purple color of Odoo
        marquee.style.color = "white"; // White text color
        marquee.style.padding = "10px"; 
        marquee.style.fontSize = "25px"
        marquee.style.fontFamily = "Arial, sans-serif"; // Specify a font family
        marquee.style.fontWeight = "bold"; // Make the text bold
        marquee.style.textShadow = "2px 2px 4px rgba(0, 0, 0, 0.3)"; // Add a subtle text shadow
    
    }
    

    event_for_table =   async (event) => {
        // onClick dans le tableau des traces 
 
        if (event.target.classList.value.startsWith('his-')) {
            document.getElementById('loader_ish').style.display='block'
            document.getElementById('resizable-bottom').style.height='120px'
            //alert(1)
            this.tableClick=true
            this.infoCheck=true
            this.i=true
            

            var randomUUID = this.generateUUID();
            //console.warn(randomUUID);

            if (this.trancheTrac) {
                // supp le tranch de trace
                this.trancheTrac.setMap(null)
                this.marker_tranch.setMap(null)
            }

            
            //this.hideDev(0)
            document.getElementById('infoMult').style.display='none'
            const sp = event.target.classList.value.split('-')[1];

            var selected_line = document.querySelectorAll('[id^="tr-"]')
            selected_line.forEach((elem)=>{
                elem.classList.remove('selected_line')
               
            })

            document.querySelector('#tr-'+sp).classList.add('selected_line')
            
            //console.warn(event.target.parentNode.childNodes[1].textContent.trim(),this.v);
            var id = this.v.filter(vehicule => vehicule.device.replace(/ /g, '') == event.target.parentNode.childNodes[1].textContent.trim())
            //console.log("*",event.target.parentNode.childNodes[0].style.backgroundColor,id[0].id, event.target.parentNode.childNodes[4].textContent.trim());

            let p = 0
            this.polyline_list.map((polyline)=>{
                if (p==event.target.parentNode.childNodes[0].childNodes[0].textContent.trim()) {
                    polyline.setMap(this.map)
                    
                } else {
                    polyline.setMap(null)
                    
                }
                
                p++
            })
            let startDate = event.target.parentNode.childNodes[4].textContent.trim()
            let endDate = event.target.parentNode.childNodes[4].textContent.trim()
            
            this.state.period[0] =  startDate
            this.state.period[1] =  endDate
            this.state.period[3] =  '23:59:59'
            this.state.period[2] = '00:00:00'

            

            //await this.dataBacsFetch(id[0].id,startDate +' ' + '00:00:00', endDate +' ' + '23:59:59')

            
            try{
                var r = []
                Promise.all(
                    r= await rpc.query({
                        model: 'fleet.vehicle.positions2',
                        method: 'calculePosHis',
                        //args: [[], id[0].id,startDate + ' ' + this.state.period[2], endDate + ' ' + this.state.period[3]]
                        args: [[], id[0].id,startDate + ' 00:00:00' , endDate + ' 23:59:59' ,randomUUID]
                    }),
                    // this.bacs= await rpc.query({
                    //     model: 'fleet.vehicle',
                    //     method: 'get_num_bacs_historique',
                    //     args: [[],id[0].id,startDate,endDate]
                    // })
                )
                //console.log("res tets 777= ",r);
            
            }catch(error){
                console.error(error)
            }

            this.state.typeColl = this.state.typeColl.split(':')[0] +':'+ this.bacs.length


            //console.warn(this.state.typeColl);

            if (this.openFormAction) {
                let div = document.querySelector('#resizable-bottom')
                div.append(document.getElementById('paragraph'))
                if (div.querySelector('.modal-content')) {
                    
                    div.querySelector('.modal-content').remove()
                    
                }// else{
                //     this.openForm(id[0].id, this.state.period[0])
                // }
              

                this.openFormAction=false
                
                
            }

            // appele fun pour cree tableau des shift avec view odoo
            
            this.openForm(id[0].id, this.state.period[0],randomUUID)
            
            //this.icon=!this.icon
            if (window.screen.width < 743) {
                
                this.hideDev(0)
            }

            
            let start
            let end
            const markerIcon = {
                url: '/is_historique/static/img/start.png', 
                scaledSize: new google.maps.Size(30, 40) 
            };

            const markerIconEnd = {
                url: '/is_historique/static/img/end.png', 
                scaledSize: new google.maps.Size(30, 40) 
            };

            // makers debut et fin de tracage selectioner
            if (this.c[0] != undefined) {
                if (this.c.length>1) {
                    this.delete_old_marker()
                    start = this.c[sp][0]
                    end = this.c[sp][this.c[sp].length-1]


                    this.marker_list[0] = new google.maps.Marker({
                        position: start,
                        icon: markerIcon,
                        map: this.map,
                        draggable: false
                    });

                    this.marker_list[1] = new google.maps.Marker({
                        position: end,
                        icon: markerIconEnd,
                        map: this.map,
                        draggable: false
                    });
                } 

                this.map.setCenter(start)
                
                
            }

            document.getElementById('loader_ish').style.display='none'
            
            
        }



        // onClick dans le tableau des shifts
        if (event.target.classList.value.startsWith('o_data_cell')) {
            const sp = event.target.classList.value.split('-')[1];
        
            if (this.trancheTrac) {
                
                this.trancheTrac.setMap(null)
                this.marker_tranch.setMap(null)
                this.trancheTrac=null
            }
            const parent = event.target.parentNode
            let deviceid
            let date 
            let hdeb 
            let hfin 
            if (window.screen.width < 743) {
                deviceid = parent.childNodes[4].textContent.trim()
                date = parent.childNodes[1].innerText
                hdeb = parent.childNodes[10].innerText
                hfin = parent.childNodes[16].innerText
            } else {
                deviceid = parent.childNodes[6].textContent.trim()
                date = parent.childNodes[2].innerText
                hdeb = parent.childNodes[11].innerText
                hfin = parent.childNodes[17].innerText
            }
            

            let d1 = date+' '+hdeb
            let d2 = date+' '+hfin
            
            
            const maker = {
                url: '/is_historique/static/img/ping.png', 
                scaledSize: new google.maps.Size(50, 50) 
            };
            
            var oneCer=[]
            var pos = this.state.listPosition.filter(p=>
                p.fixtime.substring(0,19) >= date+' '+hdeb && p.fixtime.substring(0,19) <= date+' '+hfin
            ).map(p=>{
                oneCer.push({lat: p.latitude, lng: p.longitude})
            })

            
            this.marker_tranch = new google.maps.Marker({
                position: {lat:oneCer[Math.floor(oneCer.length/2)].lat, lng:oneCer[Math.floor(oneCer.length/2)].lng},
                icon: maker,
                map: this.map,
                draggable: false
            });

            this.trancheTrac = new google.maps.Polyline({
                path: oneCer,
                strokeColor: '#16FF00',
                strokeOpacity: 2.0,
                zIndex:10,
                strokeWeight: 4,
                map:this.map
               
            });


            const mapHeightBelowMarker = -0.50; 
            const centerLat = oneCer[Math.floor(oneCer.length / 2)].lat;
            const centerLng = oneCer[Math.floor(oneCer.length / 2)].lng;

            

            if (this.map && this.map.getBounds() !== null && this.map.getBounds() !== undefined) {
                const mapCenterBelowMarker = new google.maps.LatLng(
                    centerLat + (mapHeightBelowMarker * (this.map.getBounds().getNorthEast().lat() - centerLat)),
                    centerLng
                );

                this.map.setCenter(mapCenterBelowMarker);
            }


            
           
        }

        if (event.target.classList.value.startsWith('bb_')) {
            const sp = event.target
            var selected_line = document.querySelectorAll('[id^="bb_"]')
            selected_line.forEach((elem)=>{
                elem.classList.remove('selected_line')
                
            })            


            document.querySelector('#bb_'+sp.parentNode.id.split('_')[1]).classList.add('selected_line')

            //console.log(event.target.parentNode.childNodes[1].innerText);
            document.getElementById('loader_ish').style.display='block'
            if (this.trac!=null) {
                this.trac.setMap(null)
                this.trac=null
            }
            var id = this.v.filter(vehicule => vehicule.device.replace(/ /g, '') == event.target.parentNode.childNodes[1].innerText)
            var date = event.target.parentNode.childNodes[0].innerText
            if (this.marker_list.length != 0) {
                
                this.delete_old_marker()
            }
            
            //console.warn(id,date);
            this.tracage(id,date)
           
        }
    }



    
    // Delete old markers from the map
    delete_old_marker() {
        if(this.marker_list!=[] || this.marker_list !=null)
            for (var i = 0; i < this.marker_list.length; i++) {
                this.marker_list[i].setMap(null);
                
            }
    }

    delete_old_polyline() {
        if(this.polyline_list!=[] || this.polyline_list !=null)
            for (var i = 0; i < this.polyline_list.length; i++) {
                this.polyline_list[i].setMap(null);
                
            }
    }


    loadJquery() {
        return new Promise((resolve, reject) => {
          const script0 = document.createElement("script");
          script0.src = `https://www.jqueryscript.net/demo/Split-Layout-Plugin-jQuery-Splitter/js/jquery.splitter.js?ver=1`;
          script0.id = "treeHisto"
          script0.onload = resolve;
          script0.onerror = reject;
          document.body.appendChild(script0);
        });
    }

    
    loadGoogleMapsAPI() {
    
        if (!document.getElementById("mapApiHisto")) {
                
            return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB-dn4yi8nZ8f8lMfQZNZ8AmEEVT07DEcE&libraries=places&region=ma`;
            script.id = "mapApiHisto"
            script.defer = true; 
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
            
            });
        }
        
    }
    
    async initMap() {
        
        try {
            if (!document.getElementById("treeHisto")) {
                await this.loadJquery();
            }
            
            if (!document.getElementById("mapApiHisto")) {
                
                await this.loadGoogleMapsAPI();
                const {Map,Marker} = await window.google.maps.importLibrary("maps");
        
                this.map = new Map( document.getElementById('mapid') ,{
                    center: { lat: 33.964451, lng: -6.842338 },
                    zoom: 12,
                    gestureHandling: "greedy"
                });

                document.body.removeChild(document.getElementById("mapApiHisto"));
            }
    
    

        }catch (error) {
           
            //console.log(error);
            
        }
        
       
        
    }

}

FleetMapComponent.template = "is_historique.MapHistorique_vehicule";
registry.category("actions").add("action_is_historique_vehicule", FleetMapComponent);
