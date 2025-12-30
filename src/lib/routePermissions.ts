export type RoutePermissionConfig = {
  view?: string;
  create?: string;
  update?: string;
  delete?: string;
  trash?: string;
  restore?: string;
  hardDelete?: string;
  approve?: string;
  reject?: string;
  answer?: string;
  verifyAnswer?: string;
  deleteAnswer?: string;
};

export const routePermissions: Record<string, RoutePermissionConfig> = {
  "/admin": {},
  "/admin/media": {
    view: "media.view",
    create: "media.create",
    update: "media.update",
    delete: "media.delete",
  },
  "/admin/users": {
    view: "users.view",
    create: "users.create",
    update: "users.update",
    delete: "users.delete",
    trash: "users.trash.view",
    restore: "users.restore",
    hardDelete: "users.hardDelete",
  },
  "/admin/roles": {
    view: "roles.view",
    create: "roles.create",
    update: "roles.update",
    delete: "roles.delete",
    trash: "roles.trash.view",
    restore: "roles.restore",
    hardDelete: "roles.hardDelete",
  },
  "/admin/permissions": {
    view: "permissions.view",
    create: "permissions.create",
    update: "permissions.update",
    delete: "permissions.delete",
    trash: "permissions.trash.view",
    restore: "permissions.restore",
    hardDelete: "permissions.hardDelete",
  },
  "/admin/vendors": {
    view: "vendors.view",
    create: "vendors.create",
    update: "vendors.update",
    delete: "vendors.delete",
    trash: "vendors.trash.view",
    restore: "vendors.restore",
    hardDelete: "vendors.hardDelete",
  },
  "/admin/brands": {
    view: "brands.view",
    create: "brands.create",
    update: "brands.update",
    delete: "brands.delete",
    trash: "brands.trash.view",
    restore: "brands.restore",
    hardDelete: "brands.hardDelete",
  },
  "/admin/categories": {
    view: "categories.view",
    create: "categories.create",
    update: "categories.update",
    delete: "categories.delete",
    trash: "categories.trash.view",
    restore: "categories.restore",
    hardDelete: "categories.hardDelete",
  },
  "/admin/spec-attributes": {
    view: "specAttributes.view",
    create: "specAttributes.create",
    update: "specAttributes.update",
    delete: "specAttributes.delete",
    restore: "specAttributes.restore",
    hardDelete: "specAttributes.hardDelete",
    trash: "specAttributes.trash.view",
  },
  "/admin/spec-groups": {
    view: "specGroups.view",
    create: "specGroups.create",
    update: "specGroups.update",
    delete: "specGroups.delete",
    restore: "specGroups.restore",
    hardDelete: "specGroups.hardDelete",
  },
  "/admin/tags": {
    view: "tags.view",
    create: "tags.create",
    update: "tags.update",
    delete: "tags.delete",
    trash: "tags.trash.view",
    restore: "tags.restore",
    hardDelete: "tags.hardDelete",
  },
  "/admin/products": {
    view: "products.view",
    create: "products.create",
    update: "products.update",
    delete: "products.delete",
    trash: "products.trash.view",
    restore: "products.restore",
    hardDelete: "products.hardDelete",
  },
  "/admin/reviews": {
    view: "reviews.view",
    create: "reviews.create",
    approve: "reviews.approve",
    reject: "reviews.reject",
    delete: "reviews.delete",
  },
  "/admin/wishlists": { view: "wishlists.view" },
  "/admin/wishlists/[id]": { view: "wishlists.view" },
  "/admin/wishlists/trash": { view: "wishlists.trash.view" },

  "/admin/product-questions": {
    view: "product-questions.view",
    create: "product-questions.create",
    answer: "product-questions.answer",
    verifyAnswer: "product-questions.verify-answer",
    delete: "product-questions.delete",
    deleteAnswer: "product-questions.delete-answer",
  },
  "/admin/product-questions/[id]": { view: "product-questions.view" },

  "/admin/blog-posts": {
    view: "blog-posts.view",
    create: "blog-posts.create",
    update: "blog-posts.update",
    delete: "blog-posts.delete",
    trash: "blog-posts.trash.view",
    restore: "blog-posts.restore",
    hardDelete: "blog-posts.hardDelete",
  },
  "/admin/blog-categories": {
    view: "blog-categories.view",
    create: "blog-categories.create",
    update: "blog-categories.update",
    delete: "blog-categories.delete",
    trash: "blog-categories.trash.view",
    restore: "blog-categories.restore",
    hardDelete: "blog-categories.hardDelete",
  },
  "/admin/blog-tags": {
    view: "blog-tags.view",
    create: "blog-tags.create",
    update: "blog-tags.update",
    delete: "blog-tags.delete",
    trash: "blog-tags.trash.view",
    restore: "blog-tags.restore",
    hardDelete: "blog-tags.hardDelete",
  },
  "/admin/carts": {
    view: "carts.view",
    delete: "carts.delete",
    trash: "carts.trash.view",
    restore: "carts.restore",
    hardDelete: "carts.hardDelete",
  },
  "/admin/shipping-addresses": {
    view: "shippingAddresses.view",
  },
  "/admin/shipping-addresses/abandoned": {
    view: "shippingAddresses.view",
  },
  "/admin/shipping-addresses/trash": {
    view: "shippingAddresses.trash.view",
  },
  "/admin/returns": { view: "returns.view" },
  "/admin/returns/abandoned": { view: "returns.view" },
  "/admin/returns/trash": { view: "returns.trash.view" },
  "/admin/returns/[id]": { view: "returns.view" },
  "/admin/vendor-finance/wallets": { view: "vendorFinance.wallets.view" },
  "/admin/vendor-finance/wallets/[vendorId]": {
    view: "vendorFinance.wallets.view",
  },
  "/admin/vendor-finance/transactions": {
    view: "vendorFinance.transactions.view",
  },
  "/admin/vendor-finance/payouts": { view: "vendorFinance.payouts.view" },
  "/admin/vendor-finance/payouts/abandoned": {
    view: "vendorFinance.payouts.view",
  },
  "/admin/vendor-finance/payouts/trash": {
    view: "vendorFinance.payouts.trash.view",
  },
  "/admin/vendor-finance/payouts/[id]": { view: "vendorFinance.payouts.view" },
  "/admin/vendor-offers": { view: "vendorOffers.view" },
  "/admin/vendor-offers/trash": { view: "vendorOffers.trash.view" },
  "/admin/vendor-offers/price-discrepancies": {
    view: "vendorOffers.analytics",
  },
  "/admin/reports": { view: "reports.view" },
  "/admin/audit-logs": { view: "auditLogs.view" },
  "/admin/audit-logs/[id]": { view: "auditLogs.view" },
  "/admin/notifications": {
    view: "notifications.view",
    create: "notifications.send",
    update: "notifications.update",
    delete: "notifications.delete",
  },
};

export function getRouteViewPermission(route: string): string | undefined {
  if (routePermissions[route]) {
    return routePermissions[route].view;
  }

  const matchingRoute = Object.keys(routePermissions).find((key) =>
    route.startsWith(key)
  );

  if (matchingRoute) {
    return routePermissions[matchingRoute].view;
  }

  return undefined;
}

export function getRoutePermissions(
  route: string
): RoutePermissionConfig | undefined {
  if (routePermissions[route]) {
    return routePermissions[route];
  }

  const matchingRoute = Object.keys(routePermissions).find((key) =>
    route.startsWith(key)
  );

  if (matchingRoute) {
    return routePermissions[matchingRoute];
  }

  return undefined;
}

export function routeRequiresPermission(route: string): boolean {
  const config = getRoutePermissions(route);
  return config?.view !== undefined;
}
