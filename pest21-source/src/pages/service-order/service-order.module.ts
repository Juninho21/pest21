import { BrMaskerModule } from 'brmasker-ionic-3';
import { ServiceOrderFinishPage } from './../service-order-finish/service-order-finish';
import { ServiceOrderEvaluationPage } from './../service-order-evaluation/service-order-evaluation';
import { ServiceOrderResumePage } from './../service-order-resume/service-order-resume';
import { ServiceOrderMipPage } from './../service-order-mip/service-order-mip';
import { ServiceOrderNotesPage } from './../service-order-notes/service-order-notes';
import { ServiceFormPage } from './../service-form/service-form';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ServiceOrderPage } from './service-order';
import { IonicSelectableModule } from 'ionic-selectable';
import { ComponentsModule } from '../../components/components.module';
import { ServiceOrderNonCompliancePage } from '../service-order-non-compliance/service-order-non-compliance';
import { ServiceOrderPestCountingPage } from '../service-order-pest-counting/service-order-pest-counting';
import { ServiceOrderDetailsPage } from '../service-order-details/service-order-details';
import { PipesModule } from '../../pipes/pipes.module';
import { ServiceOrderOfflinePoolPage } from '../service-order-offline-pool/service-order-offline-pool';
import { ServiceOrderNonAttendancePage } from '../service-order-non-attendance/service-order-non-attendance';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { ServiceOrderAuditPage } from '../service-order-audit/service-order-audit';
import { ServiceOrderVehiclesPage } from './../service-order-vehicles/service-order-vehicles';

@NgModule({
  declarations: [
    ServiceOrderPage,
    ServiceOrderResumePage,
    ServiceFormPage,
    ServiceOrderNonCompliancePage,
    ServiceOrderNotesPage,
    ServiceOrderMipPage,
    ServiceOrderPestCountingPage,
    ServiceOrderResumePage,
    ServiceOrderEvaluationPage,
    ServiceOrderDetailsPage,
    ServiceOrderFinishPage,
    ServiceOrderOfflinePoolPage,
    ServiceOrderNonAttendancePage,
    ServiceOrderAuditPage,
    ServiceOrderVehiclesPage
  ],
  entryComponents: [
    ServiceOrderPage,
    ServiceOrderResumePage,
    ServiceFormPage,
    ServiceOrderNonCompliancePage,
    ServiceOrderNotesPage,
    ServiceOrderMipPage,
    ServiceOrderPestCountingPage,
    ServiceOrderResumePage,
    ServiceOrderEvaluationPage,
    ServiceOrderDetailsPage,
    ServiceOrderFinishPage,
    ServiceOrderOfflinePoolPage,
    ServiceOrderNonAttendancePage,
    ServiceOrderAuditPage,
    ServiceOrderVehiclesPage
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(ServiceOrderPage),
    IonicSelectableModule,
    PipesModule,
    BrMaskerModule,
    TranslateModule.forChild()

  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
})
export class ServiceOrderPageModule {}
