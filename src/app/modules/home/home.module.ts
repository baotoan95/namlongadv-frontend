import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { CommonModule } from '@angular/common';
import { HomeRoutes } from './home-routes';
import { SharedModule } from '../../shared/shared.module';
import { SideMenuComponent } from '../../shared/components/sidemenu/sidemenu.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { MainComponent } from '../../shared/components/main/main.component';
import { FooterComponent } from 'src/app/shared/components/footer/footer.component';
import { BreadcrumbComponent } from 'src/app/shared/components/breadcrumb/breadcrumb.component';
import { AuthGuard } from '../authorize/guards/auth.guard';

@NgModule({
    declarations: [
        HomeComponent,
        SideMenuComponent,
        HeaderComponent,
        MainComponent,
        FooterComponent,
        BreadcrumbComponent
    ],
    imports: [
        CommonModule,
        HomeRoutes,
        SharedModule
    ],
    exports: [
        HomeComponent
    ],
    providers: [
        AuthGuard
    ]
})
export class HomeModule {

}
