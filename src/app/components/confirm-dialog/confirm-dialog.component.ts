import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit {

  inData: any = {
    name: '',
    msg: ''
  };

  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) { 
      this.inData.name = data.name;
      this.inData.msg = data.msg;
    }

  ngOnInit(): void {
  }

  confirm(): void{
    this.dialogRef.close(true);
  }

  close(): void{
    this.dialogRef.close();
  }

}
