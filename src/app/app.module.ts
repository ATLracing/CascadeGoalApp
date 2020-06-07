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

import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite } from '@ionic-native/sqlite/ngx';
 
import { HttpClientModule } from '@angular/common/http';
import "hammerjs"

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, 
            HttpClientModule,
            IonicModule.forRoot(), 
            IonicStorageModule.forRoot(),
            AppRoutingModule],
  providers: [
    StatusBar,
    SplashScreen,
    SQLitePorter,
    SQLite,
    DatabaseManager,
    AddressedTransfer,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
