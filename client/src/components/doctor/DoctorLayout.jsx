import { Outlet } from 'react-router-dom';
import { SiteProvider } from '../../context/SiteContext';

/**
 * Layout for doctor routes: no header, no footer — only the page content.
 */
const DoctorLayout = () => (
  <SiteProvider>
    <Outlet />
  </SiteProvider>
);

export default DoctorLayout;
