import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import swal from "sweetalert2";
import { MedleyFabricService } from "app/services/medley_fabric.service";
import { SearchService } from "app/services/SearchService.service";
declare var $: any;

@Component({
  selector: "app-createmedley-cmp",
  templateUrl: "createmedley.component.html",
  styleUrls: ["./createmedley.component.css"],
})
export class CreateMedleyComponent implements OnInit {
  fabrics;
  items = [];
  inches = 0;
  medlyTitle;
  proceeded = false;
  filterargs;

  constructor(
    private http: HttpClient,
    private router: Router,
    private service: MedleyFabricService,
    private search: SearchService
  ) {}

  ngOnInit() {
    // Search

    this.search.currentMessage.subscribe((message) => {
      this.filterargs = { title: message };
      console.log(message);
    });

    // End
    this.initializeFabrics();
    console.log(this.items.length);
    $("#sortable1").sortable();
    $("#sortable1").disableSelection();
    $("#sortable2").sortable();
    $("#sortable2").disableSelection();
  }

  initializeFabrics() {
    this.http.get("/fabrics/getFabrics").subscribe((result) => {
      this.fabrics = result["fabrics"];
      console.log(this.fabrics);
    });
  }

  fileName(fullname) {
    if (fullname != null)
      return fullname.replace("masterfiles/", "").split(":").join("_");
  }

  imagePicked(fabric, event) {
    if (event.target.checked) {
      if (this.items.length < 4) {
        this.items.push(fabric);
      } else {
        this.showNotification(
          "top",
          "right",
          "danger",
          "Your medley can be made up of 2 or 4 images"
        );
        event.target.checked = false;
      }
    } else {
      this.items = this.items.filter((obj) => obj._id !== fabric._id);
    }
  }

  showNotification(from: any, align: any, color: any, message: any) {
    const type = [
      "",
      "info",
      "success",
      "warning",
      "danger",
      "rose",
      "primary",
    ];

    $.notify(
      {
        icon: "notifications",
        message: message,
      },
      {
        type: color,
        timer: 1500,
        placement: {
          from: from,
          align: align,
        },
      }
    );
  }

