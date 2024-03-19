/** @odoo-module **/

import { ConfirmationDialog } from "@web/core/confirmation_dialog/confirmation_dialog";
import { registry } from "@web/core/registry";
import { FormController } from "@web/views/form/form_controller";
import { formView } from "@web/views/form/form_view";

export class BavFormController extends FormController {
    /**
     * @override
     **/
    getActionMenuItems() {
        const menuItems = super.getActionMenuItems();
        const archiveAction = menuItems.other.find((item) => item.key === "archive");
        if (archiveAction) {
            archiveAction.callback = () => {
                const dialogProps = {
                    body: this.env._t(
                        "Chaque service sur ce EPC sera considéré comme archivé. Êtes-vous sûr de vouloir archiver cet enregistrement?"
                    ),
                    confirm: () => this.model.root.archive(),
                    cancel: () => {},
                };
                this.dialogService.add(ConfirmationDialog, dialogProps);
            };
        }
        return menuItems;
    }
}

export const BavFormView = {
    ...formView,
    Controller: BavFormController,
};

registry.category("views").add("Bav_form", BavFormView);
