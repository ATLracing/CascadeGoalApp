import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigureTgvPage } from '../tab_day/pages/configure_tgv/configure_tgv.page';
import { ManagePage } from './pages/manage/manage.component';

const routes: Routes = [
  { path: '', component: ManagePage},
  {
    path: 'configure_tgv',
    component: ConfigureTgvPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabManageRoutingModule{}