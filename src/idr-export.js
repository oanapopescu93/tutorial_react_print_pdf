import jsPDF from "jspdf";
import 'jspdf-autotable'
import $ from "jquery";
import Canvg from 'canvg';

function IdrExport(props) {
    var name_pdf = props.name_pdf;
    var button_name = props.button_name;
    var landscape = props.landscape;

    if(typeof name_pdf === "undefined" || name_pdf === ""){
        name_pdf = "Export"
    }
    if(typeof button_name === "undefined" || button_name === ""){
        button_name = "Export"
    }
    if(typeof landscape === "undefined" || landscape === ""){
        landscape = "portrait"
    }
    
    var div_id = props.div_id;
    var pageW = 200;
    var pageMiddle = 105;
    if(landscape === 'landscape') {
        pageW = 287;
        pageMiddle = 148;
    }
    var pdf = pdf_new_doc(landscape);    
    var doc = pdf['doc'] 
    var pageHeight= pdf['pageHeight'];
    var position_top = pdf['position_final'];
    var copyright = 'Copyright © '+(new Date()).getFullYear()+' Idrive Inc.';    
    var ImageToLoad = new Image();  
    let v = null;
    var promise_img = [];    

    function click_export(payload) {
        if(typeof div_id !== "undefined" && div_id !== ""){
            pdf_copyright(doc, pageMiddle, doc.internal.getNumberOfPages());
            send_to_printable();
            Promise.all(promise_img).then(function(result){
                export_doc(payload).then(function(result){
                    pdf_pager(doc, doc.internal.getNumberOfPages()).then(function(a){
                        doc.save(payload+".pdf");      
                    });
                    
                });
            });
        } else {
            console.log('there is no id to print')
        }        
    }

    function send_to_printable(){
        if($('#printing_area').length > 0){
            $('#printing_area').find('svg').each(function(i){
                var svg = $(this);
                promise_img.push(jsPDFsvg(svg))
            });
        }           
    }    

    function export_doc(payload) {
        return new Promise(function(resolve, reject){
            if($('#'+ div_id).length > 0){
                $('#'+ div_id + ' *').each(function(i){
                    if (position_top>=pageHeight-10){
                        pdf_new_page(doc);
                        position_top = 10;
                    }  
                    switch($(this).get(0).tagName) {
                        case "H1":
                            doc.setFontSize(16);
                            doc.setTextColor(0,0,0);
                            doc.text(10, position_top, $(this).text(), null, null, 'left'); 
                            position_top = position_top + 10;
                            break;
                        case "H2":
                        case "H3":
                        case "H4":
                            doc.setFontSize(14);
                            doc.setTextColor(0,0,0);
                            doc.text(10, position_top, $(this).text(), null, null, 'left'); 
                            position_top = position_top + 10;
                            break;
                        case "P":
                        case "SPAN":
                                doc.setFontSize(12);
                                doc.setTextColor(0,0,0);
                                doc.text(10, position_top, $(this).text(), null, null, 'left'); 
                                position_top = position_top + 10;
                                break;
                        case "IMG":    
                            var src = $(this).attr('src')                    
                            jsPDFimages(src, $(this))
                            break;
                        default:
                            break;
                    }
                }); 
                $(".from_svg").remove();
                resolve(true);                            
            }   
        });       
    }

    async function jsPDFsvg(svg){ 
        var svg_text = svg[0].innerHTML;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var svgh = svg.height();
        var svgw = svg.width();
        canvas.width = svgw;
        canvas.height = svgh;

        v = await Canvg.from(ctx, svg_text);
        v.start();
        //svg.after(canvas) 
        var src = canvas.toDataURL('image/jpg');
        jsPDFimages(src, svg)
    }

    function getImageFromUrl(url, elem, callback) {                       
        ImageToLoad.crossOrigin = "Anonymous";                
        ImageToLoad.onload = function () {                    
            callback(ImageToLoad);
        };
        ImageToLoad.src = url;
        ImageToLoad.width = 50;
        ImageToLoad.height = 50;
        createPDF(ImageToLoad, elem)
    }
    
    function createPDF(imgData, elem) {  
        if(typeof elem != "undefined"){            
            if(elem.get(0).tagName === "svg"){
                elem.after('<img class="from_svg" style="display:none" src="'+imgData.src+'"/>')
            } else {
                var width = imgData.width;        
                var height = imgData.height;  
                position_top = position_top + height + 10;
                var y = position_top - height - 10;

                doc.addImage({
                    imageData: imgData,
                    x: 10,
                    y: y,
                    w: width,
                    h: height,                    
                });
            }             
        }     
    }

    function jsPDFimages(src, elem) {  
        getImageFromUrl(src, elem, createPDF);                
    }

    function pdf_new_doc(landscape) {        
        var position_final = 0;
        var doc = new jsPDF('p', 'mm', 'A4');        
        if(landscape ==='landscape') {
            doc = new jsPDF('l', 'mm', 'A4');
        }
        var bottom_page = 40;
        var pageHeight= (doc.internal.pageSize.height - bottom_page);
        var position_top = 0;
        doc.setFont("helvetica"); 

        var printed_at = 'Printed report at: ' + new Date().getMonth() + 1 + '/' + new Date().getDate() + '/' + new Date().getFullYear();
        position_top = position_top + 5;
        doc.setFontSize(9);
        doc.text(pageW, position_top, printed_at, null, null, 'right');   

        if(typeof props.company !== 'undefined' && props.company !=='' ) {
            var ch = pdf_table(doc, '', props.company, 26, 'bold', 'center','middle', 10, position_top, (pageW-10), [0,0,0]);
            doc = ch['doc'];
            position_top = ch['position_final'];
        }       
        

        position_final = position_top + 5;
        return {doc: doc, position_final: position_final, pageHeight: pageHeight};
    }

    function pdf_new_page(doc, landscape) {
        pageW = 200;
        pageMiddle = 105;
        if(landscape ==='landscape') {
            pageW = 287;
            pageMiddle = 148;
        }
        doc.addPage(); 
        pdf_copyright(doc, pageMiddle, doc.internal.getNumberOfPages()); 
    }

    function pdf_copyright(doc, pageMiddle, page){
        if(typeof copyright != 'undefined') {            
            doc.setTextColor(93,93,93);
            doc.setFontSize(11);  
            doc.setPage(page);            
            doc.text(pageMiddle,doc.internal.pageSize.height-7, copyright, null, null, 'center');
        }
    }

    function pdf_pager(doc, pages){ 
        return new Promise(function(resolve, reject){
            doc.setTextColor(93,93,93);
            doc.setFontSize(11);
            for(var i=1; i<=pages; i++){
                doc.setPage(i)
                var page = i + '/' + pages;
                doc.text(10,doc.internal.pageSize.height-7, page, null, null, 'center');
                if(i === pages){
                    resolve(true);
                }
            }  
        });
    }

    function pdf_table(doc, head="", body="", fontSize=11, fontStyle="normal", halign, valign, position_left, position_top, w, color=[0,0,0]) {
        var position_final = 0;
        var table_head = head;
        var table_body = body;
        if(typeof body == 'string'){
            table_body = [body];
        }
        doc.autoTable(
            [table_head], 
            [table_body], 
            {
                theme: 'plain', // 'striped', 'grid' or 'plain'
                styles: {
                    fontSize: fontSize,
                    fontStyle: fontStyle,
                    cellWidth: 'auto',
                    overflow: 'linebreak',
                    cellPadding: 0,
                    lineWidth: 0,
                    halign: halign,
                    valign: valign,
                    textColor: color
                },
                columnStyles: {
                    fontStyle: 'bold',
                },
                margin: {
                    left:position_left
                },
                startY: (position_top),
                tableWidth: w,
                showHeader: false
            }
        );
        position_final = parseInt(doc.lastAutoTable.finalY);
        return {doc: doc, position_final: position_final};
    }

    return (
        <div className="idrExport">
            <div onClick={()=> click_export(name_pdf)}>{button_name}</div>
        <div id="printing_area" style={{display: "none"}}>  
        {/* <div id="printing_area" >  */}
          <h1>Title01</h1>
          <p>Text01</p>
          <svg width="100" height="100">
            <circle cx="50" cy="50" r="40" stroke="darkred" strokeWidth="4" fill="red" />
          </svg>
          <img alt="" src="https://as2.ftcdn.net/jpg/00/42/98/87/500_F_42988762_JMNpHWOFWnbtCBZeYsRo5PmzD28rIquS.jpg" width="100px"/> 
          {/* <img src="data:image/png;base64,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" width="100px"/>  */}
          <h1>Title02</h1>
          <p>Text02</p>
          <svg width="100" height="100">
            <circle cx="50" cy="50" r="40" stroke="darkgreen" strokeWidth="4" fill="green" />
          </svg>
          <img alt=""  src="https://as2.ftcdn.net/jpg/00/42/98/87/500_F_42988762_JMNpHWOFWnbtCBZeYsRo5PmzD28rIquS.jpg" width="100px"/> 
          <h1>Title03</h1>
          <p>Text03</p>
          <svg width="100" height="100">
            <circle cx="50" cy="50" r="40" stroke="darkblue" strokeWidth="4" fill="blue" />
          </svg>
          <img alt=""  src="https://as2.ftcdn.net/jpg/00/42/98/87/500_F_42988762_JMNpHWOFWnbtCBZeYsRo5PmzD28rIquS.jpg" width="100px"/> 
          <h1>Title01</h1>
          <p>Text01</p>
          <svg width="100" height="100">
            <circle cx="50" cy="50" r="40" stroke="darkred" strokeWidth="4" fill="red" />
          </svg>
          <img alt=""  src="https://as2.ftcdn.net/jpg/00/42/98/87/500_F_42988762_JMNpHWOFWnbtCBZeYsRo5PmzD28rIquS.jpg" width="100px"/> 
          {/* <img src="data:image/png;base64,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" width="100px"/>  */}
          <h1>Title02</h1>
          <p>Text02</p>
          <svg width="100" height="100">
            <circle cx="50" cy="50" r="40" stroke="darkgreen" strokeWidth="4" fill="green" />
          </svg>
          <img alt=""  src="https://as2.ftcdn.net/jpg/00/42/98/87/500_F_42988762_JMNpHWOFWnbtCBZeYsRo5PmzD28rIquS.jpg" width="100px"/> 
          <h1>Title03</h1>
          <p>Text03</p>
          <svg width="100" height="100">
            <circle cx="50" cy="50" r="40" stroke="darkblue" strokeWidth="4" fill="blue" />
          </svg>
          <img alt=""  src="https://as2.ftcdn.net/jpg/00/42/98/87/500_F_42988762_JMNpHWOFWnbtCBZeYsRo5PmzD28rIquS.jpg" width="100px"/> 
          <h1>Title01</h1>
          <p>Text01</p>
          <svg width="100" height="100">
            <circle cx="50" cy="50" r="40" stroke="darkred" strokeWidth="4" fill="red" />
          </svg>
          <img alt=""  src="https://as2.ftcdn.net/jpg/00/42/98/87/500_F_42988762_JMNpHWOFWnbtCBZeYsRo5PmzD28rIquS.jpg" width="100px"/> 
          {/* <img src="data:image/png;base64,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" width="100px"/>  */}
          <h1>Title02</h1>
          <p>Text02</p>
          <svg width="100" height="100">
            <circle cx="50" cy="50" r="40" stroke="darkgreen" strokeWidth="4" fill="green" />
          </svg>
          <img alt=""  src="https://as2.ftcdn.net/jpg/00/42/98/87/500_F_42988762_JMNpHWOFWnbtCBZeYsRo5PmzD28rIquS.jpg" width="100px"/> 
          <h1>Title03</h1>
          <p>Text03</p>
          <svg width="100" height="100">
            <circle cx="50" cy="50" r="40" stroke="darkblue" strokeWidth="4" fill="blue" />
          </svg>
          <img alt=""  src="https://as2.ftcdn.net/jpg/00/42/98/87/500_F_42988762_JMNpHWOFWnbtCBZeYsRo5PmzD28rIquS.jpg" width="100px"/> 
          <h1>Title01</h1>
          <p>Text01</p>
          <svg width="100" height="100">
            <circle cx="50" cy="50" r="40" stroke="darkred" strokeWidth="4" fill="red" />
          </svg>
          <img alt=""  src="https://as2.ftcdn.net/jpg/00/42/98/87/500_F_42988762_JMNpHWOFWnbtCBZeYsRo5PmzD28rIquS.jpg" width="100px"/> 
          {/* <img src="data:image/png;base64,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" width="100px"/>  */}
          <h1>Title02</h1>
          <p>Text02</p>
          <svg width="100" height="100">
            <circle cx="50" cy="50" r="40" stroke="darkgreen" strokeWidth="4" fill="green" />
          </svg>
          <img alt=""  src="https://as2.ftcdn.net/jpg/00/42/98/87/500_F_42988762_JMNpHWOFWnbtCBZeYsRo5PmzD28rIquS.jpg" width="100px"/> 
          <h1>Title03</h1>
          <p>Text03</p>
          <svg width="100" height="100">
            <circle cx="50" cy="50" r="40" stroke="darkblue" strokeWidth="4" fill="blue" />
          </svg>
          <img alt=""  src="https://as2.ftcdn.net/jpg/00/42/98/87/500_F_42988762_JMNpHWOFWnbtCBZeYsRo5PmzD28rIquS.jpg" width="100px"/>                
        </div>
        </div>
    );
}

export default IdrExport;