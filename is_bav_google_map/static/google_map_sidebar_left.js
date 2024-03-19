/** @odoo-module **/
 
import { GoogleMapSidebarLeft } from '@web_view_google_map/views/google_map/google_map_sidebarLeft';

export class GoogleMapSidebarLeftBacsAvatar extends GoogleMapSidebarLeft {
    getData(record) {
        const avatarUrl = `/web/image/${record.resModel}/${record.resId}/${this.props.fieldAvatar}`;
        return Object.assign({ avatarUrl }, super.getData(record));
    }
}

GoogleMapSidebarLeftBacsAvatar.template = 'web_view_google_map.GoogleMapSidebar2';
// GoogleMapSidebarLeftBacsAvatar