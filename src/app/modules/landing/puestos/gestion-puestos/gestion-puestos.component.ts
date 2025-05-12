import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { TextFieldModule } from '@angular/cdk/text-field';
import { Component, ViewEncapsulation } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormBuilder, FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MensajesService } from 'app/core/services/messages.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { IPuestos,  IPuestosFiltroPorIdDto } from 'app/core/interfaces/iPuestos';
import { PuestosService } from 'app/core/services/puestos.service';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseCardComponent } from '@fuse/components/card';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PostulacionComponent } from './postulacion/postulacion.component';

@Component({
    selector    : 'gestion-puestos',
    templateUrl : './gestion-puestos.component.html',
    styleUrls   : ['./gestion-puestos.component.scss'],
    standalone  : true,
    encapsulation: ViewEncapsulation.None,
    imports      : [
        CommonModule,
        FormsModule,
        FuseCardComponent,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatIconModule,
        MatInputModule,
        MatRadioModule,
        MatTableModule,
        MatSelectModule,
        TextFieldModule,
        ReactiveFormsModule,
    ],
    animations: [
        trigger('fadeInOut', [
          state('void', style({
            opacity: 0
          })),
          transition(':enter, :leave', [
            animate(600)
          ])
        ])
    ]
})
export class GestionPuestosComponent
{
    id: number = 0;
    objPuestos: IPuestos | null = null;

    /**
     * Constructor
     */
    constructor(
        private rutaActiva: ActivatedRoute,
        private _formBuilder: FormBuilder,
        private mensajesService: MensajesService,
        private puestosService: PuestosService,
        private router: Router,
        private _matDialog: MatDialog,
    )
    {
        this.id = parseInt(this.rutaActiva.snapshot.params.id);

        if (this.id <= 0) {
            this.router.navigate(['/']);
        } else {

            this.obtener(this.id);
        }
    }

    ngOnInit(): void {



    }

    obtener(vId: number) {
        this.mensajesService.msgLoad("Cargando...");
        let iFiltro = {
            Id: vId
        } as IPuestosFiltroPorIdDto;
        this.puestosService.obtenerPorId(iFiltro)
            .subscribe((response) => {
                if (response.success) {
                    this.objPuestos = response.data;
                    this.mensajesService.msgAutoClose();
                }
                else {
                    this.mensajesService.msgError("No se pudo obtener el registro");
                }
            },
            (error: any) => {
                this.mensajesService.msgError("No se pudo obtener el registro: " + error);
            });
    }

    postular(): void {

        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = "50%";
        dialogConfig.minWidth = "360px";
        dialogConfig.data = {
            Id: this.id,
        };

        const dialogRef = this._matDialog.open(PostulacionComponent, dialogConfig);

        dialogRef.afterClosed().subscribe((result) => {

        });
    }
}
