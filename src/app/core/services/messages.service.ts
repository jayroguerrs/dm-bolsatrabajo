import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
    providedIn: 'root'
})
export class MensajesService {

    constructor() { }

    public msgEliminar: string = "¿Esta seguro de eliminar el registro seleccionado?";
    public msgGuardado: string = "¿Esta seguro de eliminar el registro seleccionado?";
    public msgGuardadoCorrectamente: string = "Datos guardados correctamente";
    public msgRolNoSeleccionado: string = "No se ha seleccionado ningún rol";
    public msgExportar: string = "No se encontraron registros que exportar";

    msgExportarVacio(msgExportar){
        this.msgError(msgExportar);
    }

    msgSuccess(title: string | "", text: string, callBack?: any) {
        Swal.fire({
            title: title,
            icon: 'success',
            html: text && text.trim() !== "" ? text : undefined,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonColor: '#43a47',
            confirmButtonText: 'Aceptar',
        didOpen: () => {
            Swal.hideLoading();
        }
        }).then((resultado) => {
            if (callBack) callBack();
        });
    }

    msgSuccessAcept(text: string, callBack?: any) {
        Swal.fire({
            //title: title,
            icon: 'success',
            html: text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonText: 'Aceptar',
        }).then((resultado) => {
            if (callBack) callBack();
        });
    }

    msgSuccessTemp(text: string, callBack?: any) {
        Swal.fire({
            //title: title,
            icon: 'success',
            html: text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonColor: '#43a047',
            confirmButtonText: 'Aceptar',
            timer: 2000
        }).then((resultado) => {
            if (callBack) callBack();
        });
    }

    msgWarning(text: string, callBackOk?: any, callBackError?: any) {
        Swal.fire({
            //title: title,
            icon: 'warning',
            html: text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCancelButton: false,
            confirmButtonColor: '#f8bb86',
            confirmButtonText: 'Cerrar',
        }).then((resultado) => {
            if (resultado.value) {
                if (callBackOk) callBackOk();
            } else if (callBackError) callBackError();
        });
    }

    msgWarningMin(text: string, callBack?: any) {
        Swal.fire({
            //title: title,
            icon: 'warning',
            html: text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonText: 'Aceptar',
        }).then((resultado) => {
            if (callBack) callBack();
        });
    }

    msgInfo(text: string, callBack?: any) {
        Swal.fire({
            //title: title,
            icon: 'info',
            html: text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            confirmButtonText: 'Aceptar',
        }).then((resultado) => {
            if (callBack) callBack();
        });
    }

    msgConfirm(text: string, callBackOk?: any, callBackError?: any) {

        Swal.fire({
            html: text,
            icon: 'question',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCancelButton: true,
            cancelButtonColor: '#b5b3b3',
            cancelButtonText: 'NO',
            confirmButtonText: 'SI',
            confirmButtonColor: '#2563eb',
            reverseButtons: true,
            didOpen: () => {
                    Swal.hideLoading();
            }
        }).then((resultado) => {
            if (resultado) {
                if (resultado.isConfirmed) callBackOk();
                if (resultado.isDismissed) {
                    if (callBackError) callBackError();
                }
            } else if (callBackError) callBackError();
        });
    }

    msgConfirmSendReport(text: string, callBackOk?: any, callBackDeny?: any, callBackError?: any) {

        Swal.fire({
            html: text,
            icon: 'question',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCancelButton: true,
            cancelButtonColor: '#b5b3b3',
            cancelButtonText: 'NO',
            confirmButtonText: 'SI',
            confirmButtonColor: '#2563eb',
            denyButtonText: 'VER INFORME',
            showDenyButton: true,
            reverseButtons: true,

        }).then((resultado) => {
            if (resultado) {
                if (resultado.isConfirmed) callBackOk();
                if (resultado.isDismissed) {
                    if (callBackError) callBackError();
                }
                if (resultado.isDenied) callBackDeny();
            } else if (callBackError) callBackError();
        });
    }

    msgSend(text: string, callBackOk?: any, callBackError?: any) {
        Swal.fire({
            html: text,
            icon: 'question',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCancelButton: true,
            cancelButtonColor: '#b5b3b3',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Enviar',
            confirmButtonColor: '#2563eb',
            reverseButtons: true,
        }).then((resultado) => {
            if (resultado.value) {
                if (callBackOk) callBackOk();
            } else if (callBackError) callBackError();
        });
    }

