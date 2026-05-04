import { startStimulusApp } from '@symfony/stimulus-bundle';
import DropdownMenuController from './controllers/dropdown_menu_controller.js';
import AnnouncementSearchController from './controllers/announcement_search_controller.js';

const app = startStimulusApp();
app.register('dropdown-menu', DropdownMenuController);
app.register('announcement-search', AnnouncementSearchController);
