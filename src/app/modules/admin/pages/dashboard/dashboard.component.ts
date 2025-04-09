import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DashboardService } from 'app/core/services/dashboard.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { MensajesService } from 'app/core/services/messages.service';

@Component({
    selector        : 'dashboard',
    templateUrl     : './dashboard.component.html',
    styleUrls       : ['./dashboard.component.scss'],
    encapsulation   : ViewEncapsulation.None,
    standalone: true,
    providers: [],
    imports: [],
})
export class DashboardComponent implements OnInit {

    powerBiUrl: SafeResourceUrl | undefined;

    constructor(
        private sanitizer: DomSanitizer,
        private dashboardService: DashboardService,
        private mensajesService: MensajesService,
    )
    {
    }

    ngOnInit(): void {

    }
}