    msgError(text: string, callBack?: any): boolean {
        Swal.fire({
            title: 'Error',
            icon: 'error',
            html: text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCancelButton: true,
            showConfirmButton: false,
            cancelButtonColor: '#f44336',
            cancelButtonText: 'Aceptar',
        }).then((value) => {
            if (callBack) callBack();
        });
        return false;
    }

    msgErrorSeguridad(text: string, callBack?: any): boolean {
        Swal.fire({
            title: 'ERROR DE SEGURIDAD',
            icon: 'error',
            html: text,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCancelButton: true,
            showConfirmButton: false,
            cancelButtonColor: '#f44336',
            cancelButtonText: 'Aceptar',
        }).then((value) => {
            if (callBack) callBack();
        });
        return false;
    }

    msgClose(text: string, callBackOk?: any, callBackError?: any) {
        Swal.fire({
            html: text,
            icon: 'question',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCancelButton: true,
            cancelButtonColor: '#babdbe',
            confirmButtonColor: "#084787",
            cancelButtonText: 'No',
            confirmButtonText: 'Si',
            reverseButtons: true,
        }).then((result) => {
            if (result.value) {
                if (callBackOk) callBackOk();
            } else if (callBackError) callBackError();
        });
    }

    msgAutoClose() {
        Swal.close();
    }

    msgSessionExpired(text: string, callBackOk?: any, callBackError?: any) {
        Swal.fire({
            title: '',
            html: 'Tu sesión ha expirado. Vuelve a iniciar sesión.',
            icon: 'warning',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showCancelButton: false,
            confirmButtonColor: "#084787",
            confirmButtonText: 'Ok',
            reverseButtons: true,
        }).then((result) => {
            if (result.value) {
                if (callBackOk) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("usuario");
                    localStorage.removeItem("unidadEjecutora");
                    location.reload();
                    callBackOk();
                };
            } else if (callBackError) callBackError();
        });
    }

    msgSuccessMixin(titulo: string | "", texto: string | "") {

        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: true,
            confirmButtonColor: '#43a047',
            confirmButtonText: 'Aceptar',
            width: '24rem',
            timer: 5000,
            timerProgressBar: true,
            didOpen: (toast) => {
                Swal.hideLoading();
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })

        Toast.fire({
            icon: 'success',
            title: titulo,
            text: texto
        })
    }

    msgToastWarning(titulo: string | "", texto: string | "") {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: true,
            confirmButtonColor: '#43a047',
            confirmButtonText: 'Aceptar',
            width: '24rem',
            timer: 5000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })
        Toast.fire({
            icon: 'warning',
            title: titulo,
            text: texto
        })
    }

    msgErrorMixin(titulo: string | "", texto: string | "") {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: true,
            confirmButtonColor: '#f44336',
            confirmButtonText: 'Aceptar',
            width: '24rem',
            timer: 5000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })

        Toast.fire({
            icon: 'error',
            title: titulo,
            text: texto
        })
    }

    msgErrorInferiorDerecha(titulo: string | "", texto: string | "") {
        const Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: true,
            confirmButtonColor: '#f44336',
            confirmButtonText: 'Aceptar',
            width: '24rem',
            timer: 5000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })

        Toast.fire({
            icon: 'error',
            title: titulo,
            text: texto
        })
    }

    msgErrorSuperiorDerecha(titulo: string | "", texto: string | "") {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: true,
            confirmButtonColor: '#f44336',
            confirmButtonText: 'Aceptar',
            width: '24rem',
            timer: 5000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })

        Toast.fire({
            icon: 'error',
            title: titulo,
            text: texto
        })
    }

    msgLoad(text: string, callBack?: any): boolean {
        Swal.fire({
            title: '',
            html: text,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading(null);
            },
            willClose: () => {
                clearInterval(0);
            }
        }).then(() => {
            if (callBack) callBack();
        });
        return false;
    }

    msgLoadTimer(text: string, time?: number, callBack?: any): boolean {
        let timerInterval;
        let timeElapsed = 0;
        Swal.fire({
            title: '',
            html: `<p class="mb-3">${text}</p><b id="timer"></b>`,
            timerProgressBar: true,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading(null);
                const timer = Swal.getPopup().querySelector("b");
                timerInterval = setInterval(() => {
                    timeElapsed += 100;
                    const percentage = Math.round((timeElapsed / time) * 100);
                    timer.textContent = `${percentage}%`;
                    if (timeElapsed >= time) {
                        clearInterval(timerInterval);
                        if (callBack) callBack();
                    }
                }, 100);
            },
            willClose: () => {
                clearInterval(timerInterval);
            }
        });
        return false;
    }



}
