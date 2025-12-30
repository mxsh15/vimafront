"use server";

import { addVendorMember, updateVendorMember, removeVendorMember } from "./api";
import type { AddVendorMemberDto, UpdateVendorMemberDto } from "./types";

export async function addVendorMemberAction(
  vendorId: string,
  dto: AddVendorMemberDto
) {
  return addVendorMember(vendorId, dto);
}

export async function updateVendorMemberAction(
  vendorId: string,
  memberId: string,
  dto: UpdateVendorMemberDto
) {
  return updateVendorMember(vendorId, memberId, dto);
}

export async function removeVendorMemberAction(
  vendorId: string,
  memberId: string
) {
  return removeVendorMember(vendorId, memberId);
}
