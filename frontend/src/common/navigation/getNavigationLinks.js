import {
  publicNavList,
  orgNavList,
  adminLockedNavList,
  adminNavList,
} from "../constants/linkDefaults";

export function getNavigationLinks({ isAdmin, hasActiveOrg, hasAdminToken }) {
  if (isAdmin) {
    return hasAdminToken ? adminNavList : adminLockedNavList;
  }

  return hasActiveOrg ? orgNavList : publicNavList;
}