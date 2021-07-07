import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigureTgvPage } from '../core/components/configure_tgv/configure_tgv.page';
import { ManagePage } from './manage/manage.component';

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
