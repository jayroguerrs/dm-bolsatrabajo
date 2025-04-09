import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from 'app/core/user/user.types';
import { map, Observable, ReplaySubject, tap } from 'rxjs';
import { UsuarioMenuDto, UsuarioRolInicialDto } from '../interfaces/iUsuario';
import { Navigation } from '../navigation/navigation.types';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _httpClient = inject(HttpClient);
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);
    private _lstRoles: ReplaySubject<UsuarioRolInicialDto[]> = new ReplaySubject<UsuarioRolInicialDto[]>(100);
    private _lstMenu: ReplaySubject<Navigation> = new ReplaySubject<Navigation>(200);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User) {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User> {
        return this._user.asObservable();
    }

    set lstRoles(value: UsuarioRolInicialDto[]) {
        // Store the value
        this._lstRoles.next(value);
    }

    get lstRoles$(): Observable<UsuarioRolInicialDto[]> {
        return this._lstRoles.asObservable();
    }

    set lstMenu(value: Navigation) {
        // Store the value
        this._lstMenu.next(value);
    }

    get lstMenu$(): Observable<Navigation> {
        return this._lstMenu.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current signed-in user data
     */
    get(): Observable<User> {
        return this._httpClient.get<User>('api/common/user').pipe(
            tap((user) => {
                this._user.next(user);
            })
        );
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any> {
        return this._httpClient.patch<User>('api/common/user', { user }).pipe(
            map((response) => {
                this._user.next(response);
            })
        );
    }
}
