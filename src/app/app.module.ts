import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DatabaseManager } from './providers/database_manager';
import { IonicStorageModule } from '@ionic/storage';
import { AddressedTransfer } from './providers/addressed_transfer';
import { TabTasksModule } from './tab_day/tab_day.module';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, 
            IonicModule.forRoot(), 
            IonicStorageModule.forRoot(),
            AppRoutingModule],
  providers: [
    StatusBar,
    SplashScreen,
    DatabaseManager,
    AddressedTransfer,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
