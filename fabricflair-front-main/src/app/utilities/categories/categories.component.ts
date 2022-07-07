import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import swal from 'sweetalert2';
declare var $: any;


@Component({
  selector: 'app-buttons',
  templateUrl: './categories.component.html'
})



export class CategoriesComponent implements OnInit{
  constructor(private formBuilder: FormBuilder, private http: HttpClient) {}
  
 categories = [];

  ngOnInit(): void {
    // Get categories and their corresponding children
    this.http.get("/categories/getCategoriesTree").subscribe(result => {
      this.categories = result['categories']
      console.log(this.categories);
     }, error => {
       console.log(error);
     })
  }


  addParentCategory() {
    swal({
      title: 'Category name',
      html: '<div class="form-group">' +
      '<input id="input-field" type="text" class="form-control" />' +
      '</div>' + '',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      confirmButtonText: 'Add',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false
  }).then(() => {  
    console.log($('#input-field').val());
    this.http.post('/categories/createParentCategory',{name: $('#input-field').val()}).subscribe(result => {      
      console.log(result['response']['data']['parent_id']);
      if (result['response']['data']['parent_id'] == 0) {
        swal({
          title: 'Added',
          text: 'Parent category successfully added',
          type: 'success',
          confirmButtonClass: 'btn btn-success',
          buttonsStyling: false
      });
      this.ngOnInit();
      }
    }, error => {
      swal({
        title: 'Error',
        text: "Couldn't add parent category, try create a category with another name",
        type: 'warning',
        confirmButtonClass: 'btn btn-danger',
        buttonsStyling: false
    });
    })  
  }).catch(swal.noop);
  }


  addSubCategory(category) {
    swal({
      title: 'Category name',
      html: '<div class="form-group">' +
      '<input id="input-field" type="text" class="form-control" />' +
      '</div>',
      showCancelButton: true,
      confirmButtonClass: 'btn btn-success',
      confirmButtonText: 'Add',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false
  }).then(() => {  
    console.log($('#input-field').val());
    this.http.post('/categories/createSubCategory',{name: $('#input-field').val(),parent_id: category.parent_id}).subscribe(result => { 
      console.log(result['response']);
        swal({
          title: 'Added',
          text: 'Sub category successfully added',
          type: 'success',
          confirmButtonClass: 'btn btn-success',
          buttonsStyling: false
      });
      this.ngOnInit();
  
    }, error => {
      console.log(error);
      
      swal({
        title: 'Error',
        text: "Couldn't add parent category, try create a category with another name",
        type: 'warning',
        confirmButtonClass: 'btn btn-danger',
        buttonsStyling: false
    });
    })  
  }).catch(swal.noop);
  }


  deleteSubCategory(sub) {
    this.http.patch('/categories/deleteSubCategory',{category_id: sub['id']}).subscribe(result => { 

      if (result['status'] == 'deleted') {
        swal({
          title: 'Deleted',
          text: 'Sub category successfully deleted',
          type: 'success',
          confirmButtonClass: 'btn btn-success',
          buttonsStyling: false
      });
      } else {

        swal({
          title: 'Error',
          text: "This category has products attached to them. You cannot delete them before deleting products",
          type: 'warning',
          confirmButtonClass: 'btn btn-danger',
          buttonsStyling: false
      });

      }


      console.log(result);
      this.ngOnInit();
    }),error => {

      swal({
        title: 'Error',
        text: "This category has products attached to them. You cannot delete them before deleting products",
        type: 'warning',
        confirmButtonClass: 'btn btn-danger',
        buttonsStyling: false
    });
    this.ngOnInit();
    }}

    deleteParentCategory(category) {
     console.log(category);
     this.http.patch('/categories/deleteParentCategory',{category_id: category.parent_id, category_children: category.children }).subscribe(result => {
      if (result['status'] == 'deleted') {
        swal({
          title: 'Deleted',
          text: 'Parent category successfully deleted',
          type: 'success',
          confirmButtonClass: 'btn btn-success',
          buttonsStyling: false
      });
      this.ngOnInit();
      } else {

        swal({
          title: 'Error',
          text: "This category, or its sub categories, has products attached to them. Delete them first",
          type: 'warning',
          confirmButtonClass: 'btn btn-danger',
          buttonsStyling: false
      });

      }     })
    }
}