  createMedleyv2() {
    let fabricIds = [];
    let shrink_options = "";

    if (this.items.length == 2) {
      console.log($("#sortable2").sortable("toArray"));
      $("#sortable2")
        .sortable("toArray")
        .forEach((id) => {
          console.log(
            "masterfiles/" +
              (<HTMLInputElement>document.getElementById(id))
                .getElementsByTagName("img")[0]
                .currentSrc.substring(
                  (<HTMLInputElement>document.getElementById(id))
                    .getElementsByTagName("img")[0]
                    .currentSrc.lastIndexOf("/") + 1
                )
          );

          fabricIds.push(
            this.items.filter((item) => {
              return (
                item.masterFile.split(":").join("_") ==
                "masterfiles/" +
                  (<HTMLInputElement>document.getElementById(id))
                    .getElementsByTagName("img")[0]
                    .currentSrc.substring(
                      (<HTMLInputElement>document.getElementById(id))
                        .getElementsByTagName("img")[0]
                        .currentSrc.lastIndexOf("/") + 1
                    )
              );
            })[0]
          );
        });

      fabricIds.forEach((fabric) => {
        if (fabric.seamless == true) {
          shrink_options = shrink_options + "1,";
        } else {
          shrink_options = shrink_options + "0,";
        }
      });

      shrink_options = shrink_options.slice(0, -1);
      fabricIds = fabricIds.map((fabric) => fabric._id);

      console.log(fabricIds);
      console.log(shrink_options);
    }

    if (this.items.length == 4) {
      console.log($("#sortable1").sortable("toArray"));

      $("#sortable1")
        .sortable("toArray")
        .forEach((id) => {
          console.log(
            "masterfiles/" +
              (<HTMLInputElement>document.getElementById(id))
                .getElementsByTagName("img")[0]
                .currentSrc.substring(
                  (<HTMLInputElement>document.getElementById(id))
                    .getElementsByTagName("img")[0]
                    .currentSrc.lastIndexOf("/") + 1
                )
          );

          fabricIds.push(
            this.items.filter((item) => {
              return (
                item.masterFile.split(":").join("_") ==
                "masterfiles/" +
                  (<HTMLInputElement>document.getElementById(id))
                    .getElementsByTagName("img")[0]
                    .currentSrc.substring(
                      (<HTMLInputElement>document.getElementById(id))
                        .getElementsByTagName("img")[0]
                        .currentSrc.lastIndexOf("/") + 1
                    )
              );
            })[0]
          );
        });

      // Swap Variables for order.
      var x = fabricIds[1];
      fabricIds[1] = fabricIds[2];
      fabricIds[2] = x;

      fabricIds.forEach((fabric) => {
        if (fabric.seamless == true) {
          shrink_options = shrink_options + "1,";
        } else {
          shrink_options = shrink_options + "0,";
        }
      });

      shrink_options = shrink_options.slice(0, -1);
      fabricIds = fabricIds.map((fabric) => fabric._id);

      console.log(fabricIds);
      console.log(shrink_options);
    }

    swal({
      title: "Medley Options",
      html:
        "<h5>Medley title:</h5>" +
        '                        <div class="form-group label-floating is-empty">' +
        '                            <input type="text" class="form-control" placeholder="Enter your medley title" id="medley-title"></div>' +
        "" +
        "<h5>Border inches:</h5>" +
        '                        <div class="form-group label-floating is-empty">' +
        '                            <input type="number" value="0" class="form-control" placeholder="Insert border in inches" id="medley-borders">' +
        "                        </div>" +
        '<div class="togglebutton">' +
        "                            <label>" +
        '                                <input type="checkbox" id="medley-shrink"> Shrink' +
        "                            </label>" +
        "                        </div>",
      showCancelButton: true,
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      buttonsStyling: false,
    })
      .then(() => {
        if ($("#medley-shrink")[0].checked) {
          shrink_options = shrink_options.split("1").join("0");
          console.log(shrink_options);
        }

        if (
          $("#medley-title").val() == "" ||
          $("#medley-borders").val() == ""
        ) {
          swal({
            title: "Error",
            text: "You must fill in both the title and borders fields",
            type: "error",
            confirmButtonClass: "btn btn-info",
            buttonsStyling: false,
          });
        } else {
          let fabricOption = this.items.length == 2 ? 2 : 4;

          const data = {
            fabrics: fabricIds,
            inches: $("#medley-borders").val(),
            option: fabricOption,
            title: $("#medley-title").val(),
            shrink_options: shrink_options,
            shrink: $("#medley-shrink")[0].checked,
          };
          this.proceeded = true;
          this.showNotification(
            "top",
            "right",
            "success",
            "Creating Medley, plesae wait"
          );

          this.http.post("/medley/createMedley", data).subscribe(
            (result) => {
              console.log(result);
              this.service.changeData(result["medley_data"]);
              this.showNotification(
                "top",
                "right",
                "success",
                result["message"]
              );
              this.router.navigateByUrl("/fabrics/addfabric");
            },
            (error) => {
              swal({
                title: "Error",
                text: "There is always a medley with this name, retry with another title",
                type: "error",
                confirmButtonClass: "btn btn-info",
                buttonsStyling: false,
              });
            }
          );
        }
      })
      .catch(swal.noop);
  }

  /* createMedley() {
    if (this.fabricOption == 2 && this.items.length != 2) {
      this.showNotification('top', 'right', 'danger', 'Two fabrics need to be selected')
      return
    }

    if (this.fabricOption == 4 && this.items.length != 4) {
      this.showNotification('top', 'right', 'danger', 'Four fabrics need to be selected')
      return
    }

    if (this.inches == null) {
      this.showNotification('top', 'right', 'danger', 'Fill in the inches field')
      return
    }

    if (this.medlyTitle == null) {
      this.showNotification('top', 'right', 'danger', 'Fill in the title field')
      return
    }

    const data = {
      fabrics: this.items.map(fabric => fabric._id),
      inches: this.inches,
      option: this.fabricOption,
      title: this.medlyTitle
    }

    console.log(data);
    this.showNotification('top', 'right', 'info', "Processing medley, please wait")
    this.proceeded = true;
    this.http.post('/medley/createMedley', data).subscribe(result => {
      console.log(result);
      this.showNotification('top', 'right', 'success', result['message'])
      this.router.navigateByUrl('/medley');
    })




  } */

  displayFieldCss(field) {
    if (field == "inches") {
      return {
        "has-error": this.inches == null,
        "has-feedback": this.inches == null,
      };
    }

    if (field == "medleyTitle") {
      return {
        "has-error": this.medlyTitle == null,
        "has-feedback": this.medlyTitle == null,
      };
    }
  }
}
