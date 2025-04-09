import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';

const DATE_MODE_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    }
};

@Component({
    selector: 'app-dynamic-datepicker',
    templateUrl: './dynamic-datepicker.component.html',
    styleUrls: ['./dynamic-datepicker.component.scss'],
    standalone: true, // Marca el componente como standalone
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatInputModule,
        MatFormFieldModule,
        MatNativeDateModule,
    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DynamicDatepickerComponent),
            multi: true,
        },
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'fill' }, },
        { provide: DatePipe },
        { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
        },
        { provide: MAT_DATE_FORMATS, useValue: DATE_MODE_FORMATS },
        {
            provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS,
            useValue: { useUtc: true }, // Opcional, fuerza UTC
        },
    ],
})
export class DynamicDatepickerComponent implements ControlValueAccessor {
    @Input() index: string = '';
    @Input() label: string = '';
    @Input() controlName: string = '';
    @Input() required: boolean = false;
    @Input() placeholder: string = '';

    // Control interno para manejar el valor del datepicker
    dateControl = new FormControl('');

    // Funciones para implementar ControlValueAccessor
    onChange: any = () => {};
    onTouched: any = () => {};

    constructor() {}

    // Método para escribir el valor en el control
    writeValue(value: any): void {
        this.dateControl.setValue(value, { emitEvent: false }); // Evita emitir eventos innecesarios
    }

    // Método para registrar cambios en el control
    registerOnChange(fn: any): void {
        this.onChange = fn;
        this.dateControl.valueChanges.subscribe((value) => {
          fn(value); // Notifica al formulario principal sobre el cambio
        });
    }

    // Método para registrar cuando el control es tocado
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
        this.dateControl.valueChanges.subscribe(() => {
          fn(); // Notifica al formulario principal que el control fue tocado
        });
    }

    // Método para deshabilitar el control
    setDisabledState(isDisabled: boolean): void {
        isDisabled ? this.dateControl.disable() : this.dateControl.enable();
    }
}
