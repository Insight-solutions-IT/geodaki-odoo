/** @odoo-module **/

import { registry } from "@web/core/registry";
const rpc = require('web.rpc');
import { useService } from "@web/core/utils/hooks";
import { TestComponent, drawZoneDaki, delete_zones_Daki ,renderCircuit} from "../../../../is_decoupage/static/src/js/function";


const { Component, onWillStart ,onMounted ,useState} = owl;
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
     circuitTest=[]
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
            typeTreee : true,
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
this.infowindowTrac2 = null
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

            // var r= await rpc.query({
            //     model: 'fleet.vehicle',
            //     method: 'get_map_dataHis',
            //     args: [[]],
            // })
            
            

            // if (localStorage.getItem('pageReloaded')!='true') {
            //     window.location.reload()
            //     localStorage.setItem('pageReloaded', 'true');
            // }
            
            // setTimeout(() => {
            //     localStorage.setItem('pageReloaded', 'false');
            // }, 3000);
            

            //$('head').append(`<link href="${window.location.origin}/is_historique/static/css/map_view.css" rel="stylesheet" id="newcss" />`);
            this.handlechangestyle()
            if ( window.screen.width < 743 ) {
            // Perform a specific action for larger screens (PC)
                document.getElementById("container-bottom").style.flex="0";
                document.getElementById("dev_ish").style.flex="auto"
                document.getElementById("searchButton").style.left="100%"
                document.getElementById("searchButton").style.transform="translate(-50px, 2px)"
            }else{
                document.getElementById("container-bottom").style.flex="3";
                document.getElementById("dev_ish").style.flex="1"
                //document.getElementById("dev_ish").style.display="block"
            }
            //if (this.mymodule) {
                
            //this.testGetSelect()
            //this.test()
            //this.getAllTasks()
            //if ( window.screen.width < 994 ) {
                // document.getElementById('homeButton').style.top='45px'
                //document.getElementById('hidebutton').style.top='45px'
            //}
            this.logo();
            await this.initMap();
            //if ( window.screen.height < 700 ) {
                //alert(1)
                // document.getElementById('homeButton').style.top='45px'
                //document.getElementById('hidebutton').style.top='45px'
            //}
            
            //this.getVehicleTree();
            //await this.get_map_data();
                //this.get_data_with_interval();
            await this.uncheckAllCheckboxes();
            //this.buttonEventListener();
            //this.LoadTree()
            
            this.treeJs_ish()
            
          
            


            

            
            
            var self=this;
            
            //}

            
                
     
            

            document.getElementById("hidebutton").addEventListener("click",function(){
                
                //self.vehiculeListVisiblity();
                //if (!this.infoCheck) {
                    
                self.hideDev(0)
                // }else{
                //     self.hideDev(1)
                // }
            })
            

            
            document.getElementById("iconcancel").addEventListener("click",function(){
                
          
                document.getElementById('searchInputRef').value=''
                //if (document.getElementById('jstreeCir_ish').style.display=='none') {
                    // $('#jstree_ish').jstree('search', '');
                   
                    // $("#jstree_ish").jstree().close_all()
                    // $("#jstree_ish").jstree().uncheck_all();
        
               // } else {
                    $('#jstreeCir_ish').jstree('search', '');
                
                    
                    $("#jstreeCir_ish").jstree().close_all()
                    
               // }

                
                
                document.getElementById('_is_hist_multi_btn').style.display='none'
                document.getElementById('iconsearch').style.display='block'
                document.getElementById('iconcancel').style.display='none'
                
        
            })
            
                
           

            
            
        
           
            
            // $("#updatePanelSample").colResizable({
            //     liveDrag:true, 
            //     postbackSafe:true,
            //     partialRefresh:true
            // });	
            
            //$( "#resizable" ).resizable();
            
            //$('table.resizable').resizableColumns();



            
            
        

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
                    ////console.log(lastDownX , container.offsetTop ,window.screen.height);
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
                    //console.log(e.clientY , container.offsetTop ,window.screen.height);
                    //console.log("===",document.getElementById('detailInfo').style.height,(((20 * parseInt(document.getElementById('detailInfo').style.height.substring(0,2))) / 100)))// = '100px'//document.getElementById('detailInfo').style.height - 
                    
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
        .catch(error => 
            console.log('error', error
            ));

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
        //console.log(currentURL)
        const urlParams =  new URLSearchParams(currentURL)
        const actionValue = urlParams.get('action');
        //console.log('Action Value:', actionValue);
        
        if(actionValue != 384){
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
                    res_model: "is_historique.calcule", // Replace with your model name
                    //res_id: id, // Replace with the specific vehicle ID
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
                           
                            //console.log("x[0].childNodes ",x[0].childNodes);
                            //console.log("x[0] = ",x[0].childNodes.length-1,x[0].childElementCount,x[0].childNodes[x[0].childNodes.length-2]);

                            var d = x[0].childNodes[x[0].childNodes.length-2]
                            //console.log(d.childNodes[0].childNodes[0].childNodes[0]);
                            

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
        //console.log("----",this.i);
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
                    // Perform a specific action for larger screens (PC)
                    button.animate({
                        top: "40px"
                    }, 400, function() {});
                
                } 
                //alert(1)
                
                
                //console.log("this.infoCheck befor - this.i - mult",this.infoCheck ,this.i,mult);
                
                

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


    hideDevCir(){
        //
        //this.icon=!this.icon
        //alert(1)
        if (this.icon) {
            document.getElementById('ic-right').style.display="none"
            document.getElementById('ic-left').style.display="block"
        }else{
            document.getElementById('ic-right').style.display="block"
            document.getElementById('ic-left').style.display="none"
        }
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
            
            
            if(!this.i){
    
                if (screenWidth > thresholdWidth && screenHeight > thresholdHeight) {
                    // Perform a specific action for larger screens (PC)
                    button.animate({
                        top: "40px"
                    }, 400, function() {});
                
                } 
                
                
                
                
                

                
                document.getElementById("container-bottom").style.flex="0";
                document.getElementById("dev_ish").style.flex="3";
                document.getElementById('info-split').style.display='none'
                document.getElementById('dev_ish').style.display='block'
                       // this.infoCheck=false
                    
                    
                    
                

                //
            }else{
                if (screenWidth > thresholdWidth && screenHeight > thresholdHeight) {
                    // Perform a specific action for larger screens (PC)
                    button.animate({
                        top: "129px"
                    }, 400, function() {
                        // Animation complete
                    });
                    
                } 

                
                    
                        
                       
                        document.getElementById("container-bottom").style.flex="1";
                        document.getElementById("dev_ish").style.flex="0";
                        document.getElementById('dev_ish').style.display='none'
                        document.getElementById('info-split').style.display='none'
                        
                    
                
                               
               
                
    
               
                
              
    
            }
        } else {
            this.i=!this.i;
            if(this.i){

        
                if (screenWidth > thresholdWidth && screenHeight > thresholdHeight) {
                    
                    button.animate({
                        top: "40%",
                        left:'25%'
                    }, 200, function() {});
                
                } 
                
                
                
                    
                    
                
                document.getElementById("container-bottom").style.flex="3";
                document.getElementById("dev_ish").style.flex="1";
                document.getElementById('info-split').style.display='none'
                
                
               
                
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


                
                 
                    
                
                document.getElementById("container-bottom").style.flex="3";
                document.getElementById("dev_ish").style.flex="1";
                document.getElementById('info-split').style.display='none'
                
                
                
                document.getElementById('infoCircuit').style.display='none'
                document.getElementById('dev_ish').style.display='none'
                
                            


                
                
                
            

            }

            
        }
        this.i = !this.i
        

      
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
                this.v =  result;
                //this.v2 = result
            }),
            rpc.query({
                model: 'fleet.vehicle.group',
                method: 'get_map_data2',
                args: [[]],
            }).then(result => {
                this.g =  result;
                //this.g2 = result
            }),
            rpc.query({
                model: 'is_decoupage.circuits',
                method: 'get_circuit_isdecoupageHisto',
                args: [[]],
            }).then(result => {
                this.circuits =  result;
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


    // async loadScript(char) {
    //     return new Promise((resolve, reject) => {
    //       const script = document.createElement("script");
    //       script.src = char;
    //       script.onload = resolve;
    //       script.onerror = reject;
    //       document.body.appendChild(script);
    //     });
    // }
    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
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
        this.testdata()
        
        var self = this;
        var vehicules = [];
        var groups = [];
        var circuits = []
    
        // Fetch vehicle and group data
        await Promise.all([
            
            
            rpc.query({
                model: 'is_decoupage.circuits',
                method: 'get_circuit_isdecoupageHisto',
                args: [[]],
            }).then(result => {
                circuits = result;
                //console.log("cercuits = ",circuits);
            })
            
            ,
            rpc.query({
                model: 'fleet.vehicle.group',
                method: 'get_map_data2',
                args: [[]],
            }).then(result => {
                groups = result;
               // console.log('get group = ', result);
            })
        ]);
        
        try {

            
            
            localStorage.removeItem('jstree');

            // this.v.forEach(element => {
            //     element.id=element.id.replace('d','')
            // });

            
            
        
            
                
            
                

           
            //console.log("group =",this.circuits);
            circuits.forEach(element => {
                element.id='g'+element.id
            });

            


            
            //console.log("group after =",this.circuits);

            const nestedDataCir = this.createNestedDataCer(circuits, groups);    
            // this.circuits.forEach(element => {
            //     element.id=element.id.replace('g','')
            // });
        $("#jstreeCir_ish")
            .jstree({
                core: {
                    cache: false,
                    //   check_callback: true,
                    data: nestedDataCir,
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
                    //'dnd',
                    'search',
                    'state',
                    'types',
                    "sort",
                    //'wholerow',
                    //'checkbox',
                ],
            }).on('click', '.vehicle-icon', function(e) {
                const vehicleDevice = $(this).closest('.vehicle-node1').find('.vehicle-device').text();
                document.getElementById('loader_ish').style.display='block'
                self.firstcir=true
                self.showInfoCircuit(vehicleDevice)
                
            })

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
                $('#jstreeCir_ish').jstree('search', searchString);
            });
        
            document.getElementById('loader_ish').style.display='none'
    



        } catch (error) {
            console.error('Error loading tree script:', error);
        }

        
    }

   


    createNestedDataCer(vehicles, groups) {
        
        
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
                        (vehicle.group === groupId &&
                            vehicle.group === parentGroupId) ||
                        vehicle.group === parentGroupId
                )
                .map((vehicle) => ({
                    id: vehicle.id.toString(),
                    text: `
                    <div class="vehicle-node1">
                        <span class="vehicle-device">${vehicle.name}</span>`+feet,
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
        //console.log("neted  =",nestedData);

        return nestedData;
    }
    
    

        


    // fun pour afficher le circuit
    async showInfoCircuit(image){
        //alert(1)
        this.polyline_list=[]
        this.state.infoPlanning =[]
        this.i=false
        this.infoCheck=false
        delete_zones_Daki(this.zone,this.zoneLabel)
        
        
        
        
        
        
        //console.log("this.v =",this.v);
        // console.log(" =",);
        // console.log(" =",);
        this.delete_old_marker()
        this.delete_old_polyline()
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
        var cir = this.circuits.filter(vehicule => vehicule.name == image)

        
        var idd = cir[0].id

        

        var Planning = []
        var Circuits = []
        var Routes = []
        try{
            Promise.all(
                Planning= await rpc.query({
                    model: 'is_planning.is_planning',
                    method: 'getPlanningHistorique',
                    args: [[], idd, startDate, endDate]
                })
            )

            
            //console.log("res getPlanning = ",Planning);
            
        }catch(error){
            console.error(error)
        }

        var line_list = []
        
        // try{
        //     var r = []
        //     Promise.all(
        //         r= await rpc.query({
        //             model: 'is_decoupage.circuits',
        //             method: 'getCircuits_det2Historique',
        //             args: [[], idd]
        //         })
        //     )

            
            
        // }catch(error){
        //     console.error(error)
        // }
        try{
            var r = []
            var vv
            Promise.all(
                r= await rpc.query({
                    model: 'is_decoupage.routes',
                    method: 'getResult',
                    args: [[],idd,startDate, endDate]
                })
            ).then(()=>{
                if (r.length !=0) {
                    // r.forEach(route => {
                        
                    //     const coordinates = route.geom
                    //     .replace("MULTILINESTRING((", "")
                    //     .replace("))", "")
                    //     .split(",");
                    
                    //     var coor=[]
                    //     var coor2=[]
                    //     for(var i=0;i<coordinates.length;i++){
                    //         coor.push(coordinates[i].toString().split(" "))
                    //         //console.log({lat: coor[i][1],lng: coor[i][0]})
                    //         coor2.push({lat: parseFloat(coor[i][1]),lng: parseFloat(coor[i][0])})
                    //         Circuits.push({lat: parseFloat(coor[i][1]),lng: parseFloat(coor[i][0])})
                    //         var CerLine = new google.maps.Polyline({
                    //             path:coor2,
                    //             strokeColor: cir[0].color,//'#16FF00',//'#BE3144',
                    //             strokeOpacity: 1.0,
                    //             strokeWeight: 3,
                    //             title :`<div><h1> Circuit </h1> <hr><b>Nom : </b>${cir[0].name}<br><b>Fonction : ${cir[0].fonname}</b><br></div>`
                    //             // title :`<div><h1> Circuit </h1> <hr><b>Nom : </b>${cir[0].name}<br><b>Fonction : </b>${cir[0].fonction[1]}<br></div>`
                    //         });
                            
                            
                    //         this.polyline_list.push(CerLine)
                            
                    //     }
                    
                        
                    // }
                    // );

                   

                    // this.polyline_list.forEach((elem)=>{
                    //     elem.setMap(this.map)

                    //     elem.addListener("click", (e) => {
                    //         if (this.infowindowTrac!=null) {
                    //             //alert(1)
                    //             this.infowindowTrac.close();
                    //         }
    
                    //         this.infowindowTrac = new google.maps.InfoWindow({
                    //             content: elem.title,
                    //             maxWidth: 200,
                    //             position:e.latLng
                    //         });
                    //         //alert(1); 
                    //         this.infowindowTrac.open(this.map);
                    //     });
                    // })
                    renderCircuit(r[0].name,this.circuitTest,this.map,'click',`<div><h1> Circuit </h1> <hr><b>Nom : </b>${cir[0].name}<br><b>Fonction : ${cir[0].fonname}</b><br></div>`,this.infowindowTrac2 )
        
                    // TestComponent(this.map ,24,'2023-11-28')
        
                    document.getElementById('container-bottom').style.display='block'
                    document.getElementById('home').style.display='none'
                    document.getElementById('info').style.display='none'
                    document.getElementById('infoCircuit').style.display='block'
                    document.getElementById('homeButton').style.display='block'
                    this.hideDevCir()
    
                    this.map.setCenter({lat: 33.986372, lng: -6.8162576})
                    this.map.setZoom(12)
                } else {
                    this.firstcir=false
                    this.state.intervalError=true
                    this.message='Aucune planification pour ce circuit!'
                }
                //console.log("cer = ",line_list);
            })
            //console.log("res getRoutes = ",r);
            let i = 0
            Planning.forEach((elem)=>{
                var x = this.v.filter(vehicule => vehicule.id == elem.deviceid)
                this.state.infoPlanning.push({i:i,con:'',idd:idd,device:x[0].device,service:'S',frequence:cir[0].frename,groupe:cir[0].groupname,date:elem.datej,hdeb:elem.hdeb.substring(11,19),hfin:elem.hfin.substring(11,19)})
                //this.state.infoPlanning.push({i:i,con:'',idd:idd,device:x[0].device,service:'S',frequence:'cir[0].frequence[1]',groupe:'cir[0].groupid[1]',date:elem.datej,hdeb:elem.hdeb.substring(11,19),hfin:elem.hfin.substring(11,19)})

                i++
                
            })


            
            
            
            

            //console.log("this.infoPlanning * ",this.state.infoPlanning);
            
        }catch(error){
            console.error(error)
        }
    



        var self=this;
        document.addEventListener("click",  this.event_for_table);

            
        
        

        document.getElementById('loader_ish').style.display='none'


    }


    // fun pour afficher les tracage de vehicule planifier
    async tracage(device,date){
        var trasageDevice = []
        var listPosition = []


        var line = []

        
        if (this.trac!=null) {
            this.trac.setMap(null)
            this.trac=null
        }
        

        try{
            var r = []
            Promise.all(
                r= await rpc.query({
                    model: 'fleet.vehicle.positions2',
                    method: 'affPosTracage',
                    args: [[],device[0].id,date]
                })
            ).then(()=>{

                trasageDevice = r


                //console.log("res tracage = ",r);
                r.forEach(element => {
            

                    listPosition.push({lat: element.latitude, lng: element.longitude})
                    
                })
    
               // console.log("p",listPosition);
                //listPosition.forEach((elem)=>{
                
                this.trac = new google.maps.Polyline({
                    path: listPosition,
                    strokeColor: '#5B0888',
                    strokeOpacity: 1.0,
                    strokeWeight: 4,
                    title:`<div>
                        <b>Nom :</b><span>${device[0].device}</span><br></br>
                        <b>Date :</b><span>${date}</span><br></br>
                        <b>Matricule :</b><span>${device[0].license_plate}</span><br></br>
                    
                        <b>Fonction :</b><span>${device[0].fonction[1]}</span>
                    </div>`
                });

                this.trac.setMap(this.map)

                this.trac.addListener("click", (e) => {
                    if (this.infowindowTrac!=null) {
                        //alert(1)
                        this.infowindowTrac.close();
                    }

                    this.infowindowTrac = new google.maps.InfoWindow({
                        content: this.trac.title,
                        maxWidth: 200,
                        position:e.latLng
                    });
                    //alert(1); 
                    this.infowindowTrac.open(this.map);
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
    
                if (listPosition[0] != undefined) {
                    
                    start = listPosition[0]
                    end = listPosition[listPosition.length-1]


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
                this.map.setZoom(13)
                
                //this.i=false
                //this.hideDevCir()
                if (window.screen.width < 743) {
                    
                    document.getElementById('dev_ish').style.flex='0'
                    document.getElementById('dev_ish').style.display='none'
                    document.getElementById("container-bottom").style.flex="1";
                    this.i=!this.i
                }
                document.getElementById('loader_ish').style.display='none'
                

            })
        }catch(error){
            console.error(error)
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
            if (document.getElementById('jstreeCir_ish')) {
                
                $('#jstreeCir_ish').jstree('search', '');
            }
           $("#jstreeCir_ish").jstree().close_all()
            
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
    
        // var backgroundImageDiv = document.createElement("div");
        // backgroundImageDiv.style.backgroundImage = "url('/is_historique/static/img/vehicules/logo1.png')";
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
        // logoImage.src = "/is_historique/static/img/vehicules/insight.png";
        // logoImage.alt = "Logo";
        // logoImage.style.width = "100px"; // Set the width and height as needed
        // logoImage.style.height = "100px";
        // logoImage.style.borderRadius = "50%";
        // logoContainer.appendChild(logoImage);
    }
    

    event_for_table =   async (event) => {
        // onClick dans le tableau des traces 
 
        



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
            const mapCenterBelowMarker = new google.maps.LatLng(
                oneCer[Math.floor(oneCer.length/2)].lat + (mapHeightBelowMarker * (this.map.getBounds().getNorthEast().lat() - oneCer[Math.floor(oneCer.length/2)].lat)),
                oneCer[Math.floor(oneCer.length/2)].lng
            );

            this.map.setCenter(mapCenterBelowMarker);

            
           
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
            var id = this.v.filter(vehicule => vehicule.device == event.target.parentNode.childNodes[1].innerText)
            var date = event.target.parentNode.childNodes[0].innerText
            if (this.marker_list.length != 0) {
                
                this.delete_old_marker()
            }
            
           // console.warn(id,date);
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
          script0.onload = resolve;
          script0.onerror = reject;
          document.body.appendChild(script0);
        });
    }

    
    loadGoogleMapsAPI() {
        return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB-dn4yi8nZ8f8lMfQZNZ8AmEEVT07DEcE&libraries=places&region=ma`;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
        
        });
        
    }
    
    async initMap() {
        
        try {
            await this.loadJquery();
            await this.loadGoogleMapsAPI();
    
    
            const {Map,Marker} = await window.google.maps.importLibrary("maps");
    
            this.map = new Map( document.getElementById('mapid') ,{
                center: { lat: 33.964451, lng: -6.842338 },
                zoom: 12,
                gestureHandling: "greedy"
            });

        }catch (error) {
           
            //console.log(error);
            
        }
        
       
        
    }

}

FleetMapComponent.template = "is_historique.MapHistorique";
registry.category("actions").add("action_is_historique", FleetMapComponent);
