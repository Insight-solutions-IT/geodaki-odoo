/** @odoo-module **/

import { GoogleMapSidebar } from '@web_view_google_map/views/google_map/google_map_sidebar';

export class GoogleMapSidebarBacsAvatar extends GoogleMapSidebar {
    getData(record) {
        const avatarUrl = `/web/image/${record.resModel}/${record.resId}/${this.props.fieldAvatar}`;
        return Object.assign({ avatarUrl }, super.getData(record));
    }
}

GoogleMapSidebarBacsAvatar.template = 'is_bav_google_map.GoogleMapSidebarAvatar';
GoogleMapSidebarBacsAvatar.props = [...GoogleMapSidebar.props, 'fieldAvatar'];