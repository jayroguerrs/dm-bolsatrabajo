import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from 'app/app.component';
import { appConfig } from 'app/app.config';
import '@angular/localize/init';
import * as moment from 'moment';
import 'moment/locale/es';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
    console.error(err)
);

moment.locale('es-ES');
