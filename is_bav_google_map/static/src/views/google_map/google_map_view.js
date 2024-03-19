/** @odoo-module **/

import { registry } from '@web/core/registry';
import { googleMapView } from '@web_view_google_map/views/google_map/google_map_view';
import { GoogleMapRendererBacsAvatar } from './google_map_renderer';
import { GoogleMapBacsAvatarArchParser } from './google_map_arch_parser';

export const googleMapBacsAvatarView = {
    ...googleMapView,
    ArchParser: GoogleMapBacsAvatarArchParser,
    Renderer: GoogleMapRendererBacsAvatar,
};

registry.category('views').add('google_map_bav_avatar', googleMapBacsAvatarView);
