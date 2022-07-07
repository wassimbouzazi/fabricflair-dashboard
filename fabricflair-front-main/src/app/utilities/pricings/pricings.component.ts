import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
declare const $: any;


@Component({
  selector: 'app-buttons',
  templateUrl: './pricings.component.html'
})



export class PricingsComponent implements OnInit{
  constructor(private formBuilder: FormBuilder, private http: HttpClient) {}
  

  pricings = [];


  pricingsForm: FormGroup;

  ngOnInit(): void {

    // Define Pricings

    this.pricingsForm = this.formBuilder.group({
      groupName: [null, [Validators.required]],
      sizeOneName: [null, Validators.required],
      sizeTwoName: [null, Validators.required],
      sizeThreeName: [null, Validators.required],
      sizeFourName: [null, Validators.required],
      sizeFiveName: [null, Validators.required],
      sizeOnePrice: [null, Validators.required],
      sizeTwoPrice: [null, Validators.required],
      sizeThreePrice: [null, Validators.required],
      sizeFourPrice: [null, Validators.required],
      sizeFivePrice: [null, Validators.required]
   });

   // Getting all pricings

   this.http.get("/pricing/getPricings").subscribe(result => {
    this.pricings = result['pricings']
    console.log(this.pricings);
   }, error => {
     console.log(error);
   })


  }

  isFieldValid(form: FormGroup, field: string) {
    return !form.get(field).valid && form.get(field).touched;
  }
 
  displayFieldCss(form: FormGroup, field: string) {
    return {
      'has-error': this.isFieldValid(form, field),
      'has-feedback': this.isFieldValid(form, field)
    };
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      console.log(field);
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

   cleanup(message) {
    return message.replace(/\s/g, '');
    };

  onSave() {
    console.log(this.pricingsForm);

    if (this.pricingsForm.valid) {
      
     let sizeNames = [];
     let sizePrices = [];

     sizeNames.push(this.pricingsForm.value.sizeOneName);
     sizeNames.push(this.pricingsForm.value.sizeTwoName);
     sizeNames.push(this.pricingsForm.value.sizeThreeName);
     sizeNames.push(this.pricingsForm.value.sizeFourName);
     sizeNames.push(this.pricingsForm.value.sizeFiveName);


     sizePrices.push(this.pricingsForm.value.sizeOnePrice);
     sizePrices.push(this.pricingsForm.value.sizeTwoPrice);
     sizePrices.push(this.pricingsForm.value.sizeThreePrice);
     sizePrices.push(this.pricingsForm.value.sizeFourPrice);
     sizePrices.push(this.pricingsForm.value.sizeFivePrice);


     // Post pricing
     this.http.post('/pricing/postPricing',{groupName: this.pricingsForm.value.groupName, sizeNames: sizeNames, sizePrices: sizePrices}).subscribe(result => {
       console.log(result);
       if (result['message'] == 'success') {
         this.pricingsForm.reset();
         this.showNotification('top','right')

         // Get pricings again
            this.http.get("/pricing/getPricings").subscribe(result => {
              this.pricings = result['pricings']
              console.log(this.pricings);
            }, error => {
              console.log(error);
            })
       }
       
     }, error => {
       console.log(error);
       
     })

    } else {
      this.validateAllFormFields(this.pricingsForm);
    }
  }



  showNotification(from: any, align: any) {
    const type = ['', 'info', 'success', 'warning', 'danger', 'rose', 'primary'];

    const color = 'success';

    $.notify({
        icon: 'notifications',
        message: 'Successfully <b>added</b> the fabric design into the database. Go back to Fabrics section to edit, view, or remove the fabric design'
    }, {
        type: type[color],
        timer: 1500,
        placement: {
            from: from,
            align: align
        }
    });
}

}
