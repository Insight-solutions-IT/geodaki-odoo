/** @odoo-module **/

import { registry } from "@web/core/registry";
const rpc = require('web.rpc');
import { useService } from "@web/core/utils/hooks";

const { Component, onWillUnmount, onMounted, useState } = owl;
export class queryExecution extends Component {
    setup() {
        this.state = useState({
            params: [],
            queryName: '',
            result: [],
        });

        this.groupname = ''

        this.allparams = []

        onWillUnmount(async ()=>{
           
            $('body').append(` <div  id="myloader" style="display: flex;position: absolute;overflow: hidden auto;z-index: 13;width: 100%;height: 100%;left: 0vw;min-height: 200px;bottom: 0px;justify-content: center;text-align: left;"> <div  id="loader" style=" position:absolute;top:0px;height:100%;width:100%;display: block;background-color: rgba(64, 64, 64, 0.5);z-index:600 !important">
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

        onMounted(async () => {
            // Access the parameters and query name from the context
           this.loadScript("https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js")
           this.loadScript("https://cdn.jsdelivr.net/npm/chart.js")
           this.loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js")
            

           var button = document.createElement('input');
           button.type = "button";
           var self = this;
           button.addEventListener("click", function() {
               self.downloadExcel(self.state.result);
           });
           button.value = "Telecharger Excel";
           
           // Apply CSS styles
           button.style.padding = "10px 15px";
           button.style.backgroundColor = "#4CAF50"; // Green background color
           button.style.color = "white";
           button.style.border = "none";
           button.style.borderRadius = "5px";
           button.style.cursor = "pointer";
           button.style.fontWeight = "bold";
           button.style.marginBottom = "5px";
           button.style.marginTop = "5px";
           button.style.marginLeft = "10px";
           
           document.getElementById("headerDiv").appendChild(button);
           

           var button2 = document.createElement('button');
        //    button2.type = "button";
           var self = this;
           button2.addEventListener("click", function() {
               self.exportPDF(self.state.result);
           });
           button2.textContent = "Telecharger Pdf";
           
           // Apply CSS styles
           button2.style.padding = "10px 15px";
           button2.style.backgroundColor = "red"; // Green background color
           button2.style.color = "white";
           button2.style.border = "none";
           button2.style.borderRadius = "5px";
           button2.style.cursor = "pointer";
           button2.style.fontWeight = "bold";
           button2.style.marginBottom = "5px";
           button2.style.marginTop = "5px";
           button2.style.marginLeft = "10px";
           button2.setAttribute('id' , 'pdfbutton')
           
           document.getElementById("headerDiv").appendChild(button2);


            setTimeout(async () => {
                const currentURL = window.location.href.split('#')[1];
                const urlParams =  new URLSearchParams(currentURL)
                const actionValue = urlParams.get('active_id');
                $('head').append(`<link href="${window.location.origin}/is_states/static/css/map_view.css"" rel="stylesheet" id="newcss" />`);

                var params= await rpc.query({
                    model: 'querydeluxe',
                    method: 'getParamsQuery',
                    args: [[],parseInt(actionValue)]
                });

              
            params.map((x)=>{
                 const  parammsobj = {
                   label :  x.label,
                   valuer  : x.valeur
                 }
                this.allparams.push(parammsobj)   
            })
   

                var type
                var query=type= await rpc.query({
                    model: 'querydeluxe',
                    method: 'getQueryName',
                    args: [[],parseInt(actionValue)]
                });
                if(query.length>0){
                query=query[0].query_name
                var parameters = []
                var i=0;
                params.forEach(param => {
                  parameters.push( param.valeur );
                  query = query.replaceAll(param.label, param.valeur+"");
                  
                });
                
                console.log(query )

                var group= await rpc.query({
                    model: 'querydeluxe',
                    method: 'getQueryGroup',
                    args: [[],parseInt(actionValue)]
                });

                console.log( "group" , group)
                this.groupname = group
                   
                var result1
                var  result= result1=this.state.result= await rpc.query({
                    model: 'querydeluxe',
                    method: 'executeQuery',
                    args: [[],query,parameters]
                });
                this.state.result = result;
                
                this.render();  
                // console.log(type)

if(type[0].chart==true){

    var canvas=document.createElement("canvas")

    canvas.id="chartDaki"

    document.getElementById('content').appendChild(canvas)
    const apc = document.getElementById('chartDaki');
    var labels = []
    var data = []
    result1.forEach(label=>{
        var keys = Object.keys(label);

        // Push the values of the first key into data
        data.push(label[keys[0]]);
        
        // Push the values of the second key into labels
        labels.push(label[keys[1]]);
    })
  var b = new Chart(apc, {
    type: 'bar',
    data: {
      labels:labels,
      datasets: [{
        label: '# of Votes',
        data: data,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}else{




                const table = document.getElementById('myTable');



    // Create table header
    const header = table.createTHead();
    const headerRow = header.insertRow();
    for (const key in result[0]) {
        if (result[0].hasOwnProperty(key)) {
            const th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        }
    }

    // Create table body
    const body = table.createTBody();
    result.forEach(rowData => {
        const row = body.insertRow();
        for (const key in rowData) {
            if (rowData.hasOwnProperty(key)) {
                const cell = row.insertCell();
                cell.textContent = rowData[key];

                // console.log(rowData)
            }
        }
    });

}
}else{
    document.getElementById('loader').style.display = 'none';
    alert("Veuillez Choisire une requette");
}
    document.getElementById('loader').style.display = 'none';
            }, 2000);

            




                // Continue with your logic...
            
        });
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

    
    
    downloadExcel(result1){


        const labels = Object.keys(result1[0]);
    
        // Calculate the number of keys
        const numberOfKeys = labels.length;
        const titleRowIndex = Math.floor(numberOfKeys / 2) -1;  // Adjusted for the empty row
    var ar=[Array(numberOfKeys).fill(null)]
    ar[titleRowIndex]="Insight Solutions"


    const combinedWorksheetData = [
              
       ar,
      labels,  
      ...result1.map(obj => labels.map(label => obj[label]))
  ];

        const worksheet = XLSX.utils.json_to_sheet(result1);

    const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "file");

XLSX.writeFile(workbook, "file Lists.xlsx", { compression: true });

    document.getElementById('loader').style.display='none';


    }

    exportPDF(result1){
        let button = document.getElementById('pdfbutton');
        const jsonData = result1;
        const element = document.getElementById('content');
        const newDiv = document.createElement('div');
        newDiv.setAttribute('id' , 'newdiv')
        newDiv.style.textAlign = 'center';
        // newDiv.style.display = 'none'
        const newH1 = document.createElement('h1');
        // const h2 = document.createElement('h2');
      
        newH1.innerHTML = `${this.groupname[0].namegroup} : ${this.allparams.map((x) => `<span style="color: green;">${x.label}: <span style="color: black;">${x.valuer}</span></span>`).join(' ')}`;


        // h2.textContent = ``
        
        newDiv.appendChild(newH1);
        // newDiv.appendChild(h2)
        newDiv.insertAdjacentHTML('afterbegin', `<img src='/is_states/static/description/logo.png' style="width:200px; height:80px" />`);

        element.insertBefore(newDiv, element.firstChild);
        button.innerHTML = `<img  style="width:20px; height:20px" src="/is_states/static/description/loader.gif" alt="Loading..."> Generating PDF`
        const pdfOptions = {
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
          jsPDF: {
            orientation: 'landscape',
            unit: 'in',
            format: 'A2',
            putOnlyUsedFonts: true,
            floatPrecision: 16,
          },
          filename: 'myfile.pdf',
          image: {
            type: 'jpeg',
            quality: 0.50,
          },
          html2canvas: { scale: 1 },
        };
        html2pdf().set(pdfOptions).from(element).save().outputPdf().then((pdf) => {
          button.innerHTML = 'Download PDF';
        }).catch((error) => {
          console.error('Error generating PDF:', error);
          button.innerHTML = 'Download PDF';
        });    
} 
}

queryExecution.template = "querydelux.queryExecution";
registry.category("actions").add("action_query_execution", queryExecution);
