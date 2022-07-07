import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { saveAs } from 'file-saver';
import {HttpHeaders} from "@angular/common/http";


declare const $: any;




@Component({
    selector: 'app-generatefabric-cmp',
    templateUrl: 'generatefabrics.component.html',
})

export class GenerateFabricsComponent implements OnInit {


    constructor(private http: HttpClient, private activatedRoute: ActivatedRoute, private router: Router) {
    }


    fabric;
    id;
    generating = false;

    typeAll = false;
    sizeAll = false;

    types = [
        {placeholder: '14 ct. Aida', isChecked: false, value: "14aida"},
        {placeholder: '16 ct. Aida', isChecked: false,value: "16aida"},
        {placeholder: '18 ct. Aida', isChecked: false,value: "18aida"},
        {placeholder: '28 ct. Evenweave', isChecked: false,value: "28evenweave"},
        {placeholder: '32 ct. Evenweave', isChecked: false,value: "32evenweave"},
        {placeholder: '36 ct. Evenweave', isChecked: false,value: "36evenweave"},
        {placeholder: '28 ct. Linen', isChecked: false,value: "28linen"},
        {placeholder: '32 ct. Linen', isChecked: false,value: "32linen"},
        {placeholder: '36 ct. Linen', isChecked: false,value: "36linen"},
        {placeholder: '40 ct. Linen', isChecked: false,value: "40linen"},
    ]

    sizes = [
        {placeholder: 'FULL PANEL 56’’ inches', isChecked: false, cut_type: "full", choice: 56 },
        {placeholder: 'FULL PANEL 42’’ inches', isChecked: false, cut_type: "full", choice: 42}
    ]



    ngOnInit() {
        this.activatedRoute.paramMap.subscribe(x => {
            this.id = x.get('fabricId');
            this.http.get('/fabrics/' + this.id).subscribe(result => {
                this.fabric = result['fabric'][0];
                console.log(this.fabric);
                // Add other options if fabric is not seamless
                if (!this.fabric.seamless) {
                    this.sizes.push({placeholder: 'HALF CUT 56’’ inches', isChecked: false,  cut_type: "half", choice: 56})
                    this.sizes.push({placeholder: 'HALF CUT 42’’ inches', isChecked: false, cut_type: "half", choice: 42})
                    this.sizes.push({placeholder: 'QUARTER CUT 56’’ inches', isChecked: false, cut_type: "quarter", choice: 56})
                    this.sizes.push({placeholder: 'QUARTER CUT 42’’ inches', isChecked: false, cut_type: "quarter", choice: 42})
                }
            })
        });
    }
    

    downloadFile() {
        this.http
        .get("/fabrics/download/dump", { responseType: "blob" }) //set response Type properly (it is not part of headers)
        .toPromise()
        .then(blob => {
            saveAs(blob, "full.jpg"); 
        })
        .catch(err => console.error("download error = ", err))
    }

    typeAllChange(e) {
        if (e.target.checked) {
            this.types.forEach(type => {
                type.isChecked = true
            });            
        } else {
            this.types.forEach(type => {
                type.isChecked = false
            })
        }
    }
    
    sizeAllChange(e) {
        if (e.target.checked) {
            
            this.sizes.forEach(size => {
                size.isChecked = true
            })
        } else {

            this.sizes.forEach(size => {
                size.isChecked = false
            })
        }
    }

    generate() {

        let isType = false;
        let isSize = false;

        for(let type of this.types) {
            if(type.isChecked) {
                isType = true
                break
            };
         }

         for(let size of this.sizes) {
            if(size.isChecked) {
                isSize = true
                break
            };
         }

         if (isType && isSize) {
             console.log("generating");
             this.generating = true;
             
             const calls = [];
             this.showNotification('top','right','info','Generating, please wait!')

             this.sizes.forEach(size => {
                 if (size.isChecked) {
                    this.types.forEach(type => {
                        if (type.isChecked) {
                            calls.push(this.http.post('/fabrics/generate',{
                                fabricName: this.fabric.title,
                                choice: size.choice,
                                cut_type: size.cut_type,
                                fabric_type: type.value,
                                masterfilePath: this.fabric.masterFile.split('.').slice(0, -1).join('.'),
                                extension: this.fabric.masterFile.substring(this.fabric.masterFile.lastIndexOf(".")+1),
                            })
                            // .subscribe(result => {
                            //     console.log(result);
                            // })
                            );
                        }
                    })
                 }
             })

            Observable.forkJoin(calls).subscribe(result => {
                this.generating = false;
                result.forEach(el => console.log(el))
                if (result != null) {
                    this.showNotification('top','right','success','Successfully generated '+result.length+' images. Visit the Fabric Info section to download the files')
                }              
            })

         } else {
             this.showNotification('top','right','danger','You must atleast select one type and one size to generate an image')
         }




    }

    
    isMac(): boolean {
        let bool = false;
        if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
            bool = true;
        }
        return bool;
    }

  

    showNotification(from: any, align: any, color: string, message: string) {
        const type = ['', 'info', 'success', 'warning', 'danger', 'rose', 'primary'];


        $.notify({
            icon: 'notifications',
            message: message
        }, {
            type: color,
            timer: 1500,
            placement: {
                from: from,
                align: align
            }
        });
    }
}
