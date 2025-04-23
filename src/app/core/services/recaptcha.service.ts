import { Injectable, NgZone, isDevMode } from '@angular/core';
import { environment } from 'environments/environments';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
    __recaptchaLoadCallback: () => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {
  private readonly recaptchaSiteKey: string = environment.recaptchaSiteKey;
  private isRecaptchaLoaded: boolean = false;
  private loadPromise: Promise<void>;

  constructor(private ngZone: NgZone) {
    // Carga inmediata al instanciar el servicio
    this.loadPromise = this.loadRecaptcha();
  }

  /**
   * Ejecuta reCAPTCHA v3 y devuelve un token
   * @param action Nombre de la acción a registrar
   * @returns Promise con el token de reCAPTCHA
   */
  public async executeRecaptcha(action: string = 'submit'): Promise<string> {
    try {
      // Espera a que reCAPTCHA esté cargado
      await this.loadPromise;

      if (!window.grecaptcha?.execute) {
        throw new Error('reCAPTCHA no está disponible');
      }

      // Espera a que esté listo
      await new Promise<void>(resolve => window.grecaptcha.ready(resolve));

      // Ejecuta reCAPTCHA
      const token = await window.grecaptcha.execute(this.recaptchaSiteKey, { action });

      if (!token) {
        throw new Error('Token vacío recibido de reCAPTCHA');
      }

      return token;
    } catch (error) {
      if (isDevMode()) {
        console.error('Error en reCAPTCHA:', error);
      }
      throw error;
    }
  }

  /**
   * Carga el script de reCAPTCHA inmediatamente
   */
  private async loadRecaptcha(): Promise<void> {
    // Si ya está cargado, retorna inmediatamente
    if (this.isRecaptchaLoaded) {
      return;
    }

    // Si ya está definido grecaptcha (cargado por otro medio)
    if (typeof window.grecaptcha !== 'undefined') {
      this.isRecaptchaLoaded = true;
      return;
    }

    return new Promise<void>((resolve, reject) => {
      // Configura el callback global
      window.__recaptchaLoadCallback = () => {
        this.ngZone.run(() => {
          this.isRecaptchaLoaded = true;
          resolve();
        });
      };

      // Crea el elemento script
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${this.recaptchaSiteKey}&onload=__recaptchaLoadCallback`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        this.ngZone.run(() => {
          reject(new Error('Error al cargar reCAPTCHA'));
        });
      };

      // Añade el script al documento
      document.body.appendChild(script);
    });
  }
}
