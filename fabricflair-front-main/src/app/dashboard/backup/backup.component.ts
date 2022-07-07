import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";

declare const $: any;

@Component({
  selector: "app-backup",
  templateUrl: "./backup.component.html",
  styleUrls: ["./backup.component.css"],
})
export class BackupComponent {
  constructor(private http: HttpClient) {}

  export(collectionName, exportFormat) {
    let data = {
      collectionName: collectionName,
      exportFormat: exportFormat,
    };

    this.showNotification("top", "right", "Exporting...");

    this.http.post("/backup/export", data).subscribe((result: any) => {
      console.log(result);

      let fileName = result.path;
      const link = document.createElement("a");
      link.setAttribute("target", "_blank");
      link.setAttribute("href", `/exports/${fileName}`);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  }

  showNotification(from: any, align: any, message: any) {
    const type = [
      "",
      "info",
      "success",
      "warning",
      "danger",
      "rose",
      "primary",
    ];

    const color = "info";

    $.notify(
      {
        icon: "notifications",
        message: message,
      },
      {
        type: type[color],
        timer: 1500,
        placement: {
          from: from,
          align: align,
        },
      }
    );
  }
}
