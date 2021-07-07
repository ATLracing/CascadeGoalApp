import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigureTgvPage } from '../core/components/configure-tgv-page/configure-tgv.page';
import { ManagePage } from './manage-page/manage.page';

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
