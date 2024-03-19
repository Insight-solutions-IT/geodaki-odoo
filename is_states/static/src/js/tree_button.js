/** @odoo-module */
import { ListController } from "@web/views/list/list_controller";
import { registry } from '@web/core/registry';
import { listView } from '@web/views/list/list_view';
export class SaleListController extends ListController {
   setup() {
       super.setup();
   }
   OnTestClick() {
       this.actionService.doAction({
        type: 'ir.actions.act_window',
        res_model: 'querydeluxe',  // Change to your actual model name
        name: 'Open form view',
        view_mode: 'form',
        view_type: 'form',
        views: [[false, 'form']],
        target: 'current',
        res_id: false,
      });
   }
}
registry.category("views").add("button_in_tree", {
   ...listView,
   Controller: SaleListController,
   buttonTemplate: "button_sale.ListView.Buttons",
});